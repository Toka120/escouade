@echo off
rem Cree les raccourcis Escouade (Bureau + menu Demarrer). Aucune donnee n est modifiee.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Raccourcis-Escouade.ps1"
pause
