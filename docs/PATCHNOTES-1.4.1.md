# Escouade 1.4.1 — intégration Claude et vérifications Codex

Version locale du 13 novembre 2026, non publiée. Les changements de Claude ont été intégrés aux sources de la 1.4.0. L'archive et le dossier `Claude 1.4.1` restent conservés séparément.

## Changements apportés par Claude

- Objectifs initiaux adaptés au niveau du premier personnage et bouton de suggestions dans Objectifs. Les nouvelles suggestions tiennent compte du niveau, du parcours et des Dofus manquants, sans doublon de titre.
- Menu des 22 rubriques regroupé en deux sections repliables. Le groupe actif reste ouvert et le repli des autres est conservé.
- Barre d'épinglage plus compacte.
- Mise à jour par paquet complet : prise en charge de `data.requiresFullPackage` et `data.packageUrl`. Aucun bouton d'installation partielle n'est proposé dans ce cas.

Les détails d'origine sont conservés dans `docs/PATCHNOTES-1.4.1-Claude.md`.

## Corrections complémentaires

- Conservation intégrale des objectifs existants, y compris ceux du format 1.0. La migration ne remplace plus les anciens objectifs de départ.
- Contrôle du format du réglage de menu importé et des URL de paquets. Les URL passent par `safeExternal()` et seules les destinations GitHub autorisées, sans identifiants ni port personnalisé, sont retenues.
- Autorisations natives étroites pour `updater.checkForUpdates` et `updater.install` : elles manquaient dans le paquet construit, ce qui bloquait les contrôles natifs. Aucun manifeste public n'est changé et aucune mise à jour distante n'est installée pendant les tests.
- 19 positions relues dans les guides de Dofus pour les Noobs, avec date et lien de source : 14 entrées corrigées et 5 cas distinguant entrée du donjon et accès à la dimension (Ombre et les quatre Cavaliers).
- Les 10 autres désaccords avec une autre source restent signalés « position à confirmer ». Ils ne sont pas remplacés par une valeur supposée.
- Le lien indisponible de la Déchireuse renvoie au catalogue ; le texte indique désormais explicitement qu'il ne s'agit pas de son guide.
- Les données révisées se trouvent dans `data/dungeon-positions-reviewed.json` et sont reprises par `tools/import_audit.py`.
- Règles de passation conservées dans `AGENTS.md` pour la suite du projet.

## Validation

- **48 scénarios Chrome réussis** : les 40 précédents, les cinq vérifications de la proposition Claude et trois contrôles complémentaires (positions/accès, réglage de menu importé, objectifs v1 conservés).
- **Windows 1.4.1** : démarrage réel, accueil avec les objectifs niveau 1, menu regroupé, barre widget compacte et ouverture d'un widget natif épinglé.
- **Test avec Dofus : non terminé.** Le client Xolmora était détecté, mais la demande d'accès à sa fenêtre a expiré. Le maintien au-dessus du jeu et F6/F7 entre plusieurs clients ne sont donc pas déclarés validés. Un seul client Dofus était détecté.
- Captures de démonstration régénérées, avec les thèmes et widgets. Elles ne contiennent pas de données du profil joueur.
- Les deux exécutables sont réutilisés sans modification depuis la 1.4.0, après contrôle de leur SHA-256. Les ressources de la version intégrée sont reconstruites ; elles diffèrent donc du paquet proposé par Claude.

## Livraison et règles conservées

Le paquet, les sources, les captures et cette note sont dans `Bureau\Tests Escouade`. Les anciens fichiers sont archivés et le profil `.tmp` n'est ni supprimé ni recopié. Aucune publication GitHub, modification de `update.json`, fusion vers `main` ou soumission Microsoft Store n'est réalisée. Les visuels et personnages Ankama ne sont pas ajoutés au produit.

Le service Discord et le paquet Microsoft Store restent des étapes ultérieures. Les tests réduisent les risques sans garantir une absence absolue de bugs.
