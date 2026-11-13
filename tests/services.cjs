// Opt-in live service check, separate from deterministic regression tests.
let chromium;try{({chromium}=require('playwright'));}catch(e){({chromium}=require('../../test-runtime/node_modules/playwright'));}
const fs=require('fs'),http=require('http'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),results=[];
const server=http.createServer((req,res)=>{const name=req.url.split('?')[0].slice(1),asset=['scan.js','guide.js','reference.js','content.js','widgets.js','widgets.css'].includes(name);res.setHeader('Content-Type',asset?(name.endsWith('.css')?'text/css; charset=utf-8':'application/javascript; charset=utf-8'):'text/html; charset=utf-8');res.end(fs.readFileSync(path.join(root,'src',asset?name:'escouade.html')));});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const page=await browser.newPage();await page.route('https://fonts.**/*',r=>r.abort());await page.goto('http://127.0.0.1:'+server.address().port);
 for(const [name,url] of [
  ['Recherche équipements','https://api.dofusdu.de/dofus3/v1/fr/items/equipment/search?query=gelano'],
  ['Fiche objet','https://api.dofusdb.fr/items/2469'],
  ['Recette','https://api.dofusdb.fr/recipes?resultId=2469&%24limit=1'],
  ['Almanax 7 jours','https://api.dofusdu.de/dofus3/v1/fr/almanax?range[from]=2026-11-12&range[to]=2026-11-18'],
  ['Indices de chasse','https://api.dofusdb.fr/treasure-hunt?x=-2&y=0&direction=0&lang=fr&%24limit=50']]){
   try{const value=await page.evaluate(url=>publicJson(url),url);assert.ok(value);if(name==='Almanax 7 jours')assert.equal(value.length,7);results.push({name,passed:true});}
   catch(e){results.push({name,passed:false,error:e.message});}
 }
 await browser.close();server.close();fs.mkdirSync(path.join(root,'test-results'),{recursive:true});fs.writeFileSync(path.join(root,'test-results/services.json'),JSON.stringify(results,null,2));results.forEach(x=>console.log((x.passed?'PASS ':'FAIL ')+x.name+(x.error?' '+x.error:'')));process.exitCode=results.some(x=>!x.passed)?1:0;
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
