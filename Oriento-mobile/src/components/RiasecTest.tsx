// src/components/RiasecTest.tsx — React Native
import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Info } from "lucide-react-native";
import { colors } from "../config/colors";

interface RiasecTestProps {
  onComplete: (results: string[], scores: { [key: string]: number }) => void;
}

const questions = [
  { question: "J'aime comprendre comment les objets ou les systèmes fonctionnent concrètement.", category: "R" },
  { question: "J'apprécie d'analyser des problèmes complexes pour en trouver la cause.", category: "I" },
  { question: "Je prends plaisir à créer quelque chose de nouveau (texte, image, musique, idée originale).", category: "A" },
  { question: "J'aime être en contact direct avec les gens et échanger avec eux.", category: "S" },
  { question: "Je me sens à l'aise pour prendre des décisions qui engagent d'autres personnes.", category: "E" },
  { question: "J'aime quand les procédures sont claires et bien organisées.", category: "C" },
  { question: "Je préfère les activités où je peux utiliser mes mains ou mon corps.", category: "R" },
  { question: "Je suis attiré(e) par la recherche d'informations, la curiosité scientifique.", category: "I" },
  { question: "Je cherche souvent des façons originales ou non conventionnelles de faire les choses.", category: "A" },
  { question: "J'aime écouter les autres parler de leurs difficultés et essayer de les comprendre.", category: "S" },
  { question: "Je me projette facilement dans des projets ambitieux ou des objectifs à atteindre.", category: "E" },
  { question: "J'apprécie de tenir mes documents, dossiers ou fichiers bien classés.", category: "C" },
  { question: "Je me sens à l'aise dans des environnements concrets, pratiques, voire physiques.", category: "R" },
  { question: "J'aime résoudre des énigmes, des problèmes logiques ou des questions abstraites.", category: "I" },
  { question: "Je suis sensible à l'esthétique (formes, couleurs, ambiance, mise en scène).", category: "A" },
  { question: "Je suis prêt(e) à consacrer du temps pour aider quelqu'un à progresser.", category: "S" },
  { question: "Prendre la parole pour défendre une idée ou convaincre ne me dérange pas.", category: "E" },
  { question: "Je trouve rassurant de suivre des règles, des normes ou des consignes établies.", category: "C" },
  { question: "J'aime travailler dehors ou dans des lieux où l'on bouge.", category: "R" },
  { question: "J'aime chercher des explications rationnelles aux phénomènes que j'observe.", category: "I" },
  { question: "Je me sens bien quand je peux exprimer ma personnalité à travers ce que je produis.", category: "A" },
  { question: "Je suis souvent la personne vers qui les autres se tournent pour demander conseil.", category: "S" },
  { question: "J'aime prendre des initiatives et lancer de nouveaux projets ou activités.", category: "E" },
  { question: "Je suis attentif(ve) aux détails lorsqu'il s'agit de remplir des formulaires.", category: "C" },
  { question: "Je préfère que le résultat de mon travail soit visible et tangible.", category: "R" },
  { question: "Je prends plaisir à lire, chercher ou croiser des informations pour mieux comprendre.", category: "I" },
  { question: "Je tolère bien l'ambiguïté et les situations où il n'y a pas une seule bonne réponse.", category: "A" },
  { question: "Je me sens utile quand je contribue au bien-être ou à la réussite d'autres personnes.", category: "S" },
  { question: "La compétition ou le fait de « se dépasser » m'attire.", category: "E" },
  { question: "J'aime quand mon environnement de travail est structuré, prévisible et planifié.", category: "C" },
  { question: "Je me vois bien dans un métier où l'on manipule des outils, des matériaux.", category: "R" },
  { question: "Je me vois bien dans un métier où l'on observe, analyse, étudie ou diagnostique.", category: "I" },
  { question: "Je me vois bien dans un métier où la créativité et l'expression personnelle ont une grande place.", category: "A" },
  { question: "Je me vois bien dans un métier où l'on accompagne, forme ou soutient des personnes.", category: "S" },
  { question: "Je me vois bien dans un métier où l'on dirige des projets, des équipes.", category: "E" },
  { question: "Je me vois bien dans un métier où l'on gère des données, des budgets ou des procédures.", category: "C" },
];

const answers = [
  { label: "Tout à fait d'accord", score: 5 },
  { label: "Plutôt d'accord", score: 4 },
  { label: "Neutre", score: 3 },
  { label: "Plutôt en désaccord", score: 2 },
  { label: "Pas du tout d'accord", score: 1 },
];

export default function RiasecTest({ onComplete }: RiasecTestProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answersState, setAnswers] = useState<number[]>(new Array(questions.length).fill(0));

  const handleAnswer = (score: number) => {
    const newAnswers = [...answersState];
    newAnswers[currentQuestion] = score;
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      return;
    }

    const scores: { [key: string]: number } = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    questions.forEach((q, index) => { scores[q.category] += newAnswers[index]; });
    const order: Record<string, number> = { R: 0, I: 1, A: 2, S: 3, E: 4, C: 5 };
    const sortedAllCategories = Object.entries(scores)
      .sort(([catA, a], [catB, b]) => b !== a ? b - a : order[catA] - order[catB])
      .map(([category]) => category);
    onComplete(sortedAllCategories, scores);
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Test de personnalité</Text>
          <Text style={styles.counter}>{currentQuestion + 1}/{questions.length}</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <View style={styles.infoBox}>
          <Info size={18} color={colors.primary600} />
          <Text style={styles.infoText}>Il n'y a pas de bonne ou mauvaise réponse. Réponds spontanément.</Text>
        </View>
      </View>

      {/* Question */}
      <View style={styles.questionWrapper}>
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{questions[currentQuestion].question}</Text>
        </View>
      </View>

      {/* Answers */}
      <ScrollView style={styles.answersWrapper} contentContainerStyle={{ gap: 12, paddingBottom: 40 }}>
        {answers.map(({ label, score }) => (
          <TouchableOpacity key={score} style={styles.answerBtn} onPress={() => handleAnswer(score)} activeOpacity={0.7}>
            <Text style={styles.answerText}>{label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 16 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: colors.gray800 },
  counter: { fontSize: 14, color: colors.gray500 },
  progressBar: { height: 8, backgroundColor: colors.gray200, borderRadius: 4, overflow: "hidden", marginBottom: 16 },
  progressFill: { height: "100%", backgroundColor: colors.primary500, borderRadius: 4 },
  infoBox: { flexDirection: "row", gap: 10, backgroundColor: colors.primary50, borderRadius: 12, padding: 12, alignItems: "flex-start" },
  infoText: { flex: 1, fontSize: 13, color: colors.primary900, lineHeight: 20 },
  questionWrapper: { flex: 1, paddingHorizontal: 24, justifyContent: "center", minHeight: 160 },
  questionCard: { backgroundColor: colors.primary50, borderRadius: 24, padding: 32, borderWidth: 2, borderColor: colors.primary100, alignItems: "center", justifyContent: "center" },
  questionText: { fontSize: 18, color: colors.gray800, textAlign: "center", lineHeight: 28 },
  answersWrapper: { paddingHorizontal: 24, flexGrow: 0 },
  answerBtn: { backgroundColor: colors.gray100, borderRadius: 16, paddingVertical: 18, paddingHorizontal: 20, alignItems: "center" },
  answerText: { fontSize: 15, fontWeight: "600", color: colors.gray700 },
});