@echo off

:: Configuration
set SteamDir=D:\Spiele\SteamCMD
set ServerDir=%SteamDir%\steamapps\common\rust_dedicated
set OxideDir=%SteamDir%\Oxide-2
set OxidePatcherDir=%SteamDir%\Oxide-2-Patcher

:: Hard-update game server
call %SteamDir%\SteamCmd.exe "+runscript %CD%\update.txt"

:: Set up game server files for patching
copy /Y %ServerDir%\RustDedicated_Data\Managed\Assembly-CSharp.dll %ServerDir%\RustDedicated_Data\Managed\Assembly-CSharp_Original.dll
copy /Y %ServerDir%\RustDedicated_Data\Managed\Facepunch.dll %ServerDir%\RustDedicated_Data\Managed\Facepunch_Original.dll

:: Install Oxide
del %OxideDir%\RustDedicated_Data\Managed\Assembly-CSharp.dll
del %OxideDir%\RustDedicated_Data\Managed\Facepunch.dll
xcopy /S /I /Y %OxideDir%\* %ServerDir%\

:: Set up patcher
copy /Y %OxideDir%\RustDedicated_Data\Managed\Oxide.Core.dll %OxidePatcherDir%\Oxide.Core.dll

:: Run patcher
start /D %OxidePatcherDir% /wait OxidePatcher.exe RustExperimental.opj
