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

const getRecommendedSpecialtiesForProject = (project: string) => {

  const map: Record<string, string[]> = {
    "Ingénieur": ["Maths", "Physique-Chimie", "NSI"],
    "Commerce": ["SES", "Maths", "HGGSP"],
    "Médecine": ["SVT", "Physique-Chimie"],
    "Droit": ["HGGSP", "SES", "LLCER"]
  };

  return map[project] || ["Maths", "SES", "HGGSP"];
};


const getSpecialtiesFromRiasec = (riasec: string[]) => {

  const code = riasec[0];

  const map: Record<string, string[]> = {
    R: ["SI", "Physique-Chimie"],
    I: ["Maths", "NSI", "Physique-Chimie"],
    A: ["Arts", "LLCER"],
    S: ["SES", "HLP"],
    E: ["SES", "HGGSP"],
    C: ["Maths", "SES"]
  };

  return map[code] || ["Maths", "SES"];
};

const compareSpecialties = (spec1: string, spec2: string) => {

  const info: Record<string, string> = {
    "Maths": "Utile pour ingénierie, économie, data...",
    "SES": "Utile pour commerce, gestion, droit...",
    "NSI": "Utile pour informatique, cybersécurité...",
    "SVT": "Utile pour médecine, biologie..."
  };

  return `
${spec1} :
• ${info[spec1] || "Polyvalente"}

${spec2} :
• ${info[spec2] || "Polyvalente"}
`;
};

const checkSpecialtiesCoherence = (profile: UserProfile) => {

  if (!profile.specialties?.length) {
    return "Je n'ai pas tes spécialités enregistrées.";
  }

  if (profile.favoriteJobs) { // Il faut changer favoriteJobs par le vrai projet de l'utilisateur
    return `Tes spécialités semblent cohérentes avec ton projet "${profile.favoriteJobs[0]}".`;
  }

  return "Tes spécialités sont cohérentes, mais définir un projet précis permettrait d'affiner.";
};
/* ================== INITIAL MESSAGE ================== */

const getInitialMessage = (): Message => ({
  id: Date.now().toString(),
  text: "Bonjour 👋 Je suis Oriento. Que veux-tu explorer ?",
  sender: 'bot',
  suggestions: [
    "🎯 Découvrir mes domaines",
    "📚 Choix des spécialités",
    "🎓 Explorer les études"
  ]
});

/* ================== COMPONENT ================== */

const getStudyInfo = (type: string) => {

  const data = {
    Licence: {
      duration: "3 ans à l'université",
      level: "Baccalauréat",
      profile: "Autonome, à l’aise avec le travail théorique",
      advantages: "Grande diversité de parcours, poursuite en Master possible",
      outcomes: "Poursuite d’études ou insertion professionnelle selon spécialité"
    },

    BUT: {
      duration: "3 ans en IUT",
      level: "Baccalauréat",
      profile: "Aime le concret et l’équilibre théorie/pratique",
      advantages: "Formation professionnalisante avec stages",
      outcomes: "Insertion directe ou poursuite en Master/école"
    },

    BTS: {
      duration: "2 ans en lycée",
      level: "Baccalauréat",
      profile: "Pragmatique, aime les cas concrets",
      advantages: "Très professionnalisant, insertion rapide",
      outcomes: "Insertion rapide ou poursuite en licence pro"
    },

    Prépa: {
      duration: "2 ans en lycée",
      level: "Baccalauréat",
      profile: "Travailleur, aime les défis intellectuels",
      advantages: "Préparation intensive aux concours d’écoles",
      outcomes: "Accès aux grandes écoles selon spécialité"
    },

    Ecoles: {
      duration: "3 à 5 ans selon le diplôme",
      level: "Bac+2 à Bac+5",
      profile: "Motivé par un domaine spécifique, prêt à s’investir",
      advantages: "Formation spécialisée, réseau professionnel",
      outcomes: "Insertion professionnelle rapide dans le domaine"
    },

    Bachelor: {
      duration: "3 ans en école privée",
      level: "Baccalauréat", 
      profile: "Aime les formations professionnalisantes et internationales",
      advantages: "Souvent en partenariat avec des entreprises, ouverture à l’international",
      outcomes: "Insertion rapide ou poursuite en Master selon école"
    }
  };

  return data[type as keyof typeof data];
};

