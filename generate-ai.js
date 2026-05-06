#!/usr/bin/env node
/**
 * generate-ai.js — Wuut Liggey
 * Enrichit les offres brutes avec l'API Groq (LLaMA)
 * Reformule le contenu de manière naturelle et professionnelle
 * AUCUNE mention d'automatisation ou d'IA dans le contenu généré
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const JOBS_PATH = join(ROOT, 'public/data/jobs.json');
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = 'llama-3.1-8b-instant';
const DELAY_BETWEEN_REQUESTS = 2500; // ms

// ─── Image mapping by sector ──────────────────────────────────────────────────
const SECTOR_IMAGES = {
  'Technologie': 'https://images.pexels.com/photos/34803998/pexels-photo-34803998.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=600',
  'Data & Technologie': 'https://images.pexels.com/photos/5223887/pexels-photo-5223887.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=600',
  'Marketing & Communication': 'https://images.pexels.com/photos/7793738/pexels-photo-7793738.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=600',
  'Finance & Comptabilité': 'https://images.pexels.com/photos/5324987/pexels-photo-5324987.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=600',
  'Ressources Humaines': 'https://images.pexels.com/photos/8276186/pexels-photo-8276186.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=600',
  'Commerce & Vente': 'https://images.pexels.com/photos/12885860/pexels-photo-12885860.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=600',
  'BTP & Construction': 'https://images.pexels.com/photos/5684558/pexels-photo-5684558.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=600',
  'Banque & Finance': 'https://images.pexels.com/photos/7520156/pexels-photo-7520156.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=600',
  'Santé & Médical': 'https://images.pexels.com/photos/20209020/pexels-photo-20209020.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=600',
  'Logistique & Transport': 'https://images.pexels.com/photos/19805876/pexels-photo-19805876.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=600',
  'default': 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=600'
};

function loadJobs() {
  if (!existsSync(JOBS_PATH)) return [];
  return JSON.parse(readFileSync(JOBS_PATH, 'utf-8'));
}

function saveJobs(jobs) {
  writeFileSync(JOBS_PATH, JSON.stringify(jobs, null, 2), 'utf-8');
}

function getImageForSector(sector) {
  return SECTOR_IMAGES[sector] || SECTOR_IMAGES['default'];
}

function detectSector(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  const sectorKeywords = {
    'Technologie': ['développeur', 'developer', 'informatique', 'logiciel', 'software', 'web', 'it ', 'système', 'réseau', 'cloud', 'devops'],
    'Data & Technologie': ['data', 'analyst', 'business intelligence', 'bi ', 'machine learning', 'ia ', 'intelligence artificielle'],
    'Marketing & Communication': ['marketing', 'communication', 'digital', 'social media', 'seo', 'content', 'brand', 'publicité'],
    'Finance & Comptabilité': ['comptable', 'finance', 'financier', 'audit', 'fiscal', 'trésorerie', 'budget', 'contrôle de gestion'],
    'Ressources Humaines': ['rh ', 'ressources humaines', 'recrutement', 'paie', 'talent', 'formation', 'sirh'],
    'Commerce & Vente': ['commercial', 'vente', 'vendeur', 'business developer', 'sales', 'account manager', 'client'],
    'BTP & Construction': ['génie civil', 'btp', 'construction', 'chantier', 'ingénieur travaux', 'architecture', 'bâtiment'],
    'Banque & Finance': ['banque', 'bancaire', 'crédit', 'conseiller clientèle', 'agence bancaire', 'microfinance'],
    'Santé & Médical': ['médecin', 'infirmier', 'santé', 'médical', 'pharmacien', 'clinique', 'hôpital', 'paramédical'],
    'Télécommunications': ['télécom', 'télécommunication', 'réseau mobile', 'fibre', 'gsm', 'opérateur'],
    'Logistique & Transport': ['logistique', 'supply chain', 'transport', 'chauffeur', 'douane', 'transit', 'magasinier']
  };

  for (const [sector, keywords] of Object.entries(sectorKeywords)) {
    if (keywords.some(kw => text.includes(kw))) return sector;
  }
  return 'Divers';
}

async function callGroq(prompt) {
  if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY non définie');

  const { default: fetch } = await import('node-fetch');
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        {
          role: 'system',
          content: `Tu es rédacteur pour un site d'offres d'emploi au Sénégal. 
Tu reformules les offres de manière naturelle, professionnelle et crédible.
RÈGLES STRICTES :
- Ton neutre de site d'emploi (jamais "nous recrutons" ou "rejoignez notre équipe")
- Ne jamais inventer des informations non présentes dans la source
- Écrire en français soutenu, style site d'emploi professionnel
- Ne jamais mentionner d'IA, de scraping, ou d'automatisation
- Réponse uniquement en JSON valide, sans markdown`
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.6,
      max_tokens: 1200
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content?.trim();
}

async function enrichJob(job) {
  const prompt = `
Voici une offre d'emploi brute :
Titre: ${job.title}
Entreprise: ${job.company}
Localisation: ${job.location}
Description brute: ${job.excerpt || job.content?.presentation || 'Non disponible'}

Génère un JSON avec cette structure exacte (sans markdown) :
{
  "excerpt": "Résumé accrocheur de 1-2 phrases (150 caractères max)",
  "sector": "Secteur d'activité précis",
  "contract": "Type de contrat (CDI, CDD, Stage, Freelance)",
  "tags": ["tag1", "tag2", "tag3"],
  "content": {
    "presentation": "Présentation de l'opportunité en 2-3 phrases naturelles",
    "responsibilities": ["Responsabilité 1", "Responsabilité 2", "Responsabilité 3", "Responsabilité 4"],
    "profile": ["Critère profil 1", "Critère profil 2", "Critère profil 3"],
    "practical": "Informations pratiques en 1-2 phrases"
  }
}`;

  try {
    const raw = await callGroq(prompt);
    // Extract JSON (handle potential markdown wrapping)
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');
    const parsed = JSON.parse(jsonMatch[0]);

    return {
      ...job,
      excerpt: parsed.excerpt || job.excerpt,
      sector: parsed.sector || job.sector,
      contract: parsed.contract || job.contract,
      tags: parsed.tags || job.tags,
      image: getImageForSector(parsed.sector),
      content: {
        presentation: parsed.content?.presentation || job.content?.presentation,
        responsibilities: parsed.content?.responsibilities || job.content?.responsibilities,
        profile: parsed.content?.profile || job.content?.profile,
        practical: parsed.content?.practical || job.content?.practical
      },
      _raw: false,
      _enriched_at: new Date().toISOString()
    };
  } catch (err) {
    console.warn(`  ⚠️ Groq échoué pour "${job.title}": ${err.message}`);
    // Fallback: enrich without AI
    const sector = detectSector(job.title, job.excerpt || '');
    return {
      ...job,
      sector,
      image: getImageForSector(sector),
      _raw: false,
      _ai_failed: true
    };
  }
}

async function main() {
  console.log('🧠 Wuut Liggey — Generate AI démarré');
  console.log(`📅 Date: ${new Date().toISOString()}`);

  if (!GROQ_API_KEY) {
    console.warn('\n⚠️  GROQ_API_KEY non définie — enrichissement IA désactivé');
    console.log('💡 Définissez GROQ_API_KEY dans les variables d\'environnement GitHub Actions');
  }

  const jobs = loadJobs();
  const rawJobs = jobs.filter(j => j._raw === true);
  const doneJobs = jobs.filter(j => j._raw !== true);

  console.log(`\n📦 ${rawJobs.length} offres brutes à enrichir`);
  console.log(`✅ ${doneJobs.length} offres déjà enrichies\n`);

  if (rawJobs.length === 0) {
    console.log('Aucune offre à enrichir. Terminé.');
    return;
  }

  const enriched = [];
  for (let i = 0; i < rawJobs.length; i++) {
    const job = rawJobs[i];
    console.log(`[${i + 1}/${rawJobs.length}] Enrichissement: ${job.title.substring(0, 60)}`);

    const enrichedJob = await enrichJob(job);
    enriched.push(enrichedJob);

    if (i < rawJobs.length - 1) {
      await new Promise(r => setTimeout(r, DELAY_BETWEEN_REQUESTS));
    }
  }

  const finalJobs = [...enriched, ...doneJobs]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  saveJobs(finalJobs);

  console.log(`\n✨ ${enriched.length} offres enrichies et sauvegardées`);
  console.log('✅ generate-ai.js terminé');
}

main().catch(err => {
  console.error('FATAL:', err.message);
  process.exit(1);
});
