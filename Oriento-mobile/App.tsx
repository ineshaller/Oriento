// App.tsx — Version corrigée pour Prénom et Nom
import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SplashScreen from "./src/components/SplashScreen";
import Onboarding from "./src/components/Onboarding";
import AuthScreen from "./src/components/AuthScreen";
import ProfileCreation from "./src/components/ProfileCreation";
import TestProposal from "./src/components/TestProposal";
import RiasecTest from "./src/components/RiasecTest";
import TestResults from "./src/components/TestResults";
import Dashboard from "./src/components/Dashboard";
import Chatbot, { clearChatHistory } from "./src/components/Chatbot";
import CareersExplorer from "./src/components/CareersExplorer";
import CareerDetail from "./src/components/CareerDetail";
import FormationsExplorer from "./src/components/FormationsExplorer";
import FormationDetail from "./src/components/FormationDetail";
import Favorites from "./src/components/Favorites";
import Profile from "./src/components/Profile";
import BottomNav from "./src/components/BottomNav";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export type Screen =
  | "splash"
  | "onboarding"
  | "auth"
  | "profile-creation"
  | "profile-creation-edit"
  | "test-proposal"
  | "riasec-test"
  | "test-results"
  | "dashboard"
  | "chatbot"
  | "careers"
  | "career-detail"
  | "formations"
  | "formation-detail"
  | "favorites"
  | "profile";

export interface UserProfile {
  email?: string;
  firstName?: string; // Ajouté
  lastName?: string;  // Ajouté
  token?: string;
  age?: number;
  grade?: string;
  specialties?: string[];
  interests?: string[];
  riasecProfile?: string[];
  riasecScores?: { [key: string]: number };
  riasecPrimaryCount?: number;
  favoriteJobs?: string[];
  savedFormations?: string[];
}

function computePrimaryCount(
  scores: { [key: string]: number },
  orderedCodes: string[]
): number {
  if (!orderedCodes.length) return 1;
  const topScore = scores[orderedCodes[0]];
  let count = 0;

  for (const code of orderedCodes) {
    if (scores[code] === topScore) count++;
    else break;
  }

  return Math.max(1, count);
}

