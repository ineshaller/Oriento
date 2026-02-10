import { Home, Compass, MessageCircle, Bookmark, User } from 'lucide-react';
import type { Screen } from '../App';

interface BottomNavProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

const navItems = [
  { id: 'dashboard' as Screen, icon: Home, label: 'Accueil' },
  { id: 'careers' as Screen, icon: Compass, label: 'Explorer' },
  { id: 'chatbot' as Screen, icon: MessageCircle, label: 'Chatbot' },
  { id: 'favorites' as Screen, icon: Bookmark, label: 'Favoris' },
  { id: 'profile' as Screen, icon: User, label: 'Profil' }
];

export default function BottomNav({ currentScreen, onNavigate }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map(({ id, icon: Icon, label }) => {
            const isActive = currentScreen === id;
            return (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                className={`flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-primary-50' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <Icon 
                  className={`w-6 h-6 ${
                    isActive ? 'text-primary-600' : 'text-gray-500'
                  }`}
                />
                <span 
                  className={`text-xs font-medium ${
                    isActive ? 'text-primary-600' : 'text-gray-500'
                  }`}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
