import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';
import type { UserProfile, Screen } from '../App';

interface ChatbotProps {
  userProfile: UserProfile;
  onNavigate: (screen: Screen) => void;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  suggestions?: string[];
}

/* ================== DOMAINE LOGIQUE ================== */

const specialtiesMap: Record<string, string[]> = {
  Maths: ["Mathématiques et statistiques"],
  NSI: ["Informatique et Numérique"],
  SVT: ["Santé et Esthétique"],
  SES: ["Economie et Finance"],
  HGGSP: ["Droit"],
  Arts: ["Art et Culture"]
};

const interestsMap: Record<string, string[]> = {
  tech: ["Informatique et Numérique"],
  science: ["Sciences et Recherche"],
  health: ["Santé et Esthétique"],
  art: ["Art et Culture"],
  sport: ["Sport"],
  social: ["Social et Education"]
};

function getSuggestedDomains(profile: UserProfile): string[] {
  const domains: string[] = [];

  profile.specialties?.forEach(spec => {
    specialtiesMap[spec]?.forEach(domain => {
      if (!domains.includes(domain)) domains.push(domain);
    });
  });

  profile.interests?.forEach(int => {
    interestsMap[int]?.forEach(domain => {
      if (!domains.includes(domain)) domains.push(domain);
    });
  });

  return domains.length > 0 ? domains : ["Commerce et Management"];
}

/* ================== INITIAL MESSAGE ================== */

const getInitialMessage = (): Message => ({
  id: Date.now().toString(),
  text: "Bonjour 👋 Je suis Oriento. Que veux-tu explorer ?",
  sender: 'bot',
  suggestions: [
    "Découvrir mes domaines",
    "Explorer les métiers",
    "Explorer les formations"
  ]
});

/* ================== COMPONENT ================== */

export default function Chatbot({ userProfile, onNavigate }: ChatbotProps) {

  const [messages, setMessages] = useState<Message[]>([getInitialMessage()]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const resetConversation = () => {
    setMessages([getInitialMessage()]);
  };

  const generateBotResponse = (userMessage: string): Message => {

    const lower = userMessage.toLowerCase();

    /* ===== DÉCOUVRIR DOMAINES ===== */

    if (lower.includes("découvrir")) {
      const domains = getSuggestedDomains(userProfile);

      return {
        id: Date.now().toString(),
        text: "Voici les domaines qui correspondent à ton profil 👇",
        sender: 'bot',
        suggestions: domains
      };
    }

    /* ===== SI DOMAINE CHOISI ===== */

    const allDomains = getSuggestedDomains(userProfile);

    if (allDomains.includes(userMessage)) {
      localStorage.setItem("selectedDomain", userMessage);

      return {
        id: Date.now().toString(),
        text: `Tu veux explorer le domaine "${userMessage}" ?`,
        sender: 'bot',
        suggestions: [
          "Voir les métiers",
          "Voir les formations",
          "🔄 Revenir au début"
        ]
      };
    }

    /* ===== REDIRECTION ===== */

    if (lower.includes("métier")) {
      onNavigate("careers");
      return {
        id: Date.now().toString(),
        text: "Je t'emmène vers les métiers 👇",
        sender: 'bot'
      };
    }

    if (lower.includes("formation")) {
      onNavigate("formations");
      return {
        id: Date.now().toString(),
        text: "Je t'emmène vers les formations 👇",
        sender: 'bot'
      };
    }

    /* ===== RESET ===== */

    if (lower.includes("revenir")) {
      resetConversation();
      return {
        id: Date.now().toString(),
        text: "",
        sender: 'bot'
      };
    }

    /* ===== DEFAULT ===== */

    return {
      id: Date.now().toString(),
      text: "Je peux t'aider à explorer les métiers, formations ou tes domaines personnalisés.",
      sender: 'bot',
      suggestions: [
        "Découvrir mes domaines",
        "Explorer les métiers",
        "Explorer les formations",
        "🔄 Revenir au début"
      ]
    };
  };

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    setTimeout(() => {
      const botResponse = generateBotResponse(text);
      if (botResponse.text !== "") {
        setMessages(prev => [...prev, botResponse]);
      }
    }, 500);
  };

  const handleSuggestionClick = (suggestion: string) => {

    if (suggestion === "Explorer les métiers") {
      onNavigate("careers");
      return;
    }

    if (suggestion === "Explorer les formations") {
      onNavigate("formations");
      return;
    }

    if (suggestion === "🔄 Revenir au début") {
      resetConversation();
      return;
    }

    handleSend(suggestion);
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-primary-50 to-white">

      {/* HEADER */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center relative">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-800">Oriento</h2>
            <p className="text-xs text-green-600">En ligne</p>
          </div>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {messages.map((message) => (
          <div key={message.id}>
            <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {message.sender === 'bot' && (
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mr-2">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white'
                    : 'bg-white text-gray-800 shadow-sm'
                }`}
              >
                <p className="text-sm">{message.text}</p>
              </div>
            </div>

            {message.suggestions && (
              <div className="flex flex-wrap gap-2 mt-3 ml-10">
                {message.suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-4 py-2 bg-white border border-primary-200 text-primary-600 rounded-full text-sm font-medium hover:bg-primary-50"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
            placeholder="Pose-moi une question..."
            className="flex-1 px-4 py-3 bg-gray-100 rounded-full outline-none focus:ring-2 focus:ring-primary-300"
          />
          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim()}
            className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full flex items-center justify-center disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
