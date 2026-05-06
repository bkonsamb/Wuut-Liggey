# 🇸🇳 Wuut Liggey — Offres d'emploi au Sénégal

> "Wuut Liggey" signifie **"Chercher du travail"** en wolof.

Plateforme d'offres d'emploi au Sénégal, entièrement statique, SEO optimisée, mise à jour automatiquement via GitHub Actions.

---

## 🚀 Démarrage rapide

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Build production
npm run build
```

---

## 🏗️ Structure du projet

```
wuut-liggey/
├── public/
│   ├── data/
│   │   └── jobs.json          # Base de données des offres
│   ├── jobs/                  # Pages HTML individuelles (générées)
│   ├── sitemap.xml            # Sitemap auto-généré
│   └── robots.txt             # Règles robots
├── src/
│   ├── components/            # Composants React
│   ├── types/                 # Types TypeScript
│   └── App.tsx                # Application principale
├── scripts/
│   ├── fetch-rss.js           # Récupération flux RSS
│   ├── scraper.js             # Scraping sites d'emploi
│   ├── generate-ai.js         # Enrichissement IA (Groq)
│   └── generate-pages.js      # Génération pages HTML + sitemap
├── data/
│   ├── scraped-raw.json       # Données brutes scraping
│   ├── rss-logs.json          # Logs RSS
│   └── scraper-logs.json      # Logs scraper
└── .github/
    └── workflows/
        └── update-jobs.yml    # GitHub Actions (cron)
```

---

## ⚙️ Configuration GitHub Actions

### Secrets requis

Dans `Settings > Secrets and variables > Actions`, ajouter :

| Secret | Description |
|--------|-------------|
| `GROQ_API_KEY` | Clé API Groq (https://console.groq.com) |

### Déclenchement automatique

Le workflow s'exécute :
- Tous les jours à **8h00** (heure de Dakar)
- Tous les jours à **14h00** (heure de Dakar)
- Manuellement via `workflow_dispatch`

---

## 🤖 Pipeline automatique

```
1. fetch-rss.js      → Récupère les offres RSS
2. scraper.js        → Scrape les sites d'emploi
3. generate-ai.js    → Enrichit avec l'IA (Groq/LLaMA)
4. generate-pages.js → Génère les pages HTML + sitemap
5. Build React       → npm run build
6. Deploy GitHub Pages
```

### Limite de sécurité
- **Maximum 5 nouvelles offres par jour** (combiné RSS + scraping)
- Déduplication automatique via hash MD5 (titre + entreprise + date)
- Délai de 2 à 5 secondes entre chaque requête de scraping

---

## 💰 Monétisation

### Google AdSense
Des emplacements publicitaires sont préparés dans :
- Page d'accueil (728×90 banner)
- Pages détail d'offre (728×90 + 300×250)
- Entre les cartes d'offres (après chaque 6 offres)

Pour activer : remplacer `ca-pub-XXXXXXXXXXXXXXXX` par votre ID AdSense dans le code.

### Publication d'offres (WhatsApp)
Bouton "Publier une offre" → ouvre WhatsApp avec message pré-rempli.

Remplacer `221700000000` par votre numéro WhatsApp.

---

## 🔍 SEO

Chaque offre génère :
- Page HTML dédiée (`/jobs/nom-du-poste.html`)
- Meta title + description optimisés
- Schema.org `JobPosting` (données structurées)
- Open Graph + Twitter Cards
- URL propre et lisible

---

## 📡 Sources d'offres (scraping)

Le scraper cible plusieurs sites d'emploi en Afrique de l'Ouest.
Les sources ne sont jamais affichées aux visiteurs.

---

## 🎨 Stack technique

| Technologie | Usage |
|-------------|-------|
| React 19 + TypeScript | Interface utilisateur |
| Tailwind CSS v4 | Styles |
| Vite | Build |
| Node.js 20 | Scripts d'automatisation |
| Cheerio + Axios | Scraping HTML statique |
| Puppeteer | Scraping JS dynamique |
| Groq API (LLaMA) | Enrichissement IA |
| GitHub Actions | Automatisation |
| GitHub Pages | Hébergement |

---

## 📄 Licence

© 2025 Wuut Liggey — Tous droits réservés.
