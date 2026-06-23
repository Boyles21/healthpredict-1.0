import React, { useState } from "react";
import { motion } from "motion/react";
import { ShieldPlus, ArrowLeft, User, Mail, Globe, Heart, Shield, Save, Loader2 } from "lucide-react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { useAuth } from "../../contexts/AuthContext";

interface ProfileProps {
  userProfile: {
    fullName: string;
    email: string;
    location: string;
    ethnicity: string;
    bloodType: string;
    allergies: string;
    chronicConditions: string;
    medications: string;
  };
  setUserProfile: (profile: any) => void;
  onBack: () => void;
}

export default function Profile({ userProfile, setUserProfile, onBack }: ProfileProps) {
  const { updateUserProfile } = useAuth();
  
  const [localProfile, setLocalProfile] = useState({
    fullName: userProfile.fullName || "",
    email: userProfile.email || "",
    location: userProfile.location || "North America",
    ethnicity: userProfile.ethnicity || "Prefer not to say",
    bloodType: userProfile.bloodType || "Unknown",
    allergies: userProfile.allergies || "",
    chronicConditions: userProfile.chronicConditions || "",
    medications: userProfile.medications || ""
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      await updateUserProfile({
        fullName: localProfile.fullName,
        location: localProfile.location,
        ethnicity: localProfile.ethnicity,
        bloodType: localProfile.bloodType,
        allergies: localProfile.allergies,
        chronicConditions: localProfile.chronicConditions,
        medications: localProfile.medications
      });
      // Sync upstream component state
      setUserProfile(localProfile);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Profile save error:", err);
      alert("Failed to secure changes in Cloud database. Please check permissions.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Profile Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex justify-between h-16 items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-2 -ml-2 text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
              title="Go Back"
              disabled={saving}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 border-l border-slate-100 pl-4">
              <div className="w-8 h-8 bg-medical-primary rounded-lg flex items-center justify-center text-white">
                <ShieldPlus className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900 hidden sm:inline">
                HealthPredict Profile
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
              <User className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-widest hidden sm:inline">Settings</span>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-12 max-w-4xl mx-auto">
        <form onSubmit={handleSave}>
          <header className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-16 h-16 bg-medical-primary/10 rounded-[24px] flex items-center justify-center text-medical-primary mb-4"
              >
                <User className="w-8 h-8" />
              </motion.div>
              <h1 className="text-3xl font-black text-slate-900">User Profile</h1>
              <p className="text-slate-500 mt-2 text-sm leading-relaxed">Manage your personal and medical information for more accurate health analysis.</p>
            </div>
            
            <div className="flex-shrink-0 flex items-center gap-2">
              <Button 
                type="submit" 
                size="md" 
                className="flex items-center gap-2 border shadow-lg shadow-medical-primary/10 cursor-pointer"
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? "Securing..." : "Save Profile"}
              </Button>
            </div>
          </header>

          <div className="space-y-8">
            {saveSuccess && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-4 rounded-2xl text-xs font-bold flex items-center gap-2"
              >
                <Shield className="w-4 h-4" /> Clinical Profile secured and clinical records mapped successfully.
              </motion.div>
            )}

            {/* Account Information Card */}
            <motion.section 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 sm:p-10 rounded-[40px] shadow-sm border border-slate-100"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-[0.2em]">Account Details</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Input 
                  label="Full Name" 
                  value={localProfile.fullName}
                  onChange={(e) => setLocalProfile({...localProfile, fullName: e.target.value})}
                  placeholder="Jane Doe"
                  disabled={saving}
                />
                <Input 
                  label="Email Identity" 
                  value={localProfile.email}
                  disabled
                  className="bg-slate-50 cursor-not-allowed opacity-70"
                  onChange={() => {}} 
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-900 uppercase tracking-widest px-1 flex items-center gap-2">
                    <Globe className="w-3 h-3 text-slate-400" /> Geographic Region
                  </label>
                  <select 
                    value={localProfile.location}
                    onChange={(e) => setLocalProfile({...localProfile, location: e.target.value})}
                    disabled={saving}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-medical-primary/5 focus:border-medical-primary transition-all appearance-none outline-none cursor-pointer"
                  >
                    <option value="North America">North America</option>
                    <option value="Europe">Europe</option>
                    <option value="Asia">Asia</option>
                    <option value="Africa">Africa</option>
                    <option value="South America">South America</option>
                    <option value="Oceania">Oceania</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-900 uppercase tracking-widest px-1">Ethnicity Group</label>
                  <select 
                    value={localProfile.ethnicity}
                    onChange={(e) => setLocalProfile({...localProfile, ethnicity: e.target.value})}
                    disabled={saving}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-medical-primary/5 focus:border-medical-primary transition-all appearance-none outline-none cursor-pointer"
                  >
                    <option value="Asian">Asian</option>
                    <option value="Black">Black</option>
                    <option value="Hispanic">Hispanic</option>
                    <option value="White">White</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>
            </motion.section>

            {/* Medical Record Card */}
            <motion.section 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-6 sm:p-10 rounded-[40px] shadow-sm border border-slate-100"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 rounded-xl bg-pink-50 flex items-center justify-center text-medical-primary">
                  <Heart className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-[0.2em]">Clinical Background</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-900 uppercase tracking-widest px-1">Blood Type</label>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        disabled={saving}
                        onClick={() => setLocalProfile({...localProfile, bloodType: type})}
                        className={`py-3 px-1 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                          localProfile.bloodType === type 
                          ? "bg-medical-primary text-white border-medical-primary shadow-md" 
                          : "bg-white text-slate-600 border-slate-100 hover:border-medical-primary/30"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                
                <Input 
                  label="Allergies" 
                  placeholder="e.g. Penicillin, Peanuts"
                  value={localProfile.allergies}
                  onChange={(e) => setLocalProfile({...localProfile, allergies: e.target.value})}
                  disabled={saving}
                />
                <Input 
                  label="Chronic Conditions" 
                  placeholder="e.g. Type 2 Diabetes"
                  value={localProfile.chronicConditions}
                  onChange={(e) => setLocalProfile({...localProfile, chronicConditions: e.target.value})}
                  disabled={saving}
                />
                <div className="md:col-span-2">
                  <Input 
                    label="Current Medications" 
                    placeholder="List any medications you take regularly"
                    value={localProfile.medications}
                    onChange={(e) => setLocalProfile({...localProfile, medications: e.target.value})}
                    disabled={saving}
                  />
                </div>
              </div>
            </motion.section>

            {/* Security & Data Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-between p-8 rounded-[32px] bg-slate-900 text-white gap-6 animate-fade-in"
            >
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-medical-primary">
                  <Shield className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-bold">Encrypted Data Management</h4>
                  <p className="text-xs text-slate-400 mt-1 uppercase tracking-tight">Zero-Trust Firestore Sandbox Environment Enabled</p>
                </div>
              </div>
              <Button 
                type="button"
                variant="custom"
                size="lg" 
                className="bg-white text-slate-900 hover:bg-slate-100 shadow-xl shadow-white/5 px-8 py-4 text-base rounded-full whitespace-nowrap cursor-pointer"
                onClick={onBack}
                disabled={saving}
              >
                Go Back
              </Button>
            </motion.div>
          </div>
        </form>
      </main>
    </div>
  );
}
