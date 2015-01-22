using Oxide.Core.Plugins;
using System.Collections.Generic;

namespace Oxide.Rust.Plugins
{
    /// <summary>
    /// Responsible for loading rustweb specific plugins
    /// </summary>
    public class RustWebPluginLoader : PluginLoader
    {
        public RustWebPluginLoader() {
        }

        /// <summary>
        /// Returns all plugins in the specified directory by plugin name
        /// </summary>
        /// <param name="directory"></param>
        /// <returns></returns>
        public override IEnumerable<string> ScanDirectory(string directory) {
            return new string[] { "rustweb" };
        }

        /// <summary>
        /// Loads a plugin using this loader
        /// </summary>
        /// <param name="directory"></param>
        /// <param name="name"></param>
        /// <returns></returns>
        public override Plugin Load(string directory, string name) {
            // Switch on the plugin name
            switch (name) {
                case "rustweb":
                    return new RustWebPlugin();
                default:
                    return null;
            }
        }
    }
}
