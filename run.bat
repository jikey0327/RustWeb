@echo off

:: Configuration
set ServerDir=D:\Spiele\SteamCMD\steamapps\common\rust_dedicated

:: Install most recent build
copy^
 bin\Release\dcodeIO.RustWeb.dll^
 %ServerDir%\RustDedicated_Data\Managed\dcodeIO.RustWeb.dll
copy^
 Oxide.Ext.RustWeb\bin\Release\Oxide.Ext.RustWeb.dll^
 %ServerDir%\RustDedicated_Data\Managed\Oxide.Ext.RustWeb.dll
xcopy /S /I /Y^
 www^
 %ServerDir%\server\www

:: Run the server
start /D %ServerDir% /wait RustDedicated.exe -batchmode^
 +server.hostname "RustWeb Testserver"^
 +server.ip "127.0.0.1"^
 +server.port 28015^
 +rcon.password test^
 +server.worldsize 4000^
 +server.seed 1337

