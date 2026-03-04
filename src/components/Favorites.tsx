import { Bookmark } from 'lucide-react';
import type { UserProfile } from '../App';
import type { Career } from './CareersExplorer';
import careersData from '../data/metiers.json';

const careers: Career[] = careersData as Career[];

interface FavoritesProps {
  userProfile: UserProfile;
  onCareerClick: (careerId: string) => void;
  onToggleFavorite: (jobId: string) => void;
}

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

function sectorInitials(sector: string): string {
  return sector
    .split(/[\s&]+/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');
}

export default function Favorites({ userProfile, onCareerClick, onToggleFavorite }: FavoritesProps) {
  const favoriteJobs = userProfile.favoriteJobs || [];

  // Récupère les vraies données du métier depuis le JSON
  const favoriteCareerObjects = favoriteJobs
    .map(id => careers.find(c => c.id === id))
    .filter((c): c is Career => c !== undefined);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800">Mes favoris</h1>
        <p className="text-gray-600 text-sm mt-1">
          {favoriteJobs.length} métier{favoriteJobs.length > 1 ? 's' : ''} sauvegardé{favoriteJobs.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Content */}
      {favoriteCareerObjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-6">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Bookmark className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Aucun favori</h2>
          <p className="text-gray-600 text-center">
            Explore les métiers et sauvegarde ceux qui t'intéressent
          </p>
        </div>
      ) : (
        <div className="p-6 space-y-3">
          {favoriteCareerObjects.map(career => (
            <div
              key={career.id}
              className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                {/* Avatar secteur */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${sectorColor(career.sector)} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-white font-bold text-sm">
                    {sectorInitials(career.sector)}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 mb-1 capitalize leading-snug">
                    {career.title}
                  </h3>
                  <p className="text-sm text-gray-500">{career.sector}</p>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => onCareerClick(career.id)}
                    className="px-4 py-2 bg-primary-500 text-white rounded-xl text-sm font-semibold hover:bg-primary-600 transition-colors"
                  >
                    Voir
                  </button>
                  <button
                    onClick={() => onToggleFavorite(career.id)}
                    className="w-10 h-10 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center hover:bg-primary-200 transition-colors"
                  >
                    <Bookmark className="w-5 h-5 fill-current" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}