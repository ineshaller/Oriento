// App.tsx
import { useState } from "react";
import SplashScreen from "./components/SplashScreen";
import Onboarding from "./components/Onboarding";
import ProfileCreation from "./components/ProfileCreation";
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

export type Screen =
  | "splash"
  | "onboarding"
  | "profile-creation"
  | "profile-creation-edit" // ✅ AJOUT
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
  age?: number;
  grade?: string;
  specialties?: string[];
  interests?: string[];
  riasecProfile?: string[];
  riasecScores?: { [key: string]: number };
  favoriteJobs?: string[];
  savedFormations?: string[];
}

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("splash");
  const [userProfile, setUserProfile] = useState<UserProfile>({
    favoriteJobs: [],
    savedFormations: [],
    riasecProfile: [],
    riasecScores: undefined,
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

  const toggleFavoriteJob = (jobId: string) => {
    setUserProfile((prev) => {
      const favoriteJobs = prev.favoriteJobs || [];
      const isFavorite = favoriteJobs.includes(jobId);
      return {
        ...prev,
        favoriteJobs: isFavorite ? favoriteJobs.filter((id) => id !== jobId) : [...favoriteJobs, jobId],
      };
    });
  };

  const toggleSavedFormation = (formationId: string) => {
    setUserProfile((prev) => {
      const savedFormations = prev.savedFormations || [];
      const isSaved = savedFormations.includes(formationId);
      return {
        ...prev,
        savedFormations: isSaved ? savedFormations.filter((id) => id !== formationId) : [...savedFormations, formationId],
      };
    });
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "splash":
        return <SplashScreen onStart={() => setCurrentScreen("onboarding")} />;

      case "onboarding":
        return <Onboarding onComplete={() => setCurrentScreen("profile-creation")} />;

      case "profile-creation":
        return (
          <ProfileCreation
            userProfile={userProfile}
            onComplete={(profile) => {
              updateProfile(profile);
              setCurrentScreen("riasec-test");
            }}
          />
        );

      case "profile-creation-edit": // ✅ AJOUT
        return (
          <ProfileCreation
            userProfile={userProfile}
            onComplete={(profile) => {
              updateProfile(profile);
              setCurrentScreen("profile"); // retour au profil, pas au test
            }}
          />
        );

      case "riasec-test":
        return (
          <RiasecTest
            onComplete={(results, scores) => {
              updateProfile({ riasecProfile: results, riasecScores: scores });
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
          />
        );

      case "formation-detail":
        return (
          <FormationDetail
            formationId={selectedFormation || ""}
            userProfile={userProfile}
            onBack={() => setCurrentScreen("formations")}
          />
        );

      case "favorites":
        return (
          <Favorites
            userProfile={userProfile}
            onCareerClick={navigateToCareerDetail}
            onToggleFavorite={toggleFavoriteJob}
          />
        );

      case "profile":
        return <Profile userProfile={userProfile} onEdit={() => setCurrentScreen("profile-creation-edit")} />; // ✅ MODIFIÉ

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