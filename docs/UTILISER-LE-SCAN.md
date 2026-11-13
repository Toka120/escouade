# Scan et import (1.6.0)

Choisis d’abord le personnage dans Escouade. Dans Dofus, ouvre toi-même le panneau **Caractéristiques** (touche C), l’info XP ou l’inventaire.

1. Dans **Scan et import**, clique sur **Capturer une fenêtre Dofus**. Dans l’outil, choisis la fenêtre du personnage puis **Capturer la fenêtre sélectionnée**. L’image revient toute seule dans Escouade. Tu peux aussi importer un PNG, ou coller une image avec Ctrl+V hors d’un champ texte.
2. Clique sur **Lire et remplir les valeurs**. Pas besoin d’encadrer : Escouade trouve seul le panneau Caractéristiques dans la capture et ignore le reste de l’écran (chat, suivi de quêtes, nom de zone, carte, barres d’XP).
3. Les valeurs lues sont remplies et encadrées en doré. Vérifie-les, corrige si besoin, puis **Enregistrer le relevé vérifié**. Rien n’est enregistré sans ce clic.

## Ce qui est lu dans le panneau Caractéristiques de Dofus 3

- **En-tête** : niveau ; **en bas** : points restants.
- **Colonne d’icônes à gauche** (valeurs sans libellé) : points de vie, Force, Intelligence, Chance, Agilité, Sagesse.
- **Grille centrale** : PA, PM, Portée, Critique, Puissance, Invocations, Pods, Prospection, Tacle, Fuite, Retrait PA/PM, Esquive PA/PM, Initiative, Soins, Renvoi.
- **Tableau DMG · RES · RES.%** : dommages, résistances fixes et en % de chaque élément, plus Critiques, Poussée, Sorts, Armes, Distance et Mêlée. Chaque valeur est rangée selon sa colonne, les cases « - » restent vides.

Les valeurs grises (0, 0 %) sont lues par une seconde passe à fort contraste ; une case encore vide est relue seule, chiffres uniquement. Les signes moins sont vérifiés entre les passes. Une valeur incertaine reste vide plutôt que fausse.

Mesures sur une vraie capture du panneau (1920 × 1057) : 52 valeurs sur 52 exactes. Même capture réduite ou agrandie : 52/52 à 1600 de large, 51/52 à 1280, 50/52 à 2560. Les cases manquantes restent vides, aucune valeur n’est fausse. Les autres dispositions (info XP, inventaire) utilisent les libellés lisibles (« Kamas : 560 037 », « XP restante : … »).

## Enregistrement, application et diagrammes

- Case cochée par défaut : niveau, PA, PM, portée, vitalité et sagesse vont dans le suivi du personnage. La meilleure caractéristique élémentaire devient la stat principale, la moyenne des résistances % devient la résistance moyenne.
- Chaque relevé rejoint l’historique du personnage (60 derniers). La page affiche un **diagramme radar** des caractéristiques, les **barres dommages / résistances par élément** et l’**évolution** (niveau, vitalité, puissance, sagesse, initiative).
- Le journal de kamas de la team, les compteurs manuels d’XP et le stock partagé ne sont pas modifiés. Une sauvegarde précède chaque enregistrement.
- Plusieurs captures s’additionnent dans le même relevé, par exemple le panneau puis l’info XP.

## Confidentialité

La lecture est faite sur ton PC par le moteur Tesseract.js embarqué : aucune image n’est envoyée. Les PNG restent dans `Captures de scan` à côté de l’application ; ne les joins pas aux sources ni aux publications. Les images et le texte lu ne sont pas mis dans la sauvegarde Escouade.
