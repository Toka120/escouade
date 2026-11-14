/* Local, explicitly reviewed readings. Images and OCR drafts never enter saved state. */
const SCAN_GROUPS=[
 ['Général',{niveau:'Niveau',pv:'Points de vie',pa:'PA',pm:'PM',po:'Portée',initiative:'Initiative',prospection:'Prospection',invocations:'Invocations',pods:'Pods affichés',points:'Points à répartir'}],
 ['Caractéristiques',{vitalite:'Vitalité',sagesse:'Sagesse',force:'Force',intelligence:'Intelligence',chance:'Chance',agilite:'Agilité'}],
 ['Secondaires',{critique:'Critique',puissance:'Puissance',soins:'Soins',tacle:'Tacle',fuite:'Fuite',esquivePA:'Esquive PA',esquivePM:'Esquive PM',retraitPA:'Retrait PA',retraitPM:'Retrait PM'}],
 ['Dommages',{dommages:'Dommages',domNeutre:'Dommages neutre',domTerre:'Dommages terre',domFeu:'Dommages feu',domEau:'Dommages eau',domAir:'Dommages air',domCritique:'Dommages critiques',domPoussee:'Dommages poussée',domPieges:'Dommages pièges',puissancePieges:'Puissance pièges',renvoi:'Renvoi',pctDomArmes:'% Dommages armes',pctDomSorts:'% Dommages sorts',pctDomDistance:'% Dommages distance',pctDomMelee:'% Dommages mêlée'}],
 ['Résistances',{resNeutre:'Résistance neutre',resTerre:'Résistance terre',resFeu:'Résistance feu',resEau:'Résistance eau',resAir:'Résistance air',pctNeutre:'Résistance % neutre',pctTerre:'Résistance % terre',pctFeu:'Résistance % feu',pctEau:'Résistance % eau',pctAir:'Résistance % air',resCritique:'Résistance critique',resPoussee:'Résistance poussée',pctResDistance:'% Résistance distance',pctResMelee:'% Résistance mêlée',pctResSorts:'% Résistance sorts',pctResArmes:'% Résistance armes'}],
 ['Progression',{kamas:'Kamas inventaire',xpRestante:'XP restante',xpPourcent:'Progression XP %',bonusXP:'Bonus XP %'}]];
const SCAN_FIELDS=Object.assign({},...SCAN_GROUPS.map(g=>g[1]));
const SCAN_NONNEG=new Set(['niveau','pv','pods','points','kamas','xpRestante','xpPourcent','bonusXP','invocations','prospection']);
const SCAN_MAX={niveau:200,xpPourcent:100};
const SCAN_ELEMENTS=['Neutre','Terre','Feu','Eau','Air'];
const scanMin=k=>SCAN_NONNEG.has(k)?(k==='niveau'?1:0):-1e6;
function validScanValues(values){return !!values&&typeof values==='object'&&!Array.isArray(values)&&Object.entries(values).every(([k,v])=>Object.hasOwn(SCAN_FIELDS,k)&&Number.isSafeInteger(v)&&v>=scanMin(k)&&v<=(SCAN_MAX[k]||1e12));}
function validScan(s){
 if(s===undefined)return true;
 if(!s||typeof s!=='object'||Array.isArray(s)||s.schema!=='escouade.scan.v1'||typeof s.nom!=='string'||s.nom.length>80||!Number.isSafeInteger(s.at)||s.at<0||!validScanValues(s.values))return false;
 if(s.classe!==undefined&&(typeof s.classe!=='string'||(typeof CLASSES==='object'&&!Object.hasOwn(CLASSES,s.classe))))return false;
 return Array.isArray(s.resources)&&s.resources.length<=500&&s.resources.every(r=>r&&typeof r.name==='string'&&r.name.length>0&&r.name.length<=150&&Number.isSafeInteger(r.qty)&&r.qty>=0&&r.qty<=1e9);
}
function validScanHistory(h){return h===undefined||(Array.isArray(h)&&h.length<=60&&h.every(x=>x&&typeof x==='object'&&!Array.isArray(x)&&Number.isSafeInteger(x.at)&&x.at>=0&&validScanValues(x.values)));}

