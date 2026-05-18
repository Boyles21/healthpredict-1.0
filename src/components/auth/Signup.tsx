import React, { useState } from "react";
import { motion } from "motion/react";
import { Activity, ArrowLeft } from "lucide-react";
import Button from "../ui/Button";
import Input from "../ui/Input";

interface SignupProps {
  onBack: () => void;
  onSuccess: () => void;
  onLogin: () => void;
}

export default function Signup({ onBack, onSuccess, onLogin }: SignupProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.password) {
      setError("Please fill in all required fields");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    onSuccess();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="p-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest hover:text-medical-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>
      </nav>

      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white p-8 md:p-10 rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100">
            <div className="flex flex-col items-center mb-8 text-center">
              <div className="w-12 h-12 bg-medical-primary rounded-xl flex items-center justify-center text-white mb-4">
                <Activity className="w-7 h-7 stroke-[2.5]" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
              <p className="text-sm text-slate-500 mt-1">Start your health tracking journey</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input 
                label="Full Name" 
                type="text" 
                placeholder="Jane Doe"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              />
              <Input 
                label="Email Address" 
                type="email" 
                placeholder="jane@example.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
              <Input 
                label="Password" 
                type="password" 
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <Input 
                label="Confirm Password" 
                type="password" 
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              />

              {error && <p className="text-xs font-bold text-red-500 text-center mt-2">{error}</p>}

              <Button type="submit" className="w-full py-4 text-base mt-4" size="lg">
                Create Account
              </Button>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-50 text-center">
              <p className="text-sm text-slate-500">
                Already have an account?{" "}
                <button 
                  onClick={onLogin}
                  className="font-bold text-medical-primary hover:underline"
                >
                  Login
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
