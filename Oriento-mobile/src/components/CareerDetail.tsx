// src/components/CareerDetail.tsx — React Native
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking, Image } from "react-native";
import { ArrowLeft, Bookmark, BookmarkPlus, MessageCircle, ExternalLink, Wrench, Heart, GraduationCap, TrendingUp, MapPin, Star, Briefcase, Award, Euro } from "lucide-react-native";
import type { UserProfile } from "../../App";
import { colors } from "../config/colors";
import careersData from "../data/careers_enriched.json";

interface ParcoursEtape { etape: string; detail: string; }
interface EnrichedCareer {
  id: string; title: string; url_onisep: string; url_detail?: string; sector: string;
  gfe: string; rome_codes: string[]; rome_labels: string[]; publication: string; domaines: string[];
  description?: string; competences?: string[]; qualites?: string[]; parcours?: ParcoursEtape[];
  perspectives?: string; salaire_debut?: string; niveau_etudes?: string; statut?: string;
  centres_interet?: string[]; ou_exercer?: string;
}

interface CareerDetailProps {
  careerId: string; userProfile: UserProfile;
  onBack: () => void; onToggleFavorite: (jobId: string) => void; onChat: () => void;
}

const careers = careersData as EnrichedCareer[];

function sectorColor(sector: string): string {
  const map: Record<string, string> = {
    "Informatique & Numérique": "#3b82f6", "Santé & Social": "#f43f5e",
    "Commerce & Gestion": "#f97316", "Communication & Médias": "#8b5cf6",
    "Enseignement": "#10b981", "Bâtiment": "#78716c", "Transport & Logistique": "#0ea5e9",
    "Hôtellerie & Tourisme": "#eab308", "Agriculture": "#84cc16", "Chimie & Biologie": "#14b8a6",
  };
  return map[sector] ?? colors.primary500;
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        {icon}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

export default function CareerDetail({ careerId, userProfile, onBack, onToggleFavorite, onChat }: CareerDetailProps) {
  const career = careers.find(c => c.id === careerId);
  const isFavorite = userProfile.favoriteJobs?.includes(careerId);

  if (!career) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Métier introuvable.</Text>
        <TouchableOpacity onPress={onBack}><Text style={styles.backLink}>← Retour</Text></TouchableOpacity>
      </View>
    );
  }

  const bgColor = sectorColor(career.sector);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header coloré */}
        <View style={[styles.header, { backgroundColor: bgColor }]}>
          <View style={styles.headerNav}>
            <TouchableOpacity style={styles.navBtn} onPress={onBack}>
              <ArrowLeft size={22} color={colors.gray800} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.navBtn} onPress={() => onToggleFavorite(careerId)}>
              {isFavorite ? <Bookmark size={22} color={colors.primary500} fill={colors.primary500} /> : <BookmarkPlus size={22} color={colors.gray800} />}
            </TouchableOpacity>
          </View>
          <View style={styles.headerContent}>
            <Text style={styles.careerTitle}>{career.title}</Text>
          </View>
          <View style={styles.sectorBadge}>
            <Text style={styles.sectorBadgeText}>{career.sector}</Text>
          </View>
        </View>

        <View style={styles.body}>
          {/* Badges info */}
          {(career.salaire_debut || career.niveau_etudes || career.statut) && (
            <View style={styles.badges}>
              {career.salaire_debut && (
                <View style={styles.badge}>
                  <Euro size={16} color="#16a34a" />
                  <View>
                    <Text style={styles.badgeLabel}>Salaire débutant</Text>
                    <Text style={styles.badgeValue}>{career.salaire_debut}</Text>
                  </View>
                </View>
              )}
              {career.niveau_etudes && (
                <View style={styles.badge}>
                  <GraduationCap size={16} color={colors.primary500} />
                  <View>
                    <Text style={styles.badgeLabel}>Niveau d'accès</Text>
                    <Text style={styles.badgeValue}>{career.niveau_etudes}</Text>
                  </View>
                </View>
              )}
              {career.statut && (
                <View style={styles.badge}>
                  <Briefcase size={16} color="#f97316" />
                  <View>
                    <Text style={styles.badgeLabel}>Statut</Text>
                    <Text style={styles.badgeValue}>{career.statut}</Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {career.description && (
            <Section title="Le métier" icon={<Briefcase size={16} color={colors.primary500} />}>
              <Text style={styles.bodyText}>{career.description}</Text>
            </Section>
          )}

          {career.competences && career.competences.length > 0 && (
            <Section title="Compétences requises" icon={<Wrench size={16} color={colors.primary500} />}>
              <View style={styles.chipRow}>{career.competences.map((c, i) => <View key={i} style={styles.chip}><Text style={styles.chipText}>{c}</Text></View>)}</View>
            </Section>
          )}

          {career.qualites && career.qualites.length > 0 && (
            <Section title="Qualités humaines" icon={<Heart size={16} color="#f43f5e" />}>
              {career.qualites.map((q, i) => (
                <View key={i} style={styles.bulletRow}>
                  <View style={styles.bullet} />
                  <Text style={styles.bodyText}>{q}</Text>
                </View>
              ))}
            </Section>
          )}

          {career.ou_exercer && (
            <Section title="Où l'exercer ?" icon={<MapPin size={16} color="#0ea5e9" />}>
              <Text style={styles.bodyText}>{career.ou_exercer}</Text>
            </Section>
          )}

          {career.perspectives && (
            <Section title="Emploi et secteur" icon={<TrendingUp size={16} color="#10b981" />}>
              <Text style={styles.bodyText}>{career.perspectives}</Text>
            </Section>
          )}

          {career.parcours && career.parcours.length > 0 && (
            <Section title="Les études" icon={<GraduationCap size={16} color={colors.primary500} />}>
              {career.parcours.map((p, i) => (
                <View key={i} style={styles.stepRow}>
                  <View style={styles.stepColumn}>
                    <View style={styles.stepCircle}><Text style={styles.stepNumber}>{i + 1}</Text></View>
                    {i < career.parcours!.length - 1 && <View style={styles.stepLine} />}
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>{p.etape}</Text>
                    {p.detail && <Text style={styles.stepDetail}>{p.detail}</Text>}
                  </View>
                </View>
              ))}
            </Section>
          )}

          {career.centres_interet && career.centres_interet.length > 0 && (
            <Section title="Centres d'intérêt" icon={<Star size={16} color="#eab308" />}>
              <View style={styles.chipRow}>{career.centres_interet.map((c, i) => <View key={i} style={[styles.chip, { backgroundColor: "#fefce8", borderColor: "#fef08a" }]}><Text style={[styles.chipText, { color: "#854d0e" }]}>{c}</Text></View>)}</View>
            </Section>
          )}

          {career.rome_codes.length > 0 && (
            <Section title="Codes ROME" icon={<Award size={16} color={colors.gray400} />}>
              {career.rome_codes.map((code, i) => (
                <View key={code} style={styles.romeRow}>
                  <Text style={styles.romeCode}>{code}</Text>
                  <Text style={styles.romeLabel}>{career.rome_labels[i] ?? ""}</Text>
                </View>
              ))}
            </Section>
          )}

          <TouchableOpacity style={styles.onisepLink} onPress={() => Linking.openURL(career.url_detail ?? career.url_onisep)} activeOpacity={0.8}>
            <View>
              <Text style={styles.onisepLinkTitle}>Voir la fiche complète</Text>
              <Text style={styles.onisepLinkSub}>Témoignages, vidéos, formations liées…</Text>
            </View>
            <ExternalLink size={20} color={colors.primary500} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.onisepLink} onPress={() => Linking.openURL("https://www.onisep.fr/")} activeOpacity={0.8}>
            <Image source={require("../../assets/logo_onisep.jpg")} style={{ width: 70, height: 20 }} resizeMode="contain" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.onisepLinkTitle}>Données récupérées sur le site Onisep.fr</Text>
              <Text style={styles.onisepLinkSub}>L'information officielle pour l'orientation</Text>
            </View>
            <ExternalLink size={20} color={colors.primary500} />
          </TouchableOpacity>
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
  notFound: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  notFoundText: { color: colors.gray500, fontSize: 16, marginBottom: 16 },
  backLink: { color: colors.primary500, fontWeight: "700" },
  header: { paddingTop: 60, paddingBottom: 24, paddingHorizontal: 16, minHeight: 200, justifyContent: "space-between" },
  headerNav: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  navBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.9)", alignItems: "center", justifyContent: "center" },
  headerContent: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 16 },
  careerTitle: { fontSize: 24, fontWeight: "bold", color: colors.white, textAlign: "center", textShadowColor: "rgba(0,0,0,0.5)", textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8, textTransform: "capitalize" },
  sectorBadge: { alignSelf: "flex-end", backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 24, borderWidth: 1, borderColor: "rgba(255,255,255,0.4)" },
  sectorBadgeText: { color: colors.white, fontSize: 12, fontWeight: "700" },
  body: { padding: 16, gap: 12 },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  badge: { flex: 1, minWidth: "45%", backgroundColor: colors.white, borderRadius: 16, padding: 12, flexDirection: "row", gap: 8, alignItems: "flex-start", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  badgeLabel: { fontSize: 11, color: colors.gray400, marginBottom: 2 },
  badgeValue: { fontSize: 12, fontWeight: "700", color: colors.gray800 },
  section: { backgroundColor: colors.white, borderRadius: 20, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: "bold", color: colors.gray800 },
  bodyText: { fontSize: 14, color: colors.gray700, lineHeight: 22 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { backgroundColor: colors.primary50, borderWidth: 1, borderColor: colors.primary100, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  chipText: { color: colors.primary700, fontSize: 13, fontWeight: "500" },
  bulletRow: { flexDirection: "row", gap: 8, marginBottom: 8, alignItems: "flex-start" },
  bullet: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#fca5a5", marginTop: 7 },
  stepRow: { flexDirection: "row", gap: 12, marginBottom: 4 },
  stepColumn: { alignItems: "center" },
  stepCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary500, alignItems: "center", justifyContent: "center" },
  stepNumber: { color: colors.white, fontWeight: "bold", fontSize: 12 },
  stepLine: { width: 2, flex: 1, backgroundColor: colors.primary100, marginVertical: 4, minHeight: 24 },
  stepContent: { flex: 1, paddingBottom: 16 },
  stepTitle: { fontSize: 14, fontWeight: "700", color: colors.gray800 },
  stepDetail: { fontSize: 12, color: colors.gray500, marginTop: 2, lineHeight: 18 },
  romeRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 8, backgroundColor: colors.gray50, borderRadius: 12, marginBottom: 8 },
  romeCode: { fontFamily: "monospace", fontSize: 12, fontWeight: "bold", color: colors.primary600, backgroundColor: colors.primary100, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  romeLabel: { flex: 1, fontSize: 12, color: colors.gray600 },
  onisepLink: { backgroundColor: colors.white, borderRadius: 20, padding: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  onisepLinkTitle: { fontWeight: "700", color: colors.gray800, fontSize: 14 },
  onisepLinkSub: { fontSize: 12, color: colors.gray400, marginTop: 2 },
  chatBtn: { position: "absolute", bottom: 100, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: "transparent", alignItems: "center", justifyContent: "center" },
});