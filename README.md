# Escouade

Suivi de team Dofus : parcours, donjons, stuff, kamas et objectifs.

Ce dépôt sert de source de mises à jour pour l'application Windows **Escouade.exe** :

- `update.json` : version publiée et notes de version, lus par Paramètres > Rechercher une mise à jour.
- `resources.neu` : fichiers de l'application téléchargés lors de l'installation d'une mise à jour.

Aucune donnée de joueur n'est stockée ici : la progression reste sur le PC de chaque utilisateur.

## Publier une nouvelle version

1. Modifier `src/escouade.html`.
2. Construire : `python3 tools/build.py 1.2.0` (projet Neutralino initialisé avec `tools/neutralino.config.json` et `neu update`).
3. Copier le `resources.neu` produit à la racine, puis mettre `version` et `notes` à jour dans `update.json`.
4. Pousser sur `main` : les applications installées proposent la mise à jour depuis Paramètres.
