# Escouade

Application Windows de suivi de team Dofus : parcours 1–200, donjons, Dofus, stuff, kamas, objectifs, Ocre, succès, métiers, crafts, builds, Almanax, chasses, groupe, organisateur de fenêtres, scan des caractéristiques, catalogue Dofus hors ligne (17 402 objets) et carte DofusDB. Application indépendante, non affiliée à Ankama.

Aucune donnée de joueur n’est stockée dans ce dépôt : la progression reste sur le PC de chaque utilisateur (profil WebView2 local, clé `carnet-xelor-v1`, format v3 multi-personnages).

## Canal de mise à jour

- `update.json` : version publiée et notes, lus par Paramètres > Rechercher une mise à jour.
- `resources.neu` à la racine : paquet téléchargé lors de l’installation de cette mise à jour.

Ces deux fichiers forment le canal public. Ils ne sont modifiés que lors d’une publication validée par Toka : une branche de travail ne les change pas.

## Contenu

| Dossier | Rôle |
|---|---|
| `src/escouade.html` | interface, sauvegardes, migrations, navigation |
| `src/guide.js`, `src/reference.js`, `src/content.js` | outils de jeu et données de référence (DofusDB, Dofus pour les Noobs, Huzounet) |
| `src/scan.js` | Scan et import : lecture locale du panneau Caractéristiques, diagrammes, historique |
| `src/banque.js`, `src/items.js` | catalogue Dofus hors ligne (tous les objets, panoplies et montures) et carte DofusDB |
| `src/widgets.js`, `src/widgets.css` | fenêtres flottantes au premier plan |
| `src/vendor/ocr` | Tesseract.js 7.0.0 et données françaises, embarqués (aucun téléversement d’image) |
| `tools/` | construction (`build.py`), livraison locale, outils Windows (`Organisateur.cs`, `Capture.cs`), synchronisation des données |
| `tests/` | scénarios Playwright déterministes et vérification des services en ligne |
| `data/` | positions de donjons relues dans les guides |
| `docs/` | notes de version, guides d’utilisation, sources |
| `distribution/` | brouillon de fiche produit (pas de soumission) |

## Construire sous Windows

Python 3.10+, le compilateur C# .NET Framework de Windows et un dossier contenant le runtime Neutralino 6.4.0 (`Escouade.exe` + `resources.neu`) :

```powershell
python tools/build.py 1.6.1 --runtime "C:\chemin\Escouade" --out dist
```

Le ZIP contient `Escouade.exe`, `resources.neu`, `Organisateur Escouade.exe` et `Capture Escouade.exe`, à garder ensemble. `--reuse-organizer` et `--reuse-capture` réutilisent les outils inchangés après contrôle SHA-256 (utile hors Windows). Le jeton Neutralino est à usage unique : seule `/js/neutralino.js` est chargée.

## Données

```powershell
python tools/sync_items.py --from <catalogue>\donnees   # catalogue complet depuis un export local
python tools/sync_items.py --api                       # ou directement depuis Dofusdude
python tools/sync_reference.py                 # index DofusDB (Ocre, métiers, succès)
python tools/import_audit.py <audit.json>      # parcours, Dofus et positions relues
```

## Tests

```powershell
npm install
npm test               # scénarios de régression
npm run test:scan      # scan : panneau Dofus 3 synthétique, chat ignoré, OCR local
npm run test:banque    # catalogue et carte, sans réseau
npm run test:services  # API réelles (Internet)
npm run captures       # aperçus avec données de démonstration
```

`CHROME_EXECUTABLE` permet d’indiquer un autre Chrome que celui de Windows. Les résultats vont dans `test-results` (non versionné).

## Règles du projet

Voir `AGENTS.md` : pas de publication ni de modification de `update.json` sans accord explicite, préservation des sauvegardes et du profil `.tmp`, aucune action de jeu à la place du joueur (l’organisateur et la capture ne font que sélectionner, afficher ou photographier une fenêtre choisie), pas de visuels Ankama, captures et relevés personnels jamais versionnés.
