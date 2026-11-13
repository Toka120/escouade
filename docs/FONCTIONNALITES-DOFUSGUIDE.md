# Comparaison fonctionnelle — DofusGuide / Escouade 1.3.0

Relevé visuel de l'application ouverte le 12 novembre 2026. Il s'agit des fonctions observées, pas d'un inventaire de son code ou d'une garantie de parité exhaustive.

| Fonction observée dans DofusGuide | Disponible dans Escouade | Écart / suite |
|---|---|---|
| Guides de progression et Dofus | Parcours 1–200, étapes cochables et guides sources ; collection Dofus | Les quêtes détaillées ne sont pas reproduites intégralement |
| Catalogue d'équipements PvE/PvP | Recherche d'objets par nom/niveau ; bibliothèque de builds personnelle filtrable | Pas de copie automatique du catalogue éditorial Huzounet/DofusGuide ; accès au site source |
| Recherche d'objets et recettes | Encyclopédie, recette et ajout d'une quantité aux crafts | Connexion nécessaire pour obtenir une nouvelle recette |
| Liste de ressources pour les crafts | Agrégation, stock commun, manques, prix manuels et fabrication suivie | Pas de relevé automatique de l'inventaire ou des prix du jeu |
| Métiers et itinéraires de récolte | Niveaux des 22 métiers par personnage et carte de ressources externe | Itinéraires détaillés non embarqués |
| Ocre et nombre d'exemplaires | Index actuel de 337 captures, zones, étapes, types et possession | Source de quête actuelle différente de l'ancienne liste affichée dans DofusGuide |
| Succès : niveaux, épingles, complétion | 2 777 succès, filtres, points et cases par personnage | Conditions et récompenses détaillées sur la fiche source |
| OptiDonjons : succès et quêtes | Rapprochement par nom, parcours, notes et liens | Rapprochements partiels ; toutes les quêtes liées à chaque donjon ne sont pas indexées |
| Assistant de chasse | Recherche X/Y/direction/indice, propositions, historique et copie /travel | Dépend de la disponibilité et de la couverture de DofusDB ; Phorreurs en jeu |
| Almanax sur une période | 1/7/14/30 jours, bonus, offrandes et suivi individuel | Calendrier chargé en ligne, sans notification système |
| Organisateur de fenêtres et raccourcis | Outil Windows fourni, ordre, initiative manuelle, tri et F1–F12 | Ordre valable pendant la session ; aucun lancement des clients Dofus ni profil persistant de raccourcis |
| Recherche de groupe Discord | Annonces locales et copie manuelle du message | Service Discord différé à la demande de l'utilisateur ; nécessite hébergement/OAuth et politique de confidentialité |
| Liens vers outils externes | Huzounet, Dofusbook, DofusDB, Dofus pour les Noobs | Autres services à ajouter selon les besoins |

## Choix pour la suite Discord

Les annonces locales conservent déjà serveur, activité, horaire, places et note. Une future API pourra reprendre ce modèle. Aucun jeton Discord, secret d'application, connexion ou bot n'est simulé ou créé dans cette version.

## Confidentialité réseau

Les données personnelles de progression restent dans la sauvegarde locale. Les recherches en ligne transmettent aux fournisseurs les termes recherchés, les coordonnées saisies pour les chasses et les dates de calendrier ; les fournisseurs reçoivent aussi les informations techniques normales d'une connexion (notamment l'adresse IP). Aucun profil Escouade ni message de groupe n'est envoyé par ces modules. Les sources sont indiquées dans l'interface et dans `docs/sources.md`.
