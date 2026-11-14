"""Build a portable Windows bundle using an existing Neutralino 6.4.0 runtime.

python tools/build.py 1.2.1 --runtime PATH_TO_ESCOUADE --out dist
The runtime directory contains Escouade.exe and resources.neu.
No downloads, external build tools or installation changes are required.
"""
import argparse
import hashlib
import json
import pathlib
import re
import shutil
import struct
import zipfile
import subprocess

ROOT = pathlib.Path(__file__).resolve().parents[1]

def read_archive(path):
    blob = path.read_bytes()
    size = struct.unpack_from('<I', blob, 12)[0]
    header = json.loads(blob[16:16+size])
    start = 8 + struct.unpack_from('<I', blob, 4)[0]
    files = {}
    def walk(nodes, prefix=''):
        for name, item in nodes.items():
            key = prefix + name
            if 'files' in item:
                walk(item['files'], key + '/')
            else:
                offset = start + int(item['offset'])
                content = blob[offset:offset+item['size']]
                if 'integrity' in item and hashlib.sha256(content).hexdigest() != item['integrity']['hash']:
                    raise ValueError('Corrupt runtime resource: ' + key)
                files[key] = content
    walk(header['files'])
    return files

def write_archive(files, path):
    header = {'files': {}}
    chunks = []
    offset = 0
    for name in sorted(files):
        content = files[name]
        node = header['files']
        parts = name.split('/')
        for part in parts[:-1]:
            node = node.setdefault(part, {'files': {}})['files']
        digest = hashlib.sha256(content).hexdigest()
        blocks = [hashlib.sha256(content[i:i+4194304]).hexdigest() for i in range(0,len(content),4194304)]
        node[parts[-1]] = {'size':len(content),'offset':str(offset),'integrity':{
            'algorithm':'SHA256','hash':digest,'blockSize':4194304,'blocks':blocks}}
        chunks.append(content)
        offset += len(content)
    data = json.dumps(header, separators=(',',':'), ensure_ascii=False).encode('utf-8')
    padding = b'\0' * (-len(data) % 4)
    pickle_header = struct.pack('<II',4+len(data)+len(padding),len(data)) + data + padding
    path.write_bytes(struct.pack('<II',4,len(pickle_header)) + pickle_header + b''.join(chunks))

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('version')
    parser.add_argument('--runtime',type=pathlib.Path,required=True)
    parser.add_argument('--out',type=pathlib.Path,default=ROOT/'dist')
    parser.add_argument('--test-port',type=int)
    parser.add_argument('--reuse-organizer',action='store_true',help='Reuse the unchanged organizer from the runtime after checking its delivery hash')
    parser.add_argument('--reuse-capture',action='store_true',help='Reuse the unchanged capture tool from the runtime after checking its delivery hash (builds without csc.exe)')
    args = parser.parse_args()
    if not re.fullmatch(r'\d+\.\d+\.\d+',args.version):
        parser.error('Version must have major.minor.patch format')
    resources = read_archive(args.runtime / 'resources.neu')
    config = json.loads((ROOT/'tools/neutralino.config.json').read_text(encoding='utf-8'))
    config['version'] = args.version
    config['nativeAllowList'] = ['app.exit','app.restartProcess','os.open','os.showSaveDialog','os.execCommand','updater.checkForUpdates','updater.install',
        'window.setTitle','window.setSize','window.getSize','window.setAlwaysOnTop','filesystem.writeBinaryFile','filesystem.writeFile','filesystem.readBinaryFile','clipboard.writeText']
    # The 6.4 server already prepends globals to the client library request.
    # A separate globals request consumes the one-time token twice.
    config['modes']['window'].update(injectGlobals=False,injectClientLibrary=False)
    if args.test_port:
        config['port'] = args.test_port
        config['modes']['window']['title'] = 'Escouade — validation ' + args.version
    source = (ROOT/'src/escouade.html').read_text(encoding='utf-8')
    source = re.sub(r'const APP_VERSION = "[^"]+";',f'const APP_VERSION = "{args.version}";',source)
    source = re.sub(r'<script src="(?:/__neutralino_globals\.js|/js/neutralino\.js)"></script>\s*','',source)
    source = source.replace('<meta charset="utf-8">','<meta charset="utf-8">\n<script src="/js/neutralino.js"></script>',1)
    if args.test_port:
        source=source.replace('<meta charset="utf-8">','<meta charset="utf-8"><script>window.ESCOUADE_DIAGNOSTIC=true;</script>',1)
    resources['resources/index.html'] = source.encode('utf-8')
    # A widget uses the same origin/profile as its parent, but injects its own native
    # bridge. Never request the parent's one-time-token client script again.
    resources['resources/widget.html'] = source.replace('<script src="/js/neutralino.js"></script>','').encode('utf-8')
    resources['resources/content.js'] = (ROOT/'src/content.js').read_bytes()
    for name in ['guide.js','scan.js','banque.js','items.js','reference.js','widgets.js','widgets.css']:
        resources['resources/'+name]=(ROOT/'src'/name).read_bytes()
    for file in (ROOT/'src/vendor/ocr').rglob('*'):
        if file.is_file():resources['resources/'+file.relative_to(ROOT/'src').as_posix()]=file.read_bytes()
    resources['neutralino.config.json'] = json.dumps(config,ensure_ascii=False,indent=2).encode('utf-8')
    resources['resources/icon.png'] = (ROOT/'src/icon.png').read_bytes()
    out = args.out.resolve() / ('Escouade-'+args.version)
    out.mkdir(parents=True,exist_ok=True)
    shutil.copy2(args.runtime/'Escouade.exe',out/'Escouade.exe')
    if args.reuse_organizer:
        helper=args.runtime/'Organisateur Escouade.exe'
        expected=json.loads((args.runtime/'SHA256SUMS.json').read_text(encoding='utf-8')).get(helper.name)
        if not expected or hashlib.sha256(helper.read_bytes()).hexdigest()!=expected:raise ValueError('Organizer hash does not match the trusted runtime manifest')
        shutil.copy2(helper,out/helper.name)
    else:
        compiler=pathlib.Path(r'C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe')
        subprocess.run([str(compiler),'/nologo','/target:winexe','/reference:System.Windows.Forms.dll','/reference:System.Drawing.dll','/reference:System.Core.dll','/out:'+str(out/'Organisateur Escouade.exe'),str(ROOT/'tools/Organisateur.cs')],check=True)
    if args.reuse_capture:
        helper=args.runtime/'Capture Escouade.exe'
        expected=json.loads((args.runtime/'SHA256SUMS.json').read_text(encoding='utf-8')).get(helper.name)
        if not expected or hashlib.sha256(helper.read_bytes()).hexdigest()!=expected:raise ValueError('Capture tool hash does not match the trusted runtime manifest')
        shutil.copy2(helper,out/helper.name)
    else:
        compiler=pathlib.Path(r'C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe')
        subprocess.run([str(compiler),'/nologo','/target:winexe','/reference:System.Windows.Forms.dll','/reference:System.Drawing.dll','/reference:System.Core.dll','/out:'+str(out/'Capture Escouade.exe'),str(ROOT/'tools/Capture.cs')],check=True)
    # Shortcut helper (Desktop + Start menu search) and its icon, kept next to the executable.
    for extra in (ROOT/'tools/raccourcis').glob('*'):
        if extra.is_file(): shutil.copy2(extra,out/extra.name)
    write_archive(resources,out/'resources.neu')
    assert read_archive(out/'resources.neu') == resources
    archive = args.out.resolve()/('Escouade-'+args.version+'-Windows.zip')
    with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
        for file in sorted(out.iterdir()):
            if file.is_file(): z.write(file,'Escouade/'+file.name)
    hashes = {p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in out.iterdir() if p.is_file()}
    (args.out/'SHA256SUMS.json').write_text(json.dumps(hashes,indent=2)+'\n',encoding='utf-8')
    print(archive)

if __name__ == '__main__':
    main()
