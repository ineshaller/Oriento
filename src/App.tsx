// App.tsx
import { useState } from "react";
import SplashScreen from "./components/SplashScreen";
import Onboarding from "./components/Onboarding";
import AuthScreen from "./components/AuthScreen";
import ProfileCreation from "./components/ProfileCreation";
import TestProposal from "./components/TestProposal";
import RiasecTest from "./components/RiasecTest";
import TestResults from "./components/TestResults";
import Dashboard from "./components/Dashboard";
import Chatbot from "./components/Chatbot";
import CareersExplorer from "./components/CareersExplorer";
import CareerDetail from "./components/CareerDetail";
import FormationsExplorer from "./components/FormationsExplorer";
import FormationDetail from "./components/FormationDetail";
import Favorites from "./components/Favorites";
import Profile from "./components/Profile";
import BottomNav from "./components/BottomNav";
import { clearChatHistory } from './components/Chatbot';

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

function computePrimaryCount(scores: { [key: string]: number }, orderedCodes: string[]): number {
  if (!orderedCodes.length) return 1;
  const topScore = scores[orderedCodes[0]];
  let count = 0;
  for (const code of orderedCodes) {
    if (scores[code] === topScore) count++;
    else break;
  }
  return Math.max(1, count);
}

// ── Helper : sauvegarde n'importe quels champs en BDD ──────────────────────
async function saveProfileToDB(token: string, data: Partial<UserProfile>) {
  try {
    await fetch('/api/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  } catch {
    console.error('Sauvegarde BDD échouée');
  }
}

function App() {
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

  const updateProfile = (updates: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...updates }));
  };

  const navigateToCareerDetail = (careerId: string) => {
    setSelectedCareer(careerId);
    setCurrentScreen("career-detail");
  };

  const navigateToFormationDetail = (formationId: string) => {
    setSelectedFormation(formationId);
    setCurrentScreen("formation-detail");
  };

  // ── Favoris métiers — sauvegarde aussi en BDD ────────────────────────────
  const toggleFavoriteJob = (jobId: string) => {
    setUserProfile((prev) => {
      const favoriteJobs = prev.favoriteJobs || [];
      const isFavorite = favoriteJobs.includes(jobId);
      const updated = isFavorite
        ? favoriteJobs.filter((id) => id !== jobId)
        : [...favoriteJobs, jobId];
      if (prev.token) saveProfileToDB(prev.token, { favoriteJobs: updated });
      return { ...prev, favoriteJobs: updated };
    });
  };

  // ── Favoris formations — sauvegarde aussi en BDD ─────────────────────────
  const toggleSavedFormation = (formationId: string) => {
    setUserProfile((prev) => {
      const savedFormations = prev.savedFormations || [];
      const isSaved = savedFormations.includes(formationId);
      const updated = isSaved
        ? savedFormations.filter((id) => id !== formationId)
        : [...savedFormations, formationId];
      if (prev.token) saveProfileToDB(prev.token, { savedFormations: updated });
      return { ...prev, savedFormations: updated };
    });
  };

  // ── Déconnexion ──────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem('token');
    clearChatHistory();
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

      // ── Auth : récupère le profil existant si reconnexion ─────────────────
      case "auth":
        return (
          <AuthScreen
            onAuthComplete={async ({ email, token, isNewUser }) => {
              if (isNewUser) {
                // Nouvel utilisateur → remplir le profil
                updateProfile({ email, token });
                setCurrentScreen("profile-creation");
              } else {
                // Reconnexion → charger tout le profil depuis la BDD
                try {
                  const res = await fetch('/api/profile', {
                    headers: { Authorization: `Bearer ${token}` },
                  });
                  if (res.ok) {
                    const data = await res.json();
                    console.log('📦 Profil reçu de la BDD :', data);
                    const p = data.profile;
                    updateProfile({
                      email,
                      token,
                      age:                p.age,
                      grade:              p.grade,
                      specialties:        p.specialties        || [],
                      interests:          p.interests          || [],
                      riasecProfile:      p.riasecProfile      || [],
                      riasecScores:       p.riasecScores,
                      riasecPrimaryCount: p.riasecPrimaryCount || 1,
                      favoriteJobs:       p.favoriteJobs       || [],
                      savedFormations:    p.savedFormations    || [],
                    });
                    // Reconnexion → toujours au dashboard
                    setCurrentScreen("dashboard");
                  } else {
                    updateProfile({ email, token });
                    setCurrentScreen("profile-creation");
                  }
                } catch {
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
            onComplete={(profile) => {
              updateProfile(profile);
              setCurrentScreen("test-proposal");
            }}
          />
        );

      case "profile-creation-edit":
        return (
          <ProfileCreation
            userProfile={userProfile}
            onComplete={(profile) => {
              updateProfile(profile);
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
            onComplete={(results, scores) => {
              const primaryCount = scores ? computePrimaryCount(scores, results) : 1;
              const riasecData = {
                riasecProfile: results,
                riasecScores: scores,
                riasecPrimaryCount: primaryCount,
              };
              updateProfile(riasecData);
              // Sauvegarde les résultats RIASEC en BDD
              if (userProfile.token) saveProfileToDB(userProfile.token, riasecData);
              setCurrentScreen("test-results");
            }}
          />
        );

      case "test-results":
        return (
          <TestResults
            riasecProfile={userProfile.riasecProfile || []}
            scores={userProfile.riasecScores}
            onExplore={() => setCurrentScreen("careers")}
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
        return <Chatbot userProfile={userProfile} onNavigate={setCurrentScreen} />;

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

  const showBottomNav = ["dashboard", "careers", "formations", "chatbot", "favorites", "profile"].includes(currentScreen);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen relative">
        {renderScreen()}
        {showBottomNav && <BottomNav currentScreen={currentScreen} onNavigate={setCurrentScreen} />}
      </div>
    </div>
  );
}

export default App;