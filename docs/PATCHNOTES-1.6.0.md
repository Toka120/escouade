# Escouade 1.6.0 — Scan complet, banque d’objets et carte DofusDB

Version locale du 13 novembre 2026, préparée par Claude. Aucune publication sur le canal de mise à jour : `update.json` et le `resources.neu` public sont inchangés. Les sources sont sur GitHub, dans la branche `dev/1.6.0` de Toka120/escouade.

## Capture → Scan : validé par Toka

La capture d’une fenêtre Dofus revient bien dans Escouade (essai de Toka le 13/11). La lecture de la 1.5.x prenait tout l’écran : chat, quêtes, nom de zone (« Niveau 10 » de la carte). Elle ne comprenait pas non plus le tableau ni la colonne d’icônes. Elle est entièrement refaite.

## Scan et import : toutes les caractéristiques

- **Repérage automatique du panneau Caractéristiques.** Escouade le repère grâce à ses libellés et ignore le reste de la capture : chat, suivi de quêtes, carte, barres d’XP, nom de zone. Plus besoin d’encadrer.
- **Lecture cellule par cellule** du panneau de Dofus 3 :
  - en-tête : niveau ;
  - colonne d’icônes : PV, Force, Intelligence, Chance, Agilité, Sagesse ;
  - grille centrale : PA, PM, portée, critique, puissance, invocations, pods, prospection, tacle, fuite, retrait et esquive PA/PM, initiative, soins, renvoi ;
  - tableau **DMG · RES · RES.%** : chaque valeur est placée selon sa colonne (éléments, critiques, poussée, sorts, armes, distance, mêlée), et les cases « - » restent vides ;
  - bas du panneau : points restants.
- **Fiabilité :**
  - deux rendus du même panneau : contraste normal pour les valeurs blanches, contraste fort pour les « 0 » gris ;
  - une case encore vide est relue seule, en chiffres uniquement ;
  - le signe moins est vérifié entre les passes ;
  - une valeur douteuse reste vide plutôt que fausse.
- **Autres captures** (info XP, inventaire) : lecture par libellés plus tolérante, deux colonnes par ligne, sections Dommages/Résistances, « PV x / y ». Les lignes de chat (horodatées, liens, `(/g)`) et les quêtes sont filtrées.
- **60 champs**, dont 12 nouveaux :
  - Vitalité et Dommages ;
  - Dommages pièges et Puissance pièges ;
  - % Dommages armes, sorts, distance et mêlée ;
  - % Résistance sorts, armes, distance et mêlée.
- **Relecture :** les valeurs lues sont remplies automatiquement et encadrées en doré, regroupées par section avec un compteur. Rien n’est enregistré sans clic.
- **Application au suivi**, cochée par défaut :
  - niveau, PA, PM, portée, vitalité et sagesse ;
  - la meilleure stat élémentaire devient la stat principale ;
  - la moyenne des résistances % devient la résistance moyenne.
  - Le journal de kamas, les compteurs d’XP et le stock ne sont pas modifiés. Une sauvegarde précède chaque enregistrement.
- **Diagrammes :**
  - radar des six caractéristiques ;
  - barres dommages / résistances par élément ;
  - **évolution** entre relevés (niveau, vitalité, puissance, sagesse, initiative), avec un historique des 60 derniers relevés par personnage, validé à l’import.

### Mesures réelles

Toutes ces mesures sont faites sur une capture réelle du panneau fournie par Toka. Cette capture a servi localement uniquement : elle n’est ni versionnée ni livrée.

| Capture | Valeurs exactes | Valeurs fausses | Temps |
|---|---|---|---|
| 1920 × 1057 (originale) | **52 / 52** | 0 | ≈ 4–6 s |
| réduite à 1600 | 52 / 52 | 0 | |
| réduite à 1280 | 51 / 52 (Puissance vide) | 0 | |
| agrandie à 2560 | 50 / 52 (Critique et points restants vides) | 0 | |
| paquet 1.6.0 lancé par le moteur Neutralino | 52 / 52 | 0 | ≈ 7,7 s |

Avant cette refonte (1.5.2), la même capture donnait un texte inexploitable.

## Banque d’objets (nouvelle rubrique)

- **2 533 objets** des niveaux 1 à 120 :
  - équipements, armes et boucliers ;
  - Dofus et trophées ;
  - familiers, montures et compagnons ;
  - outils.
- **Embarqués hors ligne** dans `items.js` (634 Ko, chargé à l’ouverture de la page).
- **Recherche et tri :**
  - par nom ou panoplie, type, caractéristique (Sagesse, Vitalité, PA…) et plage de niveaux ;
  - bouton « Mon niveau » ;
  - tri par niveau, par nom ou par **valeur de la caractéristique**.
