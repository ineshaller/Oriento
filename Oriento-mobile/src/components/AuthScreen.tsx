import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ChevronRight, ArrowLeft, Eye, EyeOff } from "lucide-react-native";
import { register, login } from "../api/auth";
import { colors } from "../config/colors";

interface AuthScreenProps {
  onAuthComplete: (userData: { 
    email: string; 
    token: string; 
    isNewUser: boolean;
    firstName?: string; 
    lastName?: string;  
  }) => void;
}

type AuthMode = "welcome" | "login" | "register" | "forgot-password";

export default function AuthScreen({ onAuthComplete }: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>("welcome");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const clearErrors = () => setError("");
  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const validatePassword = (p: string) => p.length >= 8;

  const handleRegister = async () => {
    clearErrors();
    if (!firstName.trim()) return setError("Saisis ton prénom.");
    if (!lastName.trim()) return setError("Saisis ton nom.");
    if (!validateEmail(email)) return setError("Adresse email invalide.");
    if (!validatePassword(password)) return setError("Le mot de passe doit contenir au moins 8 caractères.");
    if (password !== confirmPassword) return setError("Les mots de passe ne correspondent pas.");
    setLoading(true);
    try {
      // Correction ici avec "as any" pour éviter l'erreur sur .message et .error
      const res = await register(email, password, firstName, lastName) as any;
      if (res.message?.toLowerCase().includes("erreur") || res.error) {
        setError(res.message || "Une erreur est survenue.");
      } else {
        const loginRes = await login(email, password) as any;
        if (loginRes.token) {
          await AsyncStorage.setItem("token", loginRes.token);
          onAuthComplete({ 
            email, 
            token: loginRes.token, 
            isNewUser: true,
            firstName,
            lastName
          });
        } else {
          setError("Compte créé mais connexion échouée.");
          setMode("login");
        }
      }
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    clearErrors();
    if (!validateEmail(email)) return setError("Adresse email invalide.");
    if (!password) return setError("Saisis ton mot de passe.");
    setLoading(true);
    try {
      const res = await login(email, password) as any;
      if (res.token) {
        await AsyncStorage.setItem("token", res.token);
        onAuthComplete({ email, token: res.token, isNewUser: false });
      } else {
        setError(res.message || "Email ou mot de passe incorrect.");
      }
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    clearErrors();
    if (!validateEmail(email)) return setError("Saisis une adresse email valide.");
    setLoading(true);
    try {
      const res = await fetch("http://172.17.30.82:3001/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) setResetEmailSent(true);
      else {
        const data = await res.json();
        setError(data.message || "Une erreur est survenue.");
      }
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  };

  if (mode === "welcome") {
    return (
      <View style={styles.container}>
        <View style={styles.heroSection}>
          <Image
            source={require("../../assets/logo_oriento.png")}
            style={{ width: 300, height: 300 }}
          />
          <Text style={styles.heroTitle}>Bienvenue !</Text>
          <Text style={styles.heroSubtitle}>
            Crée un compte pour sauvegarder ton profil et retrouver tes résultats à tout moment.
          </Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryButton} onPress={() => { clearErrors(); setMode("register"); }} activeOpacity={0.8}>
            <Text style={styles.primaryButtonText}>Créer un compte</Text>
            <ChevronRight size={20} color={colors.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => { clearErrors(); setMode("login"); }} activeOpacity={0.8}>
            <Text style={styles.secondaryButtonText}>J'ai déjà un compte</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (mode === "forgot-password") {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => setMode("login")}>
          <ArrowLeft size={24} color={colors.gray600} />
        </TouchableOpacity>
        <Text style={styles.formTitle}>Mot de passe oublié ?</Text>
        <Text style={styles.formSubtitle}>Saisis ton email et on t'envoie un lien pour le réinitialiser.</Text>
        {resetEmailSent ? (
          <View style={styles.successBox}>
            <Text style={styles.successText}>Email envoyé ! Vérifie ta boîte mail.</Text>
          </View>
        ) : (
          <View style={styles.form}>
            <TextInput style={styles.input} placeholder="ton@email.com" value={email} onChangeText={(v) => { setEmail(v); clearErrors(); }} keyboardType="email-address" autoCapitalize="none" />
            {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}
            <TouchableOpacity style={[styles.primaryButton, (!email || loading) && styles.buttonDisabled]} onPress={handleForgotPassword} disabled={!email || loading} activeOpacity={0.8}>
              <Text style={styles.primaryButtonText}>{loading ? "Envoi..." : "Envoyer le lien"}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  if (mode === "login") {
    return (
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <TouchableOpacity style={styles.backButton} onPress={() => setMode("welcome")}>
          <ArrowLeft size={24} color={colors.gray600} />
        </TouchableOpacity>
        <Text style={styles.formTitle}>Connexion</Text>
        <Text style={styles.formSubtitle}>Oriento est content de te revoir </Text>
        <View style={styles.form}>
          <TextInput style={styles.input} placeholder="ton@email.com" value={email} onChangeText={(v) => { setEmail(v); clearErrors(); }} keyboardType="email-address" autoCapitalize="none" />
          
          <View style={styles.inputContainer}>
            <TextInput style={styles.input} placeholder="Mot de passe" value={password} onChangeText={(v) => { setPassword(v); clearErrors(); }} secureTextEntry={!showPassword} />
            <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={22} color={colors.gray400} /> : <Eye size={22} color={colors.gray400} />}
            </TouchableOpacity>
          </View>

          {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}
          <TouchableOpacity onPress={() => { clearErrors(); setMode("forgot-password"); }}>
            <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.primaryButton, (!email || !password || loading) && styles.buttonDisabled]} onPress={handleLogin} disabled={!email || !password || loading} activeOpacity={0.8}>
            <Text style={styles.primaryButtonText}>{loading ? "Connexion..." : "Se connecter"}</Text>
            {!loading && <ChevronRight size={20} color={colors.white} />}
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => { clearErrors(); setMode("register"); }}>
          <Text style={styles.switchText}>Pas encore de compte ? <Text style={styles.switchLink}>S'inscrire</Text></Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <TouchableOpacity style={styles.backButton} onPress={() => setMode("welcome")}>
          <ArrowLeft size={24} color={colors.gray600} />
        </TouchableOpacity>
        <Text style={styles.formTitle}>Créer un compte</Text>
        <Text style={styles.formSubtitle}>Rejoins des milliers de jeunes qui trouvent leur voie</Text>
        <View style={styles.form}>
          <TextInput style={styles.input} placeholder="Prénom" value={firstName} onChangeText={(v) => { setFirstName(v); clearErrors(); }} />
          <TextInput style={styles.input} placeholder="Nom" value={lastName} onChangeText={(v) => { setLastName(v); clearErrors(); }} />
          <TextInput style={styles.input} placeholder="ton@email.com" value={email} onChangeText={(v) => { setEmail(v); clearErrors(); }} keyboardType="email-address" autoCapitalize="none" />
          
          <View style={styles.inputContainer}>
            <TextInput style={styles.input} placeholder="Mot de passe (8 caractères min.)" value={password} onChangeText={(v) => { setPassword(v); clearErrors(); }} secureTextEntry={!showPassword} />
            <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={22} color={colors.gray400} /> : <Eye size={22} color={colors.gray400} />}
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <TextInput style={styles.input} placeholder="Confirmer le mot de passe" value={confirmPassword} onChangeText={(v) => { setConfirmPassword(v); clearErrors(); }} secureTextEntry={!showConfirmPassword} />
            <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? <EyeOff size={22} color={colors.gray400} /> : <Eye size={22} color={colors.gray400} />}
            </TouchableOpacity>
          </View>

          {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}
          <TouchableOpacity style={[styles.primaryButton, (!email || !password || !confirmPassword || !firstName || !lastName || loading) && styles.buttonDisabled]} onPress={handleRegister} disabled={!email || !password || !confirmPassword || !firstName || !lastName || loading} activeOpacity={0.8}>
            <Text style={styles.primaryButtonText}>{loading ? "Création du compte..." : "Créer mon compte"}</Text>
            {!loading && <ChevronRight size={20} color={colors.white} />}
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => { clearErrors(); setMode("login"); }}>
          <Text style={styles.switchText}>Déjà un compte ? <Text style={styles.switchLink}>Se connecter</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white, paddingHorizontal: 24, paddingTop: 60 },
  heroSection: { flex: 1, alignItems: "center", justifyContent: "center" },
  heroIcon: { width: 80, height: 80, backgroundColor: colors.primary500, borderRadius: 24, alignItems: "center", justifyContent: "center", marginBottom: 24 },
  heroEmoji: { fontSize: 36 },
  heroTitle: { fontSize: 28, fontWeight: "bold", color: colors.gray800, marginBottom: 12 },
  heroSubtitle: { fontSize: 15, color: colors.gray500, textAlign: "center", lineHeight: 24, maxWidth: 300 },
  actions: { paddingBottom: 40, gap: 12 },
  primaryButton: { backgroundColor: colors.primary500, borderRadius: 16, paddingVertical: 18, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  primaryButtonText: { color: colors.white, fontSize: 16, fontWeight: "700" },
  secondaryButton: { backgroundColor: colors.gray100, borderRadius: 16, paddingVertical: 18, alignItems: "center" },
  secondaryButtonText: { color: colors.gray700, fontSize: 16, fontWeight: "600" },
  backButton: { padding: 8, marginBottom: 8, alignSelf: "flex-start" },
  formTitle: { fontSize: 24, fontWeight: "bold", color: colors.gray800, marginBottom: 8 },
  formSubtitle: { fontSize: 15, color: colors.gray500, marginBottom: 32 },
  form: { gap: 16 },
  inputContainer: { position: "relative", justifyContent: "center" },
  input: { backgroundColor: colors.gray50, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 16, fontSize: 16, color: colors.gray800, borderWidth: 1, borderColor: colors.gray100, width: '100%' },
  eyeIcon: { position: "absolute", right: 16, height: "100%", justifyContent: "center", paddingLeft: 10 },
  errorBox: { backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "#fecaca", borderRadius: 12, padding: 12 },
  errorText: { color: "#ef4444", fontSize: 14 },
  successBox: { backgroundColor: "#f0fdf4", borderWidth: 1, borderColor: "#bbf7d0", borderRadius: 16, padding: 16, alignItems: "center" },
  successText: { color: "#15803d", fontWeight: "600" },
  forgotText: { color: colors.primary500, fontSize: 14, fontWeight: "600" },
  buttonDisabled: { opacity: 0.5 },
  switchText: { textAlign: "center", color: colors.gray500, fontSize: 14, marginTop: 24 },
  switchLink: { color: colors.primary500, fontWeight: "700" },
});