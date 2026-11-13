# Escouade 1.2.0 : plan de test (branche dev/1.2.0, non publiée)

Fichiers modifiés par Claude sur cette branche : `src/escouade.html`, `tools/build.py` (autorisations `filesystem.writeFile` et `os.showSaveDialog` pour l'export) et ce fichier.
Non modifiés : `update.json` et `resources.neu`. La 1.1.0 publiée reste celle servie aux installations.

## Nouveautés
- Thème bleu nuit et or par défaut, thèmes Clair et Système dans Paramètres > Apparence. Le menu latéral reste sombre.
- Accueil sobre : bannière, 4 chiffres clés, Mon équipe, Mes priorités, Prochain donjon (tiré du parcours).
- Multi-persos (8 au maximum) : ajout, choix de la classe (« À choisir » par défaut), sélection dans le menu ou sur l'Accueil, suppression (double clic).
  Par perso : fiche, XP, sessions, donjons, stuff, parcours. Communs à la team : kamas, objectifs, notes, donjons ajoutés à la main.
- Paramètres : version et mises à jour, export dans un fichier (.exe) ou par copie (web), import par fichier, glisser-déposer ou texte, zone sensible.
- Copies de sécurité automatiques avant un import, une réinitialisation, une suppression de perso ou une restauration (bouton « Restaurer la copie »).
  La sauvegarde 1.x d'origine est aussi conservée telle quelle sous la clé `carnet-xelor-v1-v1x` avant sa conversion.
- Parcours : chemin de 14 jalons cliquables.

## Format de sauvegarde
`v:3`, `persos:[{id, perso, xp, sessions, donjons, stuff, parcours}]`, `activeId`, puis `customDonjons`, `kamas`, `objectifs`, `notes`, `settings{autoUpdate, theme}`, `ui`.
`merge()` lit les formats 1.0 et 1.1 (v1 et v2, un seul perso à la racine) ainsi que 1.2 (v3). Les clés propres à chaque perso sont exposées sur `state` par des accesseurs non énumérables (`bindPersos`) : elles n'apparaissent donc pas dans le JSON.

## Déjà vérifié (Linux, Chrome headless)
- Démarrage sans données.
- Migration d'une sauvegarde v2 : nom, niveau, donjons, sessions, parcours, kamas et notes conservés, copie v1x créée.
- Ajout, modification et suppression de perso, avec des données bien séparées entre persos.
- Thèmes, import par texte et par fichier, restauration de la copie.
- Mode bureau actif via Neutralino (version 1.2.0, bouton « Exporter dans un fichier »).

## À tester sous Windows
1. Dézipper Escouade-1.2.0-test.zip dans Documents et lancer Escouade.exe. Un avertissement SmartScreen est attendu (binaire non signé).
2. Avec des données de la 1.1.0 : vérifier qu'elles apparaissent bien (même applicationId, même port 52731).
3. Paramètres > Exporter dans un fichier : la fenêtre d'enregistrement s'ouvre et le .json est écrit. Glisser ensuite ce fichier sur la zone d'import.
4. Paramètres > Rechercher une mise à jour : l'app doit se dire à jour, puisque le dépôt sert encore la 1.1.0.
5. Liens externes (guides) : ils s'ouvrent dans le navigateur par défaut.
6. Fermer puis relancer : les données, le thème et le perso actif sont conservés.
