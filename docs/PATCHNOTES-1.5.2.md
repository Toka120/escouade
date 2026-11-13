# Escouade 1.5.2 — Positions confirmées et Déchireuse

Correctif local du 13 novembre 2026, préparé par Claude à partir de l'état réel de la 1.5.1. Aucune publication, aucun push, `update.json` inchangé.

## Changements

- **Plus aucune position « à confirmer ».** Les 10 donjons encore signalés (Bworkette, Koulosse, Kanigroula, Meulou, Chêne Mou, Grolloum, Papa Nowel, Père Fwetar, Vortex, Maître Corbac) ont été relus un par un dans leur guide détaillé de Dofus pour les Noobs. Chaque guide confirme la valeur déjà affichée par Escouade. L'écart venait d'une liste tierce : signes inversés (Bworks, Kanigroula) ou lignes décalées (Nowel, Grolloum, Koulosse). Quand la fiche détaillée de cette même source existe (Bworks, Chêne Mou), elle donne la même valeur que le guide. Chaque position porte désormais « Entrée selon le guide · vérifiée le 2026-11-13 » avec le lien de la source.
- **Déchireuse :** son guide est de nouveau en ligne. Le lien « Ouvrir » mène au guide et non plus au catalogue. Le message « Guide indisponible » est retiré. La fiche affiche l'entrée [12,2] dans la dimension Osavora et l'accès par le portail de la Tour des Voyageurs [-22,-24].
- **Conditions d'accès utiles** affichées sous la position, d'après les guides :
  - Koulosse : se placer devant le Gardien Koalak avant de lui parler ;
  - Chêne Mou : parler à Josette Taplane ;
  - Grolloum : bateau pour Sakaï depuis Madrestam [12,-3] ;
  - Papa Nowel : quête Sapik épique et Colégram terminée ;
  - Vortex : recherche de portail pour entrer dans Xélorium ;
  - Maître Corbac : entrée libre sans clef depuis la maintenance du 21/01/2025.
- **Filtre « Mon niveau » des donjons :** la plage affichée reste entre 1 et 200. Au niveau 1, il indiquait auparavant « -9–11 ».
- **Outils :**
  - les tests acceptent `CHROME_EXECUTABLE` pour utiliser un autre Chrome que celui de Windows ;
  - `tools/build.py --reuse-capture` réutilise l'outil de capture inchangé après contrôle de son SHA-256, comme `--reuse-organizer`. La compilation par `csc.exe` reste le comportement par défaut.

Fichiers modifiés : `data/dungeon-positions-reviewed.json`, `src/content.js` (régénéré par `tools/import_audit.py`), `src/escouade.html` (3 lignes et la version), `tests/smoke.cjs`, `tests/scan.cjs`, `tests/services.cjs`, `tools/build.py`, `package.json`, `docs/`.

## Vérifications réellement effectuées

- **48/48 scénarios de régression réussis** (Chrome sans interface, Linux). Le test des positions a été renforcé :
  - Déchireuse : position, lien du guide, accès Osavora et absence du message « Guide indisponible » ;
  - Bworkette et Kanigroula : valeurs vérifiées ;
  - Maître Corbac et Vortex : conditions d'accès ;
  - 30 positions résolues ;
  - aucune mention « Position à confirmer ».
- **10/10 vérifications Scan réussies**, dont l'OCR français réellement exécuté hors ligne.
- **5/5 services en ligne réussis** : recherche d'équipements, fiche objet, recette, Almanax et indices de chasse.
- **Paquet construit et contrôlé :**
  - par rapport à la 1.5.1, seuls `index.html`, `widget.html`, `content.js` et la version de configuration changent ;
  - un seul chargement de `neutralino.js`, aucun `__neutralino_globals.js` ; le widget n'injecte pas la bibliothèque ;
  - la liste des autorisations natives est inchangée.
- **Lancement réel du paquet construit** avec le moteur Neutralino 6.4.0 (version Linux, mode navigateur) :
  - mode bureau actif au premier chargement et après rechargement, ce qui confirme que le jeton n'est consommé qu'une fois ;
  - lecture native de fichier autorisée ;
  - version 1.5.2 affichée et aucune erreur JavaScript.
- **Exécutables :** `Escouade.exe`, `Organisateur Escouade.exe` et `Capture Escouade.exe` sont repris de la 1.5.1 sans modification, après contrôle de leur SHA-256 dans le manifeste.

## Limites

- Les positions sont vérifiées dans les guides, **pas en jeu**. Si une entrée diffère dans Dofus, la signaler pour correction.
- **Aucun test Windows natif ni Dofus pendant cette livraison :**
  - aucune prise de contrôle du PC ni capture d'écran ;
  - le cycle réel « Capturer une fenêtre Dofus → image dans Scan et import » reste à confirmer lors d'un essai volontaire ;
  - F6/F7 reste validé par le test réel de la 1.5.0.
- Les captures de `Visuels/Captures` sont celles de la 1.5.1 générées sous Windows. Elles ne sont pas remplacées, car les polices du rendu Linux diffèrent. Seule la plage du filtre Donjons a changé visuellement.
- Si Escouade était ouverte pendant la livraison, la fermer puis la rouvrir pour charger la 1.5.2. Les données et le profil `.tmp` sont conservés.
