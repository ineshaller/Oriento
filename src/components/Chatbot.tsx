import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, RotateCcw } from 'lucide-react';
import type { UserProfile, Screen } from '../App';
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

/* ================== TYPES ================== */
type ChatStep =
  | "home"
  | "domains_result"
  | "domains_filter"
  | "domains_explore"
  | "specialties_menu"
  | "spec_ask_project"
  | "spec_choose_project"
  | "spec_by_project"
  | "spec_no_project"
  | "spec_abandon"
  | "spec_coherence"
  | "spec_compare_pick1"
  | "spec_compare_pick2"
  | "spec_compare_result"
  | "DefSpec"
  | "studies"
  | "study_detail"
  | "send_to_riasec"
  | "general"
  | "parcoursup"
  | "alternance"
  | "stress"
  | "gap_year"
  | "international";

/* ================== DATA ================== */

const ALL_SPECIALTIES = ["Maths","Physique-Chimie","SVT","SES","HGGSP","LLCA","LLCE","HLP","NSI","SI","Arts","Sports"];

const defSpecialties: Record<string, string> = {
  "Maths": "Spécialité centrée sur le raisonnement logique, les calculs et les probabilités. Indispensable pour les études scientifiques, l'ingénierie, l'économie ou la data.",
  "Physique-Chimie": "Étude des lois physiques et chimiques : énergie, mouvement, réactions. Recommandée pour les études scientifiques, médicales ou d'ingénierie.",
  "SVT": "Sciences de la Vie et de la Terre : biologie, corps humain, environnement. Idéale pour médecine, biologie, environnement ou recherche.",
  "SES": "Sciences Économiques et Sociales : économie, société, marchés. Parfaite pour commerce, économie, gestion ou sciences politiques.",
  "HGGSP": "Histoire-Géographie, Géopolitique et Sciences Politiques : analyse du monde contemporain et des enjeux politiques.",
  "LLCA": "Étude de la culture, l'histoire et la langue grecque et/ou latine.",
  "LLCE": "Étude approfondie d'une langue étrangère et de sa culture.",
  "HLP": "Analyse de grands textes littéraires et philosophiques pour réfléchir aux idées et valeurs humaines.",
  "NSI": "Numérique et Sciences Informatiques : programmation, algorithmes, réseaux et systèmes informatiques.",
  "SI": "Sciences de l'Ingénieur : conception et fonctionnement des systèmes technologiques.",
  "Arts": "Exploration artistique selon la spécialité choisie (cinéma, musique, arts plastiques, théâtre…).",
  "Sports": "Éducation Physique, Pratiques et Culture Sportive : étude du sport et de la performance."
};

