# Escouade 1.5.0 — Scan local et relevés vérifiés

Livraison locale du 13 novembre 2026, dans Tests Escouade. Aucune publication ni modification du manifeste de mise à jour public.

## Nouveautés

- Nouvelle rubrique **Scan et import**, également disponible en widget comme les autres pages.
- Outil Windows **Capture Escouade.exe** : sélection d’une fenêtre du processus Dofus, capture volontaire de son contenu visible, PNG local et copie d’image dans le presse-papiers. Vérification du processus, du premier plan et des dimensions ; annulation si la fenêtre change. Aucun geste de jeu ni lecture mémoire.
- Import PNG/JPEG/WebP, collage d’image, sélection d’une zone à la souris, OCR français embarqué avec Tesseract.js 7.0.0. Aucun téléversement d’image ni téléchargement OCR au moment de l’utilisation.
- Texte OCR modifiable et propositions uniquement à partir de libellés explicites. Formulaire de vérification des caractéristiques, XP restante, bonus XP, kamas et ressources nommées.
- Un dernier relevé daté par personnage, import/export JSON, validation des nombres et du nom du personnage actif, copie de sécurité avant application.
- Mise à jour facultative du niveau, des PA, PM, portée et sagesse. Le journal de kamas, les compteurs XP manuels et le stock partagé sont conservés.
- Relevé personnel de Xolmora livré séparément dans `Releves Xolmora`, exclu du paquet et des sources. Pacster a servi uniquement au test de l’organisateur.
- Guide d’utilisation, notices des composants OCR, dépendances verrouillées, script de préparation reproductible et aperçus de démonstration actualisés.

## Vérifications effectuées

- **48 scénarios automatisés réussis**, couvrant les 23 rubriques, les migrations, sauvegardes, widgets et fonctions existantes.
- **6 vérifications Scan réussies** : nom différent refusé ; import persistant avec sauvegarde et conservation du journal/XP ; nombres invalides rejetés ; libellés ambigus ignorés ; OCR français réel sur image synthétique sans requête distante du moteur ; sélection/réinitialisation de zone.
- Compilation C# de l’outil de capture et construction du paquet Windows avec contrôle d’intégrité des ressources.
- Test réel de l’organisateur sur deux clients Dofus : F7 active Pacster, F6 revient sur Xolmora. Raccourcis désactivés à la fin.
- Relevé visuel de Xolmora : caractéristiques, kamas et information XP consultés ; une ressource identifiée avec certitude.

## Limites à connaître

La capture Windows compilée reste à tester sur le client réel : l’autorisation d’accès au PC a expiré avant l’ouverture de l’outil. Le collage dans WebView2 et le moteur OCR dans le paquet natif restent donc à confirmer sur le PC ; l’OCR a été exécuté avec succès dans Chrome sur le même code et les mêmes fichiers locaux.

Les petits textes et les dispositions du jeu peuvent être mal reconnus. Les valeurs ne sont jamais appliquées automatiquement. Les icônes de ressources seules ne donnent pas un inventaire complet. Le stock partagé n’est pas alimenté à partir de noms incertains. L’XP cumulée n’a pas été déduite d’un pourcentage arrondi. Les relevés sont des instantanés, sans surveillance ni synchronisation continue avec Dofus.

Les fonctions précédentes sont conservées. Les positions encore incertaines, les services externes et la future connexion Discord gardent leurs limites déjà documentées. Cette version locale n’est pas un paquet Microsoft Store signé.
