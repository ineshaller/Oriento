import { ArrowLeft, Bookmark, BookmarkPlus, MessageCircle, CheckCircle, Star, TrendingUp, GraduationCap } from 'lucide-react';
import type { UserProfile } from '../App';

interface CareerDetailProps {
  careerId: string;
  userProfile: UserProfile;
  onBack: () => void;
  onToggleFavorite: (jobId: string) => void;
  onChat: () => void;
}

const careerDetails: { [key: string]: any } = {
  'dev-web': {
    title: 'Développeur Web',
    description: "Le développeur web conçoit et réalise des sites internet et applications web. Il maîtrise plusieurs langages de programmation et frameworks pour créer des interfaces utilisateur et gérer les bases de données.",
    image: 'https://images.unsplash.com/photo-1581093689009-6df1be12f404?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    skills: ['JavaScript', 'React', 'HTML/CSS', 'Node.js', 'Bases de données'],
    qualities: ['Logique', 'Créativité', 'Résolution de problèmes', 'Apprentissage continu'],
    education: [
      'BTS SIO ou BUT Informatique (Bac+2/3)',
      'Licence Informatique (Bac+3)',
      'École d\'ingénieur ou Master (Bac+5)'
    ],
    paths: [
      { level: 'Seconde', subjects: ['Mathématiques', 'NSI si possible'] },
      { level: 'Première', subjects: ['Mathématiques', 'NSI', 'Physique-Chimie'] },
      { level: 'Terminale', subjects: ['Mathématiques', 'NSI'] },
      { level: 'Post-bac', subjects: ['BTS/BUT Informatique ou École d\'ingénieur'] }
    ],
    salary: '30k-50k €/an (junior)',
    outlook: 'Excellent - Forte demande'
  },
  'medecin': {
    title: 'Médecin',
    description: "Le médecin diagnostique et traite les maladies. Il écoute ses patients, réalise des examens cliniques et prescrit des traitements adaptés. C'est un métier exigeant qui demande de longues études.",
    image: 'https://images.unsplash.com/photo-1612349316228-5942a9b489c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    skills: ['Diagnostic médical', 'Communication', 'Biologie', 'Anatomie', 'Pharmacologie'],
    qualities: ['Empathie', 'Rigueur', 'Résistance au stress', 'Écoute'],
    education: [
      'PASS ou L.AS (1ère année)',
      'Faculté de médecine (6 ans)',
      'Internat de spécialité (3 à 5 ans)'
    ],
    paths: [
      { level: 'Seconde', subjects: ['SVT', 'Physique-Chimie'] },
      { level: 'Première', subjects: ['SVT', 'Physique-Chimie', 'Mathématiques'] },
      { level: 'Terminale', subjects: ['SVT', 'Physique-Chimie'] },
      { level: 'Post-bac', subjects: ['PASS ou L.AS puis Médecine'] }
    ],
    salary: 'Variable selon spécialité',
    outlook: 'Très bon - Besoin constant'
  },
  'designer': {
    title: 'Designer UX/UI',
    description: "Le designer UX/UI conçoit l'expérience utilisateur et l'interface visuelle des applications et sites web. Il allie créativité, empathie utilisateur et compétences techniques.",
    image: 'https://images.unsplash.com/photo-1762341114268-38fbe97e355d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    skills: ['Figma/Adobe XD', 'Design thinking', 'Prototypage', 'Tests utilisateurs', 'HTML/CSS'],
    qualities: ['Créativité', 'Empathie', 'Sens esthétique', 'Communication'],
    education: [
      'BUT MMI (Bac+3)',
      'École de design (Bac+3 à Bac+5)',
      'Master Design numérique (Bac+5)'
    ],
    paths: [
      { level: 'Seconde', subjects: ['Arts plastiques si possible'] },
      { level: 'Première', subjects: ['Spécialité au choix', 'Option Arts'] },
      { level: 'Terminale', subjects: ['Portfolio à préparer'] },
      { level: 'Post-bac', subjects: ['École de design ou BUT MMI'] }
    ],
    salary: '28k-45k €/an',
    outlook: 'Très bon - Secteur en croissance'
  }
};

