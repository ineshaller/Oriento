// src/components/Onboarding.tsx — React Native
import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Target, MessageCircle, Sparkles, ChevronRight } from "lucide-react-native";
import { colors } from "../config/colors";

interface OnboardingProps {
  onComplete: () => void;
}

const slides = [
  { icon: Target, title: "Trouve ta voie", description: "Découvre des métiers qui correspondent à ta personnalité et tes passions" },
  { icon: MessageCircle, title: "Un assistant toujours là", description: "Pose toutes tes questions à notre chatbot intelligent pour t'aider à chaque étape" },
  { icon: Sparkles, title: "Construis ton projet", description: "Explore les formations et parcours adaptés à tes ambitions" },
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) setCurrentSlide(currentSlide + 1);
    else onComplete();
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <View style={styles.container}>
      {/* Dots */}
      <View style={styles.dots}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, index === currentSlide ? styles.dotActive : styles.dotInactive]}
          />
        ))}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.iconWrapper}>
          <Icon size={64} color={colors.white} />
        </View>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.description}>{slide.description}</Text>
      </View>

      {/* Navigation */}
      <View style={styles.nav}>
        {currentSlide < slides.length - 1 && (
          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => setCurrentSlide(slides.length - 1)}
          >
            <Text style={styles.skipText}>Passer</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.8}>
          <Text style={styles.nextText}>
            {currentSlide === slides.length - 1 ? "Continuer" : "Suivant"}
          </Text>
          <ChevronRight size={20} color={colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary50, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  dots: { flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: 48 },
  dot: { height: 8, borderRadius: 4 },
  dotActive: { width: 32, backgroundColor: colors.primary500 },
  dotInactive: { width: 8, backgroundColor: colors.primary200 },
  content: { flex: 1, alignItems: "center", justifyContent: "center" },
  iconWrapper: {
    width: 128, height: 128, borderRadius: 64,
    backgroundColor: colors.primary500, alignItems: "center", justifyContent: "center",
    marginBottom: 32, shadowColor: "#000", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2, shadowRadius: 12, elevation: 6,
  },
  title: { fontSize: 28, fontWeight: "bold", color: colors.gray800, marginBottom: 16, textAlign: "center" },
  description: { fontSize: 17, color: colors.gray600, textAlign: "center", lineHeight: 26, maxWidth: 300 },
  nav: { flexDirection: "row", gap: 12 },
  skipButton: { flex: 1, paddingVertical: 18, borderRadius: 16, backgroundColor: colors.primary100, alignItems: "center" },
  skipText: { color: colors.primary600, fontWeight: "600", fontSize: 16 },
  nextButton: { flex: 1, paddingVertical: 18, borderRadius: 16, backgroundColor: colors.primary500, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 },
  nextText: { color: colors.white, fontWeight: "700", fontSize: 16 },
});