// src/components/SplashScreen.tsx — React Native
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from "react-native";
import { colors } from "../config/colors";

const { height } = Dimensions.get("window");

interface SplashScreenProps {
  onStart: () => void;
}

export default function SplashScreen({ onStart }: SplashScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require("../../assets/logo_oriento.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>ORIENTO</Text>
        <Text style={styles.subtitle}>
          Chaque lycéen mérite une orientation qui lui ressemble.
        </Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={onStart} activeOpacity={0.8}>
        <Text style={styles.buttonText}>Commencer</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary50,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 60,
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 160,
    height: 160,
    marginBottom: 32,
  },
  title: {
    fontSize: 42,
    fontWeight: "bold",
    color: colors.primary600,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 17,
    color: colors.gray700,
    textAlign: "center",
    lineHeight: 26,
    maxWidth: 280,
  },
  button: {
    backgroundColor: colors.primary500,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: "700",
  },
});