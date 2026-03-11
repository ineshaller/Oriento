import { useState, useRef, useEffect, use } from 'react';
import { Send, Sparkles } from 'lucide-react';
import type { UserProfile, Screen } from '../App';

// En haut de Chatbot.tsx, ajouter l'import
import careersData from '../data/careers_enriched.json';
import type { Career } from './CareersExplorer';

const careers: Career[] = careersData as Career[];

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

const defSpecilties: Record<string, string> = {
  "Maths": "Spécialité centrée sur le raisonnement logique, les calculs, les fonctions et les probabilités. Utile pour les études scientifiques, l’ingénierie, l’économie ou la data.",
  
  "Physique-Chimie": "Étude des lois de la physique et de la chimie : énergie, mouvement, réactions chimiques. Recommandée pour les études scientifiques, médicales ou d’ingénierie.",
  
  "SVT": "Sciences de la Vie et de la Terre : biologie, corps humain, environnement et géologie. Utile pour les études en médecine, biologie, environnement ou recherche.",
  
  "SES": "Sciences Économiques et Sociales : économie, société, fonctionnement des marchés et inégalités. Adaptée pour commerce, économie, gestion ou sciences politiques.",
  
  "HGGSP": "Histoire-Géographie, Géopolitique et Sciences Politiques : analyse du monde contemporain, des relations internationales et des enjeux politiques.",
  
  "LLCA": "Étude de la culture, l'histoire, la géographie, la philosophie, la littérature et la langue grecque et/ou romaine.",
  
  "LLCE": "Étude approfondie d’une langue étrangère (anglais, espagnol, allemand, etc.) et de la culture associée.",
  
  "HLP": "Analyse de grands textes littéraires et philosophiques pour réfléchir aux idées, aux valeurs et à la pensée humaine.",
  
  "NSI": "Numérique et Sciences Informatiques : programmation, algorithmes, réseaux et fonctionnement des systèmes informatiques.",
  
  "SI": "Sciences de l’Ingénieur : conception et fonctionnement des systèmes technologiques et industriels.",
  
  "Arts": "Exploration artistique selon la spécialité choisie (cinéma, musique, arts plastiques, théâtre…).",
  
  "Sports": "Éducation Physique, Pratiques et Culture Sportive : étude du sport, de la performance et des activités physiques."
};

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



