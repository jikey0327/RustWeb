using Oxide.Core.Libraries;
using Oxide.Rust.Plugins;

namespace Oxide.Rust.Libraries
{
    public class RustWebLibrary : Library
    {
        public override bool IsGlobal { get { return false; } }

        [LibraryFunction("GetRootDir")]
        public string GetRootDir() {
            return RustWebPlugin.RootDir;
        }
    }
}
