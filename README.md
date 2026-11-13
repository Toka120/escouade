# Escouade

Suivi de team Dofus : parcours, donjons, stuff, kamas et objectifs.

Ce dépôt sert de source de mises à jour pour l'application Windows **Escouade.exe** :

- `update.json` : version publiée et notes de version, lus par Paramètres > Rechercher une mise à jour.
- `resources.neu` : fichiers de l'application téléchargés lors de l'installation d'une mise à jour.

Aucune donnée de joueur n'est stockée ici : la progression reste sur le PC de chaque utilisateur.

## Version de travail 1.4.1

Interface bleu nuit et or, jusqu'à 8 personnages, parcours 1–200, Ocre, succès, métiers, recettes et stock, builds, Almanax, chasses, groupe local et organisateur Windows. Voir `docs/PATCHNOTES-1.3.0.md`, `docs/FONCTIONNALITES-DOFUSGUIDE.md` et `docs/sources.md`.

Les 22 rubriques sont détachables en widgets Windows au premier plan, avec bloc au choix et suivi de la prochaine quête. Voir `docs/PATCHNOTES-1.4.0.md` et `docs/UTILISER-LES-WIDGETS.md`. `src/widgets.js` et `src/widgets.css` gèrent leur présentation et la synchronisation locale. Garder la fenêtre principale ouverte, éventuellement réduite.

`src/escouade.html`, `src/guide.js`, `src/content.js` et `src/reference.js` forment l'interface. Les données de jeu sont séparées pour permettre leur mise à jour avec leurs sources. `python tools/sync_reference.py` renouvelle les index publics DofusDB et demande un accès réseau.

## Construire sous Windows

Python 3.10 ou plus, le compilateur C# .NET Framework de Windows et un dossier Escouade contenant le runtime Neutralino 6.4.0 (`Escouade.exe` + `resources.neu`) sont nécessaires à la construction :

```powershell
python tools/build.py 1.4.1 --runtime "C:\chemin\Escouade" --out dist
```

Le script conserve le runtime et sa bibliothèque, produit le paquet de ressources et compile `tools/Organisateur.cs`. Le ZIP final contient `Escouade.exe`, `resources.neu` et `Organisateur Escouade.exe`, à garder ensemble. La construction ne modifie pas l'installation d'origine. Les fichiers sont contrôlés par SHA-256.

Pour une validation isolée, ajouter `--test-port 52736 --out validation`. Ne pas utiliser le profil de validation comme sauvegarde personnelle.

## Tests

```powershell
npm install
npm test
npm run captures
npm run test:services
```

Les 48 scénarios déterministes utilisent Chrome installé sous Windows. `test:services` vérifie séparément cinq API réelles et nécessite Internet. `CHROME_EXECUTABLE` peut définir son chemin pour les captures. Les résultats et PNG vont dans `test-results`, avec des données de démonstration uniquement.

## Publication ultérieure

La livraison de test ne change pas `update.json` ni le `resources.neu` public. Publier une mise à jour demandera de tester le paquet, puis de placer le nouveau `resources.neu` et son manifeste sur le canal de distribution retenu. Les textes de fiche et les points à préparer pour Microsoft Store sont dans `distribution/`. Aucun paquet Store certifié n'est inclus.

## Intégration Claude 1.4.1

Objectifs adaptés au niveau, menu regroupé et mise à jour par paquet complet. Voir `AGENTS.md` et `docs/PATCHNOTES-1.4.1.md`. Les 19 corrections de positions sourcées sont dans `data/dungeon-positions-reviewed.json`.

Pour réutiliser l’Organisateur inchangé, ajouter `--reuse-organizer` à la construction : le fichier est contrôlé avec le manifeste SHA-256 du runtime.
