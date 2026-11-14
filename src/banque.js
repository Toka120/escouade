/* Banque d'objets hors ligne (src/items.js, chargé à la demande) et carte DofusDB. */
const bankUi={tab:'0',q:'',min:0,max:200,groups:[],types:[],stats:[],flags:[],setId:'',sort:'name',dir:1,page:0,detail:null,open:['Catégories'],loading:false,error:''};
const BANK_PAGE=50;
const ENC_WEAPONS=['Épée','Marteau','Bâton','Dague','Baguette','Arc','Hache','Pelle','Lance','Faux','Arme magique'];
const ENC_GROUPS=[['amulette','Amulette',['Amulette'],'<path d="M7 3c0 5 2 8 5 9 3-1 5-4 5-9"/><circle cx="12" cy="16" r="4"/>'],['anneau','Anneau',['Anneau'],'<circle cx="12" cy="14" r="6"/><path d="M9 5l3-3 3 3-3 3z"/>'],['arme','Arme',ENC_WEAPONS,'<path d="M14 3h7v7L9 22l-4-4zM5 14l5 5M3 21l3-3"/>'],['bottes','Bottes',['Bottes'],'<path d="M7 3h6v10l7 3v4H5V3z"/>'],['bouclier','Bouclier',['Bouclier'],'<path d="M12 3l8 3v6c0 5-8 9-8 9s-8-4-8-9V6z"/>'],['cape','Cape',['Cape'],'<path d="M8 3h8l4 18H4zM12 3v6"/>'],['ceinture','Ceinture',['Ceinture'],'<rect x="2" y="9" width="20" height="6" rx="1"/><rect x="9" y="8" width="6" height="8" rx="1"/>'],['chapeau','Chapeau',['Chapeau'],'<path d="M3 18h18M6 18c0-6 2-12 6-12s6 6 6 12"/>'],['dofus','Dofus / trophée',['Dofus','Trophée','Prysmaradite'],'<path d="M12 3c-4 0-7 6-7 11a7 7 0 0014 0c0-5-3-11-7-11z"/>'],['familier','Familier',['Familier','Montilier'],'<circle cx="7" cy="10" r="2"/><circle cx="17" cy="10" r="2"/><circle cx="10" cy="5" r="2"/><circle cx="14" cy="5" r="2"/><path d="M7 18c0-3 2-5 5-5s5 2 5 5-2 3-5 3-5 0-5-3z"/>'],['monture','Monture',['Dragodinde','Muldo','Volkorne'],'<path d="M6 21V11a6 6 0 0112 0v10M6 15h3M15 15h3"/>'],['compagnon','Compagnon',['Compagnon'],'<circle cx="12" cy="7" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/>'],['outil','Outil',['Outil','Pioche'],'<path d="M14 4l6 6-3 3-6-6zM11 7L3 15l3 3 8-8"/>'],['percepteur','Percepteur',null,'<path d="M6 3v18M6 4h12l-3 4 3 4H6"/>']];
const ENC_EL=['Neutre','Terre','Feu','Eau','Air'];
const ENC_SECTIONS=[
 ['Caractéristiques primaires',[['PA','PA'],['PM','PM'],['Portée','Portée'],['Invocation','Invocation'],['Vitalité','Vitalité'],['Force','Force'],['Intelligence','Intelligence'],['Chance','Chance'],['Agilité','Agilité'],['Sagesse','Sagesse'],['Puissance','Puissance'],['Critique','% Critique']]],
 ['Caractéristiques secondaires',[['Tacle','Tacle'],['Fuite','Fuite'],['Retrait PA','Retrait PA'],['Esquive PA','Esquive PA'],['Retrait PM','Retrait PM'],['Esquive PM','Esquive PM'],['Initiative','Initiative'],['Soins','Soin'],['Prospection','Prospection'],['Pods','Pod']]],
 ['Dommages',[['Dommages','Dommage'],...ENC_EL.map(e=>[e,'Dommage '+e]),['Critiques','Dommage Critique'],['Poussée','Dommage Poussée'],['Pièges','Dommage Pièges'],['Puissance pièges','Puissance Pièges'],['Renvoi','Dommages Renvoyés'],['% armes',"% Dommages d'armes"],['% sorts','% Dommages aux sorts'],['% distance','% Dommages distance'],['% mêlée','% Dommages mêlée']]],
 ['Résistances',[...ENC_EL.map(e=>['% '+e,'% Résistance '+e]),...ENC_EL.map(e=>[e+' (fixe)','Résistance '+e]),['Critiques','Résistance Critiques'],['Poussée','Résistance Poussée'],['% distance','% Résistance distance'],['% mêlée','% Résistance mêlée']]],
 ['Effets de l’arme',[...ENC_EL.map(e=>['Dommages '+e,'dommages '+e]),...ENC_EL.map(e=>['Vol '+e,'vol '+e]),['Soins','soins Neutre|soins Feu'],['Meilleur élément','dommages du meilleur élément|vol du meilleur élément']]]];
