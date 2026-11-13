# Escouade 1.3.0 — outils de guide et de préparation

Version locale du 12 novembre 2026. L'interface de DofusGuide a été examinée pour identifier les usages ; les modules Escouade ont été développés dans ce projet. Aucun code ni illustration de DofusGuide n'a été extrait.

## Ajouts

- **Ocre** : liste des 337 captures de l'actuelle quête 439, soit 51 boss et 286 archimonstres, réparties selon les étapes de la source. Compteurs d'exemplaires, filtres nom/étape/type/zone/possession, copie des captures manquantes. L'ancien inventaire de monstres ordinaires affiché par DofusGuide n'est pas assimilé à la liste actuelle de la quête.
- **Succès** : index de 2 777 références, recherche, catégorie, niveau maximum, suivi terminé/à faire, épingles et compteur de points. Chargement progressif de la liste. Les conditions détaillées restent accessibles sur la fiche source.
- **Métiers** : 22 métiers référencés avec niveau personnel de 1 à 200 et accès à la carte des ressources.
- **Encyclopédie** : recherche en ligne d'équipements, ressources ou consommables ; filtres de niveau ; fiche source et recette. Les données proviennent de Dofusdude et DofusDB.
- **Crafts et ressources** : recettes ajoutées depuis la recherche, quantités modifiables, liste de courses regroupant les ingrédients communs, stock partagé, prix unitaires manuels et estimation du reste à financer. La fabrication suivie refuse un stock insuffisant, sauvegarde avant consommation puis déduit le stock.
- **Builds PvE/PvP** : bibliothèque personnelle de liens HTTPS avec classe, niveau, budget et tags ; filtres et accès aux catalogues Huzounet/Dofusbook. Le catalogue éditorial Huzounet n'est pas répliqué automatiquement.
- **OptiDonjons** : préparation des sorties adaptée au niveau, rapprochement des étapes du parcours et de leurs quêtes, notes par personnage, accès aux guides et cases des succès dont le nom correspond au donjon. Les rapprochements incomplets sont signalés.
- **Almanax** : chargement en ligne d'un calendrier de 1, 7, 14 ou 30 jours, offrandes, bonus, récompenses indicatives et suivi quotidien propre au personnage.
- **Chasses** : saisie X/Y, direction et nom d'indice, recherche de positions publiques, copie facultative de `/travel` et historique personnel. Aucun déplacement ou événement de jeu n'est exécuté. Les Phorreurs restent à trouver en jeu.
- **Groupe local** : préparation d'annonces avec serveur, activité, date/heure, places et conditions ; copie du message. Aucun message n'est envoyé. Le futur service Discord reste à développer et configurer, conformément au choix « local pour commencer ».
- **Organisateur Windows** séparé : détection des fenêtres du processus Dofus, ordre manuel, initiative saisie, tri, précédente/suivante et raccourcis configurables F1–F12 (F6/F7 proposés). Activation volontaire et libération à la fermeture. Aucun événement de jeu, accès mémoire au jeu ou réseau.
- Onze nouvelles rubriques, icônes dédiées et captures PNG supplémentaires.

## Sauvegarde et données

Les anciennes sauvegardes restent compatibles. Ocre, succès, métiers, Almanax et historique des chasses sont propres à chaque personnage. Crafts, stocks, prix, builds et annonces sont partagés par la team et inclus dans l'export JSON. Les structures importées sont contrôlées avant remplacement. Les suppressions de nouvelles listes et la consommation de stock disposent d'une copie de sécurité.

Les références embarquées sont datées. Le script `tools/sync_reference.py` permet de reconstruire les index factuels depuis DofusDB. La recherche, les recettes, l'Almanax et les indices demandent une connexion ; une indisponibilité réseau est affichée sans effacer les données enregistrées.

## Vérifications

- 32 scénarios Chrome : les 22 rubriques, migrations, isolation, imports/exports, budgets, achats, sauvegardes, Ocre, métiers, succès, crafts et stocks, builds, groupe local, Almanax, chasses et panne réseau.
- 5 appels réels depuis Chrome avec vérification CORS : recherche d'équipement, fiche objet, recette, calendrier de 7 jours et indices de chasse.
- Construction du paquet Neutralino Windows et de l'organisateur C# à partir des sources.
- Contrôle SHA-256 des fichiers livrés.
- Validation native terminée le 13 novembre : démarrage de l'application, ouverture de l'organisateur depuis son bouton et activation/désactivation de F6/F7. Aucun client Dofus n'était ouvert ; le basculement entre plusieurs clients reste à vérifier en situation de jeu.
- Les PNG portent un libellé de démonstration ; les données d'un joueur ne sont pas utilisées pour les captures.

## Écarts encore présents par rapport à DofusGuide

Voir `FONCTIONNALITES-DOFUSGUIDE.md` pour la comparaison précise. Escouade n'embarque pas les illustrations, les guides éditoriaux complets, le catalogue de builds maintenu par l'équipe DofusGuide, ni ses itinéraires de récolte. Les liens sources donnent accès aux informations détaillées. Le service communautaire Discord est prévu après cette étape locale. Aucun installateur signé, paquet Microsoft Store ou déploiement public n'est ajouté par cette livraison.

Les tests réduisent les risques ; ils ne garantissent pas une absence absolue de bugs.
