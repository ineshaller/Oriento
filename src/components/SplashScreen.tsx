import { Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onStart: () => void;
}

export default function SplashScreen({ onStart }: SplashScreenProps) {
  return (
    <div className="h-screen flex flex-col items-center justify-between p-8 bg-gradient-to-br from-primary-100 via-white to-primary-50">
      {/* Logo & Mascot */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="mb-8">
          <img 
            src="src\logo\logo_oriento.png" 
            alt="Logo ORIENTO"
            className="w-50 h-50 object-contain"
          />
        </div>
        
        <h1 className="text-5xl font-bold text-primary-600 mb-4">ORIENTO</h1>
        
        <p className="text-lg text-gray-700 text-center max-w-sm leading-relaxed">
          Chaque lycéen mérite une orientation qui lui ressemble.
        </p>
      </div>

      {/* CTA */}
      <button
        onClick={onStart}
        className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-shadow"
      >
        Commencer
      </button>
    </div>
  );
}