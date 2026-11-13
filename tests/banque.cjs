// Banque d'objets hors ligne et carte DofusDB. Aucun appel réseau n'est autorisé pendant ce test.
const {chromium}=require('playwright');const assert=require('assert');const http=require('http'),fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
(async()=>{
 const server=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0].split('#')[0]);const f=path.join(root,'src',u==='/'?'escouade.html':u);if(!f.startsWith(path.join(root,'src'))){r.writeHead(403);r.end();return;}fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return;}r.writeHead(200,{'content-type':f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':'text/html'});r.end(d);});});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const url=`http://127.0.0.1:${server.address().port}`;
 const browser=await chromium.launch({executablePath:process.env.CHROME_EXECUTABLE||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});const results=[];
 try{
  const p=await browser.newPage();const errors=[],remote=[];p.on('pageerror',e=>errors.push(e.message));await p.route('https://**/*',r=>{remote.push(r.request().url());r.abort();});
  await p.goto(url+'/#objets');await p.waitForFunction(()=>window.ESCOUADE_ITEMS&&document.querySelector('[data-bank-form="filter"]'));
  const total=await p.evaluate(()=>ESCOUADE_ITEMS.items.length);assert.ok(total>2000,'objets : '+total);
  assert.equal(await p.evaluate(()=>ESCOUADE_ITEMS.items.every(i=>i.l>=1&&i.l<=120&&typeof i.n==='string'&&Array.isArray(i.e))),true);
  assert.equal(await p.evaluate(()=>JSON.stringify(ESCOUADE_ITEMS).includes('image_urls')||/\.png/.test(JSON.stringify(ESCOUADE_ITEMS))),false);
  results.push(`Banque chargée hors ligne : ${total} objets niveaux 1–120, sans images`);
  await p.locator('[data-bank-form="filter"] [name=q]').fill('Coiffe du Bouftou');await p.locator('[data-bank-form="filter"] button.primary').click();
  await p.locator('[data-bank="detail"]').first().click();const detail=await p.locator('#bank-detail').textContent();
  assert.match(detail,/Coiffe du Bouftou/);assert.match(detail,/16 à 20 Force/);assert.match(detail,/Panoplie du Bouftou/);assert.match(detail,/Recette/);
  results.push('Recherche par nom, fiche : effets, panoplie et recette avec noms des ingrédients');
  await p.locator('[data-bank-form="craft"] [name=qty]').fill('2');await p.locator('[data-bank-form="craft"] button').click();
  const craft=await p.evaluate(()=>state.workshop.crafts.at(-1));assert.equal(craft.name,'Coiffe du Bouftou');assert.equal(craft.qty,2);assert.ok(craft.ingredients.length>=2&&craft.ingredients.every(i=>i.name&&!/^Objet /.test(i.name)));
  await p.locator('[data-bank-form="target"] button').click();assert.equal(await p.evaluate(()=>state.stuff.slots.find(s=>s.slot==='Coiffe').vise),'Coiffe du Bouftou');
  assert.equal(await p.evaluate(()=>validSave(state)),true);
  results.push('Ajout aux crafts (quantité, ingrédients nommés) et objet visé dans le bon emplacement du stuff');
  await p.evaluate(()=>{const s=ESCOUADE_ITEMS.effects.indexOf('Sagesse');bankUi.q='';bankUi.stat=String(s);bankUi.sort='stat';bankUi.min=50;bankUi.max=60;bankUi.page=0;render();});
  const firsts=await p.evaluate(()=>bankResults().slice(0,5).map(i=>Math.max(...i.e.filter(e=>ESCOUADE_ITEMS.effects[e[0]]==='Sagesse').map(e=>Math.max(e[1],e[2])))));
  assert.ok(firsts.length>0&&firsts.every((v,i)=>i===0||v<=firsts[i-1]));assert.equal(await p.evaluate(()=>bankResults().every(i=>i.l>=50&&i.l<=60)),true);
  results.push('Filtre par caractéristique et niveau, tri par valeur décroissante');
  await p.evaluate(()=>{bankUi.stat='';bankUi.sort='level';bankUi.q='<img src=x onerror=alert(1)>';render();});assert.equal(await p.locator('#main img[src="x"]').count(),0);
  results.push('Texte recherché échappé');
  await p.goto(url+'/#carte');await p.locator('#dofusdb-map').waitFor({state:'attached'});
  assert.equal(await p.locator('#dofusdb-map').getAttribute('src'),'https://dofusdb.fr/fr/tools/map');
  await p.evaluate(()=>{window.__copied=[];copyText=async t=>{window.__copied.push(t);return true;};});
  await p.locator('[data-map-form="travel"] [name=x]').fill('-29');await p.locator('[data-map-form="travel"] [name=y]').fill('-57');await p.locator('[data-map-form="travel"] button').click();
  assert.deepEqual(await p.evaluate(()=>window.__copied),['/travel -29,-57']);
  assert.equal(await p.evaluate(()=>travel('5,9')),'/travel 5,9');
  results.push('Carte DofusDB intégrée et commande /travel copiée (jamais envoyée au jeu)');
  assert.deepEqual(errors,[]);assert.ok(remote.every(u=>u.startsWith('https://dofusdb.fr/')||u.startsWith('https://fonts.googleapis.com/')),'requêtes : '+remote.join(' '));
  fs.mkdirSync(path.join(root,'test-results'),{recursive:true});fs.writeFileSync(path.join(root,'test-results/banque.json'),JSON.stringify({passed:true,checks:results},null,2));console.log(results.join('\n'));
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exit(1);});
