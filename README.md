# 🤖 ORIENTO

> *"Chaque lycéen mérite une orientation qui lui ressemble."*

**Oriento** est une application web intelligente d'accompagnement à l'orientation scolaire, conçue pour aider les lycéens français (14-18 ans) à construire un projet d'avenir clair et cohérent.

---

## 🎯 Problématique

> **Comment aider les jeunes à construire un projet d'avenir clair et cohérent grâce à une application intelligente, tout en reliant ambitions, compétences et opportunités de formation ?**

L'orientation au lycée est une source de stress majeure :

- **66 %** des étudiants ont changé de filière ou redoublé à cause d'une orientation inadaptée
- **60 %** des lycéens ne connaissent pas, ou seulement partiellement, les conditions d'accès aux formations qui les intéressent
- **58,6 %** ont déjà pensé à abandonner leurs études
- La réforme du lycée impose des choix de spécialités précoces et déterminants
- Parcoursup est vécu comme un processus stressant, flou et manquant de personnalisation

---

## 💡 Solution

Oriento propose un **accompagnement d'orientation personnalisé et accessible à tous les lycéens**, à travers :

**Un chatbot IA** qui apprend à connaître le lycéen dès son arrivée via un test d'entrée (style RIASEC), basé sur ses centres d'intérêt, sa manière de travailler et ses soft skills — pour lui suggérer des profils et métiers adaptés.

**Un espace de découverte** organisé en catégories :
- En savoir plus sur un métier 
- Connaître les compétences et qualités nécessaires pour chaque métier
- Trouver un secteur qui correspond à sa personnalité
- Comprendre le parcours scolaire à suivre (spécialités, filières, formations post-bac)
- Découvrir des formations qui correspondent à sa personnalité
- Discuter avec un chatbot pour s'aider à s'orienter

---

## 👤 Cible

**Lycéens de 14 à 18 ans**, en cours d'orientation scolaire.

**Persona type — Sofia, 17 ans, Terminale (Lyon)**
Sofia est en spécialité Cinéma et Physique-Chimie. Parcoursup ouvre dans 3 mois, elle doit définir ses vœux. Malgré plusieurs conseillers d'orientation et de nombreuses recherches en ligne, elle n'a pas encore trouvé la formation qui lui correspond.

---

## 🗺️ Architecture de l'application

```
Oriento
├── Test d'entrée (RIASEC) : possibilité de l'effectuer     │       plus tard
│   ├── Centres d'intérêt
│   ├── Manière de travailler
│   └── Soft skills → profils + métiers associés
│
└── Catégories de découverte
    ├── Métiers & secteurs
    ├── Compétences requises
    ├── Correspondance personnalité / secteur
    └── Parcours scolaire (spécialités, filières, post-bac)
```

---

## 🏆 Identité de marque

| | |
|---|---|
| **Mission** | Proposer un accompagnement d'orientation personnalisé et accessible à tous les lycéens |
| **Vision** | Devenir la référence de l'orientation intelligente en France pour les lycéens |
| **Ton** | Bienveillant, pédagogique, clair, simple, rassurant |
| **Identité visuelle** | Bleu, mascotte robot avec loupe et livre |

---

## 🔍 Concurrents analysés

| Solution | Avantages | Limites |
|----------|-----------|---------|
| **Inspire** | Questionnaires personnalité, échange avec étudiants | Manque de personnalisation |
| **Hello Charly** | 4 tests, fiches métiers et formations | Manque certaines formations (ex: ECE) |
| **Hopteo** | Format swipe intuitif, bonnes questions | Mobile uniquement, instable |
| **Prepeers** | Chatbot assez personnalisé | Trop orienté dès le départ, peu de domaines |

---

## 🛠️ Stack technique

| Technologie | Rôle |
|-------------|------|
| **TypeScript** (~81%) | Langage principal |
| **React** | Framework UI |
| **Vite** | Bundler & serveur de développement |
| **CSS** (~15%) | Styles |
| **Python** (~3%) | Scripts utilitaires |

---

## 📦 Installation & lancement

```bash
# Cloner le dépôt
git clone https://github.com/ineshaller/Oriento.git
cd Oriento

# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Build de production
npm run build
```

L'application est disponible sur [http://localhost:5173](http://localhost:5173).

---

## 📁 Structure du projet

```
Oriento/
├── public/
│   └── data/          # Données statiques (métiers, formations…)
├── scripts/           # Scripts utilitaires Python
├── src/               # Code source React/TypeScript
├── index.html         # Point d'entrée
├── vite.config.ts     # Configuration Vite
└── package.json
```

---

## 🗓️ Roadmap

| Période | Objectif |
|---------|----------|
| **Déc. / Jan.** | Maquettes UX/UI (Figma) + Recherche modèle IA chatbot |
| **Février** | Développement du chatbot + MVP de l'application |
| **Mars / Avril** | Tests utilisateurs + Amélioration continue |

---

## 🎯 Vision finale du produit

- ✅ Chatbot opérationnel
- ✅ Questionnaire de personnalité (RIASEC)
- ✅ Recommandations de spécialités et de formations
- ✅ Parcours utilisateur complet
- ✅ Indicateurs de satisfaction
- ✅ Vision d'évolution de la plateforme

---

## 🎨 Design

Les maquettes sont disponibles sur Figma :
🔗 [Orientation App Design – Figma](https://www.figma.com/design/WVh4ORfqjepGE02zxfewui/Orientation-App-Design)

---

## 👥 Équipe

Jules Balaguer · Amélie Dupouy · Anaïs Floch · Inès Haller · Anaëlle Montagnes

---

## 📄 Licence

Ce projet n'a pas encore de licence définie. Pour toute utilisation, veuillez contacter l'équipe.