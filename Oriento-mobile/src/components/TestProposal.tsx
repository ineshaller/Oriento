// src/components/TestProposal.tsx — React Native
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ChevronRight, Clock, SkipForward, Sparkles } from "lucide-react-native";
import { colors } from "../config/colors";

interface TestProposalProps { onTakeTest: () => void; onSkip: () => void; }

export default function TestProposal({ onTakeTest, onSkip }: TestProposalProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconWrapper}>
          <Sparkles size={48} color={colors.white} />
        </View>
        <Text style={styles.title}>Découvre ton profil</Text>
        <Text style={styles.description}>
          Passe le test de personnalité RIASEC pour découvrir les métiers qui te correspondent vraiment.
        </Text>
        <View style={styles.badge}>
          <Clock size={16} color={colors.primary700} />
          <Text style={styles.badgeText}>Durée estimée : 20 min</Text>
        </View>
      </View>
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.primaryBtn} onPress={onTakeTest} activeOpacity={0.8}>
          <Text style={styles.primaryBtnText}>Passer le test</Text>
          <ChevronRight size={20} color={colors.white} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={onSkip} activeOpacity={0.8}>
          <SkipForward size={16} color={colors.gray500} />
          <Text style={styles.secondaryBtnText}>Passer pour l'instant</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary50, paddingHorizontal: 32, paddingTop: 60, paddingBottom: 40 },
  content: { flex: 1, alignItems: "center", justifyContent: "center" },
  iconWrapper: { width: 96, height: 96, borderRadius: 48, backgroundColor: colors.primary500, alignItems: "center", justifyContent: "center", marginBottom: 32, shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 6 },
  title: { fontSize: 28, fontWeight: "bold", color: colors.gray800, marginBottom: 16, textAlign: "center" },
  description: { fontSize: 16, color: colors.gray600, textAlign: "center", lineHeight: 26, maxWidth: 300, marginBottom: 24 },
  badge: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.primary100, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24 },
  badgeText: { color: colors.primary700, fontSize: 14, fontWeight: "600" },
  buttons: { gap: 12 },
  primaryBtn: { backgroundColor: colors.primary500, borderRadius: 16, paddingVertical: 18, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  primaryBtnText: { color: colors.white, fontSize: 16, fontWeight: "700" },
  secondaryBtn: { backgroundColor: colors.gray100, borderRadius: 16, paddingVertical: 18, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  secondaryBtnText: { color: colors.gray500, fontSize: 16, fontWeight: "600" },
});