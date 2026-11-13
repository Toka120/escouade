"""Copy the reviewed build, sources and pictures into the user-selected folder.

This never deletes or copies over .tmp (the player's existing WebView profile).
Existing executable/resources files receive a dated backup before replacement.
"""
import argparse,base64,datetime,hashlib,json,pathlib,re,shutil

ROOT=pathlib.Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser()
parser.add_argument('--destination',type=pathlib.Path,required=True)
parser.add_argument('--images',type=pathlib.Path,required=True)
parser.add_argument('--version',default='1.4.1')
args=parser.parse_args()
if not re.fullmatch(r'\d+\.\d+\.\d+',args.version):raise SystemExit('Invalid version')
dest=args.destination.resolve()
if dest != pathlib.Path(r'C:\Users\jigsa\OneDrive\Bureau\Tests Escouade').resolve():
    raise SystemExit('Unexpected delivery directory; inspect and explicitly update this guard first.')
dist=ROOT/'dist'/('Escouade-'+args.version)
if not (dist/'resources.neu').is_file(): raise SystemExit('Build the release first.')
dest.mkdir(parents=True,exist_ok=True)
archive=dest/'Archives'/('Avant-'+args.version+'-'+datetime.datetime.now().strftime('%Y%m%d-%H%M%S'))
runtime_names=['Escouade.exe','resources.neu','Organisateur Escouade.exe','Capture Escouade.exe']
# Fail before changing anything if a different executable is still mapped by Windows.
for name in runtime_names:
    target=dest/name
    if target.exists() and target.read_bytes()!=(dist/name).read_bytes():
        try:
            with target.open('r+b'):pass
        except PermissionError:
            raise SystemExit('Fichier encore utilisé : '+str(target)+'. Fermer l’outil concerné avant livraison ; aucun fichier remplacé.')
for name in runtime_names:
    if (dest/name).exists():
        archive.mkdir(parents=True,exist_ok=True)
        shutil.copy2(dest/name,archive/name)
    if not (dest/name).exists() or hashlib.sha256((dest/name).read_bytes()).digest()!=hashlib.sha256((dist/name).read_bytes()).digest():
        shutil.copy2(dist/name,dest/name)
package='Escouade-'+args.version+'-Windows.zip'
shutil.copy2(ROOT/'dist'/package,dest/package)
shutil.copy2(ROOT/'dist/SHA256SUMS.json',dest/'SHA256SUMS.json')
visual=dest/'Visuels'
mockups=visual/'Maquettes';mockups.mkdir(parents=True,exist_ok=True)
names={
 'exec-66bbb267-77ad-4f1d-8240-b52839db70fa.png':'01-parametres-bleu-nuit-or.png',
 'exec-bdf0f675-61cf-4dc1-bad8-11b9a5a506c7.png':'02-grimoire.png',
 'exec-9c932e9f-eb84-496b-a825-250a48d32174.png':'03-quartier-general.png',
 'exec-a2a0afef-fd0e-44c2-995f-5162f92a7df3.png':'04-carte-aventure.png',
 'exec-dbbf106a-044b-4280-a29a-5627ef33983b.png':'05-emeraude-sobre.png'}
for source,name in names.items(): shutil.copy2(args.images/source,mockups/name)
shutil.copytree(ROOT/'test-results/captures',visual/'Captures',dirs_exist_ok=True)
assets=visual/'Elements-interface';assets.mkdir(parents=True,exist_ok=True)
source=(ROOT/'src/escouade.html').read_text(encoding='utf-8')
for kind,data in re.findall(r'data:image/(jpeg|png);base64,([A-Za-z0-9+/=]+)',source):
    (assets/('banniere.jpg' if kind=='jpeg' else 'blason.png')).write_bytes(base64.b64decode(data))
shutil.copy2(ROOT/'src/icon.png',assets/'icone-fenetre.png')
def copy_changed(source,target):
    # Git objects are immutable and can already be read-only in a prior delivery.
    if pathlib.Path(target).is_file() and pathlib.Path(source).read_bytes()==pathlib.Path(target).read_bytes():
        return target
    return shutil.copy2(source,target)
shutil.copytree(ROOT,dest/'Sources Escouade',dirs_exist_ok=True,copy_function=copy_changed,ignore=shutil.ignore_patterns('dist','validation*','review-*','test-results','node_modules','__pycache__','.tmp','Captures de scan','Releves Xolmora'))
shutil.copytree(ROOT/'distribution',dest/'Publication future',dirs_exist_ok=True)
notes='PATCHNOTES-'+args.version+'.md'
shutil.copy2(ROOT/'docs'/notes,dest/notes)
shutil.copy2(ROOT/'docs/DEMARRER.txt',dest/'LIRE-MOI.txt')
shutil.copy2(ROOT/'test-results/smoke.json',dest/'resultats-tests.json')
if (ROOT/'test-results/services.json').exists():shutil.copy2(ROOT/'test-results/services.json',dest/'resultats-services.json')
shutil.copy2(ROOT/'docs/FONCTIONNALITES-DOFUSGUIDE.md',dest/'FONCTIONNALITES-DOFUSGUIDE.md')
shutil.copy2(ROOT/'docs/UTILISER-LES-WIDGETS.md',dest/'UTILISER-LES-WIDGETS.md')
for name in ['PATCHNOTES-1.4.1-Claude.md','POSITIONS-REVISEES.md']:
    shutil.copy2(ROOT/'docs'/name,dest/name)
shutil.copy2(ROOT/'AGENTS.md',dest/'AGENTS.md')
shutil.copy2(ROOT/'docs/UTILISER-LE-SCAN.md',dest/'UTILISER-LE-SCAN.md')
shutil.copy2(ROOT/'test-results/scan.json',dest/'resultats-scan.json')
print(json.dumps({'destination':str(dest),'png':len(list(visual.rglob('*.png'))),'backup':str(archive),'resources_sha256':hashlib.sha256((dest/'resources.neu').read_bytes()).hexdigest()},ensure_ascii=False))
