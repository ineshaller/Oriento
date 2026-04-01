// src/components/Dashboard.tsx — React Native
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from "react-native";
import { MessageCircle, Target, BookOpen, Sparkles, ChevronRight, CheckCircle, Circle } from "lucide-react-native";
import type { UserProfile, Screen } from "../../App";
import { colors } from "../config/colors";
import careersData from "../data/careers_enriched.json";
import formationsData from "../data/formations.json";

interface Career { id: string; title: string; sector: string; }
const careers = careersData as Career[];

interface DashboardProps {
  userProfile: UserProfile;
  onNavigate: (screen: Screen) => void;
  onCareerClick: (careerId: string) => void;
}

export default function Dashboard({ userProfile, onNavigate, onCareerClick }: DashboardProps) {
  const favoriteJobsCount = userProfile.favoriteJobs?.length || 0;
  const savedFormationsCount = userProfile.savedFormations?.length || 0;
  const hasCompletedTest = !!(userProfile.riasecProfile && userProfile.riasecProfile.length > 0);
  const hasFavoriteJob = favoriteJobsCount > 0;
  const hasFavoriteFormation = savedFormationsCount > 0;
  const hasChatted = hasCompletedTest && hasFavoriteJob;

  const tasks = [
    { label: "Faire le test RIASEC", done: hasCompletedTest, screen: "riasec-test" as Screen },
    { label: "Mettre en favori 1 métier", done: hasFavoriteJob, screen: "careers" as Screen },
    { label: "Mettre en favori 1 formation", done: hasFavoriteFormation, screen: "formations" as Screen },
    { label: "Discuter avec le chatbot", done: hasChatted, screen: "chatbot" as Screen },
  ];

  const completedCount = tasks.filter(t => t.done).length;
  const allDone = completedCount === tasks.length;
  const progressPercentage = Math.round((completedCount / tasks.length) * 100);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerIcon}>
            <Image
              source={require("../../assets/oriento_bot.png")}
              style={{ width: 100, height: 100 }}
              resizeMode="contain"
            />
          </View>
          <View>
            {/* Modification ici : Bonjour [Prénom] ! */}
            <Text style={styles.headerTitle}>
              Bonjour{userProfile.firstName ? ` ${userProfile.firstName}` : ""} !
            </Text>
            <Text style={styles.headerSubtitle}>{userProfile.grade || "Lycéen"} · {userProfile.age || 16} ans</Text>
          </View>
        </View>
        <View style={styles.progressCard}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Progression</Text>
            <Text style={styles.progressValue}>{progressPercentage}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
          </View>
          <Text style={styles.progressMessage}>{completedCount}/{tasks.length} étapes complétées</Text>
        </View>
      </View>

      {/* ... reste du code inchangé ... */}
      
      {/* Badge débloqué */}
      {allDone && (
        <View style={styles.badgeCard}>
          <Image
            source={require("../../assets/badge_bravo.png")}
            style={styles.badgeImage}
            resizeMode="contain"
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.badgeTitle}>🎉 Badge débloqué !</Text>
            <Text style={styles.badgeSubtitle}>Explorateur d'orientation — Tu as complété toutes les étapes !</Text>
          </View>
        </View>
      )}

      {/* Liste des tâches */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tes étapes</Text>
        <View style={styles.tasksCard}>
          {tasks.map((task, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.taskRow, index < tasks.length - 1 && styles.taskRowBorder]}
              onPress={() => !task.done && onNavigate(task.screen)}
              activeOpacity={task.done ? 1 : 0.7}
            >
              {task.done
                ? <CheckCircle size={24} color={colors.primary500} />
                : <Circle size={24} color={colors.gray300} />
              }
              <Text style={[styles.taskLabel, task.done && styles.taskLabelDone]}>
                {task.label}
              </Text>
              {!task.done && <ChevronRight size={18} color={colors.gray400} />}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Action rapide</Text>
        <View style={styles.actionsCard}>
          <TouchableOpacity style={styles.actionRow} onPress={() => onNavigate("chatbot")} activeOpacity={0.7}>
            <View style={[styles.actionIcon]}>
              <Image
                source={require("../../assets/oriento_bot.png")}
                style={{ width: 100, height: 100 }}
                resizeMode="contain"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.actionTitle}>Poser une question</Text>
              <Text style={styles.actionSubtitle}>Parle avec ton assistant Oriento</Text>
            </View>
            <ChevronRight size={20} color={colors.gray400} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Profil RIASEC */}
      {hasCompletedTest && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ton profil</Text>
          <View style={styles.riasecCard}>
            <View style={styles.riasecProfileRow}>
              <Sparkles size={20} color={colors.primary500} />
              <Text style={styles.riasecProfileLabel}>Profil RIASEC</Text>
            </View>
            <View style={styles.riasecCodes}>
              {userProfile.riasecProfile?.map(code => (
                <View key={code} style={styles.riasecCodeBadge}>
                  <Text style={styles.riasecCodeText}>{code}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tes favoris</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Target size={20} color={colors.primary600} />
            </View>
            <Text style={styles.statNumber}>{favoriteJobsCount}</Text>
            <Text style={styles.statLabel}>Métiers</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#dbeafe" }]}>
              <BookOpen size={20} color="#2563eb" />
            </View>
            <Text style={styles.statNumber}>{savedFormationsCount}</Text>
            <Text style={styles.statLabel}>Formations</Text>
          </View>
        </View>
      </View>

      {/* Métiers favoris */}
      {favoriteJobsCount > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Métiers</Text>
            <TouchableOpacity onPress={() => onNavigate("favorites")}>
              <Text style={styles.seeAll}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          {userProfile.favoriteJobs?.slice(0, 3).map(jobId => {
            const career = careers.find(c => c.id === jobId);
            return (
              <TouchableOpacity key={jobId} style={styles.favItem} onPress={() => onCareerClick(jobId)} activeOpacity={0.7}>
                <Text style={styles.favTitle} numberOfLines={1}>{career?.title ?? jobId}</Text>
                <ChevronRight size={20} color={colors.gray400} />
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Formations sauvegardées */}
      {savedFormationsCount > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Formations</Text>
            <TouchableOpacity onPress={() => onNavigate("favorites")}>
              <Text style={styles.seeAll}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          {userProfile.savedFormations?.slice(0, 3).map(fid => {
            const formation = (formationsData as any[]).find(f => f.id === fid);
            return (
              <View key={fid} style={styles.favItem}>
                <Text style={styles.favTitle} numberOfLines={1}>
                  {formation ? formation.title : fid}
                </Text>
                <ChevronRight size={20} color={colors.gray400} />
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 },
  header: { backgroundColor: colors.primary500, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerTop: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 24 },
  headerIcon: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: colors.white },
  headerSubtitle: { fontSize: 13, color: "rgba(255,255,255,0.8)" },
  progressCard: { backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 16, padding: 16 },
  progressRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  progressLabel: { color: colors.white, fontWeight: "600" },
  progressValue: { color: colors.white, fontWeight: "bold" },
  progressBar: { height: 8, backgroundColor: "rgba(255,255,255,0.3)", borderRadius: 4, overflow: "hidden", marginBottom: 8 },
  progressFill: { height: "100%", backgroundColor: colors.white, borderRadius: 4 },
  progressMessage: { fontSize: 13, color: "rgba(255,255,255,0.8)" },
  badgeCard: { marginHorizontal: 24, marginTop: 24, backgroundColor: "#eff6ff", borderWidth: 2, borderColor: colors.primary300, borderRadius: 20, padding: 16, flexDirection: "row", alignItems: "center", gap: 16 },
  badgeImage: { width: 80, height: 80 },
  badgeTitle: { fontSize: 16, fontWeight: "bold", color: colors.primary700, marginBottom: 4 },
  badgeSubtitle: { fontSize: 13, color: colors.primary600, lineHeight: 18 },
  section: { marginHorizontal: 24, marginTop: 24 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: "bold", color: colors.gray800, marginBottom: 12 },
  seeAll: { color: colors.primary600, fontWeight: "600", fontSize: 13 },
  tasksCard: { backgroundColor: colors.white, borderRadius: 20, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  taskRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
  taskRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  taskLabel: { flex: 1, fontSize: 15, color: colors.gray800, fontWeight: "500" },
  taskLabelDone: { color: colors.gray400, textDecorationLine: "line-through" },
  actionsCard: { backgroundColor: colors.white, borderRadius: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4, overflow: "hidden" },
  actionRow: { flexDirection: "row", alignItems: "center", gap: 16, padding: 16 },
  actionIcon: { width: 48, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  actionTitle: { fontSize: 15, fontWeight: "600", color: colors.gray800 },
  actionSubtitle: { fontSize: 13, color: colors.gray500 },
  actionDivider: { height: 1, backgroundColor: colors.gray100, marginHorizontal: 16 },
  riasecCard: { backgroundColor: colors.white, borderRadius: 16, padding: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  riasecProfileRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  riasecProfileLabel: { fontWeight: "600", color: colors.gray800 },
  riasecCodes: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  riasecCodeBadge: { backgroundColor: colors.primary100, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  riasecCodeText: { color: colors.primary700, fontWeight: "700" },
  statsGrid: { flexDirection: "row", gap: 12 },
  statCard: { flex: 1, backgroundColor: colors.white, borderRadius: 16, padding: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  statIcon: { width: 40, height: 40, backgroundColor: colors.primary100, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  statNumber: { fontSize: 24, fontWeight: "bold", color: colors.gray800 },
  statLabel: { fontSize: 13, color: colors.gray600 },
  favItem: { backgroundColor: colors.white, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, flexDirection: "row", alignItems: "center", marginBottom: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  favTitle: { flex: 1, fontSize: 14, fontWeight: "500", color: colors.gray800, textTransform: "capitalize" },
});