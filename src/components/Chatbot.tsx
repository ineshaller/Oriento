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

interface StudyLink {
  label: string;        // nom affiché
  searchTerm: string;   // terme à mettre dans la barre de recherche formations
  recommended?: boolean; // très recommandée
}

interface SpecInfo {
  desc: string;
  themes: string[];
  studyLinks: StudyLink[]; // études avec bouton de recherche direct
  searchTerms: string[];
}

const SPEC_DATA: Record<string, SpecInfo> = {
  "Maths": {
    desc: "Approfondissement du raisonnement logique, calculs, probabilités et algorithmique. Programme : Algèbre, Analyse, Géométrie, Probabilités-statistiques, Algorithmique. Indispensable pour de très nombreuses filières — quasi-obligatoire pour ingénieur, médecine ou école de commerce.",
    themes: ["Algèbre", "Analyse", "Géométrie", "Probabilités et statistiques", "Algorithmique et programmation"],
    studyLinks: [
      { label: "Médecine / Pharmacie (PASS ou LAS)", searchTerm: "Médecine", recommended: true },
      { label: "Prépa scientifique : MPSI, PCSI, MP2I…", searchTerm: "Prépa scientifique", recommended: true },
      { label: "Prépa ECG — école de commerce", searchTerm: "Prépa ECG", recommended: true },
      { label: "École d'ingénieurs post-bac", searchTerm: "ingénieur", recommended: true },
      { label: "Prépa B/L (lettres & sciences sociales)", searchTerm: "Prépa BL" },
      { label: "BUT Informatique", searchTerm: "BUT informatique" },
      { label: "BUT statistiques / GEA / GEII / GMP / GTE…", searchTerm: "BUT" },
      { label: "Licence Maths / Physique", searchTerm: "Licence mathématiques" },
    ],
    searchTerms: ["Maths", "ingénieur", "Prépa scientifique", "BUT"]
  },
  "Physique-Chimie": {
    desc: "Pratique expérimentale et modélisation : Constitution de la matière, Mouvement et interactions, L'énergie, Ondes et signaux. Très recommandée pour les filières scientifiques et médicales.",
    themes: ["Constitution et transformations de la matière", "Mouvement et interactions", "L'énergie : conversions et transferts", "Ondes et signaux"],
    studyLinks: [
      { label: "Médecine / Pharmacie (PASS ou LAS)", searchTerm: "Médecine", recommended: true },
      { label: "Prépa MPSI, PCSI, PTSI, BCPST", searchTerm: "Prépa scientifique", recommended: true },
      { label: "École d'ingénieurs post-bac", searchTerm: "ingénieur" },
      { label: "Licence physique / chimie / STAPS", searchTerm: "Licence physique" },
      { label: "BTS chimie, paramédical, environnement", searchTerm: "BTS chimie" },
      { label: "BUT génie chimique / GEII / GMP / HSE", searchTerm: "BUT génie" },
    ],
    searchTerms: ["Physique", "Chimie", "ingénieur", "Prépa scientifique"]
  },
  "SVT": {
    desc: "Sciences de la Vie et de la Terre : biologie, corps humain, écologie et enjeux environnementaux. Programme : La Terre et l'évolution du vivant, Enjeux planétaires, Corps humain et santé. Seule spécialité très recommandée pour STAPS.",
    themes: ["La Terre, la vie et l'évolution du vivant", "Enjeux environnementaux et développement durable", "Corps humain et santé"],
    studyLinks: [
      { label: "Médecine / Pharmacie / Maïeutique / Dentaire", searchTerm: "Médecine", recommended: true },
      { label: "Études vétérinaires (bio-éco très rec. en lycée agricole)", searchTerm: "Bio Eco", recommended: true },
      { label: "Licence STAPS", searchTerm: "STAPS", recommended: true },
      { label: "Licence sciences de la vie", searchTerm: "Licence biologie" },
      { label: "Études paramédicales (infirmier, kiné, ostéo…)", searchTerm: "Infirmier" },
      { label: "BUT génie biologique / HSE", searchTerm: "BUT génie biologique" },
    ],
    searchTerms: ["Biologie", "Santé", "Médecine", "Paramédical", "STAPS"]
  },
  "SES": {
    desc: "Sciences Économiques et Sociales : économie, sociologie, science politique. Prolonge la Seconde et éclaire les grands enjeux contemporains. Très recommandée pour écoles de commerce et Sciences Po.",
    themes: ["Science économique", "Sociologie", "Science politique"],
    studyLinks: [
      { label: "Prépa ECG — école de commerce (très rec.)", searchTerm: "Prépa ECG", recommended: true },
      { label: "Sciences Po / IEP", searchTerm: "Sciences Po" },
      { label: "Licence économie-gestion / AES", searchTerm: "Licence économie" },
      { label: "Licence droit", searchTerm: "Licence droit" },
      { label: "Licence sociologie / psychologie", searchTerm: "Licence sociologie" },
      { label: "Prépa littéraire B/L", searchTerm: "Prépa BL" },
      { label: "BUT TC / GEA / Info-com / GAGO", searchTerm: "BUT TC" },
    ],
    searchTerms: ["Économie", "Commerce", "Sciences politiques", "Gestion"]
  },
  "HGGSP": {
    desc: "Histoire-Géographie, Géopolitique et Sciences Politiques : démocratie, puissance des États, frontières, information, faits religieux. En Première : analyse d'un régime politique et enjeux géopolitiques. Très recommandée pour Sciences Po et HLP pour IEP.",
    themes: ["La démocratie", "Puissance internationale des États", "Frontières politiques et enjeux de l'information", "Faits religieux et pouvoir"],
    studyLinks: [
      { label: "Sciences Po / IEP", searchTerm: "Sciences Po", recommended: true },
      { label: "École de journalisme", searchTerm: "Journalisme", recommended: true },
      { label: "Licence droit", searchTerm: "Licence droit" },
      { label: "Prépa littéraire A/L, B/L ou ECG", searchTerm: "Prépa littéraire" },
      { label: "LEA (Langues étrangères appliquées)", searchTerm: "LEA" },
      { label: "BUT TC / GAGO / Info-com / GLT", searchTerm: "BUT TC" },
    ],
    searchTerms: ["Sciences politiques", "Droit", "Journalisme", "Géopolitique"]
  },
  "LLCE": {
    desc: "Langues, Littératures et Cultures Étrangères et Régionales : maîtrise approfondie d'une langue vivante (anglais, espagnol, allemand, italien, langues régionales…) via œuvres, presse, films. Très recommandée pour LEA en terminale.",
    themes: ["Maîtrise de la langue et compétences orales", "Œuvres patrimoniales et culturelles", "Questions d'actualité des pays étudiés"],
    studyLinks: [
      { label: "Licence LLCER / LEA", searchTerm: "LEA", recommended: true },
      { label: "Traduction / Interprétariat", searchTerm: "Traduction", recommended: true },
      { label: "Communication, tourisme, marketing", searchTerm: "Communication" },
      { label: "Relations internationales / école de commerce", searchTerm: "Relations internationales" },
      { label: "Concours enseignement (CAPES langues)", searchTerm: "enseignement" },
      { label: "BUT Info-com / TC / GAGO / GLT", searchTerm: "BUT Info-com" },
    ],
    searchTerms: ["Langues", "LEA", "Traduction", "International"]
  },
  "HLP": {
    desc: "Humanités, Littérature et Philosophie : approche littéraire et philosophique. Thèmes : Les pouvoirs de la parole (Antiquité—Âge classique), Les représentations du monde (Renaissance, Lumières). Très recommandée pour Sciences Po avec HGGSP.",
    themes: ["Les pouvoirs de la parole (Antiquité — Âge classique)", "Les représentations du monde (Renaissance, Lumières)", "Réflexion personnelle à travers les grandes œuvres"],
    studyLinks: [
      { label: "Sciences Po / IEP", searchTerm: "Sciences Po", recommended: true },
      { label: "Prépa littéraire A/L ou B/L", searchTerm: "Prépa littéraire", recommended: true },
      { label: "Licence philosophie / lettres", searchTerm: "Licence philosophie" },
      { label: "Sciences humaines (socio, psycho, histoire)", searchTerm: "Licence sociologie" },
      { label: "Licence droit", searchTerm: "Licence droit" },
    ],
    searchTerms: ["Philosophie", "Lettres", "Sciences humaines", "Droit"]
  },
  "NSI": {
    desc: "Numérique et Sciences Informatiques : algorithmique, programmation, structures de données, réseaux, interfaces. Développe une vraie culture scientifique de l'informatique. Recommandée pour BUT informatique et multimédia.",
    themes: ["Algorithmique et programmation", "Structures de données", "Architectures matérielles et réseaux", "Interfaces homme-machine"],
    studyLinks: [
      { label: "Classes préparatoires scientifiques (MPSI, MP2I)", searchTerm: "Prépa scientifique", recommended: true },
      { label: "BUT Informatique", searchTerm: "BUT informatique", recommended: true },
      { label: "BUT Multimédia", searchTerm: "BUT multimédia", recommended: true },
      { label: "BUT GEII / R&T / statistiques / QLIO", searchTerm: "BUT GEII" },
      { label: "Licence informatique", searchTerm: "Licence informatique" },
      { label: "BTS SIO / SN", searchTerm: "BTS SIO" },
      { label: "École d'ingénieurs", searchTerm: "ingénieur" },
    ],
    searchTerms: ["Informatique", "Numérique", "BUT informatique", "BTS SIO"]
  },
  "SI": {
    desc: "Sciences de l'Ingénieur : concevoir et matérialiser des solutions technologiques. Démarche scientifique, modélisation, simulation. Projets en équipe : 12h en Première, 48h en Terminale.",
    themes: ["Modélisation et simulation des systèmes", "Démarche scientifique et expérimentation", "Projets d'ingénierie en équipe (12h et 48h)"],
    studyLinks: [
      { label: "École d'ingénieurs post-bac", searchTerm: "ingénieur", recommended: true },
      { label: "CPGE MPSI, PCSI, PTSI", searchTerm: "Prépa scientifique", recommended: true },
      { label: "BUT GEII / GMP / GTE / HSE / mesures physiques", searchTerm: "BUT GEII" },
      { label: "BTS industriels", searchTerm: "BTS industriel" },
    ],
    searchTerms: ["ingénieur", "BUT GEII", "Prépa scientifique", "BTS industriel"]
  },
  "Arts": {
    desc: "7 spécialités au choix : arts du cirque (acrobatie, jonglerie, jeu comique), arts plastiques (dessin, peinture, sculpture, photo, architecture, numérique), cinéma-audiovisuel, danse, histoire de l'art, musique, théâtre. Très recommandée pour les écoles d'art.",
    themes: ["Arts plastiques : dessin, peinture, sculpture, photo, création numérique", "Cinéma-audiovisuel : théorie, analyse, pratique", "Danse : composition, création chorégraphique", "Musique : analyse d'œuvres, interprétation, création", "Théâtre : pratique de scène, analyse, culture"],
    studyLinks: [
      { label: "Écoles d'art (beaux-arts, cinéma, photo, animation…)", searchTerm: "École art", recommended: true },
      { label: "DNMADE — Diplôme national arts et design (3 ans)", searchTerm: "DNMADE", recommended: true },
      { label: "Architecture", searchTerm: "Architecture" },
      { label: "Classe préparatoire écoles d'art", searchTerm: "Prépa art" },
      { label: "Licence arts plastiques / musicologie / histoire de l'art", searchTerm: "Licence arts" },
      { label: "Licence sciences humaines (socio, psycho, histoire)", searchTerm: "Licence sociologie" },
    ],
    searchTerms: ["Arts", "Design", "Cinéma", "Architecture", "DNMADE"]
  },
  "Sports": {
    desc: "Éducation Physique, Pratiques et Culture Sportive : étude scientifique, sociale et culturelle du sport. Seule spécialité SVT est très recommandée pour STAPS, mais Sports est conseillée.",
    themes: ["Performance sportive et entraînement", "Sciences du sport (physiologie, biomécanique)", "Culture sportive et histoire du sport"],
    studyLinks: [
      { label: "Licence STAPS", searchTerm: "STAPS", recommended: true },
      { label: "Formations paramédicales (kiné, ostéo…)", searchTerm: "Kinésithérapie" },
      { label: "BUT Métiers du sport", searchTerm: "BUT sport" },
      { label: "Métiers de l'enseignement sportif / coaching", searchTerm: "Sport" },
    ],
    searchTerms: ["STAPS", "Sport", "Kiné", "Éducation physique"]
  },
  "LLCA": {
    desc: "Littératures, Langues et Cultures de l'Antiquité : latin et/ou grec avec ancrage littéraire fort. Thèmes : La cité entre réalités et utopies, Justice des dieux et des hommes, Amour Amours, Méditerranée. Très recommandée pour LEA en terminale.",
    themes: ["La cité entre réalités et utopies", "Justice des dieux, justice des hommes", "Amour, Amours", "Méditerranée : conflits, influences et échanges"],
    studyLinks: [
      { label: "Classe préparatoire littéraire A/L ou Chartes", searchTerm: "Prépa littéraire", recommended: true },
      { label: "Licence LLCER / LEA", searchTerm: "LEA", recommended: true },
      { label: "Licence lettres classiques", searchTerm: "Licence lettres" },
      { label: "Formations aux métiers du livre", searchTerm: "édition" },
      { label: "Sciences humaines (histoire, socio, archéologie)", searchTerm: "Licence sociologie" },
    ],
    searchTerms: ["Lettres classiques", "Littérature", "Philosophie", "Sciences humaines"]
  },
};

