# Sources des repères de jeu

Relevé du 12 novembre 2026. Les index sont embarqués ; les nouvelles recherches d'objets, recettes, indices de chasse et le calendrier Almanax sont chargés en ligne. Les prix sont saisis par le joueur.

- [Dofus pour les Noobs : donjons](https://www.dofuspourlesnoobs.com/donjons.html) : noms, niveaux, coordonnées, liens des guides et repères de capture.
- [Guide 1–50](https://www.dofuspourlesnoobs.com/guide-de-progression-dofus3-p2.html), [51–90](https://www.dofuspourlesnoobs.com/guide-de-progression-dofus3-p3.html), [91–150](https://www.dofuspourlesnoobs.com/guide-de-progression-dofus3-p4.html), [151–200](https://www.dofuspourlesnoobs.com/guide-de-progression-dofus3-p5.html) : jalons de parcours. L'étape 42 est un lien de poursuite, pas une tâche à cocher. Les quêtes détaillées et leurs prérequis restent dans les guides.
- [Dofus en jeu](https://www.dofuspourlesnoobs.com/les-dofus.html) : collection de 30 références et niveaux d'équipement.
- [Huzounet : éléments des classes](https://huzounet.fr/guides/les-elements-des-classes), [caractéristiques](https://huzounet.fr/guides/comprendre-les-caracteristiques) et [familier](https://huzounet.fr/guides/xp-son-familier-sur-dofus) : conseils et repères des outils.

Les données complémentaires ont été préparées par Claude dans l'audit fourni séparément, puis réduites par `tools/import_audit.py` dans `src/content.js`. Les positions contestées ont été relues dans chaque guide détaillé (19 en 1.4.1, 10 plus la Déchireuse en 1.5.2) ; voir `docs/POSITIONS-REVISEES.md`. Ces vérifications sont documentaires, pas faites en jeu. Le niveau d'une pierre d'âme est un repère de capacité : le joueur doit vérifier le monstre de plus haut niveau du groupe.

## Données des modules 1.3.0

- [API DofusDB](https://api.dofusdb.fr/) : quête 439 et ses objectifs de capture, noms et zones des monstres, métiers, succès, recettes, noms des ingrédients et indices publics. `tools/sync_reference.py` construit les index de `src/reference.js` : 337 captures (51 boss et 286 archimonstres), 22 métiers et 2 777 succès. Aucun visuel de DofusGuide n'est copié.
- [Dofusdude — client API publié par son auteur](https://github.com/dofusdude/dofusdude-ts) : recherche d'objets `dofus3/v1/fr/items/{equipment,resources,consumables}/search`, calendrier `dofus3/v1/fr/almanax` et paramètres de période. Les appels partent vers `https://api.dofusdu.de/`.
- [Huzounet](https://huzounet.fr/) et [Dofusbook](https://www.dofusbook.net/fr/) : accès aux catalogues et liens de builds enregistrés par le joueur. Aucun catalogue éditorial complet n'est aspiré ou embarqué.

L'écart entre l'ancienne liste Ocre visible dans DofusGuide et les objectifs actuels n'est pas masqué : Escouade utilise les identifiants de monstres des objectifs de la quête dans la source actuelle. Le contrôle des succès est manuel, et l'association succès/donjon dans OptiDonjons est un rapprochement de noms qui peut être incomplet. Voir la comparaison fonctionnelle.

Les visuels de maquette ont été générés dans cette conversation. La bannière et le blason utilisés dans l'interface sont des extractions des maquettes, avec une définition inférieure aux images complètes. Les noms DOFUS et ceux des classes/objets appartiennent à leurs titulaires ; l'application est indépendante et non affiliée à Ankama.

## Révision 1.4.1 du 13 novembre 2026

Les 19 contradictions entre liste générale et guides détaillés ont été relues dans les introductions des guides. Les entrées indiquées par les guides sont désormais utilisées ; les accès aux dimensions restent distincts. Voir `POSITIONS-REVISEES.md` et `data/dungeon-positions-reviewed.json` pour les valeurs, liens et dates. Dix désaccords avec une autre source restent signalés comme incertains.

## Données ajoutées en 1.6.0

- [Dofusdude](https://api.dofusdu.de/) (`dofus3/v1/fr/items/{equipment,resources,consumables}/all`) : banque d’objets hors ligne `src/items.js`, générée par `tools/sync_items.py`. Elle contient 2 533 équipements, armes, Dofus, trophées et montures des niveaux 1 à 120, avec leurs effets affichés, panoplies, recettes, noms des ingrédients, données d’arme et conditions. Les images et descriptions ne sont pas copiées ; chaque fiche renvoie vers DofusDB.
- [Carte DofusDB](https://dofusdb.fr/fr/tools/map) : affichée dans Escouade depuis le site DofusDB, Internet nécessaire. Escouade copie seulement des commandes `/travel x,y` que le joueur colle lui-même.
- Scan : disposition du panneau Caractéristiques de Dofus 3 relevée sur une capture fournie par Toka, utilisée localement pour les mesures et non versionnée. Le test automatique dessine un panneau synthétique équivalent.
