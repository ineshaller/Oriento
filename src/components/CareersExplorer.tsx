import { useState } from 'react';
import { Search, Briefcase, Code, Heart, Palette, Building, GraduationCap, BookmarkPlus, Bookmark } from 'lucide-react';
import type { UserProfile } from '../App';

interface CareersExplorerProps {
  userProfile: UserProfile;
  onCareerClick: (careerId: string) => void;
  onToggleFavorite: (jobId: string) => void;
}

const careers = [
  {
    id: 'dev-web',
    title: 'Développeur Web',
    sector: 'Technologies',
    education: 'Bac+2 à Bac+5',
    icon: Code,
    color: 'from-blue-400 to-blue-500',
    riasec: ['I', 'R', 'C']
  },
  {
    id: 'medecin',
    title: 'Médecin',
    sector: 'Santé',
    education: 'Bac+9 à Bac+11',
    icon: Heart,
    color: 'from-red-400 to-red-500',
    riasec: ['I', 'S']
  },
  {
    id: 'designer',
    title: 'Designer UX/UI',
    sector: 'Création',
    education: 'Bac+3 à Bac+5',
    icon: Palette,
    color: 'from-primary-400 to-primary-500',
    riasec: ['A', 'I']
  },
  {
    id: 'architecte',
    title: 'Architecte',
    sector: 'Construction',
    education: 'Bac+5 à Bac+7',
    icon: Building,
    color: 'from-gray-400 to-gray-500',
    riasec: ['A', 'R', 'I']
  },
  {
    id: 'prof',
    title: 'Professeur',
    sector: 'Éducation',
    education: 'Bac+5',
    icon: GraduationCap,
    color: 'from-green-400 to-green-500',
    riasec: ['S', 'A']
  },
  {
    id: 'ingenieur',
    title: 'Ingénieur',
    sector: 'Technologies',
    education: 'Bac+5',
    icon: Briefcase,
    color: 'from-indigo-400 to-indigo-500',
    riasec: ['I', 'R', 'E']
  },
  {
    id: 'psychologue',
    title: 'Psychologue',
    sector: 'Santé',
    education: 'Bac+5',
    icon: Heart,
    color: 'from-pink-400 to-pink-500',
    riasec: ['S', 'I']
  },
  {
    id: 'chef-projet',
    title: 'Chef de Projet',
    sector: 'Management',
    education: 'Bac+5',
    icon: Briefcase,
    color: 'from-orange-400 to-orange-500',
    riasec: ['E', 'S', 'C']
  }
];

const sectors = ['Tous', 'Technologies', 'Santé', 'Création', 'Éducation', 'Management', 'Construction'];

export default function CareersExplorer({ userProfile, onCareerClick, onToggleFavorite }: CareersExplorerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('Tous');

  const filteredCareers = careers.filter(career => {
    const matchesSearch = career.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         career.sector.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = selectedSector === 'Tous' || career.sector === selectedSector;
    return matchesSearch && matchesSector;
  });

  const isFavorite = (careerId: string) => {
    return userProfile.favoriteJobs?.includes(careerId);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white p-6 pb-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Explorer les métiers</h1>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un métier..."
            className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>

        {/* Sector filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
          {sectors.map(sector => (
            <button
              key={sector}
              onClick={() => setSelectedSector(sector)}
              className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
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
        {filteredCareers.map(career => {
          const Icon = career.icon;
          const favorite = isFavorite(career.id);
          
          return (
            <div
              key={career.id}
              className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${career.color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 mb-1">{career.title}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-gray-600">{career.sector}</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-sm text-gray-600">{career.education}</span>
                  </div>
                  
                  <div className="flex gap-2 mb-3">
                    {career.riasec.map(code => (
                      <span
                        key={code}
                        className={`px-2 py-1 text-xs font-medium rounded-md ${
                          userProfile.riasecProfile?.includes(code)
                            ? 'bg-primary-100 text-primary-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {code}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => onCareerClick(career.id)}
                      className="flex-1 py-2 bg-primary-500 text-white rounded-xl text-sm font-semibold hover:bg-primary-600 transition-colors"
                    >
                      Voir le détail
                    </button>
                    <button
                      onClick={() => onToggleFavorite(career.id)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                        favorite
                          ? 'bg-primary-100 text-primary-600'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      {favorite ? <Bookmark className="w-5 h-5 fill-current" /> : <BookmarkPlus className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCareers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Aucun métier trouvé</p>
        </div>
      )}
    </div>
  );
}