// Projets proposés avec leurs secteurs associés
const PROJECT_EXAMPLES: Record<string, { label: string; sector: string; specialties: string[] }> = {
  "💻 Informatique / Dev":    { label: "Informatique / Dev",    sector: "Informatique & Numérique", specialties: ["NSI", "Maths", "Physique-Chimie"] },
  "🏥 Médecine / Santé":      { label: "Médecine / Santé",      sector: "Santé & Social",           specialties: ["SVT", "Physique-Chimie", "Maths"] },
  "💼 Commerce / Gestion":    { label: "Commerce / Gestion",    sector: "Commerce & Gestion",       specialties: ["SES", "Maths", "HGGSP"] },
  "⚖️ Droit / Sciences Po":   { label: "Droit / Sciences Po",   sector: "Administration",           specialties: ["HGGSP", "SES", "HLP"] },
  "🎨 Art / Design / Média":  { label: "Art / Design / Média",  sector: "Communication & Médias",   specialties: ["Arts", "LLCE", "HLP"] },
  "🔬 Recherche / Sciences":  { label: "Recherche / Sciences",  sector: "Chimie & Biologie",        specialties: ["Maths", "SVT", "Physique-Chimie"] },
  "🏗️ Ingénierie / BTP":      { label: "Ingénierie / BTP",      sector: "Bâtiment",                 specialties: ["Maths", "Physique-Chimie", "SI"] },
  "🌍 International / Langues":{ label: "International / Langues", sector: "Hôtellerie & Tourisme", specialties: ["LLCE", "HGGSP", "SES"] },
  "🌱 Agriculture / Env.":    { label: "Agriculture / Env.",    sector: "Agriculture",              specialties: ["SVT", "Physique-Chimie", "SES"] },
  "🎓 Enseignement":          { label: "Enseignement",          sector: "Enseignement",             specialties: ["HLP", "SES", "Maths"] },
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

const specialtiesMap: Record<string, string[]> = {
  Maths: ["Mathématiques et statistiques"], NSI: ["Informatique et Numérique"],
  SVT: ["Santé et Esthétique"], SES: ["Economie et Finance"],
  HGGSP: ["Droit"], Arts: ["Art et Culture"]
};

const interestsMap: Record<string, string[]> = {
  tech: ["Informatique et Numérique"], science: ["Sciences et Recherche"],
  health: ["Santé et Esthétique"], art: ["Art et Culture"],
  sport: ["Sport"], social: ["Social et Education"]
};

// Domaines avec leurs filtres pour les onglets
// careerFilter  → doit correspondre exactement à un secteur dans ALL_SECTORS de CareersExplorer
// formationFilter → doit correspondre exactement à un domaine dans domainConfig de FormationsExplorer
const DOMAIN_FILTERS: Record<string, { careerFilter?: string; formationFilter?: string }> = {
  "Ingénierie & Sciences":    { careerFilter: "Bâtiment",               formationFilter: "Ingénierie et Technologie" },
  "Informatique & Numérique": { careerFilter: "Informatique & Numérique",formationFilter: "Informatique et Numérique" },
  "Recherche & Sciences":     { careerFilter: "Chimie & Biologie",       formationFilter: "Sciences et Recherche" },
  "Art & Culture":            { careerFilter: "Communication & Médias",  formationFilter: "Art et Culture" },
  "Communication & Design":   { careerFilter: "Communication & Médias",  formationFilter: "Marketing et Communication" },
  "Social & Éducation":       { careerFilter: "Enseignement",            formationFilter: "Social et Education" },
  "Santé":                    { careerFilter: "Santé & Social",           formationFilter: "Santé et Esthétique" },
  "Commerce & Management":    { careerFilter: "Commerce & Gestion",      formationFilter: "Commerce et Management" },
  "Entrepreneuriat":          { careerFilter: "Commerce & Gestion",      formationFilter: "Commerce et Management" },
  "Gestion & Finance":        { careerFilter: "Commerce & Gestion",      formationFilter: "Economie et Finance" },
  "Administration":           { careerFilter: "Administration",          formationFilter: "Droit" },
  "Industrie & Technologie":  { careerFilter: "Bâtiment",               formationFilter: "Technique et Industrie" },
};

const studyData: Record<string, { duration: string; level: string; profile: string; advantages: string; outcomes: string; formationType: string }> = {
  Licence:  { duration: "3 ans à l'université", level: "Baccalauréat", profile: "Autonome, à l'aise avec le travail théorique", advantages: "Grande diversité de parcours, poursuite en Master possible", outcomes: "Poursuite d'études ou insertion professionnelle selon spécialité", formationType: "Licence" },
  BUT:      { duration: "3 ans en IUT", level: "Baccalauréat", profile: "Aime le concret et l'équilibre théorie/pratique", advantages: "Formation professionnalisante avec stages obligatoires", outcomes: "Insertion directe ou poursuite en Master/école", formationType: "BUT" },
  BTS:      { duration: "2 ans en lycée", level: "Baccalauréat", profile: "Pragmatique, aime les cas concrets", advantages: "Très professionnalisant, insertion rapide", outcomes: "Insertion rapide ou poursuite en licence pro", formationType: "BTS" },
  Prépa:    { duration: "2 ans en lycée", level: "Baccalauréat", profile: "Travailleur, aime les défis intellectuels", advantages: "Préparation intensive aux concours des grandes écoles", outcomes: "Accès aux grandes écoles selon spécialité", formationType: "Prépa" },
  Ecoles:   { duration: "3 à 5 ans selon le diplôme", level: "Bac+2 à Bac+5", profile: "Motivé par un domaine spécifique, prêt à s'investir", advantages: "Formation spécialisée, réseau professionnel solide", outcomes: "Insertion professionnelle rapide dans le domaine", formationType: "École" },
  Bachelor: { duration: "3 ans en école privée", level: "Baccalauréat", profile: "Aime les formations professionnalisantes et internationales", advantages: "Partenariats entreprises, ouverture à l'international", outcomes: "Insertion rapide ou poursuite en Master", formationType: "Bachelor" }
};

/* ================== HELPERS ================== */

function getSuggestedDomains(profile: UserProfile): string[] {
  const domains: string[] = [];
  profile.specialties?.forEach(spec => { specialtiesMap[spec]?.forEach(d => { if (!domains.includes(d)) domains.push(d); }); });
  profile.interests?.forEach(int => { interestsMap[int]?.forEach(d => { if (!domains.includes(d)) domains.push(d); }); });
  return domains.length > 0 ? domains : ["Commerce et Management"];
}

function analyzeDomains(profile: UserProfile): { domains: string[]; explanation: string } {
  if (profile.riasecProfile?.length) {
    const map: Record<string, { domains: string[]; explanation: string }> = {
      R: { domains: ["Ingénierie & Sciences", "Industrie & Technologie"], explanation: "Ton profil est orienté vers l'action et la technique." },
      I: { domains: ["Informatique & Numérique", "Recherche & Sciences"], explanation: "Ton profil montre une forte capacité d'analyse et de réflexion logique." },
      A: { domains: ["Art & Culture", "Communication & Design"], explanation: "Tu sembles créatif et attiré par l'expression artistique." },
      S: { domains: ["Social & Éducation", "Santé"], explanation: "Ton profil est tourné vers l'humain et l'accompagnement." },
      E: { domains: ["Commerce & Management", "Entrepreneuriat"], explanation: "Tu sembles à l'aise dans la prise d'initiative et la gestion." },
      C: { domains: ["Gestion & Finance", "Administration"], explanation: "Ton profil est structuré et organisé, tu aimes la précision." }
    };
    const result = map[profile.riasecProfile[0]];
    if (result) return result;
  }
  return { domains: getSuggestedDomains(profile), explanation: "Ton profil combine tes spécialités et centres d'intérêt." };
}

function getSpecialtiesFromRiasec(riasec: string[]): string[] {
  const map: Record<string, string[]> = {
    R: ["SI", "Physique-Chimie"], I: ["Maths", "NSI", "Physique-Chimie"],
    A: ["Arts", "LLCE"], S: ["SES", "HLP"], E: ["SES", "HGGSP"], C: ["Maths", "SES"]
  };
  return map[riasec[0]] || ["Maths", "SES"];
}

function compareTwo(spec1: string, spec2: string, profile: UserProfile): string {
  const specToSectors: Record<string, string[]> = {
    "Maths": ["Informatique & Numérique", "Commerce & Gestion", "Bâtiment"],
    "SES": ["Commerce & Gestion", "Administration", "Enseignement"],
    "NSI": ["Informatique & Numérique"], "SVT": ["Santé & Social", "Chimie & Biologie"],
    "Physique-Chimie": ["Bâtiment", "Chimie & Biologie", "Santé & Social"],
    "HGGSP": ["Administration", "Enseignement"], "LLCE": ["Communication & Médias", "Hôtellerie & Tourisme"],
    "Arts": ["Communication & Médias"], "SI": ["Bâtiment", "Informatique & Numérique"],
    "Sports": ["Santé & Social", "Enseignement"], "HLP": ["Enseignement", "Communication & Médias"],
    "LLCA": ["Communication & Médias", "Enseignement"],
  };
  const riasecToSectors: Record<string, string[]> = {
    R: ["Bâtiment", "Transport & Logistique"], I: ["Informatique & Numérique", "Chimie & Biologie"],
    A: ["Communication & Médias"], S: ["Enseignement", "Santé & Social"],
    E: ["Commerce & Gestion"], C: ["Administration", "Commerce & Gestion"],
  };

  const firstFav = careers.find(c => c.id === profile.favoriteJobs?.[0]);
  const sector = firstFav?.sector;
  const fallbackSectors = profile.riasecProfile?.[0] ? riasecToSectors[profile.riasecProfile[0]] : null;

  const score = (spec: string) => {
    const sectors = specToSectors[spec] ?? [];
    if (sector) return sectors.includes(sector) ? 2 : 0;
    if (fallbackSectors) return sectors.filter(s => fallbackSectors.includes(s)).length;
    return 1;
  };

  const s1 = score(spec1), s2 = score(spec2);
  const desc1 = defSpecialties[spec1] ?? "";
  const desc2 = defSpecialties[spec2] ?? "";

  let result = `📊 Comparaison : ${spec1} vs ${spec2}\n\n`;
  result += `📚 ${spec1} :\n${desc1.split(".")[0]}.\nOuvre vers : ${(specToSectors[spec1] ?? []).slice(0,2).join(", ")}\n\n`;
  result += `📚 ${spec2} :\n${desc2.split(".")[0]}.\nOuvre vers : ${(specToSectors[spec2] ?? []).slice(0,2).join(", ")}\n\n`;

  if (s1 > s2) result += `✅ ${spec1} semble plus alignée avec ton profil.`;
  else if (s2 > s1) result += `✅ ${spec2} semble plus alignée avec ton profil.`;
  else result += `⚖️ Les deux spécialités sont aussi pertinentes l'une que l'autre pour ton profil. Choisis celle que tu préfères !`;

  return result;
}

function getAbandonRecommendation(specs: string[], profile: UserProfile): string {
  const specToSectors: Record<string, string[]> = {
    "Maths": ["Informatique & Numérique", "Commerce & Gestion", "Bâtiment"],
    "SES": ["Commerce & Gestion", "Administration", "Enseignement"],
    "NSI": ["Informatique & Numérique"], "SVT": ["Santé & Social", "Chimie & Biologie"],
    "Physique-Chimie": ["Bâtiment", "Chimie & Biologie", "Santé & Social"],
    "HGGSP": ["Administration", "Enseignement"], "LLCE": ["Communication & Médias", "Hôtellerie & Tourisme"],
    "Arts": ["Communication & Médias"], "SI": ["Bâtiment", "Informatique & Numérique"],
    "Sports": ["Santé & Social", "Enseignement"], "HLP": ["Enseignement", "Communication & Médias"],
    "LLCA": ["Communication & Médias", "Enseignement"],
  };
  const riasecToSectors: Record<string, string[]> = {
    R: ["Bâtiment"], I: ["Informatique & Numérique", "Chimie & Biologie"],
    A: ["Communication & Médias"], S: ["Enseignement", "Santé & Social"],
    E: ["Commerce & Gestion"], C: ["Administration"],
  };

  const firstFav = careers.find(c => c.id === profile.favoriteJobs?.[0]);
  const sector = firstFav?.sector;
  const fallbackSectors = profile.riasecProfile?.[0] ? riasecToSectors[profile.riasecProfile[0]] : null;

  const scores = specs.map(spec => {
    const sectors = specToSectors[spec] ?? [];
    let score = 0;
    if (sector) score = sectors.includes(sector) ? 2 : 0;
    else if (fallbackSectors) score = sectors.filter(s => fallbackSectors.includes(s)).length;
    else score = 1;
    return { spec, score };
  });

  const lines = scores.map(({ spec, score }) => {
    const sectors = (specToSectors[spec] ?? []).slice(0, 2).join(", ");
    const icon = score >= 2 ? "✅" : score === 1 ? "⚠️" : "❌";
    return `${icon} ${spec} : ouvre vers ${sectors}`;
  }).join("\n");

  const minScore = Math.min(...scores.map(s => s.score));
  const toAbandon = scores.filter(s => s.score === minScore).map(s => s.spec);

  const conclusion = toAbandon.length === 1
    ? `\n\n💡 Recommandation : abandonne ${toAbandon[0]} en Terminale, c'est la moins alignée avec ton profil.`
    : `\n\n💡 ${toAbandon.join(" et ")} sont équivalentes. Choisis celle que tu aimes le moins !`;

  return `Voici l'analyse de tes spécialités :\n\n${lines}${conclusion}`;
}

/* ================== SAUVEGARDE ================== */

function saveChatHistory(messages: Message[], currentStep: ChatStep) {
  try {
    localStorage.setItem('chatHistory', JSON.stringify(messages.slice(-80)));
    localStorage.setItem('chatStep', currentStep);
  } catch { /* ignore */ }
}

function loadChatHistory(): Message[] {
  try {
    const saved = localStorage.getItem('chatHistory');
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
}

function loadChatStep(): ChatStep {
  try {
    return (localStorage.getItem('chatStep') as ChatStep) ?? "home";
  } catch { return "home"; }
}

// Appelé depuis App.tsx lors du logout
export function clearChatHistory() {
  try {
    localStorage.removeItem('chatHistory');
    localStorage.removeItem('chatStep');
  } catch { /* ignore */ }
}

/* ================== MESSAGES ================== */

const HOME_SUGGESTIONS = ["🎯 Découvrir mes domaines", "📚 Choix des spécialités", "🎓 Explorer les études", "❓ Questions générales"];

const getInitialMessage = (): Message => ({
  id: "init",
  text: "Bonjour 👋 Je suis Oriento, ton assistant d'orientation. Que veux-tu explorer ?",
  sender: 'bot',
  suggestions: HOME_SUGGESTIONS
});

const STEP_RESUME: Partial<Record<ChatStep, { text: string; suggestions: string[] }>> = {
  "domains_result":      { text: "👋 Content de te revoir ! On explorait tes domaines. Tu veux continuer ?", suggestions: ["🎯 Reprendre l'exploration des domaines", "🔄 Recommencer depuis le début"] },
  "domains_filter":      { text: "👋 Content de te revoir ! On explorait un domaine en particulier. Tu veux continuer ?", suggestions: ["🎯 Reprendre l'exploration des domaines", "🔄 Recommencer depuis le début"] },
  "specialties_menu":    { text: "👋 Content de te revoir ! On était sur tes spécialités. Tu veux continuer ?", suggestions: ["📚 Reprendre les spécialités", "🔄 Recommencer depuis le début"] },
  "spec_ask_project":    { text: "👋 Content de te revoir ! On allait parler de ton projet pour mieux t'orienter sur les spécialités. Tu veux continuer ?", suggestions: ["📚 Reprendre les spécialités", "🔄 Recommencer depuis le début"] },
  "spec_choose_project": { text: "👋 Content de te revoir ! On définissait ton projet professionnel. Tu veux continuer ?", suggestions: ["📚 Reprendre les spécialités", "🔄 Recommencer depuis le début"] },
  "spec_by_project":     { text: "👋 Content de te revoir ! On avait des recommandations de spécialités selon ton projet. Tu veux continuer ?", suggestions: ["📚 Reprendre les spécialités", "⚖️ Comparer 2 spécialités", "🔄 Recommencer depuis le début"] },
  "spec_no_project":     { text: "👋 Content de te revoir ! On explorait des spécialités basées sur ton profil. Tu veux continuer ?", suggestions: ["📚 Reprendre les spécialités", "🧠 Faire le test RIASEC", "🔄 Recommencer depuis le début"] },
  "spec_abandon":        { text: "👋 Content de te revoir ! On analysait quelle spécialité abandonner en Terminale. Tu veux continuer ?", suggestions: ["❌ Laquelle abandonner ?", "⚖️ Comparer 2 spécialités", "🔄 Recommencer depuis le début"] },
  "spec_compare_pick1":  { text: "👋 Content de te revoir ! On comparait des spécialités. Tu veux continuer ?", suggestions: ["⚖️ Comparer 2 spécialités", "🔄 Recommencer depuis le début"] },
  "spec_compare_pick2":  { text: "👋 Content de te revoir ! On comparait des spécialités. Tu veux continuer ?", suggestions: ["⚖️ Comparer 2 spécialités", "🔄 Recommencer depuis le début"] },
  "spec_compare_result": { text: "👋 Content de te revoir ! On avait comparé des spécialités. Tu veux en comparer d'autres ?", suggestions: ["⚖️ Comparer deux autres", "📚 Retour aux spécialités", "🔄 Recommencer depuis le début"] },
  "studies":             { text: "👋 Content de te revoir ! On explorait les types de formations. Tu veux continuer ?", suggestions: ["🎓 Reprendre l'exploration des études", "🔄 Recommencer depuis le début"] },
  "study_detail":        { text: "👋 Content de te revoir ! On regardait le détail d'une formation. Tu veux continuer ?", suggestions: ["🎓 Reprendre l'exploration des études", "🔄 Recommencer depuis le début"] },
  "parcoursup":          { text: "👋 Content de te revoir ! On discutait de Parcoursup. Tu veux continuer ?", suggestions: ["📋 Reprendre Parcoursup", "❓ Autres questions générales", "🔄 Recommencer depuis le début"] },
  "alternance":          { text: "👋 Content de te revoir ! On parlait de l'alternance. Tu veux continuer ?", suggestions: ["🔄 Reprendre l'alternance", "❓ Autres questions générales", "🔄 Recommencer depuis le début"] },
  "stress":              { text: "👋 Content de te revoir ! On discutait de la gestion du stress d'orientation. Tu veux continuer ?", suggestions: ["😰 Reprendre la gestion du stress", "❓ Autres questions générales", "🔄 Recommencer depuis le début"] },
  "gap_year":            { text: "👋 Content de te revoir ! On parlait de l'année de césure. Tu veux continuer ?", suggestions: ["✈️ Reprendre l'année de césure", "❓ Autres questions générales", "🔄 Recommencer depuis le début"] },
  "international":       { text: "👋 Content de te revoir ! On explorait les études à l'étranger. Tu veux continuer ?", suggestions: ["🌍 Reprendre les études à l'étranger", "❓ Autres questions générales", "🔄 Recommencer depuis le début"] },
  "general":             { text: "👋 Content de te revoir ! On était dans les questions générales. Tu veux continuer ?", suggestions: ["❓ Reprendre les questions générales", "🔄 Recommencer depuis le début"] },
};

/* ================== COMPOSANT ================== */

export default function Chatbot({ userProfile, onNavigate }: ChatbotProps) {
  const savedHistory = loadChatHistory();
  const savedStep = loadChatStep();
  const hasHistory = savedHistory.length > 0;

  // Si historique existant, on ajoute un message de reprise contextuel à la fin
  const initMessages: Message[] = hasHistory
    ? [...savedHistory, { id: "resume_" + Date.now(), text: STEP_RESUME[savedStep]?.text ?? "👋 Content de te revoir ! Par où veux-tu continuer ?", sender: 'bot' as const, suggestions: STEP_RESUME[savedStep]?.suggestions ?? HOME_SUGGESTIONS }]
    : [getInitialMessage()];

  const [messages, setMessages] = useState<Message[]>(initMessages);
  const [step, setStep] = useState<ChatStep>(hasHistory ? savedStep : "home");
  const [input, setInput] = useState('');
  const [selectedStudyType, setSelectedStudyType] = useState<string | null>(null);
  const [compareSpec1, setCompareSpec1] = useState<string | null>(null);
  const [currentDomain, setCurrentDomain] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { saveChatHistory(messages, step); }, [messages, step]);

  const resetConversation = () => {
    setStep("home");
    setCompareSpec1(null);
    setCurrentDomain(null);
    localStorage.removeItem('chatHistory');
    localStorage.removeItem('chatStep');
    setMessages([getInitialMessage()]);
  };

  const backToSpecMenu = (): Message => {
    const grade = userProfile.grade ?? "lycée";
    const specs = userProfile.specialties ?? [];
    setStep("specialties_menu");

    const specLine = specs.length > 0 ? `\nSpécialités enregistrées : **${specs.join(", ")}**` : "";
    let introText: string;
    let suggestions: string[];

    if (grade === "Seconde") {
      introText = `Tu es en Seconde 📚${specLine}\n\nEn Première, tu choisiras 3 spécialités. Que veux-tu savoir ?`;
      suggestions = specs.length > 0
        ? ["📌 Quelles spécialités choisir ?", "🔄 Mes spécialités sont-elles cohérentes ?", "⚖️ Comparer 2 spécialités", "🔙 Retour"]
        : ["📌 Quelles spécialités choisir ?", "⚖️ Comparer 2 spécialités", "🔙 Retour"];
    } else if (grade === "Première") {
      introText = `Tu es en Première 📚${specLine}\n\nEn Terminale, tu abandonneras une de tes 3 spécialités. Que veux-tu faire ?`;
      suggestions = specs.length >= 2
        ? ["📌 Quelles spécialités choisir ?", "❌ Laquelle abandonner en Terminale ?", "⚖️ Comparer 2 spécialités", "🔄 Mes spécialités sont-elles cohérentes ?", "🔙 Retour"]
        : ["📌 Quelles spécialités choisir ?", "⚖️ Comparer 2 spécialités", "🔙 Retour"];
    } else if (grade === "Terminale") {
      introText = `Tu es en Terminale 📚${specLine}\n\nTu as tes 2 spécialités définitives. Que veux-tu savoir ?`;
      suggestions = specs.length >= 2
        ? ["🔄 Mes spécialités sont-elles cohérentes ?", "⚖️ Comparer 2 spécialités", "🔙 Retour"]
        : ["📌 Quelles spécialités choisir ?", "⚖️ Comparer 2 spécialités", "🔙 Retour"];
    } else {
      introText = `Spécialités${specLine} 📚\n\nQue veux-tu savoir ?`;
      suggestions = ["📌 Quelles spécialités choisir ?", "❌ Laquelle abandonner ?", "⚖️ Comparer 2 spécialités", "🔄 Mes spécialités sont-elles cohérentes ?", "🔙 Retour"];
    }

    return { id: Date.now().toString(), text: introText, sender: "bot", suggestions };
  };

  const generateBotResponse = (userMessage: string): Message => {

    /* ===== HOME ===== */
    if (step === "home") {

      if (userMessage.includes("Découvrir mes domaines")) {
        setStep("domains_result");
        const analysis = analyzeDomains(userProfile);
        // Vérifier si on a des données enregistrées pour personnaliser
        // Toujours proposer "Explorer d'autres domaines" dès qu'on a un profil
        const hasSavedData = true;
        const favCareer = careers.find(c => c.id === userProfile.favoriteJobs?.[0]);
        let contextText = `D'après ton profil, tu sembles attiré par :\n\n• ${analysis.domains.join("\n• ")}\n\n${analysis.explanation}`;
        if (favCareer) contextText += `\n\n💼 Métier favori enregistré : **${favCareer.title}**`;
        if (userProfile.specialties?.length) contextText += `\n📚 Spécialités : ${userProfile.specialties.join(", ")}`;
        contextText += "\n\nClique sur un domaine pour l'explorer, ou découvre d'autres domaines 👇";
        const suggestions = [...analysis.domains];
        if (hasSavedData) suggestions.push("🔍 Explorer d'autres domaines");
        suggestions.push("🔄 Revenir au début");
        return {
          id: Date.now().toString(),
          text: contextText,
          sender: "bot",
          suggestions
        };
      }

      if (userMessage.includes("Choix des spécialités")) {
        if (!userProfile.grade) return { id: Date.now().toString(), text: "Je ne trouve pas ta classe. Mets à jour ton profil d'abord !", sender: "bot", suggestions: ["🔄 Revenir au début"] };
        return backToSpecMenu();
      }

      if (userMessage.includes("Explorer les études")) {
        setStep("studies");
        return { id: Date.now().toString(), text: "Quel type de formation veux-tu explorer ? 🎓", sender: "bot", suggestions: ["Licence", "BUT", "BTS", "Prépa", "Ecoles", "Bachelor", "🔄 Revenir au début"] };
      }

      if (userMessage.includes("Questions générales")) {
        setStep("general");
        return { id: Date.now().toString(), text: "Sur quel sujet as-tu des questions ? 💬", sender: "bot", suggestions: ["📋 Parcoursup", "🔄 L'alternance", "😰 Gérer le stress", "✈️ Année de césure", "🌍 Études à l'étranger", "🔄 Revenir au début"] };
      }
    }

    /* ===== DOMAINS RESULT — clic sur un domaine ===== */
    if (step === "domains_result") {
      if (userMessage === "🔄 Revenir au début") { resetConversation(); return { id: Date.now().toString(), text: "", sender: "bot" }; }

      if (userMessage === "🔍 Explorer d'autres domaines" || userMessage === "🔍 Affiner encore") {
        setStep("domains_explore");
        return {
          id: Date.now().toString(),
          text: "Affinons ensemble ! Qu'est-ce qui t'attire le plus ? 🔍",
          sender: "bot",
          suggestions: [
            "🤝 Travailler avec des gens",
            "🔬 Analyser et comprendre",
            "🎨 Créer et innover",
            "🛠️ Construire et réparer",
            "💬 Communiquer et convaincre",
            "🌱 Aider et prendre soin",
            "📊 Organiser et gérer",
            "🔙 Retour"
          ]
        };
      }

      const matchedDomain = Object.keys(DOMAIN_FILTERS).find(d => userMessage === d);
      if (matchedDomain) {
        setStep("domains_filter");
        setCurrentDomain(matchedDomain);
        return {
          id: Date.now().toString(),
          text: `Tu explores le domaine **${matchedDomain}** 🔍\n\nQue veux-tu faire ?`,
          sender: "bot",
          suggestions: ["💼 Voir les métiers de ce domaine", "🎓 Voir les formations de ce domaine", "🔙 Retour aux domaines"]
        };
      }

      return { id: Date.now().toString(), text: "Clique sur un des domaines proposés 👇", sender: "bot" };
    }

    /* ===== DOMAINS FILTER ===== */
    if (step === "domains_filter") {
      if (userMessage.includes("🔙 Retour aux domaines")) {
        setStep("domains_result");
        const analysis = analyzeDomains(userProfile);
        return {
          id: Date.now().toString(),
          text: "Choisis un domaine à explorer 👇",
          sender: "bot",
          suggestions: [...analysis.domains, "🔍 Explorer d'autres domaines", "🔄 Revenir au début"]
        };
      }
      if (userMessage.includes("métiers") && currentDomain) {
        const filter = DOMAIN_FILTERS[currentDomain];
        if (filter?.careerFilter) localStorage.setItem("careerFilter", filter.careerFilter);
        onNavigate("careers");
        return { id: Date.now().toString(), text: `Je t'emmène vers les métiers de "${currentDomain}" 💼`, sender: "bot" };
      }
      if (userMessage.includes("formations") && currentDomain) {
        const filter = DOMAIN_FILTERS[currentDomain];
        if (filter?.formationFilter) localStorage.setItem("formationFilter", filter.formationFilter);
        onNavigate("formations");
        return { id: Date.now().toString(), text: `Je t'emmène vers les formations de "${currentDomain}" 🎓`, sender: "bot" };
      }
    }

    /* ===== DOMAINS EXPLORE — affiner par intérêt ===== */
    if (step === "domains_explore") {
      if (userMessage === "🔙 Retour") {
        setStep("domains_result");
        const analysis = analyzeDomains(userProfile);
        return { id: Date.now().toString(), text: "Choisis un domaine à explorer 👇", sender: "bot", suggestions: [...analysis.domains, "🔍 Explorer d'autres domaines", "🔄 Revenir au début"] };
      }
      const interestToDomains: Record<string, string[]> = {
        "🤝 Travailler avec des gens":    ["Social & Éducation", "Santé", "Commerce & Management"],
        "🔬 Analyser et comprendre":      ["Recherche & Sciences", "Informatique & Numérique", "Ingénierie & Sciences"],
        "🎨 Créer et innover":            ["Art & Culture", "Communication & Design", "Ingénierie & Sciences"],
        "🛠️ Construire et réparer":       ["Ingénierie & Sciences", "Industrie & Technologie", "Informatique & Numérique"],
        "💬 Communiquer et convaincre":   ["Communication & Design", "Commerce & Management", "Administration"],
        "🌱 Aider et prendre soin":       ["Santé", "Social & Éducation", "Agriculture & Env."],
        "📊 Organiser et gérer":          ["Gestion & Finance", "Administration", "Commerce & Management"],
      };
      const domains = interestToDomains[userMessage];
      if (domains) {
        setStep("domains_result");
        return {
          id: Date.now().toString(),
          text: `D'après ce qui t'attire, voici des domaines qui pourraient te correspondre :\n\n• ${domains.join("\n• ")}\n\nClique sur un domaine pour l'explorer 👇`,
          sender: "bot",
          suggestions: [...domains, "🔍 Affiner encore", "🔄 Revenir au début"]
        };
      }
    }

    /* ===== SPECIALTIES MENU ===== */
    if (step === "specialties_menu") {
      if (userMessage === "🔙 Retour") { resetConversation(); return { id: Date.now().toString(), text: "", sender: "bot" }; }

      if (userMessage.includes("Quelles spécialités choisir")) {
        setStep("spec_ask_project");
        const favCareer = careers.find(c => c.id === userProfile.favoriteJobs?.[0]);
        if (favCareer) {
          return {
            id: Date.now().toString(),
            text: `Pour te conseiller sur les spécialités, j'ai besoin de connaître ton projet 🎯\n\nD'après ton profil, ton métier favori est : **${favCareer.title}** (${favCareer.sector})\n\nEst-ce que c'est toujours ton projet ou tu veux en choisir un autre ?`,
            sender: "bot",
            suggestions: ["✅ Oui, c'est mon projet", "🔄 Non, je veux choisir un autre projet", "🤔 J'ai une vague idée", "❌ Pas du tout"]
          };
        }
        return {
          id: Date.now().toString(),
          text: "Pour te conseiller au mieux sur les spécialités, as-tu déjà une idée de ce que tu veux faire après le bac ? 🎯",
          sender: "bot",
          suggestions: ["✅ Oui, j'ai un projet", "🤔 J'ai une vague idée", "❌ Pas du tout"]
        };
      }

      if (userMessage.includes("abandonner")) {
        const specs = userProfile.specialties;
        if (!specs || specs.length < 2) return { id: Date.now().toString(), text: "Je n'ai pas tes spécialités enregistrées. Mets à jour ton profil !", sender: "bot", suggestions: ["🔙 Retour"] };
        setStep("spec_abandon");
        return { id: Date.now().toString(), text: getAbandonRecommendation(specs, userProfile), sender: "bot", suggestions: ["⚖️ Comparer 2 spécialités", "🔄 Revenir au début"] };
      }

      if (userMessage.includes("Comparer")) {
        setStep("spec_compare_pick1");
        return { id: Date.now().toString(), text: "Quelle est la 1ère spécialité à comparer ?", sender: "bot", suggestions: [...ALL_SPECIALTIES, "🔙 Retour"] };
      }

      if (userMessage.includes("cohérentes")) {
        setStep("spec_coherence");
        const specs = userProfile.specialties;
        if (!specs?.length) return { id: Date.now().toString(), text: "Je n'ai pas tes spécialités enregistrées.", sender: "bot", suggestions: ["🔙 Retour"] };
        // Demander le projet si pas encore défini pour une analyse précise
        const favCareer = careers.find(c => c.id === userProfile.favoriteJobs?.[0]);
        const sector = favCareer?.sector;
        if (!sector) {
          return {
            id: Date.now().toString(),
            text: `Tes spécialités enregistrées : **${specs.join(", ")}**\n\nPour vérifier si elles sont cohérentes, j'ai besoin de connaître ton projet. Quel est-il ? 🎯`,
            sender: "bot",
            suggestions: [...Object.keys(PROJECT_EXAMPLES), "🔙 Retour"]
          };
        }
        const recommended = sectorToSpecialties[sector] ?? [];
        const matching = specs.filter(s => recommended.includes(s));
        const missing = recommended.filter(s => !specs.includes(s));
        const text = matching.length === 0
          ? `Tes spécialités (${specs.join(", ")}) semblent peu alignées avec "${sector}".\nLes spécialités recommandées sont : ${recommended.join(", ")}.`
          : missing.length === 0
          ? `✅ Tes spécialités (${specs.join(", ")}) sont parfaitement cohérentes avec ton projet "${sector}" !`
          : `👍 ${matching.join(", ")} sont cohérentes avec "${sector}".\nTu pourrais aussi envisager : ${missing.join(", ")}.`;
        return { id: Date.now().toString(), text, sender: "bot", suggestions: ["🔙 Retour"] };
      }

      // Gérer le clic sur un projet depuis "cohérentes" (quand pas de secteur défini)
      const projectFromCoherence = PROJECT_EXAMPLES[userMessage];
      if (projectFromCoherence) {
        const specs = userProfile.specialties ?? [];
        const recommended = sectorToSpecialties[projectFromCoherence.sector] ?? [];
        const matching = specs.filter(s => recommended.includes(s));
        const missing = recommended.filter(s => !specs.includes(s));
        const text = specs.length === 0
          ? `Pour un projet **${projectFromCoherence.label}**, les spécialités recommandées sont : ${recommended.join(", ")}.`
          : matching.length === 0
          ? `Tes spécialités (${specs.join(", ")}) semblent peu alignées avec "${projectFromCoherence.label}".\nSpécialités recommandées : ${recommended.join(", ")}.`
          : missing.length === 0
          ? `✅ Tes spécialités (${specs.join(", ")}) sont parfaitement cohérentes avec "${projectFromCoherence.label}" !`
          : `👍 ${matching.join(", ")} sont cohérentes avec "${projectFromCoherence.label}".\nTu pourrais aussi envisager : ${missing.join(", ")}.`;
        return { id: Date.now().toString(), text, sender: "bot", suggestions: ["🔙 Retour"] };
      }
    }

    /* ===== SPEC COHERENCE — clic sur un projet pour analyser ===== */
    if (step === "spec_coherence") {
      const projectSelected = PROJECT_EXAMPLES[userMessage];
      if (projectSelected) {
        const specs = userProfile.specialties ?? [];
        const recommended = sectorToSpecialties[projectSelected.sector] ?? [];
        const matching = specs.filter(s => recommended.includes(s));
        const missing = recommended.filter(s => !specs.includes(s));
        const text = specs.length === 0
          ? `Pour un projet **${projectSelected.label}**, les spécialités recommandées sont : ${recommended.join(", ")}.`
          : matching.length === 0
          ? `Tes spécialités (${specs.join(", ")}) semblent peu alignées avec "${projectSelected.label}".
Spécialités recommandées : ${recommended.join(", ")}.`
          : missing.length === 0
          ? `✅ Tes spécialités (${specs.join(", ")}) sont parfaitement cohérentes avec "${projectSelected.label}" !`
          : `👍 ${matching.join(", ")} sont cohérentes avec "${projectSelected.label}".
Tu pourrais aussi envisager : ${missing.join(", ")}.`;
        setStep("specialties_menu");
        return { id: Date.now().toString(), text, sender: "bot", suggestions: ["🔙 Retour"] };
      }
      if (userMessage === "🔙 Retour") { return backToSpecMenu(); }
    }

    /* ===== SPEC ASK PROJECT ===== */
    if (step === "spec_ask_project") {
      // Confirmation du métier favori déjà dans le profil
      if (userMessage === "✅ Oui, c'est mon projet") {
        const favCareer = careers.find(c => c.id === userProfile.favoriteJobs?.[0]);
        if (favCareer) {
          setStep("spec_by_project");
          const favSector = favCareer.sector;
          const recommended = sectorToSpecialties[favSector] ?? ["Maths", "SES"];
          return {
            id: Date.now().toString(),
            text: `Super ! Pour ton projet **${favCareer.title}** (${favSector}), voici les spécialités recommandées :

• ${recommended.join("\n• ")}\n\nClique sur une spécialité pour en savoir plus :`,
            sender: "bot",
            suggestions: [...recommended, "⚖️ Comparer 2 spécialités", "🔙 Retour"]
          };
        }
      }
      if (userMessage === "🔄 Non, je veux choisir un autre projet" || userMessage === "✅ Oui, j'ai un projet") {
        setStep("spec_choose_project");
        return {
          id: Date.now().toString(),
          text: "Quel est ton projet ? Choisis celui qui te correspond le mieux ou tape-le librement 👇",
          sender: "bot",
          suggestions: [...Object.keys(PROJECT_EXAMPLES), "🔙 Retour"]
        };
      }
      if (userMessage === "🤔 J'ai une vague idée") {
        setStep("spec_choose_project");
        return {
          id: Date.now().toString(),
          text: "Pas de souci ! Quel domaine t'attire le plus ? Tu peux choisir parmi ces exemples ou me décrire ton idée 👇",
          sender: "bot",
          suggestions: [...Object.keys(PROJECT_EXAMPLES), "🔙 Retour"]
        };
      }
      if (userMessage === "❌ Pas du tout") {
        setStep("spec_no_project");
        const riasecSpecs = userProfile.riasecProfile?.length
          ? getSpecialtiesFromRiasec(userProfile.riasecProfile)
          : null;
        const interestSpecs = userProfile.interests?.flatMap(i =>
          i === "tech" ? ["NSI", "Maths"] : i === "science" ? ["Maths", "SVT"] :
          i === "art" ? ["Arts"] : i === "social" ? ["SES", "HGGSP"] :
          i === "health" ? ["SVT", "Physique-Chimie"] : []
        ).filter((v, i, a) => a.indexOf(v) === i).slice(0, 4);

        const recommended = riasecSpecs ?? interestSpecs ?? ["Maths", "SES", "HGGSP"];
        return {
          id: Date.now().toString(),
          text: `Pas de problème, c'est tout à fait normal ! 😊\n\n${riasecSpecs ? "D'après ton profil RIASEC" : "D'après tes centres d'intérêt"}, voici les spécialités qui correspondent le mieux à qui tu es :\n\n• ${recommended.join("\n• ")}\n\nClique sur une spécialité pour en savoir plus :`,
          sender: "bot",
          suggestions: [...recommended, "🧠 Faire le test RIASEC", "🔙 Retour"]
        };
      }
    }

    /* ===== SPEC CHOOSE PROJECT ===== */
    if (step === "spec_choose_project") {
      if (userMessage === "🔙 Retour") { return backToSpecMenu(); }

      const project = PROJECT_EXAMPLES[userMessage];
      if (project) {
        setStep("spec_by_project");
        return {
          id: Date.now().toString(),
          text: `Pour un projet en **${project.label}**, voici les spécialités recommandées :\n\n• ${project.specialties.join("\n• ")}\n\nClique sur une spécialité pour en savoir plus :`,
          sender: "bot",
          suggestions: [...project.specialties, "⚖️ Comparer 2 spécialités", "🔙 Retour"]
        };
      }

      // Texte libre — essayer de trouver un projet proche
      const matchKey = Object.keys(PROJECT_EXAMPLES).find(k =>
        k.toLowerCase().includes(userMessage.toLowerCase()) ||
        userMessage.toLowerCase().includes(PROJECT_EXAMPLES[k].label.toLowerCase())
      );
      if (matchKey) {
        const project = PROJECT_EXAMPLES[matchKey];
        setStep("spec_by_project");
        return {
          id: Date.now().toString(),
          text: `Pour un projet en **${project.label}**, voici les spécialités recommandées :\n\n• ${project.specialties.join("\n• ")}\n\nClique sur une spécialité pour en savoir plus :`,
          sender: "bot",
          suggestions: [...project.specialties, "⚖️ Comparer 2 spécialités", "🔙 Retour"]
        };
      }

      return {
        id: Date.now().toString(),
        text: "Je n'ai pas reconnu ce projet. Choisis dans la liste ou clique sur 🔙 Retour 👇",
        sender: "bot",
        suggestions: [...Object.keys(PROJECT_EXAMPLES), "🔙 Retour"]
      };
    }

    /* ===== SPEC BY PROJECT ===== */
    if (step === "spec_by_project") {
      if (userMessage === "🔙 Retour") { return backToSpecMenu(); }
      if (userMessage.includes("Comparer")) {
        setStep("spec_compare_pick1");
        return { id: Date.now().toString(), text: "Quelle est la 1ère spécialité à comparer ?", sender: "bot", suggestions: [...ALL_SPECIALTIES, "🔙 Retour"] };
      }
      if (defSpecialties[userMessage]) {
        return { id: Date.now().toString(), text: `📚 **${userMessage}**\n\n${defSpecialties[userMessage]}`, sender: "bot", suggestions: ["🔙 Retour"] };
      }
    }

    /* ===== SPEC NO PROJECT — clic sur une spécialité ===== */
    if (step === "spec_no_project") {
      if (userMessage === "🔙 Retour") { return backToSpecMenu(); }
      if (userMessage.includes("test RIASEC")) { onNavigate("riasec-test"); return { id: Date.now().toString(), text: "Je t'emmène vers le test RIASEC 🧠", sender: "bot" }; }
      if (defSpecialties[userMessage]) {
        return { id: Date.now().toString(), text: `📚 **${userMessage}**\n\n${defSpecialties[userMessage]}`, sender: "bot", suggestions: ["🔙 Retour"] };
      }
    }

    /* ===== SPEC ABANDON ===== */
    if (step === "spec_abandon") {
      if (userMessage.includes("Comparer")) {
        setStep("spec_compare_pick1");
        return { id: Date.now().toString(), text: "Quelle est la 1ère spécialité à comparer ?", sender: "bot", suggestions: [...ALL_SPECIALTIES, "🔙 Retour"] };
      }
      if (userMessage === "🔄 Revenir au début") { resetConversation(); return { id: Date.now().toString(), text: "", sender: "bot" }; }
    }

    /* ===== SPEC COMPARE PICK 1 ===== */
    if (step === "spec_compare_pick1") {
      if (userMessage === "🔙 Retour") { return backToSpecMenu(); }
      if (ALL_SPECIALTIES.includes(userMessage)) {
        setCompareSpec1(userMessage);
        setStep("spec_compare_pick2");
        return {
          id: Date.now().toString(),
          text: `OK, ${userMessage} vs... quelle autre spécialité ?`,
          sender: "bot",
          suggestions: [...ALL_SPECIALTIES.filter(s => s !== userMessage), "🔙 Retour"]
        };
      }
    }

    /* ===== SPEC COMPARE PICK 2 ===== */
    if (step === "spec_compare_pick2") {
      if (userMessage === "🔙 Retour") { return backToSpecMenu(); }
      if (compareSpec1 && ALL_SPECIALTIES.includes(userMessage)) {
        setStep("spec_compare_result");
        return {
          id: Date.now().toString(),
          text: compareTwo(compareSpec1, userMessage, userProfile),
          sender: "bot",
          suggestions: ["⚖️ Comparer deux autres", "🔙 Retour"]
        };
      }
    }

    /* ===== SPEC COMPARE RESULT ===== */
    if (step === "spec_compare_result") {
      if (userMessage.includes("Comparer deux autres")) {
        setCompareSpec1(null);
        setStep("spec_compare_pick1");
        return { id: Date.now().toString(), text: "Quelle est la 1ère spécialité à comparer ?", sender: "bot", suggestions: [...ALL_SPECIALTIES, "🔙 Retour"] };
      }
      if (userMessage === "🔙 Retour") { return backToSpecMenu(); }
    }

    /* ===== DEF SPEC (depuis spec_by_project ou spec_no_project) ===== */
    if (step === "DefSpec") {
      if (userMessage === "🔙 Retour") { resetConversation(); return { id: Date.now().toString(), text: "", sender: "bot" }; }
      if (defSpecialties[userMessage]) return { id: Date.now().toString(), text: `📚 ${userMessage}\n\n${defSpecialties[userMessage]}`, sender: "bot", suggestions: ["🔙 Retour"] };
    }

    /* ===== SEND TO RIASEC ===== */
    if (step === "send_to_riasec") {
      if (userMessage.includes("test RIASEC")) { onNavigate("riasec-test"); return { id: Date.now().toString(), text: "Je t'emmène vers le test RIASEC 🧠", sender: "bot" }; }
      if (userMessage === "🔙 Retour") { resetConversation(); return { id: Date.now().toString(), text: "", sender: "bot" }; }
    }

    /* ===== STUDIES ===== */
    if (step === "studies") {
      if (userMessage === "🔄 Revenir au début") { resetConversation(); return { id: Date.now().toString(), text: "", sender: "bot" }; }
      const studyKey = Object.keys(studyData).find(k => userMessage === k);
      if (studyKey) {
        setSelectedStudyType(studyKey);
        setStep("study_detail");
        const info = studyData[studyKey];
        return { id: Date.now().toString(), text: `📚 ${studyKey}\n\n⏱️ Durée : ${info.duration}\n\n📋 Niveau requis : ${info.level}\n\n👤 Profil type : ${info.profile}\n\n✅ Avantages : ${info.advantages}\n\n🎯 Débouchés : ${info.outcomes}`, sender: "bot", suggestions: ["🌍 Voir les formations liées", "🔄 Retour formations"] };
      }
    }

    /* ===== STUDY DETAIL ===== */
    if (step === "study_detail") {
      if (userMessage.includes("formations")) {
        if (selectedStudyType) {
          // Mapper le type de formation vers un domaine réel de formations_final.json
          const typeToSearchTerm: Record<string, string> = {
            "Licence":  "Licence",
            "BUT":      "BUT",
            "BTS":      "BTS",
            "Prépa":    "Prépa",
            "École":    "École",
            "Bachelor": "Bachelor",
          };
          const ft = studyData[selectedStudyType]?.formationType;
          if (ft) {
            const searchVal = typeToSearchTerm[ft] ?? ft;
            // On utilise searchTerm (barre de recherche) pour les types de formation
            // car ils sont dans le titre (ex: "BTS Commerce", "Licence Informatique")
            localStorage.setItem("formationSearchTerm", searchVal);
          }
        }
        onNavigate("formations");
        return { id: Date.now().toString(), text: "Je t'affiche les formations correspondantes 🎓", sender: "bot" };
      }
      if (userMessage.includes("Retour formations")) {
        setStep("studies");
        return { id: Date.now().toString(), text: "Quel type de formation veux-tu explorer ? 🎓", sender: "bot", suggestions: ["Licence", "BUT", "BTS", "Prépa", "Ecoles", "Bachelor", "🔄 Revenir au début"] };
      }
    }

    /* ===== GENERAL ===== */
    if (step === "general") {
      if (userMessage === "🔄 Revenir au début") { resetConversation(); return { id: Date.now().toString(), text: "", sender: "bot" }; }
      const generalSugg = ["📋 Parcoursup", "🔄 L'alternance", "😰 Gérer le stress", "✈️ Année de césure", "🌍 Études à l'étranger", "🔄 Revenir au début"];
      if (userMessage.includes("Parcoursup")) { setStep("parcoursup"); return { id: Date.now().toString(), text: "📋 Parcoursup — Que veux-tu savoir ?", sender: "bot", suggestions: ["📅 Les dates clés", "✍️ Comment rédiger ma lettre de motivation ?", "📊 Comment fonctionne l'algorithme ?", "💔 J'ai été refusé partout", "🔙 Retour"] }; }
      if (userMessage.includes("alternance")) { setStep("alternance"); return { id: Date.now().toString(), text: "🔄 L'alternance — Que veux-tu savoir ?", sender: "bot", suggestions: ["❓ C'est quoi l'alternance ?", "✅ Avantages et inconvénients", "🔍 Comment trouver une entreprise ?", "📚 Quelles formations en alternance ?", "🔙 Retour"] }; }
      if (userMessage.includes("stress")) { setStep("stress"); return { id: Date.now().toString(), text: "😰 Gérer le stress — Que veux-tu savoir ?", sender: "bot", suggestions: ["😟 Je ne sais pas quoi choisir", "😰 J'ai peur de me tromper", "💪 Comment rester motivé ?", "🔙 Retour"] }; }
      if (userMessage.includes("césure")) { setStep("gap_year"); return { id: Date.now().toString(), text: "✈️ L'année de césure — Que veux-tu savoir ?", sender: "bot", suggestions: ["❓ C'est quoi une année de césure ?", "✅ Avantages et risques", "📝 Comment la préparer ?", "🔙 Retour"] }; }
      if (userMessage.includes("étranger")) { setStep("international"); return { id: Date.now().toString(), text: "🌍 Études à l'étranger — Que veux-tu savoir ?", sender: "bot", suggestions: ["🇪🇺 Programme Erasmus", "💰 Comment financer ?", "🎓 Reconnaissance des diplômes", "🔙 Retour"] }; }
    }

    const backToGeneral = (): Message => ({ id: Date.now().toString(), text: "Sur quel sujet as-tu des questions ?", sender: "bot", suggestions: ["📋 Parcoursup", "🔄 L'alternance", "😰 Gérer le stress", "✈️ Année de césure", "🌍 Études à l'étranger", "🔄 Revenir au début"] });

    /* ===== PARCOURSUP ===== */
    if (step === "parcoursup") {
      if (userMessage === "🔙 Retour") { setStep("general"); return backToGeneral(); }
      if (userMessage.includes("dates")) return { id: Date.now().toString(), text: "📅 Dates clés de Parcoursup :\n\n• Janvier : ouverture de la plateforme\n• Janvier–Mars : formulation des vœux (max 10)\n• Début avril : finaliser dossier et lettres\n• Mi-mai : début des réponses\n• Juin : phase principale\n• Juillet–Septembre : phase complémentaire", sender: "bot", suggestions: ["✍️ Comment rédiger ma lettre de motivation ?", "🔙 Retour"] };
      if (userMessage.includes("lettre")) return { id: Date.now().toString(), text: "✍️ Rédiger ta lettre de motivation :\n\n1. Présente ton parcours et tes spécialités\n2. Explique pourquoi cette formation t'intéresse\n3. Montre que tu connais la formation\n4. Parle de ton projet professionnel\n5. Reste authentique !\n\n💡 Adapte chaque lettre à chaque formation.", sender: "bot", suggestions: ["📊 Comment fonctionne l'algorithme ?", "🔙 Retour"] };
      if (userMessage.includes("algorithme")) return { id: Date.now().toString(), text: "📊 L'algorithme Parcoursup :\n\nChaque formation classe les candidats selon :\n• Les notes scolaires\n• La cohérence du profil\n• La lettre de motivation\n• Les activités extrascolaires\n\n⚠️ Chaque formation classe différemment.", sender: "bot", suggestions: ["💔 J'ai été refusé partout", "🔙 Retour"] };
      if (userMessage.includes("refusé")) return { id: Date.now().toString(), text: "💔 Tu as été refusé partout ?\n\n1. 📋 Phase complémentaire en juillet\n2. 📞 Contacter directement les formations\n3. 🔄 Réorientation : BTS, BUT, prépa privée\n4. 💼 Alternance\n5. ✈️ Année de césure\n\n💡 Ce n'est pas une fin — beaucoup de parcours commencent par un refus !", sender: "bot", suggestions: ["🔙 Retour"] };
    }

    /* ===== ALTERNANCE ===== */
    if (step === "alternance") {
      if (userMessage === "🔙 Retour") { setStep("general"); return backToGeneral(); }
      if (userMessage.includes("C'est quoi")) return { id: Date.now().toString(), text: "🔄 L'alternance, c'est quoi ?\n\nFormation qui alterne entre école et entreprise.\n\n📄 Contrat d'apprentissage : moins de 30 ans, rémunéré, école gratuite\n📄 Contrat de professionnalisation : plus flexible, tous âges", sender: "bot", suggestions: ["✅ Avantages et inconvénients", "🔙 Retour"] };
      if (userMessage.includes("Avantages")) return { id: Date.now().toString(), text: "✅ Avantages :\n• 💰 Rémunéré pendant les études\n• 🎓 Formation gratuite\n• 💼 Expérience réelle\n• 🤝 Réseau professionnel\n\n⚠️ Inconvénients :\n• Rythme soutenu\n• Trouver une entreprise prend du temps", sender: "bot", suggestions: ["🔍 Comment trouver une entreprise ?", "🔙 Retour"] };
      if (userMessage.includes("trouver")) return { id: Date.now().toString(), text: "🔍 Trouver une entreprise :\n\n1. Indeed, LinkedIn, alternance.emploi.gouv.fr\n2. Candidatures spontanées\n3. Réseau famille/amis\n4. Forums alternance\n\n📅 Commence dès janvier-mars !", sender: "bot", suggestions: ["📚 Quelles formations en alternance ?", "🔙 Retour"] };
      if (userMessage.includes("formations")) return { id: Date.now().toString(), text: "📚 Formations en alternance :\n• BTS (2 ans)\n• BUT (3 ans)\n• Bachelor (3 ans)\n• Licence Pro (1 an après bac+2)\n• Master (2 ans)\n• Écoles d'ingénieurs et de commerce", sender: "bot", suggestions: ["🎓 Voir les formations", "🔙 Retour"] };
      if (userMessage.includes("Voir les formations")) { onNavigate("formations"); return { id: Date.now().toString(), text: "Je t'emmène vers les formations 🎓", sender: "bot" }; }
    }

    /* ===== STRESS ===== */
    if (step === "stress") {
      if (userMessage === "🔙 Retour") { setStep("general"); return backToGeneral(); }
      if (userMessage.includes("ne sais pas")) return { id: Date.now().toString(), text: "😟 C'est totalement normal !\n\n1. 🧠 Fais le test RIASEC\n2. 💭 Pense à ce que tu aimes faire\n3. 🔍 Explore des métiers\n4. 👥 Parle à des professionnels\n5. 🎯 Commence par une formation généraliste", sender: "bot", suggestions: ["🧠 Faire le test RIASEC", "🔙 Retour"] };
      if (userMessage.includes("peur")) return { id: Date.now().toString(), text: "😰 Tu as peur de te tromper ?\n\n• 40% des étudiants se réorientent — c'est OK !\n• Il n'existe pas de voie sans retour\n• Les compétences acquises ne sont jamais perdues\n\n💡 Un mauvais choix corrigé vaut mieux qu'une paralysie.", sender: "bot", suggestions: ["💪 Comment rester motivé ?", "🔙 Retour"] };
      if (userMessage.includes("motivé")) return { id: Date.now().toString(), text: "💪 Rester motivé :\n\n1. 🎯 Fixe des petits objectifs\n2. 📓 Note tes intérêts\n3. 🤝 Parle de ton projet\n4. 🌟 Célèbre chaque avancée\n5. 📱 Utilise Oriento !\n\n💡 L'orientation c'est un chemin, pas une destination.", sender: "bot", suggestions: ["🔙 Retour"] };
      if (userMessage.includes("test RIASEC")) { onNavigate("riasec-test"); return { id: Date.now().toString(), text: "Je t'emmène vers le test RIASEC 🧠", sender: "bot" }; }
    }

    /* ===== GAP YEAR ===== */
    if (step === "gap_year") {
      if (userMessage === "🔙 Retour") { setStep("general"); return backToGeneral(); }
      if (userMessage.includes("C'est quoi")) return { id: Date.now().toString(), text: "✈️ L'année de césure :\n\nPause dans les études pour :\n• 🌍 Voyager\n• 💼 Travailler / stages\n• 🎯 Clarifier son projet\n• 🧠 Se former autrement\n\nDe quelques mois à 1 an, avant ou pendant les études.", sender: "bot", suggestions: ["✅ Avantages et risques", "🔙 Retour"] };
      if (userMessage.includes("Avantages")) return { id: Date.now().toString(), text: "✅ Avantages :\n• Maturité et confiance\n• Clarification du projet\n• CV enrichi\n\n⚠️ Risques :\n• Perte de rythme\n• Coût financier\n• Nécessite d'être bien préparée", sender: "bot", suggestions: ["📝 Comment la préparer ?", "🔙 Retour"] };
      if (userMessage.includes("préparer")) return { id: Date.now().toString(), text: "📝 Préparer sa césure :\n\n1. 🎯 Définis tes objectifs\n2. 💰 Prépare un budget\n3. 📋 Informe ton école à l'avance\n4. 🔍 Programmes : SVE, WWOOF, volontariat\n5. 📅 Planifie avec flexibilité", sender: "bot", suggestions: ["🔙 Retour"] };
    }

    /* ===== INTERNATIONAL ===== */
    if (step === "international") {
      if (userMessage === "🔙 Retour") { setStep("general"); return backToGeneral(); }
      if (userMessage.includes("Erasmus")) return { id: Date.now().toString(), text: "🇪🇺 Programme Erasmus :\n\n• 33 pays européens\n• 3 mois à 1 an\n• Bourse 200-500€/mois\n• Notes reconnues dans ton université\n\n➡️ Renseigne-toi au bureau des relations internationales de ton école dès la 1ère année.", sender: "bot", suggestions: ["💰 Comment financer ?", "🔙 Retour"] };
      if (userMessage.includes("financer")) return { id: Date.now().toString(), text: "💰 Financer ses études à l'étranger :\n\n• 🇪🇺 Bourse Erasmus+\n• 🏛️ Bourses gouvernement français\n• 🏦 Aides régions/départements\n• 🎓 Bourses université d'accueil\n• 💼 Travail sur place\n\n💡 Commence à chercher 1 an avant !", sender: "bot", suggestions: ["🎓 Reconnaissance des diplômes", "🔙 Retour"] };
      if (userMessage.includes("diplômes")) return { id: Date.now().toString(), text: "🎓 Reconnaissance des diplômes :\n\n• 🇪🇺 Système LMD commun à 49 pays en Europe\n• 📄 Supplément au diplôme facilite la reconnaissance\n• 🔍 Vérifie dans le pays cible avant de partir\n• 🏛️ Campus France peut t'aider\n\n💡 Les grandes écoles françaises sont reconnues mondialement !", sender: "bot", suggestions: ["🔙 Retour"] };
    }

    /* ===== DEFAULT ===== */
    return {
      id: Date.now().toString(),
      text: "Je n'ai pas compris. Choisis une des options ci-dessous 👇",
      sender: "bot",
      suggestions: ["🔄 Revenir au début"]
    };
  };

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    const userMessage: Message = { id: Date.now().toString(), text, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setTimeout(() => {
      const botResponse = generateBotResponse(text);
      if (botResponse.text !== "") setMessages(prev => [...prev, botResponse]);
    }, 400);
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (suggestion === "🔄 Revenir au début" || suggestion === "🔄 Recommencer depuis le début") { resetConversation(); return; }

    // Reprises contextuelles → on redirige vers le bon step sans ajouter de message utilisateur
    if (suggestion === "🎯 Reprendre l'exploration des domaines") {
      setStep("domains_result");
      const analysis = analyzeDomains(userProfile);
      const msg: Message = { id: Date.now().toString(), text: "Voici tes domaines recommandés. Clique sur l'un d'eux pour explorer 👇", sender: 'bot', suggestions: [...analysis.domains, "🔄 Recommencer depuis le début"] };
      setMessages(prev => [...prev, msg]);
      return;
    }
    if (suggestion === "📚 Reprendre les spécialités" || suggestion === "📚 Retour aux spécialités") {
      const grade = userProfile.grade ?? "lycée";
      setStep("specialties_menu");
      const suggestions =
        grade === "Seconde"  ? ["📌 Quelles spécialités choisir ?", "🔄 Mes spécialités sont-elles cohérentes ?", "🔙 Retour"] :
        grade === "Première" ? ["📌 Quelles spécialités choisir ?", "❌ Laquelle abandonner en Terminale ?", "⚖️ Comparer 2 spécialités", "🔄 Mes spécialités sont-elles cohérentes ?", "🔙 Retour"] :
                               ["📌 Quelles spécialités choisir ?", "❌ Laquelle abandonner ?", "⚖️ Comparer 2 spécialités", "🔄 Mes spécialités sont-elles cohérentes ?", "🔙 Retour"];
      const msg: Message = { id: Date.now().toString(), text: `Tu es en ${grade} 📚

Que veux-tu savoir sur les spécialités ?`, sender: 'bot', suggestions };
      setMessages(prev => [...prev, msg]);
      return;
    }
    if (suggestion === "🎓 Reprendre l'exploration des études") {
      setStep("studies");
      const msg: Message = { id: Date.now().toString(), text: "Quel type de formation veux-tu explorer ? 🎓", sender: 'bot', suggestions: ["Licence", "BUT", "BTS", "Prépa", "Ecoles", "Bachelor", "🔄 Recommencer depuis le début"] };
      setMessages(prev => [...prev, msg]);
      return;
    }
    if (suggestion === "❓ Reprendre les questions générales" || suggestion === "❓ Autres questions générales") {
      setStep("general");
      const msg: Message = { id: Date.now().toString(), text: "Sur quel sujet as-tu des questions ? 💬", sender: 'bot', suggestions: ["📋 Parcoursup", "🔄 L'alternance", "😰 Gérer le stress", "✈️ Année de césure", "🌍 Études à l'étranger", "🔄 Recommencer depuis le début"] };
      setMessages(prev => [...prev, msg]);
      return;
    }
    if (suggestion === "📋 Reprendre Parcoursup") {
      setStep("parcoursup");
      const msg: Message = { id: Date.now().toString(), text: "📋 Parcoursup — Que veux-tu savoir ?", sender: 'bot', suggestions: ["📅 Les dates clés", "✍️ Comment rédiger ma lettre de motivation ?", "📊 Comment fonctionne l'algorithme ?", "💔 J'ai été refusé partout", "🔙 Retour"] };
      setMessages(prev => [...prev, msg]);
      return;
    }
    if (suggestion === "🔄 Reprendre l'alternance") {
      setStep("alternance");
      const msg: Message = { id: Date.now().toString(), text: "🔄 L'alternance — Que veux-tu savoir ?", sender: 'bot', suggestions: ["❓ C'est quoi l'alternance ?", "✅ Avantages et inconvénients", "🔍 Comment trouver une entreprise ?", "📚 Quelles formations en alternance ?", "🔙 Retour"] };
      setMessages(prev => [...prev, msg]);
      return;
    }
    if (suggestion === "😰 Reprendre la gestion du stress") {
      setStep("stress");
      const msg: Message = { id: Date.now().toString(), text: "😰 Gérer le stress — Que veux-tu savoir ?", sender: 'bot', suggestions: ["😟 Je ne sais pas quoi choisir", "😰 J'ai peur de me tromper", "💪 Comment rester motivé ?", "🔙 Retour"] };
      setMessages(prev => [...prev, msg]);
      return;
    }
    if (suggestion === "✈️ Reprendre l'année de césure") {
      setStep("gap_year");
      const msg: Message = { id: Date.now().toString(), text: "✈️ L'année de césure — Que veux-tu savoir ?", sender: 'bot', suggestions: ["❓ C'est quoi une année de césure ?", "✅ Avantages et risques", "📝 Comment la préparer ?", "🔙 Retour"] };
      setMessages(prev => [...prev, msg]);
      return;
    }
    if (suggestion === "🌍 Reprendre les études à l'étranger") {
      setStep("international");
      const msg: Message = { id: Date.now().toString(), text: "🌍 Études à l'étranger — Que veux-tu savoir ?", sender: 'bot', suggestions: ["🇪🇺 Programme Erasmus", "💰 Comment financer ?", "🎓 Reconnaissance des diplômes", "🔙 Retour"] };
      setMessages(prev => [...prev, msg]);
      return;
    }

    handleSend(suggestion);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">

      {/* HEADER */}
      <div className="p-4 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-800">Oriento</h2>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <p className="text-xs text-green-600 font-medium">En ligne</p>
              </div>
            </div>
          </div>
          <button onClick={resetConversation} className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors" title="Recommencer">
            <RotateCcw className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-28">
        {messages.map((message) => (
          <div key={message.id}>
            <div className={`flex items-end gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {message.sender === 'bot' && (
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center flex-shrink-0 mb-1 shadow-sm">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              )}
              <div className={`max-w-[78%] rounded-2xl px-4 py-3 shadow-sm ${message.sender === 'user' ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-br-sm' : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'}`}>
                <p className="text-sm leading-relaxed whitespace-pre-line">{message.text}</p>
              </div>
            </div>

            {/* ✅ Boutons affichés sur TOUS les messages (pas seulement le dernier) */}
            {message.suggestions && message.suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 ml-10">
                {message.suggestions.map((suggestion, idx) => {
                  const isLast = message.id === messages[messages.length - 1].id;
                  return (
                    <button
                      key={idx}
                      onClick={() => isLast && handleSuggestionClick(suggestion)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        isLast
                          ? "bg-white border border-primary-200 text-primary-600 hover:bg-primary-50 hover:border-primary-400 shadow-sm active:scale-95"
                          : "bg-gray-100 text-gray-400 border border-gray-200 cursor-default"
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
      <div className="p-4 bg-white border-t border-gray-100 shadow-lg">
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
            placeholder="Pose-moi une question..."
            className="flex-1 px-4 py-3 bg-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-300 text-sm transition-all"
          />
          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim()}
            className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl flex items-center justify-center disabled:opacity-40 shadow-md active:scale-95 transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}