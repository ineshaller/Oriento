// src/components/ProfileCreation.tsx — React Native
import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ChevronRight, Music, Palette, Code, Beaker, Users, Book, Heart, Trophy, Globe, Camera, Wrench } from "lucide-react-native";
import type { UserProfile } from "../../App";
import { colors } from "../config/colors";

interface ProfileCreationProps {
  userProfile: UserProfile;
  onComplete: (profile: Partial<UserProfile>) => void;
}

const grades = ["Seconde", "Première", "Terminale"];
const specialties = ["HGGSP","HLP","LLCE","LLCA","Maths","NSI","SVT","SI","SES","Physique-Chimie","Arts","Sports"];
const interests = [
  { id: "music", label: "Musique", icon: Music },
  { id: "art", label: "Art", icon: Palette },
  { id: "tech", label: "Technologies", icon: Code },
  { id: "science", label: "Sciences", icon: Beaker },
  { id: "social", label: "Relationnel", icon: Users },
  { id: "literature", label: "Littérature", icon: Book },
  { id: "health", label: "Santé", icon: Heart },
  { id: "sport", label: "Sport", icon: Trophy },
  { id: "travel", label: "Voyages", icon: Globe },
  { id: "photo", label: "Photo/Vidéo", icon: Camera },
  { id: "manual", label: "Travaux manuels", icon: Wrench },
];

