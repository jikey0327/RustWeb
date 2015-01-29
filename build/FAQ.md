RustWeb: Frequently asked questions
===================================

**Why do I only get an all brown image when running 'map.export'?**  
There seems to be a limitation of the maximum output size for resolutions above 4000. Some users have reported that it is slightly lower on their hardware. Try lowering the resolution.

**What do I have to do with 'Oxide.Ext.Map.dll' respectively 'Oxide.Ext.RustMap.dll'?**  
These are older versions of the extension and MUST be deleted in order for recent versions to work. The new file is called 'Oxide.Ext.RustWeb.dll'.

**Where exactly to I have to put the 'www' folder with Oxide?**  
The www folder must be placed next to (not inside of) Oxide's data directory (the directory where generated map images will be saved to). By default (i.e. you didn't edit 'oxide.root.json'), the data directory is at 'server/data', so the www directory goes to 'server/www'.

**Why has [insert random thing] stopped working after installing RustWeb?**  
Most likely, this has nothing to do with RustWeb. Remember, the game is still in alpha and such things happen, even without RustWeb.

**May RustWeb cause a wipe?**  
No, it does not interfere with your server's save in any way.

**How do I display all players' locations?**  
First, you need to be configured as an owner (like when you are able to execute rcon commands from within the game console). Once you are, navigate to your server's IP and PORT and hit "Locate myself through STEAM". Afterwards, you will automatically see all players.

**What are thoses .json files?**  
These are [JavaScript Object Notation](http://en.wikipedia.org/wiki/JSON) formatted data files suitable for processing by your own or third party applications.

**How do I open an .md file?**  
These are [markdown](http://en.wikipedia.org/wiki/Markdown) formatted text files that every simple text editor (like notepad) is able to display.

**Where and how do I report a bug?**  
Use the [dedicated discussion thread](http://forum.rustoxide.com/threads/rustweb.6385/page-15) and provide all relevant information, like log outputs etc.

**May I donate you a pizza or two?**  
That would definitely make me happy. There is a donate button at: http://dcode.io
