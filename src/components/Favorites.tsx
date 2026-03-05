import { useEffect, useState } from 'react';
import { Bookmark, GraduationCap, Briefcase } from 'lucide-react';
import type { UserProfile } from '../App';
import type { Career } from './CareersExplorer';
import careersData from '../data/careers_enriched.json';

const careers: Career[] = careersData as Career[];

interface FavoritesProps {
  userProfile: UserProfile;
  onCareerClick: (careerId: string) => void;
  onToggleFavorite: (jobId: string) => void;
  onToggleFormation: (formationId: string) => void;
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

export default function Favorites({ userProfile, onCareerClick, onToggleFavorite, onToggleFormation }: FavoritesProps) {
  const favoriteJobIds    = userProfile.favoriteJobs    || [];
  const savedFormationIds = userProfile.savedFormations || [];

  // Métiers
  const favoriteCareerObjects = favoriteJobIds
    .map(id => careers.find(c => c.id === id))
    .filter((c): c is Career => c !== undefined);

  // Formations — chargées depuis le JSON public
  const [allFormations, setAllFormations] = useState<any[]>([]);
  useEffect(() => {
    if (savedFormationIds.length === 0) return;
    fetch('/data/formations_final.json')
      .then(r => r.json())
      .then(data => setAllFormations(data))
      .catch(() => {});
  }, [savedFormationIds.length]);

  const savedFormationObjects = savedFormationIds.map(id => allFormations.find(f => f.id === id));

  const hasNothing = favoriteCareerObjects.length === 0 && savedFormationIds.length === 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">

      {/* Header */}
      <div className="bg-white p-6 border-b border-gray-100 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">Mes favoris</h1>
        <p className="text-gray-500 text-sm mt-1">
          {favoriteCareerObjects.length} métier{favoriteCareerObjects.length > 1 ? 's' : ''}
          {savedFormationIds.length > 0 && ` · ${savedFormationIds.length} formation${savedFormationIds.length > 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Vide */}
      {hasNothing && (
        <div className="flex flex-col items-center justify-center py-20 px-6">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Bookmark className="w-12 h-12 text-gray-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Aucun favori</h2>
          <p className="text-gray-500 text-center text-sm">
            Explore les métiers et formations et sauvegarde ceux qui t'intéressent
          </p>
        </div>
      )}

      <div className="p-4 space-y-6">

        {/* ── Métiers ── */}
        {favoriteCareerObjects.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3 px-1">
              <Briefcase className="w-4 h-4 text-primary-500" />
              <h2 className="text-base font-bold text-gray-800">Métiers sauvegardés</h2>
              <span className="ml-auto text-xs text-gray-400 font-medium">{favoriteCareerObjects.length}</span>
            </div>
            <div className="space-y-2">
              {favoriteCareerObjects.map(career => (
                <div key={career.id} className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 text-sm capitalize leading-snug line-clamp-2">
                        {career.title}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">{career.sector}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => onCareerClick(career.id)}
                        className="px-3 py-2 bg-primary-500 text-white rounded-xl text-xs font-semibold hover:bg-primary-600 transition-colors"
                      >
                        Voir
                      </button>
                      <button
                        onClick={() => onToggleFormation(fid)}
                        className="w-9 h-9 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center hover:bg-emerald-100 transition-colors flex-shrink-0"
                        title="Retirer des favoris"
                      >
                        <Bookmark className="w-4 h-4 fill-current" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Formations ── */}
        {savedFormationIds.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3 px-1">
              <GraduationCap className="w-4 h-4 text-emerald-500" />
              <h2 className="text-base font-bold text-gray-800">Formations sauvegardées</h2>
              <span className="ml-auto text-xs text-gray-400 font-medium">{savedFormationIds.length}</span>
            </div>
            <div className="space-y-2">
              {savedFormationIds.map((fid, i) => {
                const f = savedFormationObjects[i];
                return (
                  <div key={fid} className="bg-white rounded-2xl p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                     
                      <div className="flex-1 min-w-0">
                        {f ? (
                          <>
                            <h3 className="font-bold text-gray-800 text-sm leading-snug line-clamp-2">
                              {f.title}
                            </h3>
                            {f.etablissement && (
                              <p className="text-xs text-gray-400 mt-0.5">{f.etablissement}</p>
                            )}
                            {f.domain && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {f.domain.split(',').slice(0, 2).map((d: string, j: number) => (
                                  <span key={j} className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-medium">
                                    {d.trim()}
                                  </span>
                                ))}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="space-y-1.5">
                            <div className="h-3.5 bg-gray-100 rounded animate-pulse w-3/4" />
                            <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => onToggleFormation(fid)}
                        className="w-9 h-9 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center hover:bg-emerald-100 transition-colors flex-shrink-0"
                        title="Retirer des favoris"
                      >
                        <Bookmark className="w-4 h-4 fill-current" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Invite formations si aucune */}
        {favoriteCareerObjects.length > 0 && savedFormationIds.length === 0 && (
          <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
            <GraduationCap className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <p className="text-sm text-emerald-700">
              Pas encore de formations sauvegardées — explore l'onglet Formations !
            </p>
          </div>
        )}

      </div>
    </div>
  );
}