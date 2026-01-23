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

const initialMessages: Message[] = [
  {
    id: '1',
    text: "Bonjour ! Je suis Oriento, ton assistant d'orientation. Je suis là pour t'aider à explorer les métiers, formations et à construire ton projet d'avenir.",
    sender: 'bot',
    suggestions: [
      "Quels métiers correspondent à mon profil ?",
      "Comment choisir mes études supérieures ?",
      "Parle-moi de Parcoursup"
    ]
  }
];

export default function Chatbot({ userProfile, onNavigate }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateBotResponse = (userMessage: string): Message => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('métier') || lowerMessage.includes('profession')) {
      return {
        id: Date.now().toString(),
        text: `D'après ton profil ${userProfile.riasecProfile?.join(', ')}, plusieurs métiers pourraient t'intéresser. Tu as un profil qui combine créativité et analyse. Je te suggère d'explorer nos recommandations personnalisées !`,
        sender: 'bot',
        suggestions: [
          "Voir les métiers recommandés",
          "Comment accéder à ces métiers ?",
          "Quelles formations choisir ?"
        ]
      };
    }
    
    if (lowerMessage.includes('parcoursup')) {
      return {
        id: Date.now().toString(),
        text: "Parcoursup peut sembler complexe, mais ne t'inquiète pas ! C'est une plateforme pour candidater aux formations supérieures. L'essentiel est de bien préparer ton projet et de diversifier tes vœux. Je peux t'aider à comprendre les étapes.",
        sender: 'bot',
        suggestions: [
          "Quand dois-je m'inscrire ?",
          "Combien de vœux puis-je faire ?",
          "Comment rédiger mon projet motivé ?"
        ]
      };
    }
    
    if (lowerMessage.includes('formation') || lowerMessage.includes('études')) {
      return {
        id: Date.now().toString(),
        text: "Le choix des études dépend de ton projet professionnel et de tes préférences. Certaines formations sont plus théoriques (université), d'autres plus pratiques (BTS, BUT). Parlons de ce qui t'attire !",
        sender: 'bot',
        suggestions: [
          "Quelle est la différence entre fac et école ?",
          "Les formations courtes ou longues ?",
          "Explorer les parcours possibles"
        ]
      };
    }

    if (lowerMessage.includes('stress') || lowerMessage.includes('anxieux')) {
      return {
        id: Date.now().toString(),
        text: "C'est tout à fait normal de se sentir stressé face à l'orientation. L'important est d'avancer pas à pas. Tu n'es pas seul(e) dans cette démarche, et il n'y a pas qu'un seul bon chemin. Prenons le temps d'explorer ensemble.",
        sender: 'bot',
        suggestions: [
          "Par où commencer ?",
          "Comment clarifier mon projet ?",
          "Qui peut m'aider ?"
        ]
      };
    }
    
    return {
      id: Date.now().toString(),
      text: "Je comprends ta question ! N'hésite pas à être plus précis, ou choisis l'un des sujets ci-dessous. Je suis là pour t'accompagner dans ton orientation.",
      sender: 'bot',
      suggestions: [
        "Découvrir des métiers",
        "Comprendre les formations",
        "M'aider à choisir"
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

    // Simulate bot response
    setTimeout(() => {
      const botResponse = generateBotResponse(text);
      setMessages(prev => [...prev, botResponse]);
    }, 800);
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (suggestion === "Voir les métiers recommandés" || suggestion === "Découvrir des métiers") {
      onNavigate('careers');
      return;
    }
    if (suggestion === "Explorer les parcours possibles") {
      onNavigate('careers');
      return;
    }
    handleSend(suggestion);
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-50 to-white">
      {/* Header */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center relative">
            <Sparkles className="w-6 h-6 text-white" />
            <div className="absolute w-3 h-3 bg-green-400 rounded-full bottom-0 right-0 border-2 border-white"></div>
          </div>
          <div>
            <h2 className="font-bold text-gray-800">Oriento</h2>
            <p className="text-xs text-green-600">En ligne</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {messages.map((message) => (
          <div key={message.id}>
            <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {message.sender === 'bot' && (
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-br-md'
                    : 'bg-white text-gray-800 shadow-sm rounded-bl-md'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.text}</p>
              </div>
            </div>
            
            {message.suggestions && (
              <div className="flex flex-wrap gap-2 mt-3 ml-10">
                {message.suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-4 py-2 bg-white border border-purple-200 text-purple-600 rounded-full text-sm font-medium hover:bg-purple-50 transition-colors"
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

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend(input)}
            placeholder="Pose-moi une question..."
            className="flex-1 px-4 py-3 bg-gray-100 rounded-full outline-none focus:ring-2 focus:ring-purple-300"
          />
          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim()}
            className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
