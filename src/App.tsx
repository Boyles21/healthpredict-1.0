import { useState, useEffect } from "react";
import { ShieldPlus } from "lucide-react";
import LandingPage from "./components/LandingPage";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import ForgotPassword from "./components/auth/ForgotPassword";
import Dashboard from "./components/dashboard/Dashboard";
import Profile from "./components/dashboard/Profile";
import PredictionSelect from "./components/dashboard/PredictionSelect";
import FibroidAssessment from "./components/dashboard/FibroidAssessment";
import AdminPortal from "./admin/AdminPortal";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

type View = 
  | "landing" 
  | "login" 
  | "signup" 
  | "forgot-password" 
  | "dashboard" 
  | "profile" 
  | "predict-select" 
  | "pcos-assessment" 
  | "fibroid-assessment"
  | "admin";

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { user, userProfile, loading, logout, setUserProfileStateDirectly } = useAuth();
  const [currentView, setCurrentView] = useState<View>("landing");

  const [pcosFormData, setPcosFormData] = useState({
    age: "",
    weight: "",
    height: "",
    cycleLength: "",
    cycleRegularity: "regular",
    weightGain: false,
    hairGrowth: false,
    hairLoss: false,
    pimples: false,
    skinDarkening: false,
    fastFood: false,
    regularExercise: true,
    pelvicPain: false,
    fatigue: false,
  });

  const [fibroidFormData, setFibroidFormData] = useState({
    age: "",
    weight: "",
    height: "",
    heavyBleeding: false,
    prolongedMenstruation: false,
    pelvicPain: false,
    abdominalSwelling: false,
    frequentUrination: false,
    constipation: false,
    fatigueAnemia: false,
    painDuringIntercourse: false,
    lowerBackPain: false,
    irregularMenstrualFlow: false,
    familyHistory: false,
    pregnancyDifficulty: false,
  });

  const navigateTo = (view: View) => {
    window.scrollTo(0, 0);
    setCurrentView(view);
  };

  // URL Path and Hash Listener support for direct admin landing
  useEffect(() => {
    const handleUrlPathRouting = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === "/admin" || hash === "#/admin") {
        navigateTo("admin");
      }
    };

    handleUrlPathRouting();
    window.addEventListener("hashchange", handleUrlPathRouting);
    return () => window.removeEventListener("hashchange", handleUrlPathRouting);
  }, [loading, user]);

  // Route protection and sync gates (Zero-Trust Security Phase 8)
  useEffect(() => {
    if (loading) return;

    if (!user) {
      // Unauthenticated users are strictly barred from secure viewing panels
      if (
        currentView === "dashboard" || 
        currentView === "profile" ||
        currentView === "predict-select" ||
        currentView === "pcos-assessment" ||
        currentView === "fibroid-assessment" ||
        currentView === "admin"
      ) {
        navigateTo("login");
      }
    } else {
      // Authenticated users are restricted from landing and gate screens
      if (
        currentView === "landing" || 
        currentView === "login" || 
        currentView === "signup" || 
        currentView === "forgot-password"
      ) {
        // If logged-in user is admin and path is /admin, let them go to admin console directly
        const path = window.location.pathname;
        const hash = window.location.hash;
        if (userProfile?.role === "admin" && (path === "/admin" || hash === "#/admin")) {
          navigateTo("admin");
        } else {
          navigateTo("predict-select");
        }
      }
    }
  }, [user, loading, currentView, userProfile]);

  // Premium full-page loading indicators (SaaS healthcare feel)
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center">
        <div className="relative w-20 h-20 mb-6 font-sans">
          <div className="absolute inset-0 border-4 border-medical-primary/10 rounded-full" />
          <div className="absolute inset-0 border-4 border-medical-primary border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <ShieldPlus className="w-6 h-6 text-medical-primary animate-pulse" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-1">Securing Connection</h2>
        <p className="text-xs text-slate-400 font-medium">Validating medical credentials...</p>
      </div>
    );
  }

  // Fallback clinical profile parameters to avoid compile errors
  const activeProfile = userProfile || {
    fullName: user?.displayName || "Jane Doe",
    email: user?.email || "",
    location: "North America",
    ethnicity: "Prefer not to say",
    bloodType: "Unknown",
    allergies: "",
    chronicConditions: "",
    medications: ""
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigateTo("landing");
    } catch (err) {
      console.error("Logout execution failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {currentView === "landing" && (
        <LandingPage 
          onStart={() => navigateTo("signup")} 
          onLogin={() => navigateTo("login")} 
        />
      )}

      {currentView === "login" && (
        <Login 
          onBack={() => navigateTo("landing")}
          onSuccess={() => navigateTo("predict-select")}
          onSignup={() => navigateTo("signup")}
          onForgotPassword={() => navigateTo("forgot-password")}
        />
      )}

      {currentView === "signup" && (
        <Signup 
          onBack={() => navigateTo("landing")}
          onSuccess={() => navigateTo("predict-select")}
          onLogin={() => navigateTo("login")}
        />
      )}

      {currentView === "forgot-password" && (
        <ForgotPassword 
          onBackToLogin={() => navigateTo("login")}
        />
      )}

      {currentView === "predict-select" && (
        <PredictionSelect 
          userProfile={activeProfile}
          onLogout={handleLogout}
          onGoToProfile={() => navigateTo("profile")}
          onSelectPCOS={() => navigateTo("pcos-assessment")}
          onSelectFibroid={() => navigateTo("fibroid-assessment")}
          onGoToAdmin={() => navigateTo("admin")}
        />
      )}

      {(currentView === "dashboard" || currentView === "pcos-assessment") && (
        <Dashboard 
          userProfile={activeProfile}
          onLogout={handleLogout}
          onGoToProfile={() => navigateTo("profile")}
          onBack={() => navigateTo("predict-select")}
          formData={pcosFormData}
          setFormData={setPcosFormData}
        />
      )}

      {currentView === "fibroid-assessment" && (
        <FibroidAssessment 
          userProfile={activeProfile}
          onLogout={handleLogout}
          onGoToProfile={() => navigateTo("profile")}
          onBack={() => navigateTo("predict-select")}
          formData={fibroidFormData}
          setFormData={setFibroidFormData}
        />
      )}

      {currentView === "profile" && (
        <Profile 
          userProfile={activeProfile}
          setUserProfile={setUserProfileStateDirectly}
          onBack={() => navigateTo("predict-select")}
        />
      )}

      {currentView === "admin" && (
        <AdminPortal 
          onGoToUserDashboard={() => navigateTo("predict-select")}
        />
      )}
    </div>
  );
}
