# Préparer une future fiche Escouade

Version de travail : 1.5.1, 13 novembre 2026. Aucun compte, produit ou dépôt Store n'a été créé ou soumis.

`store-metadata.fr-FR.json` contient les textes réutilisables pour le Store, un site ou une page de téléchargement. Les champs d'éditeur, de support et de confidentialité sont laissés vides pour être renseignés par le propriétaire. Les captures accompagnant la livraison montrent des données de démonstration, jamais les sauvegardes personnelles.

## Choisir le paquet

Le ZIP portable actuel sert aux tests locaux. Microsoft accepte MSIX ainsi que les parcours MSI/EXE. Pour MSIX, prévoir une identité de paquet attribuée par Partner Center et une distribution des mises à jour par le Store. Pour MSI/EXE, préparer un véritable installateur répondant aux exigences de soumission et de signature ; le seul exécutable portable n'est pas un installateur. [Présentation officielle](https://learn.microsoft.com/en-us/windows/apps/publish/get-started), [signature et publication](https://learn.microsoft.com/en-us/windows/apps/package-and-deploy/publish-first-app).

## Travail restant avant soumission

- Créer ou utiliser le compte développeur et réserver le nom disponible.
- Choisir l'éditeur, les contacts, les marchés, la catégorie et le prix.
- Préparer puis tester l'installation, la désinstallation, WebView2, la migration des sauvegardes et les mises à jour du canal choisi.
- Héberger une politique de confidentialité adaptée au comportement final et un moyen de support.
- Remplir la classification d'âge et les déclarations demandées.
- Valider les droits sur la marque et les visuels retenus. Les maquettes ne sont pas des captures du produit final ; utiliser les captures de l'interface avec les mentions appropriées.
- Vérifier les exigences alors en vigueur et passer la certification Microsoft.

[Champs de soumission MSIX et fiche produit](https://learn.microsoft.com/en-us/windows/apps/publish/publish-your-app/create-app-submission?pivots=store-installer-msix).

## Contenu réseau à décrire

La version Windows garde la progression dans le stockage local WebView2. Les exports JSON contiennent la team et les notes. L'app ne demande aucun identifiant Ankama et n'automatise pas le jeu. Les polices sont actuellement chargées depuis Google Fonts et la recherche de mise à jour contacte GitHub ; des données réseau techniques sont donc envoyées à ces fournisseurs. Les liens des guides ouvrent des sites externes. La version hébergée peut utiliser les services de compte/sauvegarde de son hôte s'ils existent : elle nécessite sa propre description de confidentialité.

Avant diffusion publique, décider si les polices doivent être embarquées et vérifier leurs licences. La livraison actuelle ne contient ni MSIX certifié, ni signature d'éditeur, ni politique hébergée.
