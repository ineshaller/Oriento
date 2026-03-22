// src/components/CareersExplorer.tsx — React Native
import { useState, useMemo } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, ScrollView, Linking } from "react-native";
import { Search, BookmarkPlus, Bookmark, ExternalLink, Sparkles } from "lucide-react-native";
import type { UserProfile } from "../../App";
import { colors } from "../config/colors";
import careersData from "../data/careers_onisep.json";

export interface Career {
  id: string; title: string; url_onisep: string; sector: string;
  gfe: string; rome_codes: string[]; rome_labels: string[]; publication: string; domaines: string[];
}

interface CareersExplorerProps {
  userProfile: UserProfile;
  onCareerClick: (careerId: string) => void;
  onToggleFavorite: (jobId: string) => void;
}

const rawCareers = careersData as Career[];
const seen = new Set<string>();
const careers: Career[] = rawCareers.filter(c => {
  const key = c.title.toLowerCase().trim();
  if (seen.has(key)) return false;
  seen.add(key); return true;
});

function normalize(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9\s]/g, " ").toLowerCase().trim();
}

const RIASEC_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  R: { label: "Réaliste", color: "#9a3412", bg: "#ffedd5" },
  I: { label: "Investigateur", color: "#1d4ed8", bg: "#dbeafe" },
  A: { label: "Artistique", color: "#6b21a8", bg: "#f3e8ff" },
  S: { label: "Social", color: "#15803d", bg: "#dcfce7" },
  E: { label: "Entrepreneur", color: "#b91c1c", bg: "#fee2e2" },
  C: { label: "Conventionnel", color: "#374151", bg: "#e5e7eb" },
};

const sectorToRiasec: Record<string, string[]> = {
  "Informatique & Numérique": ["I", "R"],
  "Santé & Social": ["S", "I"],
  "Commerce & Gestion": ["E", "C"],
  "Communication & Médias": ["A", "E"],
  "Enseignement": ["S"],
  "Bâtiment": ["R", "I"],
  "Transport & Logistique": ["R", "C"],
  "Hôtellerie & Tourisme": ["S", "E"],
  "Agriculture": ["R"],
  "Chimie & Biologie": ["I", "R"],
  "Administration": ["C", "E"],
  "Sécurité & Défense": ["R", "E"],
  "Électricité & Énergie": ["R", "I"],
  "Mécanique": ["R", "I"],
  "Agroalimentaire": ["R", "I"],
  "Textile & Mode": ["A", "R"],
  "Bois & Matériaux": ["R"],
  "Imprimerie & Graphisme": ["A", "R"],
  "Métallurgie": ["R", "I"],
  "Pêche & Mer": ["R"],
  "Production industrielle": ["R", "I"],
};

const ALL_SECTORS = [
  "Tous","Administration","Agriculture","Agroalimentaire","Bâtiment","Bois & Matériaux",
  "Chimie & Biologie","Commerce & Gestion","Communication & Médias","Électricité & Énergie",
  "Enseignement","Hôtellerie & Tourisme","Imprimerie & Graphisme","Informatique & Numérique",
  "Mécanique","Métallurgie","Pêche & Mer","Production industrielle","Santé & Social",
  "Sécurité & Défense","Textile & Mode","Transport & Logistique",
];

const PAGE_SIZE = 30;

