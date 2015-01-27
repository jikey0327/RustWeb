using Oxide.Core;
using Oxide.Core.Extensions;
using Oxide.Rust.Plugins;
using Oxide.Rust.Libraries;
using dcodeIO.RustWeb;

namespace Oxide.Rust
{
    public class RustWebExtension : Extension
    {
        public static VersionNumber ExtensionVersion { get { return new VersionNumber((ushort)RustWeb.Version.Major, (ushort)RustWeb.Version.Minor, (ushort)RustWeb.Version.Build); } }

        public override string Name { get { return "RustWeb"; } }
        public override VersionNumber Version { get { return RustWebExtension.ExtensionVersion; } }
        public override string Author { get { return "dcode"; } }

        public RustWebExtension(ExtensionManager manager) : base(manager) {
        }

        public override void Load() {
            Manager.RegisterPluginLoader(new RustWebPluginLoader());
            Manager.RegisterLibrary("RustWeb", new RustWebLibrary());
        }

        public override void LoadPluginWatchers(string s) {
        }

        public override void OnModLoad() {
        }
    }
}
