// src/components/FormationDetail.tsx — React Native
import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking, Image } from "react-native";
import { ArrowLeft, Bookmark, BookmarkPlus, GraduationCap, CheckCircle, MessageCircle, MapPin, TrendingUp, ExternalLink, Code, Heart, Briefcase, BookA } from "lucide-react-native";
import type { UserProfile } from "../../App";
import { colors } from "../config/colors";
import formationsData from "../data/formations.json";

interface FormationDetailProps {
  formationId: string; userProfile: UserProfile;
  onBack: () => void; onToggleFavorite: (id: string) => void; onChat: () => void;
}

const allFormations = formationsData as any[];

function domainColor(domain: string): string {
  const map: Record<string, string> = {
    "Informatique et Numérique": "#3b82f6", "Ingénierie et Technologie": "#2563eb",
    "Sciences et Recherche": "#14b8a6", "Commerce et Management": "#f97316",
    "Economie et Finance": "#16a34a", "Marketing et Communication": "#8b5cf6",
    "Droit": "#475569", "Lettres Langues et Sciences Humaines": "#f43f5e",
    "Art et Culture": "#ec4899", "Social et Education": "#0ea5e9",
    "Santé et Esthétique": "#f43f5e", "Sport": "#10b981",
  };
  return map[domain] ?? "#6b7280";
}

function parseEtab(etab: string) {
  const m = etab.match(/^(.*?)\s*\((.*?)\)$/);
  return m ? { name: m[1].trim(), location: m[2].trim() } : { name: etab.trim(), location: "" };
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>{icon}<Text style={styles.sectionTitle}>{title}</Text></View>
      {children}
    </View>
  );
}

