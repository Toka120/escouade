# Escouade - cree ou retire les raccourcis Bureau et menu Demarrer (recherche Windows).
# Usage : Raccourcis-Escouade.ps1            -> cree les raccourcis
#         Raccourcis-Escouade.ps1 -Retirer   -> retire les raccourcis crees par ce script
param([switch]$Retirer)
$ErrorActionPreference = 'Stop'
$dir = Split-Path -Parent $MyInvocation.MyCommand.Path
$exe = Join-Path $dir 'Escouade.exe'
$ico = Join-Path $dir 'Escouade.ico'
$liens = @(
  (Join-Path ([Environment]::GetFolderPath('Desktop')) 'Escouade.lnk'),
  (Join-Path ([Environment]::GetFolderPath('Programs')) 'Escouade.lnk')
)
if ($Retirer) {
  foreach ($l in $liens) { if (Test-Path -LiteralPath $l) { Remove-Item -LiteralPath $l; Write-Host "Retire : $l" } }
  exit 0
}
if (-not (Test-Path -LiteralPath $exe)) { Write-Host "Escouade.exe introuvable a cote de ce script : $dir"; exit 1 }
if (-not (Test-Path -LiteralPath (Join-Path $dir 'resources.neu'))) { Write-Host "resources.neu introuvable : garder les fichiers d'Escouade ensemble."; exit 1 }
$shell = New-Object -ComObject WScript.Shell
foreach ($l in $liens) {
  $s = $shell.CreateShortcut($l)
  $s.TargetPath = $exe
  # Indispensable : Escouade doit demarrer dans son dossier pour retrouver resources.neu et le profil .tmp (sauvegardes).
  $s.WorkingDirectory = $dir
  if (Test-Path -LiteralPath $ico) { $s.IconLocation = "$ico,0" } else { $s.IconLocation = "$exe,0" }
  $s.Description = 'Escouade - suivi de team Dofus'
  $s.Save()
  Write-Host "Cree : $l"
}
Write-Host ''
Write-Host 'Escouade est maintenant sur le Bureau et dans le menu Demarrer (tape "Escouade" dans la recherche).'
