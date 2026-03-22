// src/components/Chatbot.tsx — React Native
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Send, RotateCcw } from "lucide-react-native";
import type { UserProfile, Screen } from "../../App";
import { colors } from "../config/colors";
import careersData from "../data/careers_enriched.json";

export interface Career {
  id: string;
  title: string;
  sector: string;
}

const careers: Career[] = careersData as Career[];

interface ChatbotProps {
  userProfile: UserProfile;
  onNavigate: (screen: Screen) => void;
}

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  suggestions?: string[];
}

type ChatStep =
  | "home"
  | "domains_result"
  | "specialties_menu"
  | "spec_seconde_intro"
  | "spec_seconde_known"
  | "spec_seconde_help"
  | "spec_terminale_abandoned"
  | "spec_choose_project"
  | "spec_by_project"
  | "spec_abandon"
  | "spec_compare_pick1"
  | "spec_compare_pick2"
  | "spec_compare_result"
  | "studies"
  | "study_detail"
  | "general"
  | "parcoursup"
  | "alternance"
  | "stress"
  | "gap_year"
  | "international";

type StudyType = "Licence" | "BUT" | "BTS" | "Prépa" | "Ecoles" | "Bachelor";
type RiasecCode = "R" | "I" | "A" | "S" | "E" | "C";

interface SpecialtyInfo {
  description: string;
  profileFit: string;
  studies: string[];
  careers: string[];
  riasecBoost: RiasecCode[];
}

interface DomainInfo {
  description: string;
  profiles: string[];
  studies: string[];
  careers: string[];
}

function getUserStorageId(userProfile?: UserProfile): string {
  if (userProfile?.email?.trim()) {
    return userProfile.email.trim().toLowerCase();
  }

  if (userProfile?.token?.trim()) {
    return userProfile.token.trim();
  }

  return "anonymous";
}

function getChatHistoryKey(userProfile?: UserProfile): string {
  return `chatHistory_${getUserStorageId(userProfile)}`;
}

function getChatStepKey(userProfile?: UserProfile): string {
  return `chatStep_${getUserStorageId(userProfile)}`;
}

async function saveChatHistory(
  userProfile: UserProfile,
  messages: Message[],
  currentStep: ChatStep
) {
  try {
    await AsyncStorage.setItem(
      getChatHistoryKey(userProfile),
      JSON.stringify(messages.slice(-80))
    );
    await AsyncStorage.setItem(getChatStepKey(userProfile), currentStep);
  } catch {
    // ignore
  }
}

async function loadChatStep(userProfile: UserProfile): Promise<ChatStep> {
  try {
    const s = await AsyncStorage.getItem(getChatStepKey(userProfile));
    return (s as ChatStep) ?? "home";
  } catch {
    return "home";
  }
}

