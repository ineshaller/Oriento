// src/components/Favorites.tsx — React Native
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Bookmark, GraduationCap, Briefcase } from "lucide-react-native";
import type { UserProfile } from "../../App";
import type { Career } from "./CareersExplorer";
import { colors } from "../config/colors";
import careersData from "../data/careers_enriched.json";
import formationsData from "../data/formations.json";

const careers: Career[] = careersData as Career[];
const allFormations = formationsData as any[];

interface FavoritesProps {
  userProfile: UserProfile;
  onCareerClick: (careerId: string) => void;
  onToggleFavorite: (jobId: string) => void;
  onToggleFormation: (formationId: string) => void;
  onFormationClick?: (formationId: string) => void;
}

export default function Favorites({ userProfile, onCareerClick, onToggleFavorite, onToggleFormation, onFormationClick }: FavoritesProps) {
  const favoriteJobIds = userProfile.favoriteJobs || [];
  const savedFormationIds = userProfile.savedFormations || [];
  const favoriteCareerObjects = favoriteJobIds.map(id => careers.find(c => c.id === id)).filter(Boolean) as Career[];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Mes favoris</Text>
        <Text style={styles.subtitle}>
          {favoriteCareerObjects.length} métier{favoriteCareerObjects.length > 1 ? "s" : ""}
          {savedFormationIds.length > 0 ? ` · ${savedFormationIds.length} formation${savedFormationIds.length > 1 ? "s" : ""}` : ""}
        </Text>
      </View>

      <View style={styles.content}>
        {/* Métiers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Briefcase size={20} color={colors.primary500} />
            <Text style={styles.sectionTitle}>Métiers sauvegardés</Text>
            <Text style={styles.sectionCount}>{favoriteCareerObjects.length}</Text>
          </View>
          {favoriteCareerObjects.length === 0 ? (
            <View style={styles.emptyCard}>
              <Briefcase size={20} color={colors.primary500} />
              <Text style={styles.emptyText}>Pas encore de métiers sauvegardés — explore l'onglet Métiers !</Text>
            </View>
          ) : (
            favoriteCareerObjects.map(career => (
              <View key={career.id} style={styles.card}>
                <View style={styles.cardContent}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle} numberOfLines={2}>{career.title}</Text>
                    <Text style={styles.cardSubtitle}>{career.sector}</Text>
                  </View>
                  <View style={styles.cardActions}>
                    <TouchableOpacity style={styles.viewBtn} onPress={() => onCareerClick(career.id)} activeOpacity={0.8}>
                      <Text style={styles.viewBtnText}>Voir</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.removeBtn} onPress={() => onToggleFavorite(career.id)} activeOpacity={0.7}>
                      <Bookmark size={18} color={colors.primary500} fill={colors.primary500} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Formations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <GraduationCap size={20} color={colors.primary500} />
            <Text style={styles.sectionTitle}>Formations sauvegardées</Text>
            <Text style={styles.sectionCount}>{savedFormationIds.length}</Text>
          </View>
          {savedFormationIds.length === 0 ? (
            <View style={styles.emptyCard}>
              <GraduationCap size={20} color={colors.primary500} />
              <Text style={styles.emptyText}>Pas encore de formations sauvegardées — explore l'onglet Formations !</Text>
            </View>
          ) : (
            savedFormationIds.map(fid => {
              const f = allFormations.find(x => x.id === fid);
              return (
                <View key={fid} style={styles.card}>
                  <View style={styles.cardContent}>
                    <View style={{ flex: 1 }}>
                      {f ? (
                        <>
                          <Text style={styles.cardTitle} numberOfLines={2}>{f.title}</Text>
                          {f.etablissement ? <Text style={styles.cardSubtitle} numberOfLines={1}>{f.etablissement}</Text> : null}
                        </>
                      ) : (
                        <View>
                          <View style={styles.skeleton} />
                          <View style={[styles.skeleton, { width: "50%", marginTop: 6 }]} />
                        </View>
                      )}
                    </View>
                    <View style={styles.cardActions}>
                      <TouchableOpacity style={styles.viewBtn} onPress={() => onFormationClick?.(fid)} activeOpacity={0.8}>
                        <Text style={styles.viewBtnText}>Voir</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.removeBtn} onPress={() => onToggleFavorite(career.id)} activeOpacity={0.7}>
                        <Bookmark size={18} color={colors.primary500} fill={colors.primary500} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 },
  header: { backgroundColor: colors.white, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  title: { fontSize: 24, fontWeight: "bold", color: colors.gray800 },
  subtitle: { fontSize: 14, color: colors.gray500, marginTop: 4 },
  content: { padding: 16, gap: 24 },
  section: { gap: 10 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 4 },
  sectionTitle: { flex: 1, fontSize: 15, fontWeight: "bold", color: colors.gray800 },
  sectionCount: { fontSize: 12, color: colors.gray400, fontWeight: "600" },
  emptyCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.white, borderRadius: 16, padding: 16 },
  emptyText: { flex: 1, fontSize: 14, color: colors.gray500 },
  card: { backgroundColor: colors.white, borderRadius: 16, padding: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  cardContent: { flexDirection: "row", alignItems: "center", gap: 12 },
  cardTitle: { fontSize: 14, fontWeight: "700", color: colors.gray800, textTransform: "capitalize", lineHeight: 20 },
  cardSubtitle: { fontSize: 12, color: colors.gray400, marginTop: 2 },
  cardActions: { flexDirection: "row", gap: 8, flexShrink: 0 },
  viewBtn: { backgroundColor: colors.primary500, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  viewBtnText: { color: colors.white, fontWeight: "700", fontSize: 13, textAlign: "center" },
  removeBtn: { width: 36, height: 36, backgroundColor: colors.primary50, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  skeleton: { height: 14, backgroundColor: colors.gray100, borderRadius: 6, width: "75%" },
});