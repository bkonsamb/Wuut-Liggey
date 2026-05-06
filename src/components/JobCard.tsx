import React, { useState } from 'react';
import { Job } from '../types/job';

interface JobCardProps {
  job: Job;
  onClick: (job: Job) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onClick }) => {
  const [imgError, setImgError] = useState(false);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const contractColor = (contract: string) => {
    if (contract.includes('CDI')) return 'bg-emerald-100 text-emerald-700';
    if (contract.includes('CDD')) return 'bg-blue-100 text-blue-700';
    if (contract.includes('Stage')) return 'bg-orange-100 text-orange-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <article
      onClick={() => onClick(job)}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        {!imgError ? (
          <img
            src={job.image}
            alt={`Offre d'emploi - ${job.title}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
            <svg className="w-16 h-16 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {/* Sector badge */}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-semibold rounded-full shadow-sm">
            {job.sector}
          </span>
        </div>
        {/* Date badge */}
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 bg-black/50 backdrop-blur-sm text-white text-xs rounded-full">
            {formatDate(job.date)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        {/* Contract type */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${contractColor(job.contract)}`}>
            {job.contract.split('–')[0].trim()}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-base font-bold text-gray-900 leading-snug mb-1 group-hover:text-green-700 transition-colors line-clamp-2">
          {job.title}
        </h2>

        {/* Company */}
        <p className="text-sm font-medium text-green-700 mb-2">{job.company}</p>

        {/* Location & Salary */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3">
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {job.location}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {job.salary}
          </span>
        </div>

        {/* Excerpt */}
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 flex-1 mb-4">
          {job.excerpt}
        </p>

        {/* CTA */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
          <div className="flex flex-wrap gap-1">
            {job.tags.slice(0, 2).map(tag => (
              <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md">
                {tag}
              </span>
            ))}
          </div>
          <span className="text-green-600 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
            Voir
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </article>
  );
};

export default JobCard;