const ENC_TYPE_SECTIONS=[['Catégories d’armes',ENC_WEAPONS],['Catégories de familiers et montures',['Familier','Montilier','Dragodinde','Muldo','Volkorne']],['Catégories de Dofus / trophées',['Dofus','Trophée','Prysmaradite']]];
let bankById=null,bankEffectIdx=null;
function bankLoad(){
 if(window.ESCOUADE_ITEMS||bankUi.loading||bankUi.error)return;bankUi.loading=true;
 const s=document.createElement('script');s.src='items.js';s.onload=()=>{bankUi.loading=false;if(!window.ESCOUADE_ITEMS)bankUi.error='Catalogue illisible dans ce paquet.';if(current()==='objets')render();};s.onerror=()=>{bankUi.loading=false;bankUi.error='Catalogue introuvable dans ce paquet.';s.remove();if(current()==='objets')render();};document.head.append(s);
}
function bankItem(id){if(!bankById){bankById=new Map();for(const it of ESCOUADE_ITEMS.items)bankById.set(it.i,it);}return bankById.get(id)||null;}
const bankName=id=>bankItem(id)?.n||('Objet '+id);
function encEffectIds(names){if(!bankEffectIdx){bankEffectIdx=new Map();ESCOUADE_ITEMS.effects.forEach((n,i)=>bankEffectIdx.set(n,i));}return names.split('|').map(n=>bankEffectIdx.get(n)).filter(x=>x!==undefined);}
const encImgOn=()=>state.settings.itemImages!==false;
function encImg(g,size=32){return encImgOn()&&Number.isSafeInteger(g)&&g>0?`<img class="enc-ic" src="https://api.dofusdu.de/dofus3/v1/img/item/${g}-64.png" width="${size}" height="${size}" loading="lazy" decoding="async" alt="" referrerpolicy="no-referrer">`:`<span class="enc-ic enc-ph" style="width:${size}px;height:${size}px"></span>`;}
function encTypeName(it){return ESCOUADE_ITEMS.types[it.t]||'';}
function bankSlotFor(it){const t=encTypeName(it);if(it.c!==0)return '';if(it.w||ENC_WEAPONS.includes(t)||t==='Outil'||t==='Pioche')return 'Arme';if(t==='Anneau')return state.stuff.slots.find(s=>/^Anneau/.test(s.slot)&&!s.vise)?.slot||'Anneau 1';if(['Dofus','Trophée','Prysmaradite'].includes(t))return state.stuff.slots.find(s=>/^Dofus/.test(s.slot)&&!s.vise)?.slot||'Dofus / Trophée 1';return {Chapeau:'Coiffe',Cape:'Cape',Amulette:'Amulette',Ceinture:'Ceinture',Bottes:'Bottes',Bouclier:'Bouclier',Familier:'Familier / Monture',Montilier:'Familier / Monture',Muldo:'Familier / Monture',Volkorne:'Familier / Monture',Dragodinde:'Familier / Monture'}[t]||'';}
function encGroupTypes(g){const def=ENC_GROUPS.find(x=>x[0]===g);if(!def)return [];return def[2]||ESCOUADE_ITEMS.types.filter(t=>/Percepteur/.test(t));}
function bankResults(){
 const D=ESCOUADE_ITEMS,cat=Number(bankUi.tab),q=norm(bankUi.q.trim());
 const allowed=new Set([...bankUi.groups.flatMap(encGroupTypes),...bankUi.types]);
 const stats=bankUi.stats.map(k=>encEffectIds(k));const f=new Set(bankUi.flags),setId=Number(bankUi.setId)||0;
 let r=D.items.filter(it=>it.c===cat&&it.l>=bankUi.min&&it.l<=bankUi.max&&(!allowed.size||allowed.has(D.types[it.t]))&&
  (!q||norm(it.n).includes(q)||(it.s&&D.sets[it.s]&&norm(D.sets[it.s].n).includes(q)))&&
  stats.every(ids=>(it.e||[]).some(e=>ids.includes(e[0])&&Math.max(e[1],e[2])>0))&&
  (!f.has('craft')||it.r)&&(!f.has('nocraft')||!it.r)&&(!f.has('set')||it.s)&&(!f.has('noset')||!it.s)&&(!setId||it.s===setId));
 const k=bankUi.sort,d=bankUi.dir;
 return r.sort((a,b)=>(k==='level'?(a.l-b.l):k==='type'?encTypeName(a).localeCompare(encTypeName(b),'fr'):0)*d||a.n.localeCompare(b.n,'fr')*(k==='name'?d:1));
}
function bankUsedIn(id){return ESCOUADE_ITEMS.items.filter(it=>it.r&&it.r.some(([x])=>x===id));}
function encPrice(id){const p=state.workshop?.prices?.[id];return p?fmt(p)+' K':'';}
function bankSetCard(sid){
 const D=ESCOUADE_ITEMS,s=D.sets[sid];if(!s)return '';const pieces=D.items.filter(it=>it.s===Number(sid));
 return `<div><h3>${esc(s.n)} <small>niveau ${s.l} · ${s.q} objets</small></h3><ul class="list">${pieces.map(p=>`<li class="enc-line">${encImg(p.g,24)}<button class="btn small" data-bank="detail" data-id="${p.i}">${esc(p.n)}</button> <span class="s">${esc(encTypeName(p))} · niv. ${p.l}</span></li>`).join('')}</ul>${Object.keys(s.b).length?`<h3>Bonus de panoplie</h3>${gtable(['Objets','Bonus'],Object.entries(s.b).map(([n,b])=>`<tr><td>${esc(n)}</td><td>${b.map(esc).join(' · ')}</td></tr>`))}`:''}</div>`;
}
function bankDetail(it){
 const D=ESCOUADE_ITEMS,slot=bankSlotFor(it),used=bankUsedIn(it.i);
 return `<section class="card" style="margin-bottom:16px" id="bank-detail"><div class="enc-line" style="gap:12px">${encImg(it.g,56)}<div><h2 style="margin:0">${esc(it.n)}</h2><p style="margin:4px 0 0">${esc(D.categories[it.c])} · ${esc(encTypeName(it))} · niveau ${it.l} · ${fmt(it.p)} pod${it.p>1?'s':''}${encPrice(it.i)?' · prix noté '+encPrice(it.i):''}</p></div></div>`+
 (it.w?`<p><strong>Arme :</strong> ${it.w[0]} PA · portée ${it.w[1]===it.w[2]?it.w[1]:it.w[1]+' à '+it.w[2]} · critique ${it.w[3]} % (+${it.w[4]}) · ${it.w[5]} utilisation(s) par tour</p>`:'')+
 `<div class="grid g2" style="gap:16px;align-items:start"><div><h3>Effets</h3>${it.e?`<ul class="list">${it.e.map(e=>`<li>${esc(e[3])}</li>`).join('')}</ul>`:'<p class="s">Aucun effet chiffré.</p>'}${it.k?`<h3>Conditions</h3><ul class="list">${it.k.map(c=>`<li>${esc(c)}</li>`).join('')}</ul>`:''}</div>`+
 `<div><h3>Recette</h3>${it.r?`<ul class="list">${it.r.map(([id,q])=>{const x=bankItem(id);return `<li class="enc-line">${encImg(x?.g,24)}${fmt(q)} × ${x?`<button class="btn small" data-bank="detail" data-id="${id}">${esc(x.n)}</button>`:esc(bankName(id))}</li>`;}).join('')}</ul><form class="form f3" data-bank-form="craft" style="margin-top:8px"><label>Quantité<input name="qty" type="number" min="1" max="10000" value="1"></label><button class="btn primary">Ajouter aux crafts</button></form>`:'<p class="s">Pas de recette : objet obtenu autrement.</p>'}`+
 (used.length?`<h3>Utilisé dans ${used.length} recette${used.length>1?'s':''}</h3><ul class="list">${used.slice(0,25).map(u=>`<li class="enc-line">${encImg(u.g,24)}<button class="btn small" data-bank="detail" data-id="${u.i}">${esc(u.n)}</button> <span class="s">niv. ${u.l}</span></li>`).join('')}</ul>${used.length>25?`<p class="s">… et ${used.length-25} autres.</p>`:''}`:'')+`</div></div>`+
 (it.s?`<div style="margin-top:12px">${bankSetCard(it.s)}</div>`:'')+
 (slot?`<form class="form f3" data-bank-form="target" style="margin-top:12px"><label>Emplacement du stuff<select name="slot">${state.stuff.slots.map(s=>`<option ${s.slot===slot?'selected':''}>${esc(s.slot)}</option>`).join('')}</select></label><button class="btn">Viser cet objet pour ${esc(persoLabel(activeP()))}</button></form>`:'')+
 `<p class="s" style="margin-top:8px"><a href="https://dofusdb.fr/fr/database/object/${it.i}" target="_blank" rel="noopener">Fiche DofusDB (obtention, détails)</a> · <button class="btn small" data-bank="close">Fermer</button></p></section>`;
}
function encMounts(){
 const D=ESCOUADE_ITEMS,q=norm(bankUi.q.trim()),list=D.mounts.filter(m=>!q||norm(m.n).includes(q)||norm(m.f).includes(q)).sort((a,b)=>a.n.localeCompare(b.n,'fr'));
 return `<section class="card"><h2>${fmt(list.length)} monture(s)</h2>${gtable(['Monture','Famille','Effets'],list.slice(0,300).map(m=>`<tr><td><span class="enc-line">${encImg(m.g)}<strong style="text-decoration:none">${esc(m.n)}</strong></span></td><td>${esc(m.f)}</td><td class="s">${m.e.map(esc).join(' · ')}</td></tr>`))}</section>`;
}
function encResults(){
 if(bankUi.tab==='m')return encMounts();
 const r=bankResults(),pages=Math.max(1,Math.ceil(r.length/BANK_PAGE));bankUi.page=Math.min(bankUi.page,pages-1);
 const rows=r.slice(bankUi.page*BANK_PAGE,(bankUi.page+1)*BANK_PAGE),it=bankUi.detail?bankItem(bankUi.detail):null,D=ESCOUADE_ITEMS;
 const th=(k,l)=>`<th><button class="enc-sort" data-bank="sort" data-k="${k}" aria-label="Trier par ${l}">${l}${bankUi.sort===k?(bankUi.dir>0?' ▲':' ▼'):''}</button></th>`;
 return (it?bankDetail(it):'')+`<section class="card"><div class="table-wrap"><table class="enc-table"><thead><tr>${th('name','Nom')}${th('type','Catégorie')}<th>Obtention</th>${th('level','Niveau')}<th>Prix noté</th><th></th></tr></thead><tbody>${rows.map(x=>`<tr><td><span class="enc-line">${encImg(x.g)}<strong style="text-decoration:none">${esc(x.n)}</strong></span></td><td>${x.s&&D.sets[x.s]?`<span title="${esc(D.sets[x.s].n)}" aria-label="Panoplie">${icon('opti',14)}</span> `:''}${esc(encTypeName(x))}</td><td>${x.r?`<span title="Fabricable" aria-label="Fabricable">${icon('crafts',16)}</span>`:''}</td><td class="num">${x.l}</td><td class="num">${encPrice(x.i)||'—'}</td><td><button class="btn small" data-bank="detail" data-id="${x.i}">Détails</button></td></tr>`).join('')}</tbody></table></div>${rows.length?'':'<p>Aucun objet ne correspond à ces critères.</p>'}`+
 `<div style="display:flex;gap:8px;align-items:center;justify-content:space-between;margin-top:12px;flex-wrap:wrap"><span class="s" id="enc-count">${fmt(r.length)} élément(s) correspondant à tes critères${pages>1?` · page ${bankUi.page+1}/${pages}`:''}</span><span>${pages>1?`<button class="btn small" data-bank="prev" ${bankUi.page?'':'disabled'}>Précédent</button> <button class="btn small" data-bank="next" ${bankUi.page<pages-1?'':'disabled'}>Suivant</button>`:''}</span></div></section>`;
}
function encDetails(title,body){return `<details class="enc-sec" data-sec="${esc(title)}" ${bankUi.open.includes(title)?'open':''}><summary>${esc(title)}</summary>${body}</details>`;}
function encChecks(kind,list){return `<div class="enc-checks">${list.map(([label,val])=>`<label><input type="checkbox" data-enc="${kind}" value="${esc(val)}" ${(kind==='stat'?bankUi.stats:kind==='type'?bankUi.types:bankUi.flags).includes(val)?'checked':''}> ${esc(label)}</label>`).join('')}</div>`;}
function encSidebar(){
 const D=ESCOUADE_ITEMS,cat=Number(bankUi.tab);
 if(bankUi.tab==='m')return `<label class="f">Rechercher<input data-enc="q" value="${esc(bankUi.q)}" placeholder="Nom ou famille"></label>`;
 const typesHere=[...new Set(D.items.filter(x=>x.c===cat).map(x=>D.types[x.t]))];const count=t=>D.items.filter(x=>x.c===cat&&D.types[x.t]===t).length;
 let html=`<label class="f">Rechercher<input data-enc="q" value="${esc(bankUi.q)}" placeholder="Nom ou panoplie"></label><div class="enc-lv">Niveaux de <input data-enc="min" type="number" min="0" max="200" value="${bankUi.min}" aria-label="Niveau minimum"> à <input data-enc="max" type="number" min="0" max="200" value="${bankUi.max}" aria-label="Niveau maximum"> <button class="btn small" data-bank="mine" type="button">Mon niveau</button></div>`;
 if(cat===0){
  html+=encDetails('Catégories',`<div class="enc-groups">${ENC_GROUPS.map(([k,l,,svg])=>`<button type="button" class="enc-group ${bankUi.groups.includes(k)?'on':''}" data-bank="group" data-g="${k}" title="${l}" aria-label="${l}" aria-pressed="${bankUi.groups.includes(k)}"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${svg}</svg></button>`).join('')}</div>`);
  for(const[title,list]of ENC_SECTIONS)html+=encDetails(title,encChecks('stat',list.map(([l,v])=>[l,v]).filter(([,v])=>encEffectIds(v).length)));
  for(const[title,list]of ENC_TYPE_SECTIONS)html+=encDetails(title,encChecks('type',list.filter(t=>typesHere.includes(t)).map(t=>[t+' ('+count(t)+')',t])));
  html+=encDetails('Catégories d’équipement',encChecks('type',typesHere.sort((a,b)=>a.localeCompare(b,'fr')).map(t=>[t+' ('+count(t)+')',t])));
 }else html+=encDetails('Catégories',encChecks('type',typesHere.sort((a,b)=>count(b)-count(a)).map(t=>[t+' ('+count(t)+')',t])));
 html+=encDetails('Moyens d’obtention',encChecks('flag',[['Fabricable (recette)','craft'],['Non fabricable','nocraft']]));
 if(cat===0)html+=encDetails('Panoplie',encChecks('flag',[['Fait partie d’une panoplie','set'],['Hors panoplie','noset']])+`<label class="f">Panoplie précise<select data-enc="setId"><option value="">Toutes</option>${Object.entries(D.sets).sort((a,b)=>a[1].n.localeCompare(b[1].n,'fr')).map(([id,s])=>`<option value="${id}" ${bankUi.setId===id?'selected':''}>${esc(s.n)} (niv. ${s.l})</option>`).join('')}</select></label>`);
 return html+`<label class="enc-img"><input type="checkbox" data-enc="images" ${encImgOn()?'checked':''}> Images des objets (Internet)</label><button class="btn small" data-bank="reset" type="button" style="width:100%;margin-top:8px">Réinitialiser les filtres</button>`;
}
function vObjets(){
 if(!window.ESCOUADE_ITEMS){bankLoad();return head('Hors ligne','Encyclopédie','Tous les objets du jeu, recherchables sans connexion.')+`<section class="card"><p role="status">${esc(bankUi.error||'Chargement de l’encyclopédie…')}</p></section>`;}
 const D=ESCOUADE_ITEMS,counts=D.categories.map((_,i)=>D.items.filter(x=>x.c===i).length);
 const order=[0,2,1,4,3];
 const tabs=`<div class="enc-tabs" role="tablist" aria-label="Catégories d’objets">${order.map(i=>`<button class="enc-tab ${bankUi.tab===String(i)?'on':''}" role="tab" aria-selected="${bankUi.tab===String(i)}" data-bank="tab" data-tab="${i}">${esc(D.categories[i])} <small>${fmt(counts[i])}</small></button>`).join('')}<button class="enc-tab ${bankUi.tab==='m'?'on':''}" data-bank="tab" data-tab="m">Montures <small>${fmt(D.mounts.length)}</small></button></div>`;
 return `<style>.enc-tabs{display:flex;flex-direction:row;justify-content:center;gap:4px;flex-wrap:wrap;border-bottom:1px solid var(--line);margin-bottom:16px}.enc-tab{width:auto;flex:0 0 auto;display:inline-block;background:none;border:0;border-bottom:2px solid transparent;color:var(--muted);padding:10px 14px;font:inherit;font-weight:700;letter-spacing:.04em;text-transform:uppercase;font-size:13px;cursor:pointer}.enc-tab.on{color:var(--gold);border-bottom-color:var(--gold)}.enc-tab small{font-weight:400;color:var(--muted)}.enc-grid{display:grid;grid-template-columns:270px 1fr;gap:16px;align-items:start}@media(max-width:980px){.enc-grid{grid-template-columns:1fr}}.enc-side{position:sticky;top:12px;max-height:calc(100vh - 40px);overflow:auto}.enc-sec{border-top:1px solid var(--line);padding:6px 0}.enc-sec summary{cursor:pointer;font-weight:700;font-size:12px;letter-spacing:.06em;text-transform:uppercase;padding:6px 0}.enc-checks{display:grid;gap:2px;padding:4px 0 8px}.enc-checks label{display:flex;gap:8px;align-items:center;font-size:14px;margin:0}.enc-groups{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;padding:6px 0}.enc-group{aspect-ratio:1;border:1px solid var(--line);border-radius:8px;background:var(--surface-2);color:var(--muted);cursor:pointer;display:grid;place-items:center}.enc-group.on{border-color:var(--gold);color:var(--gold);background:var(--gold-soft)}.enc-lv{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin:8px 0;font-size:14px}.enc-lv input{width:64px}.enc-line{display:inline-flex;align-items:center;gap:8px}.enc-ic{flex:none;border-radius:6px;object-fit:contain}.enc-ph{display:inline-block;background:var(--surface-2)}.enc-sort{background:none;border:0;color:inherit;font:inherit;cursor:pointer;padding:0}.enc-table td{vertical-align:middle}.enc-img{display:flex;gap:8px;align-items:center;font-size:13px;margin-top:10px}</style>`+
 head('Hors ligne','Encyclopédie',`${fmt(D.items.length)} objets, ${fmt(Object.keys(D.sets).length)} panoplies et ${fmt(D.mounts.length)} montures du jeu ${esc(D.game?.version||'')}. Filtre comme à l’hôtel des ventes ; tout fonctionne sans connexion, sauf les images.`)+
 tabs+`<div class="enc-grid"><aside class="card enc-side" aria-label="Filtres">${encSidebar()}</aside><div id="enc-results">${encResults()}</div></div>`+
 `<p class="s" style="margin-top:12px">Données publiques du jeu via <a href="https://api.dofusdu.de/" target="_blank" rel="noopener">Dofusdude</a>. Les images sont affichées depuis leur serveur quand Internet est disponible ; elles ne sont pas incluses dans Escouade. Application indépendante, non affiliée à Ankama.</p>`;
}
function encRefresh(){const el=document.getElementById('enc-results');if(el)el.innerHTML=encResults();else render();}
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
 document.addEventListener('error',e=>{if(e.target?.classList?.contains('enc-ic'))e.target.style.visibility='hidden';},true);
 main.addEventListener('toggle',e=>{const d=e.target.closest?.('.enc-sec');if(!d)return;const t=d.dataset.sec;bankUi.open=d.open?[...new Set([...bankUi.open,t])]:bankUi.open.filter(x=>x!==t);},true);
 main.addEventListener('input',e=>{const k=e.target.dataset?.enc;if(k!=='q')return;bankUi.q=e.target.value.slice(0,80);bankUi.page=0;encRefresh();});
 main.addEventListener('change',e=>{const k=e.target.dataset?.enc;if(!k||k==='q')return;
  if(k==='min'||k==='max'){const v=Math.max(0,Math.min(200,Math.round(Number(e.target.value)||0)));bankUi[k]=v;if(bankUi.min>bankUi.max){if(k==='min')bankUi.max=v;else bankUi.min=v;}}
  else if(k==='setId')bankUi.setId=e.target.value;
  else if(k==='images'){state.settings.itemImages=e.target.checked;persist();render();return;}
  else{const list=k==='stat'?'stats':k==='type'?'types':'flags';const v=e.target.value;bankUi[list]=e.target.checked?[...new Set([...bankUi[list],v])]:bankUi[list].filter(x=>x!==v);}
  bankUi.page=0;bankUi.detail=null;encRefresh();});
 main.addEventListener('submit',e=>{const f=e.target.dataset.bankForm||e.target.dataset.mapForm;if(!f)return;e.preventDefault();e.stopImmediatePropagation();const d=Object.fromEntries(new FormData(e.target));
  if(f==='craft'){const it=bankItem(bankUi.detail);if(!it?.r)return;if(state.workshop.crafts.length>=200){toast('Limite de 200 crafts');return;}const qty=Math.max(1,Math.min(10000,Math.round(Number(d.qty)||1)));state.workshop.crafts.push({id:uid(),name:it.n,qty,ingredients:it.r.map(([id,q])=>({itemId:id,name:bankName(id),qty:q}))});persist();toast('Recette ajoutée aux crafts : '+it.n+' × '+qty);return;}
  if(f==='target'){const it=bankItem(bankUi.detail),s=state.stuff.slots.find(x=>x.slot===d.slot);if(!it||!s)return;s.vise=it.n;persist();toast(it.n+' visé en '+s.slot+' pour '+persoLabel(activeP()));return;}
  if(f==='travel'){const x=Math.round(Number(d.x)),y=Math.round(Number(d.y));if(!Number.isFinite(x)||!Number.isFinite(y)||Math.abs(x)>200||Math.abs(y)>200){toast('Coordonnées invalides');return;}mapUi.x=String(x);mapUi.y=String(y);copyText(`/travel ${x},${y}`);}
 },true);
 main.addEventListener('click',e=>{const el=e.target.closest('[data-bank]');if(!el)return;const a=el.dataset.bank;
  if(a==='detail'){bankUi.detail=Number(el.dataset.id);encRefresh();document.getElementById('bank-detail')?.scrollIntoView({block:'start'});return;}
  if(a==='close'){bankUi.detail=null;encRefresh();return;}
  if(a==='prev'){bankUi.page=Math.max(0,bankUi.page-1);encRefresh();return;}
  if(a==='next'){bankUi.page++;encRefresh();return;}
  if(a==='sort'){const k=el.dataset.k;if(bankUi.sort===k)bankUi.dir=-bankUi.dir;else{bankUi.sort=k;bankUi.dir=1;}encRefresh();return;}
  if(a==='group'){const g=el.dataset.g;bankUi.groups=bankUi.groups.includes(g)?bankUi.groups.filter(x=>x!==g):[...bankUi.groups,g];el.classList.toggle('on',bankUi.groups.includes(g));el.setAttribute('aria-pressed',String(bankUi.groups.includes(g)));bankUi.page=0;bankUi.detail=null;encRefresh();return;}
  if(a==='mine'){const n=state.perso.niveau;bankUi.min=Math.max(0,n-10);bankUi.max=Math.min(200,Math.max(bankUi.min,n+5));bankUi.page=0;render();return;}
  if(a==='tab'){Object.assign(bankUi,{tab:el.dataset.tab,q:'',groups:[],types:[],stats:[],flags:[],setId:'',page:0,detail:null});render();return;}
  if(a==='reset'){Object.assign(bankUi,{q:'',min:0,max:200,groups:[],types:[],stats:[],flags:[],setId:'',sort:'name',dir:1,page:0,detail:null});render();return;}
 });
}
