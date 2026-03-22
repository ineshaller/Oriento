// src/components/FormationsExplorer.tsx — React Native
import { useMemo, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, ScrollView } from "react-native";
import { Search, Bookmark, BookmarkPlus, Sparkles } from "lucide-react-native";
import type { UserProfile } from "../../App";
import { colors } from "../config/colors";
import formationsData from "../data/formations.json";

interface FormationsExplorerProps {
  userProfile: UserProfile;
  onFormationClick: (formationId: string) => void;
  onToggleFavorite: (formationId: string) => void;
}

const RIASEC_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  R: { label: "Réaliste", color: "#9a3412", bg: "#ffedd5" },
  I: { label: "Investigateur", color: "#1d4ed8", bg: "#dbeafe" },
  A: { label: "Artistique", color: "#6b21a8", bg: "#f3e8ff" },
  S: { label: "Social", color: "#15803d", bg: "#dcfce7" },
  E: { label: "Entrepreneur", color: "#b91c1c", bg: "#fee2e2" },
  C: { label: "Conventionnel", color: "#374151", bg: "#e5e7eb" },
};

const domainToRiasec: Record<string, string[]> = {
  "Droit": ["E", "C"], "Lettres Langues et Sciences Humaines": ["A", "S"],
  "Informatique et Numérique": ["I", "R"], "Ingénierie et Technologie": ["R", "I"],
  "Mathématiques et statistiques": ["I", "C"], "Sciences et Recherche": ["I", "R"],
  "Commerce et Management": ["E", "C"], "Economie et Finance": ["C", "E"],
  "Marketing et Communication": ["E", "A"], "Immobilier": ["E", "C"],
  "Logistique et Transport": ["R", "C"], "Science Politique": ["E", "S"],
  "BTP": ["R", "I"], "Architecture et Design": ["A", "R"],
  "Art et Culture": ["A"], "Technique et Industrie": ["R", "I"],
  "Tourisme et Hotellerie": ["S", "E"], "Environnement et Agriculture": ["R", "I"],
  "Sport": ["R", "S"], "Social et Education": ["S"], "Santé et Esthétique": ["S", "I"],
};

function normalize(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9\s]/g, " ").toLowerCase().trim();
}

function getRiasecFromDomains(domainStr: string): string[] {
  const domains = domainStr ? domainStr.split(",").map((d: string) => d.trim()) : ["Autre"];
  const codes = domains.flatMap(d => domainToRiasec[d] ?? []);
  return [...new Set(codes)].slice(0, 3);
}

const PAGE_SIZE = 30;
const allFormations = formationsData as any[];

