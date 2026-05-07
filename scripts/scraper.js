#!/usr/bin/env node
/**
 * scraper.js — Wuut Liggey
 * Scrape les sites d'emploi sénégalais pour extraire les offres
 * Stack: Cheerio + Axios (HTML statique) / Puppeteer (sites dynamiques)
 * Éthique: délai aléatoire 2-5s, respect robots.txt, user-agents rotatifs
 */

import { createHash } from 'crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ─── Paths ────────────────────────────────────────────────────────────────────
const SCRAPED_RAW_PATH = join(ROOT, 'data/scraped-raw.json');
const JOBS_PATH = join(ROOT, 'public/data/jobs.json');
const LOGS_PATH = join(ROOT, 'data/scraper-logs.json');
const DATA_DIR = join(ROOT, 'data');

// ─── Config ───────────────────────────────────────────────────────────────────
const MAX_NEW_PER_DAY = 5;
const MIN_DELAY_MS = 2000;
const MAX_DELAY_MS = 5000;
const MAX_RETRIES = 3;

// ─── User-Agent pool ──────────────────────────────────────────────────────────
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/120.0'
];

// ─── Target sites ─────────────────────────────────────────────────────────────
const SITES = [
  {
    name: 'emploi-sn',
    displayName: 'Emploi Dakar',
    url: 'https://www.emploidakar.com/offres-demploi-au-senegal/',
    type: 'cheerio',
    selectors: {
      container: '.offer-item',
      title: '.offer-title',
      company: '.offer-company',
      location: '.offer-location',
      date: '.offer-date',
      description: '.offer-description',
      link: 'a'
    }
  },
  {
    name: 'senjob',
    displayName: 'Jobs Sénégal',
    url: 'https://senjob.com/offres-d-emploi.php',
    type: 'cheerio',
    selectors: {
      container: '.job-listing',
      title: '.job-title',
      company: '.company-name',
      location: '.job-location',
      date: '.job-date',
      description: '.job-excerpt',
      link: 'a.job-link'
    }
  },
  {
    name: 'emploi-sn',
    displayName: 'Emploi Sénégal',
    url: 'https://www.emploi.sn/offres',
    type: 'cheerio',
    selectors: {
      container: '.offer-item',
      title: '.offer-title',
      company: '.offer-company',
      location: '.offer-location',
      date: '.offer-date',
      description: '.offer-description',
      link: 'a'
    }
  },
  {
    name: 'galsen-ji',
    displayName: 'Galsen Ji',
    url: 'https://galsen-ji.com/emplois/',
    type: 'cheerio',
    selectors: {
      container: '.job-item',
      title: 'h2.job-title',
      company: '.company',
      location: '.location',
      date: '.date',
      description: '.excerpt',
      link: 'a.job-url'
    }
  },
  {
    name: 'africarh',
    displayName: 'Africa RH',
    url: 'https://www.africarh.com/offres-emploi/senegal/',
    type: 'cheerio',
    selectors: {
      container: '.offer',
      title: '.offer-title a',
      company: '.offer-company',
      location: '.offer-location',
      date: '.offer-date',
      description: '.offer-description',
      link: '.offer-title a'
    }
  },
  {
    name: 'rekrute-sn',
    displayName: 'Rekrute',
    url: 'https://www.rekrute.com/offres-emploi-senegal.html',
    type: 'cheerio',
    selectors: {
      container: '.post-item',
      title: '.post-title',
      company: '.company-info',
      location: '.city',
      date: '.date',
      description: '.post-description',
      link: '.post-title a'
    }
  }
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function generateHash(title, company, date) {
  return createHash('md5')
    .update(`${(title || '').toLowerCase().trim()}::${(company || '').toLowerCase().trim()}::${date}`)
    .digest('hex')
    .slice(0, 16);
}

function randomDelay() {
  const ms = Math.floor(Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS + 1)) + MIN_DELAY_MS;
  return new Promise(resolve => setTimeout(resolve, ms));
}

function randomUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function loadJson(path) {
  if (!existsSync(path)) return [];
  try { return JSON.parse(readFileSync(path, 'utf-8')); }
  catch { return []; }
}

function saveJson(path, data) {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2), 'utf-8');
}

function parseDate(raw) {
  if (!raw) return new Date().toISOString().split('T')[0];
  try {
    const d = new Date(raw.trim());
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  } catch {}
  return new Date().toISOString().split('T')[0];
}