export default function ProfileCreation({ userProfile, onComplete }: ProfileCreationProps) {
  const [step, setStep] = useState(1);
  const [age, setAge] = useState(userProfile.age || 16);
  const [grade, setGrade] = useState(userProfile.grade || "");
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(userProfile.specialties || []);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(userProfile.interests || []);
  const [saving, setSaving] = useState(false);

  const isSeconde = grade === "Seconde";
  const totalSteps = isSeconde ? 3 : 4;

  const toggleSpecialty = (s: string) => {
    setSelectedSpecialties(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s].slice(0, 3));
  };
  const toggleInterest = (id: string) => {
    setSelectedInterests(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const canProceed = () => {
    switch (step) {
      case 1: return age >= 14 && age <= 18;
      case 2: return grade !== "";
      case 3: return isSeconde ? selectedInterests.length > 0 : selectedSpecialties.length > 0;
      case 4: return selectedInterests.length > 0;
      default: return false;
    }
  };

  const handleNext = async () => {
    if (step < totalSteps) { setStep(step + 1); return; }
    const profileData = { age, grade, specialties: selectedSpecialties, interests: selectedInterests };
    const token = await AsyncStorage.getItem("token");
    if (token) {
      setSaving(true);
      try {
        await fetch("http://localhost:3001/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(profileData),
        });
      } catch (err) {
        console.error("Sauvegarde du profil échouée:", err);
      } finally {
        setSaving(false);
      }
    }
    onComplete(profileData);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.progressBar}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <View key={i} style={[styles.progressSegment, i + 1 <= step ? styles.progressActive : styles.progressInactive]} />
          ))}
        </View>
        <Text style={styles.stepText}>Étape {step} sur {totalSteps}</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 24 }}>
        {step === 1 && (
          <View>
            <Text style={styles.stepTitle}>Quel âge as-tu ?</Text>
            <Text style={styles.stepSubtitle}>Cela nous aidera à personnaliser ton expérience</Text>
            <View style={styles.ageRow}>
              <TouchableOpacity style={styles.ageBtn} onPress={() => setAge(Math.max(14, age - 1))}>
                <Text style={styles.ageBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.ageValue}>{age}</Text>
              <TouchableOpacity style={styles.ageBtn} onPress={() => setAge(Math.min(18, age + 1))}>
                <Text style={styles.ageBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={styles.stepTitle}>Dans quelle classe es-tu ?</Text>
            <Text style={styles.stepSubtitle}>Sélectionne ta classe actuelle</Text>
            <View style={{ gap: 12 }}>
              {grades.map(g => (
                <TouchableOpacity key={g} onPress={() => setGrade(g)} style={[styles.gradeBtn, grade === g && styles.gradeBtnActive]}>
                  <Text style={[styles.gradeBtnText, grade === g && styles.gradeBtnTextActive]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {step === 3 && !isSeconde && (
          <View>
            <Text style={styles.stepTitle}>Tes spécialités</Text>
            <Text style={styles.stepSubtitle}>Choisis tes spécialités</Text>
            <View style={styles.chips}>
              {specialties.map(s => (
                <TouchableOpacity key={s} onPress={() => toggleSpecialty(s)} style={[styles.chip, selectedSpecialties.includes(s) && styles.chipActive]}>
                  <Text style={[styles.chipText, selectedSpecialties.includes(s) && styles.chipTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {(step === 4 || (step === 3 && isSeconde)) && (
          <View>
            <Text style={styles.stepTitle}>Tes centres d'intérêt</Text>
            <Text style={styles.stepSubtitle}>Qu'est-ce qui te passionne ?</Text>
            <View style={styles.interestGrid}>
              {interests.map(({ id, label, icon: Icon }) => (
                <TouchableOpacity key={id} onPress={() => toggleInterest(id)} style={[styles.interestItem, selectedInterests.includes(id) && styles.interestItemActive]}>
                  <Icon size={24} color={selectedInterests.includes(id) ? colors.white : colors.gray700} />
                  <Text style={[styles.interestLabel, selectedInterests.includes(id) && styles.interestLabelActive]}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.nextBtn, (!canProceed() || saving) && styles.nextBtnDisabled]} onPress={handleNext} disabled={!canProceed() || saving} activeOpacity={0.8}>
          <Text style={styles.nextBtnText}>{saving ? "Sauvegarde..." : step === totalSteps ? "Terminer" : "Suivant"}</Text>
          {!saving && <ChevronRight size={20} color={colors.white} />}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 16 },
  progressBar: { flexDirection: "row", gap: 8, marginBottom: 8 },
  progressSegment: { flex: 1, height: 6, borderRadius: 3 },
  progressActive: { backgroundColor: colors.primary500 },
  progressInactive: { backgroundColor: colors.gray200 },
  stepText: { fontSize: 13, color: colors.gray500 },
  content: { flex: 1, paddingHorizontal: 24 },
  stepTitle: { fontSize: 24, fontWeight: "bold", color: colors.gray800, marginBottom: 8 },
  stepSubtitle: { fontSize: 15, color: colors.gray600, marginBottom: 32 },
  ageRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 32, marginTop: 48 },
  ageBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primary100, alignItems: "center", justifyContent: "center" },
  ageBtnText: { fontSize: 24, fontWeight: "bold", color: colors.primary600 },
  ageValue: { fontSize: 64, fontWeight: "bold", color: colors.primary600 },
  gradeBtn: { padding: 18, borderRadius: 16, backgroundColor: colors.gray50 },
  gradeBtnActive: { backgroundColor: colors.primary500 },
  gradeBtnText: { fontSize: 16, fontWeight: "600", color: colors.gray700 },
  gradeBtnTextActive: { color: colors.white },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 24, backgroundColor: colors.gray100 },
  chipActive: { backgroundColor: colors.primary500 },
  chipText: { fontSize: 14, fontWeight: "500", color: colors.gray700 },
  chipTextActive: { color: colors.white },
  interestGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  interestItem: { width: "30%", padding: 16, borderRadius: 16, backgroundColor: colors.gray50, alignItems: "center", gap: 8 },
  interestItemActive: { backgroundColor: colors.primary500 },
  interestLabel: { fontSize: 12, fontWeight: "500", color: colors.gray700, textAlign: "center" },
  interestLabelActive: { color: colors.white },
  footer: { paddingHorizontal: 24, paddingBottom: 40, paddingTop: 16 },
  nextBtn: { backgroundColor: colors.primary500, borderRadius: 16, paddingVertical: 18, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  nextBtnDisabled: { opacity: 0.5 },
  nextBtnText: { color: colors.white, fontSize: 16, fontWeight: "700" },
});