import { useState, useMemo, useEffect } from 'react';
import { Search, BookmarkPlus, Bookmark, ExternalLink, Sparkles } from 'lucide-react';
import type { UserProfile } from '../App';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Career {
  id: string;
  title: string;
  url_onisep: string;
  sector: string;
  gfe: string;
  rome_codes: string[];
  rome_labels: string[];
  publication: string;
  domaines: string[];
}

interface CareersExplorerProps {
  userProfile: UserProfile;
  onCareerClick: (careerId: string) => void;
  onToggleFavorite: (jobId: string) => void;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

import careersData from '../data/careers_onisep.json';

const rawCareers: Career[] = careersData as Career[];

const seen = new Set<string>();
const careers: Career[] = rawCareers.filter(c => {
  const key = c.title.toLowerCase().trim();
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalize(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .toLowerCase()
    .trim();
}

const ALL_SECTORS = [
  'Tous',
  'Administration',
  'Agriculture',
  'Agroalimentaire',
  'Bâtiment',
  'Bois & Matériaux',
  'Chimie & Biologie',
  'Commerce & Gestion',
  'Communication & Médias',
  'Électricité & Énergie',
  'Enseignement',
  'Hôtellerie & Tourisme',
  'Imprimerie & Graphisme',
  'Informatique & Numérique',
  'Mécanique',
  'Métallurgie',
  'Pêche & Mer',
  'Production industrielle',
  'Santé & Social',
  'Sécurité & Défense',
  'Textile & Mode',
  'Transport & Logistique',
];

const PAGE_SIZE = 30;

// ─── Component ────────────────────────────────────────────────────────────────

export default function CareersExplorer({
  userProfile,
  onCareerClick,
  onToggleFavorite,
}: CareersExplorerProps) {
  const [searchTerm, setSearchTerm]         = useState('');
  const [selectedSector, setSelectedSector] = useState('Tous');
  const [page, setPage]                     = useState(1);

  // ✅ Lire le filtre posé par le chatbot
  useEffect(() => {
    const sectorFilter = localStorage.getItem("careerFilter");
    if (sectorFilter) {
      // Vérifier que le secteur existe dans ALL_SECTORS
      const match = ALL_SECTORS.find(s => s === sectorFilter);
      if (match) setSelectedSector(match);
      setPage(1);
      localStorage.removeItem("careerFilter");
    }
  }, []);

  const filtered = useMemo(() => {
    const words = normalize(searchTerm).split(/\s+/).filter(Boolean);
    return careers.filter(c => {
      const matchesSearch =
        words.length === 0 ||
        words.every(w =>
          normalize(c.title).includes(w) ||
          normalize(c.sector).includes(w) ||
          c.rome_labels.some(r => normalize(r).includes(w)) ||
          c.domaines.some(d => normalize(d).includes(w))
        );
      const matchesSector = selectedSector === 'Tous' || c.sector === selectedSector;
      return matchesSearch && matchesSector;
    });
  }, [searchTerm, selectedSector]);

  const paginated = filtered.slice(0, page * PAGE_SIZE);
  const hasMore   = paginated.length < filtered.length;

  const isFavorite = (id: string) => userProfile.favoriteJobs?.includes(id) ?? false;

  const handleSearch = (v: string) => { setSearchTerm(v); setPage(1); };
  const handleSector = (s: string) => { setSelectedSector(s); setPage(1); };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white p-6 pb-4 sticky top-0 z-10 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Explorer les métiers
        </h1>

        {/* ✅ Bandeau filtre actif venant du chatbot */}
        {selectedSector !== 'Tous' && (
          <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-primary-50 border border-primary-200 rounded-xl">
            <Sparkles className="w-4 h-4 text-primary-500 flex-shrink-0" />
            <span className="text-sm text-primary-700 font-medium flex-1">
              Filtré par : <strong>{selectedSector}</strong>
            </span>
            <button
              onClick={() => { setSelectedSector('Tous'); setPage(1); }}
              className="text-xs text-primary-500 hover:text-primary-700 font-medium"
            >
              ✕ Effacer
            </button>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Rechercher un métier, un domaine…"
            className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>

        {/* Sector filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
          {ALL_SECTORS.map(sector => (
            <button
              key={sector}
              onClick={() => handleSector(sector)}
              className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors text-sm ${
                selectedSector === sector
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {sector}
            </button>
          ))}
        </div>
      </div>

      {/* Career cards */}
      <div className="p-6 space-y-3">
        {paginated.map(career => {
          const favorite = isFavorite(career.id);

          return (
            <div key={career.id} className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 mb-1 leading-snug capitalize">
                    {career.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">{career.sector}</p>
                  {career.domaines.length > 0 && (
                    <p className="text-xs text-gray-400 mb-3 line-clamp-1">
                      {career.domaines.join(' · ')}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => onCareerClick(career.id)}
                      className="flex-1 py-2 bg-primary-500 text-white rounded-xl text-sm font-semibold hover:bg-primary-600 transition-colors"
                    >
                      Voir le détail
                    </button>
                    <a
                      href={career.url_onisep}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors"
                      title="Voir sur ONISEP"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => onToggleFavorite(career.id)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                        favorite
                          ? 'bg-primary-100 text-primary-600'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      {favorite
                        ? <Bookmark className="w-5 h-5 fill-current" />
                        : <BookmarkPlus className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <div className="flex justify-center pb-6">
          <button
            onClick={() => setPage(p => p + 1)}
            className="px-6 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
          >
            Charger plus ({filtered.length - paginated.length} restants)
          </button>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Aucun métier trouvé</p>
          <button
            onClick={() => { setSelectedSector('Tous'); setSearchTerm(''); setPage(1); }}
            className="mt-3 text-sm text-primary-500 underline"
          >
            Effacer les filtres
          </button>
        </div>
      )}
    </div>
  );
}