- **Fiche :**
  - effets affichés comme en jeu ;
  - panoplie, avec un bouton qui en filtre les pièces ;
  - pods et données d’arme (PA, portée, critique, utilisations par tour) ;
  - conditions ;
  - recette avec les noms des ingrédients et leurs liens DofusDB.
- **Actions :** **Ajouter aux crafts** (quantité, ingrédients nommés, liste de courses existante) et **Viser cet objet** dans l’emplacement adéquat du Stuff (anneau ou Dofus libre choisi automatiquement).
- Ni images ni descriptions d’Ankama : chaque fiche renvoie vers DofusDB. Source : Dofusdude (données publiques du jeu), régénérable avec `python tools/sync_items.py --min 1 --max 120`. Pour étendre à 1–200, il suffit de changer `--max`.

## Carte DofusDB (nouvelle rubrique)

- Carte interactive DofusDB intégrée à la page (Internet nécessaire), avec un bouton « Ouvrir dans le navigateur ».
- **Aller à une position** : copie `/travel x,y` à coller toi-même dans le chat de Dofus. Escouade n’envoie rien au jeu.
- **Donjons à ton niveau** (±10) avec leur position ; un clic copie la commande `/travel`.

## Autres

- Positions de donjons de la 1.5.2 incluses : toutes vérifiées dans les guides, la Déchireuse a de nouveau son guide.
- Menu : 25 rubriques, dont « Banque d’objets » et « Carte DofusDB » dans Outils de jeu. Elles sont épinglables en widget comme les autres.
- Construction :
  - `banque.js` et `items.js` sont ajoutés au paquet ;
  - `--reuse-capture` reprend l’outil de capture après contrôle SHA-256 ;
  - les serveurs de test servent les nouveaux fichiers.
- Dépôt GitHub remis au propre (branche `dev/1.6.0`) : historique lisible 1.5.1 → 1.5.2 → 1.6.0, README réécrit, données personnelles exclues.

## Tests réellement effectués

- **Régression : 48/48** (Chrome sans interface, Linux), dont le démarrage sans erreur des 25 rubriques.
- **Scan : 13/13.** Six nouveaux contrôles :
  - panneau Dofus 3 synthétique dessiné comme le vrai, entouré d’un faux chat, de quêtes et d’un nom de zone. Au moins 34 des 37 valeurs doivent être exactes et aucune fausse (35/37 obtenues). Aucune valeur du chat (Force 999, PA 12, Initiative 9999…) ne doit être reprise ;
  - lecture de texte : sections, deux colonnes, signe moins, PV courants/max ;
  - application au personnage, historique et affichage des trois diagrammes.
  - Contrôles conservés : OCR réel hors ligne, retour natif de capture simulé (succès, annulation, échec, changement de personnage, chemin dangereux).
- **Banque et carte : 6/6, sans réseau :**
  - 2 533 objets sans image ;
  - recherche, fiche, ajout aux crafts, objet visé dans le stuff ;
  - filtre et tri par caractéristique ;
  - échappement du texte recherché ;
  - carte intégrée et `/travel` copié.
- **Services en ligne : 5/5** (équipements, fiche, recette, Almanax, indices).
- **Paquet construit et lancé** avec le moteur Neutralino 6.4.0 (version Linux, mode navigateur) :
  - mode bureau actif, version 1.6.0 ;
  - banque chargée depuis le paquet ;
  - carte affichée ;
  - OCR embarqué fonctionnel (52/52 sur la vraie capture).
  - Un seul chargement de `neutralino.js`, autorisations natives inchangées.
- **Exécutables** `Escouade.exe`, `Organisateur Escouade.exe` et `Capture Escouade.exe` identiques à la 1.5.x, vérifiés par SHA-256.

## Limites

- Lecture conçue pour le panneau Caractéristiques de Dofus 3 en français, tel qu’affiché le 13/11/2026. Une interface très différente (autre langue, mise à l’échelle extrême) peut laisser des cases vides : elles se complètent à la main. Toujours vérifier avant d’enregistrer.
- Je n’ai pas lancé Escouade 1.6.0 sous Windows. La capture → retour d’image a été validée par Toka sur la 1.5.2. Le moteur OCR, la banque et la carte ont été vérifiés dans le paquet construit, avec le moteur Neutralino Linux.
- La carte DofusDB dépend du site DofusDB et d’Internet. Si l’intégration est refusée par WebView2, le bouton « Ouvrir dans le navigateur » reste disponible.
- Banque limitée aux niveaux 1–120 pour ce test. Prix HDV toujours manuels.
- Aucune publication ni mise à jour automatique : il faut ton accord explicite pour modifier `update.json`.
