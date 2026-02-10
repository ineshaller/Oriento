import { useState } from 'react';
import { Target, MessageCircle, Sparkles, ChevronRight } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

const slides = [
  {
    icon: Target,
    title: "Trouve ta voie",
    description: "Découvre des métiers qui correspondent à ta personnalité et tes passions",
    color: "from-primary-500 to-primary-600"
  },
  {
    icon: MessageCircle,
    title: "Un assistant toujours là",
    description: "Pose toutes tes questions à notre chatbot intelligent pour t'aider à chaque étape",
    color: "from-primary-500 to-primary-600"
  },
  {
    icon: Sparkles,
    title: "Construis ton projet",
    description: "Explore les formations et parcours adaptés à tes ambitions",
    color: "from-primary-500 to-primary-600"
  }
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="h-screen flex flex-col p-8 bg-gradient-to-br from-primary-50 to-white">
      {/* Progress dots */}
      <div className="flex justify-center gap-2 mb-12">
        {slides.map((_, index) => (
          <div
            key={index}
            className={`h-2 rounded-full transition-all ${
              index === currentSlide 
                ? 'w-8 bg-primary-500' 
                : 'w-2 bg-primary-200'
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${slide.color} flex items-center justify-center mb-8 shadow-lg`}>
          <Icon className="w-16 h-16 text-white" />
        </div>

        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          {slide.title}
        </h2>

        <p className="text-lg text-gray-600 max-w-sm leading-relaxed">
          {slide.description}
        </p>
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        {currentSlide < slides.length - 1 && (
          <button
            onClick={() => setCurrentSlide(slides.length - 1)}
            className="flex-1 py-4 rounded-2xl font-semibold text-primary-600 bg-primary-50"
          >
            Passer
          </button>
        )}
        <button
          onClick={handleNext}
          className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-lg"
        >
          {currentSlide === slides.length - 1 ? 'Lancer le test' : 'Suivant'}
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
