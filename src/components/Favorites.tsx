import { Bookmark, Code, Heart, Palette, Briefcase, GraduationCap, Building } from 'lucide-react';
import type { UserProfile } from '../App';

interface FavoritesProps {
  userProfile: UserProfile;
  onCareerClick: (careerId: string) => void;
  onToggleFavorite: (jobId: string) => void;
}

const careerIcons: { [key: string]: any } = {
  'dev-web': { icon: Code, color: 'from-blue-400 to-blue-500' },
  'medecin': { icon: Heart, color: 'from-red-400 to-red-500' },
  'designer': { icon: Palette, color: 'from-purple-400 to-purple-500' },
  'architecte': { icon: Building, color: 'from-gray-400 to-gray-500' },
  'prof': { icon: GraduationCap, color: 'from-green-400 to-green-500' },
  'ingenieur': { icon: Briefcase, color: 'from-indigo-400 to-indigo-500' },
  'psychologue': { icon: Heart, color: 'from-pink-400 to-pink-500' },
  'chef-projet': { icon: Briefcase, color: 'from-orange-400 to-orange-500' }
};

const careerTitles: { [key: string]: string } = {
  'dev-web': 'Développeur Web',
  'medecin': 'Médecin',
  'designer': 'Designer UX/UI',
  'architecte': 'Architecte',
  'prof': 'Professeur',
  'ingenieur': 'Ingénieur',
  'psychologue': 'Psychologue',
  'chef-projet': 'Chef de Projet'
};

export default function Favorites({ userProfile, onCareerClick, onToggleFavorite }: FavoritesProps) {
  const favoriteJobs = userProfile.favoriteJobs || [];

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
      {favoriteJobs.length === 0 ? (
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
          {favoriteJobs.map(jobId => {
            const careerInfo = careerIcons[jobId] || { icon: Briefcase, color: 'from-gray-400 to-gray-500' };
            const Icon = careerInfo.icon;
            const title = careerTitles[jobId] || jobId;

            return (
              <div
                key={jobId}
                className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${careerInfo.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 mb-1">{title}</h3>
                    <p className="text-sm text-gray-600">Ajouté aux favoris</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => onCareerClick(jobId)}
                      className="px-4 py-2 bg-purple-500 text-white rounded-xl text-sm font-semibold hover:bg-purple-600 transition-colors"
                    >
                      Voir
                    </button>
                    <button
                      onClick={() => onToggleFavorite(jobId)}
                      className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center hover:bg-purple-200 transition-colors"
                    >
                      <Bookmark className="w-5 h-5 fill-current" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