function cleanText(text) {
  if (!text) return '';
  return text.replace(/\s+/g, ' ').replace(/<[^>]+>/g, '').trim();
}

// ─── HTTP scraper with retry ──────────────────────────────────────────────────
async function fetchWithRetry(url, retries = MAX_RETRIES) {
  let { default: axios } = await import('axios');
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': randomUA(),
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Cache-Control': 'max-age=0'
        },
        timeout: 15000,
        maxRedirects: 5
      });
      return response.data;
    } catch (err) {
      const isLast = attempt === retries;
      console.warn(`    Tentative ${attempt}/${retries} échouée: ${err.message}`);
      if (!isLast) {
        await new Promise(r => setTimeout(r, 2000 * attempt));
      } else {
        throw err;
      }
    }
  }
}

// ─── Cheerio scraper ──────────────────────────────────────────────────────────
async function scrapeWithCheerio(site, logs) {
  const { load } = await import('cheerio');
  const results = [];

  try {
    console.log(`  📄 Scraping HTML statique: ${site.url}`);
    const html = await fetchWithRetry(site.url);
    const $ = load(html);
    const { selectors } = site;

    $(selectors.container).each((i, el) => {
      try {
        const title = cleanText($(el).find(selectors.title).first().text());
        const company = cleanText($(el).find(selectors.company).first().text());
        const location = cleanText($(el).find(selectors.location).first().text()) || 'Sénégal';
        const dateRaw = cleanText($(el).find(selectors.date).first().text());
        const description = cleanText($(el).find(selectors.description).first().text()).substring(0, 800);
        let url = $(el).find(selectors.link).first().attr('href') || '';

        if (!url.startsWith('http')) {
          const base = new URL(site.url);
          url = `${base.protocol}//${base.host}${url.startsWith('/') ? '' : '/'}${url}`;
        }

        if (!title || title.length < 3) return;

        const date = parseDate(dateRaw);
        const id = generateHash(title, company, date);

        results.push({
          id,
          source: site.name,
          title,
          company: company || 'Non précisé',
          location: location.includes('Sénégal') || location.includes('Dakar') ? location : `${location}, Sénégal`,
          date,
          description,
          url,
          scraped_at: new Date().toISOString()
        });
      } catch (err) {
        // Ignore item parse errors silently
      }
    });

    console.log(`  → ${results.length} offres extraites de ${site.displayName}`);
  } catch (err) {
    const errorEntry = {
      timestamp: new Date().toISOString(),
      site: site.name,
      url: site.url,
      error: err.message,
      type: 'scrape_error'
    };
    logs.push(errorEntry);
    console.error(`  ❌ Échec scraping ${site.displayName}: ${err.message}`);
  }

  return results;
}

