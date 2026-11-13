"""Build the offline item bank (src/items.js) from the public Dofusdude API.

python tools/sync_items.py --min 1 --max 120

Kept: names, types, levels, sets, effects as displayed in game, weapon figures,
recipes with ingredient names and the conditions. Not kept: images and lore
descriptions (Ankama assets/texts), which stay on DofusDB / Dofusdude.
"""
import argparse, datetime, json, pathlib, urllib.parse, urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
API = 'https://api.dofusdu.de/dofus3/v1/fr/items/'
SKIP_EFFECTS = {'Échangeable :', '/', 'Attitude', 'Titre :', '-special spell-', 'Nombre de victimes :'}

def get(kind, **filters):
    query = urllib.parse.urlencode({f'filter[{k}]': v for k, v in filters.items()} | {'sort[level]': 'asc'})
    with urllib.request.urlopen(API + kind + '/all?' + query, timeout=120) as r:
        return json.load(r)['items']

def condition_text(c):
    el = c.get('condition', {}).get('element', {}).get('name', '')
    if not el: return None
    op, val = c['condition'].get('operator', ''), c['condition'].get('int_value')
    if op == '=' and val == 1 and '{0}' not in el: return el
    if '{0}' in el:
        base = el.split('{0}')[0].strip()
        return f'{base} {val} ou plus' if op == '>' and 'ou plus' in el else f'{base} {op} {val}'
    return f'{el} {op} {val}'

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--min', type=int, default=1)
    ap.add_argument('--max', type=int, default=120)
    args = ap.parse_args()
    equipment = get('equipment', min_level=args.min, max_level=args.max)
    names = {}
    for kind in ('resources', 'consumables', 'equipment'):
        for it in get(kind):
            names[(kind, it['ankama_id'])] = it['name']
    types, sets, ingredients, effect_names, items = [], {}, {}, [], []
    def idx(lst, v):
        if v not in lst: lst.append(v)
        return lst.index(v)
    for it in equipment:
        if not it.get('name'): continue
        tname = it['type']['name'] or 'Divers'
        effects = []
        for e in it.get('effects', []):
            name = e['type']['name']
            if name in SKIP_EFFECTS or not e.get('formatted'): continue
            effects.append([idx(effect_names, name), e['int_minimum'], 0 if e['ignore_int_max'] else e['int_maximum'], e['formatted']])
        recipe = []
        for r in it.get('recipe', []):
            key = (r['item_subtype'], r['item_ankama_id'])
            ingredients[r['item_ankama_id']] = names.get(key, f"Objet {r['item_ankama_id']}")
            recipe.append([r['item_ankama_id'], r['quantity']])
        row = {'i': it['ankama_id'], 'n': it['name'], 't': idx(types, tname), 'l': it['level'], 'p': it.get('pods', 0), 'e': effects}
        if recipe: row['r'] = recipe
        if it.get('parent_set'):
            sets[it['parent_set']['id']] = it['parent_set']['name']; row['s'] = it['parent_set']['id']
        if it.get('is_weapon') and it.get('ap_cost') is not None:
            rg = it.get('range') or {}
            row['w'] = [it.get('ap_cost', 0), rg.get('min', 0), rg.get('max', 0), it.get('critical_hit_probability', 0), it.get('critical_hit_bonus', 0), it.get('max_cast_per_turn', 0)]
        def walk(node):
            if isinstance(node, list):
                for x in node: yield from walk(x)
            elif isinstance(node, dict):
                if isinstance(node.get('condition'), dict): yield node
                for v in node.values():
                    if isinstance(v, (list, dict)) and v is not node.get('condition'): yield from walk(v)
        conds = list(dict.fromkeys(t for t in (condition_text(c) for c in walk(it.get('conditions', []))) if t))
        if conds: row['c'] = conds
        items.append(row)
    data = {'updated': datetime.date.today().isoformat(), 'source': 'https://api.dofusdu.de/', 'min': args.min, 'max': args.max,
            'types': types, 'sets': sets, 'effects': effect_names, 'ingredients': ingredients, 'items': items}
    out = ROOT / 'src/items.js'
    out.write_text('/* Banque d\'objets hors ligne : ' + str(len(items)) + ' équipements niveaux ' + f'{args.min}–{args.max}' + ', source Dofusdude (données publiques du jeu), sans images ni descriptions. Généré par tools/sync_items.py. */\nwindow.ESCOUADE_ITEMS = ' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n', encoding='utf-8')
    print({'items': len(items), 'types': len(types), 'sets': len(sets), 'ingredients': len(ingredients), 'bytes': out.stat().st_size})

if __name__ == '__main__':
    main()
