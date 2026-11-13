# Escouade — règles du projet

Ces règles reprennent la passation de Claude approuvée par Toka le 13 novembre 2026. Les instructions explicites de l'utilisateur restent prioritaires.

- Ne publier ni pousser vers GitHub, ni modifier le manifeste public `update.json`, ni déployer la page en ligne sans autorisation explicite de Toka. Construire et livrer localement dans `C:\Users\jigsa\OneDrive\Bureau\Tests Escouade` est autorisé.
- Préserver les données : clé `carnet-xelor-v1`, format v3 multi-personnages, migrations v1/v2 compatibles. Ne jamais supprimer ni remplacer le profil `.tmp`. Archiver les exécutables et ressources précédents avant livraison.
- Ne réaliser aucune action de jeu à la place du joueur : aucun bot, clic/touche de jeu ou lecture mémoire. L'Organisateur ne fait que sélectionner les fenêtres du processus Dofus et les mettre au premier plan.
- Ne pas ajouter de personnages ou visuels appartenant à Ankama. Conserver la mention d'application indépendante et non affiliée à Ankama.
- Sources de contenu prioritaires : Dofus pour les Noobs et Huzounet. DofusDB et Dofusdude sont utilisés pour les fonctions déjà intégrées. Vérifier les contradictions et distinguer entrée de donjon et accès à une dimension ; conserver une indication d'incertitude si nécessaire.
- Neutralino 6.4 : le jeton est à usage unique. Ne jamais cumuler `__neutralino_globals.js` et `neutralino.js`. Les widgets injectent uniquement la bibliothèque, qui inclut déjà les globals.
- Les commandes natives requièrent de la rigueur : échapper les textes avec `esc()`, vérifier les URL variables avec `safeExternal()`, ne pas interpoler d'entrée utilisateur dans une commande système. Les URL de widgets utilisent un fragment encodé sans séparateurs de commande.
- Exécuter les tests pertinents, documenter leurs limites et les vérifications Windows réellement effectuées. Ne pas prétendre avoir testé plusieurs clients Dofus si un seul était disponible ou si l'accès a expiré.
- Garder les sources et la livraison dans Escouade ; ne pas modifier le projet PANTINS.
