# Escouade 1.2.1 — notes de livraison

**12 novembre 2026 · version locale de test**, préparée avec Claude et revue/corrigée par Codex sous Windows. La version publique GitHub n'a pas été remplacée. Cette livraison est un paquet portable ; elle n'est pas une publication Microsoft Store.

## Interface et équipe

- Identité bleu nuit et or, bannière d'accueil et blason issus des maquettes choisies.
- Accueil avec quatre indicateurs, personnages, priorités et prochain donjon.
- Jusqu'à huit personnages : nom, serveur, classe, élément, niveau, objectif de niveau et rôle libre.
- Niveau, XP, sessions, donjons, équipement, parcours et collection de Dofus séparés par personnage.
- Kamas, objectifs et notes partagés par la team.
- Navigation avec icônes et sélecteur de personnage.
- Thèmes sombre, clair et système ; densité confortable/compacte ; interface à 90, 100, 110 ou 125 % ; réduction des animations et onglet au démarrage.

## Parcours et repères de jeu

- Parcours étendu de 14 à **41 étapes de suivi**, couvrant les niveaux 1 à 200. L'étape 42 du guide est proposée comme lien de poursuite.
- Choix de l'étape de départ, sans cocher artificiellement les précédentes.
- Les sauvegardes 1.x reprennent la tranche 91–150 à partir de l'étape 17 ; leurs étapes déjà cochées sont conservées.
- Chaque étape renvoie vers la bonne partie du guide Dofus pour les Noobs.
- Collection de **30 Dofus**, avec niveau d'équipement et statut obtenu propre au personnage.
- Catalogue des 131 références de donjons existantes conservé.
- Lien cassé de la Déchireuse remplacé par la liste source.
- **29 positions contestées signalées**, avec les coordonnées alternatives du guide lorsqu'elles sont disponibles. Aucune position n'est annoncée comme vérifiée en jeu.
- Repères de capacité de pierre d'âme pour 70 boss ; il faut vérifier le niveau maximal du groupe en jeu.
- Indication des donjons d'événements saisonniers.
- Ajout manuel d'un donjon et retrait avec copie de sécurité.
- Les références sont datées, embarquées et attribuées à Huzounet et Dofus pour les Noobs. Elles ne constituent pas une synchronisation en direct.

## Objectifs, budget et outils

- Objectifs modifiables : titre, catégorie et note.
- Cible chiffrée facultative, unité, avancement et barre de progression ; passage en terminé à l'atteinte de la cible.
- Historique des kamas paginé : les opérations au-delà des trente premières restent accessibles.
- Achat d'équipement lié au budget commun, avec contrôle du statut et du prix.
- Calculateur de points de caractéristiques : paliers d'un élément, coût au niveau courant et Sagesse possible avec le reste.
- Budget familier : estimation du nombre de croquettes et du coût à partir de l'XP acquise et du prix saisi.
- Prix et données de sessions saisis manuellement ; aucune connexion au compte Ankama et aucun achat ou combat automatisé.

## Sauvegardes et corrections de fiabilité

- Migration 1.x vers le format multi-personnages ; copie de l'original avant conversion.
- Export JSON par fenêtre native Windows, avec destination initiale dans le dossier de l'application.
- Export de fichier également disponible dans le navigateur, sans imposer le presse-papiers.
- Import par texte, fichier ou glisser-déposer.
- Validation structurelle des sauvegardes : types, valeurs non finies, identifiants, versions, nombre de personnages et structures imbriquées.
- Imports invalides rejetés avant remplacement de l'état courant. Taille de fichier/texte limitée à 5 Mo.
- Protection contre l'injection de HTML via les identifiants importés et contre les clés de pollution de prototype.
- Copie de sécurité avant import, suppression de personnage/donjon et réinitialisation ; restauration de la dernière copie.
- Si la copie de sécurité échoue, l'action destructive est bloquée et un message l'indique.
- Une sauvegarde locale illisible est conservée pour export/récupération ; les nouvelles données ne l'écrasent pas sans en conserver le contenu.
- Notes enregistrées dès la saisie : fermeture ou rechargement immédiat pris en charge.
- Les échecs d'enregistrement local sont affichés, au lieu d'être ignorés.
- Une dépense saisie avec un montant négatif ne devient plus un gain.
- Montants aux suffixes k/m analysés strictement ; valeurs de prix et d'XP négatives bornées.
- Durées XP arrondies et formatées en heures/minutes ; dates de session fondées sur la date locale.
- Tous les emplacements standards du stuff sont reconstruits lors de l'import d'une liste partielle.

