import React from 'react';
import { Job } from '../types/job';

interface SectorsPageProps {
  jobs: Job[];
  onSectorClick: (sector: string) => void;
}

const sectorIcons: Record<string, string> = {
  'Technologie': '💻',
  'Marketing & Communication': '📣',
  'Finance & Comptabilité': '💰',
  'Ressources Humaines': '👥',
  'Commerce & Vente': '📊',
  'BTP & Construction': '🏗️',
  'Banque & Finance': '🏦',
  'Data & Technologie': '📈',
  'Commerce & Distribution': '🏪',
  'Santé & Médical': '🏥',
  'Télécommunications': '📡',
  'Logistique & Transport': '🚚',
};

const sectorColors: Record<string, string> = {
  'Technologie': 'from-blue-500 to-indigo-600',
  'Marketing & Communication': 'from-pink-500 to-rose-600',
  'Finance & Comptabilité': 'from-yellow-500 to-amber-600',
  'Ressources Humaines': 'from-purple-500 to-violet-600',
  'Commerce & Vente': 'from-orange-500 to-red-600',
  'BTP & Construction': 'from-stone-500 to-gray-600',
  'Banque & Finance': 'from-teal-500 to-cyan-600',
  'Data & Technologie': 'from-sky-500 to-blue-600',
  'Commerce & Distribution': 'from-emerald-500 to-green-600',
  'Santé & Médical': 'from-red-500 to-pink-600',
  'Télécommunications': 'from-violet-500 to-purple-600',
  'Logistique & Transport': 'from-green-500 to-emerald-600',
};

const SectorsPage: React.FC<SectorsPageProps> = ({ jobs, onSectorClick }) => {
  const sectorCounts = jobs.reduce((acc, job) => {
    acc[job.sector] = (acc[job.sector] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sectors = Object.entries(sectorCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-black text-gray-900 mb-3">Secteurs d'activité</h1>
          <p className="text-gray-500 text-lg">Explorez les opportunités par domaine professionnel</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sectors.map(([sector, count]) => (
            <button
              key={sector}
              onClick={() => onSectorClick(sector)}
              className="group relative overflow-hidden rounded-2xl p-6 text-left hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-xl cursor-pointer"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${sectorColors[sector] || 'from-gray-500 to-gray-600'}`} />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
              <div className="relative">
                <div className="text-4xl mb-3">{sectorIcons[sector] || '💼'}</div>
                <h3 className="text-white font-bold text-sm leading-tight mb-2">{sector}</h3>
                <div className="flex items-center gap-1.5">
                  <span className="text-white/90 text-xl font-black">{count}</span>
                  <span className="text-white/70 text-xs">offre{count > 1 ? 's' : ''}</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Stats banner */}
        <div className="mt-12 bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-black mb-2">Vous recrutez ?</h2>
          <p className="text-green-100 mb-6 max-w-md mx-auto">
            Publiez votre offre d'emploi sur Wuut Liggey et touchez des milliers de candidats qualifiés au Sénégal.
          </p>
          <a
            href={`https://wa.me/221700000000?text=${encodeURIComponent("Bonjour, je souhaite publier une offre sur Wuut Liggey")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-green-700 font-bold rounded-xl hover:bg-green-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Publier une offre via WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
};

export default SectorsPage;
