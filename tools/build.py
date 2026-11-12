import json, sys, subprocess, shutil, os
# Usage : python3 tools/build.py <version>  (depuis la racine du dépôt, projet Neutralino dans BUILD_DIR)
REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_HTML = os.path.join(REPO, 'src', 'escouade.html')
BUILD_DIR = os.environ.get('BUILD_DIR', '/tmp/build/carnet')
ver = sys.argv[1]; url = sys.argv[2] if len(sys.argv) > 2 else None
os.chdir(BUILD_DIR)
c = json.load(open('neutralino.config.json'))
c['version'] = ver
c['logging'] = {'enabled': False, 'writeToLogFile': False}
c['nativeAllowList'] = ["app.*", "os.open", "window.*", "updater.*", "filesystem.writeBinaryFile"]
c['modes']['window']['title'] = 'Escouade'; c['cli']['binaryName'] = 'Escouade'
json.dump(c, open('neutralino.config.json','w'), indent=2, ensure_ascii=False)
s = open(SRC_HTML).read()
s = s.replace('const APP_VERSION = "1.1.0";', f'const APP_VERSION = "{ver}";')
if url: s = s.replace('https://raw.githubusercontent.com/Toka120/escouade/main/update.json', url)
s = s.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n<script src="/__neutralino_globals.js"></script>\n<script src="/js/neutralino.js"></script>', 1)
open('resources/index.html','w').write(s)
shutil.rmtree('dist', ignore_errors=True)
subprocess.run(['neu','build','--release'], check=True, capture_output=True)
print(sorted(os.listdir('dist/Escouade')))