## Correction Windows majeure

L'application 1.1 chargeait les variables de connexion puis la bibliothèque Neutralino. Le serveur Neutralino 6.4 ajoute déjà ces variables à la bibliothèque : le jeton à usage unique était consommé deux fois, laissant l'app en mode navigateur.

Le paquet ne charge désormais la bibliothèque qu'une seule fois, sans désactiver la protection du jeton. Le mode Windows, la recherche de mise à jour et la fenêtre native d'export ont été observés dans un véritable exécutable sous Windows. Un JSON natif de test a été écrit et relu avec succès.

## Vérifications réalisées

**23 scénarios automatisés sous Windows avec Chrome headless**, dont :

1. Démarrage des onze rubriques sans erreur JavaScript.
2. Migration d'une sauvegarde 1.1 représentative.
3. Isolation des personnages et persistance du thème/de la sélection.
4. Rejet d'imports structurellement ou numériquement invalides.
5. Rejet des montants négatifs inversant une dépense.
6. Conservation d'une note avant rechargement immédiat.
7. Arrondi des durées.
8. Protection contre le HTML injecté dans une sauvegarde.
9. Import puis restauration.
10. Parcours étendu et reprise des anciennes étapes.
11. Collection Dofus par personnage.
12. Préférences de confort et onglet de départ.
13. Objectif chiffré et validation automatique.
14. Historique de plus de trente opérations.
15. Export puis réimport d'un fichier.
16. Paliers de caractéristiques et nombre de croquettes.
17. Blocage de la réinitialisation si la copie échoue.
18. Principaux écrans à 420 pixels de large.
19. Glisser-déposer.
20. Export d'une sauvegarde locale illisible.
21. Débit et statut après achat de stuff.
22. Limite de huit personnages.

Certains points ci-dessus regroupent plusieurs scénarios ; les 23 résultats individuels exacts sont dans `resultats-tests.json`.

Le paquet de ressources est également relu après construction et les SHA-256 sont vérifiés. Les captures de l'interface ont été générées avec des données de démonstration et inspectées visuellement sur les principaux écrans.

## Contenu du dossier Visuels

- Cinq maquettes PNG originales, séparées et nommées.
- Quatorze captures PNG de l'interface : onze rubriques sombres et trois écrans clairs.
- Blason PNG, icône PNG et bannière JPEG extraits des ressources d'interface.
- Les maquettes sont des concepts ; les captures correspondent au code de l'application en mode navigateur.

## Limites et suite

Dernière vérification : les 23 scénarios automatisés passent après correction du message des étapes sans donjon et suppression d'une référence d'article présentée comme une quête. L'application Windows et son export natif ont également été vérifiés.

- Les tests réduisent les risques ; ils ne garantissent pas l'absence de tout bug.
- Les positions signalées restent à confirmer dans le jeu, et les variantes/succès particuliers restent documentés sur les sites sources.
- Le parcours est une checklist de jalons, pas une reproduction complète des quêtes, des prérequis ou des mécaniques de combat.
- Pas de prix HDV temps réel, synchronisation Ankama, suivi automatique du jeu ou service cloud propre à Escouade.
- Le paquet ne contient pas encore d'installateur signé ni de MSIX certifié. Le dossier `Publication future` prépare la fiche produit et décrit les travaux restants.
- La publication GitHub et la version hébergée restent distinctes de cette livraison locale ; aucune fusion vers `main` ni mise à jour publique n'est faite automatiquement.

Sources et détail de l'audit : `docs/sources.md` dans les sources et dossier `Audit Claude` dans la livraison.
