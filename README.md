# README

## Présentation du projet

Ce projet est une **application de data-visualisation interactive** permettant à un·e étudiant·e de **suivre, évaluer et justifier sa progression** dans le référentiel officiel des compétences MMI.

L’interface repose sur un **SVG interactif**, présenté comme un « plateau de jeu », où chaque nœud représente un _Apprentissage Critique (AC)_.  
L’application fonctionne **entièrement côté client**, sans base de données, avec une **persistance via le LocalStorage**.

---

## Fonctionnalités principales

### Visualisation et interaction

- Le SVG est intégré **inline dans le DOM**, permettant une interaction directe via JavaScript.
- Les données (compétences, niveaux, AC) sont chargées depuis un **fichier JSON** et mappées dynamiquement au visuel.
- Un clic sur un AC ouvre un **panneau de détail** affichant son code, son intitulé et sa description.

---

### Gestion de la progression

- Chaque AC peut être évalué via un **slider (0–100)**.
- La modification met à jour :
  - le modèle de données interne
  - l’état visuel du SVG (couleur, opacité, effets)
- La progression est **immédiatement sauvegardée**.

Un système de **déblocage progressif** empêche l’accès aux niveaux supérieurs tant que les niveaux précédents ne sont pas suffisamment validés, renforçant la logique « jeu ».

---

### Justification par la preuve

- Une AC validée peut être associée à une **preuve** (texte ou lien).
- Un indicateur visuel apparaît sur le SVG lorsqu’une preuve est présente.
- Les preuves sont sauvegardées et incluses dans l’export.

---

### Persistance, historique et export

- Toutes les données (progression, preuves, historique) sont stockées dans le **LocalStorage**.
- Un **historique des actions** permet de suivre l’évolution des validations.
- L’utilisateur peut :
  - **exporter** sa progression au format JSON
  - **importer** une sauvegarde pour restaurer l’état complet de l’application.

---

## Caractéristiques techniques

- JavaScript côté client uniquement
- Architecture inspirée du **MVC** :
  - **Model** : données utilisateur et progression
  - **View** : SVG, popup, historique
  - **Controller** : logique d’interaction
- Données pilotées par JSON
- Aucune dépendance backend

---

## Objectifs pédagogiques

Ce projet met en œuvre :

- la manipulation de SVG interactifs
- la data-visualisation
- la gestion d’état et de persistance
- une logique UX progressive
- une architecture front-end structurée
