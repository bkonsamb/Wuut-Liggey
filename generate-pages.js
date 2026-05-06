#!/usr/bin/env node
/**
 * generate-pages.js — Wuut Liggey
 * Génère les pages HTML individuelles pour chaque offre d'emploi
 * + sitemap.xml automatique + robots.txt
 * SEO optimisé avec meta tags dynamiques
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const JOBS_PATH = join(ROOT, 'public/data/jobs.json');
const JOBS_DIR = join(ROOT, 'public/jobs');
const SITEMAP_PATH = join(ROOT, 'public/sitemap.xml');
const ROBOTS_PATH = join(ROOT, 'public/robots.txt');

const BASE_URL = 'https://wuutliggey.sn';

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .substring(0, 80);
}

function generateJobPage(job, slug) {
  const contractColor = job.contract.includes('CDI') ? '#059669' : '#2563eb';
  const responsibilities = job.content.responsibilities.map(r => `<li>${r}</li>`).join('');
  const profile = job.content.profile.map(p => `<li>${p}</li>`).join('');
  const tags = job.tags.map(t => `<span class="tag">${t}</span>`).join('');
  const whatsappMsg = encodeURIComponent(`Bonjour, je suis intéressé(e) par le poste de ${job.title} chez ${job.company}. Pouvez-vous me donner plus d'informations ?`);

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${job.title} – ${job.company} | Wuut Liggey</title>
  <meta name="description" content="${job.excerpt.replace(/"/g, '&quot;').substring(0, 160)}">
  <meta name="keywords" content="${job.title}, ${job.company}, ${job.location}, emploi Sénégal, offre emploi">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${BASE_URL}/jobs/${slug}.html">
  
  <!-- Open Graph -->
  <meta property="og:title" content="${job.title} – ${job.company}">
  <meta property="og:description" content="${job.excerpt.substring(0, 200)}">
  <meta property="og:image" content="${job.image}">
  <meta property="og:url" content="${BASE_URL}/jobs/${slug}.html">
  <meta property="og:type" content="article">
  <meta property="og:locale" content="fr_SN">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${job.title} – ${job.company}">
  <meta name="twitter:description" content="${job.excerpt.substring(0, 200)}">
  <meta name="twitter:image" content="${job.image}">
  
  <!-- Schema.org JobPosting -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": "${job.title}",
    "description": "${job.content.presentation.replace(/"/g, '\\"')}",
    "hiringOrganization": {
      "@type": "Organization",
      "name": "${job.company}"
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "${job.location}",
        "addressCountry": "SN"
      }
    },
    "employmentType": "${job.contract}",
    "datePosted": "${job.date}",
    "validThrough": "${new Date(new Date(job.date).getTime() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}",
    "baseSalary": {
      "@type": "MonetaryAmount",
      "currency": "XOF",
      "value": "${job.salary}"
    }
  }
  </script>
  
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background: #f8fafc; color: #1e293b; }
    
    /* Header */
    .site-header { background: white; border-bottom: 1px solid #e2e8f0; padding: 0 1rem; position: sticky; top: 0; z-index: 100; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
    .header-inner { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; height: 64px; }
    .logo { display: flex; align-items: center; gap: 8px; text-decoration: none; }
    .logo-icon { width: 36px; height: 36px; background: linear-gradient(135deg, #16a34a, #065f46); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 12px; }
    .logo-text { font-size: 1.25rem; font-weight: 900; color: #1e293b; }
    .logo-text span { color: #16a34a; }
    .btn-publish { display: flex; align-items: center; gap: 6px; padding: 8px 16px; background: #16a34a; color: white; text-decoration: none; border-radius: 10px; font-size: 0.8rem; font-weight: 700; transition: background 0.2s; }
    .btn-publish:hover { background: #15803d; }
    
    /* Hero */
    .hero { position: relative; height: 260px; overflow: hidden; background: #0f172a; }
    .hero img { width: 100%; height: 100%; object-fit: cover; opacity: 0.45; }
    .hero-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.3)); }
    .hero-content { position: absolute; bottom: 0; left: 0; right: 0; padding: 1.5rem; max-width: 860px; margin: 0 auto; }
    .back-btn { display: inline-flex; align-items: center; gap: 6px; color: rgba(255,255,255,0.7); font-size: 0.8rem; text-decoration: none; margin-bottom: 1rem; padding: 6px 12px; background: rgba(255,255,255,0.1); border-radius: 8px; transition: color 0.2s; }
    .back-btn:hover { color: white; }
    .badges { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 0.75rem; }
    .badge { padding: 4px 12px; border-radius: 99px; font-size: 0.7rem; font-weight: 700; border: 1px solid; }
    .badge-contract { background: rgba(16,185,129,0.15); color: #34d399; border-color: rgba(52,211,153,0.3); }
    .badge-sector { background: rgba(255,255,255,0.15); color: rgba(255,255,255,0.9); border-color: rgba(255,255,255,0.2); }
    .hero-title { font-size: clamp(1.25rem, 4vw, 1.75rem); font-weight: 900; color: white; line-height: 1.25; margin-bottom: 0.25rem; }
    .hero-company { color: #6ee7b7; font-weight: 600; font-size: 1rem; }
    
    /* Main layout */
    .main { max-width: 860px; margin: 0 auto; padding: 1.5rem 1rem 3rem; display: grid; grid-template-columns: 1fr 300px; gap: 1.5rem; align-items: start; }
    @media (max-width: 768px) { .main { grid-template-columns: 1fr; } }
    
    /* Cards */
    .card { background: white; border-radius: 16px; padding: 1.5rem; border: 1px solid #e2e8f0; margin-bottom: 1.25rem; }
    .card-title { font-size: 0.95rem; font-weight: 700; color: #1e293b; margin-bottom: 1rem; display: flex; align-items: center; gap: 8px; }
    .card-title::before { content: ''; width: 3px; height: 20px; background: #16a34a; border-radius: 2px; }
    .card p { color: #475569; font-size: 0.875rem; line-height: 1.7; }
    .card ul { list-style: none; space: 0; }
    .card ul li { padding: 0.5rem 0; color: #475569; font-size: 0.875rem; line-height: 1.6; display: flex; gap: 10px; align-items: flex-start; border-bottom: 1px solid #f1f5f9; }
    .card ul li:last-child { border-bottom: none; }
    .card ul li::before { content: '✓'; color: #16a34a; font-weight: 700; flex-shrink: 0; font-size: 0.75rem; margin-top: 3px; }
    
    /* Sidebar */
    .sidebar { position: sticky; top: 80px; }
    .info-item { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 1rem; }
    .info-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 1rem; }
    .info-icon.green { background: #f0fdf4; }
    .info-icon.blue { background: #eff6ff; }
    .info-icon.yellow { background: #fefce8; }
    .info-icon.purple { background: #faf5ff; }
    .info-label { font-size: 0.7rem; color: #94a3b8; font-weight: 500; margin-bottom: 2px; }
    .info-value { font-size: 0.85rem; color: #1e293b; font-weight: 600; }
    .practical-text { font-size: 0.8rem; color: #64748b; line-height: 1.6; margin-bottom: 1.25rem; border-top: 1px solid #f1f5f9; padding-top: 1rem; }
    .btn-apply { display: block; width: 100%; padding: 14px; background: #16a34a; color: white; text-align: center; border-radius: 12px; font-weight: 700; font-size: 0.875rem; cursor: pointer; border: none; transition: all 0.2s; margin-bottom: 8px; }
    .btn-apply:hover { background: #15803d; transform: translateY(-1px); }
    .btn-whatsapp { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 12px; background: #25D366; color: white; text-decoration: none; text-align: center; border-radius: 12px; font-weight: 600; font-size: 0.85rem; transition: background 0.2s; }
    .btn-whatsapp:hover { background: #20b858; }
    
    /* Tags */
    .tag { padding: 4px 10px; background: #f1f5f9; color: #475569; border-radius: 6px; font-size: 0.75rem; font-weight: 500; }
    .tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 0.75rem; }
    
    /* AdSense placeholder */
    .ad-placeholder { background: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 12px; padding: 1rem; text-align: center; color: #94a3b8; font-size: 0.75rem; margin-bottom: 1.25rem; }
    
    /* Footer */
    .site-footer { background: #0f172a; color: #64748b; text-align: center; padding: 2rem 1rem; font-size: 0.8rem; }
    .site-footer a { color: #16a34a; text-decoration: none; }
    .site-footer strong { color: white; }
  </style>
  
  <!-- Google AdSense (remplacer data-ad-client par votre ID) -->
  <!-- <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script> -->
</head>
<body>

  <!-- Header -->
  <header class="site-header">
    <div class="header-inner">
      <a href="/" class="logo">
        <div class="logo-icon">WL</div>
        <span class="logo-text">Wuut <span>Liggey</span></span>
      </a>
      <a href="https://wa.me/221700000000?text=${encodeURIComponent('Bonjour, je souhaite publier une offre sur Wuut Liggey')}" target="_blank" rel="noopener noreferrer" class="btn-publish">
        📢 Publier une offre
      </a>
    </div>
  </header>

  <!-- Hero -->
  <div class="hero">
    <img src="${job.image}" alt="${job.title}" loading="eager">
    <div class="hero-overlay"></div>
    <div class="hero-content">
      <a href="/" class="back-btn">← Retour aux offres</a>
      <div class="badges">
        <span class="badge badge-contract">${job.contract}</span>
        <span class="badge badge-sector">${job.sector}</span>
      </div>
      <h1 class="hero-title">${job.title}</h1>
      <p class="hero-company">${job.company}</p>
    </div>
  </div>

  <!-- Main content -->
  <main class="main">
    <div>
      <!-- AdSense -->
      <div class="ad-placeholder">
        Espace publicitaire – Google AdSense (728×90)
        <!-- <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-XXXXXXXX" data-ad-slot="XXXXXXXXXX" data-ad-format="auto"></ins> -->
      </div>

      <!-- Presentation -->
      <div class="card">
        <h2 class="card-title">Présentation de l'opportunité</h2>
        <p>${job.content.presentation}</p>
        <div class="tags">${tags}</div>
      </div>

      <!-- Responsibilities -->
      <div class="card">
        <h2 class="card-title">Responsabilités principales</h2>
        <ul>${responsibilities}</ul>
      </div>

      <!-- Profile -->
      <div class="card">
        <h2 class="card-title">Profil recherché</h2>
        <ul>${profile}</ul>
      </div>

      <!-- AdSense -->
      <div class="ad-placeholder">
        Espace publicitaire – Google AdSense (300×250)
        <!-- <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-XXXXXXXX" data-ad-slot="XXXXXXXXXX" data-ad-format="auto"></ins> -->
      </div>
    </div>

    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="card">
        <h3 class="card-title" style="font-size:0.9rem">Informations pratiques</h3>
        
        <div class="info-item">
          <div class="info-icon green">📍</div>
          <div>
            <div class="info-label">Localisation</div>
            <div class="info-value">${job.location}</div>
          </div>
        </div>
        <div class="info-item">
          <div class="info-icon blue">📋</div>
          <div>
            <div class="info-label">Type de contrat</div>
            <div class="info-value">${job.contract}</div>
          </div>
        </div>
        <div class="info-item">
          <div class="info-icon yellow">💰</div>
          <div>
            <div class="info-label">Rémunération</div>
            <div class="info-value">${job.salary}</div>
          </div>
        </div>
        <div class="info-item">
          <div class="info-icon purple">📅</div>
          <div>
            <div class="info-label">Publiée le</div>
            <div class="info-value">${new Date(job.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
          </div>
        </div>
        
        <p class="practical-text">${job.content.practical}</p>
        
        <button class="btn-apply" onclick="this.textContent='✓ Candidature envoyée'; this.style.background='#94a3b8'; this.disabled=true;">
          Postuler maintenant
        </button>
        
        <a href="https://wa.me/221700000000?text=${whatsappMsg}" target="_blank" rel="noopener noreferrer" class="btn-whatsapp">
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Contacter via WhatsApp
        </a>
      </div>
    </aside>
  </main>

  <!-- Footer -->
  <footer class="site-footer">
    <p>&copy; ${new Date().getFullYear()} <strong>Wuut Liggey</strong> — <a href="/">Offres d'emploi au Sénégal</a></p>
    <p style="margin-top:8px">Retrouvez toutes les <a href="/">offres d'emploi</a> sur notre plateforme</p>
  </footer>

  <!-- Floating WhatsApp -->
  <a href="https://wa.me/221700000000?text=${encodeURIComponent('Bonjour, je souhaite publier une offre sur Wuut Liggey')}" target="_blank" rel="noopener noreferrer" style="position:fixed;bottom:24px;right:24px;width:56px;height:56px;background:#25D366;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(37,211,102,0.4);z-index:999;transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
    <svg width="28" height="28" fill="white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
  </a>
</body>
</html>`;
}

function generateSitemap(jobs) {
  const today = new Date().toISOString().split('T')[0];
  const urls = [
    `  <url>\n    <loc>${BASE_URL}/</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>`,
    ...jobs.map(job => {
      const slug = slugify(job.title) + '-' + job.id.slice(0, 8);
      return `  <url>\n    <loc>${BASE_URL}/jobs/${slug}.html</loc>\n    <lastmod>${job.date}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`;
    })
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;
}

function generateRobotsTxt() {
  return `User-agent: *
Allow: /
Disallow: /data/
Disallow: /scripts/

Sitemap: ${BASE_URL}/sitemap.xml

# Wuut Liggey — Offres d'emploi au Sénégal
`;
}

async function main() {
  console.log('📄 Wuut Liggey — Generate Pages démarré');
  console.log(`📅 Date: ${new Date().toISOString()}\n`);

  if (!existsSync(JOBS_PATH)) {
    console.error('❌ jobs.json introuvable');
    process.exit(1);
  }

  const jobs = JSON.parse(readFileSync(JOBS_PATH, 'utf-8'));
  console.log(`📦 ${jobs.length} offres à traiter\n`);

  // Create jobs directory
  if (!existsSync(JOBS_DIR)) {
    mkdirSync(JOBS_DIR, { recursive: true });
    console.log('📁 Dossier /public/jobs/ créé');
  }

  let generated = 0;
  for (const job of jobs) {
    const slug = slugify(job.title) + '-' + job.id.slice(0, 8);
    const filePath = join(JOBS_DIR, `${slug}.html`);
    const html = generateJobPage(job, slug);
    writeFileSync(filePath, html, 'utf-8');
    generated++;
    console.log(`  ✅ /jobs/${slug}.html`);
  }

  // Sitemap
  const sitemap = generateSitemap(jobs);
  writeFileSync(SITEMAP_PATH, sitemap, 'utf-8');
  console.log('\n🗺️  sitemap.xml généré');

  // Robots.txt
  const robots = generateRobotsTxt();
  writeFileSync(ROBOTS_PATH, robots, 'utf-8');
  console.log('🤖 robots.txt généré');

  console.log(`\n✨ ${generated} pages HTML générées`);
  console.log('✅ generate-pages.js terminé');
}

main().catch(err => {
  console.error('FATAL:', err.message);
  process.exit(1);
});
