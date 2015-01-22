using dcodeIO.RustWeb;
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

        private RustWeb rustWeb = null;
        private string dataDir;
        internal static string RootDir;
        private bool serverInitialized = false;

        public RustWebPlugin() {
            Name = "rustweb";
            Title = "Rust Web";
            Author = "dcode";
            Version = RustWebExtension.ExtensionVersion;
            HasConfig = false;
        }

        protected override void LoadDefaultConfig() {
            throw new NotImplementedException();
        }

        [HookMethod("Init")]
        private void Init() {
            logger.Write(LogType.Info, "Initializing");

            FieldInfo fld = typeof(OxideMod).GetField("datadir", BindingFlags.NonPublic | BindingFlags.Instance | BindingFlags.GetField);
            dataDir = (string)fld.GetValue(Interface.GetMod());
            RootDir = Path.GetFullPath(Path.Combine(dataDir, ".."+Path.DirectorySeparatorChar+"www"));

            Command cmdlib = Interface.GetMod().GetLibrary<Command>("Command");
            cmdlib.AddConsoleCommand("map.export", this, "cmdExport");
            cmdlib.AddConsoleCommand("map.monuments", this, "cmdMonuments");
            cmdlib.AddConsoleCommand("map.dumpobjects", this, "cmdDumpObjects");
            cmdlib.AddConsoleCommand("web.reloadconfig", this, "cmdReloadConfig");
        }

        [HookMethod("OnServerInitialized")]
        private void OnServerInitialized() {
            if (serverInitialized)
                return;
            serverInitialized = true;

            logger.Write(LogType.Info, "Starting RustWeb "+RustWeb.Version.ToString(3)+", serving from '" + RootDir + "' ...");
            rustWeb = new RustWeb(RootDir);
            rustWeb.OnError += (sender, e) => {
                logger.WriteException("RustWeb error", e.Exception);
            };
            rustWeb.Start();
        }

        [HookMethod("OnTick")]
        private void OnTick() {
            if (!serverInitialized)
                return;
            rustWeb.Tick();
        }

        [HookMethod("OnPlayerChat")]
        private void OnPlayerChat(chat.Arg arg) {
            rustWeb.OnChat(arg);
        }

        [HookMethod("OnEntityDeath")]
        private void OnEntityDeath(UnityEngine.MonoBehaviour entity, HitInfo hitinfo) {
            rustWeb.OnDeath(entity, hitinfo);
        }

        [HookMethod("BuildServerTags")]
        private void BuildServerTags(IList<string> taglist) {
            taglist.Add("rustweb");
        }

        [HookMethod("cmdExport")]
        private void cmdExport(ConsoleSystem.Arg arg) {
            if (arg.connection != null)
                return; // Allow this only from (real) console as the server will most likely hang

            RconUtil.MapExport(arg, dataDir);
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