const compareSpecialties = (spec1: string, spec2: string, spec3: string, userProfile: UserProfile) => {

  const specToSectors: Record<string, string[]> = {
    "Maths":           ["Informatique & Numérique", "Commerce & Gestion", "Bâtiment", "Transport & Logistique", "Chimie & Biologie"],
    "SES":             ["Commerce & Gestion", "Administration", "Communication & Médias", "Enseignement"],
    "NSI":             ["Informatique & Numérique"],
    "SVT":             ["Santé & Social", "Agriculture", "Chimie & Biologie"],
    "Physique-Chimie": ["Bâtiment", "Chimie & Biologie", "Transport & Logistique", "Santé & Social"],
    "HGGSP":           ["Administration", "Enseignement", "Sécurité & Défense"],
    "LLCE":            ["Communication & Médias", "Hôtellerie & Tourisme", "Enseignement"],
    "LLCA":            ["Communication & Médias", "Enseignement"],
    "HLP":             ["Enseignement", "Communication & Médias"],
    "Arts":            ["Communication & Médias"],
    "SI":              ["Bâtiment", "Transport & Logistique", "Informatique & Numérique"],
    "Sports":          ["Santé & Social", "Enseignement", "Sécurité & Défense"],
  };

  const riasecToSectors: Record<string, string[]> = {
    R: ["Bâtiment", "Transport & Logistique", "Agriculture"],
    I: ["Informatique & Numérique", "Chimie & Biologie", "Santé & Social"],
    A: ["Communication & Médias", "Hôtellerie & Tourisme"],
    S: ["Enseignement", "Santé & Social"],
    E: ["Commerce & Gestion", "Administration"],
    C: ["Administration", "Commerce & Gestion"],
  };

  const specialtyToInterests: Record<string, string[]> = {
    "Maths":           ["Technologies", "Sciences"],
    "Physique-Chimie": ["Sciences", "Travaux manuels"],
    "SVT":             ["Sciences", "Santé", "Sport"],
    "SES":             ["Relationnel"],
    "HGGSP":           ["Relationnel", "Voyages"],
    "HLP":             ["Littérature", "Art", "Musique", "Relationnel"],
    "LLCE":            ["Littérature", "Voyages"],
    "LLCA":            ["Littérature", "Art", "Musique"],
    "NSI":             ["Technologies"],
    "SI":              ["Technologies", "Travaux manuels"],
    "Arts":            ["Art", "Musique", "Photo/Vidéo"],
    "Sports":          ["Sport", "Santé"],
  };

  const interestLabels: Record<string, string> = {
    "sport":      "Sport",
    "health":     "Santé",
    "literature": "Littérature",
    "tech":       "Technologies",
    "science":    "Sciences",
    "art":        "Art",
    "music":      "Musique",
    "travel":     "Voyages",
    "social":     "Relationnel",
    "photo":      "Photo/Vidéo",
    "manual":     "Travaux manuels",
  };

  const firstFavoriteCareer = careers.find(c => c.id === userProfile.favoriteJobs?.[0]);
  const sector = firstFavoriteCareer?.sector;

  const riasecCode = userProfile.riasecProfile?.[0];
  const fallbackSectors = riasecCode ? riasecToSectors[riasecCode] : null;

  const userInterestsNormalized = userProfile.interests?.map(i => interestLabels[i] ?? i) ?? [];

  const checkSpec = (spec: string): string => {
    const sectors = specToSectors[spec];
    if (!sectors) return `${spec} : spécialité non reconnue`;

    // CAS 1 — projet défini
    if (sector) {
      const isCoherent = sectors.includes(sector);
      return isCoherent
        ? `✅ ${spec} : cohérente avec ton projet (${sector})`
        : `⚠️ ${spec} : peu alignée avec ton projet (${sector}), plus utile pour ${sectors.slice(0, 2).join(" ou ")}`;
    }

    // CAS 2 — RIASEC disponible
    if (fallbackSectors) {
      const matchingSectors = sectors.filter(s => fallbackSectors.includes(s));
      return matchingSectors.length > 0
        ? `✅ ${spec} : cohérente avec ton profil RIASEC (${matchingSectors.join(", ")})`
        : `⚠️ ${spec} : peu alignée avec ton profil RIASEC, plus utile pour ${sectors.slice(0, 2).join(", ")}`;
    }

    // CAS 3 — centres d'intérêt disponibles
    if (userInterestsNormalized.length > 0) {
      const matchingInterests = (specialtyToInterests[spec] ?? [])
        .filter(i => userInterestsNormalized.includes(i));
      return matchingInterests.length > 0
        ? `✅ ${spec} : cohérente avec tes centres d'intérêt (${matchingInterests.join(", ")})`
        : `⚠️ ${spec} : peu alignée avec tes centres d'intérêt, plus utile pour ${(specialtyToInterests[spec] ?? []).slice(0, 2).join(", ")}`;
    }

    // CAS 4 — aucune donnée
    return `❌ ${spec} : impossible de te conseiller sans projet, profil RIASEC ou centres d'intérêt définis.`;
  };

  const specs = [spec1, spec2, spec3].filter(Boolean);
  const results = specs.map(checkSpec).join("\n\n");

  // Conclusion — trouver la spécialité à abandonner selon le cas
  const scores = specs.map(spec => {
    let score = 0;

    if (sector) {
      score = (specToSectors[spec] ?? []).includes(sector) ? 1 : 0;
    } else if (fallbackSectors) {
      score = (specToSectors[spec] ?? []).filter(s => fallbackSectors.includes(s)).length;
    } else if (userInterestsNormalized.length > 0) {
      score = (specialtyToInterests[spec] ?? []).filter(i => userInterestsNormalized.includes(i)).length;
    }

    return { spec, score };
  });

  const minScore = Math.min(...scores.map(s => s.score));
  const toAbandon = scores.filter(s => s.score === minScore);

  const conclusion = toAbandon.length === 1
    ? `\n\n💡 Notre recommandation : abandonne ${toAbandon[0].spec} en Terminale, c'est la moins alignée avec ton profil.`
    : `\n\n💡 Les spécialités ${toAbandon.map(s => s.spec).join(" et ")} sont aussi pertinentes l'une que l'autre, le choix dépend davantage de ton projet.`;

  return results + conclusion;
};

const sectorToSpecialties: Record<string, string[]> = {
  "Informatique & Numérique":  ["NSI", "Maths"],
  "Santé & Social":            ["SVT", "Physique-Chimie", "SES"],
  "Commerce & Gestion":        ["SES", "Maths"],
  "Communication & Médias":    ["Arts", "LLCE"],
  "Enseignement":              ["HLP", "SES"],
  "Bâtiment":                  ["Maths", "Physique-Chimie", "SI"],
  "Transport & Logistique":    ["Maths", "Physique-Chimie", "SI"],
  "Hôtellerie & Tourisme":     ["LLCE", "SES"],
  "Agriculture":               ["SVT", "Physique-Chimie"],
  "Chimie & Biologie":         ["SVT", "Physique-Chimie", "Maths"],
  "Administration":            ["SES", "HGGSP"],
  "Sécurité & Défense":        ["EPS", "Maths"],
};

