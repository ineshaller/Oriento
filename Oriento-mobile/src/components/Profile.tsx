// src/components/Profile.tsx — React Native
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { User, GraduationCap, Heart, Edit, Sparkles, Award, LogOut } from "lucide-react-native";
import type { UserProfile } from "../../App";
import { colors } from "../config/colors";

interface ProfileProps {
  userProfile: UserProfile;
  onEdit: () => void;
  onLogout: () => void;
}

const interestLabels: { [key: string]: string } = {
  music: "Musique", art: "Art", tech: "Technologies", science: "Sciences",
  social: "Relationnel", literature: "Littérature", health: "Santé",
  sport: "Sport", travel: "Voyages", photo: "Photo/Vidéo", manual: "Travaux manuels",
};

const riasecNames: { [key: string]: string } = {
  R: "Réaliste", I: "Investigateur", A: "Artistique",
  S: "Social", E: "Entreprenant", C: "Conventionnel",
};

export default function Profile({ userProfile, onEdit, onLogout }: ProfileProps) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Mon profil</Text>
          <TouchableOpacity style={styles.editBtn} onPress={onEdit}>
            <Edit size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
        <View style={styles.avatar}>
          <User size={48} color={colors.white} />
        </View>

        {/* Affichage Prénom + Nom au-dessus de Lycéen */}
        {(userProfile.firstName || userProfile.lastName) && (
          <Text style={styles.avatarName}>
            {userProfile.firstName} {userProfile.lastName}
          </Text>
        )}

        <Text style={styles.avatarName}>Lycéen</Text>
        <Text style={styles.avatarInfo}>{userProfile.age || 16} ans · {userProfile.grade || "Seconde"}</Text>
        {userProfile.email && <Text style={styles.avatarEmail}>{userProfile.email}</Text>}
      </View>

      <View style={styles.content}>
        {/* RIASEC */}
        {userProfile.riasecProfile && userProfile.riasecProfile.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIcon, { backgroundColor: colors.primary100 }]}>
                <Sparkles size={20} color={colors.primary600} />
              </View>
              <Text style={styles.cardTitle}>Profil de personnalité</Text>
            </View>
            {userProfile.riasecProfile.map((code, index) => (
              <View key={code} style={styles.riasecRow}>
                <View style={styles.riasecBadge}>
                  <Text style={styles.riasecBadgeText}>{code}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.riasecName}>{riasecNames[code]}</Text>
                  {index === 0 && <Text style={styles.riasecPrimary}>Profil principal</Text>}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Parcours scolaire */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: "#dbeafe" }]}>
              <GraduationCap size={20} color="#2563eb" />
            </View>
            <Text style={styles.cardTitle}>Parcours scolaire</Text>
          </View>
          <Text style={styles.fieldLabel}>Classe actuelle</Text>
          <Text style={styles.fieldValue}>{userProfile.grade || "Non renseignée"}</Text>
          {userProfile.specialties && userProfile.specialties.length > 0 && (
            <>
              <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Spécialités</Text>
              <View style={styles.chips}>
                {userProfile.specialties.map(s => (
                  <View key={s} style={styles.chip}>
                    <Text style={styles.chipText}>{s}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>

        {/* Centres d'intérêt */}
        {userProfile.interests && userProfile.interests.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIcon, { backgroundColor: "#fce7f3" }]}>
                <Heart size={20} color="#ec4899" />
              </View>
              <Text style={styles.cardTitle}>Centres d'intérêt</Text>
            </View>
            <View style={styles.chips}>
              {userProfile.interests.map(interest => (
                <View key={interest} style={[styles.chip, { backgroundColor: "#fdf2f8" }]}>
                  <Text style={[styles.chipText, { color: "#be185d" }]}>{interestLabels[interest] || interest}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Stats */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: "#dcfce7" }]}>
              <Award size={20} color="#16a34a" />
            </View>
            <Text style={styles.cardTitle}>Activité</Text>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{userProfile.favoriteJobs?.length || 0}</Text>
              <Text style={styles.statLabel}>Métiers favoris</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{userProfile.savedFormations?.length || 0}</Text>
              <Text style={styles.statLabel}>Formations</Text>
            </View>
          </View>
        </View>

        {/* Boutons */}
        <TouchableOpacity style={styles.editButton} onPress={onEdit} activeOpacity={0.8}>
          <Text style={styles.editButtonText}>Modifier mon profil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout} activeOpacity={0.8}>
          <LogOut size={20} color={colors.gray600} />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 },
  header: { backgroundColor: colors.primary500, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 48, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, alignItems: "center" },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: 24 },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: colors.white },
  editBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  avatarName: { fontSize: 20, fontWeight: "bold", color: colors.white, marginBottom: 4 },
  avatarInfo: { color: "rgba(255,255,255,0.8)", fontSize: 14 },
  avatarEmail: { color: "rgba(255,255,255,0.7)", fontSize: 13, marginTop: 4 },
  content: { paddingHorizontal: 24, paddingTop: 24, gap: 16 },
  card: { backgroundColor: colors.white, borderRadius: 20, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  cardIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: colors.gray800 },
  riasecRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  riasecBadge: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.primary500, alignItems: "center", justifyContent: "center" },
  riasecBadgeText: { color: colors.white, fontWeight: "bold", fontSize: 14 },
  riasecName: { fontWeight: "600", color: colors.gray800 },
  riasecPrimary: { fontSize: 12, color: colors.primary600 },
  fieldLabel: { fontSize: 13, color: colors.gray600, marginBottom: 4 },
  fieldValue: { fontWeight: "600", color: colors.gray800 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { backgroundColor: "#dbeafe", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  chipText: { color: "#1d4ed8", fontSize: 13, fontWeight: "500" },
  statsRow: { flexDirection: "row", gap: 12 },
  statBox: { flex: 1, backgroundColor: colors.gray50, borderRadius: 12, padding: 12, alignItems: "center" },
  statNumber: { fontSize: 24, fontWeight: "bold", color: colors.gray800 },
  statLabel: { fontSize: 13, color: colors.gray600, textAlign: "center" },
  editButton: { backgroundColor: colors.primary500, borderRadius: 16, paddingVertical: 18, alignItems: "center" },
  editButtonText: { color: colors.white, fontSize: 16, fontWeight: "700" },
  logoutButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: colors.gray100, borderRadius: 16, paddingVertical: 18 },
  logoutText: { color: colors.gray600, fontSize: 16, fontWeight: "600" },
});