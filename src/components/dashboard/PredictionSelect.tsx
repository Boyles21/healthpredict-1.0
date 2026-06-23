import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ShieldPlus, LogOut, User, ClipboardCheck, ArrowRight, ShieldAlert, Sparkles } from "lucide-react";
import Button from "../ui/Button";

interface PredictionSelectProps {
  userProfile: {
    fullName: string;
    email: string;
    role?: "admin" | "user";
  };
  onLogout: () => void;
  onGoToProfile: () => void;
  onSelectPCOS: () => void;
  onSelectFibroid: () => void;
  onGoToAdmin?: () => void;
}

export default function PredictionSelect({
  userProfile,
  onLogout,
  onGoToProfile,
  onSelectPCOS,
  onSelectFibroid,
  onGoToAdmin,
}: PredictionSelectProps) {
  const [serverStatus, setServerStatus] = useState<"checking" | "online" | "offline">("checking");
  const [modelStatus, setModelStatus] = useState<boolean>(false);

  // Check backend server health info just like Dashboard does
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch("/api/health");
        if (res.ok) {
          const data = await res.json();
          setServerStatus("online");
          setModelStatus(data.modelReady);
        } else {
          setServerStatus("offline");
        }
      } catch (e) {
        setServerStatus("offline");
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Universal Sticky Header / Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-medical-primary rounded-lg flex items-center justify-center text-white">
              <ShieldPlus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 hidden sm:inline">
              HealthPredict
            </span>
          </div>

          <div className="flex items-center gap-2 mr-auto ml-4">
            <div className={`w-2 h-2 rounded-full ${serverStatus === "online" ? (modelStatus ? "bg-emerald-500" : "bg-amber-500") : "bg-red-500"} animate-pulse`} />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden md:inline">
              {serverStatus === "online" ? (modelStatus ? "Analysis Ready" : "Initializing Model") : "Backend Offline"}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            {userProfile.role === "admin" && onGoToAdmin && (
              <button 
                id="header-admin-portal-gate"
                onClick={onGoToAdmin}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[10px] uppercase tracking-wider cursor-pointer shadow-sm transition-all"
                title="Enter Clinician Console"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-blue-400" /> Control Hub
              </button>
            )}
            <button 
              onClick={onGoToProfile}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100 hover:border-medical-primary/30 transition-all font-bold text-slate-600 cursor-pointer"
            >
              <User className="w-4 h-4 text-slate-400" />
              <span className="text-xs uppercase tracking-wider">{userProfile.fullName}</span>
            </button>
            <button 
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main content viewport */}
      <main className="flex-1 pt-32 pb-20 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto w-full flex flex-col justify-center">
        <div className="max-w-3xl mx-auto w-full text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-medical-soft-teal border border-teal-100 mb-6"
          >
            <Sparkles className="w-3.5 h-3.5 text-medical-primary" />
            <span className="text-[10px] font-black text-medical-primary uppercase tracking-widest">
              AI-Powered Women's Health Platform
            </span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight"
          >
            Choose Prediction Type
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 mt-4 text-base sm:text-lg max-w-lg mx-auto leading-relaxed"
          >
            Select an assessment below to analyze key clinical risk scores. Our machine learning models detect biological indicators with premium confidence.
          </motion.p>
        </div>

        {/* Categories Grid */}
        <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:px-6">
          
          {/* Card 1: PCOS Prediction */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-[32px] p-8 shadow-sm hover:shadow-md border border-slate-100 hover:border-medical-primary/20 transition-all flex flex-col justify-between group h-full relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-medical-soft-teal rounded-full blur-3xl -mr-10 -mt-10 opacity-60" />
            
            <div className="relative">
              <div className="w-12 h-12 bg-medical-soft-teal rounded-2xl flex items-center justify-center text-medical-primary mb-6">
                <ClipboardCheck className="w-6 h-6" />
              </div>
              
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 group-hover:text-medical-primary transition-colors">
                PCOS Prediction
              </h2>
              
              <p className="text-sm text-slate-500 leading-relaxed mb-6">
                Polycystic Ovary Syndrome assessment. Analyzes cycle duration, flow characteristics, hirsutism, cystic skin markers, metabolic traits, and lifestyle metrics to calculate exact risk probability.
              </p>
              
              <div className="space-y-2 mb-8">
                <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-medical-primary" />
                  Hormonal & Follicular Markers
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-medical-primary" />
                  Excel Import Compatibility
                </div>
              </div>
            </div>

            <Button
              onClick={onSelectPCOS}
              className="w-full py-4 text-sm font-bold flex items-center justify-center gap-2 group-hover:bg-medical-primary-hover transition-all cursor-pointer mt-auto"
            >
              Start PCOS Screening
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>

          {/* Card 2: Uterine Fibroids Prediction */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-[32px] p-8 shadow-sm hover:shadow-md border border-slate-100 hover:border-medical-secondary/20 transition-all flex flex-col justify-between group h-full relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-medical-soft-blue rounded-full blur-3xl -mr-10 -mt-10 opacity-60" />
            
            <div className="relative">
              <div className="w-12 h-12 bg-medical-soft-blue rounded-2xl flex items-center justify-center text-medical-secondary mb-6">
                <ShieldAlert className="w-6 h-6" />
              </div>
              
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 group-hover:text-medical-secondary transition-colors">
                Fibroid Prediction
              </h2>
              
              <p className="text-sm text-slate-500 leading-relaxed mb-6">
                Uterine Fibroids screening. Analyzes physical body indicators, prolonged bleeding duration, persistent pelvic pressure, lower back pain, irregular flow issues, and pregnancy history.
              </p>
              
              <div className="space-y-2 mb-8">
                <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-medical-secondary" />
                  Menorrhagia & Pelvic Symptoms
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-medical-secondary" />
                  Irregular Bleeding Markers
                </div>
              </div>
            </div>

            <Button
              onClick={onSelectFibroid}
              variant="custom"
              className="w-full py-4 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-full flex items-center justify-center gap-2 transition-all cursor-pointer mt-auto"
            >
              Start Fibroid Screening
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>

        </div>
      </main>
    </div>
  );
}
