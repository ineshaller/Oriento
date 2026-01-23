import { Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onStart: () => void;
}

export default function SplashScreen({ onStart }: SplashScreenProps) {
  return (
    <div className="h-screen flex flex-col items-center justify-between p-8 bg-gradient-to-br from-purple-100 via-white to-purple-50">
      {/* Logo & Mascot */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="mb-8 relative">
          <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
          {/* Robot antenna */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-1 h-6 bg-purple-500 rounded-full">
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-purple-400 rounded-full"></div>
          </div>
        </div>
        
        <h1 className="text-5xl font-bold text-purple-600 mb-4">ORIENTO</h1>
        
        <p className="text-lg text-gray-700 text-center max-w-sm leading-relaxed">
          Chaque lycéen mérite une orientation qui lui ressemble.
        </p>
      </div>

      {/* CTA */}
      <button
        onClick={onStart}
        className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-shadow"
      >
        Commencer
      </button>
    </div>
  );
}
