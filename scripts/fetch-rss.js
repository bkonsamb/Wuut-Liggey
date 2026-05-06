#!/usr/bin/env node
/**
 * fetch-rss.js — Wuut Liggey
 * Récupère les offres d'emploi depuis des flux RSS Sénégal/Afrique francophone
 * Limite à 5 nouvelles offres par jour, déduplique via ID hash
 */

import { createHash } from 'crypto';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const RSS_FEEDS = [
  {
    name: 'Apec Sénégal',
    url: 'https://www.apec.fr/candidat/recherche-emploi.html/emploi?sortsType=DATE&sortsDirection=DESCENDING&typesConvention=101888&typesConvention=101889&typesConvention=101890&typesConvention=101891&typesConvention=101892&typesConvention=136560&page=0&_apecGauche_WAR_apecportlets_modeList=list',
    country: 'Sénégal'
  },
  {
    name: 'DevJobsAfrica',
    url: 'https://remoteafrica.io/feed/',
    country: 'Afrique'
  }
];

const MAX_NEW_PER_DAY = 5;
const JOBS_PATH = join(ROOT, 'public/data/jobs.json');
const LOG_PATH = join(ROOT, 'data/rss-logs.json');

function generateId(title, company, date) {
  return createHash('md5').update(`${title}::${company}::${date}`).digest('hex').slice(0, 16);
}

function loadJobs() {
  if (!existsSync(JOBS_PATH)) return [];
  try {
    return JSON.parse(readFileSync(JOBS_PATH, 'utf-8'));
  } catch {
    return [];
  }
}

function saveJobs(jobs) {
  writeFileSync(JOBS_PATH, JSON.stringify(jobs, null, 2), 'utf-8');
}

function loadLogs() {
  if (!existsSync(LOG_PATH)) return [];
  try {
    return JSON.parse(readFileSync(LOG_PATH, 'utf-8'));
  } catch {
    return [];
  }
}

function saveLogs(logs) {
  writeFileSync(LOG_PATH, JSON.stringify(logs, null, 2), 'utf-8');
}

function countTodayAdded(logs) {
  const today = new Date().toISOString().split('T')[0];
  return logs.filter(l => l.date === today && l.type === 'rss').length;
}

async function parseFeed(feedUrl) {
  try {
    const { default: fetch } = await import('node-fetch');
    const response = await fetch(feedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WuutLiggeyBot/1.0; +https://wuutliggey.sn/bot)',
        'Accept': 'application/rss+xml, application/xml, text/xml'
      },
      timeout: 10000
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const xml = await response.text();

    // Basic XML parsing without external library
    const items = [];
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
    let match;

    while ((match = itemRegex.exec(xml)) !== null) {
      const itemContent = match[1];
      const title = (itemContent.match(/<title[^>]*><!\[CDATA\[(.*?)\]\]><\/title>|<title[^>]*>(.*?)<\/title>/i) || [])[1] || (itemContent.match(/<title[^>]*><!\[CDATA\[(.*?)\]\]><\/title>|<title[^>]*>(.*?)<\/title>/i) || [])[2] || '';
      const description = (itemContent.match(/<description[^>]*><!\[CDATA\[(.*?)\]\]><\/description>|<description[^>]*>(.*?)<\/description>/is) || [])[1] || '';
      const link = (itemContent.match(/<link[^>]*>(.*?)<\/link>/i) || [])[1] || '';
      const pubDate = (itemContent.match(/<pubDate[^>]*>(.*?)<\/pubDate>/i) || [])[1] || '';

      if (title.trim()) {
        items.push({
          title: title.trim().replace(/<[^>]+>/g, ''),
          description: description.trim().replace(/<[^>]+>/g, '').substring(0, 500),
          link: link.trim(),
          pubDate: pubDate.trim() ? new Date(pubDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        });
      }
    }

    return items;
  } catch (err) {
    console.error(`  ❌ Erreur RSS ${feedUrl}: ${err.message}`);
    return [];
  }
}

async function main() {
  console.log('🔄 Wuut Liggey — Fetch RSS démarré');
  console.log(`📅 Date: ${new Date().toISOString()}\n`);

  const existingJobs = loadJobs();
  const existingIds = new Set(existingJobs.map(j => j.id));
  const logs = loadLogs();

  let addedToday = countTodayAdded(logs);
  const newJobs = [];

  for (const feed of RSS_FEEDS) {
    if (addedToday >= MAX_NEW_PER_DAY) {
      console.log(`⛔ Limite journalière atteinte (${MAX_NEW_PER_DAY}). Arrêt.`);
      break;
    }

    console.log(`📡 Fetching: ${feed.name}`);
    const items = await parseFeed(feed.url);
    console.log(`  → ${items.length} items trouvés`);

    for (const item of items) {
      if (addedToday >= MAX_NEW_PER_DAY) break;

      const id = generateId(item.title, feed.name, item.pubDate);
      if (existingIds.has(id)) {
        console.log(`  ↳ Doublon ignoré: ${item.title.substring(0, 50)}`);
        continue;
      }

      // Structure de base — sera enrichie par generate-ai.js
      const job = {
        id,
        title: item.title,
        company: 'À confirmer',
        location: 'Dakar, Sénégal',
        contract: 'CDI',
        sector: 'Divers',
        salary: 'À négocier',
        date: item.pubDate,
        image: `https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=600`,
        tags: [feed.country],
        excerpt: item.description.substring(0, 200),
        content: {
          presentation: item.description,
          responsibilities: ['À préciser'],
          profile: ['À préciser'],
          practical: `Source: ${feed.name}`
        },
        _raw: true,
        _source_url: item.link
      };

      newJobs.push(job);
      existingIds.add(id);
      addedToday++;

      logs.push({
        id,
        title: item.title,
        source: feed.name,
        date: new Date().toISOString().split('T')[0],
        type: 'rss'
      });

      console.log(`  ✅ Ajouté: ${item.title.substring(0, 60)}`);
    }
  }

  if (newJobs.length > 0) {
    const merged = [...newJobs, ...existingJobs].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    saveJobs(merged);
    saveLogs(logs.slice(-500)); // garder 500 derniers logs
    console.log(`\n✨ ${newJobs.length} nouvelles offres ajoutées via RSS`);
  } else {
    console.log('\n💡 Aucune nouvelle offre RSS à ajouter');
  }

  console.log('\n✅ fetch-rss.js terminé');
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
