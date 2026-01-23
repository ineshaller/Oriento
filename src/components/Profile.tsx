import { User, GraduationCap, Heart, Edit, Sparkles, Award } from 'lucide-react';
import type { UserProfile } from '../App';

interface ProfileProps {
  userProfile: UserProfile;
  onEdit: () => void;
}

const interestLabels: { [key: string]: string } = {
  music: 'Musique',
  art: 'Art',
  tech: 'Technologies',
  science: 'Sciences',
  social: 'Relationnel',
  literature: 'Littérature',
  health: 'Santé',
  sport: 'Sport',
  travel: 'Voyages',
  photo: 'Photo/Vidéo',
  manual: 'Travaux manuels'
};

const riasecNames: { [key: string]: string } = {
  R: 'Réaliste',
  I: 'Investigateur',
  A: 'Artistique',
  S: 'Social',
  E: 'Entreprenant',
  C: 'Conventionnel'
};

export default function Profile({ userProfile, onEdit }: ProfileProps) {
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 pb-12 rounded-b-3xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Mon profil</h1>
          <button
            onClick={onEdit}
            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
          >
            <Edit className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-3">
            <User className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white mb-1">Lycéen</h2>
          <p className="text-purple-100">{userProfile.age || 16} ans • {userProfile.grade || 'Seconde'}</p>
        </div>
      </div>

      {/* Info Cards */}
      <div className="px-6 -mt-6 space-y-4">
        {/* RIASEC Profile */}
        {userProfile.riasecProfile && userProfile.riasecProfile.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-800">Profil de personnalité</h3>
            </div>
            
            <div className="space-y-2">
              {userProfile.riasecProfile.map((code, index) => (
                <div key={code} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    {code}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{riasecNames[code]}</p>
                    {index === 0 && <p className="text-xs text-purple-600">Profil principal</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Academic Info */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-800">Parcours scolaire</h3>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600 mb-1">Classe actuelle</p>
              <p className="font-semibold text-gray-800">{userProfile.grade || 'Non renseignée'}</p>
            </div>

            {userProfile.specialties && userProfile.specialties.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Spécialités</p>
                <div className="flex flex-wrap gap-2">
                  {userProfile.specialties.map(specialty => (
                    <span key={specialty} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Interests */}
        {userProfile.interests && userProfile.interests.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                <Heart className="w-5 h-5 text-pink-600" />
              </div>
              <h3 className="font-bold text-gray-800">Centres d'intérêt</h3>
            </div>

            <div className="flex flex-wrap gap-2">
              {userProfile.interests.map(interest => (
                <span key={interest} className="px-3 py-2 bg-pink-50 text-pink-700 rounded-xl text-sm font-medium">
                  {interestLabels[interest] || interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Award className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-800">Activité</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <p className="text-2xl font-bold text-gray-800">{userProfile.favoriteJobs?.length || 0}</p>
              <p className="text-sm text-gray-600">Métiers favoris</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <p className="text-2xl font-bold text-gray-800">{userProfile.savedFormations?.length || 0}</p>
              <p className="text-sm text-gray-600">Formations</p>
            </div>
          </div>
        </div>

        {/* Edit Button */}
        <button
          onClick={onEdit}
          className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-4 rounded-2xl font-semibold shadow-lg"
        >
          Modifier mon profil
        </button>
      </div>
    </div>
  );
}
