"""Convert Claude's reviewed audit to short, attributed app reference data."""
import json, pathlib, argparse

parser=argparse.ArgumentParser()
parser.add_argument('audit',type=pathlib.Path)
args=parser.parse_args()
source=json.loads(args.audit.read_text(encoding='utf-8'))
out={'updated':'2026-11-12','steps':[],'dofus':[], 'positions':{}, 'souls':{}, 'huzounet':{}}
titles={1:'Tutoriel et premiers repères',2:'Départ à Incarnam et Astrub',3:'Crypte de Kardorim',4:'Lancer le tour du monde',5:'Préparer une panoplie Blop',6:'Larves et Kwakwa',7:'Accès Otomaï et Valonia',8:'Nowel : découvrir l’île',9:'Premiers avis de recherche',10:'Clos des Blops',11:'Rejoindre l’île de Moon',12:'Démarrer le Dofus Cawotte',13:'Gelées et tour du monde',14:'Équipement et zones d’XP',15:'Explorer Saharach',16:'Terminer le Dofus Cawotte',31:'Donjons de la tranche 150',32:'Préparer le prochain équipement',33:'Minotot, Kimbo et Sphincter Cell',34:'XP et progression sur Frigost',35:'Achever le tour du monde',36:'Choisir ses activités complémentaires',37:'Frigost 2 puis Frigost 3',38:'Nowel : poursuivre les donjons',39:'Donjons de la tranche 190',40:'Progresser sur Frigost 3',41:'Merkator et Kralamoure'}
for e in source['parcours_1_200']['etapes']:
    n=e['etape']
    if n==42: continue
    # Existing detailed steps 17–30 are retained in the app for compatibility.
    if 17<=n<=30: continue
    # Step 4 is an introduction referencing future dungeons, not a to-do list of all of them.
    dungeons=e['donjons'] if n!=4 else []
    quests=e['quetes_et_pages_citees'][:2] if n!=14 else []
    out['steps'].append({'n':n,'tr':e['niveaux'],'titre':titles[n], 'opt':n in [8,38],
        'donjons':[x['donjon'] for x in dungeons], 'dofus':', '.join(e['dofus'][:2]),
        'quetes':quests, 'nq':len(quests), 'source':e['source']})
for e in source['dofus']['liste']:
    out['dofus'].append({'nom':e['nom'],'niveau':e['niveau_requis']})
for e in source['donjons']['positions_liste_vs_page_guide']:
    out['positions'][e['boss']]={'other':e['position_page_guide_dpln'],'source':e['guide']}
for e in source['donjons']['positions_desaccord_autre_source']:
    out['positions'].setdefault(e['boss'],{'other':'','source':'https://www.dofuspourlesnoobs.com/donjons.html'})
out['souls']={k:v for k,v in source['donjons']['pierre_ame_minimum'].items() if v in [50,100,150,190,1000]}
for k,v in source['huzounet']['monstres_identifies'].items():
    out['huzounet'][k.split(' (')[0]]=v
root=pathlib.Path(__file__).resolve().parents[1]
reviewed=root/'data/dungeon-positions-reviewed.json'
if reviewed.exists():out['positions'].update(json.loads(reviewed.read_text(encoding='utf-8')))
(root/'src/content.js').write_text('/* Reference facts audited 2026-11-12; see docs/sources.md. */\nconst ESCOUADE_CONTENT = '+json.dumps(out,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
print({'extra_steps':len(out['steps']),'dofus':len(out['dofus']),'positions_flagged':len(out['positions'])})
