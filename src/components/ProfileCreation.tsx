import { useState } from 'react';
import { ChevronRight, Music, Palette, Code, Beaker, Users, Book, Heart, Trophy, Globe, Camera, Wrench } from 'lucide-react';
import type { UserProfile } from '../App';

interface ProfileCreationProps {
  userProfile: UserProfile;
  onComplete: (profile: Partial<UserProfile>) => void;
}

const grades = ['Seconde', 'Première', 'Terminale'];

const specialties = [
  'Mathématiques',
  'Physique-Chimie',
  'SVT',
  'NSI',
  'SES',
  'HGGSP',
  'Humanités',
  'Langues',
  'Arts',
  'Autre'
];

const interests = [
  { id: 'music', label: 'Musique', icon: Music },
  { id: 'art', label: 'Art', icon: Palette },
  { id: 'tech', label: 'Technologies', icon: Code },
  { id: 'science', label: 'Sciences', icon: Beaker },
  { id: 'social', label: 'Relationnel', icon: Users },
  { id: 'literature', label: 'Littérature', icon: Book },
  { id: 'health', label: 'Santé', icon: Heart },
  { id: 'sport', label: 'Sport', icon: Trophy },
  { id: 'travel', label: 'Voyages', icon: Globe },
  { id: 'photo', label: 'Photo/Vidéo', icon: Camera },
  { id: 'manual', label: 'Travaux manuels', icon: Wrench }
];

export default function ProfileCreation({ userProfile, onComplete }: ProfileCreationProps) {
  const [step, setStep] = useState(1);
  const [age, setAge] = useState(userProfile.age || 16);
  const [grade, setGrade] = useState(userProfile.grade || '');
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(userProfile.specialties || []);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(userProfile.interests || []);

  const toggleSpecialty = (specialty: string) => {
    setSelectedSpecialties(prev =>
      prev.includes(specialty)
        ? prev.filter(s => s !== specialty)
        : [...prev, specialty]
    );
  };

  const toggleInterest = (interestId: string) => {
    setSelectedInterests(prev =>
      prev.includes(interestId)
        ? prev.filter(i => i !== interestId)
        : [...prev, interestId]
    );
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      onComplete({
        age,
        grade,
        specialties: selectedSpecialties,
        interests: selectedInterests
      });
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return age >= 14 && age <= 18;
      case 2: return grade !== '';
      case 3: return selectedSpecialties.length > 0;
      case 4: return selectedInterests.length > 0;
      default: return false;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-2 mb-4">
          {[1, 2, 3, 4].map(num => (
            <div
              key={num}
              className={`flex-1 h-1.5 rounded-full transition-colors ${
                num <= step ? 'bg-primary-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-gray-500">Étape {step} sur 4</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Quel âge as-tu ?</h2>
            <p className="text-gray-600 mb-8">Cela nous aidera à personnaliser ton expérience</p>
            
            <div className="flex items-center justify-center gap-4 mt-12">
              <button
                onClick={() => setAge(Math.max(14, age - 1))}
                className="w-12 h-12 rounded-full bg-primary-100 text-primary-600 font-bold text-xl"
              >
                -
              </button>
              <div className="text-6xl font-bold text-primary-600">
                {age}
              </div>
              <button
                onClick={() => setAge(Math.min(18, age + 1))}
                className="w-12 h-12 rounded-full bg-primary-100 text-primary-600 font-bold text-xl"
              >
                +
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Dans quelle classe es-tu ?</h2>
            <p className="text-gray-600 mb-8">Sélectionne ta classe actuelle</p>
            
            <div className="space-y-3">
              {grades.map(g => (
                <button
                  key={g}
                  onClick={() => setGrade(g)}
                  className={`w-full p-4 rounded-2xl text-left font-semibold transition-all ${
                    grade === g
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Tes spécialités</h2>
            <p className="text-gray-600 mb-6">Choisis tes spécialités (plusieurs choix possibles)</p>
            
            <div className="flex flex-wrap gap-2">
              {specialties.map(specialty => (
                <button
                  key={specialty}
                  onClick={() => toggleSpecialty(specialty)}
                  className={`px-4 py-2 rounded-full font-medium transition-all ${
                    selectedSpecialties.includes(specialty)
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {specialty}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Tes centres d'intérêt</h2>
            <p className="text-gray-600 mb-6">Qu'est-ce qui te passionne ? (plusieurs choix possibles)</p>
            
            <div className="grid grid-cols-3 gap-3">
              {interests.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => toggleInterest(id)}
                  className={`p-4 rounded-2xl flex flex-col items-center gap-2 transition-all ${
                    selectedInterests.includes(id)
                      ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-xs text-center font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="p-6 pt-4">
        <button
          onClick={handleNext}
          disabled={!canProceed()}
          className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {step === 4 ? 'Commencer le test' : 'Suivant'}
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
