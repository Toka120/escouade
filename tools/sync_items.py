"""Build Escouade's offline catalogue (src/items.js).

From a local catalogue folder (the "Catalogue Dofus" export, folder donnees/):
    python tools/sync_items.py --from "C:\\...\\Catalogue Dofus\\donnees"
Directly from the public Dofusdude API:
    python tools/sync_items.py --api

Kept: names, categories, types, levels, pods, effects as displayed in game, weapon
figures, conditions, recipes (by item id), sets with their bonuses, mount species.
Not kept: images and lore descriptions. Only the numeric icon id is stored ('g'):
the app may display the icon from the Dofusdude image server when online, it is
never bundled. JSON is treated as data only.
"""
import argparse, datetime, hashlib, json, pathlib, re, urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
API = 'https://api.dofusdu.de/dofus3/v1/'
CATEGORIES = [('equipment', 'Équipements'), ('resources', 'Ressources'), ('consumables', 'Consommables'), ('quest', 'Objets de quête'), ('cosmetics', 'Cosmétiques')]
SKIP_EFFECTS = {'Échangeable :', '/', 'Titre :', '-special spell-', 'Nombre de victimes :', 'Compatible avec :'}

def condition_text(c):
    el = c.get('condition', {}).get('element', {}).get('name', '')
    if not el: return None
    op, val = c['condition'].get('operator', ''), c['condition'].get('int_value')
    if op == '=' and val == 1 and '{0}' not in el: return el
    if '{0}' in el:
        base = el.split('{0}')[0].strip()
        return f'{base} {val} ou plus' if op == '>' and 'ou plus' in el else f'{base} {op} {val}'
    return f'{el} {op} {val}'

def walk(node):
    if isinstance(node, list):
        for x in node: yield from walk(x)
    elif isinstance(node, dict):
        if isinstance(node.get('condition'), dict): yield node
        for k, v in node.items():
            if k != 'condition' and isinstance(v, (list, dict)): yield from walk(v)

def main():
    ap = argparse.ArgumentParser()
    src = ap.add_mutually_exclusive_group(required=True)
    src.add_argument('--from', dest='folder', type=pathlib.Path, help='dossier donnees/ du catalogue local')
    src.add_argument('--api', action='store_true')
    args = ap.parse_args()
    provenance = {}
    def load(name):
        if args.folder:
            path = args.folder / (name + '.json')
            raw = path.read_bytes()
            provenance[name + '.json'] = hashlib.sha256(raw).hexdigest()
            return json.loads(raw.decode('utf-8'))
        route = {'sets': 'fr/sets/all', 'mounts': 'fr/mounts/all', 'version': 'meta/version'}.get(name, 'fr/items/' + name + '/all')
        with urllib.request.urlopen(API + route, timeout=180) as r:
            return json.load(r)
    version = load('version')
    effects_index, types_index, items = [], [], []
    def idx(lst, v):
        if v not in lst: lst.append(v)
        return lst.index(v)
    def icon(it):
        m = re.search(r'/img/item/(\d+)-\d+\.png$', (it.get('image_urls') or {}).get('icon', '') or '')
        return int(m.group(1)) if m else None
    def effects_of(raw):
        out = []
        for e in raw or []:
            name = (e.get('type') or {}).get('name', '')
            if name in SKIP_EFFECTS or not e.get('formatted'): continue
            out.append([idx(effects_index, name), e.get('int_minimum', 0), 0 if e.get('ignore_int_max') else e.get('int_maximum', 0), e['formatted']])
        return out
    for ci, (kind, _label) in enumerate(CATEGORIES):
        for it in load(kind)['items']:
            if not it or not it.get('name'): continue
            row = {'i': it['ankama_id'], 'n': it['name'], 'c': ci, 't': idx(types_index, (it.get('type') or {}).get('name') or 'Divers'), 'l': it.get('level', 0), 'p': it.get('pods', 0)}
            g = icon(it)
            if g: row['g'] = g
            e = effects_of(it.get('effects'))
            if e: row['e'] = e
            rec = [[r['item_ankama_id'], r['quantity']] for r in it.get('recipe') or []]
            if rec: row['r'] = rec
            if it.get('parent_set'): row['s'] = it['parent_set']['id']
            if it.get('is_weapon') and it.get('ap_cost') is not None:
                rg = it.get('range') or {}
                row['w'] = [it.get('ap_cost', 0), rg.get('min', 0), rg.get('max', 0), it.get('critical_hit_probability', 0), it.get('critical_hit_bonus', 0), it.get('max_cast_per_turn', 0)]
            conds = list(dict.fromkeys(t for t in (condition_text(c) for c in walk(it.get('conditions', []))) if t))
            if conds: row['k'] = conds
            items.append(row)
    sets = {}
    for s in load('sets')['sets']:
        bonus = {n: [e['formatted'] for e in (lst or []) if e.get('formatted')] for n, lst in (s.get('effects') or {}).items()}
        sets[s['ankama_id']] = {'n': s['name'], 'l': s.get('level', 0), 'q': s.get('items', 0), 'b': {n: v for n, v in bonus.items() if v}}
    mounts = [{'i': m['ankama_id'], 'n': m['name'], 'g': icon(m), 'f': (m.get('family') or {}).get('name', ''), 'e': [e['formatted'] for e in m.get('effects') or [] if e.get('formatted')]} for m in load('mounts')['mounts'] if m.get('name')]
    ids = [x['i'] for x in items]
    assert len(ids) == len(set(ids)), 'identifiants en double entre catégories'
    data = {'updated': datetime.date.today().isoformat(), 'game': version, 'source': 'https://api.dofusdu.de/', 'categories': [c[1] for c in CATEGORIES],
            'types': types_index, 'effects': effects_index, 'sets': sets, 'mounts': mounts, 'items': items}
    out = ROOT / 'src/items.js'
    out.write_text("/* Catalogue Dofus hors ligne : " + str(len(items)) + " objets, " + str(len(sets)) + " panoplies, " + str(len(mounts)) +
                   " montures. Source Dofusdude (données publiques du jeu " + str(version.get('version', '')) + "), sans images embarquées ni descriptions. Généré par tools/sync_items.py. */\nwindow.ESCOUADE_ITEMS = " +
                   json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n', encoding='utf-8')
    (ROOT / 'data').mkdir(exist_ok=True)
    counts = {c[1]: sum(1 for x in items if x['c'] == i) for i, c in enumerate(CATEGORIES)}
    counts.update({'Panoplies': len(sets), 'Montures (races)': len(mounts)})
    (ROOT / 'data/catalogue-provenance.json').write_text(json.dumps({'generated': data['updated'], 'game': version, 'source': data['source'],
        'from': 'catalogue local' if args.folder else 'API', 'sha256': provenance, 'counts': counts}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print({'items': len(items), 'sets': len(sets), 'mounts': len(mounts), 'types': len(types_index), 'effects': len(effects_index), 'bytes': out.stat().st_size})

if __name__ == '__main__':
    main()
