# Escouade 1.6.1 — Catalogue Dofus complet, nom et classe dans le scan

Version locale du 14 novembre 2026. Aucune publication sur le canal de mise à jour : `update.json` et le `resources.neu` public sont inchangés.

## Catalogue Dofus (remplace la banque 1–120)

- Import du catalogue fourni par Toka (export du 14/11/2026, données Dofusdude du jeu 3.7.13.17). Les empreintes SHA-256 des 10 fichiers JSON ont été vérifiées avant import ; elles sont notées dans `data/catalogue-provenance.json`.
- Contenu, tous niveaux de 0 à 200 :
  - 4 095 équipements, armes, Dofus, trophées, familiers et montures ;
  - 3 521 ressources et 3 375 consommables ;
  - 3 918 objets de quête et 2 493 cosmétiques ;
  - 941 panoplies avec leurs bonus selon le nombre d’objets portés ;
  - 308 montures (races) avec leurs effets.
  - Soit 17 402 objets, sans doublon d’identifiant.
- Rubrique renommée **Catalogue Dofus** :
  - onglets par catégorie, recherche par nom ou panoplie ;
  - filtres par type, caractéristique et niveau, tri par valeur de caractéristique.
- Fiche :
  - effets, données d’arme et conditions ;
  - recette dont chaque ingrédient s’ouvre dans Escouade ;
  - **Utilisé dans** : les recettes qui demandent cet objet ;
  - pièces de la panoplie et **bonus de panoplie** ;
  - ajout aux crafts et objet visé dans le Stuff, comme avant.
- Toujours sans images, descriptions, prix HDV ni inventaire. `items.js` fait 2,7 Mo et n’est chargé qu’à l’ouverture de la rubrique.
- `tools/sync_items.py --from <dossier donnees>` régénère le catalogue depuis un export local ; `--api` le fait directement depuis Dofusdude.

## Scan : nom et classe

- Le nom écrit au-dessus de « NIVEAU 99 » et la classe juste à côté sont lus et remplissent le relevé. Le nom est encadré en doré.
- Une faute de lecture d’une lettre est corrigée si un personnage de ce nom existe déjà.
- Si le relevé ne correspond pas au personnage actif, Escouade propose de **passer sur ce personnage**, de **nommer le personnage actif** ou de **créer le personnage**. À l’enregistrement, la classe est appliquée si la case de mise à jour est cochée.
- Mesuré sur ta capture : « Xolmora » et « Xélor » sont lus aux quatre tailles testées. À 1280, la lecture « Xoimora » est corrigée par le rapprochement.

## En attente de tes captures

L’XP, l’énergie et la vue « diagramme » du panneau Caractéristiques ne sont pas encore lues. Il me faut des captures de ces écrans pour connaître leur disposition exacte.

## Tests réellement effectués

- Régression : 48/48.
- Scan : 15/15, dont les nouveaux contrôles du nom, de la classe et du changement de personnage.
- Catalogue et carte : 8/8, sans réseau :
  - comptages exacts par catégorie et identifiants uniques ;
  - absence d’images et de descriptions ;
  - bonus de panoplie ;
  - ingrédient ouvert dans Escouade avec « Utilisé dans » ;
  - onglets consommables et montures ;
  - crafts, stuff, filtres et échappement du texte.
- Services en ligne : 5/5.
- Paquet 1.6.1 construit et lancé avec le moteur Neutralino 6.4.0 (Linux) : mode bureau actif, catalogue chargé depuis le paquet, lecture de ta capture. Exécutables inchangés, vérifiés par SHA-256.
- Non testé sous Windows par moi.