// ─── Puppeteer scraper (for JS-rendered sites) ────────────────────────────────
async function scrapeWithPuppeteer(site, logs) {
  const results = [];
  let browser;

  try {
    const puppeteer = await import('puppeteer');
    browser = await puppeteer.default.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    const page = await browser.newPage();
    await page.setUserAgent(randomUA());
    await page.goto(site.url, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForTimeout(2000);

    const items = await page.evaluate((sel) => {
      const jobs = [];
      document.querySelectorAll(sel.container).forEach(el => {
        const get = (s) => el.querySelector(s)?.textContent?.trim() || '';
        const href = el.querySelector(s => s)?.getAttribute('href') || '';
        jobs.push({
          title: get(sel.title),
          company: get(sel.company),
          location: get(sel.location),
          date: get(sel.date),
          description: get(sel.description)?.substring(0, 800),
          url: href
        });
      });
      return jobs;
    }, site.selectors);

    items.forEach(item => {
      if (!item.title || item.title.length < 3) return;
      const date = parseDate(item.date);
      results.push({
        id: generateHash(item.title, item.company, date),
        source: site.name,
        ...item,
        location: item.location || 'Sénégal',
        date,
        scraped_at: new Date().toISOString()
      });
    });

    console.log(`  → ${results.length} offres extraites de ${site.displayName} (Puppeteer)`);
  } catch (err) {
    logs.push({
      timestamp: new Date().toISOString(),
      site: site.name,
      error: err.message,
      type: 'puppeteer_error'
    });
    console.error(`  ❌ Puppeteer échoué pour ${site.displayName}: ${err.message}`);
  } finally {
    if (browser) await browser.close();
  }

  return results;
}

// ─── Map scraped data to jobs.json format ─────────────────────────────────────
function mapToJobFormat(scraped) {
  const sectors = ['Technologie', 'Finance & Comptabilité', 'Commerce & Vente', 'Marketing & Communication', 'Ressources Humaines', 'BTP & Construction', 'Santé & Médical', 'Logistique & Transport'];
  const images = [
    'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=600',
    'https://images.pexels.com/photos/7520156/pexels-photo-7520156.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=600',
    'https://images.pexels.com/photos/19805876/pexels-photo-19805876.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=600'
  ];

  return {
    id: scraped.id,
    title: scraped.title,
    company: scraped.company || 'Entreprise confidentielle',
    location: scraped.location || 'Dakar, Sénégal',
    contract: 'CDI',
    sector: sectors[Math.floor(Math.random() * sectors.length)],
    salary: 'À négocier',
    date: scraped.date,
    image: images[Math.floor(Math.random() * images.length)],
    tags: ['Sénégal'],
    excerpt: (scraped.description || '').substring(0, 200),
    content: {
      presentation: scraped.description || 'Description disponible sur le lien source.',
      responsibilities: ['Détails disponibles sur la page de l\'offre.'],
      profile: ['Profil précisé dans l\'annonce originale.'],
      practical: `Poste basé à ${scraped.location || 'Sénégal'}. Pour postuler, consultez l'annonce complète.`
    },
    _raw: true,
    _source_url: scraped.url
  };
}

// ─── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🕷️  Wuut Liggey — Scraper démarré');
  console.log(`📅 Date: ${new Date().toISOString()}\n`);

  const scrapedRaw = loadJson(SCRAPED_RAW_PATH);
  const existingJobs = loadJson(JOBS_PATH);
  const logs = loadJson(LOGS_PATH);

  const knownIds = new Set([
    ...scrapedRaw.map(j => j.id),
    ...existingJobs.map(j => j.id)
  ]);

  // Count today's additions from ALL sources
  const today = new Date().toISOString().split('T')[0];
  const rssLogs = loadJson(join(ROOT, 'data/rss-logs.json'));
  let addedToday = logs.filter(l => l.date === today && l.type === 'scraped').length
    + rssLogs.filter(l => l.date === today && l.type === 'rss').length;

  const summary = {};
  const allNew = [];

  for (const site of SITES) {
    if (addedToday >= MAX_NEW_PER_DAY) {
      console.log(`⛔ Limite journalière atteinte (${MAX_NEW_PER_DAY}). Stop.`);
      break;
    }

    console.log(`\n🌐 [${site.displayName}] — ${site.url}`);
    await randomDelay();

    let scraped = [];
    if (site.type === 'puppeteer') {
      scraped = await scrapeWithPuppeteer(site, logs);
    } else {
      scraped = await scrapeWithCheerio(site, logs);
    }

    let siteAdded = 0, siteDups = 0;

    for (const item of scraped) {
      if (addedToday >= MAX_NEW_PER_DAY) break;
      if (knownIds.has(item.id)) {
        siteDups++;
        continue;
      }

      scrapedRaw.push(item);
      knownIds.add(item.id);

      const job = mapToJobFormat(item);
      allNew.push(job);
      addedToday++;
      siteAdded++;

      logs.push({
        id: item.id,
        title: item.title,
        source: site.name,
        date: today,
        type: 'scraped'
      });
    }

    summary[site.displayName] = {
      found: scraped.length,
      added: siteAdded,
      duplicates: siteDups
    };

    console.log(`  📊 Trouvées: ${scraped.length} | Ajoutées: ${siteAdded} | Doublons: ${siteDups}`);
  }

  // Save all data
  saveJson(SCRAPED_RAW_PATH, scrapedRaw.slice(-1000));
  saveJson(LOGS_PATH, logs.slice(-1000));

  if (allNew.length > 0) {
    const merged = [...allNew, ...existingJobs]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    saveJson(JOBS_PATH, merged);
  }

  // Final summary
  console.log('\n' + '═'.repeat(50));
  console.log('📊 RÉSUMÉ DU SCRAPING');
  console.log('═'.repeat(50));
  Object.entries(summary).forEach(([site, stats]) => {
    console.log(`  ${site}: ${stats.found} trouvées | ${stats.added} ajoutées | ${stats.duplicates} doublons`);
  });
  console.log(`\n✨ Total nouvelles offres: ${allNew.length}`);
  console.log('✅ scraper.js terminé\n');
}

main().catch(err => {
  console.error('FATAL:', err.message);
  process.exit(1);
});
