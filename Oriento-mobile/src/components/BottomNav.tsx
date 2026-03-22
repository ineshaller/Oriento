// src/components/BottomNav.tsx — React Native
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Home, Compass, MessageCircle, Bookmark, User, GraduationCap } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Screen } from "../../App";
import { colors } from "../config/colors";

interface BottomNavProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

const navItems = [
  { id: "dashboard" as Screen, icon: Home, label: "Accueil" },
  { id: "careers" as Screen, icon: Compass, label: "Métiers" },
  { id: "formations" as Screen, icon: GraduationCap, label: "Formations" },
  { id: "chatbot" as Screen, icon: MessageCircle, label: "Chatbot" },
  { id: "favorites" as Screen, icon: Bookmark, label: "Favoris" },
  { id: "profile" as Screen, icon: User, label: "Profil" },
];

export default function BottomNav({ currentScreen, onNavigate }: BottomNavProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.nav}>
        {navItems.map(({ id, icon: Icon, label }) => {
          const isActive = currentScreen === id;
          return (
            <TouchableOpacity
              key={id}
              onPress={() => onNavigate(id)}
              style={[styles.item, isActive && styles.itemActive]}
              activeOpacity={0.7}
            >
              <Icon size={24} color={isActive ? colors.primary600 : colors.gray500} />
              <Text style={[styles.label, isActive && styles.labelActive]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  nav: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  item: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    gap: 4,
  },
  itemActive: { backgroundColor: colors.primary50 },
  label: { fontSize: 10, fontWeight: "500", color: colors.gray500 },
  labelActive: { color: colors.primary600 },
});