// Rétrocompat avec l'ancien code
const defSpecialties: Record<string, string> = Object.fromEntries(
  Object.entries(SPEC_DATA).map(([k, v]) => [k, v.desc])
);

// Projets proposés avec leurs secteurs associés
const PROJECT_EXAMPLES: Record<string, { label: string; sector: string; specialties: string[] }> = {
  "Informatique / Dev":    { label: "Informatique / Dev",    sector: "Informatique & Numérique", specialties: ["NSI", "Maths", "Physique-Chimie"] },
  "Médecine / Santé":      { label: "Médecine / Santé",      sector: "Santé & Social",           specialties: ["SVT", "Physique-Chimie", "Maths"] },
  "Commerce / Gestion":    { label: "Commerce / Gestion",    sector: "Commerce & Gestion",       specialties: ["SES", "Maths", "HGGSP"] },
  "Droit / Sciences Po":   { label: "Droit / Sciences Po",   sector: "Administration",           specialties: ["HGGSP", "SES", "HLP"] },
  "Art / Design / Média":  { label: "Art / Design / Média",  sector: "Communication & Médias",   specialties: ["Arts", "LLCE", "HLP"] },
  "Recherche / Sciences":  { label: "Recherche / Sciences",  sector: "Chimie & Biologie",        specialties: ["Maths", "SVT", "Physique-Chimie"] },
  "Ingénierie / BTP":      { label: "Ingénierie / BTP",      sector: "Bâtiment",                 specialties: ["Maths", "Physique-Chimie", "SI"] },
  "International / Langues":{ label: "International / Langues", sector: "Hôtellerie & Tourisme", specialties: ["LLCE", "HGGSP", "SES"] },
  "Agriculture / Env.":    { label: "Agriculture / Env.",    sector: "Agriculture",              specialties: ["SVT", "Physique-Chimie", "SES"] },
  "Enseignement":          { label: "Enseignement",          sector: "Enseignement",             specialties: ["HLP", "SES", "Maths"] },
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

const studyData: Record<string, { duration: string; level: string; profile: string; advantages: string; outcomes: string; details: string; formationType: string }> = {
  Licence:  {
    duration: "3 ans (L1, L2, L3) à l'université",
    level: "Baccalauréat",
    profile: "Autonome, à l'aise avec le travail théorique, goût pour la spécialisation progressive",
    advantages: "Grande diversité (art, droit, éco, lettres, sciences…), passerelles vers Master et Doctorat",
    outcomes: "Master (bac+5) ou insertion professionnelle selon spécialité. Études médicales : PASS ou LAS possible en L1.",
    details: "Organisée en 3 étapes : Licence (bac+3) → Master (bac+5) → Doctorat (bac+8). Les études de médecine, dentaire, pharmacie et maïeutique passent par PASS ou LAS en 1ère année.",
    formationType: "Licence"
  },
  BUT:      {
    duration: "3 ans en IUT (Institut Universitaire de Technologie)",
    level: "Baccalauréat — recrutement sur dossier, parfois entretien",
    profile: "Aime le concret, l'équilibre théorie/pratique, les projets en équipe",
    advantages: "24 spécialités (informatique, commerce, génie, social…), possible en apprentissage, stages obligatoires",
    outcomes: "Insertion directe ou poursuite en Master/école d'ingénieur ou de commerce",
    details: "Exemples : BUT Informatique, BUT TC (Commerce), BUT GEII (électronique), BUT GEA (gestion), BUT social, BUT info-com… Accessible en apprentissage dans certains IUT.",
    formationType: "BUT"
  },
  BTS:      {
    duration: "2 ans en lycée (STS — Section de Techniciens Supérieurs)",
    level: "Baccalauréat — recrutement sur dossier",
    profile: "Pragmatique, aime les cas concrets, veut entrer rapidement dans la vie active",
    advantages: "125+ spécialités : hôtellerie, tourisme, commerce, paramédical, chimie… Préparable en apprentissage.",
    outcomes: "Insertion rapide ou poursuite en Licence professionnelle (bac+3). ~50% des diplômés continuent.",
    details: "Les BTS (et BTSA agricoles) sont les formations les plus professionnalisantes. Programme : enseignements généraux + TP + stages entreprise.",
    formationType: "BTS"
  },
  Prépa:    {
    duration: "2 ans en lycée (CPGE)",
    level: "Baccalauréat — recrutement sur dossier",
    profile: "Travailleur, motivé, aime les défis intellectuels et la pluridisciplinarité",
    advantages: "Prépare aux concours des grandes écoles (ingénieurs, commerce, ENS). Culture générale intensive.",
    outcomes: "Accès aux grandes écoles selon filière : ingénieurs, commerce, ENS, IEP, vétérinaires, agronomie…",
    details: "3 filières : Scientifique (MPSI, MP2I, PCSI, PTSI, BCPST…) → écoles d'ingénieurs, ENS, véto. Économique-Commerciale (ECG, ECT, D1, D2) → écoles de commerce. Littéraire (A/L, B/L, Chartes) → ENS, IEP, École des Chartes.",
    formationType: "Prépa"
  },
  Ecoles:   {
    duration: "3 à 5 ans selon le diplôme et le secteur",
    level: "Bac ou Bac+2 selon l'école — recrutement sur dossier ou concours",
    profile: "Motivé par un secteur précis, prêt à s'investir dans une formation spécialisée",
    advantages: "Formation ciblée, réseau professionnel fort, partenariats entreprises, souvent en alternance",
    outcomes: "Insertion rapide dans le domaine : écoles d'art, d'architecture, paramédicales, sociales, militaires…",
    details: "Exemples : Écoles paramédicales (infirmier 3 ans, kiné 3 ans, ostéo 5 ans…), Écoles sociales (éducateur spécialisé, assistant social — DE), Écoles d'art et d'architecture (5 ans), Écoles de police et de l'armée.",
    formationType: "École"
  },
  Bachelor: {
    duration: "3 ans en école privée ou de commerce",
    level: "Baccalauréat — recrutement sur dossier",
    profile: "Aime les formations professionnalisantes, l'international et les partenariats entreprises",
    advantages: "Partenariats entreprises solides, ouverture internationale, souvent préparable en alternance",
    outcomes: "Insertion rapide (bac+3) ou poursuite en Master dans le domaine",
    details: "Proposé principalement dans les écoles de commerce et de management privées. Diplôme reconnu bac+3. Certaines écoles d'ingénieurs proposent aussi des Bachelors techniques.",
    formationType: "Bachelor"
  }
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
    "Maths": ["Informatique & Numérique", "Commerce & Gestion", "Bâtiment", "Santé & Social"],
    "SES": ["Commerce & Gestion", "Administration", "Enseignement"],
    "NSI": ["Informatique & Numérique", "Bâtiment"],
    "SVT": ["Santé & Social", "Chimie & Biologie", "Agriculture"],
    "Physique-Chimie": ["Bâtiment", "Chimie & Biologie", "Santé & Social"],
    "HGGSP": ["Administration", "Enseignement", "Communication & Médias"],
    "LLCE": ["Communication & Médias", "Hôtellerie & Tourisme", "Enseignement"],
    "Arts": ["Communication & Médias", "Enseignement"],
    "SI": ["Bâtiment", "Informatique & Numérique", "Mécanique"],
    "Sports": ["Santé & Social", "Enseignement"],
    "HLP": ["Enseignement", "Communication & Médias", "Administration"],
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
  const info1 = SPEC_DATA[spec1];
  const info2 = SPEC_DATA[spec2];

  // Études en commun (même searchTerm)
  const links1 = info1?.studyLinks ?? [];
  const links2 = info2?.studyLinks ?? [];
  const commonLabels = links1
    .filter(l1 => links2.some(l2 => l2.searchTerm === l1.searchTerm))
    .map(l => l.label);
  const only1 = links1.filter(l => !links2.some(l2 => l2.searchTerm === l.searchTerm)).map(l => l.label);
  const only2 = links2.filter(l => !links1.some(l1 => l1.searchTerm === l.searchTerm)).map(l => l.label);

  let result = `${spec1} vs ${spec2}

`;
  result += `${spec1} :
${info1?.desc.split(".")[0]}.
`;
  result += `Thèmes : ${info1?.themes.slice(0, 2).join(", ")}
`;
  result += `Débouchés spécifiques : ${only1.slice(0, 2).join(", ") || "—"}

`;

  result += `${spec2} :
${info2?.desc.split(".")[0]}.
`;
  result += `Thèmes : ${info2?.themes.slice(0, 2).join(", ")}
`;
  result += `Débouchés spécifiques : ${only2.slice(0, 2).join(", ") || "—"}

`;

  if (commonLabels.length > 0) {
    result += `Études compatibles avec les deux :
${commonLabels.slice(0, 3).map(l => "• " + l).join("\n")}

`;
  }

  if (sector) {
    result += `Par rapport à ton projet (${firstFav?.title ?? sector}) :\n`;
  }
  if (s1 > s2) result += `${spec1} est plus alignée avec ton profil.`;
  else if (s2 > s1) result += `${spec2} est plus alignée avec ton profil.`;
  else result += `Les deux sont aussi pertinentes. Choisis selon tes points forts !`;

  return result;
}

// Retourne les boutons de formation à afficher après une comparaison
function getCompareSuggestions(spec1: string, spec2: string): string[] {
  const info1 = SPEC_DATA[spec1];
  const info2 = SPEC_DATA[spec2];
  const links1 = info1?.studyLinks ?? [];
  const links2 = info2?.studyLinks ?? [];
  // Formations communes = priorité
  const common = links1
    .filter(l1 => links2.some(l2 => l2.searchTerm === l1.searchTerm))
    .slice(0, 2)
    .map(l => `${l.label} — ${l.searchTerm}`);
  // Puis 1 spécifique à chaque spé
  const only1 = links1.filter(l => !links2.some(l2 => l2.searchTerm === l.searchTerm)).slice(0, 1).map(l => `🎓 ${l.label} — ${l.searchTerm}`);
  const only2 = links2.filter(l => !links1.some(l1 => l1.searchTerm === l.searchTerm)).slice(0, 1).map(l => `🎓 ${l.label} — ${l.searchTerm}`);
  return [...common, ...only1, ...only2, "Comparer deux autres", "Retour"];
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
    ? `\n\nRecommandation : abandonne ${toAbandon[0]} en Terminale, c'est la moins alignée avec ton profil.`
    : `\n\n${toAbandon.join(" et ")} sont équivalentes. Choisis celle que tu aimes le moins !`;

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

const HOME_SUGGESTIONS = ["Découvrir mes domaines", "Choix des spécialités", "Explorer les études", "Questions générales"];

const getInitialMessage = (): Message => ({
  id: "init",
  text: "Bonjour 👋 Je suis Oriento, ton assistant d'orientation. Que veux-tu explorer ?",
  sender: 'bot',
  suggestions: HOME_SUGGESTIONS
});

const STEP_RESUME: Partial<Record<ChatStep, { text: string; suggestions: string[] }>> = {
  "domains_result":      { text: "Content de te revoir ! On explorait tes domaines. Tu veux continuer ?", suggestions: ["Reprendre l'exploration des domaines", "Recommencer depuis le début"] },
  "domains_filter":      { text: "Content de te revoir ! On explorait un domaine en particulier. Tu veux continuer ?", suggestions: ["Reprendre l'exploration des domaines", "Recommencer depuis le début"] },
  "specialties_menu":    { text: "Content de te revoir ! On était sur tes spécialités. Tu veux continuer ?", suggestions: ["Reprendre les spécialités", "Recommencer depuis le début"] },
  "spec_ask_project":    { text: "Content de te revoir ! On allait parler de ton projet pour mieux t'orienter sur les spécialités. Tu veux continuer ?", suggestions: ["Reprendre les spécialités", "Recommencer depuis le début"] },
  "spec_choose_project": { text: "Content de te revoir ! On définissait ton projet professionnel. Tu veux continuer ?", suggestions: ["Reprendre les spécialités", "Recommencer depuis le début"] },
  "spec_by_project":     { text: "Content de te revoir ! On avait des recommandations de spécialités selon ton projet. Tu veux continuer ?", suggestions: ["Reprendre les spécialités", "Comparer 2 spécialités", "Recommencer depuis le début"] },
  "spec_no_project":     { text: "Content de te revoir ! On explorait des spécialités basées sur ton profil. Tu veux continuer ?", suggestions: ["Reprendre les spécialités", "Faire le test RIASEC", "Recommencer depuis le début"] },
  "spec_abandon":        { text: "Content de te revoir ! On analysait quelle spécialité abandonner en Terminale. Tu veux continuer ?", suggestions: ["Laquelle abandonner ?", "Comparer 2 spécialités", "Recommencer depuis le début"] },
  "spec_compare_pick1":  { text: "Content de te revoir ! On comparait des spécialités. Tu veux continuer ?", suggestions: ["Comparer 2 spécialités", "Recommencer depuis le début"] },
  "spec_compare_pick2":  { text: "Content de te revoir ! On comparait des spécialités. Tu veux continuer ?", suggestions: ["Comparer 2 spécialités", "Recommencer depuis le début"] },
  "spec_compare_result": { text: "Content de te revoir ! On avait comparé des spécialités. Tu veux en comparer d'autres ?", suggestions: ["Comparer deux autres", "Retour aux spécialités", "Recommencer depuis le début"] },
  "studies":             { text: "Content de te revoir ! On explorait les types de formations. Tu veux continuer ?", suggestions: ["Reprendre l'exploration des études", "Recommencer depuis le début"] },
  "study_detail":        { text: "Content de te revoir ! On regardait le détail d'une formation. Tu veux continuer ?", suggestions: ["Reprendre l'exploration des études", "Recommencer depuis le début"] },
  "parcoursup":          { text: "Content de te revoir ! On discutait de Parcoursup. Tu veux continuer ?", suggestions: ["Reprendre Parcoursup", "Autres questions générales", "Recommencer depuis le début"] },
  "alternance":          { text: "Content de te revoir ! On parlait de l'alternance. Tu veux continuer ?", suggestions: ["Reprendre l'alternance", "Autres questions générales", "Recommencer depuis le début"] },
  "stress":              { text: "Content de te revoir ! On discutait de la gestion du stress d'orientation. Tu veux continuer ?", suggestions: ["Reprendre la gestion du stress", "Autres questions générales", "Recommencer depuis le début"] },
  "gap_year":            { text: "Content de te revoir ! On parlait de l'année de césure. Tu veux continuer ?", suggestions: ["Reprendre l'année de césure", "Autres questions générales", "Recommencer depuis le début"] },
  "international":       { text: "Content de te revoir ! On explorait les études à l'étranger. Tu veux continuer ?", suggestions: ["Reprendre les études à l'étranger", "Autres questions générales", "Recommencer depuis le début"] },
  "general":             { text: "Content de te revoir ! On était dans les questions générales. Tu veux continuer ?", suggestions: ["Reprendre les questions générales", "Recommencer depuis le début"] },
};

/* ================== COMPOSANT ================== */

export default function Chatbot({ userProfile, onNavigate }: ChatbotProps) {
  const savedHistory = loadChatHistory();
  const savedStep = loadChatStep();
  const hasHistory = savedHistory.length > 0;

  // Si historique existant, on ajoute un message de reprise contextuel à la fin
  const initMessages: Message[] = hasHistory
    ? [...savedHistory, { id: "resume_" + Date.now(), text: STEP_RESUME[savedStep]?.text ?? "Content de te revoir ! Par où veux-tu continuer ?", sender: 'bot' as const, suggestions: STEP_RESUME[savedStep]?.suggestions ?? HOME_SUGGESTIONS }]
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
      introText = `Tu es en Seconde ${specLine}\n\nEn Première, tu choisiras 3 spécialités. Que veux-tu savoir ?`;
      suggestions = specs.length > 0
        ? ["Quelles spécialités choisir ?", "Mes spécialités sont-elles cohérentes ?", "Comparer 2 spécialités", "Retour"]
        : ["Quelles spécialités choisir ?", "Comparer 2 spécialités", "Retour"];
    } else if (grade === "Première") {
      introText = `Tu es en Première ${specLine}\n\nEn Terminale, tu abandonneras une de tes 3 spécialités. Que veux-tu faire ?`;
      suggestions = specs.length >= 2
        ? ["Quelles spécialités choisir ?", "Laquelle abandonner en Terminale ?", "Comparer 2 spécialités", "Mes spécialités sont-elles cohérentes ?", "Retour"]
        : ["Quelles spécialités choisir ?", "Comparer 2 spécialités", "Retour"];
    } else if (grade === "Terminale") {
      introText = `Tu es en Terminale ${specLine}\n\nTu as tes 2 spécialités définitives. Que veux-tu savoir ?`;
      suggestions = specs.length >= 2
        ? ["Mes spécialités sont-elles cohérentes ?", "Comparer 2 spécialités", "Retour"]
        : ["Quelles spécialités choisir ?", "Comparer 2 spécialités", "Retour"];
    } else {
      introText = `Spécialités${specLine} \n\nQue veux-tu savoir ?`;
      suggestions = ["Quelles spécialités choisir ?", "Laquelle abandonner ?", "Comparer 2 spécialités", "Mes spécialités sont-elles cohérentes ?", "Retour"];
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
        if (favCareer) contextText += `\n\nMétier favori enregistré : **${favCareer.title}**`;
        if (userProfile.specialties?.length) contextText += `\nSpécialités : ${userProfile.specialties.join(", ")}`;
        contextText += "\n\nClique sur un domaine pour l'explorer, ou découvre d'autres domaines";
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
        if (!userProfile.grade) return { id: Date.now().toString(), text: "Je ne trouve pas ta classe. Mets à jour ton profil d'abord !", sender: "bot", suggestions: ["Revenir au début"] };
        return backToSpecMenu();
      }

      if (userMessage.includes("Explorer les études")) {
        setStep("studies");
        return { id: Date.now().toString(), text: "Quel type de formation veux-tu explorer ? 🎓", sender: "bot", suggestions: ["Licence", "BUT", "BTS", "Prépa", "Ecoles", "Bachelor", "Revenir au début"] };
      }

      if (userMessage.includes("Questions générales")) {
        setStep("general");
        return { id: Date.now().toString(), text: "Sur quel sujet as-tu des questions ?", sender: "bot", suggestions: ["Parcoursup", "L'alternance", "Gérer le stress", "Année de césure", "Études à l'étranger", "Revenir au début"] };
      }
    }

    /* ===== DOMAINS RESULT — clic sur un domaine ===== */
    if (step === "domains_result") {
      if (userMessage === "Revenir au début") { resetConversation(); return { id: Date.now().toString(), text: "", sender: "bot" }; }

      if (userMessage === "Explorer d'autres domaines") {
        // Afficher directement TOUS les domaines disponibles
        const allDomains = Object.keys(DOMAIN_FILTERS);
        return {
          id: Date.now().toString(),
          text: "Voici tous les domaines disponibles \n\nClique sur celui qui t'intéresse pour l'explorer :",
          sender: "bot",
          suggestions: [...allDomains, "🔄 Revenir au début"]
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
          suggestions: ["Voir les métiers de ce domaine", "Voir les formations de ce domaine", "Retour aux domaines"]
        };
      }

      return { id: Date.now().toString(), text: "Clique sur un des domaines proposés", sender: "bot" };
    }

    /* ===== DOMAINS FILTER ===== */
    if (step === "domains_filter") {
      if (userMessage.includes("Retour aux domaines")) {
        setStep("domains_result");
        const analysis = analyzeDomains(userProfile);
        return {
          id: Date.now().toString(),
          text: "Choisis un domaine à explorer",
          sender: "bot",
          suggestions: [...analysis.domains, "Explorer d'autres domaines", "Revenir au début"]
        };
      }
      if (userMessage.includes("métiers") && currentDomain) {
        const filter = DOMAIN_FILTERS[currentDomain];
        if (filter?.careerFilter) localStorage.setItem("careerFilter", filter.careerFilter);
        onNavigate("careers");
        return { id: Date.now().toString(), text: `Je t'emmène vers les métiers de "${currentDomain}"`, sender: "bot" };
      }
      if (userMessage.includes("formations") && currentDomain) {
        const filter = DOMAIN_FILTERS[currentDomain];
        if (filter?.formationFilter) localStorage.setItem("formationFilter", filter.formationFilter);
        onNavigate("formations");
        return { id: Date.now().toString(), text: `Je t'emmène vers les formations de "${currentDomain}"`, sender: "bot" };
      }
    }



    /* ===== SPECIALTIES MENU ===== */
    if (step === "specialties_menu") {
      if (userMessage === "Retour") {
        setStep("home");
        return {
          id: Date.now().toString(),
          text: "Que veux-tu explorer maintenant ?",
          sender: "bot",
          suggestions: HOME_SUGGESTIONS
        };
      }

      if (userMessage.includes("Quelles spécialités choisir")) {
        setStep("spec_ask_project");
        const favCareer = careers.find(c => c.id === userProfile.favoriteJobs?.[0]);
        if (favCareer) {
          return {
            id: Date.now().toString(),
            text: `Pour te conseiller sur les spécialités, j'ai besoin de connaître ton projet \n\nD'après ton profil, ton métier favori est : **${favCareer.title}** (${favCareer.sector})\n\nEst-ce que c'est toujours ton projet ou tu veux en choisir un autre ?`,
            sender: "bot",
            suggestions: ["Oui, c'est mon projet", "Non, je veux choisir un autre projet", "J'ai une vague idée", "Pas du tout"]
          };
        }
        return {
          id: Date.now().toString(),
          text: "Pour te conseiller au mieux sur les spécialités, as-tu déjà une idée de ce que tu veux faire après le bac ?",
          sender: "bot",
          suggestions: ["Oui, j'ai un projet", "J'ai une vague idée", "Pas du tout"]
        };
      }

      if (userMessage.includes("abandonner")) {
        const specs = userProfile.specialties;
        if (!specs || specs.length < 2) return { id: Date.now().toString(), text: "Je n'ai pas tes spécialités enregistrées. Mets à jour ton profil !", sender: "bot", suggestions: ["Retour"] };
        setStep("spec_abandon");
        return { id: Date.now().toString(), text: getAbandonRecommendation(specs, userProfile), sender: "bot", suggestions: ["Comparer 2 spécialités", "Revenir au début"] };
      }

      if (userMessage.includes("Comparer")) {
        setStep("spec_compare_pick1");
        return { id: Date.now().toString(), text: "Quelle est la 1ère spécialité à comparer ?", sender: "bot", suggestions: [...ALL_SPECIALTIES, "Retour"] };
      }

      if (userMessage.includes("cohérentes")) {
        setStep("spec_coherence");
        const specs = userProfile.specialties;
        if (!specs?.length) return { id: Date.now().toString(), text: "Je n'ai pas tes spécialités enregistrées.", sender: "bot", suggestions: ["Retour"] };
        // Demander le projet si pas encore défini pour une analyse précise
        const favCareer = careers.find(c => c.id === userProfile.favoriteJobs?.[0]);
        const sector = favCareer?.sector;
        if (!sector) {
          return {
            id: Date.now().toString(),
            text: `Tes spécialités enregistrées : **${specs.join(", ")}**\n\nPour vérifier si elles sont cohérentes, j'ai besoin de connaître ton projet. Quel est-il ?`,
            sender: "bot",
            suggestions: [...Object.keys(PROJECT_EXAMPLES), "Retour"]
          };
        }
        const recommended = sectorToSpecialties[sector] ?? [];
        const matching = specs.filter(s => recommended.includes(s));
        const missing = recommended.filter(s => !specs.includes(s));
        const text = matching.length === 0
          ? `Tes spécialités (${specs.join(", ")}) semblent peu alignées avec "${sector}".\nLes spécialités recommandées sont : ${recommended.join(", ")}.`
          : missing.length === 0
          ? `Tes spécialités (${specs.join(", ")}) sont parfaitement cohérentes avec ton projet "${sector}" !`
          : `${matching.join(", ")} sont cohérentes avec "${sector}".\nTu pourrais aussi envisager : ${missing.join(", ")}.`;
        return { id: Date.now().toString(), text, sender: "bot", suggestions: ["Retour"] };
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
          ? `Tes spécialités (${specs.join(", ")}) sont parfaitement cohérentes avec "${projectFromCoherence.label}" !`
          : `${matching.join(", ")} sont cohérentes avec "${projectFromCoherence.label}".\nTu pourrais aussi envisager : ${missing.join(", ")}.`;
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
          ? `Tes spécialités (${specs.join(", ")}) sont parfaitement cohérentes avec "${projectSelected.label}" !`
          : `${matching.join(", ")} sont cohérentes avec "${projectSelected.label}".
Tu pourrais aussi envisager : ${missing.join(", ")}.`;
        setStep("specialties_menu");
        return { id: Date.now().toString(), text, sender: "bot", suggestions: ["🔙 Retour"] };
      }
      if (userMessage === "🔙 Retour") { return backToSpecMenu(); }
    }

    /* ===== SPEC ASK PROJECT ===== */
    if (step === "spec_ask_project") {
      // Confirmation du métier favori déjà dans le profil
      if (userMessage === "Oui, c'est mon projet") {
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
            suggestions: [...recommended, "Comparer 2 spécialités", "Retour"]
          };
        }
      }
      if (userMessage === "Non, je veux choisir un autre projet" || userMessage === "Oui, j'ai un projet") {
        setStep("spec_choose_project");
        return {
          id: Date.now().toString(),
          text: "Quel est ton projet ? Choisis celui qui te correspond le mieux ou tape-le librement",
          sender: "bot",
          suggestions: [...Object.keys(PROJECT_EXAMPLES), "Retour"]
        };
      }
      if (userMessage === "J'ai une vague idée") {
        setStep("spec_choose_project");
        return {
          id: Date.now().toString(),
          text: "Pas de souci ! Quel domaine t'attire le plus ? Tu peux choisir parmi ces exemples ou me décrire ton idée",
          sender: "bot",
          suggestions: [...Object.keys(PROJECT_EXAMPLES), "Retour"]
        };
      }
      if (userMessage === "Pas du tout") {
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
          text: `Pas de problème, c'est tout à fait normal ! \n\n${riasecSpecs ? "D'après ton profil RIASEC" : "D'après tes centres d'intérêt"}, voici les spécialités qui correspondent le mieux à qui tu es :\n\n• ${recommended.join("\n• ")}\n\nClique sur une spécialité pour en savoir plus :`,
          sender: "bot",
          suggestions: [...recommended, "Faire le test RIASEC", "Retour"]
        };
      }
    }

    /* ===== SPEC CHOOSE PROJECT ===== */
    if (step === "spec_choose_project") {
      if (userMessage === "Retour") { return backToSpecMenu(); }

      const project = PROJECT_EXAMPLES[userMessage];
      if (project) {
        setStep("spec_by_project");
        return {
          id: Date.now().toString(),
          text: `Pour un projet en **${project.label}**, voici les spécialités recommandées :\n\n• ${project.specialties.join("\n• ")}\n\nClique sur une spécialité pour en savoir plus :`,
          sender: "bot",
          suggestions: [...project.specialties, "Comparer 2 spécialités", "Retour"]
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
          suggestions: [...project.specialties, "Comparer 2 spécialités", "Retour"]
        };
      }

      return {
        id: Date.now().toString(),
        text: "Je n'ai pas reconnu ce projet. Choisis dans la liste ou clique sur Retour",
        sender: "bot",
        suggestions: [...Object.keys(PROJECT_EXAMPLES), "Retour"]
      };
    }

    /* ===== SPEC BY PROJECT ===== */
    if (step === "spec_by_project") {
      if (userMessage === "Retour") { return backToSpecMenu(); }
      if (userMessage.includes("Comparer")) {
        setStep("spec_compare_pick1");
        return { id: Date.now().toString(), text: "Quelle est la 1ère spécialité à comparer ?", sender: "bot", suggestions: [...ALL_SPECIALTIES, "Retour"] };
      }
      // Bouton "🎓 [label] — [spec]" → naviguer vers formations avec searchTerm
      const formSearchMatch = userMessage.match(/^🎓 .+ — (.+)$/);
      if (formSearchMatch) {
        const searchTerm = formSearchMatch[1];
        localStorage.setItem("formationSearchTerm", searchTerm);
        onNavigate("formations");
        return { id: Date.now().toString(), text: `Je t'affiche les formations correspondantes`, sender: "bot" };
      }
      const specInfo = SPEC_DATA[userMessage];
      if (specInfo) {
        setStep("DefSpec");
        const studySuggestions = specInfo.studyLinks.map(l =>
          `${l.label}${l.recommended ? "" : ""} — ${l.searchTerm}`
        );
        return {
          id: Date.now().toString(),
          text: `**${userMessage}**\n\n${specInfo.desc}\n\nThèmes abordés :\n• ${specInfo.themes.join("\n• ")}\n\nÉtudes possibles (clique pour explorer) :`,
          sender: "bot",
          suggestions: [...studySuggestions, "Retour"]
        };
      }
    }

    /* ===== SPEC NO PROJECT — clic sur une spécialité ===== */
    if (step === "spec_no_project") {
      if (userMessage === "Retour") { return backToSpecMenu(); }
      if (userMessage.includes("test RIASEC")) { onNavigate("riasec-test"); return { id: Date.now().toString(), text: "Je t'emmène vers le test RIASEC", sender: "bot" }; }
      // Bouton "[label] — [searchTerm]" → formations
      const formSearchMatch2 = userMessage.match(/^.+ — (.+)$/);
      if (formSearchMatch2) {
        localStorage.setItem("formationSearchTerm", formSearchMatch2[1]);
        onNavigate("formations");
        return { id: Date.now().toString(), text: `Je t'affiche les formations correspondantes`, sender: "bot" };
      }
      const specInfo2 = SPEC_DATA[userMessage];
      if (specInfo2) {
        setStep("DefSpec");
        const studySuggestions2 = specInfo2.studyLinks.map(l =>
          `🎓 ${l.label}${l.recommended ? "" : ""} — ${l.searchTerm}`
        );
        return {
          id: Date.now().toString(),
          text: `**${userMessage}**\n\n${specInfo2.desc}\n\nThèmes abordés :\n• ${specInfo2.themes.join("\n• ")}\n\nÉtudes possibles (clique pour explorer) :`,
          sender: "bot",
          suggestions: [...studySuggestions2, "Faire le test RIASEC", "Retour"]
        };
      }
    }

    /* ===== SPEC ABANDON ===== */
    if (step === "spec_abandon") {
      if (userMessage.includes("Comparer")) {
        setStep("spec_compare_pick1");
        return { id: Date.now().toString(), text: "Quelle est la 1ère spécialité à comparer ?", sender: "bot", suggestions: [...ALL_SPECIALTIES, "Retour"] };
      }
      if (userMessage === "Revenir au début") { resetConversation(); return { id: Date.now().toString(), text: "", sender: "bot" }; }
    }

    /* ===== SPEC COMPARE PICK 1 ===== */
    if (step === "spec_compare_pick1") {
      if (userMessage === "Retour") { return backToSpecMenu(); }
      if (ALL_SPECIALTIES.includes(userMessage)) {
        setCompareSpec1(userMessage);
        setStep("spec_compare_pick2");
        return {
          id: Date.now().toString(),
          text: `OK, ${userMessage} vs... quelle autre spécialité ?`,
          sender: "bot",
          suggestions: [...ALL_SPECIALTIES.filter(s => s !== userMessage), "Retour"]
        };
      }
    }

    /* ===== SPEC COMPARE PICK 2 ===== */
    if (step === "spec_compare_pick2") {
      if (userMessage === "Retour") { return backToSpecMenu(); }
      if (compareSpec1 && ALL_SPECIALTIES.includes(userMessage)) {
        setStep("spec_compare_result");
        const spec2 = userMessage;
        return {
          id: Date.now().toString(),
          text: compareTwo(compareSpec1, spec2, userProfile),
          sender: "bot",
          suggestions: getCompareSuggestions(compareSpec1, spec2)
        };
      }
    }

    /* ===== SPEC COMPARE RESULT ===== */
    if (step === "spec_compare_result") {
      if (userMessage.includes("Comparer deux autres")) {
        setCompareSpec1(null);
        setStep("spec_compare_pick1");
        return { id: Date.now().toString(), text: "Quelle est la 1ère spécialité à comparer ?", sender: "bot", suggestions: [...ALL_SPECIALTIES, "Retour"] };
      }
      // Bouton "[label] — [searchTerm]" depuis la comparaison
      const compareFormSearch = userMessage.match(/^.+ — (.+)$/);
      if (compareFormSearch) {
        localStorage.setItem("formationSearchTerm", compareFormSearch[1]);
        onNavigate("formations");
        return { id: Date.now().toString(), text: "Je t'affiche les formations correspondantes", sender: "bot" };
      }
      if (userMessage === "Retour") { return backToSpecMenu(); }
    }

    /* ===== DEF SPEC ===== */
    if (step === "DefSpec") {
      const searchMatch3 = userMessage.match(/^🔍 Rechercher des formations (.+)$/);
      if (searchMatch3) {
        const specName = searchMatch3[1];
        const info = SPEC_DATA[specName];
        if (info?.searchTerms?.[0]) localStorage.setItem("formationSearchTerm", info.searchTerms[0]);
        onNavigate("formations");
        return { id: Date.now().toString(), text: `Je t'affiche les formations liées à ${specName}`, sender: "bot" };
      }
      if (userMessage === "Retour") {
        setStep("spec_by_project");
        return { id: Date.now().toString(), text: "Clique sur une spécialité pour en savoir plus", sender: "bot" };
      }
    }

    /* ===== SEND TO RIASEC ===== */
    if (step === "send_to_riasec") {
      if (userMessage.includes("test RIASEC")) { onNavigate("riasec-test"); return { id: Date.now().toString(), text: "Je t'emmène vers le test RIASEC", sender: "bot" }; }
      if (userMessage === "Retour") { resetConversation(); return { id: Date.now().toString(), text: "", sender: "bot" }; }
    }

    /* ===== STUDIES ===== */
    if (step === "studies") {
      if (userMessage === "Revenir au début") { resetConversation(); return { id: Date.now().toString(), text: "", sender: "bot" }; }
      const studyKey = Object.keys(studyData).find(k => userMessage === k);
      if (studyKey) {
        setSelectedStudyType(studyKey);
        setStep("study_detail");
        const info = studyData[studyKey];
        return { id: Date.now().toString(), text: `${studyKey}\n\n${info.duration}\n\nAdmission : ${info.level}\n\nProfil : ${info.profile}\n\nAtouts : ${info.advantages}\n\n${info.details}\n\nDébouchés : ${info.outcomes}`, sender: "bot", suggestions: ["Voir les formations liées", "Retour formations"] };
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
        return { id: Date.now().toString(), text: "Je t'affiche les formations correspondantes", sender: "bot" };
      }
      if (userMessage.includes("Retour formations")) {
        setStep("studies");
        return { id: Date.now().toString(), text: "Quel type de formation veux-tu explorer ?", sender: "bot", suggestions: ["Licence", "BUT", "BTS", "Prépa", "Ecoles", "Bachelor", "Revenir au début"] };
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
        introText = `Spécialités 📚\n\nQue veux-tu savoir ?`;
        suggestions = ["📌 Quelles spécialités choisir ?", "❌ Laquelle abandonner ?", "⚖️ Comparer 2 spécialités", "🔄 Mes spécialités sont-elles cohérentes ?", "🔙 Retour"];
      }
      const msg: Message = { id: Date.now().toString(), text: introText, sender: 'bot', suggestions };
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
                <div className="text-sm leading-relaxed">
                  {message.text.split('\n').map((line, i) => {
                    if (line === '') return <div key={i} className="h-2" />;
                    // Ligne titre avec emoji en début (ex: "📚 Maths :", "🎯 Thèmes :")
                    const isSectionTitle = /^[📚🎯🔗✅⚖️💡🎓📊👤⏱️📋💼🌍❌⚠️🔍👋💬😰✈️]/.test(line) && line.includes(':');
                    // Ligne bullet "• "
                    const isBullet = line.trimStart().startsWith('• ') || line.trimStart().startsWith('- ');
                    if (isSectionTitle) {
                      return <p key={i} className="font-semibold mt-2 mb-0.5">{line}</p>;
                    }
                    if (isBullet) {
                      return <p key={i} className="ml-2 text-gray-700">{line}</p>;
                    }
                    // Texte avec **gras**
                    const parts = line.split(/(\*\*[^*]+\*\*)/g);
                    return (
                      <p key={i} className="mb-0.5">
                        {parts.map((part, j) =>
                          part.startsWith('**') && part.endsWith('**')
                            ? <strong key={j}>{part.slice(2, -2)}</strong>
                            : part
                        )}
                      </p>
                    );
                  })}
                </div>
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