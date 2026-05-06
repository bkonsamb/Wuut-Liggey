import React from 'react';
import { Job } from '../types/job';

interface FiltersProps {
  jobs: Job[];
  selectedSector: string;
  selectedLocation: string;
  selectedContract: string;
  onSectorChange: (sector: string) => void;
  onLocationChange: (location: string) => void;
  onContractChange: (contract: string) => void;
  resultCount: number;
}

const Filters: React.FC<FiltersProps> = ({
  jobs,
  selectedSector,
  selectedLocation,
  selectedContract,
  onSectorChange,
  onLocationChange,
  onContractChange,
  resultCount
}) => {
  const sectors = ['Tous', ...Array.from(new Set(jobs.map(j => j.sector))).sort()];
  const locations = ['Toutes', ...Array.from(new Set(jobs.map(j => j.location.split(',')[0].trim()))).sort()];
  const contracts = ['Tous', ...Array.from(new Set(jobs.map(j => j.contract.split('–')[0].trim()))).sort()];

  return (
    <div className="bg-white border-b border-gray-100 shadow-sm sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 py-3">
          {/* Result count */}
          <div className="text-sm text-gray-500 font-medium whitespace-nowrap">
            <span className="text-green-600 font-bold">{resultCount}</span> offre{resultCount > 1 ? 's' : ''} trouvée{resultCount > 1 ? 's' : ''}
          </div>

          <div className="flex flex-wrap gap-2 flex-1">
            {/* Sector */}
            <select
              value={selectedSector}
              onChange={(e) => onSectorChange(e.target.value)}
              className="px-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer hover:bg-gray-100 transition-colors"
            >
              {sectors.map(sector => (
                <option key={sector} value={sector}>{sector}</option>
              ))}
            </select>

            {/* Location */}
            <select
              value={selectedLocation}
              onChange={(e) => onLocationChange(e.target.value)}
              className="px-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer hover:bg-gray-100 transition-colors"
            >
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>

            {/* Contract */}
            <select
              value={selectedContract}
              onChange={(e) => onContractChange(e.target.value)}
              className="px-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer hover:bg-gray-100 transition-colors"
            >
              {contracts.map(contract => (
                <option key={contract} value={contract}>{contract}</option>
              ))}
            </select>

            {/* Reset */}
            {(selectedSector !== 'Tous' || selectedLocation !== 'Toutes' || selectedContract !== 'Tous') && (
              <button
                onClick={() => {
                  onSectorChange('Tous');
                  onLocationChange('Toutes');
                  onContractChange('Tous');
                }}
                className="px-3 py-1.5 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Réinitialiser
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Filters;
