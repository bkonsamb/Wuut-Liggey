import React from 'react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const whatsappMsg = encodeURIComponent("Bonjour, je souhaite publier une offre sur Wuut Liggey");
  const whatsappUrl = `https://wa.me/221700000000?text=${whatsappMsg}`;

  return (
    <footer className="bg-gray-900 text-gray-400">
      {/* CTA Banner */}
      <div className="bg-gradient-to-r from-green-700 to-emerald-800">
        <div className="max-w-5xl mx-auto px-4 py-10 text-center">
          <h2 className="text-2xl font-black text-white mb-2">
            Vous avez un poste à pourvoir ?
          </h2>
          <p className="text-green-200 mb-5 max-w-lg mx-auto text-sm">
            Diffusez votre offre d'emploi sur Wuut Liggey et atteignez des milliers de profils qualifiés au Sénégal.
          </p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-green-700 font-bold text-sm rounded-xl hover:bg-green-50 transition-colors shadow-lg"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Publier une offre sur WhatsApp
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-700 rounded-xl flex items-center justify-center">
                <span className="text-white font-black text-sm">WL</span>
              </div>
              <span className="font-black text-xl text-white">Wuut <span className="text-green-400">Liggey</span></span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              La plateforme de référence pour les offres d'emploi au Sénégal. Des opportunités professionnelles à Dakar et dans toutes les régions du pays.
            </p>
            <p className="text-gray-600 text-xs mt-3">
              "Wuut Liggey" signifie "Chercher du travail" en wolof.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Navigation</h3>
            <ul className="space-y-2.5">
              <li>
                <button onClick={() => onNavigate('home')} className="text-gray-400 hover:text-green-400 text-sm transition-colors">
                  Toutes les offres
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('sectors')} className="text-gray-400 hover:text-green-400 text-sm transition-colors">
                  Secteurs d'activité
                </button>
              </li>
              <li>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-green-400 text-sm transition-colors">
                  Publier une offre
                </a>
              </li>
            </ul>
          </div>

          {/* Villes */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Villes</h3>
            <ul className="space-y-2.5">
              {['Dakar', 'Thiès', 'Saint-Louis', 'Ziguinchor', 'Kaolack'].map(city => (
                <li key={city}>
                  <span className="text-gray-400 text-sm">{city}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-xs">
            © {new Date().getFullYear()} Wuut Liggey. Tous droits réservés.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-gray-600 text-xs">Politique de confidentialité</span>
            <span className="text-gray-600 text-xs">Conditions d'utilisation</span>
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-gray-600 text-xs">Site actif</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
