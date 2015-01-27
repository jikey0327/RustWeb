@echo off

reg.exe query "HKLM\SOFTWARE\Microsoft\MSBuild\ToolsVersions\4.0" /v MSBuildToolsPath > nul 2>&1
if ERRORLEVEL 1 goto MissingMSBuildRegistry

for /f "skip=2 tokens=2,*" %%A in ('reg.exe query "HKLM\SOFTWARE\Microsoft\MSBuild\ToolsVersions\4.0" /v MSBuildToolsPath') do SET MSBUILDDIR=%%B

IF NOT EXIST %MSBUILDDIR%nul goto MissingMSBuildToolsPath
IF NOT EXIST %MSBUILDDIR%msbuild.exe goto MissingMSBuildExe

"%MSBUILDDIR%msbuild.exe" dcodeIO.RustWeb.sln /p:Configuration=Release

mkdir build\RustDedicated_Data\Managed
::Tools\ILMerge^
 /lib:Dependencies^
 /target:library^
 /out:bin\Release\dcodeIO.RustWeb-bundle.dll^
 bin\Release\dcodeIO.RustWeb.dll^
 bin\Release\Community.CsharpSqlite.dll^
 bin\Release\Community.CsharpSqlite.SQLiteClient.dll
copy bin\Release\dcodeIO.RustWeb.dll build\RustDedicated_Data\Managed\
copy Oxide.Ext.RustWeb\bin\Release\Oxide.Ext.RustWeb.dll build\RustDedicated_Data\Managed\

mkdir build\server\www
xcopy /S /I /Y www build\server\www
copy README.md build\README.md
copy Oxide.Ext.RustWeb\README.md build\README-OXIDE2.md

goto:eof
::ERRORS
::---------------------
:MissingMSBuildRegistry
echo Cannot obtain path to MSBuild tools from registry
goto:eof
:MissingMSBuildToolsPath
echo The MSBuild tools path from the registry '%MSBUILDDIR%' does not exist
goto:eof
:MissingMSBuildExe
echo The MSBuild executable could not be found at '%MSBUILDDIR%'
goto:eof