// Rebuild the offline runtime from the exact packages in package-lock.json.
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),out=path.join(root,'src/vendor/ocr');
fs.mkdirSync(out,{recursive:true});
function copy(pkg,file,name=file){fs.copyFileSync(path.join(root,'node_modules',pkg,file),path.join(out,name));}
copy('tesseract.js','dist/tesseract.min.js','tesseract.min.js');
copy('tesseract.js','dist/worker.min.js','worker.min.js');
copy('tesseract.js','LICENSE.md','LICENSE-tesseract.js.txt');
for(const name of ['tesseract.min.js.LICENSE.txt','worker.min.js.LICENSE.txt'])copy('tesseract.js','dist/'+name,name);
copy('tesseract.js-core','LICENSE','LICENSE-core.txt');
copy('@tesseract.js-data/fra','package.json','fra-package-metadata.json');
for(const name of fs.readdirSync(path.join(root,'node_modules/tesseract.js-core')).filter(n=>n.endsWith('.wasm.js')))copy('tesseract.js-core',name);
copy('@tesseract.js-data/fra','4.0.0_best_int/fra.traineddata.gz','fra.traineddata.gz');
fs.writeFileSync(path.join(out,'NOTICE.txt'),'Offline OCR: Tesseract.js 7.0.0 / core 7.0.0 (Apache-2.0), French package @tesseract.js-data/fra 1.0.0 (package metadata: MIT; underlying Tesseract trained data: Apache-2.0). Sources: https://github.com/naptha/tesseract.js and https://github.com/naptha/tessdata. See bundled licenses. No external download is required at runtime.\n');
console.log('Offline OCR ready');
