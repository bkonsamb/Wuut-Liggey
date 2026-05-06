import React, { useState, useEffect, useMemo } from 'react';
import { Job } from './types/job';
import Header from './components/Header';
import Hero from './components/Hero';
import JobCard from './components/JobCard';
import JobDetail from './components/JobDetail';
import Filters from './components/Filters';
import SectorsPage from './components/SectorsPage';
import Footer from './components/Footer';
import jobsData from '../public/data/jobs.json';

const JOBS_PER_PAGE = 6;

type View = 'home' | 'detail' | 'sectors';

function App() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('Tous');
  const [selectedLocation, setSelectedLocation] = useState('Toutes');
  const [selectedContract, setSelectedContract] = useState('Tous');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch('/data/jobs.json');
        const data: Job[] = await response.json();
        // Sort by date descending
        const sorted = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setJobs(sorted);
      } catch (err) {
        console.error('Error loading jobs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchSearch = searchQuery === '' ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.sector.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchSector = selectedSector === 'Tous' || job.sector === selectedSector;

      const jobCity = job.location.split(',')[0].trim();
      const matchLocation = selectedLocation === 'Toutes' || jobCity === selectedLocation;

      const jobContract = job.contract.split('–')[0].trim();
      const matchContract = selectedContract === 'Tous' || jobContract === selectedContract || jobContract.includes(selectedContract);

      return matchSearch && matchSector && matchLocation && matchContract;
    });
  }, [jobs, searchQuery, selectedSector, selectedLocation, selectedContract]);

  const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE);
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * JOBS_PER_PAGE, currentPage * JOBS_PER_PAGE);

  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
    setCurrentView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (view: string) => {
    setCurrentView(view as View);
    setSelectedJob(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    if (currentView !== 'home') setCurrentView('home');
  };

  const handleSectorClick = (sector: string) => {
    setSelectedSector(sector);
    setCurrentView('home');
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Chargement des offres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-[Inter,sans-serif]">
      <Header
        onSearch={handleSearch}
        searchQuery={searchQuery}
        currentView={currentView}
        onNavigate={handleNavigate}
      />

      {/* Detail view */}
      {currentView === 'detail' && selectedJob && (
        <JobDetail job={selectedJob} onBack={() => handleNavigate('home')} />
      )}

      {/* Sectors view */}
      {currentView === 'sectors' && (
        <SectorsPage jobs={jobs} onSectorClick={handleSectorClick} />
      )}

      {/* Home view */}
      {currentView === 'home' && (
        <>
          <Hero
            jobCount={jobs.length}
            onSearch={handleSearch}
            searchQuery={searchQuery}
          />

          <Filters
            jobs={jobs}
            selectedSector={selectedSector}
            selectedLocation={selectedLocation}
            selectedContract={selectedContract}
            onSectorChange={(s) => { setSelectedSector(s); handleFilterChange(); }}
            onLocationChange={(l) => { setSelectedLocation(l); handleFilterChange(); }}
            onContractChange={(c) => { setSelectedContract(c); handleFilterChange(); }}
            resultCount={filteredJobs.length}
          />

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* AdSense Banner */}
            <div className="mb-8 bg-gray-100 border border-dashed border-gray-300 rounded-xl p-4 text-center text-gray-400 text-xs">
              <span>Espace publicitaire – Google AdSense (728×90)</span>
            </div>

            {filteredJobs.length === 0 ? (
              <div className="text-center py-24">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Aucune offre trouvée</h3>
                <p className="text-gray-500 mb-6">
                  Essayez avec d'autres mots-clés ou modifiez vos filtres.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedSector('Tous');
                    setSelectedLocation('Toutes');
                    setSelectedContract('Tous');
                  }}
                  className="px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors"
                >
                  Réinitialiser la recherche
                </button>
              </div>
            ) : (
              <>
                {/* Search result indicator */}
                {searchQuery && (
                  <div className="mb-6 flex items-center gap-2">
                    <span className="text-gray-500 text-sm">Résultats pour :</span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full flex items-center gap-2">
                      {searchQuery}
                      <button onClick={() => setSearchQuery('')} className="hover:text-green-900">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  </div>
                )}

                {/* Jobs grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {paginatedJobs.map((job, index) => (
                    <React.Fragment key={job.id}>
                      <JobCard job={job} onClick={handleJobClick} />
                      {/* AdSense between cards every 6 jobs */}
                      {(index + 1) % 6 === 0 && index !== paginatedJobs.length - 1 && (
                        <div className="col-span-full bg-gray-100 border border-dashed border-gray-300 rounded-xl p-3 text-center text-gray-400 text-xs">
                          Espace publicitaire – Google AdSense
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-10 flex items-center justify-center gap-2">
                    <button
                      onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      ← Précédent
                    </button>
                    
                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          className={`w-9 h-9 rounded-xl text-sm font-semibold transition-colors ${
                            page === currentPage
                              ? 'bg-green-600 text-white shadow-md'
                              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Suivant →
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </>
      )}

      {/* Only show footer on home and sectors */}
      {currentView !== 'detail' && (
        <Footer onNavigate={handleNavigate} />
      )}

      {/* Floating WhatsApp button */}
      <a
        href={`https://wa.me/221700000000?text=${encodeURIComponent("Bonjour, je souhaite publier une offre sur Wuut Liggey")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] hover:bg-[#20b858] text-white rounded-full shadow-xl hover:shadow-2xl flex items-center justify-center transition-all hover:scale-110 group"
        title="Publier une offre sur WhatsApp"
      >
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        {/* Tooltip */}
        <span className="absolute right-full mr-3 bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Publier une offre
        </span>
      </a>
    </div>
  );
}

export default App;
