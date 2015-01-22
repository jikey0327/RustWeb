<p align="center">
	<img src="https://raw.github.com/dcodeIO/RustWeb/master/rustweb.png" alt="RustWeb" />
</p>

The Web Plugin for Rust
=======================
**RustWeb** extends any Rust experimental server with a lightweight webserver running on your server's ip and port, which provides a lot of useful information about your server and allows players to locate theirselfs on the map. Additionally, it comes with the utility required to generate a top-down 2D map image of your server.

Usage with your favorite modding framework
------------------------------------------
The plugin is not limited to a specific modding framework by design. Instead, it uses a tiny bit of glue to load it into the modding framework of your choice.

Currently available glue with setup instructions:

* [Oxide 2](Oxide.Ext.RustWeb)

Web API
-------
The webserver serves a set of JSON-formatted data files:

* **/status.json**  
  contains general information about your server, like its hostname and the maximum number of players. Includes a list of players if `statusIncludesPlayers=true`.

* **/monuments.json** (requires authentication if `displayMonuments=false`)  
  contains your server's monuments data.

* **/buildings.json** (requires authentication if `displayBuildings=false`)  
  contains a list of all buildings on the map.

* **/players.json** (requires authentication)  
  contains a list of all players currently connected including their locations.

* **/sleepers.json** (requires authentication)  
  contains a list of all sleepers including their locations.

* **/animals.json** (requires authentication)  
  contains a list of all animals including their locations.

* **/resources.json** (requires authentication)  
   contains a list of all resources including their locations.

To authenticate for restricted data files, use username "admin" and your RCON password.

To change configuration parameters, edit the file "config.json" inside of the "www" directory.

RCON API
--------
The plugin also provides a set of RCON commands for map generation:

* **map.export RESOLUTION**
generates a 2D top-down image of your map using the specified RESOLUTION (height and width of the output image). RESOLUTION is an integer up to a maximum value of `4000`. Example: `map.export 1000`

* **map.monuments**
returns a list of all monuments on the map.

* **web.reloadconfig**
reloads the "config.json" file from "www".

Custom web content
------------------
The webserver serves files straight from its "www" directory which developers may use to add custom content to their server.

![Scerenshot](https://raw.github.com/dcodeIO/RustWeb/master/screenshot.jpg)

License
-------
All rights reserved.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

RustWeb is not affiliated with, nor endorsed by Facepunch Studios LTD. All trademarks belong to their respective owners.
