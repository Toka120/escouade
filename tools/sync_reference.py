"""Refresh factual reference indexes from public DofusDB endpoints (no artwork)."""
import json,pathlib,urllib.request,urllib.parse,concurrent.futures,datetime
ROOT=pathlib.Path(__file__).resolve().parents[1]
def get(endpoint,query=None):
    url='https://api.dofusdb.fr/'+endpoint
    if query: url+='?'+urllib.parse.urlencode(query,doseq=True)
    with urllib.request.urlopen(url,timeout=45) as r:return json.load(r)
def pages(endpoint,fields):
    q={'$limit':50,'$select[]':fields,'$sort[id]':1}
    first=get(endpoint,q)
    def page(skip):return get(endpoint,{**q,'$skip':skip})['data']
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        return first['data']+sum(list(pool.map(page,range(50,first['total'],50))),[])
def name(row):return row.get('name',{}).get('fr','')
quest=get('quests/439')
captures=[]
for n,step in enumerate(quest['steps'],1):
    for o in step.get('objectives',[]):
        if o['typeId']==12:captures.append({'id':o['parameters']['parameter1'],'step':n,'required':o['parameters'].get('parameter2',1)})
ids=sorted({c['id'] for c in captures})
monsters={}
for i in range(0,len(ids),40):
    for m in get('monsters',{'id[$in]':ids[i:i+40],'$limit':50,'$select[]':['id','name','isBoss','isMiniBoss','subareas']})['data']:
        monsters[m['id']]=m
subareas={s['id']:name(s) for s in pages('subareas',['id','name'])}
for c in captures:
    m=monsters.get(c['id'],{})
    c.update(name=name(m) or ('Monstre '+str(c['id'])),kind='Archi' if m.get('isMiniBoss') else 'Boss' if m.get('isBoss') else 'Monstre',zones=[subareas.get(x,str(x)) for x in m.get('subareas',[])])
achievements=pages('achievements',['id','name','level','points','categoryId','need'])
categories={c['id']:name(c) for c in pages('achievement-categories',['id','name'])}
jobs=[{'id':j['id'],'name':name(j)} for j in pages('jobs',['id','name']) if j['id']!=1]
data={'updated':datetime.date.today().isoformat(),'source':'https://api.dofusdb.fr/','ocre':captures,'jobs':jobs,'achievements':[{'id':a['id'],'name':name(a),'level':a['level'],'points':a['points'],'category':categories.get(a['categoryId'],'Autre'),'quests':a.get('need',{}).get('quests',[])} for a in achievements]}
(ROOT/'src/reference.js').write_text('/* Factual indexes from DofusDB; refresh with tools/sync_reference.py. */\nconst GUIDE_REFERENCE = '+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
print({k:len(data[k]) for k in ['ocre','jobs','achievements']})
