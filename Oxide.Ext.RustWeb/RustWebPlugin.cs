using dcodeIO.RustWeb;
using Newtonsoft.Json.Linq;
using Oxide.Core;
using Oxide.Core.Logging;
using Oxide.Core.Plugins;
using Oxide.Rust.Libraries;
using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;

namespace Oxide.Rust.Plugins
{
    public class RustWebPlugin : CSPlugin
    {
        private static Logger logger = Interface.GetMod().RootLogger;
        private static VersionNumber MinOxideVersion = new VersionNumber(2, 0, 200);
        internal static string RootDir;
        internal static string DataDir;

        private RustWeb rustWeb = null;
        private string oxideDataDir;
        private bool serverInitialized = false;

        public RustWebPlugin() {
            Name = "rustweb";
            Title = "RustWeb Core";
            Author = "dcode";
            Version = new VersionNumber(1, 1, 0);
            HasConfig = false;
        }

        protected override void LoadDefaultConfig() {
            throw new NotImplementedException();
        }

        [HookMethod("Init")]
        private void Init() {
            if (Oxide.Core.OxideMod.Version < MinOxideVersion) {
                logger.Write(LogType.Error, "This version of RustWeb requires at least Oxide " + MinOxideVersion + " but this server is running Oxide " + Oxide.Core.OxideMod.Version + ".");
                return;
            }
            logger.Write(LogType.Info, "Initializing");

            oxideDataDir = Interface.GetMod().DataDirectory;
            RootDir = Path.GetFullPath(Path.Combine(oxideDataDir, Path.Combine("..", "www")));
            DataDir = Path.GetFullPath(Path.Combine(oxideDataDir, "rustweb"));

            Command cmdlib = Interface.GetMod().GetLibrary<Command>("Command");
            cmdlib.AddConsoleCommand("map.export"      , this, "cmdExport");
            cmdlib.AddConsoleCommand("map.monuments"   , this, "cmdMonuments");
            cmdlib.AddConsoleCommand("map.dumpobjects" , this, "cmdDumpObjects");
            cmdlib.AddConsoleCommand("web.reloadconfig", this, "cmdReloadConfig");
        }

        [HookMethod("OnUnload")]
        private void OnUnload() {
            logger.Write(LogType.Warning, "Reloading RustWeb has no effect. To update it, a server restart is inevitable.");
        }

        [HookMethod("OnServerInitialized")]
        private void OnServerInitialized() {
            if (serverInitialized)
                return;
            serverInitialized = true;

            if (RustWeb.Instance == null) {
                logger.Write(LogType.Info, "Starting RustWeb " + RustWeb.Version.ToString(3) + ", serving from '" + RootDir + "' ...");
                rustWeb = new RustWeb(RootDir, DataDir);
                rustWeb.OnError += (sender, e) => {
                    logger.WriteException("RustWeb error: " + e.Message, e.Exception);
                };
                rustWeb.Start();
            } else {
                logger.Write(LogType.Warning, "Reloading RustWeb has no effect. To update it, a server restart is inevitable.");
                rustWeb = RustWeb.Instance;
            }
        }

        [HookMethod("OnTick")]
        private void OnTick() {
            if (rustWeb != null)
                rustWeb.Tick();
        }

        [HookMethod("OnPlayerConnected")]
        private void OnPlayerConnected(Network.Message packet) {
            if (rustWeb != null)
                rustWeb.OnPlayerConnected(packet);
        }

        [HookMethod("OnPlayerSpawn")]
        private void OnPlayerSpawn(BasePlayer player) {
            if (rustWeb != null)
                rustWeb.OnPlayerSpawn(player);
        }

        [HookMethod("OnPlayerDisconnected")]
        private void OnPlayerDisconnected(BasePlayer player) {
            if (rustWeb != null)
                rustWeb.OnPlayerDisconnected(player);
        }

        [HookMethod("OnPlayerChat")]
        private void OnPlayerChat(chat.Arg arg) {
            if (rustWeb != null)
                rustWeb.OnPlayerChat(arg);
        }

        [HookMethod("OnEntityDeath")]
        private void OnEntityDeath(UnityEngine.MonoBehaviour entity, HitInfo hitinfo) {
            if (rustWeb != null)
                rustWeb.OnEntityDeath(entity, hitinfo);
        }

        [HookMethod("BuildServerTags")]
        private void BuildServerTags(IList<string> taglist) {
            taglist.Add("rustweb");
        }

        [HookMethod("cmdExport")]
        private void cmdExport(ConsoleSystem.Arg arg) {
            if (arg.connection != null)
                return; // Allow this only from (real) console as the server will most likely hang
            RconUtil.MapExport(arg, oxideDataDir);
        }

        [HookMethod("cmdMonuments")]
        private void cmdMonuments(ConsoleSystem.Arg arg) {
            if (arg.connection != null)
                return; // Allow this only from (real) console as the server will most likely hang
            RconUtil.MapMonuments(arg);
        }

        [HookMethod("cmdDumpObjects")]
        private void cmdDumpObjects(ConsoleSystem.Arg arg) {
            if (arg.connection != null)
                return; // Allow this only from (real) console as the server will most likely hang
            RconUtil.MapDumpGameObjects(arg);
        }

        [HookMethod("cmdReloadConfig")]
        private void cmdReloadConfig(ConsoleSystem.Arg arg) {
            if (arg.connection != null)
                return;
            RconUtil.WebReloadConfig(arg);
        }
    }
}
