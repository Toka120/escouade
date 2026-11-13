/* Detachable same-origin views. A native child owns its bridge, not its parent's token. */
const widgetParams=new URLSearchParams(location.search);
try{const packed=location.hash.slice(1).split('~')[1];if(packed){const data=JSON.parse(atob(packed.replace(/-/g,'+').replace(/_/g,'/')));for(const key of ['block','view'])if(typeof data[key]==='string')widgetParams.set(key,data[key]);}}catch(e){}
const IS_WIDGET=widgetParams.get('widget')==='1';
let widgetBlock=widgetParams.get('block')||'',widgetTop=true,widgetSmall=false,widgetFold=false;
let widgetSyncBase=null,widgetSyncTimer=null,widgetLastPage='';
const jsonCopy=x=>x===undefined?undefined:JSON.parse(JSON.stringify(x));
// Apply only local edits onto the freshest save, preserving edits made in another window.
function mergeWindowEdits(base,local,remote){
 if(JSON.stringify(base)===JSON.stringify(local))return jsonCopy(remote);
 if(Array.isArray(base)&&Array.isArray(local)&&Array.isArray(remote)){
  const keyed=[...base,...local,...remote].every(x=>x&&typeof x==='object'&&typeof x.id==='string');
  if(!keyed)return jsonCopy(local);
  const bm=new Map(base.map(x=>[x.id,x])),lm=new Map(local.map(x=>[x.id,x]));
  let out=remote.filter(x=>!bm.has(x.id)||lm.has(x.id)).map(x=>lm.has(x.id)?mergeWindowEdits(bm.get(x.id),lm.get(x.id),x):jsonCopy(x));
  for(const x of local)if(!bm.has(x.id)&&!out.some(r=>r.id===x.id))out.push(jsonCopy(x));
  const oldOrder=base.filter(x=>lm.has(x.id)).map(x=>x.id).join(','),newOrder=local.filter(x=>bm.has(x.id)).map(x=>x.id).join(',');
  if(oldOrder!==newOrder){const order=new Map(local.map((x,i)=>[x.id,i]));out.sort((a,b)=>(order.get(a.id)??1e9)-(order.get(b.id)??1e9));}
  return out;
 }
 if(base&&local&&remote&&typeof base==='object'&&typeof local==='object'&&typeof remote==='object'&&!Array.isArray(base)&&!Array.isArray(local)&&!Array.isArray(remote)){
  const out=jsonCopy(remote);
  for(const key of new Set([...Object.keys(base),...Object.keys(local)])){
   if(['__proto__','prototype','constructor'].includes(key))continue;
   if(!Object.hasOwn(local,key)){if(Object.hasOwn(base,key))delete out[key];}
   else if(!Object.hasOwn(base,key))out[key]=jsonCopy(local[key]);
   else out[key]=mergeWindowEdits(base[key],local[key],remote[key]);
  }
  return out;
 }
 return jsonCopy(local);
}
function reconcileWindowSave(){
 if(!widgetSyncBase)return;
 try{const remote=JSON.parse(localStorage.getItem(LS_KEY)||'null');if(remote?.v===3&&validSave(remote)){
  const local=JSON.parse(JSON.stringify(state));
  state=merge(mergeWindowEdits(widgetSyncBase,local,remote));
 }}catch(e){/* persist handles local write failures and recovery. */}
}
function markWindowSaved(){widgetSyncBase=JSON.parse(JSON.stringify(state));}
function widgetSections(container){
 const all=[...container.querySelectorAll('.card,.table-wrap,.step')].filter(el=>!el.closest('.widget-tools'));
 const used=new Map();
 return all.map(el=>{
  const step=el.matches('.step')?el.querySelector('input[data-act="etape"]')?.dataset.n:null;
  const heading=[...el.querySelectorAll('h2,h3')].find(h=>h.closest('.card,.table-wrap,.step')===el);
  let label=step?'Étape '+step+' · '+(el.querySelector('.t')?.textContent||''):heading?.textContent.trim();
  if(!label&&el.matches('.table-wrap'))label=[...el.querySelectorAll('thead th')].slice(0,3).map(x=>x.textContent.trim()).join(' / ');
  if(!label)label=el.querySelector('label')?.textContent.trim()||el.querySelector('p')?.textContent.trim()||'Bloc';
  label=label.replace(/\s+/g,' ').slice(0,100);
  const key=step?'step-'+step:('block-'+label.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9]+/g,'-').toLowerCase());
  const n=used.get(key)||0;used.set(key,n+1);el.dataset.widgetKey=key+'-'+n;
  return {key:el.dataset.widgetKey,label,el};
 });
}
function widgetLink(tab,block='',view=''){
 if(!TABS.some(t=>t[0]===tab))throw Error('Rubrique inconnue');
 const url=new URL(IS_WIDGET?location.href:'widget.html',location.href);
 // Neutralino 6.4 quotes only arguments containing spaces. Keep the launch URL
 // free of shell metacharacters such as '&' by packing options into a URL-safe fragment.
 url.search='?widget=1';url.hash=tab+((block||view)?'~'+btoa(JSON.stringify({block,view})).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''):'');return url.href;
}
async function openWidget(tab,block=''){
 if(persist()===false)return;
 const label=TABS.find(t=>t[0]===tab)[1],view=uid();
 try{localStorage.setItem('escouade-widget-view-'+view,JSON.stringify({at:Date.now(),ui:guideUi,results:guideResults,detail:guideDetail,days:almanaxDays,hunt:huntResult}));}catch(e){}
 const url=widgetLink(tab,block,view);
 if(!desktop){const w=window.open(url,'_blank','popup,width=480,height=700');if(!w)toast('Autorise les fenêtres pour afficher cet aperçu');else toast('Aperçu ouvert. Le premier plan permanent est disponible dans la version Windows.');return;}
 try{
  // The page is served by the parent for shared localStorage/BroadcastChannel.
  // The child injects its own bridge at document start and owns a random native API port.
  await Neutralino.window.create(url,{title:'Escouade · '+label+' · Widget',width:480,height:700,minWidth:320,minHeight:220,resizable:true,alwaysOnTop:true,exitProcessOnClose:true,injectGlobals:false,injectClientLibrary:true,processArgs:'--port=0 --window-id=W_'+uid().replace(/[^a-zA-Z0-9]/g,'')});
  toast('Widget '+label+' ouvert au premier plan');
 }catch(e){toast('Ouverture du widget impossible : '+(e.message||e.code||'erreur'));}
}
function renderWidgetTools(container){
 const tab=current(),label=TABS.find(t=>t[0]===tab)[1],sections=widgetSections(container);
 if(IS_WIDGET){
  document.body.classList.add('widget-mode');document.body.classList.toggle('widget-small',widgetSmall);document.body.classList.toggle('widget-fold',widgetFold);
  if(widgetLastPage&&widgetLastPage!==tab)widgetBlock='';widgetLastPage=tab;
  let selected=widgetBlock==='next'?null:sections.find(s=>s.key===widgetBlock)?.el;
  if(widgetBlock==='next'&&tab==='parcours'){const nx=nextEtape();selected=nx?sections.find(s=>s.key==='step-'+nx.n+'-0')?.el:null;}
  if(widgetBlock){
   const alerts=[...container.querySelectorAll('[role="alert"]')].map(x=>x.cloneNode(true));
   if(selected){const node=selected.cloneNode(true);container.replaceChildren(...alerts,node);if(node.matches('.step')){const list=document.createElement('ul');list.className='list steps card';node.replaceWith(list);list.append(node);}}
   else{container.replaceChildren(...alerts);const empty=document.createElement('section');empty.className='card';empty.textContent=widgetBlock==='next'?'Toutes les étapes suivies sont terminées.':'Ce bloc n’est plus affiché. Choisis « Page entière » ou un autre bloc.';container.append(empty);}
  }
  const bar=document.createElement('header');bar.className='widget-tools';bar.innerHTML=`<div class="widget-title"><b>ESCOUADE · ${esc(label)}</b><span>${esc(persoLabel(activeP()))} · perso actif partagé</span></div><div class="widget-row"><label class="sr-only" for="widget-page">Rubrique du widget</label><select id="widget-page">${TABS.map(([k,l])=>`<option value="${k}" ${tab===k?'selected':''}>${l}</option>`).join('')}</select><button class="btn ${widgetTop?'primary':''}" data-widget="top" ${desktop?'':'disabled'} aria-pressed="${widgetTop}" title="Garder la fenêtre au-dessus des autres">${widgetTop?'📌 Épinglé':'Épingler'}</button><button class="btn" data-widget="fold" aria-expanded="${!widgetFold}">${widgetFold?'Déplier':'Replier'}</button></div><div class="widget-row"><label class="sr-only" for="widget-block">Contenu affiché</label><select id="widget-block"><option value="">Page entière</option>${tab==='parcours'?`<option value="next" ${widgetBlock==='next'?'selected':''}>Prochaine étape de quête</option>`:''}${sections.map(s=>`<option value="${esc(s.key)}" ${s.key===widgetBlock?'selected':''}>${esc(s.label)}</option>`).join('')}</select><button class="btn" data-widget="small" aria-pressed="${widgetSmall}">Texte ${widgetSmall?'normal':'compact'}</button><button class="btn" data-widget="duplicate" title="Ouvrir un autre widget">＋</button></div><p class="widget-hint">${desktop?'Déplace la fenêtre par sa barre de titre et redimensionne ses bords. Garde Escouade ouverte, éventuellement réduite.':'Aperçu navigateur : le premier plan permanent nécessite Escouade Windows.'}</p>`;
  container.before(bar);
  if(desktop)Neutralino.window.setTitle('Escouade · '+label+' · Widget').catch(()=>{});
 }else{
  const bar=document.createElement('section');bar.className='widget-launch';bar.innerHTML=`<span>Garder ${esc(label)} par-dessus Dofus</span><label class="sr-only" for="widget-pick">Contenu à détacher</label><select id="widget-pick"><option value="">Page entière</option>${tab==='parcours'?'<option value="next">Prochaine étape de quête</option>':''}${sections.map(s=>`<option value="${esc(s.key)}">${esc(s.label)}</option>`).join('')}</select><button class="btn" data-widget="open">📌 Épingler en widget</button>`;container.prepend(bar);
 }
}
function applyWidgetView(){
 document.querySelector('.widget-tools')?.remove();renderWidgetTools(document.getElementById('main'));
}
function installWidgetEvents(){
 if(IS_WIDGET){
  const key='escouade-widget-view-'+widgetParams.get('view');
  try{const seed=JSON.parse(localStorage.getItem(key)||'null');localStorage.removeItem(key);if(seed&&Date.now()-seed.at<300000){
   for(const k of Object.keys(guideUi))if(seed.ui?.[k]&&typeof seed.ui[k]==='object')guideUi[k]=seed.ui[k];
   if(Array.isArray(seed.results))guideResults=seed.results;
   if(seed.detail&&typeof seed.detail.name==='string'&&Array.isArray(seed.detail.ingredients))guideDetail=seed.detail;
   if(Array.isArray(seed.days))almanaxDays=seed.days;
   if(seed.hunt&&Array.isArray(seed.hunt.matches))huntResult=seed.hunt;
  }}catch(e){}
 }
 markWindowSaved();
 document.addEventListener('click',async e=>{const el=e.target.closest('[data-widget]');if(!el)return;const a=el.dataset.widget;
  if(a==='open'){await openWidget(current(),document.getElementById('widget-pick')?.value||'');return;}
  if(a==='duplicate'){await openWidget(current(),widgetBlock);return;}
  if(a==='top'){try{await Neutralino.window.setAlwaysOnTop(!widgetTop);widgetTop=!widgetTop;render();}catch(e){toast('Impossible de modifier le premier plan');}return;}
  if(a==='small')widgetSmall=!widgetSmall;
  if(a==='fold')widgetFold=!widgetFold;
  render();
 });
 document.addEventListener('change',e=>{
  if(e.target.id==='widget-page'){widgetBlock='';const u=new URL(location.href);u.searchParams.delete('block');u.hash=e.target.value;history.replaceState(null,'',u);render();window.scrollTo(0,0);}
  if(e.target.id==='widget-block'){widgetBlock=e.target.value;const u=new URL(location.href);if(widgetBlock)u.searchParams.set('block',widgetBlock);else u.searchParams.delete('block');history.replaceState(null,'',u);render();window.scrollTo(0,0);}
 });
 function receive(){
  try{const raw=localStorage.getItem(LS_KEY);if(!raw)return;const data=JSON.parse(raw);if(!validSave(data))return;
   const pending=mergeWindowEdits(widgetSyncBase,JSON.parse(JSON.stringify(state)),data);state=merge(pending);widgetSyncBase=jsonCopy(data);
   if(document.activeElement?.matches('input:not([type="checkbox"]),textarea,select')&&document.hasFocus()){
    clearTimeout(widgetSyncTimer);widgetSyncTimer=setTimeout(receive,1000);return;
   }
   const scroll=window.scrollY;render();window.scrollTo(0,scroll);setSync('local');
  }catch(e){/* Never overwrite a malformed external save. */}
 }
 window.addEventListener('storage',e=>{if(e.key===LS_KEY)receive();});
 if(IS_WIDGET)window.addEventListener('focus',receive);
}
