// src/components/TestResults.tsx — React Native
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Sparkles, ArrowRight, MessageCircle, AlertCircle } from "lucide-react-native";
import { colors } from "../config/colors";

interface TestResultsProps {
  riasecProfile: string[];
  scores?: { [key: string]: number | string };
  onExplore: () => void;
  onChat: () => void;
}

const profileDescriptions: { [key: string]: { name: string; description: string; traits: string[]; careers: string[] } } = {
  R: { name: "Réaliste", description: "Tu es pragmatique et tu aimes les activités concrètes. Tu préfères manipuler des outils et travailler avec tes mains.", traits: ["Pratique", "Concret", "Manuel"], careers: ["Ingénieur", "Technicien", "Artisan", "Pilote"] },
  I: { name: "Investigateur", description: "Tu es curieux et analytique. Tu aimes observer, comprendre et résoudre des problèmes complexes.", traits: ["Analytique", "Curieux", "Logique"], careers: ["Chercheur", "Médecin", "Ingénieur R&D", "Analyste"] },
  A: { name: "Artistique", description: "Tu es créatif et imaginatif. Tu as besoin d'exprimer ta créativité et d'innover.", traits: ["Créatif", "Original", "Expressif"], careers: ["Designer", "Artiste", "Architecte", "Réalisateur"] },
  S: { name: "Social", description: "Tu es empathique et tu aimes aider les autres. Le relationnel est au cœur de tes motivations.", traits: ["Empathique", "Communicatif", "Altruiste"], careers: ["Enseignant", "Psychologue", "Infirmier", "Coach"] },
  E: { name: "Entreprenant", description: "Tu es ambitieux et tu aimes diriger. Tu cherches à convaincre et à atteindre des objectifs.", traits: ["Leader", "Persuasif", "Ambitieux"], careers: ["Manager", "Entrepreneur", "Commercial", "Avocat"] },
  C: { name: "Conventionnel", description: "Tu es organisé et rigoureux. Tu apprécies les tâches structurées et les procédures claires.", traits: ["Méthodique", "Précis", "Fiable"], careers: ["Comptable", "Assistant", "Administrateur", "Contrôleur"] },
};

const allCodes = ["R", "I", "A", "S", "E", "C"];

