# Scan et import local

Sélectionner le personnage dans Escouade avant de commencer. Dans Dofus, ouvrir manuellement le panneau à relever : caractéristiques, information XP ou inventaire.

1. Ouvrir **Scan et import**, puis **Capturer une fenêtre Dofus**. L’outil `Capture Escouade.exe` peut aussi être lancé depuis le dossier de l’application.
2. Choisir explicitement la fenêtre du personnage et cliquer sur **Capturer la fenêtre sélectionnée**. La fenêtre doit être entièrement visible. Le PNG est enregistré dans `Captures de scan` à côté de l’exécutable. Lancé depuis Escouade, l’outil se ferme après succès et l’image revient automatiquement dans Scan et import. Fermer l’outil avant une capture réussie annule la demande.
3. Revenir dans Escouade : l’aperçu est chargé automatiquement. En cas de lancement séparé de l’outil, coller avec Ctrl+V hors d’un champ texte ou importer le PNG. Les fichiers PNG/JPEG/WebP sont acceptés jusqu’à 15 Mo et 24 millions de pixels.
4. Glisser sur l’aperçu pour sélectionner la zone utile, puis **Lire le texte localement**. **Lire toute l’image** retire la sélection.
5. Corriger le texte si besoin. **Proposer les valeurs avec libellés** reconnaît les lignes explicites comme `Force : 125`, `Kamas inventaire : 560 037` ou `XP restante : 2 102 123`. Les dispositions ambiguës du jeu nécessitent une correction manuelle. Un nombre isolé n’est pas attribué automatiquement à une caractéristique.
6. Vérifier les champs et les ressources nommées (`Nom : quantité`, une ligne par ressource), puis enregistrer. Le nom doit correspondre au personnage actif. Une copie de sécurité de la sauvegarde précède l’enregistrement ; si cette copie échoue, rien n’est appliqué.

Le relevé daté est personnel et partiel. Il conserve les caractéristiques détaillées, le portefeuille, l’XP restante et les ressources identifiées. La case facultative met aussi à jour niveau, PA, PM, portée et sagesse dans le suivi du personnage. Les champs vides ne modifient pas ce suivi. Chaque nouveau relevé remplace le dernier instantané de ce personnage ; l’export permet de conserver des relevés successifs.

Le journal de kamas de la team, les compteurs manuels d’XP et le stock partagé des crafts restent conservés. Une icône ne fournit pas un nom de ressource certain : afficher son nom en jeu ou le saisir. Aucun inventaire complet n’est déduit d’une grille d’icônes. Les PV ne sont pas la Vitalité de base ; les Pods affichés ne sont pas nécessairement les pods occupés. Un pourcentage d’XP arrondi ne fournit pas une XP cumulée exacte.

Le moteur Tesseract.js 7.0.0 et les données françaises sont embarqués. L’OCR ne téléverse pas les images et ne nécessite aucun téléchargement au moment de la lecture. Les autres recherches publiques de l’application gardent leur fonctionnement habituel. Les images et brouillons OCR ne sont pas inclus dans les sauvegardes Escouade ; les PNG restent dans leur dossier local tant que tu les conserves.

Ne pas joindre `Captures de scan` ni les relevés personnels aux sources, aux visuels de publication ou à la fiche Microsoft Store. Les aperçus livrés dans Visuels utilisent des données de démonstration.

Validation : OCR français réellement exécuté hors ligne sur une image synthétique, import et conservation testés automatiquement. Compilation Windows réussie. Le retour automatique de capture est testé avec une interface native simulée (succès, annulation, erreurs et changement de personnage). Son essai réel sur Dofus/WebView2 reste à terminer : aucun contrôle du bureau ni lancement de client pendant la validation 1.5.1, à la demande de Toka. Le test F6/F7 de l’organisateur a, lui, réussi entre les deux clients réels.
