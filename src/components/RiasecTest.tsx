import { useState } from 'react';
import { ChevronRight, Info } from 'lucide-react';

interface RiasecTestProps {
  onComplete: (results: string[]) => void;
}

const questions = [
  {
    question: "J'aime travailler avec mes mains et créer des objets concrets",
    category: 'R'
  },
  {
    question: "Je suis curieux(se) et j'aime comprendre comment les choses fonctionnent",
    category: 'I'
  },
  {
    question: "J'aime créer, imaginer et m'exprimer de façon originale",
    category: 'A'
  },
  {
    question: "J'aime aider les autres et travailler en équipe",
    category: 'S'
  },
  {
    question: "J'aime organiser, planifier et prendre des initiatives",
    category: 'E'
  },
  {
    question: "Je préfère les tâches précises et bien définies",
    category: 'C'
  },
  {
    question: "Les activités physiques et pratiques me motivent",
    category: 'R'
  },
  {
    question: "J'aime analyser des problèmes complexes et chercher des solutions",
    category: 'I'
  },
  {
    question: "L'art, la musique ou la littérature m'inspirent beaucoup",
    category: 'A'
  },
  {
    question: "Écouter et conseiller les autres me vient naturellement",
    category: 'S'
  },
  {
    question: "J'aime convaincre et influencer les décisions",
    category: 'E'
  },
  {
    question: "Je suis méthodique et j'aime suivre des procédures",
    category: 'C'
  },
  {
    question: "Je préfère les résultats concrets et visibles",
    category: 'R'
  },
  {
    question: "Les sciences et la recherche m'attirent",
    category: 'I'
  },
  {
    question: "J'ai besoin de liberté créative dans mon travail",
    category: 'A'
  },
  {
    question: "Le bien-être des autres est important pour moi",
    category: 'S'
  },
  {
    question: "J'aime relever des défis et atteindre des objectifs ambitieux",
    category: 'E'
  },
  {
    question: "L'ordre et la rigueur sont essentiels pour moi",
    category: 'C'
  }
];

export default function RiasecTest({ onComplete }: RiasecTestProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(questions.length).fill(0));

  const handleAnswer = (score: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = score;
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate RIASEC scores
      const scores: { [key: string]: number } = {
        R: 0, I: 0, A: 0, S: 0, E: 0, C: 0
      };

      questions.forEach((q, index) => {
        scores[q.category] += newAnswers[index];
      });

      // Get top 3 categories
      const sortedCategories = Object.entries(scores)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([category]) => category);

      onComplete(sortedCategories);
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-800">Test de personnalité</h1>
          <span className="text-sm text-gray-500">{currentQuestion + 1}/{questions.length}</span>
        </div>
        
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-4 flex items-start gap-2 bg-purple-50 p-3 rounded-xl">
          <Info className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-purple-900">
            Il n'y a pas de bonne ou mauvaise réponse. Réponds spontanément selon ce qui te correspond le mieux.
          </p>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col justify-center px-6">
        <div className="bg-gradient-to-br from-purple-50 to-white p-8 rounded-3xl border-2 border-purple-100">
          <p className="text-xl text-gray-800 text-center leading-relaxed">
            {questions[currentQuestion].question}
          </p>
        </div>
      </div>

      {/* Answers */}
      <div className="p-6 space-y-3">
        <button
          onClick={() => handleAnswer(5)}
          className="w-full py-4 rounded-2xl font-semibold bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg"
        >
          Tout à fait d'accord
        </button>
        <button
          onClick={() => handleAnswer(4)}
          className="w-full py-4 rounded-2xl font-semibold bg-purple-100 text-purple-700"
        >
          Plutôt d'accord
        </button>
        <button
          onClick={() => handleAnswer(3)}
          className="w-full py-4 rounded-2xl font-semibold bg-gray-100 text-gray-700"
        >
          Neutre
        </button>
        <button
          onClick={() => handleAnswer(2)}
          className="w-full py-4 rounded-2xl font-semibold bg-gray-100 text-gray-700"
        >
          Plutôt en désaccord
        </button>
        <button
          onClick={() => handleAnswer(1)}
          className="w-full py-4 rounded-2xl font-semibold bg-gray-100 text-gray-700"
        >
          Pas du tout d'accord
        </button>
      </div>
    </div>
  );
}