export default function FormationDetail({ formationId, userProfile, onBack, onToggleFavorite, onChat }: FormationDetailProps) {
  const [isFavorite, setIsFavorite] = useState(() => userProfile.savedFormations?.includes(formationId) ?? false);

  useEffect(() => {
    setIsFavorite(userProfile.savedFormations?.includes(formationId) ?? false);
  }, [userProfile.savedFormations, formationId]);

  const formation = allFormations.find(f => f.id === formationId);
  if (!formation) return <View style={styles.error}><Text>Formation introuvable.</Text></View>;

  const firstDomain = formation.domain ? formation.domain.split(",")[0].trim() : "Autre";
  const bgColor = domainColor(firstDomain);
  const { name: etabName, location: etabLocation } = parseEtab(formation.etablissement || "");
  const handleToggle = () => { setIsFavorite(p => !p); onToggleFavorite(formationId); };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={[styles.header, { backgroundColor: bgColor }]}>
          <View style={styles.headerNav}>
            <TouchableOpacity style={styles.navBtn} onPress={onBack}><ArrowLeft size={22} color={colors.gray800} /></TouchableOpacity>
            <TouchableOpacity style={styles.navBtn} onPress={handleToggle}>
              {isFavorite ? <Bookmark size={22} color={colors.primary500} fill={colors.primary500} /> : <BookmarkPlus size={22} color={colors.gray800} />}
            </TouchableOpacity>
          </View>
          <View style={styles.headerContent}>
            <Text style={styles.formTitle}>{formation.title}</Text>
          </View>
          <View style={styles.domainBadge}><Text style={styles.domainBadgeText}>{firstDomain}</Text></View>
        </View>

        <View style={styles.body}>
          <View style={styles.badges}>
            {etabName && <View style={styles.badge}><GraduationCap size={16} color={colors.primary500} /><View><Text style={styles.badgeLabel}>Établissement</Text><Text style={styles.badgeValue}>{etabName}</Text></View></View>}
            {etabLocation && <View style={styles.badge}><MapPin size={16} color="#0ea5e9" /><View><Text style={styles.badgeLabel}>Lieu</Text><Text style={styles.badgeValue}>{etabLocation}</Text></View></View>}
            {formation.type && <View style={styles.badge}><Briefcase size={16} color="#f97316" /><View><Text style={styles.badgeLabel}>Type</Text><Text style={styles.badgeValue}>{formation.type}</Text></View></View>}
          </View>

          {formation.description ? (
            <Section title="La formation" icon={<BookA size={16} color={colors.primary500} />}>
              <Text style={styles.bodyText}>{formation.description}</Text>
            </Section>
          ) : null}

          {formation.skills?.length > 0 && (
            <Section title="Spécialités" icon={<Code size={16} color={colors.primary500} />}>
              <View style={styles.chipRow}>{formation.skills.map((s: string, i: number) => <View key={i} style={styles.chip}><Text style={styles.chipText}>{s}</Text></View>)}</View>
            </Section>
          )}

          {formation.qualities?.length > 0 && (
            <Section title="Qualités humaines" icon={<Heart size={16} color="#f43f5e" />}>
              {formation.qualities.map((q: string) => (
                <View key={q} style={styles.qualityRow}>
                  <CheckCircle size={16} color={colors.primary500} />
                  <Text style={styles.bodyText}>{q}</Text>
                </View>
              ))}
            </Section>
          )}

          {formation.stats && (
            <Section title="Statistiques Parcoursup" icon={<TrendingUp size={16} color="#10b981" />}>
              <View style={styles.statsGrid}>
                {[
                  { label: "Ville", value: formation.stats.ville_etab },
                  { label: "Région", value: formation.stats.region_etab_aff },
                  { label: "Sélectivité", value: formation.stats.select_form },
                  { label: "Capacité", value: formation.stats.capa_fin },
                  { label: "Vœux", value: formation.stats.voe_tot },
                  { label: "Admis", value: formation.stats.acc_tot },
                  { label: "Taux d'accès", value: formation.stats.taux_acces_ens ? `${formation.stats.taux_acces_ens}%` : undefined },
                ].filter(i => i.value != null && i.value !== "").map((item, i) => (
                  <View key={i} style={styles.statItem}>
                    <Text style={styles.statLabel}>{item.label}</Text>
                    <Text style={styles.statValue}>{item.value}</Text>
                  </View>
                ))}
              </View>
            </Section>
          )}

          {formation.education?.length > 0 && (
            <Section title="Formations possibles" icon={<GraduationCap size={16} color={colors.primary500} />}>
              {formation.education.map((e: string, i: number) => (
                <View key={i} style={styles.stepRow}>
                  <View style={styles.stepColumn}>
                    <View style={styles.stepCircle}><Text style={styles.stepNumber}>{i + 1}</Text></View>
                    {i < formation.education.length - 1 && <View style={styles.stepLine} />}
                  </View>
                  <View style={styles.stepContent}><Text style={styles.bodyText}>{e}</Text></View>
                </View>
              ))}
            </Section>
          )}

          {formation.links && (formation.links.ficheFormation || formation.links.site) && (
            <Section title="Liens utiles" icon={<ExternalLink size={16} color={colors.primary500} />}>
              {formation.links.ficheFormation ? (
                <TouchableOpacity style={styles.linkRow} onPress={() => Linking.openURL(formation.links.ficheFormation)} activeOpacity={0.8}>
                  <Text style={styles.linkText}>Fiche formation Parcoursup</Text>
                  <ExternalLink size={16} color={colors.primary500} />
                </TouchableOpacity>
              ) : null}
              {formation.links.site ? (
                <TouchableOpacity style={styles.linkRow} onPress={() => Linking.openURL(formation.links.site)} activeOpacity={0.8}>
                  <Text style={styles.linkText}>Site de l'établissement</Text>
                  <ExternalLink size={16} color={colors.primary500} />
                </TouchableOpacity>
              ) : null}
            </Section>
          )}
        </View>
      </ScrollView>
      <TouchableOpacity style={styles.chatBtn} onPress={onChat} activeOpacity={0.8}>
        <Image
          source={require("../../assets/oriento_bot.png")}
          style={{ width: 100, height: 100 }}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 },
  error: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { paddingTop: 60, paddingBottom: 24, paddingHorizontal: 16, minHeight: 200, justifyContent: "space-between" },
  headerNav: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  navBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.9)", alignItems: "center", justifyContent: "center" },
  headerContent: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 16 },
  formTitle: { fontSize: 22, fontWeight: "bold", color: colors.white, textAlign: "center", textShadowColor: "rgba(0,0,0,0.5)", textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8 },
  domainBadge: { alignSelf: "flex-end", backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 24, borderWidth: 1, borderColor: "rgba(255,255,255,0.4)" },
  domainBadgeText: { color: colors.white, fontSize: 12, fontWeight: "700" },
  body: { padding: 16, gap: 12 },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  badge: { flex: 1, minWidth: "45%", backgroundColor: colors.white, borderRadius: 16, padding: 12, flexDirection: "row", gap: 8, alignItems: "flex-start", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  badgeLabel: { fontSize: 11, color: colors.gray400, marginBottom: 2 },
  badgeValue: { fontSize: 12, fontWeight: "700", color: colors.gray800 },
  section: { backgroundColor: colors.white, borderRadius: 20, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: "bold", color: colors.gray800 },
  bodyText: { fontSize: 14, color: colors.gray700, lineHeight: 22, flex: 1 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { backgroundColor: colors.primary50, borderWidth: 1, borderColor: colors.primary100, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  chipText: { color: colors.primary700, fontSize: 13, fontWeight: "500" },
  qualityRow: { flexDirection: "row", gap: 8, marginBottom: 8, alignItems: "flex-start" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  statItem: { width: "47%", backgroundColor: colors.gray50, borderRadius: 12, padding: 12 },
  statLabel: { fontSize: 11, color: colors.gray400, marginBottom: 4 },
  statValue: { fontSize: 14, fontWeight: "700", color: colors.gray800 },
  stepRow: { flexDirection: "row", gap: 12, marginBottom: 4 },
  stepColumn: { alignItems: "center" },
  stepCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary500, alignItems: "center", justifyContent: "center" },
  stepNumber: { color: colors.white, fontWeight: "bold", fontSize: 12 },
  stepLine: { width: 2, flex: 1, backgroundColor: colors.primary100, marginVertical: 4, minHeight: 24 },
  stepContent: { flex: 1, paddingBottom: 16 },
  linkRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.gray50, borderRadius: 12, padding: 12, marginBottom: 8 },
  linkText: { fontSize: 14, fontWeight: "600", color: colors.gray800 },
  chatBtn: { position: "absolute", bottom: 100, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: "transparent", alignItems: "center", justifyContent: "center" },
});