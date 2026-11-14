const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),src=path.join(root,'src'),results=[];
const server=http.createServer((req,res)=>{const name=decodeURIComponent(req.url.split('?')[0]),file=path.resolve(src,'.'+(name==='/'?'/escouade.html':name));if(!file.startsWith(src+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html; charset=utf-8':'application/octet-stream');res.end(fs.readFileSync(file));});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({executablePath:process.env.CHROME_EXECUTABLE||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{const p=await browser.newPage();const errors=[],remote=[];p.on('pageerror',e=>errors.push(e.message));await p.route('https://**/*',r=>{remote.push(r.request().url());r.abort();});await p.goto(`http://127.0.0.1:${server.address().port}/#scan`);
 await p.evaluate(()=>{state.perso.nom='Personnage test';state.kamas.depart=12345;state.xp.courante=17;state.xp.prochain=90;persist();render();});
 const fixture={schema:'escouade.scan.v1',nom:'Autre personnage',at:1,values:{niveau:99,pa:9,kamas:500,xpRestante:100},resources:[{name:'Ressource test',qty:18}]};
 await p.locator('#scan-file').setInputFiles({name:'releve.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(fixture))});await p.locator('#scan-review button').click();assert.equal(await p.evaluate(()=>state.guide.scan),undefined);results.push('Nom différent : aucun enregistrement');
 await p.locator('[name=nom]').fill('Personnage test');await p.locator('[name=apply]').check();await p.locator('#scan-review button').click();assert.equal(await p.evaluate(()=>state.perso.niveau),99);assert.equal(await p.evaluate(()=>state.stuff.caracs.pa.a),9);assert.equal(await p.evaluate(()=>state.kamas.depart),12345);assert.equal(await p.evaluate(()=>state.xp.courante),17);assert.ok(await p.evaluate(()=>localStorage.getItem(BACKUP_KEY)));await p.reload();assert.equal(await p.evaluate(()=>state.guide.scan.resources[0].qty),18);results.push('Import vérifié persistant, sauvegarde, niveau/PA appliqués, journal et XP conservés');
 assert.equal(await p.evaluate(()=>{const s=JSON.parse(JSON.stringify(state));s.persos[0].guide.scan.values.kamas=-1;return validSave(s);}),false);assert.equal(await p.evaluate(()=>validScan({schema:'escouade.scan.v1',nom:'x',at:1,values:{niveau:999},resources:[]})),false);results.push('Relevés numériques invalides rejetés');
 assert.deepEqual(await p.evaluate(()=>parseScanText('Niveau : 99\nKamas inventaire : 560 037\nXP restante : 2 102 123\n44 %\nValeur estimée : 999999')), {niveau:99,kamas:560037,xpRestante:2102123});results.push('Libellés explicites uniquement : estimation et pourcentage isolé ignorés');
 remote.length=0;
 const text=await p.evaluate(async()=>{const c=document.createElement('canvas');c.width=1000;c.height=300;const g=c.getContext('2d');g.fillStyle='white';g.fillRect(0,0,1000,300);g.fillStyle='black';g.font='42px Arial';g.fillText('Niveau : 99',30,70);g.fillText('Force : 125',30,140);g.fillText('Kamas inventaire : 560037',30,210);return (await scanOCR(c.toDataURL())).text;});assert.match(text,/99/);assert.match(text,/125/);assert.match(text,/560037/);assert.deepEqual(remote,[]);assert.deepEqual(errors,[]);await p.evaluate(async()=>{await scanWorker.terminate();scanWorker=null;});results.push('OCR français réel sur image synthétique, aucun téléchargement distant');
 const png=await p.evaluate(()=>{const c=document.createElement('canvas');c.width=1000;c.height=300;const g=c.getContext('2d');g.fillStyle='white';g.fillRect(0,0,1000,300);g.fillStyle='black';g.font='42px Arial';g.fillText('Force : 125',30,90);return c.toDataURL().split(',')[1];});
 await p.locator('#scan-file').setInputFiles({name:'demo.png',mimeType:'image/png',buffer:Buffer.from(png,'base64')});const box=await p.locator('#scan-preview').boundingBox();await p.mouse.move(box.x+10,box.y+10);await p.mouse.down();await p.mouse.move(box.x+box.width/2,box.y+box.height/2);await p.mouse.up();const crop=await p.evaluate(()=>scanRect);assert.ok(crop.width>100&&crop.width<1000);assert.ok(crop.height<300);await p.locator('[data-scan="crop-clear"]').click();assert.equal(await p.evaluate(()=>scanRect),null);results.push('Sélection et réinitialisation de la zone de lecture');
 /* Dofus 3 panel drawn like the real window, with a chat and a quest tracker around it that must be ignored. */
 const panelValues=await p.evaluate(async()=>{
  const c=document.createElement('canvas');c.width=1920;c.height=1057;const g=c.getContext('2d');
  const sky=g.createLinearGradient(0,0,1920,1057);sky.addColorStop(0,'#c9b48a');sky.addColorStop(1,'#6f8fb0');g.fillStyle=sky;g.fillRect(0,0,1920,1057);
  g.fillStyle='#e8e0cf';g.font='bold 20px Arial';g.fillText('Bonta (Faubourgs des artisans)',8,58);g.fillText('-29, -57 - Niveau 10',8,85);
  g.fillStyle='rgba(20,22,28,.9)';g.fillRect(0,165,230,420);g.fillStyle='#ffffff';g.font='bold 14px Arial';g.fillText('Grouiiik !',14,188);g.font='12px Arial';g.fillText('Vaincre x5 [Berger Porkass] (0/5)',30,206);g.fillText('Force 999 Sagesse 888',30,240);
  g.fillStyle='rgba(20,22,28,.92)';g.fillRect(0,915,650,142);g.fillStyle='#d6d6d6';g.font='12px Arial';['[06:56] (/g) Message de guide : Niveau 150','[07:00] (/b) Vend Puissance 400 Tacle 90','[07:02] (/b) PA 12 PM 6 Initiative 9999'].forEach((t,i)=>g.fillText(t,28,930+i*16));
  g.fillStyle='#24262c';g.fillRect(355,120,400,688);g.fillStyle='#2e3038';g.fillRect(355,120,400,30);g.fillStyle='#1c1d22';g.fillRect(355,150,75,620);
  const W='#f2f2f2',G='#6c6f78';
  g.fillStyle='#f0e6d2';g.font='bold 20px Arial';g.fillText('Caractéristiques',467,145);g.font='bold 15px Arial';g.fillStyle=W;g.fillText('Aventurier',452,178);g.font='11px Arial';g.fillStyle='#b9b9b9';g.fillText('NIVEAU',452,196);g.font='bold 11px Arial';g.fillStyle=W;g.fillText('99',500,196);g.font='11px Arial';g.fillStyle='#b9b9b9';g.fillText('|  XÉLOR',520,196);
  const right=(t,x,y,col=W,f='bold 14px Arial')=>{g.font=f;g.fillStyle=col;g.textAlign='right';g.fillText(t,x,y);g.textAlign='left';};
  const label=(t,x,y)=>{g.font='14px Arial';g.fillStyle='#e6e6e6';g.fillText(t,x,y);};
  [['2 095',297],['125',381],['150',464],['125',547],['265',630],['165',714]].forEach(([t,y])=>{g.fillStyle='#555a66';g.beginPath();g.arc(391,y-30,14,0,7);g.fill();g.font='bold 14px Arial';g.fillStyle=W;g.textAlign='center';g.fillText(t,391,y+4);g.textAlign='left';});
  const grid=[['PA','9',235,'Critique','9'],['PM','5',259,'Puissance','369'],['Portée','1',281,'Invocation','2'],['Pods','4 867',327,'Prospection','114'],['Tacle','26',373,'Fuite','26'],['Retrait PA','16',396,'Esquive PA','16'],['Retrait PM','16',418,'Esquive PM','16'],['Initiative','665',441,'Soins','25']];
  for(const[a,av,y,b,bv]of grid){label(a,466,y);right(av,581,y);label(b,622,y);right(bv,737,y);}
  label('Renvoi',466,462);right('0',581,462,G,'14px Arial');
  g.font='bold 10px Arial';g.fillStyle='#b9b9b9';g.textAlign='right';g.fillText('DMG.',623,506);g.fillText('RES.',681,506);g.fillText('RES.%',736,506);g.textAlign='left';
  const rows=[['Neutre','38','0','0 %'],['Terre','48','0','3 %'],['Feu','38','0','1 %'],['Eau','45','0','3 %'],['Air','48','0','6 %'],['Critiques','1','-30','-'],['Poussée','0','-30','-'],['Sorts','0 %','-','0 %'],['Armes','0 %','-','0 %'],['Distance','0 %','-','0 %'],['Mêlée','0 %','-','0 %']];
  const dim=v=>/^(0|0 %|-)$/.test(v);rows.forEach(([l,d,r,q],i)=>{const y=525+i*22.3;label(l,467,y);right(d,623,y,dim(d)?G:W,dim(d)?'14px Arial':'bold 14px Arial');right(r,681,y,dim(r)?G:W,dim(r)?'14px Arial':'bold 14px Arial');right(q,736,y,dim(q)?G:W,dim(q)?'14px Arial':'bold 14px Arial');});
  g.font='12px Arial';g.fillStyle='#c8c8c8';g.fillText('POINTS RESTANTS',549,793);right('0',703,793);
  if(scanWorker){await scanWorker.terminate();scanWorker=null;}
  const r=await scanOCR(c.toDataURL());return {...r.values,__nom:r.nom,__classe:r.classe};
 });
 const header={nom:panelValues.__nom,classe:panelValues.__classe};delete panelValues.__nom;delete panelValues.__classe;
 assert.deepEqual(header,{nom:'Aventurier',classe:'Xélor'});
 const expected={pv:2095,force:125,intelligence:150,chance:125,agilite:265,sagesse:165,niveau:99,pa:9,pm:5,po:1,critique:9,puissance:369,invocations:2,pods:4867,prospection:114,tacle:26,fuite:26,retraitPA:16,retraitPM:16,esquivePA:16,esquivePM:16,initiative:665,soins:25,renvoi:0,domNeutre:38,domTerre:48,domFeu:38,domEau:45,domAir:48,pctTerre:3,pctFeu:1,pctEau:3,pctAir:6,domCritique:1,resCritique:-30,resPoussee:-30,points:0};
 const wrong=Object.entries(panelValues).filter(([k,v])=>expected[k]!==undefined&&expected[k]!==v),found=Object.keys(expected).filter(k=>panelValues[k]===expected[k]);
 assert.deepEqual(wrong,[],'valeurs fausses : '+JSON.stringify(wrong));assert.ok(found.length>=Object.keys(expected).length-3,'valeurs lues : '+found.length+'/'+Object.keys(expected).length+' '+JSON.stringify(panelValues));
 for(const[k,bad]of Object.entries({force:999,sagesse:888,puissance:400,tacle:90,pa:12,initiative:9999,niveau:10}))assert.notEqual(panelValues[k],bad,'valeur du chat ou des quêtes reprise : '+k);
 results.push('En-tête du panneau : nom du personnage et classe lus');
 results.push(`Panneau Caractéristiques Dofus 3 : ${found.length}/${Object.keys(expected).length} valeurs exactes, aucune fausse, chat/quêtes/zone ignorés`);
 assert.deepEqual(await p.evaluate(()=>parseScanText('Dommages\nNeutre 38\nRésistances\nNeutre 0 0%\nTerre 2 3 %\nTacle 26 Fuite 25\n125 Force\nPoints de vie 2 095 / 2 095\nRésistances critiques −30')),{domNeutre:38,resNeutre:0,pctNeutre:0,resTerre:2,pctTerre:3,tacle:26,fuite:25,force:125,pv:2095,resCritique:-30});
 results.push('Texte : sections Dommages/Résistances, deux colonnes par ligne, valeur avant libellé, PV courants/max, signe moins');
 const applied=await p.evaluate(()=>{state.persos[0].perso.nom='Personnage test';state.activeId=state.persos[0].id;scanDraft={schema:'escouade.scan.v1',nom:'Personnage test',at:Date.now(),values:{niveau:120,vitalite:900,force:300,agilite:250,pctNeutre:10,pctTerre:20,pctFeu:30,pctEau:40,pctAir:50,sagesse:150,puissance:400,kamas:500},resources:[]};scanTarget=state.activeId;location.hash='scan';render();return true;});
 await p.locator('#scan-review button').click();
 const after=await p.evaluate(()=>({lvl:state.perso.niveau,vita:state.stuff.caracs.vita.a,stat:state.stuff.caracs.stat.a,res:state.stuff.caracs.res.a,hist:state.guide.scanHistory.length,radar:!!document.querySelector('svg[aria-label="Diagramme radar des caractéristiques"]'),bars:/Dommages et résistances par élément/.test(document.body.textContent),trend:/Évolution sur/.test(document.body.textContent),valid:validSave(state)}));
 assert.deepEqual(after,{lvl:120,vita:900,stat:300,res:30,hist:2,radar:true,bars:true,trend:true,valid:true});
 results.push('Enregistrement : niveau, vitalité, stat principale et résistance moyenne appliqués ; historique, diagramme radar, barres et évolution affichés');
 const names=await p.evaluate(async()=>{
  const other=fillPerso({perso:{nom:'Aventurier'}});state.persos.push(other);const first=state.persos[0].id;state.activeId=first;
  scanDraft={schema:'escouade.scan.v1',nom:'Aventurier',classe:'Xélor',at:Date.now(),values:{niveau:99},resources:[]};scanTarget=first;location.hash='scan';render();
  const banner=!!document.querySelector('[data-scan="switch"]');document.querySelector('[data-scan="switch"]').click();await new Promise(r=>setTimeout(r,50));
  const switched=state.activeId===other.id&&!!scanDraft&&scanDraft.nom==='Aventurier'&&!document.querySelector('[data-scan="switch"]');
  const matched=scanMatchPerso('Aventuriet')?.id===other.id;
  state.persos=state.persos.filter(p=>p.id!==other.id);state.activeId=first;scanDraft=null;render();
  return {banner,switched,matched,classValid:validScan({schema:'escouade.scan.v1',nom:'x',at:1,values:{},resources:[],classe:'Inconnue'})};
 });
 assert.deepEqual(names,{banner:true,switched:true,matched:true,classValid:false});
 results.push('Nom lu différent du personnage actif : proposition de passer sur ce personnage, faute de lecture tolérée, classe validée');
 const nativeResult=await p.evaluate(async png=>{
  const original={desktop,neutralino:window.Neutralino,path:window.NL_PATH};desktop=true;window.NL_PATH='C:/Test Escouade';let calls=[],readCount=0;
  const bytes=Uint8Array.from(atob(png),c=>c.charCodeAt(0)).buffer;
  try{
   scanImage='';window.Neutralino={os:{execCommand:async(command,options)=>{calls.push({command,options});return {exitCode:0};}},filesystem:{readBinaryFile:async(file,options)=>{readCount++;calls.push({file,options});return bytes;}}};
   await scanCapture();const success={image:scanImage.startsWith('data:image/png;base64,'),notice:scanCaptureNotice,pending:scanCapturePending,calls:JSON.parse(JSON.stringify(calls)),saved:state.guide.scan.values.kamas};
   const previous=scanImage;window.Neutralino.os.execCommand=async()=>({exitCode:2});await scanCapture();const cancelled={notice:scanCaptureNotice,unchanged:scanImage===previous,reads:readCount};
   window.Neutralino.os.execCommand=async()=>({exitCode:3});await scanCapture();const failed={notice:scanCaptureNotice,pending:scanCapturePending,reads:readCount};
   window.Neutralino.os.execCommand=async()=>({exitCode:0});window.Neutralino.filesystem.readBinaryFile=async()=>{throw {code:'NE_FS_FILRDER'};};await scanCapture();const missing={notice:scanCaptureNotice,unchanged:scanImage===previous};
   let finish;window.Neutralino.os.execCommand=()=>new Promise(r=>finish=r);const target=state.activeId;const op=scanCapture();const second=fillPerso({perso:{nom:'Deuxième'}});state.persos.push(second);state.activeId=second.id;finish({exitCode:0});await op;const switched=scanCaptureNotice;state.activeId=target;state.persos=state.persos.filter(p=>p.id!==second.id);render();
   window.NL_PATH='C:/Bad&Path';let rejected=false;try{await scanCapture();}catch{rejected=true;}
   return {success,cancelled,failed,missing,switched,rejected};
  }finally{desktop=original.desktop;window.Neutralino=original.neutralino;window.NL_PATH=original.path;render();}
 },png);
 assert.equal(nativeResult.success.image,true);assert.equal(nativeResult.success.pending,false);assert.equal(nativeResult.success.saved,500);assert.equal(nativeResult.success.calls[0].options.background,false);assert.match(nativeResult.success.calls[0].command,/^"C:\\Test Escouade\\Capture Escouade.exe" --request [a-f0-9]{32}$/);assert.match(nativeResult.success.calls[1].file,/capture-request-[a-f0-9]{32}\.png$/);results.push('Retour natif simulé : image importée automatiquement, résultat visible, aucun relevé appliqué');
 assert.match(nativeResult.cancelled.notice,/annulée/);assert.equal(nativeResult.cancelled.unchanged,true);assert.equal(nativeResult.cancelled.reads,1);results.push('Annulation de capture : image et données conservées, aucune lecture de fichier');
 assert.match(nativeResult.failed.notice,/échoué/);assert.equal(nativeResult.failed.pending,false);assert.equal(nativeResult.failed.reads,1);assert.match(nativeResult.missing.notice,/NE_FS_FILRDER/);assert.equal(nativeResult.missing.unchanged,true);results.push('Échec et fichier absent : erreur visible sans faux succès');
 assert.match(nativeResult.switched,/personnage actif a changé/);assert.equal(nativeResult.rejected,true);results.push('Changement de personnage et chemin de commande dangereux bloqués');
 assert.deepEqual(errors,[]);
 fs.mkdirSync(path.join(root,'test-results/captures'),{recursive:true});await p.screenshot({path:path.join(root,'test-results/captures/scan-verification-demo.png'),fullPage:true});fs.writeFileSync(path.join(root,'test-results/scan.json'),JSON.stringify({passed:true,checks:results,ocrText:text},null,2));console.log(results.join('\n'));
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