async function loadChatHistory(userProfile: UserProfile): Promise<Message[]> {
  try {
    const s = await AsyncStorage.getItem(getChatHistoryKey(userProfile));
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

export async function clearChatHistory(userProfile?: UserProfile) {
  try {
    if (userProfile) {
      await AsyncStorage.multiRemove([
        getChatHistoryKey(userProfile),
        getChatStepKey(userProfile),
      ]);
      return;
    }

    const keys = await AsyncStorage.getAllKeys();
    const chatKeys = keys.filter(
      (key) => key.startsWith("chatHistory_") || key.startsWith("chatStep_")
    );

    if (chatKeys.length > 0) {
      await AsyncStorage.multiRemove(chatKeys);
    }

    await AsyncStorage.multiRemove(["chatHistory", "chatStep"]);
  } catch {
    // ignore
  }
}

const HOME_SUGGESTIONS = [
  "Découvrir mes domaines",
  "Choix des spécialités",
  "Explorer les études",
  "Questions générales",
];

const ALL_SPECIALTIES = [
  "Maths",
  "Physique-Chimie",
  "SVT",
  "SES",
  "HGGSP",
  "LLCA",
  "LLCE",
  "HLP",
  "NSI",
  "SI",
  "Arts",
  "Sports",
];

const PROJECT_EXAMPLES: Record<
  string,
  { label: string; sector: string; specialties: string[] }
> = {
  "Informatique / Dev": {
    label: "Informatique / Dev",
    sector: "Informatique & Numérique",
    specialties: ["NSI", "Maths", "Physique-Chimie"],
  },
  "Médecine / Santé": {
    label: "Médecine / Santé",
    sector: "Santé & Social",
    specialties: ["SVT", "Physique-Chimie", "Maths"],
  },
  "Commerce / Gestion": {
    label: "Commerce / Gestion",
    sector: "Commerce & Gestion",
    specialties: ["SES", "Maths", "HGGSP"],
  },
  "Droit / Sciences Po": {
    label: "Droit / Sciences Po",
    sector: "Administration",
    specialties: ["HGGSP", "SES", "HLP"],
  },
  "Art / Design / Média": {
    label: "Art / Design / Média",
    sector: "Communication & Médias",
    specialties: ["Arts", "LLCE", "HLP"],
  },
  "Recherche / Sciences": {
    label: "Recherche / Sciences",
    sector: "Chimie & Biologie",
    specialties: ["Maths", "SVT", "Physique-Chimie"],
  },
  "Ingénierie / BTP": {
    label: "Ingénierie / BTP",
    sector: "Bâtiment",
    specialties: ["Maths", "Physique-Chimie", "SI"],
  },
  "International / Langues": {
    label: "International / Langues",
    sector: "Hôtellerie & Tourisme",
    specialties: ["LLCE", "HGGSP", "SES"],
  },
};

const RIASEC_NAMES: Record<RiasecCode, string> = {
  R: "Réaliste",
  I: "Investigateur",
  A: "Artistique",
  S: "Social",
  E: "Entreprenant",
  C: "Conventionnel",
};

const RIASEC_TO_DOMAINS: Record<RiasecCode, string[]> = {
  R: ["Ingénierie & Sciences", "Industrie & Technologie", "Agriculture"],
  I: ["Informatique & Numérique", "Recherche & Sciences", "Médecine"],
  A: ["Art & Culture", "Communication & Design", "Architecture"],
  S: ["Social & Éducation", "Santé", "Enseignement"],
  E: ["Commerce & Management", "Entrepreneuriat", "Droit"],
  C: ["Gestion & Finance", "Administration", "Comptabilité"],
};

const RIASEC_TO_SPECIALTIES: Record<RiasecCode, string[]> = {
  R: ["SI", "Physique-Chimie", "Maths"],
  I: ["Maths", "NSI", "Physique-Chimie"],
  A: ["Arts", "LLCE", "HLP"],
  S: ["SES", "HLP", "SVT"],
  E: ["SES", "HGGSP", "Maths"],
  C: ["Maths", "SES", "NSI"],
};

const ALL_DOMAINS = [
  "Ingénierie & Sciences",
  "Industrie & Technologie",
  "Agriculture",
  "Informatique & Numérique",
  "Recherche & Sciences",
  "Médecine",
  "Art & Culture",
  "Communication & Design",
  "Architecture",
  "Social & Éducation",
  "Santé",
  "Enseignement",
  "Commerce & Management",
  "Entrepreneuriat",
  "Droit",
  "Gestion & Finance",
  "Administration",
  "Comptabilité",
];

const DOMAIN_DETAILS: Record<string, DomainInfo> = {
  "Ingénierie & Sciences": {
    description:
      "Le domaine Ingénierie & Sciences regroupe la conception, l’innovation, la recherche appliquée et la résolution de problèmes techniques ou scientifiques. Il convient bien aux profils curieux, rigoureux et attirés par les mathématiques, la physique et les technologies.",
    profiles: ["Réaliste", "Investigateur"],
    studies: ["Prépa scientifique", "BUT", "Licence scientifique", "Écoles d’ingénieurs"],
    careers: ["Ingénieur", "Chercheur", "Chef de projet technique", "Data engineer"],
  },
  "Industrie & Technologie": {
    description:
      "Le domaine Industrie & Technologie concerne les procédés de fabrication, les systèmes industriels, la maintenance, l’automatisation et l’amélioration de la performance technique.",
    profiles: ["Réaliste", "Conventionnel"],
    studies: ["BTS", "BUT", "Licence pro", "École d’ingénieur"],
    careers: ["Technicien", "Ingénieur production", "Responsable maintenance", "Automaticien"],
  },
  Agriculture: {
    description:
      "Le domaine Agriculture rassemble la production agricole, l’agronomie, l’environnement, l’élevage, l’alimentation et la gestion durable des ressources naturelles.",
    profiles: ["Réaliste", "Investigateur"],
    studies: ["BTSA", "BTS", "BUT", "École d’agronomie"],
    careers: ["Agronome", "Technicien agricole", "Ingénieur environnement", "Responsable exploitation"],
  },
  "Informatique & Numérique": {
    description:
      "Le domaine Informatique & Numérique regroupe la programmation, les logiciels, les réseaux, la cybersécurité, la data et l’intelligence artificielle. Il convient aux profils logiques, créatifs et à l’aise avec les outils numériques.",
    profiles: ["Investigateur", "Conventionnel"],
    studies: ["BUT informatique", "Licence informatique", "Prépa", "École d’ingénieur", "Bachelor numérique"],
    careers: ["Développeur", "Data analyst", "Ingénieur cybersécurité", "Architecte logiciel"],
  },
  "Recherche & Sciences": {
    description:
      "Le domaine Recherche & Sciences est tourné vers l’expérimentation, l’analyse, la compréhension du monde et la production de nouvelles connaissances. Il correspond bien aux personnes patientes, rigoureuses et curieuses.",
    profiles: ["Investigateur"],
    studies: ["Licence", "Master", "Doctorat", "Écoles spécialisées"],
    careers: ["Chercheur", "Ingénieur R&D", "Biologiste", "Physicien"],
  },
  Médecine: {
    description:
      "Le domaine Médecine regroupe les études et professions liées à la santé, aux soins, au diagnostic et à la prévention. Il s’adresse aux profils motivés, humains et prêts à s’investir dans des études exigeantes.",
    profiles: ["Social", "Investigateur"],
    studies: ["PASS", "LAS", "IFSI", "Écoles paramédicales"],
    careers: ["Médecin", "Infirmier", "Sage-femme", "Kinésithérapeute"],
  },
  "Art & Culture": {
    description:
      "Le domaine Art & Culture concerne la création, le patrimoine, les métiers culturels, l’expression artistique et la diffusion des œuvres.",
    profiles: ["Artistique"],
    studies: ["Écoles d’art", "Licence arts", "Bachelor design", "Écoles culturelles"],
    careers: ["Artiste", "Designer", "Scénographe", "Chargé de production culturelle"],
  },
  "Communication & Design": {
    description:
      "Le domaine Communication & Design regroupe la création visuelle, la stratégie de communication, le branding, les contenus digitaux et l’expérience utilisateur.",
    profiles: ["Artistique", "Entreprenant"],
    studies: ["Bachelor design", "BUT MMI", "École de communication", "Licence info-com"],
    careers: ["Graphiste", "UX/UI designer", "Chargé de communication", "Directeur artistique"],
  },
  Architecture: {
    description:
      "Le domaine Architecture mêle créativité, technique et réflexion sur l’espace. Il consiste à imaginer et concevoir des bâtiments et des lieux de vie.",
    profiles: ["Artistique", "Réaliste"],
    studies: ["École d’architecture", "BTS design", "Prépa artistique"],
    careers: ["Architecte", "Designer d’espace", "Urbaniste", "Dessinateur projeteur"],
  },
  "Social & Éducation": {
    description:
      "Le domaine Social & Éducation concerne l’accompagnement des personnes, l’aide, l’insertion et la transmission. Il convient aux profils bienveillants et à l’écoute.",
    profiles: ["Social"],
    studies: ["BTS SP3S", "Licence sciences de l’éducation", "Écoles sociales"],
    careers: ["Éducateur", "Assistant social", "Conseiller insertion", "Animateur"],
  },
  Santé: {
    description:
      "Le domaine Santé regroupe les métiers du soin, du bien-être, de la rééducation et de la prévention. Il s’adresse aux personnes qui aiment aider concrètement les autres.",
    profiles: ["Social"],
    studies: ["IFSI", "IFMK", "PASS", "LAS", "Écoles paramédicales"],
    careers: ["Infirmier", "Kiné", "Ergothérapeute", "Manipulateur radio"],
  },
  Enseignement: {
    description:
      "Le domaine Enseignement est centré sur la pédagogie, la transmission des savoirs et l’accompagnement des élèves ou étudiants.",
    profiles: ["Social", "Investigateur"],
    studies: ["Licence", "Master MEEF", "CPGE puis concours"],
    careers: ["Professeur", "Formateur", "Professeur des écoles", "Enseignant spécialisé"],
  },
  "Commerce & Management": {
    description:
      "Le domaine Commerce & Management rassemble la vente, la négociation, le développement commercial, la stratégie et la gestion d’équipe.",
    profiles: ["Entreprenant"],
    studies: ["BTS", "BUT", "Bachelor", "École de commerce", "Licence gestion"],
    careers: ["Commercial", "Business developer", "Manager", "Chef de produit"],
  },
  Entrepreneuriat: {
    description:
      "Le domaine Entrepreneuriat consiste à imaginer, lancer et développer des projets ou des entreprises. Il convient aux personnes autonomes, ambitieuses et créatives.",
    profiles: ["Entreprenant", "Artistique"],
    studies: ["École de commerce", "Bachelor", "Licence gestion", "Incubateurs / parcours entrepreneuriaux"],
    careers: ["Entrepreneur", "Fondateur de startup", "Consultant business", "Chef de projet"],
  },
  Droit: {
    description:
      "Le domaine Droit porte sur les règles qui organisent la société, les institutions, les contrats et les relations entre les personnes et les organisations.",
    profiles: ["Entreprenant", "Conventionnel"],
    studies: ["Licence droit", "Master droit", "IEP", "Écoles spécialisées"],
    careers: ["Juriste", "Avocat", "Magistrat", "Notaire"],
  },
  "Gestion & Finance": {
    description:
      "Le domaine Gestion & Finance concerne l’analyse chiffrée, les budgets, la performance économique et le pilotage financier des organisations.",
    profiles: ["Conventionnel", "Entreprenant"],
    studies: ["BTS CG", "DCG", "Licence gestion", "École de commerce"],
    careers: ["Contrôleur de gestion", "Analyste financier", "Comptable", "Auditeur"],
  },
  Administration: {
    description:
      "Le domaine Administration regroupe l’organisation, la coordination, la gestion des dossiers et le bon fonctionnement des structures publiques ou privées.",
    profiles: ["Conventionnel"],
    studies: ["BTS", "BUT GEA", "Licence administration", "Concours publics"],
    careers: ["Assistant administratif", "Responsable administratif", "Gestionnaire", "Attaché administratif"],
  },
  Comptabilité: {
    description:
      "Le domaine Comptabilité concerne le suivi financier, les écritures comptables, les bilans et la conformité des opérations d’une entreprise.",
    profiles: ["Conventionnel"],
    studies: ["BTS CG", "DCG", "DSCG", "Licence gestion"],
    careers: ["Comptable", "Expert-comptable", "Auditeur", "Gestionnaire paie"],
  },
};

const studyData: Record<
  string,
  {
    duration: string;
    level: string;
    profile: string;
    advantages: string;
    outcomes: string;
  }
> = {
  Licence: {
    duration: "3 ans à l'université",
    level: "Baccalauréat",
    profile: "Autonome, goût pour la spécialisation",
    advantages: "Grande diversité, passerelles vers Master",
    outcomes: "Master (bac+5) ou insertion pro",
  },
  BUT: {
    duration: "3 ans en IUT",
    level: "Baccalauréat — dossier",
    profile: "Aime le concret et les projets en équipe",
    advantages: "24 spécialités, stages obligatoires",
    outcomes: "Insertion directe ou poursuite en Master",
  },
  BTS: {
    duration: "2 ans en lycée",
    level: "Baccalauréat — dossier",
    profile: "Pragmatique, veut entrer rapidement dans la vie active",
    advantages: "Formation professionnalisante, alternance fréquente",
    outcomes: "Insertion rapide ou poursuite d’études",
  },
  Prépa: {
    duration: "2 ans en lycée (CPGE)",
    level: "Baccalauréat — dossier",
    profile: "Travailleur, motivé, aime les défis",
    advantages: "Accès aux grandes écoles",
    outcomes: "Grandes écoles selon filière",
  },
  Ecoles: {
    duration: "3 à 5 ans",
    level: "Bac ou Bac+2 — concours",
    profile: "Motivé par un secteur précis",
    advantages: "Formation ciblée, réseau fort",
    outcomes: "Insertion rapide dans le domaine",
  },
  Bachelor: {
    duration: "3 ans en école privée",
    level: "Baccalauréat — dossier",
    profile: "Aime l'international et les partenariats entreprises",
    advantages: "Orientation pratique, stages fréquents",
    outcomes: "Insertion rapide ou poursuite en Master",
  },
};

const SPECIALTY_DETAILS: Record<string, SpecialtyInfo> = {
  Maths: {
    description:
      "La spécialité Maths approfondit l’algèbre, l’analyse, les probabilités et la géométrie. Elle est centrale pour de nombreuses filières scientifiques, économiques et techniques.",
    profileFit:
      "Elle convient particulièrement aux élèves rigoureux, logiques et à l’aise avec l’abstraction et la résolution de problèmes.",
    studies: [
      "Prépa scientifique",
      "Licence maths",
      "BUT",
      "École d’ingénieur",
      "Économie / finance",
      "Informatique",
    ],
    careers: ["Ingénieur", "Data analyst", "Actuaire", "Développeur", "Professeur de maths"],
    riasecBoost: ["I", "R", "C"],
  },
  "Physique-Chimie": {
    description:
      "La spécialité Physique-Chimie permet de comprendre les phénomènes physiques et chimiques du monde qui nous entoure. Elle est très importante dans les études scientifiques et médicales.",
    profileFit:
      "Elle convient bien aux élèves curieux, expérimentateurs et à l’aise avec la modélisation, les raisonnements logiques et les manipulations.",
    studies: [
      "Prépa scientifique",
      "PASS / LAS",
      "Licence physique ou chimie",
      "École d’ingénieur",
      "Pharmacie",
    ],
    careers: [
      "Ingénieur",
      "Chercheur",
      "Pharmacien",
      "Médecin",
      "Technicien de laboratoire",
    ],
    riasecBoost: ["I", "R"],
  },
  SVT: {
    description:
      "La spécialité SVT étudie le vivant, le corps humain, la planète, l’environnement et les mécanismes biologiques et géologiques.",
    profileFit:
      "Elle convient aux élèves intéressés par la santé, le vivant, l’écologie et les phénomènes naturels.",
    studies: [
      "PASS / LAS",
      "Licence biologie",
      "BTS / BUT santé ou environnement",
      "Écoles paramédicales",
      "Agronomie",
    ],
    careers: [
      "Médecin",
      "Biologiste",
      "Vétérinaire",
      "Infirmier",
      "Chercheur en sciences du vivant",
    ],
    riasecBoost: ["I", "S"],
  },
  SES: {
    description:
      "La spécialité SES explore l’économie, la sociologie et les sciences politiques. Elle permet de comprendre les entreprises, les marchés et le fonctionnement de la société.",
    profileFit:
      "Elle convient aux élèves curieux de l’actualité, des comportements humains, du monde économique et social.",
    studies: [
      "Licence économie-gestion",
      "Licence sociologie",
      "Droit",
      "Sciences politiques",
      "BTS / BUT tertiaires",
      "École de commerce",
    ],
    careers: [
      "Économiste",
      "Chargé d’études",
      "Consultant",
      "Commercial",
      "Responsable marketing",
    ],
    riasecBoost: ["E", "S", "C"],
  },
  HGGSP: {
    description:
      "La spécialité HGGSP traite de l’histoire, de la géopolitique, des relations internationales, des médias, de la démocratie et des grands enjeux du monde contemporain.",
    profileFit:
      "Elle convient bien aux élèves qui aiment analyser, argumenter, comprendre le monde et développer une forte culture générale.",
    studies: [
      "Droit",
      "Sciences politiques",
      "Licence histoire",
      "Journalisme",
      "Relations internationales",
      "Prépas littéraires ou IEP",
    ],
    careers: [
      "Juriste",
      "Journaliste",
      "Diplomate",
      "Consultant en affaires publiques",
      "Chargé de mission",
    ],
    riasecBoost: ["E", "A", "S"],
  },
  LLCA: {
    description:
      "La spécialité LLCA approfondit les langues et cultures de l’Antiquité. Elle développe l’analyse, la culture générale et la compréhension des racines culturelles européennes.",
    profileFit:
      "Elle convient aux élèves attirés par les textes, les langues, l’histoire, la littérature et la culture classique.",
    studies: ["Licence lettres", "Licence histoire", "Droit", "Enseignement", "Prépa littéraire"],
    careers: [
      "Professeur",
      "Chercheur",
      "Éditeur",
      "Conservateur du patrimoine",
      "Journaliste culturel",
    ],
    riasecBoost: ["A", "I"],
  },
  LLCE: {
    description:
      "La spécialité LLCE permet d’approfondir une langue étrangère à travers la littérature, la civilisation, la culture et l’expression.",
    profileFit:
      "Elle convient aux profils curieux, ouverts sur l’international, attirés par les langues, la culture et la communication.",
    studies: [
      "Licence langues",
      "Traduction",
      "Communication",
      "Tourisme",
      "Commerce international",
      "Relations internationales",
    ],
    careers: [
      "Traducteur",
      "Chargé de communication",
      "Professeur de langues",
      "Responsable export",
      "Chef de projet international",
    ],
    riasecBoost: ["A", "S", "E"],
  },
  HLP: {
    description:
      "La spécialité HLP combine humanités, littérature et philosophie. Elle développe la réflexion, l’expression, l’analyse et la capacité à argumenter.",
    profileFit:
      "Elle convient aux élèves qui aiment lire, débattre, rédiger, réfléchir et construire une pensée personnelle.",
    studies: [
      "Droit",
      "Lettres",
      "Philosophie",
      "Communication",
      "Sciences humaines",
      "Prépas littéraires",
    ],
    careers: ["Avocat", "Journaliste", "Professeur", "Rédacteur", "Chargé de communication"],
    riasecBoost: ["A", "S", "E"],
  },
  NSI: {
    description:
      "La spécialité NSI est centrée sur l’informatique : programmation, algorithmique, bases de données, réseaux et architecture des machines.",
    profileFit:
      "Elle convient particulièrement aux élèves logiques, patients, qui aiment construire, coder, tester et résoudre des problèmes.",
    studies: [
      "BUT informatique",
      "Licence informatique",
      "École d’ingénieur",
      "Prépa scientifique",
      "Bachelor numérique",
    ],
    careers: [
      "Développeur",
      "Data scientist",
      "Ingénieur logiciel",
      "Analyste cybersécurité",
      "Chef de projet tech",
    ],
    riasecBoost: ["I", "R", "C"],
  },
  SI: {
    description:
      "La spécialité SI s’intéresse à la conception, au fonctionnement et à l’optimisation des systèmes techniques et industriels.",
    profileFit:
      "Elle convient aux élèves attirés par les objets techniques, la mécanique, les systèmes automatisés et la résolution de problèmes concrets.",
    studies: ["Prépa scientifique", "BUT génie industriel", "BTS techniques", "École d’ingénieur"],
    careers: [
      "Ingénieur mécanique",
      "Automaticien",
      "Chef de projet industriel",
      "Technicien supérieur",
      "Ingénieur systèmes",
    ],
    riasecBoost: ["R", "I"],
  },
  Arts: {
    description:
      "La spécialité Arts développe la créativité, la sensibilité artistique et la culture visuelle ou scénique selon la discipline choisie.",
    profileFit:
      "Elle convient aux élèves créatifs, imaginatifs, sensibles à l’esthétique et attirés par l’expression personnelle.",
    studies: [
      "Écoles d’art",
      "Design",
      "Architecture",
      "Communication visuelle",
      "Licence arts",
      "Bachelor créatif",
    ],
    careers: ["Designer", "Illustrateur", "Directeur artistique", "Scénographe", "Graphiste"],
    riasecBoost: ["A"],
  },
  Sports: {
    description:
      "La spécialité Sports permet d’approfondir les dimensions théoriques et pratiques liées aux activités physiques, à la performance et à l’entraînement.",
    profileFit:
      "Elle convient aux élèves intéressés par l’activité physique, l’accompagnement, la santé, le collectif et la performance.",
    studies: [
      "STAPS",
      "Formations sportives",
      "Préparation physique",
      "Éducation",
      "Paramédical lié au sport",
    ],
    careers: [
      "Coach sportif",
      "Professeur d’EPS",
      "Préparateur physique",
      "Éducateur sportif",
      "Responsable d’activités sportives",
    ],
    riasecBoost: ["S", "R"],
  },
};

function toTitleList(items: string[]): string {
  return items.map((item) => `• ${item}`).join("\n");
}

function getTopRiasec(userProfile: UserProfile): RiasecCode | null {
  const code = userProfile.riasecProfile?.[0];
  if (code && ["R", "I", "A", "S", "E", "C"].includes(code)) {
    return code as RiasecCode;
  }
  return null;
}

function buildRiasecLine(code: RiasecCode | null): string {
  if (!code) return "";
  return `Ton profil RIASEC principal semble être **${code} - ${RIASEC_NAMES[code]}**.`;
}

function getSpecialtyRiasecAdvice(specialty: string, code: RiasecCode | null): string {
  if (!code) {
    return "Je peux être encore plus précis si ton profil RIASEC est renseigné.";
  }

  const info = SPECIALTY_DETAILS[specialty];
  if (!info) return "";

  if (info.riasecBoost.includes(code)) {
    return `🎯 Bonne nouvelle : cette spécialité correspond bien à ton profil **${code} - ${RIASEC_NAMES[code]}**.`;
  }

  const alternatives = RIASEC_TO_SPECIALTIES[code] ?? [];
  return `🎯 Par rapport à ton profil **${code} - ${RIASEC_NAMES[code]}**, elle peut rester intéressante, mais les spécialités les plus naturelles pour toi sont plutôt : **${alternatives
    .slice(0, 3)
    .join(", ")}**.`;
}

function getRecommendedSpecialtiesForUser(
  riasecCode: RiasecCode | null,
  projectLabel?: string
): string[] {
  if (projectLabel && PROJECT_EXAMPLES[projectLabel]) {
    return PROJECT_EXAMPLES[projectLabel].specialties;
  }
  if (riasecCode) {
    return RIASEC_TO_SPECIALTIES[riasecCode] ?? ["Maths", "SES", "HGGSP"];
  }
  return ["Maths", "SES", "HGGSP"];
}

function extractSpecialtiesFromText(text: string): string[] {
  const normalized = text.toLowerCase();
  return ALL_SPECIALTIES.filter((spec) => normalized.includes(spec.toLowerCase()));
}

function getProfileSpecialties(userProfile: UserProfile) {
  const current = Array.isArray(userProfile.specialties) ? userProfile.specialties : [];
  return { current };
}

export default function Chatbot({ userProfile, onNavigate }: ChatbotProps) {
  const flatListRef = useRef<FlatList<Message>>(null);

  const getInitialMessage = useCallback((): Message => {
    const riasecCode = getTopRiasec(userProfile);
    const grade = userProfile.grade;
    const favCareer = careers.find((c) => c.id === userProfile.favoriteJobs?.[0]);
    const { current } = getProfileSpecialties(userProfile);

    let text = "Bonjour 👋 Je suis Oriento, ton assistant d'orientation.";

    if (grade) {
      text += `\nTu es en **${grade}**.`;
    }

    if (riasecCode) {
      text += `\n${buildRiasecLine(riasecCode)}`;
    }

    if (grade === "Première" && current.length > 0) {
      text += `\nTes 3 spécialités sont : **${current.join(", ")}**.`;
    }

    if (grade === "Terminale" && current.length > 0) {
      text += `\nTes spécialités actuelles sont : **${current.join(", ")}**.`;
    }

    if (favCareer) {
      text += `\nTu t'intéresses au métier de **${favCareer.title}**.`;
    }

    text += "\n\nQue veux-tu explorer ?";

    return {
      id: "init",
      text,
      sender: "bot",
      suggestions: HOME_SUGGESTIONS,
    };
  }, [userProfile]);

  const [messages, setMessages] = useState<Message[]>([getInitialMessage()]);
  const [step, setStep] = useState<ChatStep>("home");
  const [input, setInput] = useState("");
  const [compareSpec1, setCompareSpec1] = useState<string | null>(null);
  const [secondeHasIdeas, setSecondeHasIdeas] = useState<boolean | null>(null);
  const [abandonedSpecialty, setAbandonedSpecialty] = useState<string | null>(null);

  useEffect(() => {
    const restoreChat = async () => {
      const [history, savedStep] = await Promise.all([
        loadChatHistory(userProfile),
        loadChatStep(userProfile),
      ]);

      if (history.length > 0) {
        setMessages(history);
        setStep(savedStep);
      } else {
        setMessages([getInitialMessage()]);
        setStep("home");
      }

      setCompareSpec1(null);
      setSecondeHasIdeas(null);
      setAbandonedSpecialty(null);
      setInput("");
    };

    restoreChat();
  }, [getInitialMessage, userProfile.email, userProfile.token]);

  useEffect(() => {
    saveChatHistory(userProfile, messages, step);
  }, [messages, step, userProfile.email, userProfile.token]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    return () => clearTimeout(timeout);
  }, [messages]);

  const resetConversation = useCallback(async () => {
    await clearChatHistory(userProfile);
    setStep("home");
    setCompareSpec1(null);
    setSecondeHasIdeas(null);
    setAbandonedSpecialty(null);
    setInput("");
    setMessages([getInitialMessage()]);
  }, [getInitialMessage, userProfile]);

  const addBotMessage = (msg: Message) => {
    if (msg.text.trim() !== "") {
      setMessages((prev) => [...prev, msg]);
    }
  };

  const generateDomainMessage = (domain: string, riasecCode: RiasecCode | null): Message => {
    const id = Date.now().toString();
    const detail = DOMAIN_DETAILS[domain];

    let text = `**${domain}**\n\n${detail.description}\n\n`;
    text += `👤 Profils souvent à l’aise dans ce domaine :\n${toTitleList(detail.profiles)}\n\n`;
    text += `🎓 Études possibles :\n${toTitleList(detail.studies)}\n\n`;
    text += `💼 Métiers liés :\n${toTitleList(detail.careers)}`;

    if (riasecCode) {
      const recommendedDomains = RIASEC_TO_DOMAINS[riasecCode] ?? [];
      if (recommendedDomains.includes(domain)) {
        text += `\n\n🎯 Ce domaine est cohérent avec ton profil **${riasecCode} - ${RIASEC_NAMES[riasecCode]}**.`;
      } else {
        text += `\n\n🎯 Ce domaine peut t’intéresser, mais ton profil **${riasecCode} - ${RIASEC_NAMES[riasecCode]}** t’oriente d’abord vers : **${recommendedDomains
          .slice(0, 3)
          .join(", ")}**.`;
      }
    }

    text += "\n\nQue veux-tu faire ensuite ?";

    return {
      id,
      text,
      sender: "bot",
      suggestions: [
        "Voir les métiers de ce domaine",
        "Voir les formations de ce domaine",
        "Retour aux domaines",
      ],
    };
  };

  const generateSpecialtyMessage = (specialty: string, riasecCode: RiasecCode | null): Message => {
    const id = Date.now().toString();
    const info = SPECIALTY_DETAILS[specialty];

    let text = `**${specialty}**\n\n${info.description}\n\n`;
    text += `👤 Profil type : ${info.profileFit}\n\n`;
    text += `🎓 Études souvent accessibles ou cohérentes après cette spécialité :\n${toTitleList(
      info.studies
    )}\n\n`;
    text += `💼 Métiers directement liés ou très cohérents :\n${toTitleList(info.careers)}\n\n`;
    text += getSpecialtyRiasecAdvice(specialty, riasecCode);
    text += "\n\nQue veux-tu faire ensuite ?";

    return {
      id,
      text,
      sender: "bot",
      suggestions: ["Comparer 2 spécialités", "Retour"],
    };
  };

  const generateBotResponse = (userMessage: string): Message => {
    const id = Date.now().toString();
    const riasecCode = getTopRiasec(userProfile);
    const hasRiasec = !!riasecCode;
    const grade = userProfile.grade;
    const { current } = getProfileSpecialties(userProfile);

    const specs = current;
    const terminaleSpecs = grade === "Terminale" ? current : [];

    const favCareer = careers.find((c) => c.id === userProfile.favoriteJobs?.[0]);

    if (userMessage === "Voir mes recommandations") {
      const recSpecs = getRecommendedSpecialtiesForUser(riasecCode);

      let text = "Voici mes recommandations prioritaires pour toi :\n\n";
      text += `• ${recSpecs.join("\n• ")}`;

      if (riasecCode) {
        text += `\n\n🎯 Elles sont cohérentes avec ton profil **${riasecCode} - ${RIASEC_NAMES[riasecCode]}**.`;
      }

      text += "\n\nClique sur une spécialité pour voir les études et métiers liés.";

      return {
        id,
        text,
        sender: "bot",
        suggestions: [...recSpecs, "Comparer 2 spécialités", "Retour"],
      };
    }

    if (step === "home") {
      if (userMessage.includes("Découvrir mes domaines")) {
        setStep("domains_result");
        const domains = riasecCode
          ? RIASEC_TO_DOMAINS[riasecCode] ?? ["Commerce & Management"]
          : ["Commerce & Management"];

        let text = hasRiasec
          ? `D'après ton profil **${riasecCode} - ${RIASEC_NAMES[riasecCode]}**, tu sembles attiré par :\n\n• ${domains.join("\n• ")}`
          : `Voici quelques domaines à explorer :\n\n• ${domains.join("\n• ")}`;

        if (favCareer) {
          text += `\n\nTon métier favori est dans le secteur **${favCareer.sector}**.`;
        }

        text += "\n\nClique sur un domaine pour obtenir une explication détaillée.";

        return {
          id,
          text,
          sender: "bot",
          suggestions: [...domains, "🔍 Explorer d'autres domaines", "🔄 Revenir au début"],
        };
      }

      if (userMessage.includes("Choix des spécialités")) {
        if (!grade) {
          return {
            id,
            text: "Je ne trouve pas ta classe. Mets à jour ton profil d'abord.",
            sender: "bot",
            suggestions: ["Retour"],
          };
        }

        if (grade === "Seconde") {
          setStep("spec_seconde_intro");

          let text =
            "Tu es en **Seconde**.\n\nTu n’as pas encore de spécialités, donc je vais t’aider à réfléchir à celles que tu pourrais choisir pour la Première.";
          if (riasecCode) {
            text += `\n\n🎯 Ton profil **${riasecCode} - ${RIASEC_NAMES[riasecCode]}** me donnera déjà de bonnes pistes.`;
          }
          text += "\n\nEst-ce que tu sais déjà ce que tu aimerais prendre ?";

          return {
            id,
            text,
            sender: "bot",
            suggestions: ["Oui, j'ai déjà une idée", "Non, je ne sais pas", "Retour"],
          };
        }

        if (grade === "Première") {
          setStep("specialties_menu");

          let text = "Tu es en **Première**.";
          if (specs.length > 0) {
            text += `\nTes 3 spécialités dans ton profil sont : **${specs.join(", ")}**.`;
          }

          if (riasecCode) {
            text += `\n\n🎯 Selon ton profil **${riasecCode} - ${RIASEC_NAMES[riasecCode]}**, les spécialités souvent adaptées sont : **${(
              RIASEC_TO_SPECIALTIES[riasecCode] ?? []
            ).join(", ")}**.`;
          }

          text += "\n\nQue veux-tu savoir sur les spécialités ?";

          return {
            id,
            text,
            sender: "bot",
            suggestions: [
              "Quelles spécialités choisir ?",
              "Comparer 2 spécialités",
              "Laquelle abandonner en Terminale ?",
              "Retour",
            ],
          };
        }

        if (grade === "Terminale") {
          setStep("spec_terminale_abandoned");

          let text = "Tu es en **Terminale**.";
          if (terminaleSpecs.length > 0) {
            text += `\nTes spécialités actuelles sont : **${terminaleSpecs.join(", ")}**.`;
          }

          text +=
            "\n\nPour bien raisonner sur ton parcours, quelle spécialité avais-tu en Première et as-tu abandonnée pour la Terminale ?";

          return {
            id,
            text,
            sender: "bot",
            suggestions: [
              ...ALL_SPECIALTIES.filter((s) => !terminaleSpecs.includes(s)),
              "Je ne sais plus",
              "Retour",
            ],
          };
        }

        setStep("specialties_menu");
        return {
          id,
          text: "Que veux-tu savoir sur les spécialités ?",
          sender: "bot",
          suggestions: ["Quelles spécialités choisir ?", "Comparer 2 spécialités", "Retour"],
        };
      }

      if (userMessage.includes("Explorer les études")) {
        setStep("studies");
        let text = "Quel type de formation veux-tu explorer ? 🎓";

        if (hasRiasec && riasecCode) {
          const rec =
            riasecCode === "I" || riasecCode === "R"
              ? "Prépa ou BUT scientifique"
              : riasecCode === "E"
              ? "Bachelor ou école de commerce"
              : riasecCode === "S"
              ? "Licence ou BTS social/santé"
              : riasecCode === "A"
              ? "École d'art ou Bachelor créatif"
              : "Licence ou BUT";

          text += `\n\nD'après ton profil **${riasecCode}**, je recommande : **${rec}**.`;
        }

        return {
          id,
          text,
          sender: "bot",
          suggestions: ["Licence", "BUT", "BTS", "Prépa", "Ecoles", "Bachelor", "Retour"],
        };
      }

      if (userMessage.includes("Questions générales")) {
        setStep("general");
        return {
          id,
          text: "Sur quel sujet as-tu des questions ?",
          sender: "bot",
          suggestions: [
            "Parcoursup",
            "L'alternance",
            "Gérer le stress",
            "Année de césure",
            "Études à l'étranger",
            "Retour",
          ],
        };
      }
    }

    if (step === "spec_seconde_intro") {
      if (userMessage === "Retour") {
        setStep("home");
        return {
          id,
          text: "Que veux-tu explorer ?",
          sender: "bot",
          suggestions: HOME_SUGGESTIONS,
        };
      }

      if (userMessage.includes("Oui")) {
        setSecondeHasIdeas(true);
        setStep("spec_seconde_known");

        return {
          id,
          text:
            "Super. Quelles spécialités envisages-tu ?\n\nTu peux m’en écrire plusieurs ou cliquer dessus.",
          sender: "bot",
          suggestions: [...ALL_SPECIALTIES, "Finalement je ne sais pas", "Retour"],
        };
      }

      if (userMessage.includes("Non")) {
        setSecondeHasIdeas(false);
        setStep("spec_seconde_help");

        let text =
          "Pas de souci, je vais t’aider.\n\nPour faire un bon choix, on peut partir de ton profil et de ton projet.";
        if (riasecCode) {
          text += `\n\n🎯 Avec ton profil **${riasecCode} - ${RIASEC_NAMES[riasecCode]}**, les spécialités qui ressortent d’abord sont : **${(
            RIASEC_TO_SPECIALTIES[riasecCode] ?? []
          ).join(", ")}**.`;
        }
        text += "\n\nEst-ce que tu as déjà une idée de ce que tu aimerais faire après le bac ?";

        return {
          id,
          text,
          sender: "bot",
          suggestions: [...Object.keys(PROJECT_EXAMPLES), "Pas encore d'idée", "Retour"],
        };
      }
    }

    if (step === "spec_seconde_known") {
      if (userMessage === "Retour") {
        setStep("spec_seconde_intro");
        return {
          id,
          text: "Est-ce que tu sais déjà quelles spécialités tu aimerais prendre en Première ?",
          sender: "bot",
          suggestions: ["Oui, j'ai déjà une idée", "Non, je ne sais pas", "Retour"],
        };
      }

      if (userMessage.includes("Finalement je ne sais pas")) {
        setStep("spec_seconde_help");
        return {
          id,
          text:
            "D’accord. On repart de zéro.\n\nEst-ce que tu as déjà une idée de projet après le bac ?",
          sender: "bot",
          suggestions: [...Object.keys(PROJECT_EXAMPLES), "Pas encore d'idée", "Retour"],
        };
      }

      if (ALL_SPECIALTIES.includes(userMessage)) {
        return generateSpecialtyMessage(userMessage, riasecCode);
      }

      const selectedSpecs = extractSpecialtiesFromText(userMessage);

      if (selectedSpecs.length > 0) {
        const recommended = riasecCode ? RIASEC_TO_SPECIALTIES[riasecCode] ?? [] : [];
        const matching = selectedSpecs.filter((s) => recommended.includes(s));
        const nonMatching = selectedSpecs.filter((s) => !recommended.includes(s));

        let text = `Tu envisages : **${selectedSpecs.join(", ")}**.\n\n`;

        if (riasecCode) {
          if (matching.length > 0) {
            text += `✅ C’est cohérent avec ton profil pour : **${matching.join(", ")}**.\n`;
          }
          if (nonMatching.length > 0) {
            text += `⚠️ Ces spécialités peuvent rester possibles, mais elles sont moins naturelles selon ton profil : **${nonMatching.join(", ")}**.\n`;
          }
          text += `\n🎯 Mes recommandations prioritaires pour toi seraient : **${recommended
            .slice(0, 3)
            .join(", ")}**.`;
        } else {
          text += "Je peux être encore plus précis si ton profil RIASEC est renseigné.";
        }

        text += "\n\nQue veux-tu faire maintenant ?";

        return {
          id,
          text,
          sender: "bot",
          suggestions: [
            ...selectedSpecs,
            "Comparer 2 spécialités",
            "Voir mes recommandations",
            "Retour",
          ],
        };
      }

      return {
        id,
        text:
          "Je n’ai pas bien reconnu les spécialités. Clique dans la liste ou écris-les comme dans le menu.",
        sender: "bot",
        suggestions: [...ALL_SPECIALTIES, "Finalement je ne sais pas", "Retour"],
      };
    }

    if (step === "spec_seconde_help") {
      if (userMessage === "Retour") {
        setStep("spec_seconde_intro");
        return {
          id,
          text: "Est-ce que tu sais déjà quelles spécialités tu aimerais prendre en Première ?",
          sender: "bot",
          suggestions: ["Oui, j'ai déjà une idée", "Non, je ne sais pas", "Retour"],
        };
      }

      if (userMessage === "Pas encore d'idée") {
        const recSpecs = getRecommendedSpecialtiesForUser(riasecCode);

        let text = "D’accord.\n\n";
        if (riasecCode) {
          text += `🎯 Avec ton profil **${riasecCode} - ${RIASEC_NAMES[riasecCode]}**, je te conseillerais d’abord :\n\n• ${recSpecs.join(
            "\n• "
          )}`;
        } else {
          text += "Sans projet précis, les spécialités les plus ouvertes sont souvent :\n\n• Maths\n• SES\n• HGGSP";
        }

        text +=
          "\n\nCes choix te laissent plusieurs portes ouvertes. Clique sur une spécialité pour voir ce qu’elle permet.";

        return {
          id,
          text,
          sender: "bot",
          suggestions: [...recSpecs, "Comparer 2 spécialités", "Retour"],
        };
      }

      const project = PROJECT_EXAMPLES[userMessage];
      if (project) {
        const recSpecs = project.specialties;
        let text = `Pour un projet **${project.label}**, les spécialités les plus cohérentes sont :\n\n• ${recSpecs.join(
          "\n• "
        )}`;

        if (riasecCode) {
          const riasecSpecs = RIASEC_TO_SPECIALTIES[riasecCode] ?? [];
          const overlap = recSpecs.filter((s) => riasecSpecs.includes(s));

          if (overlap.length > 0) {
            text += `\n\n🎯 Bonne nouvelle : **${overlap.join(", ")}** sont aussi cohérentes avec ton profil **${riasecCode}**.`;
          }
        }

        text += "\n\nClique sur une spécialité pour voir les études et métiers liés.";

        return {
          id,
          text,
          sender: "bot",
          suggestions: [...recSpecs, "Comparer 2 spécialités", "Retour"],
        };
      }

      if (ALL_SPECIALTIES.includes(userMessage)) {
        return generateSpecialtyMessage(userMessage, riasecCode);
      }
    }

    if (step === "spec_terminale_abandoned") {
      if (userMessage === "Retour") {
        setStep("home");
        return {
          id,
          text: "Que veux-tu explorer ?",
          sender: "bot",
          suggestions: HOME_SUGGESTIONS,
        };
      }

      if (userMessage === "Je ne sais plus") {
        setStep("specialties_menu");
        return {
          id,
          text:
            "Ce n’est pas grave. Je vais raisonner à partir de tes spécialités actuelles de Terminale.\n\nQue veux-tu savoir sur les spécialités ?",
          sender: "bot",
          suggestions: ["Quelles spécialités choisir ?", "Comparer 2 spécialités", "Retour"],
        };
      }

      if (ALL_SPECIALTIES.includes(userMessage)) {
        setAbandonedSpecialty(userMessage);
        setStep("specialties_menu");

        let text = `D’accord, tu as donc abandonné **${userMessage}** après la Première.`;

        if (terminaleSpecs.length > 0) {
          text += `\nTes spécialités actuelles en Terminale sont : **${terminaleSpecs.join(", ")}**.`;
        }

        text += "\n\nQue veux-tu savoir sur les spécialités ?";

        return {
          id,
          text,
          sender: "bot",
          suggestions: ["Quelles spécialités choisir ?", "Comparer 2 spécialités", "Retour"],
        };
      }

      return {
        id,
        text:
          "Je n’ai pas reconnu cette spécialité. Clique dans la liste pour me dire celle que tu as abandonnée après la Première.",
        sender: "bot",
        suggestions: [
          ...ALL_SPECIALTIES.filter((s) => !terminaleSpecs.includes(s)),
          "Je ne sais plus",
          "Retour",
        ],
      };
    }

    if (step === "domains_result") {
      if (userMessage === "🔄 Revenir au début") {
        setTimeout(() => {
          resetConversation();
        }, 0);

        return {
          id,
          text: "Conversation réinitialisée ✅",
          sender: "bot",
          suggestions: HOME_SUGGESTIONS,
        };
      }

      if (userMessage === "🔍 Explorer d'autres domaines") {
        return {
          id,
          text: "Voici tous les domaines disponibles. Clique sur celui qui t'intéresse :",
          sender: "bot",
          suggestions: [...ALL_DOMAINS, "🔄 Revenir au début"],
        };
      }

      const matchedDomain = ALL_DOMAINS.find((d) => userMessage === d);
      if (matchedDomain) {
        return generateDomainMessage(matchedDomain, riasecCode);
      }

      if (userMessage.includes("métiers")) {
        onNavigate("careers");
        return { id, text: "Je t'emmène vers les métiers 🎯", sender: "bot" };
      }

      if (userMessage.includes("formations")) {
        onNavigate("formations");
        return { id, text: "Je t'emmène vers les formations 🎓", sender: "bot" };
      }

      if (userMessage.includes("Retour aux domaines")) {
        const domains = riasecCode
          ? RIASEC_TO_DOMAINS[riasecCode] ?? ["Commerce & Management"]
          : ["Commerce & Management"];

        return {
          id,
          text: "Choisis un domaine à explorer :",
          sender: "bot",
          suggestions: [...domains, "🔍 Explorer d'autres domaines", "🔄 Revenir au début"],
        };
      }
    }

    if (step === "specialties_menu") {
      if (userMessage === "Retour") {
        if (grade === "Seconde") {
          setStep("spec_seconde_intro");
          return {
            id,
            text: "Est-ce que tu sais déjà ce que tu aimerais prendre comme spécialités en Première ?",
            sender: "bot",
            suggestions: ["Oui, j'ai déjà une idée", "Non, je ne sais pas", "Retour"],
          };
        }

        if (grade === "Terminale") {
          setStep("spec_terminale_abandoned");
          return {
            id,
            text:
              "Rappelle-moi : quelle spécialité avais-tu en Première et as-tu abandonnée pour la Terminale ?",
            sender: "bot",
            suggestions: [
              ...ALL_SPECIALTIES.filter((s) => !terminaleSpecs.includes(s)),
              "Je ne sais plus",
              "Retour",
            ],
          };
        }

        setStep("home");
        return {
          id,
          text: "Que veux-tu explorer ?",
          sender: "bot",
          suggestions: HOME_SUGGESTIONS,
        };
      }

      if (userMessage.includes("Quelles spécialités")) {
        setStep("spec_choose_project");
        let text = "Pour te conseiller au mieux, quel est ton projet après le bac ?";

        if (riasecCode) {
          const recSpecs = RIASEC_TO_SPECIALTIES[riasecCode] ?? [];
          text += `\n\n🎯 D'après ton profil **${riasecCode}**, je recommande déjà : **${recSpecs
            .slice(0, 3)
            .join(", ")}**.`;
        }

        if (grade === "Première" && specs.length > 0) {
          text += `\n\nJe prends en compte tes 3 spécialités de Première : **${specs.join(", ")}**.`;
        }

        if (grade === "Terminale" && terminaleSpecs.length > 0) {
          text += `\n\nJe prends en compte tes spécialités actuelles de Terminale : **${terminaleSpecs.join(
            ", "
          )}**.`;
        }

        if (grade === "Terminale" && abandonedSpecialty) {
          text += `\nEt la spécialité abandonnée après la Première : **${abandonedSpecialty}**.`;
        }

        return {
          id,
          text,
          sender: "bot",
          suggestions: [...Object.keys(PROJECT_EXAMPLES), "Pas encore d'idée", "Retour"],
        };
      }

      if (userMessage.includes("abandonner")) {
        if (!specs || specs.length < 2) {
          return {
            id,
            text: "Je n'ai pas assez d'informations pour comparer tes spécialités.",
            sender: "bot",
            suggestions: ["Retour"],
          };
        }

        setStep("spec_abandon");
        let text = `Tes spécialités de Première sont : **${specs.join(
          ", "
        )}**\n\nPour t'aider à choisir laquelle abandonner`;

        if (favCareer) {
          text += ` en lien avec ton intérêt pour **${favCareer.title}**`;
        }

        text += ", indique ton projet :";

        return {
          id,
          text,
          sender: "bot",
          suggestions: [...Object.keys(PROJECT_EXAMPLES), "Retour"],
        };
      }

      if (userMessage.includes("Comparer")) {
        setStep("spec_compare_pick1");
        return {
          id,
          text: "Quelle est la 1ère spécialité à comparer ?",
          sender: "bot",
          suggestions: [...ALL_SPECIALTIES, "Retour"],
        };
      }
    }

    if (step === "spec_choose_project" || step === "spec_abandon") {
      if (userMessage === "Retour") {
        setStep("specialties_menu");
        return {
          id,
          text: "Que veux-tu savoir sur les spécialités ?",
          sender: "bot",
          suggestions: [
            "Quelles spécialités choisir ?",
            "Comparer 2 spécialités",
            ...(grade === "Première" ? ["Laquelle abandonner en Terminale ?"] : []),
            "Retour",
          ],
        };
      }

      if (userMessage === "Pas encore d'idée") {
        const recSpecs = riasecCode
          ? RIASEC_TO_SPECIALTIES[riasecCode] ?? ["Maths", "SES"]
          : ["Maths", "SES"];

        let text = hasRiasec
          ? `D'après ton profil **${riasecCode} - ${RIASEC_NAMES[riasecCode]}**, voici les spécialités recommandées :\n\n• ${recSpecs.join(
              "\n• "
            )}`
          : `Voici les spécialités les plus polyvalentes :\n\n• Maths\n• SES\n• HGGSP`;

        if (specs.length > 0 && grade === "Première") {
          text += `\n\nTu as déjà dans ton profil : **${specs.join(", ")}**.`;
        }

        if (grade === "Terminale" && terminaleSpecs.length > 0) {
          text += `\n\nTes spécialités actuelles en Terminale sont : **${terminaleSpecs.join(", ")}**.`;
        }

        if (grade === "Terminale" && abandonedSpecialty) {
          text += `\nTu as abandonné : **${abandonedSpecialty}**.`;
        }

        text += "\n\nClique sur une spécialité pour avoir une fiche détaillée.";

        return {
          id,
          text,
          sender: "bot",
          suggestions: [...recSpecs, "Comparer 2 spécialités", "Retour"],
        };
      }

      const project = PROJECT_EXAMPLES[userMessage];
      if (project) {
        setStep("spec_by_project");
        let text = `Pour **${project.label}**, voici les spécialités recommandées :\n\n• ${project.specialties.join(
          "\n• "
        )}`;

        if (specs.length > 0 && grade === "Première") {
          const matching = specs.filter((s) => project.specialties.includes(s));
          const missing = project.specialties.filter((s) => !specs.includes(s));

          if (matching.length > 0) {
            text += `\n\n✅ Tu as déjà : **${matching.join(", ")}**`;
          }
          if (missing.length > 0) {
            text += `\n⚠️ Il te manque : **${missing.join(", ")}**`;
          }
        }

        if (grade === "Terminale" && terminaleSpecs.length > 0) {
          const terminaleMatch = terminaleSpecs.filter((s) =>
            project.specialties.includes(s)
          );

          if (terminaleMatch.length > 0) {
            text += `\n\n🎓 En Terminale, tes spécialités actuelles cohérentes sont : **${terminaleMatch.join(
              ", "
            )}**.`;
          }
        }

        if (grade === "Terminale" && abandonedSpecialty) {
          if (project.specialties.includes(abandonedSpecialty)) {
            text += `\n⚠️ La spécialité abandonnée **${abandonedSpecialty}** était aussi cohérente avec ce projet.`;
          }
        }

        text += "\n\nClique sur une spécialité pour en savoir plus :";

        return {
          id,
          text,
          sender: "bot",
          suggestions: [...project.specialties, "Comparer 2 spécialités", "Retour"],
        };
      }

      return {
        id,
        text: "Je n'ai pas reconnu ce projet. Choisis dans la liste :",
        sender: "bot",
        suggestions: [...Object.keys(PROJECT_EXAMPLES), "Pas encore d'idée", "Retour"],
      };
    }

    if (step === "spec_by_project") {
      if (userMessage === "Retour") {
        setStep("specialties_menu");
        return {
          id,
          text: "Que veux-tu savoir sur les spécialités ?",
          sender: "bot",
          suggestions: [
            "Quelles spécialités choisir ?",
            "Comparer 2 spécialités",
            ...(grade === "Première" ? ["Laquelle abandonner en Terminale ?"] : []),
            "Retour",
          ],
        };
      }

      if (userMessage.includes("Comparer")) {
        setStep("spec_compare_pick1");
        return {
          id,
          text: "Quelle est la 1ère spécialité à comparer ?",
          sender: "bot",
          suggestions: [...ALL_SPECIALTIES, "Retour"],
        };
      }

      if (ALL_SPECIALTIES.includes(userMessage)) {
        return generateSpecialtyMessage(userMessage, riasecCode);
      }
    }

    if (step === "spec_compare_pick1") {
      if (userMessage === "Retour") {
        setStep("specialties_menu");
        return {
          id,
          text: "Que veux-tu savoir sur les spécialités ?",
          sender: "bot",
          suggestions: [
            "Quelles spécialités choisir ?",
            "Comparer 2 spécialités",
            ...(grade === "Première" ? ["Laquelle abandonner en Terminale ?"] : []),
            "Retour",
          ],
        };
      }

      if (ALL_SPECIALTIES.includes(userMessage)) {
        setCompareSpec1(userMessage);
        setStep("spec_compare_pick2");

        return {
          id,
          text: `OK, **${userMessage}** vs... quelle autre spécialité ?`,
          sender: "bot",
          suggestions: [...ALL_SPECIALTIES.filter((s) => s !== userMessage), "Retour"],
        };
      }
    }

    if (step === "spec_compare_pick2") {
      if (userMessage === "Retour") {
        setStep("spec_compare_pick1");
        return {
          id,
          text: "Quelle est la 1ère spécialité à comparer ?",
          sender: "bot",
          suggestions: [...ALL_SPECIALTIES, "Retour"],
        };
      }

      if (compareSpec1 && ALL_SPECIALTIES.includes(userMessage)) {
        setStep("spec_compare_result");

        const s1 = compareSpec1;
        const s2 = userMessage;
        const hasS1 =
          specs.includes(s1) || terminaleSpecs.includes(s1) || abandonedSpecialty === s1;
        const hasS2 =
          specs.includes(s2) || terminaleSpecs.includes(s2) || abandonedSpecialty === s2;
        const recSpecs = riasecCode ? RIASEC_TO_SPECIALTIES[riasecCode] ?? [] : [];

        let text = `**${s1}** vs **${s2}**\n\n`;

        if (hasS1 && !hasS2) {
          text += `✅ Tu as déjà **${s1}** dans ton parcours.\n`;
        } else if (!hasS1 && hasS2) {
          text += `✅ Tu as déjà **${s2}** dans ton parcours.\n`;
        }

        if (riasecCode) {
          const rec1 = recSpecs.includes(s1);
          const rec2 = recSpecs.includes(s2);

          if (rec1 && !rec2) {
            text += `🎯 Pour ton profil **${riasecCode}**, **${s1}** est plus recommandée.\n`;
          } else if (!rec1 && rec2) {
            text += `🎯 Pour ton profil **${riasecCode}**, **${s2}** est plus recommandée.\n`;
          } else {
            text += `🎯 Les deux restent cohérentes avec ton profil **${riasecCode}**.\n`;
          }
        } else {
          text += `**${s1}** et **${s2}** n’ouvrent pas forcément vers les mêmes études. Le choix dépend surtout de ton projet.\n`;
        }

        text += `\n**${s1}** ouvre notamment vers : ${SPECIALTY_DETAILS[s1]?.studies
          .slice(0, 3)
          .join(", ")}.\n`;
        text += `**${s2}** ouvre notamment vers : ${SPECIALTY_DETAILS[s2]?.studies
          .slice(0, 3)
          .join(", ")}.\n`;

        if (favCareer) {
          text += `\nPar rapport à ton intérêt pour **${favCareer.title}**, choisis celle qui rapproche le plus de ce type d’études.`;
        } else {
          text += "\nChoisis selon tes points forts, ton intérêt et les études que tu vises.";
        }

        return {
          id,
          text,
          sender: "bot",
          suggestions: ["Comparer deux autres", "Retour"],
        };
      }
    }

    if (step === "spec_compare_result") {
      if (userMessage.includes("Comparer deux autres")) {
        setCompareSpec1(null);
        setStep("spec_compare_pick1");
        return {
          id,
          text: "Quelle est la 1ère spécialité à comparer ?",
          sender: "bot",
          suggestions: [...ALL_SPECIALTIES, "Retour"],
        };
      }

      if (userMessage === "Retour") {
        setStep("specialties_menu");
        return {
          id,
          text: "Retour aux spécialités",
          sender: "bot",
          suggestions: [
            "Quelles spécialités choisir ?",
            "Comparer 2 spécialités",
            ...(grade === "Première" ? ["Laquelle abandonner en Terminale ?"] : []),
            "Retour",
          ],
        };
      }
    }

    if (step === "studies") {
      if (userMessage === "Retour") {
        setStep("home");
        return {
          id,
          text: "Que veux-tu explorer ?",
          sender: "bot",
          suggestions: HOME_SUGGESTIONS,
        };
      }

      const studyKey = Object.keys(studyData).find((k) => userMessage === k) as
        | StudyType
        | undefined;

      if (studyKey) {
        setStep("study_detail");
        const info = studyData[studyKey];

        let text = `**${studyKey}**\n\n${info.duration}\nAdmission : ${info.level}\nProfil : ${info.profile}\nAtouts : ${info.advantages}\nDébouchés : ${info.outcomes}`;

        if (riasecCode) {
          const match =
            ((riasecCode === "I" || riasecCode === "R") &&
              (studyKey === "Prépa" || studyKey === "BUT")) ||
            (riasecCode === "E" &&
              (studyKey === "Bachelor" || studyKey === "Ecoles")) ||
            (riasecCode === "S" &&
              (studyKey === "Licence" || studyKey === "BTS"));

          if (match) {
            text += `\n\n⭐ Cette formation correspond bien à ton profil **${riasecCode}**.`;
          }
        }

        return {
          id,
          text,
          sender: "bot",
          suggestions: ["Voir les formations liées", "Retour formations"],
        };
      }
    }

    if (step === "study_detail") {
      if (userMessage.includes("formations")) {
        onNavigate("formations");
        return { id, text: "Je t'affiche les formations correspondantes 🎓", sender: "bot" };
      }

      if (userMessage.includes("Retour")) {
        setStep("studies");
        return {
          id,
          text: "Quel type de formation veux-tu explorer ?",
          sender: "bot",
          suggestions: ["Licence", "BUT", "BTS", "Prépa", "Ecoles", "Bachelor", "Retour"],
        };
      }
    }

    if (step === "general") {
      if (userMessage === "Retour") {
        setStep("home");
        return {
          id,
          text: "Que veux-tu explorer ?",
          sender: "bot",
          suggestions: HOME_SUGGESTIONS,
        };
      }

      if (userMessage.includes("Parcoursup")) {
        setStep("parcoursup");
        return {
          id,
          text: "📋 Parcoursup — Que veux-tu savoir ?",
          sender: "bot",
          suggestions: [
            "Les dates clés",
            "Comment rédiger ma lettre ?",
            "Comment fonctionne l'algorithme ?",
            "J'ai été refusé partout",
            "Retour",
          ],
        };
      }

      if (userMessage.includes("alternance")) {
        setStep("alternance");
        return {
          id,
          text: "🔄 L'alternance — Que veux-tu savoir ?",
          sender: "bot",
          suggestions: [
            "C'est quoi l'alternance ?",
            "Avantages et inconvénients",
            "Comment trouver une entreprise ?",
            "Quelles formations en alternance ?",
            "Retour",
          ],
        };
      }

      if (userMessage.includes("stress")) {
        setStep("stress");
        return {
          id,
          text: "😰 Gérer le stress — Que veux-tu savoir ?",
          sender: "bot",
          suggestions: [
            "Je ne sais pas quoi choisir",
            "J'ai peur de me tromper",
            "Comment rester motivé ?",
            "Retour",
          ],
        };
      }

      if (userMessage.includes("césure")) {
        setStep("gap_year");
        return {
          id,
          text: "✈️ L'année de césure — Que veux-tu savoir ?",
          sender: "bot",
          suggestions: [
            "C'est quoi une année de césure ?",
            "Avantages et risques",
            "Comment la préparer ?",
            "Retour",
          ],
        };
      }

      if (userMessage.includes("étranger")) {
        setStep("international");
        return {
          id,
          text: "🌍 Études à l'étranger — Que veux-tu savoir ?",
          sender: "bot",
          suggestions: ["Programme Erasmus", "Comment financer ?", "Reconnaissance des diplômes", "Retour"],
        };
      }
    }

    const backToGeneral = (): Message => ({
      id,
      text: "Sur quel sujet as-tu des questions ?",
      sender: "bot",
      suggestions: [
        "Parcoursup",
        "L'alternance",
        "Gérer le stress",
        "Année de césure",
        "Études à l'étranger",
        "Retour",
      ],
    });

    if (step === "parcoursup") {
      if (userMessage === "Retour") {
        setStep("general");
        return backToGeneral();
      }

      if (userMessage.includes("dates")) {
        return {
          id,
          text:
            "📅 Dates clés :\n• Janvier : ouverture\n• Janvier–Mars : formulation des vœux (max 10)\n• Début avril : finaliser dossier\n• Mi-mai : début des réponses\n• Juin : phase principale\n• Juillet–Septembre : phase complémentaire",
          sender: "bot",
          suggestions: ["Comment rédiger ma lettre ?", "Retour"],
        };
      }

      if (userMessage.includes("lettre")) {
        let text =
          "✍️ Lettre de motivation :\n1. Présente ton parcours\n2. Explique pourquoi cette formation\n3. Montre que tu la connais\n4. Parle de ton projet pro\n5. Reste authentique.\n\nAdapte chaque lettre à chaque formation.";

        if (specs.length > 0) {
          text += `\n\nMets en avant tes spécialités **${specs.join(", ")}**.`;
        }

        if (favCareer) {
          text += `\nMentionne ton intérêt pour **${favCareer.sector}**.`;
        }

        return {
          id,
          text,
          sender: "bot",
          suggestions: ["Comment fonctionne l'algorithme ?", "Retour"],
        };
      }

      if (userMessage.includes("algorithme")) {
        return {
          id,
          text:
            "📊 L'algorithme :\nChaque formation classe les candidats selon :\n• Les notes scolaires\n• La cohérence du profil\n• La lettre de motivation\n• Les activités extrascolaires",
          sender: "bot",
          suggestions: ["J'ai été refusé partout", "Retour"],
        };
      }

      if (userMessage.includes("refusé")) {
        return {
          id,
          text:
            "💔 Options :\n1. Phase complémentaire\n2. Contacter directement les formations\n3. Explorer BTS, BUT ou autres pistes\n4. Alternance\n5. Année de césure\n\nCe n'est pas une fin.",
          sender: "bot",
          suggestions: ["Retour"],
        };
      }
    }

    if (step === "alternance") {
      if (userMessage === "Retour") {
        setStep("general");
        return backToGeneral();
      }

      if (userMessage.includes("C'est quoi")) {
        return {
          id,
          text:
            "🔄 L'alternance alterne entre école et entreprise.\n\nContrat d'apprentissage : rémunéré, école gratuite.\nContrat de professionnalisation : plus flexible.",
          sender: "bot",
          suggestions: ["Avantages et inconvénients", "Retour"],
        };
      }

      if (userMessage.includes("Avantages")) {
        return {
          id,
          text:
            "✅ Avantages :\n• Rémunéré pendant les études\n• Formation gratuite\n• Expérience réelle\n• Réseau pro\n\n⚠️ Inconvénients :\n• Rythme soutenu\n• Trouver une entreprise prend du temps",
          sender: "bot",
          suggestions: ["Comment trouver une entreprise ?", "Retour"],
        };
      }

      if (userMessage.includes("trouver")) {
        let text =
          "🔍 Trouver une entreprise :\n1. Indeed, LinkedIn\n2. Portails spécialisés alternance\n3. Candidatures spontanées\n4. Forums et salons\n\nCommence tôt dans l’année.";

        if (favCareer) {
          text += `\n\nPour **${favCareer.sector}**, cible les entreprises de ce secteur.`;
        }

        return {
          id,
          text,
          sender: "bot",
          suggestions: ["Quelles formations en alternance ?", "Retour"],
        };
      }

      if (userMessage.includes("formations")) {
        onNavigate("formations");
        return { id, text: "Je t'emmène vers les formations 🎓", sender: "bot" };
      }
    }

    if (step === "stress") {
      if (userMessage === "Retour") {
        setStep("general");
        return backToGeneral();
      }

      if (userMessage.includes("ne sais pas")) {
        let text = "😟 C'est totalement normal.\n\n";

        if (riasecCode) {
          const domains = RIASEC_TO_DOMAINS[riasecCode] ?? [];
          text += `Ton profil **${riasecCode} - ${RIASEC_NAMES[riasecCode]}** t'oriente plutôt vers : **${domains
            .slice(0, 2)
            .join(", ")}**.\n\n`;
        }

        text +=
          "Conseils :\n1. Explore les domaines qui t’attirent\n2. Regarde les études possibles\n3. Commence par une voie assez ouverte si besoin";

        return {
          id,
          text,
          sender: "bot",
          suggestions: ["Faire le test RIASEC", "Retour"],
        };
      }

      if (userMessage.includes("peur")) {
        return {
          id,
          text:
            "😰 Pas d'inquiétude.\n• Beaucoup d’étudiants se réorientent\n• Il existe des passerelles\n• Un choix n’est pas définitif",
          sender: "bot",
          suggestions: ["Comment rester motivé ?", "Retour"],
        };
      }

      if (userMessage.includes("motivé")) {
        return {
          id,
          text:
            "💪 Rester motivé :\n1. Fixe-toi de petits objectifs\n2. Note ce qui t’attire vraiment\n3. Compare les options concrètement\n4. Avance étape par étape",
          sender: "bot",
          suggestions: ["Retour"],
        };
      }

      if (userMessage.includes("test RIASEC")) {
        onNavigate("riasec-test");
        return { id, text: "Je t'emmène vers le test RIASEC 🧠", sender: "bot" };
      }
    }

    if (step === "gap_year") {
      if (userMessage === "Retour") {
        setStep("general");
        return backToGeneral();
      }

      if (userMessage.includes("C'est quoi")) {
        return {
          id,
          text:
            "✈️ L'année de césure : pause dans les études pour voyager, travailler, faire un stage ou clarifier son projet.",
          sender: "bot",
          suggestions: ["Avantages et risques", "Retour"],
        };
      }

      if (userMessage.includes("Avantages")) {
        return {
          id,
          text:
            "✅ Avantages :\n• Maturité\n• Clarification du projet\n• Expérience valorisante\n\n⚠️ Risques :\n• Perte de rythme\n• Coût éventuel",
          sender: "bot",
          suggestions: ["Comment la préparer ?", "Retour"],
        };
      }

      if (userMessage.includes("préparer")) {
        return {
          id,
          text:
            "📝 Préparer sa césure :\n1. Définir un objectif\n2. Préparer un budget\n3. Anticiper les démarches\n4. Choisir une expérience cohérente",
          sender: "bot",
          suggestions: ["Retour"],
        };
      }
    }

    if (step === "international") {
      if (userMessage === "Retour") {
        setStep("general");
        return backToGeneral();
      }

      if (userMessage.includes("Erasmus")) {
        return {
          id,
          text:
            "🇪🇺 Erasmus permet d’étudier plusieurs mois dans un autre pays européen avec reconnaissance des crédits.",
          sender: "bot",
          suggestions: ["Comment financer ?", "Retour"],
        };
      }

      if (userMessage.includes("financer")) {
        return {
          id,
          text:
            "💰 Financement possible :\n• Bourse Erasmus+\n• Aides locales\n• Bourses d’établissement\n• Travail sur place selon les cas",
          sender: "bot",
          suggestions: ["Reconnaissance des diplômes", "Retour"],
        };
      }

      if (userMessage.includes("diplômes")) {
        return {
          id,
          text:
            "🎓 En Europe, le système LMD facilite la reconnaissance. Pour d’autres pays, il faut vérifier selon la formation et le pays visé.",
          sender: "bot",
          suggestions: ["Retour"],
        };
      }
    }

    return {
      id,
      text: "Choisis une option dans le menu 👇",
      sender: "bot",
      suggestions: HOME_SUGGESTIONS,
    };
  };

  const handleSend = (rawText: string) => {
    const text = rawText.trim();
    if (!text) return;

    if (text === "🔄 Recommencer" || text.includes("Recommencer")) {
      resetConversation();
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    setTimeout(() => {
      const response = generateBotResponse(text);
      addBotMessage(response);
    }, 350);
  };

  const renderFormattedText = (text: string, isUser: boolean) => {
    return text.split("\n").map((line, i) => {
      if (line === "") {
        return <View key={i} style={{ height: 6 }} />;
      }

      const parts = line.split(/(\*\*[^*]+\*\*)/g);

      return (
        <Text key={i} style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>
          {parts.map((part, j) => {
            const isBold = part.startsWith("**") && part.endsWith("**");

            return (
              <Text
                key={j}
                style={[
                  styles.bubbleText,
                  isUser && styles.bubbleTextUser,
                  isBold && styles.boldText,
                ]}
              >
                {isBold ? part.slice(2, -2) : part}
              </Text>
            );
          })}
        </Text>
      );
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={require("../../assets/oriento_bot.png")}
            style={styles.botAvatar}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.botName}>Oriento</Text>
            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>En ligne</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.resetBtn} onPress={resetConversation}>
          <RotateCcw size={18} color={colors.gray500} />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesContainer}
        renderItem={({ item: message, index }) => (
          <View>
            <View
              style={[
                styles.messageRow,
                message.sender === "user" ? styles.messageRowUser : styles.messageRowBot,
              ]}
            >
              {message.sender === "bot" && (
                <Image
                  source={require("../../assets/oriento_bot.png")}
                  style={styles.msgAvatar}
                  resizeMode="contain"
                />
              )}

              <View
                style={[
                  styles.bubble,
                  message.sender === "user" ? styles.bubbleUser : styles.bubbleBot,
                ]}
              >
                {renderFormattedText(message.text, message.sender === "user")}
              </View>
            </View>

            {message.suggestions && message.suggestions.length > 0 && (
              <View style={styles.suggestions}>
                {message.suggestions.map((s, i) => {
                  const isLast = index === messages.length - 1;
                  return (
                    <TouchableOpacity
                      key={`${message.id}-suggestion-${i}`}
                      onPress={() => isLast && handleSend(s)}
                      style={[styles.suggestion, !isLast && styles.suggestionDisabled]}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.suggestionText,
                          !isLast && styles.suggestionTextDisabled,
                        ]}
                      >
                        {s}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        )}
      />

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={() => handleSend(input)}
          placeholder="Pose-moi une question..."
          placeholderTextColor={colors.gray400}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
          onPress={() => handleSend(input)}
          disabled={!input.trim()}
          activeOpacity={0.8}
        >
          <Send size={20} color={colors.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  botAvatar: {
    width: 44,
    height: 44,
  },
  botName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.gray800,
  },
  onlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4ade80",
  },
  onlineText: {
    fontSize: 12,
    color: "#16a34a",
    fontWeight: "500",
  },
  resetBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gray100,
    alignItems: "center",
    justifyContent: "center",
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 24,
    gap: 16,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  messageRowUser: {
    justifyContent: "flex-end",
  },
  messageRowBot: {
    justifyContent: "flex-start",
  },
  msgAvatar: {
    width: 32,
    height: 32,
    marginBottom: 4,
  },
  bubble: {
    maxWidth: "78%",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  bubbleUser: {
    backgroundColor: colors.primary500,
    borderBottomRightRadius: 4,
  },
  bubbleBot: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.gray100,
  },
  bubbleText: {
    fontSize: 14,
    color: colors.gray800,
    lineHeight: 22,
  },
  bubbleTextUser: {
    color: colors.white,
  },
  boldText: {
    fontWeight: "bold",
  },
  suggestions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
    marginLeft: 40,
  },
  suggestion: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary200,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
  },
  suggestionDisabled: {
    backgroundColor: colors.gray100,
    borderColor: colors.gray200,
  },
  suggestionText: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.primary600,
  },
  suggestionTextDisabled: {
    color: colors.gray400,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
  },
  input: {
    flex: 1,
    backgroundColor: colors.gray100,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.gray800,
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary500,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
});