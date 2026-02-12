import { ChevronRight, Clock, SkipForward, Sparkles } from 'lucide-react';

interface TestProposalProps {
  onTakeTest: () => void;
  onSkip: () => void;
}

export default function TestProposal({ onTakeTest, onSkip }: TestProposalProps) {
  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-primary-50 to-white p-8">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mb-8 shadow-lg">
          <Sparkles className="w-12 h-12 text-white" />
        </div>

        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Découvre ton profil
        </h2>
        <p className="text-lg text-gray-600 max-w-sm leading-relaxed mb-4">
          Passe le test de personnalité RIASEC pour découvrir les métiers qui te correspondent vraiment.
        </p>

        <div className="flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium">
          <Clock className="w-4 h-4" />
          <span>Durée estimée : 20 min</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={onTakeTest}
          className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-lg"
        >
          Passer le test
          <ChevronRight className="w-5 h-5" />
        </button>
        <button
          onClick={onSkip}
          className="w-full py-4 rounded-2xl font-semibold text-gray-500 bg-gray-100 flex items-center justify-center gap-2"
        >
          <SkipForward className="w-4 h-4" />
          Passer pour l'instant
        </button>
      </div>
    </div>
  );
}