/* ---------- Reading Dofus panels: aliases, sections and rows ---------- */
const scanNorm=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[’'`]/g,' ').replace(/[^a-z0-9% ]+/g,' ').replace(/\s+/g,' ').trim();
const SCAN_ALIASES=(()=>{
 const a={niveau:['niveau','niv','lvl','level'],pv:['points de vie','point de vie','pv','pdv','vie'],pa:['points d action','point d action','pa'],pm:['points de mouvement','point de mouvement','pm'],po:['portee','po'],
  initiative:['initiative','ini'],prospection:['prospection','pp'],invocations:['invocations','invocation','invoc','invocs'],pods:['pods','pods affiches'],points:['capital','points restants','points a repartir','points de caracteristiques','points de carac'],
  vitalite:['vitalite','vita'],sagesse:['sagesse','sag'],force:['force'],intelligence:['intelligence','intel'],chance:['chance'],agilite:['agilite','agi'],
  critique:['critique','coups critiques','coup critique','% critique','critiques','crit'],puissance:['puissance'],soins:['soins','soin'],tacle:['tacle'],fuite:['fuite'],
  esquivePA:['esquive pa','esquive des pa','esq pa'],esquivePM:['esquive pm','esquive des pm','esq pm'],retraitPA:['retrait pa','retrait des pa','ret pa'],retraitPM:['retrait pm','retrait des pm','ret pm'],
  dommages:['dommages','dommage','do'],domCritique:['dommages critiques','dommage critique','dommages critique','do critiques','do crit'],domPoussee:['dommages poussee','dommages de poussee','dommage poussee','do poussee'],
  domPieges:['dommages pieges','dommages aux pieges','do pieges'],puissancePieges:['puissance pieges','puissance aux pieges','puissance des pieges'],renvoi:['renvoi','renvoie','renvoi dommages','renvoie dommages','renvoi de dommages','renvoie des dommages'],
  pctDomArmes:['% dommages armes','dommages armes','% dommages d armes','dommages d armes','% dommages aux armes'],pctDomSorts:['% dommages sorts','dommages sorts','% dommages aux sorts','dommages aux sorts'],
  pctDomDistance:['% dommages distance','dommages distance','% dommages a distance','dommages a distance'],pctDomMelee:['% dommages melee','dommages melee','% dommages en melee','dommages en melee'],
  resCritique:['resistance critiques','resistances critiques','resistance critique','res critiques','re critiques','res crit'],resPoussee:['resistance poussee','resistances poussee','res poussee','re poussee'],
  pctResDistance:['% resistance distance','resistance distance','% resistances distance','resistances distance','% res distance','res distance','% resistance a distance'],pctResSorts:['% resistance sorts','resistance sorts','% resistance aux sorts'],pctResArmes:['% resistance armes','resistance armes','% resistance aux armes'],pctResMelee:['% resistance melee','resistance melee','% resistances melee','resistances melee','% res melee','res melee','% resistance en melee'],
  kamas:['kamas','kamas inventaire','kama'],xpRestante:['xp restante','experience restante','xp manquante'],xpPourcent:['progression xp','progression xp %','xp %'],bonusXP:['bonus xp','bonus xp %','bonus d experience','bonus experience']};
 for(const e of SCAN_ELEMENTS){const n=scanNorm(e);a['dom'+e]=['dommages '+n,'dommage '+n,'do '+n];a['res'+e]=['resistance '+n,'resistances '+n,'res '+n,'re '+n];a['pct'+e]=['% resistance '+n,'resistance % '+n,'% res '+n,'res % '+n,'% '+n,'resistance '+n+' %'];}
 for(const[k,l]of Object.entries(SCAN_FIELDS))(a[k]=a[k]||[]).push(scanNorm(l));
 const list=[];for(const[k,v]of Object.entries(a))for(const x of new Set(v))list.push([x,k]);return list.sort((p,q)=>q[0].length-p[0].length);
})();
const SCAN_ALIAS_MAP=new Map(SCAN_ALIASES);
function scanLev(a,b){if(Math.abs(a.length-b.length)>2)return 9;let p=[...Array(b.length+1).keys()];for(let i=1;i<=a.length;i++){const c=[i];for(let j=1;j<=b.length;j++)c[j]=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a[i-1]===b[j-1]?0:1));p=c;}return p[b.length];}
/* Find the field for a label: exact alias, alias inside the label (icons add noise), then a small OCR typo tolerance. */
function scanFieldFor(label,section,percent){
 const l=scanNorm(label);if(!l)return null;
 const element=SCAN_ELEMENTS.find(e=>scanNorm(e)===l.replace(/%/g,'').trim());
 if(element){if(section==='dom')return 'dom'+element;if(section==='res')return (percent||/%/.test(l)?'pct':'res')+element;return null;}
 let key=SCAN_ALIAS_MAP.get(l)||SCAN_ALIAS_MAP.get(l.replace(/%/g,'').trim());
 /* icons are often read as one or two stray letters before the label ("#r PA") */
 if(!key){let parts=l.split(' ');while(!key&&parts.length>1&&parts[0].length<=2){parts=parts.slice(1);key=SCAN_ALIAS_MAP.get(parts.join(' '));}}
 if(!key){const words=l.split(' ');for(const[alias,k]of SCAN_ALIASES){if(alias.length<4)continue;const aw=alias.split(' ');for(let i=0;i+aw.length<=words.length;i++)if(words.slice(i,i+aw.length).join(' ')===alias){key=k;break;}if(key)break;}}
 if(!key){const flat=l.replace(/%/g,'').trim();for(const[alias,k]of SCAN_ALIASES){const a=alias.replace(/%/g,'').trim();if(a.length>=6&&!a.includes(' ')===!flat.includes(' ')&&a[0]===flat[0]&&scanLev(flat,a)<=(a.length>=10?2:1)){key=k;break;}}}
 if(!key)return null;
 /* "Résistance terre 6%" is a percentage even when written without the % label. */
 const m=key.match(/^res(Neutre|Terre|Feu|Eau|Air)$/);if(m&&percent)return 'pct'+m[1];
 return key;
}
function scanSection(line){const l=scanNorm(line);if(/\d/.test(l))return null;if(/^(% )?dommages?( fixes| finaux)?$/.test(l))return 'dom';if(/^(% )?resistances?( fixes)?$/.test(l))return 'res';if(/caracteristiques|^general$|^secondaires?$|^bonus$/.test(l))return 'car';return null;}
/* Tokenise one visual row into (label, value) pairs; supports several columns per row and "value label" order. */
function scanPairs(line){
 let t=String(line).replace(/\([^)]*\)/g,' ').replace(/[−–]/g,'-').replace(/(\d)\s*%/g,'$1%').replace(/\s*\/\s*/g,' / ');
 const raw=t.split(/\s+/).filter(Boolean),tokens=[];
 for(const w of raw){
  const n=w.match(/^[:=]?([+-]?\d+(?:[.,]\d+)?)(%?)[:;,.]?$/);
  if(n){const prev=tokens[tokens.length-1];
   if(prev&&prev.num!==undefined&&!prev.pct&&!prev.dec&&/^\d{3}$/.test(n[1])&&!/^[+-]/.test(n[1])&&prev.merge!==false){prev.num=prev.num*1000+(prev.num<0?-1:1)*Number(n[1]);prev.pct=!!n[2];continue;}
   tokens.push({num:Number(n[1].replace(',','.')),pct:!!n[2],dec:/[.,]/.test(n[1]),merge:!/^[+-]/.test(n[1])&&n[1].length<=3});}
  else if(w==='/')tokens.push({slash:true});
  else if(w==='%'){const prev=tokens[tokens.length-1];if(prev&&prev.num!==undefined)prev.pct=true;else tokens.push({word:'%'});}
  else{const clean=w.replace(/^[^\p{L}%]+|[^\p{L}%]+$/gu,'');if(clean)tokens.push({word:clean});}
 }
 const pairs=[];let words=[],i=0;
 while(i<tokens.length){const tk=tokens[i];
  if(tk.word!==undefined){words.push(tk.word);i++;continue;}
  if(tk.slash){i++;continue;}
  const nums=[];while(i<tokens.length&&(tokens[i].num!==undefined||tokens[i].slash)){if(tokens[i].num!==undefined)nums.push(tokens[i]);else if(nums.length)nums.slash=true;i++;}
  if(words.length){pairs.push({label:words.join(' '),nums});words=[];}
  else if(pairs.length===0&&i<tokens.length){/* value first: "125 Force" */const w=[];while(i<tokens.length&&tokens[i].word!==undefined){w.push(tokens[i].word);i++;}pairs.push({label:w.join(' '),nums});}
 }
 return pairs;
}
function parseScanText(text){
 const values={};let section=null;
 for(const line of String(text).split(/\r?\n/)){
  const sec=scanSection(line);if(sec){section=sec;continue;}
  for(const {label,nums} of scanPairs(line)){
   if(!nums.length||nums.some(n=>!Number.isFinite(n.num)))continue;
   const element=SCAN_ELEMENTS.find(e=>scanNorm(e)===scanNorm(label).replace(/%/g,'').trim());
   if(element&&section==='res'&&nums.length>=2){const fixed=nums.find(n=>!n.pct),pct=nums.find(n=>n.pct);if(fixed)values['res'+element]=Math.round(fixed.num);if(pct)values['pct'+element]=Math.round(pct.num);continue;}
   const n=nums.slash?nums[nums.length-1]:nums[0];
   const key=scanFieldFor(label,section,n.pct);if(!key)continue;
   const v=Math.round(n.num);if(v<scanMin(key)||v>(SCAN_MAX[key]||1e12))continue;
   values[key]=v;
  }
 }
 return values;
}
/* Rebuild visual rows from word boxes so a label and a value far apart in the same row stay together. */
function scanRows(data){
 const words=[];for(const b of data?.blocks||[])for(const p of b.paragraphs||[])for(const l of p.lines||[])for(const w of l.words||[])if(w.text&&w.text.trim()&&w.bbox)words.push({t:w.text.trim(),x:w.bbox.x0,x1:w.bbox.x1,y:(w.bbox.y0+w.bbox.y1)/2,h:Math.max(1,w.bbox.y1-w.bbox.y0)});
 if(!words.length)return String(data?.text||'');
 const hs=words.map(w=>w.h).sort((a,b)=>a-b),mh=hs[Math.floor(hs.length/2)];
 words.sort((a,b)=>a.y-b.y);const rows=[];
 for(const w of words){const r=rows.find(r=>Math.abs(r.y-w.y)<=mh*0.55);if(r){r.w.push(w);r.y=(r.y*(r.w.length-1)+w.y)/r.w.length;}else rows.push({y:w.y,w:[w]});}
 return rows.sort((a,b)=>a.y-b.y).map(r=>r.w.sort((a,b)=>a.x-b.x).map(w=>w.t).join(' ')).join('\n');
}
/* Game panels are light text on dark backgrounds: enlarge, grey, invert if needed and stretch contrast. */
async function scanPrepare(image,rect,binarize=false){
 const img=await new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(Error('Image illisible.'));i.src=image;});
 const r=rect||{left:0,top:0,width:img.naturalWidth,height:img.naturalHeight};
 const big=Math.max(1,Math.max(r.width,r.height)),scale=rect?Math.max(1,Math.min(3,Math.floor(1800/big)||1)):Math.max(1,Math.min(3,Math.ceil(2400/big),Math.floor(Math.sqrt(16e6/Math.max(1,r.width*r.height)))));
 const c=document.createElement('canvas');c.width=r.width*scale;c.height=r.height*scale;const g=c.getContext('2d',{willReadFrequently:true});g.imageSmoothingQuality='high';g.drawImage(img,r.left,r.top,r.width,r.height,0,0,c.width,c.height);
 const d=g.getImageData(0,0,c.width,c.height),p=d.data,hist=new Uint32Array(256);let sum=0;
 for(let i=0;i<p.length;i+=4){const y=Math.round(.299*p[i]+.587*p[i+1]+.114*p[i+2]);p[i]=y;hist[y]++;sum+=y;}
 const n=p.length/4,invert=sum/n<128;let lo=0,hi=255,acc=0;for(let v=0;v<256;v++){acc+=hist[v];if(acc>n*0.01){lo=v;break;}}acc=0;for(let v=255;v>=0;v--){acc+=hist[v];if(acc>n*0.01){hi=v;break;}}
 const span=Math.max(1,hi-lo);for(let i=0;i<p.length;i+=4){let y=Math.max(0,Math.min(255,(p[i]-lo)*255/span));if(invert)y=255-y;p[i]=p[i+1]=p[i+2]=y;}
 if(binarize){/* dim grey values (0, 0 %) must survive: steep contrast just below the panel background */const hb=new Uint32Array(256);for(let i=0;i<p.length;i+=4)hb[p[i]]++;let mode=128;for(let v=129;v<256;v++)if(hb[v]>hb[mode])mode=v;const cut=Math.max(0,mode-45),k=255/Math.max(1,mode-6-cut);for(let i=0;i<p.length;i+=4){const y=Math.max(0,Math.min(255,(p[i]-cut)*k));p[i]=p[i+1]=p[i+2]=y;}}
 g.putImageData(d,0,0);return {canvas:c,scale,rect:r,width:img.naturalWidth,height:img.naturalHeight};
}