function analyzeDomains(profile: UserProfile): {
  domains: string[];
  explanation: string;
} {

  /* ===== PRIORITÉ RIASEC ===== */

  if (profile.riasecProfile && profile.riasecProfile.length > 0) {
    
    const code = profile.riasecProfile[0]; // type dominant
    if (code === "R") {
      return {
        domains: ["Ingénierie & Sciences", "Industrie & Technologie"],
        explanation:
          "Ton profil est orienté vers l'action et la technique. Tu sembles attiré par des domaines concrets et scientifiques."
      };
    }

    if (code === "I") {
      return {
        domains: ["Informatique & Numérique", "Recherche & Sciences"],
        explanation:
          "Ton profil montre une forte capacité d'analyse et de réflexion logique."
      };
    }

    if (code === "A") {
      return {
        domains: ["Art & Culture", "Communication & Design"],
        explanation:
          "Tu sembles créatif et attiré par l'expression artistique."
      };
    }

    if (code === "S") {
      return {
        domains: ["Social & Éducation", "Santé"],
        explanation:
          "Ton profil est tourné vers l'humain et l'accompagnement."
      };
    }

    if (code === "E") {
      return {
        domains: ["Commerce & Management", "Entrepreneuriat"],
        explanation:
          "Tu sembles à l'aise dans la prise d'initiative et la gestion."
      };
    }

    if (code === "C") {
      return {
        domains: ["Gestion & Finance", "Administration"],
        explanation:
          "Ton profil est structuré et organisé."
      };
    }
  }

  /* ===== SINON : SPÉCIALITÉS + INTÉRÊTS ===== */

  const domains = getSuggestedDomains(profile);

  return {
    domains,
    explanation:
      "Ton profil combine analyse logique et centres d'intérêt spécifiques, ce qui correspond bien à ces domaines."
  };
}

function suggestSpecialtiesForSeconde(profile: UserProfile): string[] {

  const suggestions: string[] = [];

  profile.interests?.forEach((interest) => {

    if (interest === "tech") {
      suggestions.push("Maths", "NSI");
    }

    if (interest === "science") {
      suggestions.push("Maths", "SVT");
    }

    if (interest === "social") {
      suggestions.push("SES", "HGGSP");
    }

    if (interest === "art") {
      suggestions.push("Arts");
    }
  });

  // Supprime doublons
  return [...new Set(suggestions)];
}

type ChatStep =
| "home"
| "domains"
| "domains_result"
| "specialties"
| "studies"
| "study_detail";

