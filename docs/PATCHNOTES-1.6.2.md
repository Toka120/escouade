# Escouade 1.6.2 — Encyclopédie façon hôtel des ventes, avec images

Version locale du 14 novembre 2026. Aucune publication sur le canal de mise à jour : `update.json` et le `resources.neu` public sont inchangés.

## Encyclopédie

La rubrique « Catalogue Dofus » devient **Encyclopédie** et reprend la présentation de l’encyclopédie et de l’hôtel des ventes de Dofus. L’ancienne recherche en ligne s’appelle désormais « Recherche en ligne ».

- **Onglets** : Équipements, Consommables, Ressources, Cosmétiques, Objets de quête, Montures, avec le nombre d’objets de chacun.
- **Colonne de filtres**, à cocher comme en jeu :
  - recherche par nom ou panoplie, niveaux de/à et bouton « Mon niveau » ;
  - **catégories en icônes** (dessinées pour Escouade) : amulette, anneau, arme, bottes, bouclier, cape, ceinture, chapeau, Dofus et trophée, familier, monture, compagnon, outil, percepteur. Plusieurs icônes peuvent être choisies ensemble ;
  - **Caractéristiques primaires** : PA, PM, Portée, Invocation, Vitalité, Force, Intelligence, Chance, Agilité, Sagesse, Puissance, Critique ;
  - **Caractéristiques secondaires** : Tacle, Fuite, Retrait et Esquive PA/PM, Initiative, Soins, Prospection, Pods ;
  - **Dommages** : fixes, par élément, critiques, poussée, pièges, puissance des pièges, renvoi, % armes, sorts, distance et mêlée ;
  - **Résistances** : en % et fixes par élément, critiques, poussée, % distance et mêlée ;
  - **Effets de l’arme** : dommages, vol et soins par élément, meilleur élément ;
  - **Catégories d’armes**, de **familiers et montures**, de **Dofus / trophées**, et **d’équipement** (chaque type avec son nombre d’objets) ;
  - **Moyens d’obtention** : fabricable ou non ;
  - **Panoplie** : dans une panoplie, hors panoplie, ou une panoplie précise ;
  - « Réinitialiser les filtres ».
  - Les caractéristiques cochées doivent toutes être présentes ; les catégories cochées s’additionnent.
- Sur les autres onglets, les catégories sont la liste des types du jeu (Minerai, Bois, Potion, Parchemin d’attitude, Alignement…) avec leur nombre d’objets.
- **Tableau** :
  - image et nom, catégorie (avec un repère pour une pièce de panoplie), obtention (marteau si fabricable), niveau, prix noté ;
  - tri par nom, catégorie ou niveau en cliquant l’en-tête ;
  - compteur « N élément(s) correspondant à tes critères » et pages de 50.
- **Prix** : Escouade n’a pas accès aux prix de l’hôtel des ventes. La colonne reprend les prix que tu as notés dans Crafts & ressources.
- **Fiche** : grande image, effets, conditions, recette avec images, « Utilisé dans », panoplie et ses bonus, ajout aux crafts, objet visé dans le Stuff.

## Images

- Chaque objet affiche son image à côté de son nom, dans la liste, la fiche, la recette et la panoplie.
- Les images ne sont **pas incluses** dans Escouade : elles sont chargées au fur et à mesure depuis le serveur d’images de Dofusdude quand Internet est disponible. Sans connexion, la case reste vide et tout le reste fonctionne.
- Case « Images des objets (Internet) » en bas des filtres pour les couper ; ce choix est mémorisé dans tes paramètres.
- Le catalogue garde seulement le numéro d’icône de chaque objet (`items.js` passe de 2,7 à 2,9 Mo).

## Tests réellement effectués

- Régression : 48/48.
- Scan : 15/15.
- Encyclopédie et carte : 9/9, sans réseau :
  - comptages, absence d’image embarquée ;
  - adresse et chargement différé des images, case pour les couper ;
  - 14 icônes et 6 onglets ;
  - filtres : anneau seul = 391 objets, anneau + amulette = 725, Sagesse et PA à la fois, niveau minimum ;
  - fiche avec bonus de panoplie, crafts et stuff ;
  - ingrédient avec « Utilisé dans » ;
  - catégorie Minerai = 20 ressources, montures ;
  - tri et échappement du texte.
- Services en ligne : 5/5.
- Aperçu avec Internet : les images des objets s’affichent depuis Dofusdude.
- Paquet 1.6.2 construit et lancé avec le moteur Neutralino 6.4.0 (Linux). Exécutables inchangés, vérifiés par SHA-256.
- Non testé sous Windows par moi.
