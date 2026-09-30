@echo off
rem KaushalSetu production server (port 3100).
rem The repo lives under a path containing "&", which breaks npm .bin cmd
rem shims - so this script invokes node directly and is launched via
rem   cmd /c start "" scripts\start-server.cmd
rem to fully detach from the calling shell.
cd /d "%~dp0.."
node node_modules\next\dist\bin\next start -p 3100
