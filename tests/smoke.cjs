let chromium; try { ({chromium}=require('playwright')); } catch(e) { ({chromium}=require('../../test-runtime/node_modules/playwright')); }
const fs = require('fs');
const path = require('path');
const http = require('http');
const assert = require('assert/strict');
const root = path.resolve(__dirname, '..');
const results = [];
const html = fs.readFileSync(path.join(root, 'src/escouade.html'));
const server = http.createServer((req,res) => { const name=req.url.split('?')[0].slice(1);if(['content.js','scan.js','guide.js','reference.js','widgets.js','widgets.css'].includes(name)){res.setHeader('Content-Type',name.endsWith('.css')?'text/css; charset=utf-8':'application/javascript; charset=utf-8');res.end(fs.readFileSync(path.join(root,'src',name)));return;} res.setHeader('Content-Type','text/html; charset=utf-8');res.end(html); });
(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const url = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true });
  async function test(name, fn, seed) {
    const context = await browser.newContext({ viewport:{width:1440,height:960}, locale:'fr-FR', timezoneId:'Europe/Paris' });
    const page = await context.newPage(); const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.route('https://**/*',r=>r.abort());
    if(seed) await page.addInitScript(seed=>{if(!sessionStorage.getItem('test-seeded')){localStorage.setItem('carnet-xelor-v1', JSON.stringify(seed));sessionStorage.setItem('test-seeded','1');}},seed);
    try { await page.goto(url); await fn(page); assert.deepEqual(errors,[]); results.push({name,passed:true}); }
    catch(e) {results.push({name,passed:false,error:e.message,errors});}
    await context.close();
  }
  await test('Les vingt-trois rubriques démarrent sans erreur',async p=>{
    for(const tab of await p.evaluate(()=>TABS.map(t=>t[0]))) {
      await p.locator(`#nav a[href="#${tab}"]`).click();
      await p.locator('h1').waitFor(); assert.ok((await p.locator('#main').innerText()).length>100);
    }
  });
  const legacy={v:2,perso:{nom:'Xolmora',classe:'Xélor',niveau:90,objectif:110},xp:{courante:20,prochain:100,parCombat:10},sessions:[{id:'s1',date:'2026-11-12',activite:'Donjon test',duree:30,niveauFin:90,kamas:500}],donjons:{Kardorim:{etat:'fait',runs:2,note:'Note conservée'}},parcours:{17:'2026-11-12'},notes:{build:'Mon build'},kamas:{depart:5000000,ops:[{id:'op1',date:'2026-11-12',libelle:'Vente test',cat:'Autre',montant:500}]}};
  await test('Migration 1.1 vers multi-persos conserve les données',async p=>{
    const s=await p.evaluate(()=>JSON.parse(JSON.stringify(state)));
    assert.equal(s.persos[0].perso.nom,'Xolmora');assert.equal(s.persos[0].donjons.Kardorim.runs,2);
    assert.equal(s.kamas.depart,5000000);assert.equal(s.notes.build,'Mon build');
    assert.equal(await p.evaluate(()=>soldeKamas()),5000500);
    assert.ok(await p.evaluate(()=>localStorage.getItem('carnet-xelor-v1-v1x')));
  },legacy);
  await test('Personnages isolés, thème et sélection persistants',async p=>{
    const first=await p.evaluate(()=>state.activeId);
    await p.locator('[data-act="perso-add"]').click();
    await p.locator('#p-nom').fill('Second');await p.locator('#p-nom').press('Tab');
    await p.locator('#p-niv').fill('120');await p.locator('#p-niv').press('Tab');
    const second=await p.evaluate(()=>state.activeId);
    await p.locator('#perso-switch').selectOption(first);
    assert.equal(await p.locator('#p-niv').inputValue(),'90');
    await p.locator('#perso-switch').selectOption(second);
    assert.equal(await p.locator('#p-nom').inputValue(),'Second');
    await p.locator('#nav a[href="#parametres"]').click();
    await p.locator('[data-act="theme"][data-v="clair"]').click();await p.reload();
    assert.equal(await p.evaluate(()=>state.settings.theme),'clair');assert.equal(await p.evaluate(()=>state.activeId),second);
  },legacy);
  await test('Import corrompu rejeté sans perte de données',async p=>{
    assert.equal(await p.evaluate(()=>importText('{"persos":[{"sessions":[null]}]}')),false);
    assert.equal(await p.evaluate(()=>state.perso.nom),'Xolmora');
  },legacy);
  await test('Import numérique incohérent rejeté',async p=>{
    assert.equal(await p.evaluate(()=>importText('{"perso":{"niveau":"oops"},"kamas":{"depart":"bonjour","ops":[null]}}')),false);
    assert.equal(await p.evaluate(()=>state.perso.nom),'Xolmora');
  },legacy);
  await test('Un montant négatif ne peut inverser une dépense',async p=>{
    await p.locator('#nav a[href="#kamas"]').click();
    await p.locator('#k-lib').fill('Dépense');await p.locator('#k-sens').selectOption('-1');
    await p.locator('#k-mt').fill('-200k');await p.locator('[data-form="op"] button[type="submit"]').click();
    assert.equal(await p.evaluate(()=>state.kamas.ops.length),1);
  },legacy);
  await test('Les notes survivent à un rechargement immédiat',async p=>{
    await p.locator('#nav a[href="#notes"]').click();
    await p.locator('#n-build').fill('Note juste avant fermeture');await p.reload();
    assert.equal(await p.locator('#n-build').inputValue(),'Note juste avant fermeture');
  });
  await test('Durée XP correctement arrondie',async p=>{
    assert.equal(await p.evaluate(()=>fmtMin(61.5)),'1 h 02');
  });
  await test('Protection contre données importées injectant du HTML',async p=>{
    await p.evaluate(()=>importText(JSON.stringify({v:3,persos:[{id:'x" onclick="window.pwned=1',perso:{nom:'<img src=x onerror=window.pwned=1>'}}],objectifs:[]})));
    assert.equal(await p.evaluate(()=>window.pwned),undefined);
    assert.equal(await p.locator('[onclick]').count(),0);
  });
  await test('Sauvegarde et restauration après import valide',async p=>{
    await p.locator('#nav a[href="#parametres"]').click();
    assert.equal(await p.evaluate(()=>importText(JSON.stringify({v:2,perso:{nom:'Importé',niveau:130}}))),true);
    assert.equal(await p.evaluate(()=>state.perso.nom),'Importé');
    await p.locator('[data-act="restore"]').click();await p.locator('[data-act="restore"]').click();
    assert.equal(await p.evaluate(()=>state.perso.nom),'Xolmora');
  },legacy);
  await test('Parcours 1–200 et reprise de l’ancienne étape',async p=>{
    assert.equal(await p.evaluate(()=>PARCOURS.length),41);
    assert.equal(await p.evaluate(()=>nextEtape().n),18);
    assert.equal(await p.evaluate(()=>state.parcours[17]),'2026-11-12');
    await p.locator('#nav a[href="#parcours"]').click();
    await p.locator('[data-bind="perso.parcoursDepart"]').selectOption('1');
    assert.equal(await p.evaluate(()=>nextEtape().n),1);
  },legacy);
  await test('La collection Dofus est indépendante par personnage',async p=>{
    const first=await p.evaluate(()=>state.activeId);
    await p.locator('#nav a[href="#dofus"]').click();
    await p.locator('[data-act="dofus-toggle"]').first().check();
    const name=await p.locator('[data-act="dofus-toggle"]').first().getAttribute('data-name');
    await p.evaluate(()=>{addPerso();persist();render();});
    assert.equal(await p.evaluate(name=>!!state.dofus[name],name),false);
    await p.locator('#perso-switch').selectOption(first);
    assert.equal(await p.evaluate(name=>state.dofus[name],name),true);
    const backup=await p.evaluate(()=>JSON.stringify(state));
    assert.equal(await p.evaluate(raw=>importText(raw),backup),true);
  });
  await test('Les réglages de confort persistent au redémarrage',async p=>{
    await p.locator('#nav a[href="#parametres"]').click();
    await p.locator('#settings-density').selectOption('compact');
    await p.locator('#settings-text').selectOption('110');
    await p.locator('#settings-start').selectOption('dofus');
    await p.goto(url);assert.equal(await p.evaluate(()=>location.hash),'#dofus');
    assert.equal(await p.locator('html').getAttribute('data-density'),'compact');
    assert.equal(await p.locator('body').evaluate(e=>e.style.zoom),'1.1');
  });
  await test('Objectif chiffré modifiable et terminé automatiquement',async p=>{
    await p.locator('#nav a[href="#objectifs"]').click();
    await p.locator('#ob-t').fill('Financer le prochain stuff');
    await p.locator('#ob-cible').fill('500k');await p.locator('#ob-unit').fill('kamas');
    await p.locator('[data-form="obj"] button[type="submit"]').click();
    const detail=p.locator('details').first();await detail.locator('summary').click();
    await p.locator('[data-bind="objectifs.0.avancement"]').fill('500k');
    await p.locator('[data-bind="objectifs.0.avancement"]').press('Tab');
    assert.equal(await p.evaluate(()=>state.objectifs[0].fait),true);
    assert.equal(await p.evaluate(()=>state.objectifs[0].cible),500000);
  });
  await test('L’historique donne accès aux opérations au-delà de 30',async p=>{
    await p.evaluate(()=>{for(let i=0;i<35;i++)state.kamas.ops.push({id:uid(),libelle:'Vente '+i,date:'2026-11-12',cat:'Autre',montant:1});persist();});
    await p.locator('#nav a[href="#kamas"]').click();
    await p.locator('[data-act="op-page"][data-page="2"]').click();
    assert.equal(await p.locator('[data-act="op-del"]').count(),5);
    assert.ok((await p.locator('#main').innerText()).includes('Page 2 / 2'));
  });
  await test('Export navigateur et réimport par fichier',async p=>{
    await p.locator('#nav a[href="#parametres"]').click();
    const event=p.waitForEvent('download');await p.locator('[data-act="export-file"]').click();
    const download=await event;const data=JSON.parse(fs.readFileSync(await download.path(),'utf8'));
    assert.equal(data.v,3);assert.equal(data.persos.length,1);
    data.persos[0].perso.nom='Retour fichier';
    await p.locator('#imp-file').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(data))});
    await p.waitForFunction(()=>state.perso.nom==='Retour fichier');
  });
  await test('Les paliers du calculateur donnent 300 puis 600 points',async p=>{
    await p.locator('#nav a[href="#outils"]').click();
    assert.equal(await p.evaluate(()=>statCost(200)),300);assert.equal(await p.evaluate(()=>statCost(300)),600);
    assert.equal(await p.evaluate(()=>Math.ceil((179591-state.outils.xpFamilier)/500)),360);
  });
  await test('Une copie de sécurité impossible bloque la réinitialisation',async p=>{
    await p.locator('#nav a[href="#parametres"]').click();
    await p.evaluate(()=>{Storage.prototype.setItem=function(){throw new Error('quota');};});
    await p.locator('[data-act="reset"]').click();await p.locator('[data-act="reset"]').click();
    assert.equal(await p.evaluate(()=>state.perso.nom),'Xolmora');
  },legacy);
  await test('Les pages principales restent utilisables à 420 pixels',async p=>{
    await p.setViewportSize({width:420,height:900});
    for(const tab of ['accueil','dofus','outils','parametres']){
      await p.goto(url+'/#'+tab);assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2));
    }
  });
  await test('Import par glisser-déposer',async p=>{
    await p.locator('#nav a[href="#parametres"]').click();
    const data=await p.evaluate(()=>{const s=JSON.parse(JSON.stringify(state));s.persos[0].perso.nom='Import déposé';return s;});
    const transfer=await p.evaluateHandle(data=>{const dt=new DataTransfer();dt.items.add(new File([JSON.stringify(data)],'team.json',{type:'application/json'}));return dt;},data);
    await p.locator('#drop').dispatchEvent('drop',{dataTransfer:transfer});
    await p.waitForFunction(()=>state.perso.nom==='Import déposé');
  });
  await test('Sauvegarde locale illisible conservée pour récupération',async p=>{
    await p.evaluate(()=>localStorage.setItem('carnet-xelor-v1','{fichier-abime'));
    await p.reload();await p.locator('[role="alert"]').waitFor();
    await p.locator('#nav a[href="#parametres"]').click();
    const event=p.waitForEvent('download');await p.locator('[data-act="recover-raw"]').click();
    const file=await event;assert.equal(fs.readFileSync(await file.path(),'utf8'),'{fichier-abime');
  });
  await test('Un achat de stuff débite le bon montant et change le statut',async p=>{
    await p.locator('#nav a[href="#stuff"]').click();
    await p.locator('#sv-0').fill('Coiffe test');await p.locator('#sv-0').press('Tab');
    await p.locator('#sp-0').fill('250k');await p.locator('#sp-0').press('Tab');
    await p.locator('#ss-0').selectOption('acheter');await p.locator('[data-act="buy"]').click();
    assert.equal(await p.evaluate(()=>soldeKamas()),4750500);
    assert.equal(await p.evaluate(()=>state.stuff.slots[0].statut),'achete');
    assert.equal(await p.locator('[data-act="buy"]').count(),0);
  },legacy);
  await test('La limite de huit personnages est respectée',async p=>{
    const count=await p.evaluate(()=>{for(let i=0;i<10;i++)addPerso();persist();render();return state.persos.length;});
    assert.equal(count,8);assert.equal(await p.evaluate(()=>addPerso()),false);
  });
  await test('Ocre : filtres, quantités, isolation et sauvegarde',async p=>{
    await p.locator('#nav a[href="#ocre"]').click();
    const id=await p.evaluate(()=>GUIDE_REFERENCE.ocre[0].id);
    await p.locator(`[data-guide="ocre-plus"][data-id="${id}"]`).click();
    assert.equal(await p.evaluate(id=>state.guide.ocre[id],id),1);
    const first=await p.evaluate(()=>state.activeId);
    await p.evaluate(()=>{addPerso();persist();render();});
    assert.equal(await p.evaluate(id=>state.guide.ocre[id]||0,id),0);
    await p.selectOption('#perso-switch',first);await p.reload();
    assert.equal(await p.evaluate(id=>state.guide.ocre[id],id),1);
    await p.locator('[data-guide-form="ocre-filter"] select[name="owned"]').selectOption('owned');
    await p.locator('[data-guide-form="ocre-filter"] button').click();
    assert.equal(await p.locator('tbody tr').count(),1);
  });
  await test('Succès épinglés, points et métiers propres au personnage',async p=>{
    await p.locator('#nav a[href="#succes"]').click();
    const box=p.locator('[data-guide-change="achievement"]').first();const id=await box.getAttribute('data-id');
    await box.check();await p.locator(`[data-guide-change="pin"][data-id="${id}"]`).check();
    assert.equal(await p.evaluate(id=>state.guide.achievements[id]&&state.guide.pins[id],id),true);
    await p.locator('[data-guide-form="achievement-filter"] select[name="owned"]').selectOption('pins');
    await p.locator('[data-guide-form="achievement-filter"] button').click();assert.equal(await p.locator('tbody tr').count(),1);
    await p.locator('#nav a[href="#metiers"]').click();
    const job=p.locator('[data-guide-change="job"]').first();const jid=await job.getAttribute('data-id');
    await job.fill('150');await job.press('Tab');await p.reload();
    assert.equal(await p.evaluate(id=>state.guide.jobs[id],jid),150);
    assert.equal(await p.evaluate(()=>validSave(JSON.parse(JSON.stringify(state)))),true);
  });
  await test('Recette recherchée, courses regroupées et fabrication sans stock insuffisant',async p=>{
    await p.route('https://api.dofusdu.de/**',r=>r.fulfill({json:[{ankama_id:2469,name:'Gelano test',level:60,type:{name:'Anneau'}}]}));
    await p.route('https://api.dofusdb.fr/items/2469',r=>r.fulfill({json:{id:2469,name:{fr:'Gelano test'},level:60}}));
    await p.route('https://api.dofusdb.fr/recipes?**',r=>r.fulfill({json:{data:[{ingredientIds:[757,368],quantities:[50,2]}]}}));
    await p.route('https://api.dofusdb.fr/items?**',r=>r.fulfill({json:{data:[{id:757,name:{fr:'Gelée test'}},{id:368,name:{fr:'Bave test'}}]}}));
    await p.locator('#nav a[href="#catalogue"]').click();await p.locator('[name="q"]').fill('Gelano');await p.locator('[data-guide-form="catalog-search"] button').click();
    await p.locator('[data-guide="item-detail"]').click();await p.locator('[data-guide-form="craft-add"]').waitFor();
    await p.locator('[data-guide-form="craft-add"] [name="qty"]').fill('2');await p.locator('[data-guide-form="craft-add"] button').click();
    await p.locator('[data-guide="craft-complete"]').waitFor();
    assert.equal(await p.evaluate(()=>craftNeeds().find(i=>i.itemId===757).missing),100);
    await p.locator('[data-guide="craft-complete"]').click();assert.equal(await p.evaluate(()=>state.workshop.crafts.length),1);
    for(const [id,qty] of [[757,120],[368,4]]){const input=p.locator(`[data-guide-change="stock"][data-id="${id}"]`);await input.fill(String(qty));await input.press('Tab');}
    await p.locator('[data-guide="craft-complete"]').click();
    assert.equal(await p.evaluate(()=>state.workshop.crafts.length),0);assert.equal(await p.evaluate(()=>state.workshop.stock[757]),20);
    await p.reload();assert.equal(await p.evaluate(()=>state.workshop.stock[757]),20);
    assert.equal(await p.evaluate(()=>!!readBackup()),true);
  });
  await test('Les besoins de plusieurs recettes partagent un seul stock',async p=>{
    const n=await p.evaluate(()=>{state.workshop.crafts=[{id:'a',name:'A',qty:2,ingredients:[{itemId:1,name:'Bois',qty:3}]},{id:'b',name:'B',qty:4,ingredients:[{itemId:1,name:'Bois',qty:2}]}];state.workshop.stock[1]=10;state.workshop.prices[1]=100;return craftNeeds();});
    assert.equal(n.length,1);assert.equal(n[0].qty,14);assert.equal(n[0].missing,4);assert.equal(n[0].missing*n[0].price,400);
  });
  await test('Builds filtrables et annonces de groupe locales persistantes',async p=>{
    await p.locator('#nav a[href="#builds"]').click();const b=p.locator('[data-guide-form="build-add"]');
    await b.locator('[name="name"]').fill('Build feu');await b.locator('[name="url"]').fill('https://huzounet.fr/');await b.locator('[name="classe"]').selectOption('Xélor');await b.locator('button').click();
    assert.equal(await p.evaluate(()=>state.workshop.builds.length),1);
    await p.locator('[data-guide-form="build-filter"] [name="mode"]').selectOption('PvP');await p.locator('[data-guide-form="build-filter"] button').click();assert.equal(await p.locator('tbody tr').count(),0);
    await p.locator('#nav a[href="#groupe"]').click();const g=p.locator('[data-guide-form="group-add"]');
    await g.locator('[name="server"]').fill('Serveur test');await g.locator('[name="activity"]').fill('Kardorim');await g.locator('[name="time"]').fill('2026-11-13T20:30');await g.locator('button').click();
    await p.reload();assert.equal(await p.evaluate(()=>state.workshop.groups.length),1);assert.match(await p.evaluate(()=>groupMessage(state.workshop.groups[0])),/Kardorim/);
    assert.equal(await p.evaluate(()=>validSave(JSON.parse(JSON.stringify(state)))),true);
  });
  await test('Almanax en ligne : calendrier et suivi individuel restauré',async p=>{
    const day={date:'2026-11-12',tribute:{quantity:2,item:{name:'Lanterne test'}},bonus:{type:{name:'Butin'},description:'Bonus test'},reward_kamas:21990};
    await p.route('https://api.dofusdu.de/**',r=>r.fulfill({json:[day]}));
    await p.locator('#nav a[href="#almanax"]').click();await p.locator('[data-guide-form="almanax-load"] button').click();
    await p.locator('[data-guide-change="almanax"]').check();await p.reload();
    assert.equal(await p.evaluate(()=>state.guide.almanax['2026-11-12']),true);
  });
  await test('Chasse : proposition de position et historique sans commande de jeu',async p=>{
    await p.route('https://api.dofusdb.fr/treasure-hunt?**',r=>r.fulfill({json:{data:[{posX:3,posY:0,pois:[{name:{fr:'Arbre creux'}}]}]}}));
    await p.locator('#nav a[href="#chasses"]').click();const f=p.locator('[data-guide-form="hunt-search"]');await f.locator('[name="dir"]').selectOption('E');await f.locator('[name="clue"]').fill('arbre');await f.locator('button').click();
    await p.locator('[data-guide="hunt-save"]').click();await p.reload();
    assert.equal(await p.evaluate(()=>state.guide.hunts[0].toX),3);assert.equal(await p.evaluate(()=>state.guide.hunts[0].dir),'E');
  });
  await test('Import de nouveaux modules malformés rejeté sans perdre le profil',async p=>{
    for(const change of ['stock','crafts','guide']){
      assert.equal(await p.evaluate(change=>{const d=JSON.parse(JSON.stringify(state));if(change==='stock')d.workshop.stock={1:-20};if(change==='crafts')d.workshop.crafts=[{id:'bad',name:'Bad',qty:2,ingredients:[null]}];if(change==='guide')d.persos[0].guide.ocre={1:'oops'};return importText(JSON.stringify(d));},change),false);
    }
  });
  await test('Une panne des API laisse les données enregistrées intactes',async p=>{
    await p.locator('#nav a[href="#catalogue"]').click();await p.locator('[name="q"]').fill('Gelano');await p.locator('[data-guide-form="catalog-search"] button').click();
    await p.locator('[role="alert"]').waitFor();assert.equal(await p.evaluate(()=>validSave(JSON.parse(JSON.stringify(state)))),true);
  });
  await test('Toutes les rubriques proposent un widget et se rendent à 420 pixels',async p=>{
    const tabs=await p.evaluate(()=>TABS.map(t=>t[0]));
    for(const tab of tabs){await p.goto(url+'/#'+tab);assert.equal(await p.locator('[data-widget="open"]').count(),1);}
    await p.setViewportSize({width:420,height:750});
    for(const tab of tabs){await p.goto(url+'/widget.html?widget=1#'+tab);await p.locator('.widget-tools').waitFor();assert.equal(await p.locator('.side').isVisible(),false);assert.equal(await p.locator('#widget-page').inputValue(),tab);assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));}
  });
  await test('Le widget de prochaine quête avance et synchronise sa case avec la fenêtre principale',async p=>{
    await p.evaluate(()=>persist());
    const w=await p.context().newPage();await w.route('https://**/*',r=>r.abort());
    await w.goto(url+'/widget.html?widget=1&block=next#parcours');
    await w.locator('#et-1').click();await w.locator('#et-2').waitFor();
    assert.equal(await w.locator('#et-1').count(),0);await p.waitForFunction(()=>!!state.parcours[1]);
    await p.goto(url+'/#parcours');await p.locator('#et-2').check();
    await w.locator('#et-3').waitFor();assert.equal(await w.evaluate(()=>!!state.parcours[2]),true);
    await w.close();assert.equal(await p.isClosed(),false);
  });
  await test('Deux fenêtres conservent les edits de notes sur des champs différents',async p=>{
    await p.evaluate(()=>persist());const w=await p.context().newPage();await w.route('https://**/*',r=>r.abort());await w.goto(url+'/widget.html?widget=1#notes');
    await p.evaluate(()=>{state.notes.build='Build en cours';});
    await w.evaluate(()=>{state.notes.boss='Conseil depuis le widget';persist();});
    await p.waitForFunction(()=>state.notes.boss==='Conseil depuis le widget');await p.evaluate(()=>persist());
    await w.waitForFunction(()=>state.notes.build==='Build en cours');
    await p.reload();assert.equal(await p.evaluate(()=>state.notes.build),'Build en cours');assert.equal(await p.evaluate(()=>state.notes.boss),'Conseil depuis le widget');
    await w.close();
  });
  await test('Fusion des fenêtres : personnages et objectifs ajoutés ne sont pas effacés par une vue ancienne',async p=>{
    const result=await p.evaluate(()=>{
      const b={persos:[{id:'a',notes:'A'}],objectifs:[{id:'one',fait:false}]};
      const local={persos:[{id:'a',notes:'modifié'}],objectifs:[{id:'one',fait:true}]};
      const remote={persos:[{id:'a',notes:'A'},{id:'b',notes:'Nouveau'}],objectifs:[{id:'one',fait:false},{id:'two',fait:false}]};
      return mergeWindowEdits(b,local,remote);
    });assert.equal(result.persos.length,2);assert.equal(result.persos[0].notes,'modifié');assert.equal(result.objectifs.length,2);assert.equal(result.objectifs[0].fait,true);
  });
  await test('Un bloc de quête se détache seul et reste interactif',async p=>{
    await p.goto(url+'/widget.html?widget=1&block=step-17-0#parcours');
    assert.equal(await p.locator('.step').count(),1);await p.locator('#et-17').check();assert.equal(await p.evaluate(()=>!!state.parcours[17]),true);
    await p.locator('#widget-block').selectOption('');assert.ok(await p.locator('.step').count()>1);
    await p.locator('[data-widget="fold"]').click();assert.equal(await p.locator('#main').isVisible(),false);
    await p.locator('[data-widget="fold"]').click();assert.equal(await p.locator('#main').isVisible(),true);
  });
  await test('Lancement natif : URL sûre, taille compacte, premier plan et jeton injecté une seule fois',async p=>{
    const result=await p.evaluate(async()=>{desktop=true;window.Neutralino={window:{create:async(url,options)=>{window.widgetCall={url,options};}}};await openWidget('parcours','step-17-0');return window.widgetCall;});
    assert.equal(result.options.alwaysOnTop,true);assert.equal(result.options.injectGlobals,false);assert.equal(result.options.injectClientLibrary,true);assert.equal(result.options.width,480);assert.match(result.options.processArgs,/--port=0/);assert.ok(!/[&|<>^%!"]/.test(result.url));
    const w=await p.context().newPage();await w.route('https://**/*',r=>r.abort());await w.goto(result.url);assert.equal(await w.locator('#widget-page').inputValue(),'parcours');assert.equal(await w.locator('.step').count(),1);await w.close();
  });
  await test('Épingler et désépingler appelle le réglage natif et garde un état cohérent',async p=>{
    await p.goto(url+'/widget.html?widget=1#notes');
    await p.evaluate(()=>{desktop=true;window.calls=[];window.Neutralino={window:{setTitle:async()=>{},setAlwaysOnTop:async value=>window.calls.push(value)}};render();});
    await p.locator('[data-widget="top"]').click();assert.equal(await p.locator('[data-widget="top"]').getAttribute('aria-pressed'),'false');
    await p.locator('[data-widget="top"]').click();assert.deepEqual(await p.evaluate(()=>window.calls),[false,true]);
    await p.locator('[data-widget="small"]').click();assert.equal(await p.locator('body').evaluate(x=>x.classList.contains('widget-small')),true);
  });
  await test('Un widget récupère les résultats et filtres de la rubrique détachée',async p=>{
    const target=await p.evaluate(async()=>{desktop=true;window.Neutralino={window:{create:async url=>{window.createdWidget=url}}};guideUi.catalog.q='gelano';guideResults=[{ankama_id:2469,name:'Gelano',level:60}];await openWidget('catalogue');return window.createdWidget;});
    const w=await p.context().newPage();await w.route('https://**/*',r=>r.abort());await w.goto(target);
    assert.equal(await w.locator('[name="q"]').inputValue(),'gelano');assert.match(await w.locator('tbody').innerText(),/Gelano/);await w.close();
  });
  await test('1.4.1 : nouveau profil avec objectifs de niveau 1',async p=>{
    const titles=await p.evaluate(()=>state.objectifs.map(x=>x.titre));assert.ok(titles.includes('Atteindre le niveau 20'));assert.ok(titles.includes('Dofus Argenté'));assert.ok(!titles.some(x=>x.includes('Pourpre')));
  });
  await test('1.4.1 : objectifs existants conservés et suggestions sans doublon',async p=>{
    await p.evaluate(()=>{state.perso.niveau=92;state.perso.parcoursDepart=17;state.parcours[17]='2026-11-13';state.objectifs=[{id:'old',titre:'Dofus Pourpre',cat:'Dofus',note:'Mon texte',fait:false}];persist();});
    await p.goto(url+'/#objectifs');await p.locator('[data-act="obj-suggest"]').click();
    const o=await p.evaluate(()=>state.objectifs);assert.equal(o.filter(x=>x.titre==='Dofus Pourpre').length,1);assert.equal(o.find(x=>x.id==='old').note,'Mon texte');assert.ok(o.some(x=>x.titre.includes('étape 18')));assert.equal(await p.locator('[data-act="obj-suggest"]').isDisabled(),true);
    await p.reload();assert.equal(await p.evaluate(()=>state.objectifs.length),o.length);
  });
  await test('1.4.1 : menu repliable conservé et groupe actif toujours ouvert',async p=>{
    assert.equal(await p.locator('.nav-head').count(),2);await p.locator('[data-group="Outils de jeu"]').click();assert.equal(await p.locator('#nav a[href="#ocre"]').isVisible(),false);
    await p.reload();assert.equal(await p.locator('#nav a[href="#ocre"]').isVisible(),false);
    await p.goto(url+'/#ocre');assert.equal(await p.locator('#nav a[href="#ocre"]').isVisible(),true);assert.equal(await p.locator('#nav a').count(),23);
  });
  await test('1.4.1 : paquet complet requis, URL contrôlée et installation partielle interdite',async p=>{
    await p.evaluate(async()=>{desktop=true;window.Neutralino={updater:{checkForUpdates:async()=>({version:'9.9.9',data:{requiresFullPackage:true,packageUrl:'https://github.com/Toka120/escouade/releases/test.zip'}})}};location.hash='parametres';await checkUpdate();});
    await p.locator('a:has-text("Télécharger le paquet")').waitFor();assert.equal(await p.locator('[data-act="upd-install"]').count(),0);
    assert.match(await p.locator('a:has-text("Télécharger le paquet")').getAttribute('href'),/^https:\/\/github.com\/Toka120/);
    for(const bad of ['javascript:alert(1)','https://github.com.evil.example/test','https://github.com@evil.example/test','https://github.com:8443/test'])assert.equal(await p.evaluate(x=>safePackageUrl(x),bad),'https://github.com/Toka120/escouade');
    assert.equal(await p.evaluate(async()=>{let called=false;Neutralino.updater.install=async()=>{called=true};await installUpdate();return called}),false);
  });
  await test('1.4.1 : barre widget compacte sur plusieurs rubriques',async p=>{
    for(const tab of ['accueil','parcours','stuff']){await p.goto(url+'/#'+tab);assert.equal(await p.locator('[data-widget="open"]').count(),1);assert.ok((await p.locator('.widget-launch').boundingBox()).height<48);}
  });
  await test('Positions vérifiées : entrée corrigée et accès à la dimension distinct',async p=>{
    const values=await p.evaluate(()=>Object.fromEntries(allDonjons().map(x=>[x.boss,{pos:x.pos,ref:dungeonReference(x)}])));
    assert.equal(values['Blops Royaux'].pos,'-7,-43');assert.equal(values['Comte Harebourg'].pos,'-59,-88');assert.equal(values['Ombre'].pos,'5,9');assert.match(values['Ombre'].ref,/6,13/);assert.equal(values['Misère'].pos,'1,0');assert.match(values['Misère'].ref,/15,-20/);assert.match(values['Déchireuse'].ref,/Guide indisponible/);
    assert.equal(await p.evaluate(()=>Object.values(ESCOUADE_CONTENT.positions).filter(x=>x.resolved).length),19);
  });
  await test('Le réglage des groupes de menu importé doit contenir des booléens valides',async p=>{
    assert.equal(await p.evaluate(()=>{const d=JSON.parse(JSON.stringify(state));d.settings.navClosed={'Outils de jeu':'fermé'};return validSave(d);}),false);
  });
  await test('Les objectifs initiaux de la 1.0 ne sont pas remplacés pendant la migration',async p=>{
    assert.equal(await p.evaluate(()=>{const objectifs=OLD_PRESETS.map((titre,i)=>({id:'old'+i,titre,cat:'Autre',fait:false}));const d={v:1,perso:{niveau:90,classe:'Xélor'},objectifs};return JSON.stringify(merge(d).objectifs)===JSON.stringify(objectifs);}),true);
  });
  await browser.close();server.close();
  fs.mkdirSync(path.join(root,'test-results'),{recursive:true});
  fs.writeFileSync(path.join(root,'test-results','smoke.json'),JSON.stringify(results,null,2));
  for(const r of results) console.log(`${r.passed?'PASS':'FAIL'} ${r.name}${r.error?' : '+r.error.split('\n')[0]:''}`);
  process.exitCode=results.some(r=>!r.passed)?1:0;
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
