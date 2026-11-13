# Escouade 1.4.0 — widgets flottants

Version locale du 13 novembre 2026.

## Toutes les rubriques sont détachables

Les 22 pages disposent d'une barre « Épingler en widget ». Le menu permet de détacher la page entière ou un bloc de son contenu : section, tableau ou étape de parcours. Plusieurs widgets peuvent être ouverts en même temps. La fenêtre principale peut rester réduite pendant le jeu.

Chaque widget possède une fenêtre Windows déplaçable, redimensionnable à partir de 320 pixels de largeur, épinglée au premier plan au démarrage. Le bouton « Épinglé / Épingler » active ou désactive ce comportement. Les contrôles permettent de changer de rubrique et de bloc, réduire la taille du texte, replier le contenu et ouvrir un autre widget. La croix Windows ferme seulement ce widget.

## Widget de quêtes

Dans Parcours, choisir « Prochaine étape de quête » pour afficher seulement le prochain jalon. Cocher l'étape la termine et affiche automatiquement la suivante. Une étape précise ou toute une partie du parcours peut également être détachée. Les guides restent accessibles depuis le widget.

## Données partagées et synchronisation

Les widgets utilisent la même sauvegarde locale que leur application principale. Les cases cochées, notes, compteurs et autres changements sont répercutés entre les fenêtres. Le personnage actif est partagé ; il est indiqué dans l'en-tête du widget. La sauvegarde fusionne les champs modifiés avec la version locale la plus récente, notamment pour préserver des modifications sur des champs différents et des éléments ajoutés dans une autre fenêtre.

Les résultats et filtres des nouveaux modules sont transmis lors du détachement : une recherche d'objet ou un calendrier déjà chargé ne disparaissent pas à l'ouverture du widget. Ces données de consultation restent temporaires, comme dans la page principale.

## Correction native

Chaque fenêtre détachée initialise sa propre connexion native. L'injection du jeton Neutralino n'a lieu qu'une fois. Les options de lancement sont encodées dans un fragment d'URL sans séparateur de commande, ce qui évite que le lancement Windows perde les réglages de taille et de premier plan.

## Validation

- 40 scénarios automatisés, dont huit nouveaux : widgets pour les 22 rubriques à 420 pixels, passage à la prochaine quête, synchronisation entre fenêtres, éditions de notes sur des champs différents, préservation des personnages/objectifs ajoutés, bloc interactif, lancement natif sûr, épinglage et reprise des résultats de recherche.
- Test Windows réel : création d'un widget de 480 × 700, accès au parcours, prochaine étape, case cochée répercutée dans le compteur principal, désépinglage/réépinglage et maintien au-dessus de la fenêtre principale lorsqu'elle est réactivée.
- Le client Dofus n'était pas ouvert pendant cette vérification ; le maintien au-dessus a été contrôlé avec une autre fenêtre Windows.
- Trois nouveaux PNG de démonstration : widget de quêtes, Ocre et notes. Le dossier contient désormais 30 captures, soit 37 PNG avec les maquettes et éléments d'interface.

## Utilisation et limites

Garder l'application principale ouverte, éventuellement réduite : elle sert les ressources communes des widgets. Pour voir un widget au-dessus de Dofus, utiliser le mode fenêtré ou fenêtré sans bordure. Un aperçu navigateur peut être ouvert, mais l'épinglage natif nécessite la version Windows. Les positions, tailles et fenêtres ouvertes ne sont pas restaurées automatiquement après fermeture. Si un bloc conditionnel disparaît de la page, le widget propose de choisir un autre bloc plutôt que d'afficher un contenu différent.

L'ancienne version est archivée avant remplacement. Le profil `.tmp` et les données du joueur sont conservés. Aucune publication GitHub ni Microsoft Store n'est effectuée.