const checkCoherenceWithSector = (sector: string, userSpecialties: string[]): string => {
  const recommendedSpecs = sectorToSpecialties[sector];

  if (!recommendedSpecs) {
    return `Je n'ai pas de données pour le secteur "${sector}".`;
  }

  const matching = userSpecialties.filter(s => recommendedSpecs.includes(s));
  const missing  = recommendedSpecs.filter(s => !userSpecialties.includes(s));

  if (matching.length === 0) {
    return `Tes spécialités ne semblent pas alignées avec le secteur "${sector}". Les spécialités recommandées sont : ${recommendedSpecs.join(", ")}.`;
  }

  if (missing.length === 0) {
    return `✅ Tes spécialités sont parfaitement cohérentes avec le secteur "${sector}" !`;
  }

  return `👍 Tes spécialités ${matching.join(", ")} sont cohérentes avec "${sector}". Tu pourrais aussi envisager : ${missing.join(", ")}.`;
};

const checkSpecialtiesCoherence = (profile: UserProfile) => {
  console.log("favoriteJobs:", profile.favoriteJobs);
  const firstFavoriteId = profile.favoriteJobs?.[0]; // Il faut changer favoriteJobs par le vrai projet de l'utilisateur
  const firstFavoriteCareer = careers.find(c => c.id === firstFavoriteId);
  if (!profile.specialties?.length) {
    return "Je n'ai pas tes spécialités enregistrées.";
  }

  if (firstFavoriteCareer?.sector) { 
    return checkCoherenceWithSector(firstFavoriteCareer.sector, profile.specialties);
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
| "DefSpec"
| "study_detail"
| "send_to_riasec";

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
      
      if (userMessage.includes("spécialités")) {

        const project = userProfile.favoriteJobs; // Il faut changer favoriteJobs par le vrai projet de l'utilisateur
        // Exemple : récupérer le secteur du premier métier favori
        const firstFavoriteId = project?.[0];
        const firstFavoriteCareer = careers.find(c => c.id === firstFavoriteId);
        const sector = firstFavoriteCareer?.sector; // ex: "Informatique & Numérique"
        console.log("Projet du profil :", firstFavoriteCareer?.title, "Secteur :", sector);
        /* 📌 CAS 1 — Correspondent à mon projet */
        if (firstFavoriteCareer && sector && project) {
          setStep("DefSpec");
          const recommendedSpecs = getRecommendedSpecialtiesForProject(project[0]);

          return {
            id: Date.now().toString(),
            text: `Pour ton projet "${firstFavoriteCareer?.title}", voici les spécialités recommandées 👇`,
            sender: "bot",
            suggestions: recommendedSpecs.concat(["🔙 Retour"])
          };
        }

        /* CAS 2 — Pas de projet → RIASEC */

        if (userProfile.riasecProfile?.length) {
          setStep("DefSpec");
          const specsFromRiasec = getSpecialtiesFromRiasec(userProfile.riasecProfile);

          return {
            id: Date.now().toString(),
            text: "Tu n'as pas encore de projet défini.\n\nSelon ton profil RIASEC, voici des spécialités adaptées 👇",
            sender: "bot",
            suggestions: specsFromRiasec.concat(["🔙 Retour"])
          };
        }

        else if (!userProfile.riasecProfile?.length) {
          setStep("send_to_riasec");
          return {
            id: Date.now().toString(),
            text: "Je te conseille de faire le test RIASEC pour affiner ton choix 👇",
            sender: "bot",
            suggestions: ["🧠 Faire le test RIASEC", "🔙 Retour"]
          };
        }
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
          text: `Comparons tes spécialités 👇\n\n${compareSpecialties(specs[0], specs[1], specs[2],userProfile)}`,
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
    /* ===== DEF SPEC ===== */

    if (step === "DefSpec") {
      if (userMessage === "🔙 Retour") {
        resetConversation();
        return { id: Date.now().toString(), text: "", sender: "bot" };
      }
      else if (defSpecilties[userMessage]) {
        return {
          id: Date.now().toString(),
          text: `${userMessage} : ${defSpecilties[userMessage]}`,
          sender: "bot",
          suggestions: ["🔙 Retour"]
        };
      }
    }
    /* ===== RIASEC RESULT ACTIONS ===== */
    if (step === "send_to_riasec") {
      if (userMessage.includes("Faire le test RIASEC")) {
        onNavigate("riasec-test");
        return {
          id: Date.now().toString(),
          text: "Je t'emmène vers le test RIASEC 👇",
          sender: "bot"
        };
      }
      if (userMessage === "🔙 Retour") {
        resetConversation();
        return { id: Date.now().toString(), text: "", sender: "bot" };
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
    const StudyType = "";
    if (step === "studies") {

      if (userMessage === "Licence" || userMessage === "BUT" || userMessage === "BTS" || userMessage === "Prépa" || userMessage === "Ecoles" || userMessage === "Bachelor") {
        setSelectedStudyType(userMessage);
        setStep("study_detail");
        let StudyType = userMessage;
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

      // Dans le bloc study_detail, remplacer le bloc formations par :
      if (userMessage.includes("formations")) {
        if (selectedStudyType) {
          localStorage.setItem("formationFilter", selectedStudyType); // ✅ stocker
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