export default function TestResults({ riasecProfile, scores, onExplore, onChat }: TestResultsProps) {
  const normalizedScores: Record<string, number> | undefined = scores
    ? Object.fromEntries(
        Object.entries(scores)
          .map(([k, v]) => [k.trim().toUpperCase(), Number(v)] as const)
          .filter(([k, v]) => allCodes.includes(k) && Number.isFinite(v))
      )
    : undefined;

  let mainCodes: string[] = [riasecProfile[0]];
  let secondaryCodes: string[] = riasecProfile.slice(1, 3);

  if (normalizedScores) {
    const entries = allCodes
      .filter(code => typeof normalizedScores[code] === "number")
      .map(code => [code, normalizedScores[code]] as const)
      .sort((a, b) => b[1] - a[1]);

    if (entries.length > 0) {
      const topScore = entries[0][1];
      mainCodes = entries.filter(([, s]) => s === topScore).map(([c]) => c);
      const remaining = entries.filter(([c]) => !mainCodes.includes(c));
      if (mainCodes.length === 1) {
        if (remaining.length <= 3) secondaryCodes = remaining.map(([c]) => c);
        else {
          const cutoffScore = remaining[2][1];
          secondaryCodes = remaining.filter(([, s]) => s >= cutoffScore).map(([c]) => c);
        }
      } else {
        if (remaining.length > 0) {
          const secondScore = remaining[0][1];
          secondaryCodes = remaining.filter(([, s]) => s === secondScore).map(([c]) => c);
        } else secondaryCodes = [];
      }
    }
  }

  const mainProfiles = mainCodes.map(c => profileDescriptions[c] || profileDescriptions.R);
  const secondaryProfiles = secondaryCodes.map(c => profileDescriptions[c] || profileDescriptions.R);

  let hasCloseTies = false;
  let tiedProfiles: string[] = [];
  if (normalizedScores) {
    const best = Math.max(...Object.values(normalizedScores));
    const sorted = Object.entries(normalizedScores).sort(([, a], [, b]) => b - a);
    tiedProfiles = sorted.filter(([, sc]) => sc >= best - 2 && sc !== best).map(([cat]) => cat);
    hasCloseTies = tiedProfiles.length > 0;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Sparkles size={40} color={colors.white} />
        </View>
        <Text style={styles.headerTitle}>Résultats de ton test</Text>
        <Text style={styles.headerSubtitle}>Découvre ton profil de personnalité</Text>
      </View>

      {/* Alert scores proches */}
      {hasCloseTies && normalizedScores && (
        <View style={styles.alertBox}>
          <AlertCircle size={20} color="#d97706" />
          <View style={{ flex: 1 }}>
            <Text style={styles.alertTitle}>Profil équilibré détecté</Text>
            <Text style={styles.alertText}>
              Tes scores sont très proches ! Les profils {mainCodes.join(", ")}
              {tiedProfiles.length > 0 ? ` et ${tiedProfiles.join(", ")}` : ""} te correspondent presque autant.
            </Text>
          </View>
        </View>
      )}

      {/* Scores détaillés */}
      {normalizedScores && (
        <View style={styles.scoresCard}>
          <Text style={styles.sectionTitle}>Tes scores détaillés</Text>
          <View style={styles.scoresGrid}>
            {Object.entries(normalizedScores).sort(([, a], [, b]) => b - a).map(([category, score]) => {
              const isMain = mainCodes.includes(category);
              const isSecondary = secondaryCodes.includes(category);
              return (
                <View key={category} style={[styles.scoreItem, isMain ? styles.scoreItemMain : isSecondary ? styles.scoreItemSecondary : styles.scoreItemDefault]}>
                  <View style={styles.scoreRow}>
                    <Text style={[styles.scoreCode, isMain ? styles.scoreCodeMain : isSecondary ? styles.scoreCodeSecondary : styles.scoreCodeDefault]}>{category}</Text>
                    <Text style={styles.scoreValue}>{score}/30</Text>
                  </View>
                  <View style={styles.scoreBarBg}>
                    <View style={[styles.scoreBarFill, { width: `${(score / 30) * 100}%` }, isMain ? styles.barMain : isSecondary ? styles.barSecondary : styles.barDefault]} />
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Profils principaux */}
      <View style={styles.mainCard}>
        <Text style={styles.sectionTitle}>Profil{mainCodes.length > 1 ? "s" : ""} principal{mainCodes.length > 1 ? "aux" : ""}</Text>
        {mainProfiles.map((profile, idx) => {
          const code = mainCodes[idx];
          return (
            <View key={code} style={idx > 0 ? styles.profileSeparator : undefined}>
              <View style={styles.profileHeader}>
                <View style={styles.profileBadge}><Text style={styles.profileBadgeText}>{code}</Text></View>
                <View>
                  <Text style={styles.profileName}>{profile.name}</Text>
                  <Text style={styles.profileScore}>
                    Profil principal{normalizedScores && Number.isFinite(normalizedScores[code]) ? ` · ${normalizedScores[code]}/30 pts` : ""}
                  </Text>
                </View>
              </View>
              <Text style={styles.profileDesc}>{profile.description}</Text>
              <View style={styles.traitsRow}>
                {profile.traits.map(trait => <View key={trait} style={styles.traitBadge}><Text style={styles.traitText}>{trait}</Text></View>)}
              </View>
              <Text style={styles.careersLabel}>Métiers associés :</Text>
              <View style={styles.careersRow}>
                {profile.careers.map(career => <View key={career} style={styles.careerBadge}><Text style={styles.careerText}>{career}</Text></View>)}
              </View>
            </View>
          );
        })}
      </View>

      {/* Profils secondaires */}
      {secondaryCodes.length > 0 && (
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <Text style={styles.sectionTitle}>Profil{secondaryCodes.length > 1 ? "s" : ""} secondaire{secondaryCodes.length > 1 ? "s" : ""}</Text>
          {secondaryProfiles.map((profile, index) => {
            const code = secondaryCodes[index];
            return (
              <View key={code} style={styles.secondaryCard}>
                <View style={styles.secondaryHeader}>
                  <View style={styles.secondaryBadge}><Text style={styles.secondaryBadgeText}>{code}</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.secondaryName}>{profile.name}</Text>
                    {normalizedScores && Number.isFinite(normalizedScores[code]) && (
                      <Text style={styles.secondaryScore}>{normalizedScores[code]}/30 points</Text>
                    )}
                  </View>
                </View>
                <Text style={styles.secondaryDesc}>{profile.description}</Text>
              </View>
            );
          })}
        </View>
      )}

      {/* CTAs */}
      <View style={styles.ctas}>
        <TouchableOpacity style={styles.exploreBtn} onPress={onExplore} activeOpacity={0.8}>
          <Text style={styles.exploreBtnText}>Explorer les métiers</Text>
          <ArrowRight size={20} color={colors.white} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.chatBtn} onPress={onChat} activeOpacity={0.8}>
          <MessageCircle size={20} color={colors.primary600} />
          <Text style={styles.chatBtnText}>Discuter avec le chatbot</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary50 },
  header: { alignItems: "center", paddingTop: 60, paddingBottom: 24, paddingHorizontal: 24 },
  headerIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary500, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  headerTitle: { fontSize: 28, fontWeight: "bold", color: colors.gray800, marginBottom: 8 },
  headerSubtitle: { fontSize: 16, color: colors.gray600 },
  alertBox: { marginHorizontal: 24, marginBottom: 16, backgroundColor: "#fffbeb", borderWidth: 2, borderColor: "#fde68a", borderRadius: 16, padding: 16, flexDirection: "row", gap: 12 },
  alertTitle: { fontWeight: "700", color: "#92400e", marginBottom: 4 },
  alertText: { fontSize: 13, color: "#b45309", lineHeight: 20 },
  scoresCard: { marginHorizontal: 24, marginBottom: 24, backgroundColor: colors.white, borderRadius: 20, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.gray800, marginBottom: 16 },
  scoresGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  scoreItem: { width: "47%", borderRadius: 12, padding: 12, borderWidth: 2 },
  scoreItemMain: { backgroundColor: colors.primary50, borderColor: colors.primary300 },
  scoreItemSecondary: { backgroundColor: "#eef2ff", borderColor: "#c7d2fe" },
  scoreItemDefault: { backgroundColor: colors.white, borderColor: colors.gray200 },
  scoreRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  scoreCode: { fontWeight: "bold", fontSize: 15 },
  scoreCodeMain: { color: colors.primary700 },
  scoreCodeSecondary: { color: "#4338ca" },
  scoreCodeDefault: { color: colors.gray600 },
  scoreValue: { fontSize: 13, fontWeight: "600", color: colors.gray700 },
  scoreBarBg: { height: 6, backgroundColor: colors.gray200, borderRadius: 3, overflow: "hidden" },
  scoreBarFill: { height: "100%", borderRadius: 3 },
  barMain: { backgroundColor: colors.primary500 },
  barSecondary: { backgroundColor: "#6366f1" },
  barDefault: { backgroundColor: colors.gray400 },
  mainCard: { marginHorizontal: 24, marginBottom: 24, backgroundColor: colors.white, borderRadius: 24, padding: 20, borderWidth: 2, borderColor: colors.primary200, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 },
  profileSeparator: { borderTopWidth: 1, borderTopColor: colors.gray100, marginTop: 20, paddingTop: 20 },
  profileHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  profileBadge: { width: 48, height: 48, borderRadius: 12, backgroundColor: colors.primary500, alignItems: "center", justifyContent: "center" },
  profileBadgeText: { color: colors.white, fontWeight: "bold", fontSize: 20 },
  profileName: { fontSize: 22, fontWeight: "bold", color: colors.gray800 },
  profileScore: { fontSize: 13, color: colors.primary600 },
  profileDesc: { fontSize: 14, color: colors.gray700, lineHeight: 22, marginBottom: 16 },
  traitsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  traitBadge: { backgroundColor: colors.primary100, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 24 },
  traitText: { color: colors.primary700, fontSize: 13, fontWeight: "500" },
  careersLabel: { fontSize: 13, fontWeight: "700", color: colors.gray700, marginBottom: 8 },
  careersRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  careerBadge: { backgroundColor: colors.gray100, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 24 },
  careerText: { color: colors.gray700, fontSize: 13 },
  secondaryCard: { backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  secondaryHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 },
  secondaryBadge: { width: 40, height: 40, borderRadius: 10, backgroundColor: colors.primary100, alignItems: "center", justifyContent: "center" },
  secondaryBadgeText: { color: colors.primary600, fontWeight: "bold", fontSize: 16 },
  secondaryName: { fontSize: 16, fontWeight: "700", color: colors.gray800 },
  secondaryScore: { fontSize: 12, color: colors.gray500 },
  secondaryDesc: { fontSize: 13, color: colors.gray600, lineHeight: 20 },
  ctas: { paddingHorizontal: 24, gap: 12, marginBottom: 40 },
  exploreBtn: { backgroundColor: colors.primary500, borderRadius: 16, paddingVertical: 18, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  exploreBtnText: { color: colors.white, fontSize: 16, fontWeight: "700" },
  chatBtn: { borderWidth: 2, borderColor: colors.primary200, borderRadius: 16, paddingVertical: 18, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  chatBtnText: { color: colors.primary600, fontSize: 16, fontWeight: "700" },
});