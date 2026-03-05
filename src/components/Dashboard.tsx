// Dashboard.tsx
import { useEffect, useState } from 'react';
import { MessageCircle, Target, BookOpen, Sparkles, TrendingUp, ChevronRight } from 'lucide-react';
import type { UserProfile, Screen } from '../App';
import careersData from '../data/careers_enriched.json';

interface Career {
  id: string;
  title: string;
  sector: string;
}

const careers = careersData as Career[];

interface DashboardProps {
  userProfile: UserProfile;
  onNavigate: (screen: Screen) => void;
  onCareerClick: (careerId: string) => void;
}

const motivationalMessages = [
  "Continue comme ça ! Chaque exploration te rapproche de ton projet.",
  "Ton parcours d'orientation progresse bien !",
  "Bravo pour ta curiosité et ton engagement !",
  "Tu construis ton avenir pas à pas, c'est super !"
];

function sectorColor(sector: string): string {
  const map: Record<string, string> = {
    'Informatique & Numérique': 'from-blue-400 to-blue-500',
    'Santé & Social':           'from-rose-400 to-rose-500',
    'Commerce & Gestion':       'from-orange-400 to-orange-500',
    'Communication & Médias':   'from-violet-400 to-violet-500',
    'Enseignement':             'from-emerald-400 to-emerald-500',
    'Bâtiment':                 'from-stone-400 to-stone-500',
    'Transport & Logistique':   'from-sky-400 to-sky-500',
    'Hôtellerie & Tourisme':    'from-yellow-400 to-yellow-500',
    'Agriculture':              'from-lime-500 to-lime-600',
    'Chimie & Biologie':        'from-teal-400 to-teal-500',
  };
  return map[sector] ?? 'from-primary-400 to-primary-500';
}

export default function Dashboard({ userProfile, onNavigate, onCareerClick }: DashboardProps) {
  const favoriteJobsCount   = userProfile.favoriteJobs?.length    || 0;
  const savedFormationsCount = userProfile.savedFormations?.length || 0;
  const hasCompletedTest    = userProfile.riasecProfile && userProfile.riasecProfile.length > 0;
  const progressPercentage  = hasCompletedTest ? (favoriteJobsCount > 0 ? 75 : 50) : 25;
  const randomMessage       = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

  // Charge les formations pour afficher leurs titres
  const [formationsData, setFormationsData] = useState<any[]>([]);
  useEffect(() => {
    if (savedFormationsCount === 0) return;
    fetch('/data/formations_final.json')
      .then(r => r.json())
      .then(data => setFormationsData(data))
      .catch(() => {});
  }, [savedFormationsCount]);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">

      {/* Header */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-6 pb-8 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Bonjour !</h1>
            <p className="text-primary-100 text-sm">
              {userProfile.grade || 'Lycéen'} • {userProfile.age || 16} ans
            </p>
          </div>
        </div>

        {/* Progress Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-semibold">Progression</span>
            <span className="text-white font-bold">{progressPercentage}%</span>
          </div>
          <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-primary-100 text-sm mt-2">{randomMessage}</p>
        </div>
      </div>

      {/* Bannière RIASEC si pas fait */}
      {!hasCompletedTest && (
        <div className="px-6 mt-6">
          <div className="bg-gradient-to-br from-primary-100 to-primary-50 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 mb-0.5">Passe le test RIASEC</h3>
              <p className="text-gray-600 text-sm">Découvre les métiers qui te correspondent</p>
            </div>
            <button
              onClick={() => onNavigate('riasec-test')}
              className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-2 rounded-xl font-semibold text-sm flex-shrink-0"
            >
              Démarrer
            </button>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="p-6" style={{ marginTop: !hasCompletedTest ? '0' : '1.5rem' }}>
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <button
            onClick={() => onNavigate('chatbot')}
            className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-gray-800">Poser une question</h3>
              <p className="text-sm text-gray-500">Parle avec ton assistant Oriento</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          <button
            onClick={() => onNavigate('careers')}
            className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-gray-800">Explorer les métiers</h3>
              <p className="text-sm text-gray-500">Découvre des carrières qui te correspondent</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Profil RIASEC */}
      {hasCompletedTest && (
        <div className="px-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3">Ton profil</h2>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-primary-500" />
              <span className="font-semibold text-gray-800">Profil RIASEC</span>
            </div>
            <div className="flex gap-2">
              {userProfile.riasecProfile?.map(code => (
                <div key={code} className="px-3 py-2 bg-primary-100 text-primary-700 rounded-xl font-semibold">
                  {code}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="px-6 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-3">Statistiques</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center mb-2">
              <Target className="w-5 h-5 text-primary-600" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{favoriteJobsCount}</p>
            <p className="text-sm text-gray-600">Métiers favoris</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{savedFormationsCount}</p>
            <p className="text-sm text-gray-600">Formations sauvegardées</p>
          </div>
        </div>
      </div>

      {/* Métiers favoris */}
      {favoriteJobsCount > 0 && (
        <div className="px-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-800">Métiers favoris</h2>
            <button onClick={() => onNavigate('favorites')} className="text-sm text-primary-600 font-semibold">
              Voir tout
            </button>
          </div>
          <div className="space-y-2">
            {userProfile.favoriteJobs?.slice(0, 3).map(jobId => {
              const career = careers.find(c => c.id === jobId);
              return (
                <button
                  key={jobId}
                  onClick={() => onCareerClick(jobId)}
                  className="w-full bg-white rounded-xl px-4 py-3 shadow-sm flex items-center gap-2 hover:shadow-md transition-shadow"
                >
                  <span className="flex-1 text-left font-medium text-gray-800 capitalize text-sm">
                    {career?.title ?? jobId}
                  </span>
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Formations sauvegardées */}
      {savedFormationsCount > 0 && (
        <div className="px-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-800">Formations sauvegardées</h2>
            <button onClick={() => onNavigate('favorites')} className="text-sm text-primary-600 font-semibold">
              Voir tout
            </button>
          </div>
          <div className="space-y-2">
            {userProfile.savedFormations?.slice(0, 3).map(fid => {
              const formation = formationsData.find(f => f.id === fid);
              return (
                <button
                  key={fid}
                  onClick={() => onNavigate('favorites')}
                  className="w-full bg-white rounded-xl px-4 py-3 shadow-sm flex items-center gap-2 hover:shadow-md transition-shadow"
                >
                  <span className="flex-1 text-left font-medium text-gray-800 text-sm line-clamp-1">
                    {formation?.title ?? (
                      <span className="inline-block h-3 bg-gray-100 rounded animate-pulse w-40" />
                    )}
                  </span>
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}