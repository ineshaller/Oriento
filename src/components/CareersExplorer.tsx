import { useState, useMemo } from 'react';
import { Search, BookmarkPlus, Bookmark, ExternalLink } from 'lucide-react';
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
// Importez directement le JSON généré depuis le CSV ONISEP :
// import careersData from '../data/careers_onisep.json';
//
// Ou chargez-le dynamiquement (voir hook useCareerData ci-dessous).
// Pour l'exemple, on utilise un import statique :

import careersData from '../data/careers_onisep.json';
const careers: Career[] = careersData as Career[];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Retourne une couleur Tailwind selon le secteur */
function sectorColor(sector: string): string {
  const map: Record<string, string> = {
    'Informatique & Numérique': 'from-blue-400 to-blue-600',
    'Santé & Social':           'from-red-400 to-red-600',
    'Commerce & Gestion':       'from-orange-400 to-orange-600',
    'Communication & Médias':   'from-purple-400 to-purple-600',
    'Enseignement':             'from-green-400 to-green-600',
    'Bâtiment':                 'from-stone-400 to-stone-600',
    'Transport & Logistique':   'from-sky-400 to-sky-600',
    'Hôtellerie & Tourisme':    'from-yellow-400 to-yellow-600',
    'Agriculture':              'from-lime-400 to-lime-600',
    'Chimie & Biologie':        'from-teal-400 to-teal-600',
    'Administration':           'from-slate-400 to-slate-600',
    'Sécurité & Défense':       'from-zinc-500 to-zinc-700',
  };
  return map[sector] ?? 'from-gray-400 to-gray-600';
}

/** Initiales du secteur pour l'avatar */
function sectorInitials(sector: string): string {
  return sector
    .split(/[\s&]+/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');
}

const ALL_SECTORS = [
  'Tous',
  'Administration',
  'Agriculture',
  'Agroalimentaire',
  'Bois & Matériaux',
  'Bâtiment',
  'Chimie & Biologie',
  'Commerce & Gestion',
  'Communication & Médias',
  'Enseignement',
  'Hôtellerie & Tourisme',
  'Imprimerie & Graphisme',
  'Informatique & Numérique',
  'Mécanique',
  'Métallurgie',
  'Production industrielle',
  'Pêche & Mer',
  'Santé & Social',
  'Sécurité & Défense',
  'Textile & Mode',
  'Transport & Logistique',
  'Électricité & Énergie',
];

const PAGE_SIZE = 30;

// ─── Component ────────────────────────────────────────────────────────────────

export default function CareersExplorer({
  userProfile,
  onCareerClick,
  onToggleFavorite,
}: CareersExplorerProps) {
  const [searchTerm, setSearchTerm]       = useState('');
  const [selectedSector, setSelectedSector] = useState('Tous');
  const [page, setPage]                   = useState(1);

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return careers.filter(c => {
      const matchesSearch =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.sector.toLowerCase().includes(q) ||
        c.rome_labels.some(r => r.toLowerCase().includes(q)) ||
        c.domaines.some(d => d.toLowerCase().includes(q));
      const matchesSector = selectedSector === 'Tous' || c.sector === selectedSector;
      return matchesSearch && matchesSector;
    });
  }, [searchTerm, selectedSector]);

  const paginated = filtered.slice(0, page * PAGE_SIZE);
  const hasMore   = paginated.length < filtered.length;

  const isFavorite = (id: string) => userProfile.favoriteJobs?.includes(id) ?? false;

  // Reset page on filter change
  const handleSearch = (v: string) => { setSearchTerm(v); setPage(1); };
  const handleSector = (s: string) => { setSelectedSector(s); setPage(1); };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white p-6 pb-4 sticky top-0 z-10 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Explorer les métiers
        </h1>

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
            <div
              key={career.id}
              className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start">
                <div className="flex-1 min-w-0">

                  {/* Title */}
                  <h3 className="font-bold text-gray-800 mb-1 leading-snug capitalize">
                    {career.title}
                  </h3>

                  {/* Sector */}
                  <p className="text-sm text-gray-500 mb-2">{career.sector}</p>

                  {/* Domaines */}
                  {career.domaines.length > 0 && (
                    <p className="text-xs text-gray-400 mb-3 line-clamp-1">
                      {career.domaines.join(' · ')}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => onCareerClick(career.id)}
                      className="flex-1 py-2 bg-primary-500 text-white rounded-xl text-sm font-semibold hover:bg-primary-600 transition-colors"
                    >
                      Voir le détail
                    </button>

                    {/* Lien ONISEP direct */}
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

      {/* Load more */}
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
        </div>
      )}
    </div>
  );
}