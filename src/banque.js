/* Banque d'objets hors ligne (src/items.js, chargé à la demande) et carte DofusDB. */
const bankUi={q:'',cat:'0',type:'',stat:'',set:'',min:0,max:200,sort:'level',page:0,detail:null,mount:false,loading:false,error:''};
const BANK_PAGE=50;
const BANK_SLOT={Chapeau:'Coiffe',Cape:'Cape',Sac:'Cape',Amulette:'Amulette',Ceinture:'Ceinture',Bottes:'Bottes',Bouclier:'Bouclier',Familier:'Familier / Monture',Muldo:'Familier / Monture',Volkorne:'Familier / Monture',Dragodinde:'Familier / Monture',Montilier:'Familier / Monture'};
let bankById=null;
function bankLoad(){
 if(window.ESCOUADE_ITEMS||bankUi.loading||bankUi.error)return;bankUi.loading=true;
 const s=document.createElement('script');s.src='items.js';s.onload=()=>{bankUi.loading=false;if(!window.ESCOUADE_ITEMS)bankUi.error='Catalogue illisible dans ce paquet.';if(current()==='objets')render();};s.onerror=()=>{bankUi.loading=false;bankUi.error='Catalogue introuvable dans ce paquet.';s.remove();if(current()==='objets')render();};document.head.append(s);
}
function bankItem(id){if(!bankById){bankById=new Map();for(const it of ESCOUADE_ITEMS.items)bankById.set(it.i,it);}return bankById.get(id)||null;}
const bankName=id=>bankItem(id)?.n||('Objet '+id);
function bankSlotFor(it){const t=ESCOUADE_ITEMS.types[it.t];if(it.c!==0)return '';if(it.w||['Épée','Marteau','Bâton','Arc','Hache','Baguette','Dague','Pelle','Lance','Faux','Pioche','Arme magique','Outil'].includes(t))return 'Arme';if(t==='Anneau')return state.stuff.slots.find(s=>/^Anneau/.test(s.slot)&&!s.vise)?.slot||'Anneau 1';if(t==='Dofus'||t==='Trophée'||t==='Prysmaradite')return state.stuff.slots.find(s=>/^Dofus/.test(s.slot)&&!s.vise)?.slot||'Dofus / Trophée 1';return BANK_SLOT[t]||'';}
function bankResults(){
 const D=ESCOUADE_ITEMS,q=norm(bankUi.q.trim()),cat=bankUi.cat===''?-1:Number(bankUi.cat),type=bankUi.type===''?-1:Number(bankUi.type),stat=bankUi.stat===''?-1:Number(bankUi.stat),set=bankUi.set===''?0:Number(bankUi.set);
 let r=D.items.filter(it=>(cat<0||it.c===cat)&&it.l>=bankUi.min&&it.l<=bankUi.max&&(type<0||it.t===type)&&(!set||it.s===set)&&(stat<0||(it.e||[]).some(e=>e[0]===stat&&Math.max(e[1],e[2])>0))&&(!q||norm(it.n).includes(q)||(it.s&&D.sets[it.s]&&norm(D.sets[it.s].n).includes(q))));
 const statValue=it=>Math.max(0,...(it.e||[]).filter(e=>e[0]===stat).map(e=>Math.max(e[1],e[2])));
 if(bankUi.sort==='stat'&&stat>=0)r=r.slice().sort((a,b)=>statValue(b)-statValue(a)||a.l-b.l);else if(bankUi.sort==='name')r=r.slice().sort((a,b)=>a.n.localeCompare(b.n,'fr'));else if(bankUi.sort==='levelDesc')r=r.slice().sort((a,b)=>b.l-a.l||a.n.localeCompare(b.n,'fr'));
 return r;
}
function bankUsedIn(id){return ESCOUADE_ITEMS.items.filter(it=>it.r&&it.r.some(([x])=>x===id));}
function bankSetCard(sid){
 const D=ESCOUADE_ITEMS,s=D.sets[sid];if(!s)return '';const pieces=D.items.filter(it=>it.s===Number(sid));
 return `<div><h3>${esc(s.n)} <small>niveau ${s.l} · ${s.q} objets</small></h3><ul class="list">${pieces.map(p=>`<li><button class="btn small" data-bank="detail" data-id="${p.i}">${esc(p.n)}</button> <span class="s">${esc(D.types[p.t])} · niv. ${p.l}</span></li>`).join('')}</ul>${Object.keys(s.b).length?`<h3>Bonus de panoplie</h3>${gtable(['Objets','Bonus'],Object.entries(s.b).map(([n,b])=>`<tr><td>${esc(n)}</td><td>${b.map(esc).join(' · ')}</td></tr>`))}`:''}</div>`;
}
function bankDetail(it){
 const D=ESCOUADE_ITEMS,slot=bankSlotFor(it),used=bankUsedIn(it.i);
 return `<section class="card" style="margin-bottom:16px" id="bank-detail"><h2>${esc(it.n)}</h2><p>${esc(D.categories[it.c])} · ${esc(D.types[it.t])} · niveau ${it.l} · ${fmt(it.p)} pod${it.p>1?'s':''}</p>`+
 (it.w?`<p><strong>Arme :</strong> ${it.w[0]} PA · portée ${it.w[1]===it.w[2]?it.w[1]:it.w[1]+' à '+it.w[2]} · critique ${it.w[3]} % (+${it.w[4]}) · ${it.w[5]} utilisation(s) par tour</p>`:'')+
 `<div class="grid g2" style="gap:16px;align-items:start"><div><h3>Effets</h3>${it.e?`<ul class="list">${it.e.map(e=>`<li>${esc(e[3])}</li>`).join('')}</ul>`:'<p class="s">Aucun effet chiffré.</p>'}${it.k?`<h3>Conditions</h3><ul class="list">${it.k.map(c=>`<li>${esc(c)}</li>`).join('')}</ul>`:''}</div>`+
 `<div><h3>Recette</h3>${it.r?`<ul class="list">${it.r.map(([id,q])=>`<li>${fmt(q)} × ${bankItem(id)?`<button class="btn small" data-bank="detail" data-id="${id}">${esc(bankName(id))}</button>`:esc(bankName(id))}</li>`).join('')}</ul><form class="form f3" data-bank-form="craft" style="margin-top:8px"><label>Quantité<input name="qty" type="number" min="1" max="10000" value="1"></label><button class="btn primary">Ajouter aux crafts</button></form>`:'<p class="s">Pas de recette : objet obtenu autrement.</p>'}`+
 (used.length?`<h3>Utilisé dans ${used.length} recette${used.length>1?'s':''}</h3><ul class="list">${used.slice(0,25).map(u=>`<li><button class="btn small" data-bank="detail" data-id="${u.i}">${esc(u.n)}</button> <span class="s">niv. ${u.l}</span></li>`).join('')}</ul>${used.length>25?`<p class="s">… et ${used.length-25} autres.</p>`:''}`:'')+`</div></div>`+
 (it.s?`<div style="margin-top:12px">${bankSetCard(it.s)}</div>`:'')+
 (slot?`<form class="form f3" data-bank-form="target" style="margin-top:12px"><label>Emplacement du stuff<select name="slot">${state.stuff.slots.map(s=>`<option ${s.slot===slot?'selected':''}>${esc(s.slot)}</option>`).join('')}</select></label><button class="btn">Viser cet objet pour ${esc(persoLabel(activeP()))}</button></form>`:'')+
 `<p class="s" style="margin-top:8px"><a href="https://dofusdb.fr/fr/database/object/${it.i}" target="_blank" rel="noopener">Fiche DofusDB (images, obtention)</a> · <button class="btn small" data-bank="close">Fermer</button></p></section>`;
}
function vMounts(){
 const D=ESCOUADE_ITEMS,q=norm(bankUi.q.trim()),list=D.mounts.filter(m=>!q||norm(m.n).includes(q)||norm(m.f).includes(q));
 return `<section class="card"><h2>${fmt(list.length)} monture(s)</h2>${gtable(['Monture','Famille','Effets'],list.slice(0,200).map(m=>`<tr><td><strong style="text-decoration:none">${esc(m.n)}</strong></td><td>${esc(m.f)}</td><td class="s">${m.e.map(esc).join(' · ')}</td></tr>`))}${list.length>200?'<p class="s">Affine la recherche pour voir les autres.</p>':''}</section>`;
}
function vObjets(){
 if(!window.ESCOUADE_ITEMS){bankLoad();return head('Hors ligne','Catalogue Dofus','Tous les objets du jeu, recherchables sans connexion.')+`<section class="card"><p role="status">${esc(bankUi.error||'Chargement du catalogue…')}</p></section>`;}
 const D=ESCOUADE_ITEMS,cat=bankUi.cat===''?-1:Number(bankUi.cat);
 const counts=D.categories.map((_,i)=>D.items.filter(x=>x.c===i).length);
 const tabs=`<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">${[['','Tout',D.items.length],...D.categories.map((c,i)=>[String(i),c,counts[i]])].map(([k,l,n])=>`<button class="btn small ${!bankUi.mount&&bankUi.cat===k?'primary':''}" data-bank="cat" data-cat="${k}">${esc(l)} <span class="s">${fmt(n)}</span></button>`).join('')}<button class="btn small ${bankUi.mount?'primary':''}" data-bank="mounts">Montures (races) <span class="s">${fmt(D.mounts.length)}</span></button></div>`;
 const lead=`${fmt(D.items.length)} objets, ${fmt(Object.keys(D.sets).length)} panoplies et ${fmt(D.mounts.length)} montures, avec effets, recettes et bonus. Données du jeu ${esc(D.game?.version||'')} (${esc(D.updated)}), sans connexion.`;
 if(bankUi.mount)return head('Hors ligne','Catalogue Dofus',lead)+`<section class="card" style="margin-bottom:16px">${tabs}<form class="form f3" data-bank-form="filter"><label class="f">Nom ou famille<input name="q" value="${esc(bankUi.q)}"></label><button class="btn primary">Filtrer</button></form></section>`+vMounts();
 const r=bankResults(),pages=Math.max(1,Math.ceil(r.length/BANK_PAGE));bankUi.page=Math.min(bankUi.page,pages-1);
 const rows=r.slice(bankUi.page*BANK_PAGE,(bankUi.page+1)*BANK_PAGE),it=bankUi.detail?bankItem(bankUi.detail):null;
 const typeIds=[...new Set(D.items.filter(x=>cat<0||x.c===cat).map(x=>x.t))].sort((a,b)=>D.types[a].localeCompare(D.types[b],'fr'));
 const statOpts=D.effects.map((n,i)=>[i,n]).filter(([,n])=>/^(Vitalité|Sagesse|Force|Intelligence|Chance|Agilité|PA|PM|Portée|Invocation|% Critique|Puissance|Initiative|Prospection|Tacle|Fuite|Soin|Esquive|Retrait|Dommage|dommages|% Résistance|Résistance|Pod|% Dommages|Dommages)/.test(n)).sort((a,b)=>a[1].localeCompare(b[1],'fr'));
 return head('Hors ligne','Catalogue Dofus',lead)+
 `<section class="card" style="margin-bottom:16px">${tabs}<form class="form f4" data-bank-form="filter"><label class="f">Nom ou panoplie<input name="q" value="${esc(bankUi.q)}" placeholder="Ex. Bouftou, Gelano, Laine…"></label><label>Type<select name="type"><option value="">Tous</option>${typeIds.map(i=>`<option value="${i}" ${String(i)===bankUi.type?'selected':''}>${esc(D.types[i])}</option>`).join('')}</select></label><label>Caractéristique<select name="stat"><option value="">Toutes</option>${statOpts.map(([i,n])=>`<option value="${i}" ${String(i)===bankUi.stat?'selected':''}>${esc(n)}</option>`).join('')}</select></label><label>Tri<select name="sort">${[['level','Niveau croissant'],['levelDesc','Niveau décroissant'],['name','Nom'],['stat','Valeur de la caractéristique']].map(([k,l])=>`<option value="${k}" ${bankUi.sort===k?'selected':''}>${l}</option>`).join('')}</select></label><label>Niveau min<input name="min" type="number" min="0" max="200" value="${bankUi.min}"></label><label>Niveau max<input name="max" type="number" min="0" max="200" value="${bankUi.max}"></label><div style="display:flex;gap:8px;align-items:end"><button class="btn primary">Filtrer</button><button class="btn" type="button" data-bank="mine">Mon niveau</button><button class="btn" type="button" data-bank="reset">Tout</button></div></form>${bankUi.set&&D.sets[bankUi.set]?`<p>Panoplie : <strong>${esc(D.sets[bankUi.set].n)}</strong> <button class="btn small" data-bank="unset">Retirer ce filtre</button></p>`:''}</section>`+
 (it?bankDetail(it):'')+
 `<section class="card"><h2>${fmt(r.length)} résultat(s)${pages>1?` <small>page ${bankUi.page+1}/${pages}</small>`:''}</h2>`+
 (rows.length?gtable(['Niv.','Objet','Effets principaux',''],rows.map(x=>`<tr><td>${x.l}</td><td><strong style="text-decoration:none">${esc(x.n)}</strong><span class="sub">${esc(D.types[x.t])}${x.s&&D.sets[x.s]?' · '+esc(D.sets[x.s].n):''}</span></td><td class="s">${(x.e||[]).slice(0,4).map(e=>esc(e[3])).join(' · ')}${(x.e||[]).length>4?' …':''}</td><td><button class="btn small" data-bank="detail" data-id="${x.i}">Détails</button></td></tr>`)):'<p>Aucun objet ne correspond à ces filtres.</p>')+
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
  if(f==='filter'){if(bankUi.mount){bankUi.q=String(d.q||'').slice(0,80);render();return;}const lo=Math.max(0,Math.min(200,Math.round(Number(d.min)||0))),hi=Math.max(lo,Math.min(200,Math.round(Number(d.max)||200)));Object.assign(bankUi,{q:String(d.q||'').slice(0,80),type:d.type,stat:d.stat,sort:d.sort,min:lo,max:hi,page:0});render();return;}
  if(f==='craft'){const it=bankItem(bankUi.detail);if(!it?.r)return;if(state.workshop.crafts.length>=200){toast('Limite de 200 crafts');return;}const qty=Math.max(1,Math.min(10000,Math.round(Number(d.qty)||1)));state.workshop.crafts.push({id:uid(),name:it.n,qty,ingredients:it.r.map(([id,q])=>({itemId:id,name:bankName(id),qty:q}))});persist();toast('Recette ajoutée aux crafts : '+it.n+' × '+qty);return;}
  if(f==='target'){const it=bankItem(bankUi.detail),s=state.stuff.slots.find(x=>x.slot===d.slot);if(!it||!s)return;s.vise=it.n;persist();toast(it.n+' visé en '+s.slot+' pour '+persoLabel(activeP()));return;}
  if(f==='travel'){const x=Math.round(Number(d.x)),y=Math.round(Number(d.y));if(!Number.isFinite(x)||!Number.isFinite(y)||Math.abs(x)>200||Math.abs(y)>200){toast('Coordonnées invalides');return;}mapUi.x=String(x);mapUi.y=String(y);copyText(`/travel ${x},${y}`);}
 },true);
 main.addEventListener('click',e=>{const el=e.target.closest('[data-bank]');if(!el)return;const a=el.dataset.bank;
  if(a==='detail'){bankUi.detail=Number(el.dataset.id);render();document.getElementById('bank-detail')?.scrollIntoView({block:'start'});return;}
  if(a==='close')bankUi.detail=null;
  if(a==='set'){bankUi.set=el.dataset.id;bankUi.page=0;bankUi.q='';bankUi.min=0;bankUi.max=200;}
  if(a==='cat'){bankUi.cat=el.dataset.cat;bankUi.mount=false;bankUi.type='';bankUi.page=0;}
  if(a==='mounts'){bankUi.mount=true;bankUi.detail=null;bankUi.q='';}
  if(a==='unset')bankUi.set='';
  if(a==='prev')bankUi.page=Math.max(0,bankUi.page-1);
  if(a==='next')bankUi.page++;
  if(a==='mine'){const n=state.perso.niveau;bankUi.min=Math.max(1,n-10);bankUi.max=Math.min(200,Math.max(bankUi.min,n+5));bankUi.page=0;}
  if(a==='reset')Object.assign(bankUi,{q:'',type:'',stat:'',set:'',min:0,max:200,sort:'level',page:0});
  render();});
}
