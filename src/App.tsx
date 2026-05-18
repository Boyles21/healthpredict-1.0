/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import LandingPage from "./components/LandingPage";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import Dashboard from "./components/dashboard/Dashboard";
import Profile from "./components/dashboard/Profile";

type View = "landing" | "login" | "signup" | "dashboard" | "profile";

export default function App() {
  const [currentView, setCurrentView] = useState<View>("landing");
  const [userProfile, setUserProfile] = useState({
    fullName: "Jane Doe",
    email: "jane@example.com",
    location: "North America",
    ethnicity: "Prefer not to say",
    bloodType: "Unknown",
    allergies: "",
    chronicConditions: "",
    medications: ""
  });

  const navigateTo = (view: View) => {
    window.scrollTo(0, 0);
    setCurrentView(view);
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
        />
      )}

      {currentView === "signup" && (
        <Signup 
          onBack={() => navigateTo("landing")}
          onSuccess={() => navigateTo("dashboard")}
          onLogin={() => navigateTo("login")}
        />
      )}

      {currentView === "dashboard" && (
        <Dashboard 
          userProfile={userProfile}
          onLogout={() => navigateTo("landing")}
          onGoToProfile={() => navigateTo("profile")}
        />
      )}

      {currentView === "profile" && (
        <Profile 
          userProfile={userProfile}
          setUserProfile={setUserProfile}
          onBack={() => navigateTo("dashboard")}
        />
      )}
    </div>
  );
}

