<p align="center">
	<img src="https://raw.github.com/dcodeIO/RustWeb/master/rustweb.png" alt="RustWeb" />
</p>

**RustWeb** extends any Rust experimental server with a lightweight webserver running on your server's ip and port, which provides a lot of useful information about your server and allows players to locate themselves on the map. Additionally, it comes with the utility required to generate a top-down 2D image of your server's map.

[![Donate](https://raw.githubusercontent.com/dcodeIO/RustWeb/master/donate.png)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=dcode%40dcode.io&item_name=RustWeb)

Usage with your favorite modding framework
------------------------------------------
The plugin is not limited to a specific modding framework by design. Instead, it uses a tiny bit of glue to load it into the modding framework of your choice.

Currently available glue with setup instructions:

* [RustWeb glue for Oxide 2](Oxide.Ext.RustWeb)

See also: [Frequently asked questions](https://github.com/dcodeIO/RustWeb/blob/master/FAQ.md)

Web API
-------
The webserver serves a set of JSON-formatted data files on your server's ip address and port, e.g. "http://SERVERIP:SERVERPORT/".

* **/status.json**
contains general information about your server, like its hostname and the maximum number of players.

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

Configuration
-------------
To change configuration parameters, edit the file "config.json" inside of the "www" directory.

* **displayMonuments**
specifies whether to display monuments to all players, making */monuments.json* public.

* **displayBuildings**
specifies whether to display buildings to all players, making */buildings.json* public.

* **welcomeMessage**
specifies the welcome message displayed in game. Allows placeholders for `{IP}`, `{PORT}` and `{NAME]`. May be set to `null` to disable.

* **broadcastDeaths**
specifies whether to broadcast death events also in game.

RCON API
--------
The plugin also provides a set of RCON commands for map generation:

* **map.export RESOLUTION**
generates a 2D top-down image of your map using the specified RESOLUTION (height and width of the output image). RESOLUTION is an integer up to a maximum value of `4000`. Example: `map.export 1000`

* **map.monuments**
returns a list of all monuments on the map.

Custom web content
------------------
The webserver serves files straight from its "www" directory which developers may use to add custom content to their server.

![Screenshot](https://raw.github.com/dcodeIO/RustWeb/master/screenshot.jpg)

Translations
------------
The web site allows you to add translations for your native language. Translation files are located inside of the "www" directory at "www/i18n/LANGUAGECODE.json", with "LANGUAGECODE" being the language's ISO 639-1 language code.

To translate, open up the file "[www/i18n/de.json](https://github.com/dcodeIO/RustWeb/blob/master/www/i18n/de.json)", which is the german translation that I'll always keep up to date, and edit the right hand side of the translations while leaving a) the left hand side untouched and b) keeping all the placeholders (do not translate them). Afterwards, save your new translation as "www/i18n/LANGUAGECODE.json" (see above). After about 60 seconds, it will become available on the web page.

I'd also be glad if you'd contribute your translations to this repository. To do so, please send a pull request or, if you don't know how to do this, [simply create an issue](https://github.com/dcodeIO/RustWeb/issues) and paste the contents of your translation file. Thank you!

License
-------
All rights reserved.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

RustWeb is not affiliated with, nor endorsed by Facepunch Studios LTD. All trademarks belong to their respective owners.
