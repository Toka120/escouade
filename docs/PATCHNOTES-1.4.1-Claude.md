# Escouade 1.4.1 : proposition de Claude (version locale, non publiée)

Version du 13 novembre 2026, construite sur la 1.4.0 de Codex.
Cette version est livrée dans un dossier séparé pour ne pas écraser les fichiers de Codex. Rien n'a été publié : ni GitHub, ni `update.json`, ni la page en ligne.

## Ce qui change

### Objectifs adaptés au niveau
- **Nouveau profil :** les objectifs de départ ne supposent plus un perso niveau 90 (Pourpre, Dokoko…). Ils dépendent du niveau du premier perso :
  - le prochain palier de niveau ;
  - la prochaine étape du parcours ;
  - jusqu'à 3 Dofus dont les quêtes sont accessibles ;
  - un métier de récolte, si aucun métier n'est monté.
- **Bouton « Suggérer pour <perso> » dans Objectifs :** il ajoute les suggestions qui correspondent au perso choisi (son niveau, son parcours, ses Dofus manquants), sans créer de doublon. Le bouton se désactive quand il n'y a plus rien à proposer. Si l'Accueil n'a aucune priorité, il propose le même bouton.
- **Sauvegardes existantes :** leurs objectifs ne sont jamais modifiés. Rien n'est ajouté sans un clic de l'utilisateur.
- **Source :** les fourchettes de niveau des quêtes viennent de la page « Les Dofus » de Dofus pour les Noobs, relevée le 12/11/2026.

### Interface allégée
- **Menu regroupé :** les 22 rubriques sont réparties en deux groupes, « Suivi » (9) et « Outils de jeu » (12), plus Paramètres à part.
  - Chaque groupe se replie, et ce réglage est conservé.
  - Le groupe de la rubrique affichée reste toujours ouvert.
  - Une rubrique ajoutée plus tard sans groupe tombe automatiquement dans « Outils de jeu ».
- **Barre « Épingler en widget » compacte :** elle tient maintenant sur une petite ligne alignée à droite, sans cadre. La phrase d'explication n'apparaît que sur un écran étroit. Les commandes ne changent pas.

### Mises à jour qui demandent le paquet complet
- Le fichier `update.json` peut maintenant indiquer `data.requiresFullPackage: true` et `data.packageUrl`. Il faut le faire quand une version change aussi `Escouade.exe` ou `Organisateur Escouade.exe`, que le bouton de mise à jour ne peut pas remplacer.
- Dans ce cas, Paramètres propose « Télécharger le paquet », sans installation partielle, et rappelle de garder le dossier `.tmp`.
- Seuls les liens https vers `github.com`, `raw.githubusercontent.com` et `objects.githubusercontent.com` sont acceptés. Sinon, l'app renvoie vers la page du dépôt.

## Vérifications
- **Les 40 scénarios de Codex passent**, relancés sous Linux et Chrome.
- **5 nouveaux scénarios passent** (`tests-claude-1.4.1.py`) :
  - les objectifs d'un nouveau profil sont bien ceux du niveau 1 ;
  - une sauvegarde existante garde ses objectifs, et les suggestions n'ajoutent pas de doublon et sont conservées ;
  - le menu regroupé garde son repli, ouvre le groupe actif et affiche bien les 22 rubriques ;
  - une mise à jour qui demande le paquet complet affiche un lien sûr et refuse un lien non sûr ;
  - la barre widget est compacte et présente sur chaque rubrique.
- **Lancement réel du fichier de ressources 1.4.1** avec le moteur Neutralino 6.4.0 : l'app passe en mode bureau dès le premier chargement et y reste après un rechargement, sans erreur.
- **`Escouade.exe` et `Organisateur Escouade.exe` sont ceux de la 1.4.0, octet pour octet**, donc non recompilés. Seul `resources.neu` change.

## Ce qui n'a pas été testé
- Le lancement sous Windows de cette 1.4.1 précise.
- Les widgets et l'Organisateur avec le jeu ouvert.

## Pour Codex
Seuls deux fichiers changent : `src/escouade.html` et `src/widgets.css`.
- `claude-1.4.1.patch` est le diff unifié par rapport à la 1.4.0 de Codex. Il a été produit après conversion des fins de ligne CRLF en LF : il faudra appliquer le patch en ignorant les fins de ligne, ou reconvertir le fichier.
- `escouade-1.4.1.html` et `widgets-1.4.1.css` sont les fichiers complets.
- Le paquet a été construit avec une copie Linux de `tools/build.py`. La seule différence avec l'original : l'Organisateur est copié depuis la 1.4.0 au lieu d'être recompilé.

| Fichier | SHA-256 |
|---|---|
| Escouade-1.4.1-Windows.zip | 53536e8e87b061954ac8f2c36bedbe4215d4758fa7c1eb7383bc3f79c7ba4476 |
| resources.neu (dans le zip) | 77f95ece71efbfe7c638873c0703e6f95e3353c74bc431c93536dcb9284f2a21 |
| Escouade.exe | 5c489698cf8744cfcb7f404abaf45334a7106d2c131c0510fc5118c7ffe3d008 (identique à la 1.4.0) |
| Organisateur Escouade.exe | bf8c520ff9ba48ce10bb7bcab1e744b4bd0bd8e4b1b8e4cd32c1adadf7ffa1c4 (identique à la 1.4.0) |

## Pour essayer
Dézippe `Escouade-1.4.1-Windows.zip` à la place de la 1.4.0 dans `Tests Escouade`. Garde le dossier `.tmp`, qui contient tes données, et ne lance pas deux versions en même temps.
