import { Sparkles, ArrowRight, MessageCircle } from 'lucide-react';

interface TestResultsProps {
  riasecProfile: string[];
  onExplore: () => void;
  onChat: () => void;
}

const profileDescriptions: { [key: string]: { name: string; description: string; traits: string[]; careers: string[] } } = {
  R: {
    name: "Réaliste",
    description: "Tu es pragmatique et tu aimes les activités concrètes. Tu préfères manipuler des outils et travailler avec tes mains.",
    traits: ["Pratique", "Concret", "Manuel"],
    careers: ["Ingénieur", "Technicien", "Artisan", "Pilote"]
  },
  I: {
    name: "Investigateur",
    description: "Tu es curieux et analytique. Tu aimes observer, comprendre et résoudre des problèmes complexes.",
    traits: ["Analytique", "Curieux", "Logique"],
    careers: ["Chercheur", "Médecin", "Ingénieur R&D", "Analyste"]
  },
  A: {
    name: "Artistique",
    description: "Tu es créatif et imaginatif. Tu as besoin d'exprimer ta créativité et d'innover.",
    traits: ["Créatif", "Original", "Expressif"],
    careers: ["Designer", "Artiste", "Architecte", "Réalisateur"]
  },
  S: {
    name: "Social",
    description: "Tu es empathique et tu aimes aider les autres. Le relationnel est au cœur de tes motivations.",
    traits: ["Empathique", "Communicatif", "Altruiste"],
    careers: ["Enseignant", "Psychologue", "Infirmier", "Coach"]
  },
  E: {
    name: "Entreprenant",
    description: "Tu es ambitieux et tu aimes diriger. Tu cherches à convaincre et à atteindre des objectifs.",
    traits: ["Leader", "Persuasif", "Ambitieux"],
    careers: ["Manager", "Entrepreneur", "Commercial", "Avocat"]
  },
  C: {
    name: "Conventionnel",
    description: "Tu es organisé et rigoureux. Tu apprécies les tâches structurées et les procédures claires.",
    traits: ["Méthodique", "Précis", "Fiable"],
    careers: ["Comptable", "Assistant", "Administrateur", "Contrôleur"]
  }
};

export default function TestResults({ riasecProfile, onExplore, onChat }: TestResultsProps) {
  const mainProfile = profileDescriptions[riasecProfile[0]] || profileDescriptions.R;
  const secondaryProfiles = riasecProfile.slice(1, 3).map(p => profileDescriptions[p]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white pb-24">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Résultats de ton test
        </h1>
        <p className="text-center text-gray-600">
          Découvre ton profil de personnalité
        </p>
      </div>

      {/* Main Profile */}
      <div className="px-6 mb-6">
        <div className="bg-white rounded-3xl p-6 shadow-lg border-2 border-purple-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
              {riasecProfile[0]}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{mainProfile.name}</h2>
              <p className="text-sm text-purple-600">Profil principal</p>
            </div>
          </div>
          
          <p className="text-gray-700 mb-4 leading-relaxed">
            {mainProfile.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {mainProfile.traits.map(trait => (
              <span key={trait} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                {trait}
              </span>
            ))}
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Métiers associés :</p>
            <div className="flex flex-wrap gap-2">
              {mainProfile.careers.map(career => (
                <span key={career} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  {career}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Profiles */}
      <div className="px-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Profils secondaires</h3>
        <div className="space-y-3">
          {secondaryProfiles.map((profile, index) => (
            <div key={riasecProfile[index + 1]} className="bg-white rounded-2xl p-4 shadow">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 font-bold">
                  {riasecProfile[index + 1]}
                </div>
                <h4 className="font-semibold text-gray-800">{profile.name}</h4>
              </div>
              <p className="text-sm text-gray-600">{profile.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTAs */}
      <div className="px-6 space-y-3">
        <button
          onClick={onExplore}
          className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-lg"
        >
          Explorer les métiers
          <ArrowRight className="w-5 h-5" />
        </button>
        
        <button
          onClick={onChat}
          className="w-full bg-white border-2 border-purple-200 text-purple-600 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2"
        >
          <MessageCircle className="w-5 h-5" />
          Discuter avec le chatbot
        </button>
      </div>
    </div>
  );
}
