/* Banque d'objets hors ligne (src/items.js, chargé à la demande) et carte DofusDB. */
const bankUi={q:'',type:'',stat:'',set:'',min:1,max:120,sort:'level',page:0,detail:null,loading:false,error:''};
const BANK_PAGE=50;
const BANK_SLOT={Chapeau:'Coiffe',Cape:'Cape',Amulette:'Amulette',Ceinture:'Ceinture',Bottes:'Bottes',Bouclier:'Bouclier',Familier:'Familier / Monture',Muldo:'Familier / Monture',Volkorne:'Familier / Monture',Dragodinde:'Familier / Monture',Montilier:'Familier / Monture'};
function bankLoad(){
 if(window.ESCOUADE_ITEMS||bankUi.loading||bankUi.error)return;bankUi.loading=true;bankUi.error='';
 const s=document.createElement('script');s.src='items.js';s.onload=()=>{bankUi.loading=false;if(!window.ESCOUADE_ITEMS)bankUi.error='Banque d’objets illisible dans ce paquet.';if(current()==='objets')render();};s.onerror=()=>{bankUi.loading=false;bankUi.error='Banque d’objets introuvable dans ce paquet.';s.remove();if(current()==='objets')render();};document.head.append(s);
}
function bankItem(id){return ESCOUADE_ITEMS.items.find(i=>i.i===id)||null;}
function bankSlotFor(it){const t=ESCOUADE_ITEMS.types[it.t];if(it.w||['Épée','Marteau','Bâton','Arc','Hache','Baguette','Dague','Pelle','Lance','Faux','Pioche','Arme magique','Outil'].includes(t))return 'Arme';if(t==='Anneau')return state.stuff.slots.find(s=>/^Anneau/.test(s.slot)&&!s.vise)?.slot||'Anneau 1';if(t==='Dofus'||t==='Trophée')return state.stuff.slots.find(s=>/^Dofus/.test(s.slot)&&!s.vise)?.slot||'Dofus / Trophée 1';return BANK_SLOT[t]||'';}
function bankResults(){
 const D=ESCOUADE_ITEMS,q=norm(bankUi.q.trim()),type=bankUi.type===''?-1:Number(bankUi.type),stat=bankUi.stat===''?-1:Number(bankUi.stat),set=bankUi.set===''?0:Number(bankUi.set);
 let r=D.items.filter(it=>it.l>=bankUi.min&&it.l<=bankUi.max&&(type<0||it.t===type)&&(!set||it.s===set)&&(stat<0||it.e.some(e=>e[0]===stat&&Math.max(e[1],e[2])>0))&&(!q||norm(it.n).includes(q)||(it.s&&norm(D.sets[it.s]).includes(q))));
 const statValue=it=>Math.max(0,...it.e.filter(e=>e[0]===stat).map(e=>Math.max(e[1],e[2])));
 if(bankUi.sort==='stat'&&stat>=0)r=r.slice().sort((a,b)=>statValue(b)-statValue(a)||a.l-b.l);else if(bankUi.sort==='name')r=r.slice().sort((a,b)=>a.n.localeCompare(b.n,'fr'));else if(bankUi.sort==='levelDesc')r=r.slice().sort((a,b)=>b.l-a.l||a.n.localeCompare(b.n,'fr'));
 return r;
}
function bankDetail(it){
 const D=ESCOUADE_ITEMS,slot=bankSlotFor(it),set=it.s?D.sets[it.s]:'';
 return `<section class="card" style="margin-bottom:16px" id="bank-detail"><h2>${esc(it.n)}</h2><p>Niveau ${it.l} · ${esc(D.types[it.t])}${set?` · <button class="btn small" data-bank="set" data-id="${it.s}">${esc(set)}</button>`:''} · ${fmt(it.p)} pod${it.p>1?'s':''}</p>`+
 (it.w?`<p><strong>Arme :</strong> ${it.w[0]} PA · portée ${it.w[1]===it.w[2]?it.w[1]:it.w[1]+' à '+it.w[2]} · critique ${it.w[3]} % (+${it.w[4]}) · ${it.w[5]} utilisation(s) par tour</p>`:'')+
 `<div class="grid g2" style="gap:16px;align-items:start"><div><h3>Effets</h3>${it.e.length?`<ul class="list">${it.e.map(e=>`<li>${esc(e[3])}</li>`).join('')}</ul>`:'<p class="s">Aucun effet chiffré.</p>'}${it.c?`<h3>Conditions</h3><ul class="list">${it.c.map(c=>`<li>${esc(c)}</li>`).join('')}</ul>`:''}</div>`+
 `<div><h3>Recette</h3>${it.r?`<ul class="list">${it.r.map(([id,q])=>`<li>${fmt(q)} × <a href="https://dofusdb.fr/fr/database/object/${id}" target="_blank" rel="noopener">${esc(D.ingredients[id]||'Objet '+id)}</a></li>`).join('')}</ul><form class="form f3" data-bank-form="craft" style="margin-top:8px"><label>Quantité<input name="qty" type="number" min="1" max="10000" value="1"></label><button class="btn primary">Ajouter aux crafts</button></form>`:'<p class="s">Pas de recette (objet obtenu autrement).</p>'}</div></div>`+
 `<form class="form f3" data-bank-form="target" style="margin-top:12px"><label>Emplacement du stuff<select name="slot">${state.stuff.slots.map(s=>`<option ${s.slot===slot?'selected':''}>${esc(s.slot)}</option>`).join('')}</select></label><button class="btn">Viser cet objet pour ${esc(persoLabel(activeP()))}</button></form>`+
 `<p class="s" style="margin-top:8px"><a href="https://dofusdb.fr/fr/database/object/${it.i}" target="_blank" rel="noopener">Fiche DofusDB (images, statistiques détaillées, obtention)</a> · <button class="btn small" data-bank="close">Fermer</button></p></section>`;
}
function vObjets(){
 if(!window.ESCOUADE_ITEMS){bankLoad();return head('Hors ligne','Banque d’objets','Tous les équipements du jeu, recherchables sans connexion.')+`<section class="card"><p role="status">${esc(bankUi.error||'Chargement de la banque d’objets…')}</p></section>`;}
 const D=ESCOUADE_ITEMS,r=bankResults(),pages=Math.max(1,Math.ceil(r.length/BANK_PAGE));bankUi.page=Math.min(bankUi.page,pages-1);
 const rows=r.slice(bankUi.page*BANK_PAGE,(bankUi.page+1)*BANK_PAGE),it=bankUi.detail?bankItem(bankUi.detail):null;
 const statOpts=D.effects.map((n,i)=>[i,n]).filter(([,n])=>/^(Vitalité|Sagesse|Force|Intelligence|Chance|Agilité|PA|PM|Portée|Invocation|% Critique|Puissance|Initiative|Prospection|Tacle|Fuite|Soin|Esquive|Retrait|Dommage|dommages|% Résistance|Résistance|Pod|% Dommages)/.test(n)).sort((a,b)=>a[1].localeCompare(b[1],'fr'));
 return head('Hors ligne',`Banque d’objets`,`${fmt(D.items.length)} équipements, armes, Dofus et montures du niveau ${D.min} au ${D.max}, avec effets, panoplies et recettes. Données publiques du ${esc(D.updated)}, sans connexion.`)+
 `<section class="card" style="margin-bottom:16px"><form class="form f4" data-bank-form="filter"><label class="f">Nom ou panoplie<input name="q" value="${esc(bankUi.q)}" placeholder="Ex. Bouftou, Gelano…"></label><label>Type<select name="type"><option value="">Tous</option>${D.types.map((t,i)=>[i,t]).sort((a,b)=>a[1].localeCompare(b[1],'fr')).map(([i,t])=>`<option value="${i}" ${String(i)===bankUi.type?'selected':''}>${esc(t)}</option>`).join('')}</select></label><label>Caractéristique<select name="stat"><option value="">Toutes</option>${statOpts.map(([i,n])=>`<option value="${i}" ${String(i)===bankUi.stat?'selected':''}>${esc(n)}</option>`).join('')}</select></label><label>Tri<select name="sort">${[['level','Niveau croissant'],['levelDesc','Niveau décroissant'],['name','Nom'],['stat','Valeur de la caractéristique']].map(([k,l])=>`<option value="${k}" ${bankUi.sort===k?'selected':''}>${l}</option>`).join('')}</select></label><label>Niveau min<input name="min" type="number" min="${D.min}" max="${D.max}" value="${bankUi.min}"></label><label>Niveau max<input name="max" type="number" min="${D.min}" max="${D.max}" value="${bankUi.max}"></label><div style="display:flex;gap:8px;align-items:end"><button class="btn primary">Filtrer</button><button class="btn" type="button" data-bank="mine">Mon niveau</button><button class="btn" type="button" data-bank="reset">Tout</button></div></form>${bankUi.set?`<p>Panoplie : <strong>${esc(D.sets[bankUi.set]||'')}</strong> <button class="btn small" data-bank="unset">Retirer ce filtre</button></p>`:''}</section>`+
 (it?bankDetail(it):'')+
 `<section class="card"><h2>${fmt(r.length)} résultat(s)${pages>1?` <small>page ${bankUi.page+1}/${pages}</small>`:''}</h2>`+
 (rows.length?gtable(['Niv.','Objet','Effets principaux',''],rows.map(x=>`<tr><td>${x.l}</td><td><strong style="text-decoration:none">${esc(x.n)}</strong><span class="sub">${esc(D.types[x.t])}${x.s?' · '+esc(D.sets[x.s]):''}</span></td><td class="s">${x.e.slice(0,4).map(e=>esc(e[3])).join(' · ')}${x.e.length>4?' …':''}</td><td><button class="btn small" data-bank="detail" data-id="${x.i}">Détails</button></td></tr>`)):'<p>Aucun objet ne correspond à ces filtres.</p>')+
 (pages>1?`<div style="display:flex;gap:8px;margin-top:12px"><button class="btn" data-bank="prev" ${bankUi.page?'':'disabled'}>Page précédente</button><button class="btn" data-bank="next" ${bankUi.page<pages-1?'':'disabled'}>Page suivante</button></div>`:'')+
 `<p class="s" style="margin-top:12px">Source : <a href="https://api.dofusdu.de/" target="_blank" rel="noopener">Dofusdude</a>, données publiques du jeu. Les images et descriptions restent sur <a href="https://dofusdb.fr/fr/" target="_blank" rel="noopener">DofusDB</a>. Application indépendante, non affiliée à Ankama.</p></section>`;
}
/* ---------- Carte DofusDB ---------- */
const MAP_URL='https://dofusdb.fr/fr/tools/map';
const mapUi={x:'',y:''};
function travel(pos){const m=String(pos||'').match(/(-?\d+)\s*,\s*(-?\d+)/);return m?`/travel ${m[1]},${m[2]}`:'';}
function vCarte(){
 const n=state.perso.niveau,near=allDonjons().filter(d=>d.pos&&d.lvl>=n-10&&d.lvl<=n+10).slice(0,30);
 return head('Exploration','Carte DofusDB','Carte interactive du Monde des Douze (ressources, donjons, zaaps), avec tes positions utiles à portée de clic.',`<a class="btn" href="${MAP_URL}" target="_blank" rel="noopener">Ouvrir dans le navigateur</a>`)+
 `<section class="card" style="margin-bottom:16px;padding:0;overflow:hidden"><iframe id="dofusdb-map" title="Carte interactive DofusDB" src="${MAP_URL}" style="display:block;width:100%;height:min(70vh,720px);border:0;background:var(--surface-2)" loading="lazy" referrerpolicy="no-referrer"></iframe></section>`+
 `<div class="grid g2" style="gap:16px;align-items:start"><section class="card"><h2>Aller à une position</h2><form class="form f3" data-map-form="travel"><label>X<input name="x" type="number" min="-200" max="200" value="${esc(mapUi.x)}" required></label><label>Y<input name="y" type="number" min="-200" max="200" value="${esc(mapUi.y)}" required></label><button class="btn primary">Copier /travel</button></form><p class="s">Colle la commande dans le chat de Dofus pour lancer l’autopilote (monture compatible). Escouade ne l’envoie jamais à ta place.</p></section>`+
 `<section class="card"><h2>Donjons à ton niveau</h2>${near.length?`<ul class="list">${near.map(d=>`<li class="row"><span class="lvl">${d.lvl}</span><div class="grow"><div class="t">${esc(d.boss)}</div><div class="s">${esc(d.donjon)}${d.zone?' · '+esc(d.zone):''}</div></div><button class="posbtn" data-act="copy" data-v="${esc(travel(d.pos))}" title="Copier la commande /travel">[${esc(d.pos)}]</button></li>`).join('')}</ul>`:'<p class="s">Aucun donjon avec position connue à ±10 niveaux.</p>'}</section></div>`+
 `<p class="s" style="margin-top:12px">Carte fournie par <a href="https://dofusdb.fr/fr/" target="_blank" rel="noopener">DofusDB</a>, chargée depuis leur site : elle nécessite Internet. Si elle ne s’affiche pas, utilise « Ouvrir dans le navigateur ».</p>`;
}
function installBankEvents(){
 main.addEventListener('submit',e=>{const f=e.target.dataset.bankForm||e.target.dataset.mapForm;if(!f)return;e.preventDefault();e.stopImmediatePropagation();const d=Object.fromEntries(new FormData(e.target));
  if(f==='filter'){const D=ESCOUADE_ITEMS,lo=Math.max(D.min,Math.min(D.max,Math.round(Number(d.min)||D.min))),hi=Math.max(lo,Math.min(D.max,Math.round(Number(d.max)||D.max)));Object.assign(bankUi,{q:String(d.q||'').slice(0,80),type:d.type,stat:d.stat,sort:d.sort,min:lo,max:hi,page:0});render();return;}
  if(f==='craft'){const it=bankItem(bankUi.detail);if(!it?.r)return;if(state.workshop.crafts.length>=200){toast('Limite de 200 crafts');return;}const qty=Math.max(1,Math.min(10000,Math.round(Number(d.qty)||1)));state.workshop.crafts.push({id:uid(),name:it.n,qty,ingredients:it.r.map(([id,q])=>({itemId:id,name:ESCOUADE_ITEMS.ingredients[id]||('Objet '+id),qty:q}))});persist();toast('Recette ajoutée aux crafts : '+it.n+' × '+qty);return;}
  if(f==='target'){const it=bankItem(bankUi.detail),s=state.stuff.slots.find(x=>x.slot===d.slot);if(!it||!s)return;s.vise=it.n;persist();toast(it.n+' visé en '+s.slot+' pour '+persoLabel(activeP()));return;}
  if(f==='travel'){const x=Math.round(Number(d.x)),y=Math.round(Number(d.y));if(!Number.isFinite(x)||!Number.isFinite(y)||Math.abs(x)>200||Math.abs(y)>200){toast('Coordonnées invalides');return;}mapUi.x=String(x);mapUi.y=String(y);copyText(`/travel ${x},${y}`);}
 },true);
 main.addEventListener('click',e=>{const el=e.target.closest('[data-bank]');if(!el)return;const a=el.dataset.bank;
  if(a==='detail'){bankUi.detail=Number(el.dataset.id);render();document.getElementById('bank-detail')?.scrollIntoView({block:'start'});return;}
  if(a==='close')bankUi.detail=null;
  if(a==='set'){bankUi.set=el.dataset.id;bankUi.page=0;bankUi.q='';bankUi.min=ESCOUADE_ITEMS.min;bankUi.max=ESCOUADE_ITEMS.max;}
  if(a==='unset')bankUi.set='';
  if(a==='prev')bankUi.page=Math.max(0,bankUi.page-1);
  if(a==='next')bankUi.page++;
  if(a==='mine'){const n=state.perso.niveau;bankUi.min=Math.max(ESCOUADE_ITEMS.min,n-10);bankUi.max=Math.min(ESCOUADE_ITEMS.max,Math.max(bankUi.min,n+5));bankUi.page=0;}
  if(a==='reset')Object.assign(bankUi,{q:'',type:'',stat:'',set:'',min:ESCOUADE_ITEMS.min,max:ESCOUADE_ITEMS.max,sort:'level',page:0});
  render();});
}