export default function FormationsExplorer({ userProfile, onFormationClick, onToggleFavorite }: FormationsExplorerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSector, setSelectedSector] = useState("Tous");
  const [showMatchOnly, setShowMatchOnly] = useState(false);
  const [page, setPage] = useState(1);

  const userRiasec = (userProfile.riasecProfile ?? []).slice(0, 3);
  const primaryCount = Math.min(userProfile.riasecPrimaryCount ?? 1, userRiasec.length);
  const primaryCodes = userRiasec.slice(0, primaryCount);
  const hasRiasecProfile = userRiasec.length > 0;

  const sectors = useMemo(() => {
    return ["Tous", ...Array.from(new Set(allFormations.flatMap(f =>
      f.domain ? f.domain.split(",").map((d: string) => d.trim()) : ["Autre"]
    ))).sort((a, b) => a.localeCompare(b, "fr"))];
  }, []);

  const filtered = useMemo(() => {
    return allFormations.map(f => ({
      ...f,
      _riasecCodes: getRiasecFromDomains(f.domain ?? ""),
      _matchScore: getRiasecFromDomains(f.domain ?? "").filter(c => primaryCodes.includes(c)).length,
    })).filter(f => {
      const domains = f.domain ? f.domain.split(",").map((d: string) => d.trim()) : ["Autre"];
      const words = normalize(searchTerm).split(/\s+/).filter(Boolean);
      const matchesSearch = words.length === 0 || words.every(w => normalize(f.title).includes(w) || normalize(f.etablissement ?? "").includes(w));
      const matchesSector = selectedSector === "Tous" || domains.includes(selectedSector);
      const matchesRiasec = !showMatchOnly || f._matchScore > 0;
      return matchesSearch && matchesSector && matchesRiasec;
    }).sort((a, b) => selectedSector === "Tous" ? (a.title ?? "").localeCompare(b.title ?? "", "fr") : b._matchScore - a._matchScore);
  }, [searchTerm, selectedSector, showMatchOnly, userRiasec]);

  const displayed = filtered.slice(0, page * PAGE_SIZE);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Explorer les formations</Text>

        <View style={styles.searchBox}>
          <Search size={20} color={colors.gray400} />
          <TextInput
            style={styles.searchInput}
            value={searchTerm}
            onChangeText={v => { setSearchTerm(v); setPage(1); }}
            placeholder="Rechercher une formation..."
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
              Formations qui me correspondent
            </Text>
          </TouchableOpacity>
        )}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll} contentContainerStyle={{ gap: 8, paddingRight: 16 }}>
          {sectors.map((s: string) => (
            <TouchableOpacity
              key={s}
              activeOpacity={1}
              onPress={() => { setSelectedSector(s); setPage(1); }}
              style={{
                paddingHorizontal: 16, paddingVertical: 8, borderRadius: 24,
                backgroundColor: selectedSector === s ? colors.primary500 : colors.gray200,
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: "500", color: selectedSector === s ? colors.white : colors.gray700 }}>
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={displayed}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 12 }}
        onEndReached={() => displayed.length < filtered.length && setPage(p => p + 1)}
        onEndReachedThreshold={0.3}
        renderItem={({ item: f }) => {
          const favorite = userProfile.savedFormations?.includes(f.id) ?? false;
          const riasecCodes = f._riasecCodes as string[];
          const isMatch = hasRiasecProfile && f._matchScore > 0;
          return (
            <View style={[styles.card, isMatch && styles.cardMatch]}>
              {isMatch && (
                <View style={styles.matchBadge}>
                  <Sparkles size={12} color={colors.primary300} />
                  <Text style={styles.matchBadgeText}>Correspond à ton profil</Text>
                </View>
              )}
              <Text style={styles.formTitle} numberOfLines={2}>{f.title}</Text>
              <Text style={styles.formEtab} numberOfLines={1}>{f.etablissement}</Text>
              <View style={styles.domainRow}>
                {f.domain ? f.domain.split(",").slice(0, 2).map((d: string, i: number) => (
                  <View key={i} style={styles.domainChip}><Text style={styles.domainChipText}>{d.trim()}</Text></View>
                )) : <View style={styles.domainChip}><Text style={styles.domainChipText}>Autre</Text></View>}
              </View>
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
                <TouchableOpacity activeOpacity={1} style={styles.detailBtn} onPress={() => onFormationClick(f.id)}>
                  <Text style={styles.detailBtnText}>Voir le détail</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={1}
                  style={{ width: 40, height: 40, backgroundColor: favorite ? colors.primary100 : colors.gray100, borderRadius: 12, alignItems: "center", justifyContent: "center" }}
                  onPress={() => onToggleFavorite(f.id)}
                >
                  {favorite ? <Bookmark size={20} color={colors.primary600} fill={colors.primary600} /> : <BookmarkPlus size={20} color={colors.gray400} />}
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Aucune formation trouvée</Text>
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
  filtersScroll: { marginHorizontal: -24, paddingLeft: 24, marginBottom: 4 },
  card: { backgroundColor: colors.white, borderRadius: 20, padding: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardMatch: { borderWidth: 2, borderColor: colors.primary300 },
  matchBadge: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 8 },
  matchBadgeText: { fontSize: 12, fontWeight: "700", color: colors.primary300 },
  formTitle: { fontSize: 15, fontWeight: "bold", color: colors.gray800, marginBottom: 4 },
  formEtab: { fontSize: 13, color: colors.gray500, marginBottom: 8 },
  domainRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 8 },
  domainChip: { backgroundColor: colors.gray100, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 24 },
  domainChipText: { fontSize: 11, color: colors.gray700 },
  riasecRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 },
  riasecChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 24 },
  riasecChipHighlight: { borderWidth: 2, borderColor: colors.primary300 },
  riasecChipText: { fontSize: 11, fontWeight: "700" },
  cardActions: { flexDirection: "row", gap: 8 },
  detailBtn: { flex: 1, backgroundColor: colors.primary500, borderRadius: 12, paddingVertical: 10, alignItems: "center", justifyContent: "center" }, detailBtnText: { color: colors.white, fontWeight: "700", fontSize: 13 },
  empty: { alignItems: "center", paddingTop: 48 },
  emptyText: { color: colors.gray500, fontSize: 15, marginBottom: 12 },
  clearFilters: { color: colors.primary500, fontSize: 13, textDecorationLine: "underline" },
});