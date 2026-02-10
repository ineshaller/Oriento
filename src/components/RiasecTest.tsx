import { useState } from 'react';
import { ChevronRight, Info } from 'lucide-react';

interface RiasecTestProps {
  onComplete: (results: string[]) => void;
}

const questions = [
  {
    question: "J'aime comprendre comment les objets ou les systèmes fonctionnent concrètement.",
    category: 'R'
  },
  {
    question: "J'apprécie d'analyser des problèmes complexes pour en trouver la cause.",
    category: 'I'
  },
  {
    question: "Je prends plaisir à créer quelque chose de nouveau (texte, image, musique, idée originale).",
    category: 'A'
  },
  {
    question: "J'aime être en contact direct avec les gens et échanger avec eux.",
    category: 'S'
  },
  {
    question: "Je me sens à l'aise pour prendre des décisions qui engagent d'autres personnes.",
    category: 'E'
  },
  {
    question: "J'aime quand les procédures sont claires et bien organisées.",
    category: 'C'
  },
  {
    question: "Je préfère les activités où je peux utiliser mes mains ou mon corps (bricoler, manipuler, installer, réparer).",
    category: 'R'
  },
  {
    question: "Je suis attiré(e) par la recherche d'informations, la curiosité scientifique ou l'observation minutieuse.",
    category: 'I'
  },
  {
    question: "Je cherche souvent des façons originales ou non conventionnelles de faire les choses.",
    category: 'A'
  },
  {
    question: "J'aime écouter les autres parler de leurs difficultés et essayer de les comprendre.",
    category: 'S'
  },
  {
    question: "Je me projette facilement dans des projets ambitieux ou des objectifs à atteindre.",
    category: 'E'
  },
  {
    question: "J'apprécie de tenir mes documents, dossiers ou fichiers bien classés.",
    category: 'C'
  },
  {
    question: "Je me sens à l'aise dans des environnements concrets, pratiques, voire physiques.",
    category: 'R'
  },
  {
    question: "J'aime résoudre des énigmes, des problèmes logiques ou des questions abstraites.",
    category: 'I'
  },
  {
    question: "Je suis sensible à l'esthétique (formes, couleurs, ambiance, mise en scène).",
    category: 'A'
  },
  {
    question: "Je suis prêt(e) à consacrer du temps pour aider quelqu'un à progresser ou à apprendre.",
    category: 'S'
  },
  {
    question: "Prendre la parole pour défendre une idée ou convaincre ne me dérange pas.",
    category: 'E'
  },
  {
    question: "Je trouve rassurant de suivre des règles, des normes ou des consignes établies.",
    category: 'C'
  },
  {
    question: "J'aime travailler dehors ou dans des lieux où l'on bouge plutôt que rester assis longtemps.",
    category: 'R'
  },
  {
    question: "J'aime chercher des explications rationnelles aux phénomènes que j'observe.",
    category: 'I'
  },
  {
    question: "Je me sens bien quand je peux exprimer ma personnalité à travers ce que je produis.",
    category: 'A'
  },
  {
    question: "Je suis souvent la personne vers qui les autres se tournent pour demander conseil ou soutien.",
    category: 'S'
  },
  {
    question: "J'aime prendre des initiatives et lancer de nouveaux projets ou activités.",
    category: 'E'
  },
  {
    question: "Je suis attentif(ve) aux détails lorsqu'il s'agit de remplir des formulaires, tableaux ou documents.",
    category: 'C'
  },
  {
    question: "Je préfère que le résultat de mon travail soit visible et tangible.",
    category: 'R'
  },
  {
    question: "Je prends plaisir à lire, chercher ou croiser des informations pour mieux comprendre un sujet.",
    category: 'I'
  },
  {
    question: "Je tolère bien l'ambiguïté et les situations où il n'y a pas une seule bonne réponse.",
    category: 'A'
  },
  {
    question: "Je me sens utile quand je contribue au bien-être ou à la réussite d'autres personnes.",
    category: 'S'
  },
  {
    question: "La compétition ou le fait de « se dépasser » m'attire.",
    category: 'E'
  },
  {
    question: "J'aime quand mon environnement de travail est structuré, prévisible et planifié.",
    category: 'C'
  },
  {
    question: "Je me vois bien dans un métier où l'on manipule des outils, des matériaux ou des équipements.",
    category: 'R'
  },
  {
    question: "Je me vois bien dans un métier où l'on observe, analyse, étudie ou diagnostique.",
    category: 'I'
  },
  {
    question: "Je me vois bien dans un métier où la créativité et l'expression personnelle ont une grande place.",
    category: 'A'
  },
  {
    question: "Je me vois bien dans un métier où l'on accompagne, forme ou soutient des personnes.",
    category: 'S'
  },
  {
    question: "Je me vois bien dans un métier où l'on dirige des projets, des équipes ou des activités économiques.",
    category: 'E'
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
      {/* Header - hauteur fixe */}
      <div className="p-6 pb-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-800">Test de personnalité</h1>
          <span className="text-sm text-gray-500">{currentQuestion + 1}/{questions.length}</span>
        </div>

        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-4 flex items-start gap-2 bg-primary-50 p-3 rounded-xl">
          <Info className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-primary-900">
            Il n'y a pas de bonne ou mauvaise réponse. Réponds spontanément selon ce qui te correspond le mieux.
          </p>
        </div>
      </div>

      {/* Question - zone flexible avec hauteur minimale */}
      <div className="flex-1 flex flex-col justify-center px-6 py-4 min-h-[200px]">
        <div className="bg-gradient-to-br from-primary-50 to-white p-8 rounded-3xl border-2 border-primary-100 flex items-center justify-center min-h-[160px]">
          <p className="text-xl text-gray-800 text-center leading-relaxed">
            {questions[currentQuestion].question}
          </p>
        </div>
      </div>

     
<div className="p-6 space-y-3 flex-shrink-0">
  <button
    onClick={() => handleAnswer(5)}
    className="w-full py-4 rounded-2xl font-semibold bg-gray-100 text-gray-700 hover:bg-primary-100 hover:text-primary-700 transition-all"
  >
    Tout à fait d'accord
  </button>
  <button
    onClick={() => handleAnswer(4)}
    className="w-full py-4 rounded-2xl font-semibold bg-gray-100 text-gray-700 hover:bg-primary-100 hover:text-primary-700 transition-all"
  >
    Plutôt d'accord
  </button>
  <button
    onClick={() => handleAnswer(3)}
    className="w-full py-4 rounded-2xl font-semibold bg-gray-100 text-gray-700 hover:bg-primary-100 hover:text-primary-700 transition-all"
  >
    Neutre
  </button>
  <button
    onClick={() => handleAnswer(2)}
    className="w-full py-4 rounded-2xl font-semibold bg-gray-100 text-gray-700 hover:bg-primary-100 hover:text-primary-700 transition-all"
  >
    Plutôt en désaccord
  </button>
  <button
    onClick={() => handleAnswer(1)}
    className="w-full py-4 rounded-2xl font-semibold bg-gray-100 text-gray-700 hover:bg-primary-100 hover:text-primary-700 transition-all"
  >
    Pas du tout d'accord
  </button>
</div>
    </div>
  );
}