export default function CareersExplorer({ userProfile, onCareerClick, onToggleFavorite }: CareersExplorerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSector, setSelectedSector] = useState("Tous");
  const [showMatchOnly, setShowMatchOnly] = useState(false);
  const [page, setPage] = useState(1);

  const userRiasec = (userProfile.riasecProfile ?? []).slice(0, 3);
  const primaryCount = Math.min(userProfile.riasecPrimaryCount ?? 1, userRiasec.length);
  const primaryCodes = userRiasec.slice(0, primaryCount);
  const hasRiasecProfile = userRiasec.length > 0;

  const filtered = useMemo(() => {
    const words = normalize(searchTerm).split(/\s+/).filter(Boolean);
    return careers.filter(c => {
      const matchesSearch = words.length === 0 || words.every(w =>
        normalize(c.title).includes(w) || normalize(c.sector).includes(w) ||
        c.rome_labels.some(r => normalize(r).includes(w)) || c.domaines.some(d => normalize(d).includes(w))
      );
      const matchesSector = selectedSector === "Tous" || c.sector === selectedSector;
      const riasecCodes = sectorToRiasec[c.sector] ?? [];
      const matchScore = riasecCodes.filter(code => primaryCodes.includes(code)).length;
      const matchesRiasec = !showMatchOnly || matchScore > 0;
      return matchesSearch && matchesSector && matchesRiasec;
    });
  }, [searchTerm, selectedSector, showMatchOnly, userRiasec]);

  const paginated = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = paginated.length < filtered.length;
  const isFavorite = (id: string) => userProfile.favoriteJobs?.includes(id) ?? false;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Explorer les métiers</Text>
        <View style={styles.searchBox}>
          <Search size={20} color={colors.gray400} />
          <TextInput
            style={styles.searchInput}
            value={searchTerm}
            onChangeText={v => { setSearchTerm(v); setPage(1); }}
            placeholder="Rechercher un métier, un domaine…"
            placeholderTextColor={colors.gray400}
          />
        </View>

        {hasRiasecProfile && (
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => { setShowMatchOnly(p => !p); setPage(1); }}
            style={{
              flexDirection: "row", alignItems: "center", gap: 8,
              paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24,
              backgroundColor: showMatchOnly ? colors.primary500 : colors.gray200,
              alignSelf: "flex-start", marginBottom: 12,
            }}
          >
            <Sparkles size={16} color={showMatchOnly ? colors.white : colors.gray700} />
            <Text style={{ fontSize: 13, fontWeight: "600", color: showMatchOnly ? colors.white : colors.gray700 }}>
              Métiers qui me correspondent
            </Text>
          </TouchableOpacity>
        )}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll} contentContainerStyle={{ gap: 8, paddingRight: 16 }}>
          {ALL_SECTORS.map(sector => (
            <TouchableOpacity
              key={sector}
              activeOpacity={1}
              onPress={() => { setSelectedSector(sector); setPage(1); }}
              style={{
                paddingHorizontal: 16, paddingVertical: 8, borderRadius: 24,
                backgroundColor: selectedSector === sector ? colors.primary500 : colors.gray200,
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: "500", color: selectedSector === sector ? colors.white : colors.gray700 }}>
                {sector}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={paginated}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 12 }}
        onEndReached={() => hasMore && setPage(p => p + 1)}
        onEndReachedThreshold={0.3}
        renderItem={({ item: career }) => {
          const favorite = isFavorite(career.id);
          const riasecCodes = sectorToRiasec[career.sector] ?? [];
          const matchScore = riasecCodes.filter(code => primaryCodes.includes(code)).length;
          const isMatch = hasRiasecProfile && matchScore > 0;

          return (
            <View style={[styles.card, isMatch && styles.cardMatch]}>
              {isMatch && (
                <View style={styles.matchBadge}>
                  <Sparkles size={12} color={colors.primary300} />
                  <Text style={styles.matchBadgeText}>Correspond à ton profil</Text>
                </View>
              )}
              <Text style={styles.careerTitle} numberOfLines={2}>{career.title}</Text>
              <Text style={styles.careerSector}>{career.sector}</Text>
              {career.domaines.length > 0 && (
                <Text style={styles.careerDomaines} numberOfLines={1}>{career.domaines.join(" · ")}</Text>
              )}
              {riasecCodes.length > 0 && (
                <View style={styles.riasecRow}>
                  {riasecCodes.map(code => {
                    const r = RIASEC_LABELS[code];
                    const isUserCode = userRiasec.includes(code);
                    return r ? (
                      <View key={code} style={[styles.riasecChip, { backgroundColor: r.bg }, isUserCode && styles.riasecChipHighlight]}>
                        <Text style={[styles.riasecChipText, { color: r.color }]}>{code} · {r.label}</Text>
                      </View>
                    ) : null;
                  })}
                </View>
              )}
              <View style={styles.cardActions}>
                <TouchableOpacity activeOpacity={1} style={styles.detailBtn} onPress={() => onCareerClick(career.id)}>
                  <Text style={styles.detailBtnText}>Voir le détail</Text>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={1} style={styles.linkBtn} onPress={() => Linking.openURL(career.url_onisep)}>
                  <ExternalLink size={18} color={colors.gray400} />
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={1}
                  style={{ width: 40, height: 40, backgroundColor: favorite ? colors.primary100 : colors.gray100, borderRadius: 12, alignItems: "center", justifyContent: "center" }}
                  onPress={() => onToggleFavorite(career.id)}
                >
                  {favorite ? <Bookmark size={20} color={colors.primary600} fill={colors.primary600} /> : <BookmarkPlus size={20} color={colors.gray400} />}
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Aucun métier trouvé</Text>
            <TouchableOpacity activeOpacity={1} onPress={() => { setSelectedSector("Tous"); setSearchTerm(""); setPage(1); }}>
              <Text style={styles.clearFilters}>Effacer les filtres</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 },
  header: { backgroundColor: colors.white, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  title: { fontSize: 24, fontWeight: "bold", color: colors.gray800, marginBottom: 16 },
  searchBox: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.gray100, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 12 },
  searchInput: { flex: 1, fontSize: 15, color: colors.gray800 },
  filtersScroll: { marginHorizontal: -24, paddingLeft: 24 },
  card: { backgroundColor: colors.white, borderRadius: 20, padding: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardMatch: { borderWidth: 2, borderColor: colors.primary300 },
  matchBadge: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 8 },
  matchBadgeText: { fontSize: 12, fontWeight: "700", color: colors.primary300 },
  careerTitle: { fontSize: 15, fontWeight: "bold", color: colors.gray800, marginBottom: 4, textTransform: "capitalize" },
  careerSector: { fontSize: 13, color: colors.gray500, marginBottom: 4 },
  careerDomaines: { fontSize: 12, color: colors.gray400, marginBottom: 8 },
  riasecRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 },
  riasecChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 24 },
  riasecChipHighlight: { borderWidth: 2, borderColor: colors.primary300 },
  riasecChipText: { fontSize: 11, fontWeight: "700" },
  cardActions: { flexDirection: "row", gap: 8 },
  detailBtn: { flex: 1, backgroundColor: colors.primary500, borderRadius: 12, paddingVertical: 10, alignItems: "center", justifyContent: "center" },
  detailBtnText: { color: colors.white, fontWeight: "700", fontSize: 13 },
  linkBtn: { width: 40, height: 40, backgroundColor: colors.gray100, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  empty: { alignItems: "center", paddingTop: 48 },
  emptyText: { color: colors.gray500, fontSize: 15, marginBottom: 12 },
  clearFilters: { color: colors.primary500, fontSize: 13, textDecorationLine: "underline" },
});