export default function Chatbot({ userProfile, onNavigate }: ChatbotProps) {

  const [messages, setMessages] = useState<Message[]>([getInitialMessage()]);
  const [step, setStep] = useState<ChatStep>("home");
  const [input, setInput] = useState('');
  const [selectedStudyType, setSelectedStudyType] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const resetConversation = () => {
    setStep("home");
    setMessages([getInitialMessage()]);
  };

  const generateBotResponse = (userMessage: string): Message => {
    console.log("Step:", step, "User message:", userMessage);
    /* ===== HOME ===== */
    if (step === "home") {

      if (userMessage.includes("Découvrir mes domaines")) {

        setStep("domains_result");

        const analysis = analyzeDomains(userProfile);
        return {
          id: Date.now().toString(),
          text: `D’après ton profil, tu sembles attiré par :

      • ${analysis.domains.join("\n• ")}

      ${analysis.explanation}`,
          sender: "bot",
          suggestions: [
            "🔍 Explorer les formations",
            "💼 Explorer les métiers",
            "🧠 Faire / Refaire le test RIASEC",
            "🔄 Revenir au début"
          ]
        };
      }
      
      if (userMessage.includes("Choix des spécialités")) {

        const grade = userProfile.grade;

        if (!grade) {
          return {
            id: Date.now().toString(),
            text: "Je ne trouve pas ta classe dans ton profil.",
            sender: "bot"
          };
        }

        setStep("specialties");

        if (grade === "Seconde") {
          return {
            id: Date.now().toString(),
            text: "Tu es en Seconde.\n\nQuelles spécialités choisir pour la Première ?",
            sender: "bot",
            suggestions: [
              "📌 Quelles spécialités correspondent à mon projet ?",
              "🔙 Retour"
            ]
          };
        }

        if (grade === "Première") {
          return {
            id: Date.now().toString(),
            text: "Tu es en Première.\n\nLaquelle garder en Terminale ?",
            sender: "bot",
            suggestions: [
              "❌ Laquelle abandonner ?",
              "🔄 Mes spécialités sont-elles cohérentes ?",
              "🔙 Retour"
            ]
          };
        }

        if (grade === "Terminale") {
          return {
            id: Date.now().toString(),
            text: "Tu es en Terminale.\n\nEst-ce que tes spécialités sont cohérentes avec ton projet ?",
            sender: "bot",
            suggestions: [
              "🔄 Mes spécialités sont-elles cohérentes ?",
              "🔙 Retour"
            ]
          };
        }
      }

      if (userMessage.includes("Explorer les études")) {
        setStep("studies");

        return {
          id: Date.now().toString(),
          text: "Quel type de formation veux-tu explorer ?",
          sender: "bot",
          suggestions: [
            "Licence",
            "BUT",
            "BTS",
            "Prépa",
            "Ecoles",
            "Bachelor",
            "🔄 Revenir au début"
          ]
        };
      }
    }
    /* ===== SPECIALITÉS ===== */
    if (step === "specialties") {

      if (userMessage === "🔙 Retour") {
        resetConversation();
        return { id: Date.now().toString(), text: "", sender: "bot" };
      }

      /* 📌 CAS 1 — Correspondent à mon projet */

      if (userMessage.includes("correspondent")) {

        const project = userProfile.favoriteJobs; // Il faut changer favoriteJobs par le vrai projet de l'utilisateur
        console.log("Projet du profil :", project);
        if (project && project.length > 0) {
          const recommendedSpecs = getRecommendedSpecialtiesForProject(project[0]);

          return {
            id: Date.now().toString(),
            text: `Pour ton projet "${project}", voici les spécialités recommandées 👇`,
            sender: "bot",
            suggestions: recommendedSpecs.concat(["🔙 Retour"])
          };
        }

        /* CAS 2 — Pas de projet → RIASEC */

        if (userProfile.riasecProfile?.length) {

          const specsFromRiasec = getSpecialtiesFromRiasec(userProfile.riasecProfile);

          return {
            id: Date.now().toString(),
            text: "Tu n'as pas encore de projet défini.\n\nSelon ton profil RIASEC, voici des spécialités adaptées 👇",
            sender: "bot",
            suggestions: specsFromRiasec.concat(["🔙 Retour"])
          };
        }

        return {
          id: Date.now().toString(),
          text: "Je te conseille de faire le test RIASEC pour affiner ton choix 👇",
          sender: "bot",
          suggestions: ["🧠 Faire le test RIASEC", "🔙 Retour"]
        };
      }

      /* ❌ CAS 3 — Laquelle abandonner */

      if (userMessage.includes("abandonner")) {

        const specs = userProfile.specialties;

        if (!specs || specs.length < 2) {
          return {
            id: Date.now().toString(),
            text: "Je n'ai pas assez d'informations sur tes spécialités actuelles.",
            sender: "bot"
          };
        }

        return {
          id: Date.now().toString(),
          text: `Comparons tes spécialités 👇\n\n${compareSpecialties(specs[0], specs[1])}`,
          sender: "bot",
          suggestions: ["🔙 Retour"]
        };
      }

      /* 🔄 CAS 4 — Cohérence */

      if (userMessage.includes("cohérentes")) {

        const result = checkSpecialtiesCoherence(userProfile);

        return {
          id: Date.now().toString(),
          text: result,
          sender: "bot",
          suggestions: ["🔙 Retour"]
        };
      }
    }
    /* ===== DOMAIN RESULT ACTIONS ===== */
    if (step === "domains_result") {
      if (userMessage.includes("formations")) {
        onNavigate("formations");
        return {
          id: Date.now().toString(),
          text: "Je t'emmène vers les formations adaptées 👇",
          sender: "bot"
        };
      }

      if (userMessage.includes("métiers")) {
        onNavigate("careers");
        return {
          id: Date.now().toString(),
          text: "Je t'emmène vers les métiers correspondants 👇",
          sender: "bot"
        };
      }

      if (userMessage.includes("RIASEC")) {
        onNavigate("riasec-test");
        return {
          id: Date.now().toString(),
          text: "Je t'emmène vers le test RIASEC 👇",
          sender: "bot"
        };
      }

      if (userMessage === "🔄 Revenir au début") {
        resetConversation();
        return { id: Date.now().toString(), text: "", sender: "bot" };
      }
    }
    /* ===== DOMAINS ===== */

    if (step === "domains") {

      if (userMessage === "🔄 Revenir au début") {
        resetConversation();
        return {
          id: Date.now().toString(),
          text: "",
          sender: "bot"
        };
      }

      localStorage.setItem("selectedDomain", userMessage);

      return {
        id: Date.now().toString(),
        text: `Tu explores le domaine "${userMessage}".`,
        sender: "bot",
        suggestions: [
          "Voir les métiers",
          "Voir les formations",
          "🔄 Revenir au début"
        ]
      };
    }

    /* ===== STUDIES ===== */

    if (step === "studies") {

      if (userMessage === "Licence" || userMessage === "BUT" || userMessage === "BTS" || userMessage === "Prépa" || userMessage === "Ecoles" || userMessage === "Bachelor") {
        setSelectedStudyType(userMessage);
        setStep("study_detail");

        const studyInfo = getStudyInfo(userMessage);

        return {
          id: Date.now().toString(),
          text: `
    📚 ${userMessage}

    Durée :
    ${studyInfo.duration}

    Niveau requis :
    ${studyInfo.level}

    Profil type :
    ${studyInfo.profile}

    Avantages :
    ${studyInfo.advantages}

    Débouchés :
    ${studyInfo.outcomes}
          `,
          sender: "bot",
          suggestions: [
            "🌍 Voir les formations liés",
            "💼 Voir les métiers liés",
            "🔄 Retour"
          ]
        };
      }

      if (userMessage === "🔄 Revenir au début") {
        resetConversation();
        return { id: Date.now().toString(), text: "", sender: "bot" };
      }
    }

    /* ===== STUDY DETAIL ===== */
    if (step === "study_detail") {

      if (userMessage.includes("formations")) {

        if (selectedStudyType) {
          window.location.href = `/formations?search=${encodeURIComponent(selectedStudyType)}`;
        }

        onNavigate("formations");

        return {
          id: Date.now().toString(),
          text: "Je t'affiche les formations correspondantes 👇",
          sender: "bot"
        };
      }

      if (userMessage.includes("métiers")) {
        onNavigate("careers");
        return {
          id: Date.now().toString(),
          text: "Voici les métiers liés à cette formation 👇",
          sender: "bot"
        };
      }

      if (userMessage === "🔄 Retour") {
        setStep("studies");
        return {
          id: Date.now().toString(),
          text: "Quel type de formation veux-tu explorer ?",
          sender: "bot",
          suggestions: ["Licence", "BUT", "BTS", "Prépa", "Ecoles", "Bachelor", "🔄 Revenir au début"]
        };
      }
    }

    /* ===== DEFAULT ===== */

    return {
      id: Date.now().toString(),
      text: "Choisis une des options proposées 👇",
      sender: "bot"
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
                {message.suggestions.map((suggestion, idx) => {

                  const isLastMessage =
                    message.id === messages[messages.length - 1].id;

                  return (
                    <button
                      key={idx}
                      onClick={() => isLastMessage && handleSuggestionClick(suggestion)}
                      disabled={!isLastMessage}
                      className={`px-4 py-2 rounded-full text-sm font-medium
                        ${isLastMessage
                          ? "bg-white border border-primary-200 text-primary-600 hover:bg-primary-50"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                    >
                      {suggestion}
                    </button>
                  );
                })}
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