/* ---------- Dofus 3 « Caractéristiques » panel: locate it, ignore the rest (chat, quests, map), read it cell by cell ---------- */
const SCAN_ANCHORS=new Set(['tacle','fuite','retrait','esquive','prospection','initiative','puissance','invocation','invocations','renvoi','pods','portee','soins','critique','critiques','poussee','melee','distance','armes','sorts','dmg','neutre','terre','caracteristiques','restants']);
const SCAN_TABLE_ROWS={neutre:['domNeutre','resNeutre','pctNeutre'],terre:['domTerre','resTerre','pctTerre'],feu:['domFeu','resFeu','pctFeu'],eau:['domEau','resEau','pctEau'],air:['domAir','resAir','pctAir'],critiques:['domCritique','resCritique',null],critique:['domCritique','resCritique',null],poussee:['domPoussee','resPoussee',null],sorts:['pctDomSorts',null,'pctResSorts'],armes:['pctDomArmes',null,'pctResArmes'],distance:['pctDomDistance',null,'pctResDistance'],melee:['pctDomMelee',null,'pctResMelee']};
const SCAN_ICON_COLUMN=['pv','force','intelligence','chance','agilite','sagesse'];
function scanWords(data,scale=1,ox=0,oy=0){const out=[];for(const b of data?.blocks||[])for(const p of b.paragraphs||[])for(const l of p.lines||[])for(const w of l.words||[]){const t=(w.text||'').trim();if(t&&w.bbox)out.push({t,n:scanNorm(t),x0:w.bbox.x0/scale+ox,y0:w.bbox.y0/scale+oy,x1:w.bbox.x1/scale+ox,y1:w.bbox.y1/scale+oy,c:w.confidence??100});}return out;}
const scanCy=w=>(w.y0+w.y1)/2,scanH=w=>Math.max(1,w.y1-w.y0);
function scanMedianH(words){const h=words.map(scanH).sort((a,b)=>a-b);return h[Math.floor(h.length/2)]||12;}
/* Bounding box of the panel from its distinctive labels, expanded to include the icon column, the header and the points line. */
function scanPanelBox(words,width,height){
 const anchors=words.filter(w=>SCAN_ANCHORS.has(w.n.replace(/ /g,'')));if(anchors.length<4)return null;
 const med=a=>a.slice().sort((p,q)=>p-q)[Math.floor(a.length/2)],mx=med(anchors.map(w=>(w.x0+w.x1)/2)),my=med(anchors.map(scanCy)),h=scanMedianH(anchors);
 const near=anchors.filter(w=>Math.abs((w.x0+w.x1)/2-mx)<h*28&&Math.abs(scanCy(w)-my)<h*36);if(near.length<4)return null;
 let x0=Math.min(...near.map(w=>w.x0)),x1=Math.max(...near.map(w=>w.x1)),y0=Math.min(...near.map(w=>w.y0)),y1=Math.max(...near.map(w=>w.y1));
 const W=Math.max(x1-x0,h*15),H=Math.max(y1-y0,h*15);
 x0=Math.max(0,x0-W*.5);x1=Math.min(width,x1+Math.max(W*.6,h*14));y0=Math.max(0,y0-H*.25);y1=Math.min(height,y1+H*.2);
 return {left:Math.floor(x0),top:Math.floor(y0),width:Math.ceil(x1-x0),height:Math.ceil(y1-y0)};
}
/* Join "2" "095" → 2095 and "3" "%" → 3 %, read "-" as an empty cell. */
function scanCells(words){
 const h=scanMedianH(words),sorted=words.slice().sort((a,b)=>a.x0-b.x0),cells=[];
 for(const w of sorted){
  const t=w.t.replace(/[−–—]/g,'-');
  const num=t.match(/^([+-]?\d+)(%?)$/),pctOnly=/^%$/.test(t),dash=/^-+$/.test(t);
  const prev=cells[cells.length-1],gap=prev?w.x0-prev.x1:1e9;
  if(num&&prev&&prev.v!==undefined&&!prev.pct&&gap<h*.9&&/^\d{3}$/.test(num[1])&&Math.abs(prev.v)<1000){prev.v=prev.v*1000+(prev.v<0?-1:1)*Number(num[1]);prev.pct=!!num[2];prev.x1=w.x1;continue;}
  if(pctOnly&&prev&&prev.v!==undefined&&gap<h*1.2){prev.pct=true;prev.x1=w.x1;continue;}
  if(num)cells.push({v:Number(num[1]),pct:!!num[2],x0:w.x0,x1:w.x1,y:scanCy(w)});
  else if(dash)cells.push({dash:true,x0:w.x0,x1:w.x1,y:scanCy(w)});
  else cells.push({word:w.n,raw:w.t,x0:w.x0,x1:w.x1,y:scanCy(w)});
 }
 return cells;
}
function scanGroupRows(words){const h=scanMedianH(words),rows=[];for(const w of words.slice().sort((a,b)=>scanCy(a)-scanCy(b))){const r=rows.find(r=>Math.abs(r.y-scanCy(w))<=h*.6);if(r){r.w.push(w);r.y=(r.y*(r.w.length-1)+scanCy(w))/r.w.length;}else rows.push({y:scanCy(w),w:[w]});}return rows.sort((a,b)=>a.y-b.y);}
function scanPanelValues(words){
 const values={},used=new Set(),h=scanMedianH(words),table={cols:null,rows:[],h};
 const rows=scanGroupRows(words);
 /* 1. Icon column on the left (life points then Force, Intelligence, Chance, Agilité, Sagesse): values without labels. */
 const gridLabels=words.filter(w=>['pa','pm','portee','pods','tacle','retrait','initiative','renvoi'].includes(w.n));
 if(gridLabels.length>=3){
  const xs=gridLabels.map(w=>w.x0).sort((a,b)=>a-b),labelX=xs[Math.floor(xs.length/2)];
  const leftWords=words.filter(w=>w.x1<labelX-h*.8&&!used.has(w));
  const nums=[];for(const r of scanGroupRows(leftWords)){const cells=scanCells(r.w).filter(c=>c.v!==undefined);if(cells.length===1)nums.push(cells[0]);}
  const plausible=nums.filter(c=>c.v>=0&&c.v<100000);
  if(plausible.length===SCAN_ICON_COLUMN.length)plausible.forEach((c,i)=>values[SCAN_ICON_COLUMN[i]]=c.v);
  leftWords.forEach(w=>used.add(w));
 }
 /* 2. Damage/resistance table: columns DMG · RES · RES.% placed by their header position. */
 const headerRow=rows.find(r=>(r.w.some(w=>w.n.startsWith('dmg'))&&r.w.some(w=>w.n.startsWith('res')))||r.w.filter(w=>w.n.startsWith('res')).length>=2);
 if(headerRow){
  const hw=headerRow.w.slice().sort((a,b)=>a.x0-b.x0),dmg=hw.find(w=>w.n.startsWith('dmg')),res=hw.filter(w=>w.n.startsWith('res'));
  const cols=[dmg,res[0],res[1]].map(w=>w?(w.x0+w.x1)/2:null);
  if(cols[2]===null&&res[0]&&/%/.test(res[0].t)){cols[2]=cols[1];cols[1]=null;}
  if(cols[0]===null&&cols[1]!==null&&cols[2]!==null)cols[0]=cols[1]-(cols[2]-cols[1]);
  table.cols=cols;table.top=headerRow.y;
  for(const r of rows.filter(r=>r.y>headerRow.y)){
   const cells=scanCells(r.w.filter(w=>!used.has(w))),label=cells.find(c=>c.word&&SCAN_TABLE_ROWS[c.word.replace(/ /g,'')]);if(!label)continue;
   const keys=SCAN_TABLE_ROWS[label.word.replace(/ /g,'')];
   table.rows.push({y:r.y,keys});
   for(const c of cells.filter(c=>(c.v!==undefined||c.dash)&&c.x0>label.x1)){
    let best=-1,dist=Infinity;cols.forEach((x,i)=>{if(x!==null){const d=Math.abs((c.x0+c.x1)/2-x);if(d<dist){dist=d;best=i;}}});
    if(best<0||c.dash||!keys[best]||dist>h*6)continue;values[keys[best]]=c.v;
   }
   r.w.forEach(w=>used.add(w));
  }
  headerRow.w.forEach(w=>used.add(w));
 }
 /* Header: the character name sits just above « NIVEAU 99 | CLASSE ». */
 const header={};const lvlRow=rows.find(r=>r.w.some(w=>w.n==='niveau'));
 if(lvlRow){
  const above=rows.filter(r=>r.y<lvlRow.y&&lvlRow.y-r.y<h*3.2).pop();
  if(above){const name=above.w.slice().sort((a,b)=>a.x0-b.x0).map(w=>w.t.replace(/[^\p{L}\-']/gu,'')).filter(t=>t.length>=2).join(' ').trim();if(/^\p{L}[\p{L}\-' ]{1,29}$/u.test(name)&&!/caracteristiques/.test(scanNorm(name)))header.nom=name;}
  const after=lvlRow.w.slice().sort((a,b)=>a.x0-b.x0),lv=after.findIndex(w=>w.n==='niveau');
  for(const w of after.slice(lv+1)){const c=typeof CLASSES==='object'?Object.keys(CLASSES).find(k=>scanNorm(k)===w.n):null;if(c){header.classe=c;break;}}
 }
 /* 3. Everything else: label/value pairs per row (two columns per row are supported). */
 const text=rows.filter(r=>!r.w.some(w=>SCAN_TABLE_ROWS[w.n.replace(/ /g,'')]&&w.n!=='critique')).map(r=>r.w.filter(w=>!used.has(w)).sort((a,b)=>a.x0-b.x0).map(w=>w.t).join(' ')).filter(Boolean).join('\n');
 const pairs=parseScanText(text);for(const[k,v]of Object.entries(pairs))if(values[k]===undefined)values[k]=v;
 Object.defineProperty(values,'table',{value:table,enumerable:false});Object.defineProperty(values,'header',{value:header,enumerable:false});
 return values;
}
/* Rows of a whole screenshot without chat lines ("[07:02] ...") nor quest trackers. */
function scanCleanRows(words){return scanGroupRows(words).map(r=>r.w.sort((a,b)=>a.x0-b.x0).map(w=>w.t).join(' ')).filter(l=>!/^\W*\[?\d{1,2}[:.h]\d{2}\]?/.test(l)&&!/vaincre|voir plus|\(\/[a-z]\)|https?:/i.test(l)).join('\n');}

/* Grid cells whose value was not read: rectangles right of each known label, to re-read digits only. */
const SCAN_GRID={pa:'pa',pm:'pm',portee:'po',critique:'critique',puissance:'puissance',invocation:'invocations',invocations:'invocations',pods:'pods',prospection:'prospection',tacle:'tacle',fuite:'fuite',initiative:'initiative',soins:'soins',renvoi:'renvoi','retrait pa':'retraitPA','retrait pm':'retraitPM','esquive pa':'esquivePA','esquive pm':'esquivePM','points restants':'points'};
function scanGridGaps(words,values,box){
 const h=scanMedianH(words),out=[];
 for(const r of scanGroupRows(words)){
  const w=r.w.slice().sort((a,b)=>a.x0-b.x0);
  for(let i=0;i<w.length;i++){
   const two=i+1<w.length?w[i].n+' '+w[i+1].n:'',k2=SCAN_GRID[two],k1=SCAN_GRID[w[i].n];
   const key=k2||(['retrait','esquive','points'].includes(w[i-1]?.n)?null:k1);if(!key)continue;
   const end=k2?w[i+1]:w[i];if(k2)i++;
   if(values[key]!==undefined)continue;
   const next=w.find(x=>x.x0>end.x1+h*2&&/\p{L}{3,}/u.test(x.t));
   const right=next?next.x0-h*1.8:box.left+box.width-h*.3;
   if(right-end.x1<h*1.5)continue;
   out.push({key,rect:{left:Math.floor(end.x1+h*.4),top:Math.floor(r.y-h*.95),width:Math.ceil(right-end.x1-h*.4),height:Math.ceil(h*1.9)}});
  }
 }
 return out;
}

let scanDraft=null,scanTarget='',scanImage='',scanText='',scanBusy=false,scanWorker=null,scanProgress='',scanRect=null,scanDrag=null,scanCapturePending=false,scanCaptureNotice='',scanFound=[];
function scanBlank(){return {schema:'escouade.scan.v1',nom:state.perso.nom||'',at:Date.now(),values:{},resources:[]};}
function scanFormValues(){const form=document.getElementById('scan-review');if(!form)return scanDraft;const d=Object.fromEntries(new FormData(form)),values={};for(const k of Object.keys(SCAN_FIELDS))if(d[k]!==undefined&&d[k].trim()!=='')values[k]=Number(d[k]);return {schema:'escouade.scan.v1',nom:d.nom.trim(),...(d.classe?{classe:d.classe}:{}),at:Date.now(),values,resources:d.resources.split('\n').filter(x=>x.trim()).map(line=>{const m=line.match(/^(.+?)\s*[×:]\s*(\d+)\s*$/);return m?{name:m[1].trim(),qty:Number(m[2])}:{name:'',qty:-1};})};}
function scanMatchPerso(nom){const n=norm(nom);if(!n)return null;return state.persos.find(p=>norm(p.perso.nom)===n)||state.persos.find(p=>p.perso.nom&&scanLev(norm(p.perso.nom),n)<=1)||null;}
function scanKeep(){if(scanDraft&&scanTarget===state.activeId)scanDraft=scanFormValues();}

/* ---------- Diagrams (inline SVG, no external library) ---------- */
const SCAN_COLORS={Neutre:'#9aa1ad',Terre:'#b0793c',Feu:'#e0603a',Eau:'#4f93db',Air:'#5fb86a'};
function scanRadar(v){
 const keys=[['vitalite','Vitalité'],['sagesse','Sagesse'],['force','Force'],['intelligence','Intelligence'],['chance','Chance'],['agilite','Agilité']];
 if(!keys.some(([k])=>v[k]!==undefined))return '';
 const max=Math.max(100,...keys.map(([k])=>Math.max(0,v[k]||0))),cx=160,cy=150,R=105,pt=(i,r)=>[cx+r*Math.sin(i*Math.PI/3),cy-r*Math.cos(i*Math.PI/3)];
 const grid=[.25,.5,.75,1].map(f=>`<polygon points="${keys.map((_,i)=>pt(i,R*f).join(',')).join(' ')}" fill="none" stroke="var(--line)"/>`).join('');
 const axes=keys.map((_,i)=>`<line x1="${cx}" y1="${cy}" x2="${pt(i,R)[0]}" y2="${pt(i,R)[1]}" stroke="var(--line)"/>`).join('');
 const shape=keys.map(([k],i)=>pt(i,R*Math.max(0,v[k]||0)/max).join(',')).join(' ');
 const labels=keys.map(([k,l],i)=>{const[x,y]=pt(i,R+24);return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-size="12" fill="var(--muted)">${l}<tspan x="${x}" dy="14" fill="var(--ink)" font-weight="700">${v[k]===undefined?'—':fmt(v[k])}</tspan></text>`;}).join('');
 return `<figure class="scan-chart" style="margin:0"><figcaption class="s">Caractéristiques (échelle max ${fmt(max)})</figcaption><svg viewBox="0 0 320 310" width="100%" style="max-width:360px" role="img" aria-label="Diagramme radar des caractéristiques">${grid}${axes}<polygon points="${shape}" fill="var(--gold)" fill-opacity=".28" stroke="var(--gold)" stroke-width="2"/>${labels}</svg></figure>`;
}
function scanBars(v){
 const rows=SCAN_ELEMENTS.map(e=>({e,dom:v['dom'+e],pct:v['pct'+e],res:v['res'+e]}));
 if(!rows.some(r=>r.dom!==undefined||r.pct!==undefined))return '';
 const maxDom=Math.max(10,...rows.map(r=>Math.abs(r.dom||0))),maxPct=Math.max(10,...rows.map(r=>Math.abs(r.pct||0))),W=100,fixed=rows.some(r=>r.res!==undefined);
 const bar=(val,max,color)=>val===undefined?'<span class="s">—</span>':`<span style="display:inline-flex;align-items:center;gap:6px;white-space:nowrap"><svg width="${W}" height="12" aria-hidden="true"><rect x="0" y="1" width="${W}" height="10" rx="5" fill="var(--surface-2)"/><rect x="0" y="1" width="${Math.max(2,W*Math.min(1,Math.abs(val)/max))}" height="10" rx="5" fill="${val<0?'#c0504d':color}"/></svg><strong>${fmt(val)}</strong></span>`;
 return `<figure class="scan-chart" style="margin:0"><figcaption class="s">Dommages et résistances par élément</figcaption><div class="table-wrap"><table><thead><tr><th>Élément</th><th>Dommages</th><th>Résistance %</th>${fixed?'<th>Fixe</th>':''}</tr></thead><tbody>${rows.map(r=>`<tr><td><span class="dot" style="background:${SCAN_COLORS[r.e]};display:inline-block;margin-right:6px"></span>${r.e}</td><td>${bar(r.dom,maxDom,SCAN_COLORS[r.e])}</td><td>${r.pct===undefined?'—':bar(r.pct,maxPct,SCAN_COLORS[r.e]).replace('<strong>'+fmt(r.pct)+'</strong>','<strong>'+fmt(r.pct)+' %</strong>')}</td>${fixed?`<td>${r.res===undefined?'—':fmt(r.res)}</td>`:''}</tr>`).join('')}</tbody></table></div></figure>`;
}
function scanTrend(history){
 const pts=(history||[]).slice(-30);if(pts.length<2)return '';
 const metrics=[['niveau','Niveau'],['vitalite','Vitalité'],['puissance','Puissance'],['sagesse','Sagesse'],['initiative','Initiative']].filter(([k])=>pts.filter(p=>p.values[k]!==undefined).length>=2);
 if(!metrics.length)return '';
 const spark=k=>{const s=pts.filter(p=>p.values[k]!==undefined),vals=s.map(p=>p.values[k]),lo=Math.min(...vals),hi=Math.max(...vals),W=180,H=36,x=i=>4+i*(W-8)/Math.max(1,s.length-1),y=v=>H-4-(hi===lo?.5:(v-lo)/(hi-lo))*(H-8);
  return `<svg width="${W}" height="${H}" role="img" aria-label="Évolution"><polyline fill="none" stroke="var(--gold)" stroke-width="2" points="${vals.map((v,i)=>x(i)+','+y(v)).join(' ')}"/>${vals.map((v,i)=>`<circle cx="${x(i)}" cy="${y(v)}" r="2.5" fill="var(--gold)"/>`).join('')}</svg>`;};
 return `<figure class="scan-chart" style="margin:0"><figcaption class="s">Évolution sur ${pts.length} relevés (${esc(new Date(pts[0].at).toLocaleDateString('fr-FR'))} → ${esc(new Date(pts[pts.length-1].at).toLocaleDateString('fr-FR'))})</figcaption><div class="table-wrap"><table><tbody>${metrics.map(([k,l])=>{const s=pts.filter(p=>p.values[k]!==undefined),a=s[0].values[k],b=s[s.length-1].values[k];return `<tr><td>${l}</td><td>${spark(k)}</td><td class="num">${fmt(a)} → <strong>${fmt(b)}</strong> ${b-a?`<span class="${b>a?'pos':'neg'}">(${b>a?'+':''}${fmt(b-a)})</span>`:''}</td></tr>`;}).join('')}</tbody></table></div></figure>`;
}
function scanDiagrams(scan,history){const r=scanRadar(scan.values),b=scanBars(scan.values),t=scanTrend(history);return r||b||t?`<div class="grid g2" style="align-items:start;gap:16px;margin:12px 0">${r}${b}</div>${t}`:'';}

function scanNameBanner(d){
 if(!d.nom||norm(d.nom)===norm(state.perso.nom))return '';
 const other=state.persos.find(p=>norm(p.perso.nom)===norm(d.nom));
 return `<p class="card" role="status" style="border-color:var(--gold);margin:12px 0">Ce relevé est celui de <strong>${esc(d.nom)}</strong>, le personnage actif est ${esc(persoLabel(activeP()))}. `+(other?`<button class="btn small" data-scan="switch" data-id="${esc(other.id)}">Passer sur ${esc(d.nom)}</button>`:`<button class="btn small" data-scan="rename">Nommer le personnage actif ${esc(d.nom)}</button>${state.persos.length<MAX_PERSOS?` <button class="btn small" data-scan="create">Créer le personnage ${esc(d.nom)}</button>`:''}`)+`</p>`;
}
function vScan(){
 const saved=state.guide.scan,history=state.guide.scanHistory||[];
 if(scanDraft&&scanTarget!==state.activeId){scanDraft=null;scanImage='';scanText='';scanFound=[];}
 const d=scanDraft,filled=d?Object.keys(d.values).length:0,total=Object.keys(SCAN_FIELDS).length;
 return head('Capture locale','Scan et import','Capture le panneau des caractéristiques, l’info XP ou l’inventaire : Escouade lit toutes les valeurs reconnues, puis tu vérifies avant d’enregistrer.')+
 `<section class="card" style="margin-bottom:16px"><h2>1 · Capturer ou importer</h2><p>Ouvre les caractéristiques, l’info XP ou l’inventaire dans Dofus. La capture ne déclenche aucune action de jeu. Les images restent sur ton PC.</p><button class="btn" data-scan="capture" ${desktop&&!scanCapturePending?'':'disabled'}>${scanCapturePending?'Capture en attente…':'Capturer une fenêtre Dofus'}</button> <label class="btn">Importer une image ou un relevé JSON<input id="scan-file" type="file" accept="image/png,image/jpeg,image/webp,.json" style="display:none"></label> <button class="btn" data-scan="blank">Saisir un relevé</button><p class="s">Choisis la fenêtre dans l’outil, puis clique sur Capturer. L’image revient automatiquement ici. Plusieurs captures s’additionnent dans le même relevé : fais défiler le panneau dans Dofus, capture à nouveau et relis. Le lancement séparé de Capture Escouade.exe permet aussi l’import manuel du PNG.</p><p role="status" id="scan-capture-status">${esc(scanCaptureNotice)}</p></section>`+
 (scanImage?`<section class="card" style="margin-bottom:16px"><h2>2 · Lire le texte</h2><div style="position:relative;display:inline-block;max-width:100%"><img id="scan-preview" draggable="false" src="${scanImage}" alt="Capture à vérifier : glisse pour sélectionner une zone" style="display:block;max-width:100%;max-height:480px;cursor:crosshair">${scanRect?`<div style="pointer-events:none;position:absolute;border:2px solid #eec867;box-sizing:border-box;left:${scanRect.left/scanRect.imageWidth*100}%;top:${scanRect.top/scanRect.imageHeight*100}%;width:${scanRect.width/scanRect.imageWidth*100}%;height:${scanRect.height/scanRect.imageHeight*100}%"></div>`:''}</div><p>Pour un meilleur résultat, glisse sur l’image pour encadrer seulement le panneau des caractéristiques. Sans sélection, toute l’image est lue. L’image est agrandie et contrastée localement avant la lecture.</p><button class="btn primary" data-scan="ocr" ${scanBusy?'disabled':''}>${scanBusy?'Lecture en cours…':'Lire et remplir les valeurs'}</button> <button class="btn" data-scan="crop-clear">Lire toute l’image</button> <button class="btn" data-scan="image-clear" ${scanBusy?'disabled':''}>Retirer l’image</button><p id="scan-progress" role="status">${esc(scanProgress)}</p></section>`:'')+
 (d?`<section class="card" style="margin-bottom:16px"><h2>3 · Vérifier pour ${esc(persoLabel(activeP()))}</h2><p>${filled} valeur(s) sur ${total} renseignée(s)${scanFound.length?` · <strong>${scanFound.length} lue(s) automatiquement</strong>, encadrée(s) en doré : vérifie-les`:''}. Un champ vide ne modifie rien. Rien n’est enregistré sans ton clic.</p><details${scanText?' open':''}><summary>Texte lu (modifiable)</summary><textarea id="scan-text" maxlength="100000" rows="8">${esc(scanText)}</textarea><button class="btn" data-scan="parse">Relire ce texte</button></details>${scanNameBanner(d)}<form id="scan-review" data-scan-form="review"><div class="form f4"><label class="f">Nom du personnage<input name="nom" maxlength="80" required value="${esc(d.nom)}"${scanFound.includes('nom')?' style="outline:2px solid var(--gold)"':''}></label><label>Classe<select name="classe"><option value="">—</option>${Object.keys(CLASSES).map(c=>`<option ${d.classe===c?'selected':''}>${esc(c)}</option>`).join('')}</select></label></div>${SCAN_GROUPS.map(([g,fields])=>`<fieldset style="border:1px solid var(--line);border-radius:10px;margin:12px 0;padding:8px 12px"><legend><strong>${esc(g)}</strong> <span class="s">${Object.keys(fields).filter(k=>d.values[k]!==undefined).length}/${Object.keys(fields).length}</span></legend><div class="form f4">${Object.entries(fields).map(([k,label])=>`<label>${esc(label)}<input name="${k}" type="number" step="1" min="${scanMin(k)}" max="${SCAN_MAX[k]||1e12}" value="${d.values[k]??''}"${scanFound.includes(k)?' style="outline:2px solid var(--gold)" data-ocr="1"':''}></label>`).join('')}</div></fieldset>`).join('')}<label>Ressources identifiées · une ligne « Nom : quantité »<textarea name="resources" maxlength="100000" placeholder="Exemple : Ressource : 18">${esc(d.resources.map(r=>r.name+' : '+r.qty).join('\n'))}</textarea></label><p class="s">Liste partielle : les icônes seules ne sont pas reconnues. Ces ressources restent dans le relevé personnel et ne modifient pas le stock partagé des crafts.</p><label><input name="apply" type="checkbox" checked> Mettre aussi à jour le suivi du personnage : niveau, PA, PM, portée, vitalité, sagesse, stat élémentaire principale et résistances moyennes</label><p class="s">Le portefeuille et l’XP restent un instantané daté. Le journal de kamas de la team et les compteurs XP manuels sont conservés. Chaque relevé enregistré alimente l’évolution du personnage.</p><button class="btn primary" ${scanBusy?'disabled':''}>Enregistrer le relevé vérifié</button></form></section>`:'')+
 (saved?`<section class="card" style="margin-bottom:16px"><h2>Dernier relevé · ${esc(saved.nom)}</h2><p>${esc(new Date(saved.at).toLocaleString('fr-FR'))} · ${Object.keys(saved.values).length} valeurs vérifiées · ${history.length} relevé(s) dans l’historique</p>${scanDiagrams(saved,history)}<details><summary>Toutes les valeurs</summary>${SCAN_GROUPS.map(([g,fields])=>{const rows=Object.entries(fields).filter(([k])=>saved.values[k]!==undefined);return rows.length?`<h3>${esc(g)}</h3>`+gtable(['Valeur','Relevé'],rows.map(([k,l])=>`<tr><td>${esc(l)}</td><td>${fmt(saved.values[k])}${/^pct|^xpPourcent|^bonusXP|^critique/.test(k)?' %':''}</td></tr>`)):'';}).join('')}</details><p>${saved.resources.length?saved.resources.map(r=>esc(r.name)+' × '+fmt(r.qty)).join(' · '):'Aucune ressource identifiée.'}</p><button class="btn" data-scan="edit">Corriger ce relevé</button> <button class="btn" data-scan="export">Exporter ce relevé</button></section>`:'');
}
async function scanReadImage(file){
 if(scanBusy)throw Error('Une lecture OCR est en cours. Termine-la avant d’importer une image.');const owner=state.activeId;if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>15*1024*1024)throw Error('PNG, JPEG ou WebP de 15 Mo maximum attendu.');
 const bitmap=await createImageBitmap(file);if(bitmap.width*bitmap.height>24e6){bitmap.close();throw Error('Image trop grande : limite de 24 millions de pixels.');}bitmap.close();
 const image=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file);});if(state.activeId!==owner)throw Error('Personnage changé pendant l’import : image non chargée.');scanKeep();if(!scanDraft)scanDraft=scanBlank();scanTarget=owner;scanRect=null;scanImage=image;scanProgress='Image chargée. Encadre le panneau si besoin, puis lance la lecture.';render();
}
async function scanOCR(image,rectangle=null){
 if(!window.Tesseract)await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='vendor/ocr/tesseract.min.js';s.onload=resolve;s.onerror=()=>{s.remove();reject(Error('Moteur OCR local introuvable.'));};document.head.append(s);});
 const base=new URL('vendor/ocr/',location.href).href;
 if(!scanWorker)scanWorker=await Tesseract.createWorker('fra',1,{workerPath:base+'worker.min.js',corePath:base,langPath:base.replace(/\/$/,''),cacheMethod:'none',workerBlobURL:false,logger:m=>{scanProgress=(m.status||'Lecture')+' '+Math.round((m.progress||0)*100)+' %';const el=document.getElementById('scan-progress');if(el)el.textContent=scanProgress;}});
 const read=async(prepared,psm)=>{await scanWorker.setParameters({tessedit_pageseg_mode:psm,preserve_interword_spaces:'1'});const r=await scanWorker.recognize(prepared.canvas,{},{text:true,blocks:true});return scanWords(r.data,prepared.scale,prepared.rect.left,prepared.rect.top);};
 /* Pass 1: find the characteristics panel in the capture (or in the selected zone). */
 const first=await scanPrepare(image,rectangle),wordsA=await read(first,'11');
 const box=scanPanelBox(wordsA,first.width,first.height);
 if(box){
  /* Pass 2: read only the panel, enlarged; chat, quests and map are ignored. */
  /* Two renderings of the same panel: normal contrast (bold white values) and steep contrast (dim grey zeros). */
  const panel=await scanPrepare(image,box),words=await read(panel,'11'),values=scanPanelValues(words);
  const dim=await scanPrepare(image,box,true),wordsDim=await read(dim,'11');
  /* a thin minus sign is more often lost than invented: keep it when the other rendering saw it */
  for(const[k,v]of Object.entries(scanPanelValues(wordsDim)))if(values[k]===undefined||(v<0&&values[k]===-v))values[k]=v;
  /* Pass 3a: grid values not read next to their label: digits only, one line. */
  const gaps=scanGridGaps(words,values,box);
  if(gaps.length){await scanWorker.setParameters({tessedit_char_whitelist:'0123456789 -'});
   try{for(const g of gaps.slice(0,20)){const cell=await scanPrepare(image,g.rect),cw=await read(cell,'7'),nums=scanCells(cw).filter(c=>c.v!==undefined);if(window.SCAN_DEBUG)console.log('gap',g.key,JSON.stringify(g.rect),JSON.stringify(cw.map(w=>[w.t,Math.round(w.c)])));const c=nums.length===1?nums[0]:null;if(c&&cw.every(w=>w.c>=60)&&c.v>=scanMin(g.key)&&c.v<=(SCAN_MAX[g.key]||1e12))values[g.key]=c.v;}}
   finally{await scanWorker.setParameters({tessedit_char_whitelist:''});}}
  /* Pass 3b: table cells still empty (often dim zeros) are read column by column, digits only. */
  const t=values.table;
  if(t&&t.cols&&t.rows.length){
   const xs=t.cols.filter(x=>x!==null),gap=xs.length>1?Math.min(...xs.slice(1).map((x,i)=>x-xs[i])):t.h*6,y0=Math.max(box.top,t.top+t.h*.8),y1=Math.min(box.top+box.height,Math.max(...t.rows.map(r=>r.y))+t.h*1.2);
   await scanWorker.setParameters({tessedit_char_whitelist:'0123456789-%'});
   try{for(let ci=0;ci<3;ci++){const cx=t.cols[ci];if(cx===null||!t.rows.some(r=>r.keys[ci]))continue;
    const rect={left:Math.max(0,Math.floor(cx-gap*.5)),top:Math.floor(y0),width:Math.ceil(gap),height:Math.ceil(y1-y0)};
    const strip=await scanPrepare(image,rect,true),cw=await read(strip,'6');
    for(const c of scanCells(cw).filter(c=>c.v!==undefined)){const row=t.rows.reduce((b,r)=>Math.abs(r.y-c.y)<Math.abs(b.y-c.y)?r:b);const k=row.keys[ci];if(k&&Math.abs(row.y-c.y)<t.h*.8&&(values[k]===undefined||(c.v<0&&values[k]===-c.v)))values[k]=c.v;}
   }}finally{await scanWorker.setParameters({tessedit_char_whitelist:''});}
  }
  const header={...(scanPanelValues(wordsDim).header||{}),...values.header};
  return {nom:header.nom||'',classe:header.classe||'',text:scanGroupRows(words).map(r=>r.w.sort((a,b)=>a.x0-b.x0).map(w=>w.t).join(' ')).join('\n').slice(0,100000),values,panel:box};
 }
 const text=scanCleanRows(wordsA);let values=parseScanText(text);
 if(rectangle){const block=await read(first,'6'),extra=parseScanText(scanCleanRows(block));values={...extra,...values};}
 return {text:text.slice(0,100000),values,panel:null};
}
function scanPropose(text,given){const proposed=given||parseScanText(text);scanDraft.values={...scanDraft.values,...proposed};scanFound=[...new Set([...scanFound,...Object.keys(proposed)])];return Object.keys(proposed).length;}
async function scanCapture(){
 if(!desktop||scanCapturePending)return;
 const root=String(window.NL_PATH||'').replace(/\//g,'\\');
 if(!root||/["\r\n&|<>^%!]/.test(root))throw Error('Ouvre Capture Escouade.exe depuis le dossier de l’application.');
 scanKeep();const target=state.activeId;
 const request=[...crypto.getRandomValues(new Uint8Array(16))].map(n=>n.toString(16).padStart(2,'0')).join('');
 scanCapturePending=true;scanCaptureNotice='Dans l’outil Capture Escouade : choisis ton personnage puis Capturer. Ferme l’outil pour annuler.';render();
 try{
  const result=await Neutralino.os.execCommand('"'+root+'\\Capture Escouade.exe" --request '+request,{background:false});
  if(result.exitCode===2){scanCaptureNotice='Capture annulée : aucune donnée modifiée.';return;}
  if(result.exitCode!==0)throw Error('L’outil de capture a échoué. Tu peux importer un PNG manuellement.');
  if(state.activeId!==target)throw Error('Le personnage actif a changé : image non importée. Sélectionne le bon personnage puis importe le PNG depuis Captures de scan.');
  const data=await Neutralino.filesystem.readBinaryFile(root+'\\Captures de scan\\capture-request-'+request+'.png',{size:15*1024*1024+1});
  if(state.activeId!==target)throw Error('Personnage changé pendant le retour de capture : image non importée.');
  await scanReadImage(new File([data],'capture.png',{type:'image/png'}));
  if(current()!=='scan')location.hash='scan';
  scanCaptureNotice='Capture reçue. Sélectionne la zone utile puis clique sur Lire le texte localement.';
 }catch(err){scanCaptureNotice='Capture non importée : '+(err.message||err.code||'erreur inconnue')+' Aucun relevé enregistré.';}
 finally{scanCapturePending=false;if(current()==='scan')render();}
}
function scanApply(draft){
 const v=draft.values,c=state.stuff.caracs,set=(k,x)=>{if(x!==undefined&&Number.isFinite(x))c[k]={...(c[k]||{}),a:Math.round(x)};};
 if(v.niveau!==undefined)state.perso.niveau=v.niveau;
 set('pa',v.pa);set('pm',v.pm);set('po',v.po);set('sagesse',v.sagesse);set('vita',v.vitalite);
 const elems=['force','intelligence','chance','agilite'].map(k=>v[k]).filter(x=>x!==undefined);if(elems.length)set('stat',Math.max(...elems));
 const pcts=SCAN_ELEMENTS.map(e=>v['pct'+e]).filter(x=>x!==undefined);if(pcts.length)set('res',pcts.reduce((a,b)=>a+b,0)/pcts.length);
}
function installScanEvents(){
 main.addEventListener('input',e=>{if(e.target.closest('#scan-review'))scanDraft=scanFormValues();if(e.target.id==='scan-text')scanText=e.target.value;});
 main.addEventListener('pointerdown',e=>{if(e.target.id!=='scan-preview'||scanBusy)return;e.preventDefault();const r=e.target.getBoundingClientRect();scanDrag={x:e.clientX,y:e.clientY,box:r,w:e.target.naturalWidth,h:e.target.naturalHeight};});
 document.addEventListener('pointerup',e=>{if(!scanDrag)return;const d=scanDrag;scanDrag=null;if(current()!=='scan'||scanBusy)return;const x=Math.max(0,Math.min(d.box.width,e.clientX-d.box.left)),y=Math.max(0,Math.min(d.box.height,e.clientY-d.box.top)),sx=d.x-d.box.left,sy=d.y-d.box.top;const left=Math.floor(Math.min(x,sx)*d.w/d.box.width),top=Math.floor(Math.min(y,sy)*d.h/d.box.height),right=Math.min(d.w,Math.ceil(Math.max(x,sx)*d.w/d.box.width)),bottom=Math.min(d.h,Math.ceil(Math.max(y,sy)*d.h/d.box.height));if(right-left<8||bottom-top<8)return;scanKeep();scanRect={left,top,width:right-left,height:bottom-top,imageWidth:d.w,imageHeight:d.h};render();});
 main.addEventListener('change',async e=>{if(e.target.id!=='scan-file')return;const f=e.target.files[0];if(!f||scanBusy)return;try{if(f.name.toLowerCase().endsWith('.json')){if(f.size>1e6)throw Error('Relevé trop volumineux.');const d=JSON.parse(await f.text());if(!validScan(d))throw Error('Format de relevé invalide.');scanDraft=d;scanTarget=state.activeId;scanText='';scanFound=[];render();}else await scanReadImage(f);}catch(err){toast(err.message);}finally{e.target.value='';}});
 document.addEventListener('paste',async e=>{if(current()!=='scan'||['INPUT','TEXTAREA'].includes(e.target.tagName))return;const f=[...(e.clipboardData?.items||[])].find(i=>i.type.startsWith('image/'))?.getAsFile();if(!f)return;e.preventDefault();try{await scanReadImage(f);}catch(err){toast(err.message);}});
 main.addEventListener('submit',e=>{if(!e.target.dataset.scanForm)return;e.preventDefault();e.stopImmediatePropagation();const draft=scanFormValues();if(scanTarget!==state.activeId||!validScan(draft)){toast('Vérifie les nombres et les lignes de ressources (Nom : quantité).');return;}if(norm(draft.nom)!==norm(state.perso.nom)){toast('Le nom doit correspondre au personnage actif. Choisis ou renomme ce personnage avant import.');return;}if(!saveBackup('avant relevé de '+draft.nom))return;const apply=new FormData(e.target).get('apply');state.guide.scan=draft;state.guide.scanHistory=[...(state.guide.scanHistory||[]),{at:draft.at,values:{...draft.values}}].slice(-60);if(apply){scanApply(draft);if(draft.classe)state.perso.classe=draft.classe;}persist();scanDraft=null;scanImage='';scanText='';scanFound=[];render();toast('Relevé enregistré pour '+draft.nom);},true);
 main.addEventListener('click',async e=>{const el=e.target.closest('[data-scan]');if(!el||scanBusy)return;const a=el.dataset.scan;try{
 if(a==='capture'){await scanCapture();return;}
 if(a==='switch'){scanKeep();const p=state.persos.find(x=>x.id===el.dataset.id);if(p){state.activeId=p.id;scanTarget=p.id;persist();}}
 if(a==='rename'){scanKeep();if(scanDraft?.nom){state.perso.nom=scanDraft.nom.slice(0,80);persist();}}
 if(a==='create'){scanKeep();const d=scanDraft;if(d?.nom&&addPerso()){state.perso.nom=d.nom.slice(0,80);if(d.classe)state.perso.classe=d.classe;scanTarget=state.activeId;persist();}}
 if(a==='blank'){scanKeep();scanDraft=scanDraft||scanBlank();scanTarget=state.activeId;}
 if(a==='edit'){scanDraft=JSON.parse(JSON.stringify(state.guide.scan));scanTarget=state.activeId;scanFound=[];}
 if(a==='crop-clear'){scanKeep();scanRect=null;}
 if(a==='image-clear'){scanKeep();scanImage='';}
 if(a==='parse'){scanKeep();scanText=document.getElementById('scan-text').value;const n=scanPropose(scanText);toast(n+' valeur(s) proposée(s) : vérifie-les.');}
 if(a==='export'){await saveTextFile(JSON.stringify(state.guide.scan,null,2),'Releve-personnage.json');return;}
 if(a==='ocr'){scanKeep();scanBusy=true;render();try{const r=await scanOCR(scanImage,scanRect);if(r.nom){const m=scanMatchPerso(r.nom);scanDraft.nom=m?m.perso.nom:r.nom;scanFound=[...new Set([...scanFound,'nom'])];}if(r.classe)scanDraft.classe=r.classe;scanText=(scanText?scanText+'\n':'')+r.text;const n=scanPropose(r.text,r.values);scanProgress=n?`${n} valeur(s) lue(s)${r.panel?' dans le panneau Caractéristiques (chat et quêtes ignorés)':''}. Vérifie les champs encadrés, complète si besoin, puis enregistre.`:'Aucune valeur reconnue : encadre le panneau des caractéristiques ou corrige le texte lu.';}finally{scanBusy=false;}}
 render();}catch(err){scanBusy=false;scanProgress='Lecture interrompue. Tu peux saisir les valeurs manuellement.';if(scanWorker){await scanWorker.terminate().catch(()=>{});scanWorker=null;}render();toast(err.message||'Lecture impossible');}});
}
