import { useState, useEffect } from "react";
import { Activity } from "lucide-react";
import LandingPage from "./components/LandingPage";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import ForgotPassword from "./components/auth/ForgotPassword";
import Dashboard from "./components/dashboard/Dashboard";
import Profile from "./components/dashboard/Profile";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

type View = "landing" | "login" | "signup" | "forgot-password" | "dashboard" | "profile";

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

  const navigateTo = (view: View) => {
    window.scrollTo(0, 0);
    setCurrentView(view);
  };

  // Route protection and sync gates (Zero-Trust Security Phase 8)
  useEffect(() => {
    if (loading) return;

    if (!user) {
      // Unauthenticated users are strictly barred from secure viewing panels
      if (currentView === "dashboard" || currentView === "profile") {
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
        navigateTo("dashboard");
      }
    }
  }, [user, loading, currentView]);

  // Premium full-page loading indicators (SaaS healthcare feel)
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center">
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute inset-0 border-4 border-medical-primary/10 rounded-full" />
          <div className="absolute inset-0 border-4 border-medical-primary border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Activity className="w-6 h-6 text-medical-primary animate-pulse" />
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
          onSuccess={() => navigateTo("dashboard")}
          onSignup={() => navigateTo("signup")}
          onForgotPassword={() => navigateTo("forgot-password")}
        />
      )}

      {currentView === "signup" && (
        <Signup 
          onBack={() => navigateTo("landing")}
          onSuccess={() => navigateTo("dashboard")}
          onLogin={() => navigateTo("login")}
        />
      )}

      {currentView === "forgot-password" && (
        <ForgotPassword 
          onBackToLogin={() => navigateTo("login")}
        />
      )}

      {currentView === "dashboard" && (
        <Dashboard 
          userProfile={activeProfile}
          onLogout={handleLogout}
          onGoToProfile={() => navigateTo("profile")}
        />
      )}

      {currentView === "profile" && (
        <Profile 
          userProfile={activeProfile}
          setUserProfile={setUserProfileStateDirectly}
          onBack={() => navigateTo("dashboard")}
        />
      )}
    </div>
  );
}
