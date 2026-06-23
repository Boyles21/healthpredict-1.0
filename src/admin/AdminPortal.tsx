import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import Sidebar from "./components/Sidebar";
import DashboardHome from "./pages/DashboardHome";
import UserManagement from "./pages/UserManagement";
import PredictionManagement from "./pages/PredictionManagement";
import PCOSAnalytics from "./pages/PCOSAnalytics";
import FibroidAnalytics from "./pages/FibroidAnalytics";
import Reports from "./pages/Reports";
import AdminSettings from "./pages/AdminSettings";
import { ShieldCheck, LogOut, ArrowLeft, Lock, Heart } from "lucide-react";
import Button from "../components/ui/Button";

interface AdminPortalProps {
  onGoToUserDashboard: () => void;
}

export default function AdminPortal({ onGoToUserDashboard }: AdminPortalProps) {
  const { user, userProfile, logout } = useAuth();
  const [currentTab, setCurrentTab] = useState("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // 1. Loader state if session is pulling metadata
  if (!user || !userProfile) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center font-sans">
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 border-4 border-blue-500/10 rounded-full" />
          <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Verifying security clearances...</p>
      </div>
    );
  }

  // 2. Strict Role Gating (DO NOT TRUST CLIENT STATE - Check database role)
  const isAdmin = userProfile.role === "admin";
  
  if (!isAdmin) {
    return (
      /* Styled 403 ACCESS DENIED SCREEN */
      <div id="access-denied-view" className="min-h-screen bg-slate-9d md:bg-slate-950 flex items-center justify-center px-4 font-sans text-slate-200">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 sm:p-10 rounded-[36px] shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-2 border border-red-500/20">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/20 mb-3">
              Security Violation (403)
            </span>
            <h1 className="text-2xl font-extrabold text-white tracking-tight leading-8">Administrative Gateway Restricted</h1>
            <p className="text-slate-450 text-xs font-semibold leading-relaxed mt-2.5">
              This clinical control board is restricted to authorized clinicians and administrative staff. Your user account does not possess the credentials to enter the console.
            </p>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/40 text-left space-y-1.5 text-[11px] font-semibold text-slate-500 leading-snug">
            <p>• Logged Account: <strong className="text-slate-300">{userProfile.email}</strong></p>
            <p>• Assigned Role Badge: <strong className="text-slate-300">{userProfile.role || "patient"}</strong></p>
            <p>• Security Protocol: Gateway restrictions are logged in realtime with Firestore.</p>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <button
              id="return-to-dashboard-btn"
              onClick={onGoToUserDashboard}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Go Back to Patient Portal
            </button>
            <button
              onClick={() => logout()}
              className="w-full hover:bg-slate-800 text-slate-400 hover:text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Sign Out Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Render active sub tab page
  const renderTabContent = () => {
    switch (currentTab) {
      case "dashboard":
        return <DashboardHome onTabChange={setCurrentTab} />;
      case "users":
        return <UserManagement />;
      case "predictions":
        return <PredictionManagement />;
      case "pcos":
        return <PCOSAnalytics />;
      case "fibroid":
        return <FibroidAnalytics />;
      case "reports":
        return <Reports />;
      case "settings":
        return <AdminSettings />;
      default:
        return <DashboardHome onTabChange={setCurrentTab} />;
    }
  };

  const adminName = userProfile.fullName || "Administrative Node";
  const adminEmail = userProfile.email || "boluajisebutu45000@gmail.com";

  return (
    <div id="admin-portal-wrapper" className="min-h-screen bg-slate-50 flex">
      {/*Collapsible sidebar*/}
      <Sidebar 
        currentTab={currentTab} 
        onTabChange={setCurrentTab} 
        onLogout={logout} 
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        adminName={adminName}
        adminEmail={adminEmail}
      />

      {/* Main Work Area viewport */}
      <div className={`flex-1 transition-all duration-300 min-h-screen ${isSidebarCollapsed ? "pl-20" : "pl-64"}`}>
        {/* Top universal action utility rail */}
        <header className="h-16 border-b border-slate-250 bg-white/85 backdrop-blur-md sticky top-0 z-40 px-6 sm:px-8 flex justify-between items-center">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-widest pl-2">
            <Heart className="w-4 text-blue-500 h-4 fill-blue-500/10" /> Clinician Workspace
          </div>
          
          <div className="flex items-center gap-4">
            <button
              id="admin-to-dashboard-shortcut"
              onClick={onGoToUserDashboard}
              className="px-3.5 py-1.5 rounded-full border border-slate-200 hover:border-blue-500 hover:text-blue-600 transition-all font-bold text-[10px] uppercase tracking-wider text-slate-600 cursor-pointer flex items-center gap-1.5 shadow-5xs"
              title="Return to user area"
            >
              Patient Portal <ShieldCheck className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Viewport content */}
        <main className="p-6 sm:p-8 lg:p-12 max-w-6xl mx-auto pb-24">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
}