export default function CareerDetail({ careerId, userProfile, onBack, onToggleFavorite, onChat }: CareerDetailProps) {
  const career = careerDetails[careerId] || careerDetails['dev-web'];
  const isFavorite = userProfile.favoriteJobs?.includes(careerId);

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Image Header */}
      <div className="relative h-48 bg-gradient-to-br from-purple-400 to-purple-600">
        <img 
          src={career.image} 
          alt={career.title}
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        
        {/* Header Actions */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg"
          >
            <ArrowLeft className="w-5 h-5 text-gray-800" />
          </button>
          <button
            onClick={() => onToggleFavorite(careerId)}
            className={`w-10 h-10 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg ${
              isFavorite ? 'bg-purple-500' : 'bg-white/90'
            }`}
          >
            {isFavorite ? (
              <Bookmark className="w-5 h-5 text-white fill-current" />
            ) : (
              <BookmarkPlus className="w-5 h-5 text-gray-800" />
            )}
          </button>
        </div>

        <div className="absolute bottom-4 left-4">
          <h1 className="text-3xl font-bold text-white">{career.title}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Quick Info */}
        <div className="flex gap-3">
          <div className="flex-1 bg-purple-50 rounded-xl p-3 text-center">
            <TrendingUp className="w-5 h-5 text-purple-600 mx-auto mb-1" />
            <p className="text-xs text-gray-600 mb-1">Perspectives</p>
            <p className="text-xs font-semibold text-purple-700">{career.outlook}</p>
          </div>
          <div className="flex-1 bg-purple-50 rounded-xl p-3 text-center">
            <GraduationCap className="w-5 h-5 text-purple-600 mx-auto mb-1" />
            <p className="text-xs text-gray-600 mb-1">Niveau</p>
            <p className="text-xs font-semibold text-purple-700">{career.education[career.education.length - 1]}</p>
          </div>
          <div className="flex-1 bg-purple-50 rounded-xl p-3 text-center">
            <Star className="w-5 h-5 text-purple-600 mx-auto mb-1" />
            <p className="text-xs text-gray-600 mb-1">Salaire</p>
            <p className="text-xs font-semibold text-purple-700">{career.salary}</p>
          </div>
        </div>

        {/* Description */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">Description</h2>
          <p className="text-gray-700 leading-relaxed">{career.description}</p>
        </section>

        {/* Skills */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">Compétences requises</h2>
          <div className="flex flex-wrap gap-2">
            {career.skills.map((skill: string) => (
              <span key={skill} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium">
                {skill}
              </span>
            ))}
          </div>
        </section>

        {/* Qualities */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">Qualités humaines</h2>
          <div className="space-y-2">
            {career.qualities.map((quality: string) => (
              <div key={quality} className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-purple-500" />
                <span className="text-gray-700">{quality}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Education Path */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">Parcours scolaire recommandé</h2>
          <div className="space-y-3">
            {career.paths.map((path: any, index: number) => (
              <div key={index} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  {index < career.paths.length - 1 && (
                    <div className="w-0.5 h-full bg-purple-200 my-1"></div>
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <p className="font-semibold text-gray-800 mb-1">{path.level}</p>
                  <p className="text-sm text-gray-600">{Array.isArray(path.subjects) ? path.subjects.join(', ') : path.subjects}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Formations */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">Formations possibles</h2>
          <div className="space-y-2">
            {career.education.map((edu: string, index: number) => (
              <div key={index} className="p-3 bg-gray-50 rounded-xl">
                <p className="text-gray-700">{edu}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* CTA */}
      <div className="fixed bottom-20 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent">
        <button
          onClick={onChat}
          className="w-full max-w-md mx-auto block bg-gradient-to-r from-purple-500 to-purple-600 text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-lg"
        >
          <MessageCircle className="w-5 h-5" />
          Discuter avec le chatbot
        </button>
      </div>
    </div>
  );
}