async function saveProfileToDB(token: string, data: Partial<UserProfile>) {
  try {
    if (!API_URL) {
      console.error("EXPO_PUBLIC_API_URL est manquant");
      return;
    }

    const res = await fetch(`${API_URL}/api/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Sauvegarde BDD échouée :", errorText);
    }
  } catch (error) {
    console.error("Sauvegarde BDD échouée :", error);
  }
}

async function fetchProfileFromDB(token: string) {
  if (!API_URL) {
    throw new Error("EXPO_PUBLIC_API_URL est manquant");
  }

  const res = await fetch(`${API_URL}/api/profile`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Impossible de récupérer le profil");
  }

  return res.json();
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("splash");
  const [userProfile, setUserProfile] = useState<UserProfile>({
    favoriteJobs: [],
    savedFormations: [],
    riasecProfile: [],
    riasecScores: undefined,
    riasecPrimaryCount: 1,
  });
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);
  const [selectedFormation, setSelectedFormation] = useState<string | null>(null);

  const updateProfile = (updates: Partial<UserProfile>) =>
    setUserProfile((prev) => ({ ...prev, ...updates }));

  const navigateToCareerDetail = (careerId: string) => {
    setSelectedCareer(careerId);
    setCurrentScreen("career-detail");
  };

  const navigateToFormationDetail = (formationId: string) => {
    setSelectedFormation(formationId);
    setCurrentScreen("formation-detail");
  };

  const toggleFavoriteJob = (jobId: string) => {
    setUserProfile((prev) => {
      const favoriteJobs = prev.favoriteJobs || [];
      const updated = favoriteJobs.includes(jobId)
        ? favoriteJobs.filter((id) => id !== jobId)
        : [...favoriteJobs, jobId];

      if (prev.token) {
        saveProfileToDB(prev.token, { favoriteJobs: updated });
      }

      return { ...prev, favoriteJobs: updated };
    });
  };

  const toggleSavedFormation = (formationId: string) => {
    setUserProfile((prev) => {
      const savedFormations = prev.savedFormations || [];
      const updated = savedFormations.includes(formationId)
        ? savedFormations.filter((id) => id !== formationId)
        : [...savedFormations, formationId];

      if (prev.token) {
        saveProfileToDB(prev.token, { savedFormations: updated });
      }

      return { ...prev, savedFormations: updated };
    });
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    await clearChatHistory();

    setUserProfile({
      favoriteJobs: [],
      savedFormations: [],
      riasecProfile: [],
      riasecScores: undefined,
      riasecPrimaryCount: 1,
    });

    setCurrentScreen("auth");
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "splash":
        return <SplashScreen onStart={() => setCurrentScreen("onboarding")} />;

      case "onboarding":
        return <Onboarding onComplete={() => setCurrentScreen("auth")} />;

      case "auth":
        return (
          <AuthScreen
            onAuthComplete={async ({
              email,
              token,
              isNewUser,
              firstName, // Récupéré de AuthScreen
              lastName,  // Récupéré de AuthScreen
            }: {
              email: string;
              token: string;
              isNewUser: boolean;
              firstName?: string;
              lastName?: string;
            }) => {
              if (token === "demo-token") {
                updateProfile({
                  email,
                  token,
                  firstName: "Jean",
                  lastName: "Demo",
                  age: 17,
                  grade: "Terminale",
                  specialties: ["Maths", "NSI"],
                  interests: ["tech", "science"],
                  riasecProfile: ["I", "R", "E", "C", "A", "S"],
                  riasecScores: { I: 28, R: 24, E: 20, C: 18, A: 15, S: 12 },
                  riasecPrimaryCount: 1,
                  favoriteJobs: [],
                  savedFormations: [],
                });
                setCurrentScreen("dashboard");
                return;
              }

              if (isNewUser) {
                // On sauvegarde le prénom et nom reçus lors de l'inscription
                updateProfile({ email, token, firstName, lastName });
                setCurrentScreen("profile-creation");
              } else {
                try {
                  const data = await fetchProfileFromDB(token);
                  const p = data.profile || {};

                  updateProfile({
                    email,
                    token,
                    firstName: p.firstName, // Récupéré du backend
                    lastName: p.lastName,   // Récupéré du backend
                    age: p.age,
                    grade: p.grade,
                    specialties: p.specialties || [],
                    interests: p.interests || [],
                    riasecProfile: p.riasecProfile || [],
                    riasecScores: p.riasecScores,
                    riasecPrimaryCount: p.riasecPrimaryCount || 1,
                    favoriteJobs: p.favoriteJobs || [],
                    savedFormations: p.savedFormations || [],
                  });

                  setCurrentScreen("dashboard");
                } catch (error) {
                  console.error("Chargement profil impossible :", error);
                  updateProfile({ email, token });
                  setCurrentScreen("profile-creation");
                }
              }
            }}
          />
        );

      case "profile-creation":
        return (
          <ProfileCreation
            userProfile={userProfile}
            onComplete={(p: Partial<UserProfile>) => {
              updateProfile(p);

              if (userProfile.token) {
                saveProfileToDB(userProfile.token, p);
              }

              setCurrentScreen("test-proposal");
            }}
          />
        );

      case "profile-creation-edit":
        return (
          <ProfileCreation
            userProfile={userProfile}
            onComplete={(p: Partial<UserProfile>) => {
              updateProfile(p);

              if (userProfile.token) {
                saveProfileToDB(userProfile.token, p);
              }

              setCurrentScreen("profile");
            }}
          />
        );

      case "test-proposal":
        return (
          <TestProposal
            onTakeTest={() => setCurrentScreen("riasec-test")}
            onSkip={() => setCurrentScreen("dashboard")}
          />
        );

      case "riasec-test":
        return (
          <RiasecTest
            onComplete={(results: string[], scores: { [key: string]: number }) => {
              const primaryCount = scores
                ? computePrimaryCount(scores, results)
                : 1;

              const riasecData = {
                riasecProfile: results,
                riasecScores: scores,
                riasecPrimaryCount: primaryCount,
              };

              updateProfile(riasecData);

              if (userProfile.token) {
                saveProfileToDB(userProfile.token, riasecData);
              }

              setCurrentScreen("test-results");
            }}
          />
        );

      case "test-results":
        return (
          <TestResults
            riasecProfile={userProfile.riasecProfile || []}
            scores={userProfile.riasecScores}
            onExplore={() => setCurrentScreen("dashboard")}
            onChat={() => setCurrentScreen("chatbot")}
          />
        );

      case "dashboard":
        return (
          <Dashboard
            userProfile={userProfile}
            onNavigate={setCurrentScreen}
            onCareerClick={navigateToCareerDetail}
          />
        );

      case "chatbot":
        return (
          <Chatbot userProfile={userProfile} onNavigate={setCurrentScreen} />
        );

      case "careers":
        return (
          <CareersExplorer
            userProfile={userProfile}
            onCareerClick={navigateToCareerDetail}
            onToggleFavorite={toggleFavoriteJob}
          />
        );

      case "career-detail":
        return (
          <CareerDetail
            careerId={selectedCareer || ""}
            userProfile={userProfile}
            onBack={() => setCurrentScreen("careers")}
            onToggleFavorite={toggleFavoriteJob}
            onChat={() => setCurrentScreen("chatbot")}
          />
        );

      case "formations":
        return (
          <FormationsExplorer
            userProfile={userProfile}
            onFormationClick={navigateToFormationDetail}
            onToggleFavorite={toggleSavedFormation}
          />
        );

      case "formation-detail":
        return (
          <FormationDetail
            formationId={selectedFormation || ""}
            userProfile={userProfile}
            onBack={() => setCurrentScreen("formations")}
            onToggleFavorite={toggleSavedFormation}
            onChat={() => setCurrentScreen("chatbot")}
          />
        );

      case "favorites":
        return (
          <Favorites
            userProfile={userProfile}
            onCareerClick={navigateToCareerDetail}
            onToggleFavorite={toggleFavoriteJob}
            onToggleFormation={toggleSavedFormation}
            onFormationClick={navigateToFormationDetail}
          />
        );

      case "profile":
        return (
          <Profile
            userProfile={userProfile}
            onEdit={() => setCurrentScreen("profile-creation-edit")}
            onLogout={handleLogout}
          />
        );

      default:
        return (
          <Dashboard
            userProfile={userProfile}
            onNavigate={setCurrentScreen}
            onCareerClick={navigateToCareerDetail}
          />
        );
    }
  };

  const showBottomNav = [
    "dashboard",
    "careers",
    "formations",
    "chatbot",
    "favorites",
    "profile",
  ].includes(currentScreen);

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <View style={styles.app}>
          {renderScreen()}
          {showBottomNav && (
            <BottomNav
              currentScreen={currentScreen}
              onNavigate={setCurrentScreen}
            />
          )}
        </View>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  app: { flex: 1, backgroundColor: "#ffffff" },
});