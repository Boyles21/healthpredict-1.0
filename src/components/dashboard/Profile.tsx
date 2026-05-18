import React from "react";
import { motion } from "motion/react";
import { Activity, ArrowLeft, User, Mail, Globe, Heart, Shield, PlusCircle } from "lucide-react";
import Button from "../ui/Button";
import Input from "../ui/Input";

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
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Profile Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex justify-between h-16 items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-2 -ml-2 text-slate-400 hover:text-slate-900 transition-colors"
              title="Go Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 border-l border-slate-100 pl-4">
              <div className="w-8 h-8 bg-medical-primary rounded-lg flex items-center justify-center text-white">
                <Activity className="w-5 h-5 stroke-[2.5]" />
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
        <header className="mb-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-20 h-20 bg-medical-primary/10 rounded-[28px] flex items-center justify-center text-medical-primary mb-6"
          >
            <User className="w-10 h-10" />
          </motion.div>
          <h1 className="text-3xl font-black text-slate-900">User Profile</h1>
          <p className="text-slate-500 mt-2">Manage your personal and medical information for more accurate health analysis.</p>
        </header>

        <div className="space-y-8">
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
                value={userProfile.fullName}
                onChange={(e) => setUserProfile({...userProfile, fullName: e.target.value})}
                placeholder="Janey Doe"
              />
              <Input 
                label="Email Identity" 
                value={userProfile.email}
                disabled
                className="bg-slate-50 cursor-not-allowed opacity-70"
                onChange={() => {}} 
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-widest px-1 flex items-center gap-2">
                  <Globe className="w-3 h-3 text-slate-400" /> Geographic Region
                </label>
                <select 
                  value={userProfile.location}
                  onChange={(e) => setUserProfile({...userProfile, location: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-medical-primary/5 focus:border-medical-primary transition-all appearance-none"
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
                  value={userProfile.ethnicity}
                  onChange={(e) => setUserProfile({...userProfile, ethnicity: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-medical-primary/5 focus:border-medical-primary transition-all appearance-none"
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
                      onClick={() => setUserProfile({...userProfile, bloodType: type})}
                      className={`py-3 px-1 rounded-2xl text-xs font-bold border transition-all ${
                        userProfile.bloodType === type 
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
                value={userProfile.allergies}
                onChange={(e) => setUserProfile({...userProfile, allergies: e.target.value})}
              />
              <Input 
                label="Chronic Conditions" 
                placeholder="e.g. Type 2 Diabetes"
                value={userProfile.chronicConditions}
                onChange={(e) => setUserProfile({...userProfile, chronicConditions: e.target.value})}
              />
              <div className="md:col-span-2">
                <Input 
                  label="Current Medications" 
                  placeholder="List any medications you take regularly"
                  value={userProfile.medications}
                  onChange={(e) => setUserProfile({...userProfile, medications: e.target.value})}
                />
              </div>
            </div>
          </motion.section>

          {/* Security & Data Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-between p-8 rounded-[32px] bg-slate-900 text-white gap-6"
          >
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-medical-primary">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold">Encrypted Data Management</h4>
                <p className="text-xs text-slate-400 mt-1 uppercase tracking-tight">HIPAA Compliant Data Storage Policies</p>
              </div>
            </div>
            <Button 
              size="lg" 
              className="bg-white text-slate-900 hover:bg-slate-100 shadow-xl shadow-white/5 whitespace-nowrap"
              onClick={onBack}
            >
              Update Records
            </Button>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
