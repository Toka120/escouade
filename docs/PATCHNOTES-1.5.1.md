# Escouade 1.5.1 — Retour automatique de capture

Correctif local du 13 novembre 2026, après le signalement « la capture met seulement Dofus au premier plan ».

La version 1.5.0 nécessitait encore un collage ou un import manuel du PNG. Le bouton de capture attend désormais la fin de l’outil et importe automatiquement l’image dans Scan et import. L’utilisateur choisit toujours sa fenêtre et clique sur Capturer ; il peut ensuite sélectionner la zone utile et lancer l’OCR.

- Chaque demande utilise un identifiant aléatoire ; seul son PNG est lu. Une ancienne capture n’est pas récupérée à la place.
- L’outil se ferme après une capture réussie lancée depuis Escouade. Dans ce mode, il ne remplace pas le presse-papiers.
- Fermer l’outil avant une capture réussie annule la demande. Annulation, échec de l’outil et absence du fichier affichent chacun un résultat dans Escouade.
- Le premier plan est vérifié après le délai d’affichage de Dofus ; la valeur de retour de la seule tentative d’activation ne suffit plus à annuler la capture.
- Une image n’est pas importée si le personnage actif change pendant la demande ou le chargement. L’enregistrement du relevé reste une action explicite après vérification.
- Le lancement séparé de Capture Escouade.exe conserve son fonctionnement manuel avec PNG et presse-papiers.

## Tests et limites

48 scénarios de régression et 10 vérifications Scan réussis. Le moteur OCR français est réellement exécuté sur une image synthétique. Les nouveaux tests de retour de capture utilisent une interface native simulée : succès, annulation, échec, fichier absent, personnage changé et chemin dangereux. Compilation Windows de l’outil et contrôle d’intégrité du paquet réussis.

Aucune prise de contrôle du PC, ouverture de Dofus, changement de fenêtre ou capture du bureau pendant ces tests, conformément à la demande de Toka. Les navigateurs de test sont invisibles et utilisent un profil isolé. Le cycle réel outil Windows → image dans WebView2 reste à confirmer lors d’un prochain essai volontaire ; il n’est pas présenté comme testé sur Dofus.

Livraison dans Tests Escouade avec archivage de la version précédente, conservation de `.tmp` et des relevés personnels. Aucune publication. L’application ouverte n’est pas fermée ni relancée automatiquement.
