let chromium; try { ({chromium}=require('playwright')); } catch(e) { ({chromium}=require('../../test-runtime/node_modules/playwright')); }
const fs=require('fs'),path=require('path'),http=require('http');
const root=path.resolve(__dirname,'..'),out=path.join(root,'test-results/captures');
fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{const name=req.url.split('?')[0].slice(1),asset=['content.js','scan.js','guide.js','reference.js','widgets.js','widgets.css'].includes(name);res.setHeader('Content-Type',asset?(name.endsWith('.css')?'text/css; charset=utf-8':'application/javascript; charset=utf-8'):'text/html; charset=utf-8');res.end(fs.readFileSync(path.join(root,'src',asset?name:'escouade.html')));});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const url=`http://127.0.0.1:${server.address().port}`;
 const browser=await chromium.launch({executablePath:process.env.CHROME_EXECUTABLE||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1000},locale:'fr-FR',timezoneId:'Europe/Paris'});
 await page.route('https://**/*',r=>r.abort());await page.goto(url);
 await page.evaluate(()=>{
  const s=defaultState();s.perso.nom='Aventurier';s.perso.classe='Xélor';s.perso.niveau=90;s.perso.objectif=110;s.perso.element='Feu';s.perso.parcoursDepart=17;s.kamas.depart=5000000;
  for(const [nom,classe,niveau] of [['Éclaireuse','Crâ',88],['Gardien','Pandawa',90],['Soutien','Eniripsa',87]]){const p=fillPerso({});Object.assign(p.perso,{nom,classe,niveau,objectif:110,parcoursDepart:17});s.persos.push(p);}
  s.objectifs=suggestionsFor(s.persos[0]);
  s.objectifs.unshift({id:'demo-goal',titre:'Financer le prochain équipement',note:'Budget de la team',cat:'Kamas',cible:500000,avancement:275000,unite:'kamas',fait:false});
  s.donjons.Kardorim={etat:'succes',runs:2,note:'Premiers succès validés'};s.dofus['Dofus Cawotte']=true;s.dofus.Dofawa=true;
  s.stuff.slots[0].vise='Coiffe à préparer';s.stuff.slots[0].prix=250000;s.stuff.slots[0].statut='acheter';
  state=s;persist();render();
 });
 for(const theme of ['sombre','clair']){
  await page.evaluate(theme=>{state.settings.theme=theme;persist();},theme);
  const tabs=theme==='sombre'?await page.evaluate(()=>TABS.map(t=>t[0])):['accueil','parcours','parametres','crafts','ocre'];
  for(const tab of tabs){
   await page.goto(url+'/#'+tab);await page.locator('h1').waitFor();
   await page.evaluate(()=>{const n=document.createElement('div');n.textContent='Données de démonstration · aperçu de l’interface';Object.assign(n.style,{position:'fixed',bottom:'8px',right:'12px',font:'11px Segoe UI',padding:'4px 9px',background:'#101827',color:'#d9b45a',borderRadius:'5px',zIndex:'10000'});n.id='demo-label';document.querySelector('#demo-label')?.remove();document.body.append(n);});
   await page.screenshot({path:path.join(out,`${tab}-${theme}.png`)});
  }
 }
 await page.evaluate(()=>{state.settings.theme='sombre';persist();});await page.setViewportSize({width:480,height:700});
 for(const [name,tab,block] of [['quetes','parcours','next'],['ocre','ocre',''],['notes','notes','']]){
  await page.goto(url+'/widget.html?widget=1'+(block?'&block='+block:'')+'#'+tab);await page.locator('.widget-tools').waitFor();
  await page.evaluate(()=>{const n=document.createElement('div');n.textContent='Démonstration · aperçu du widget';Object.assign(n.style,{position:'fixed',bottom:'6px',right:'8px',font:'10px Segoe UI',padding:'3px 6px',background:'#101827',color:'#d9b45a',borderRadius:'5px',zIndex:'10000'});document.body.append(n);});
  await page.screenshot({path:path.join(out,`widget-${name}-sombre.png`)});
 }
 await browser.close();server.close();console.log(`${fs.readdirSync(out).length} captures créées : ${out}`);
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
