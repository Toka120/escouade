@echo off
rem Retire les raccourcis Escouade crees par "Creer les raccourcis Escouade.cmd".
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Raccourcis-Escouade.ps1" -Retirer
pause
