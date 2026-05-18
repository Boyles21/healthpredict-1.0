import React, { useState } from "react";
import { motion } from "motion/react";
import { Activity, ArrowLeft } from "lucide-react";
import Button from "../ui/Button";
import Input from "../ui/Input";

interface LoginProps {
  onBack: () => void;
  onSuccess: () => void;
  onSignup: () => void;
}

export default function Login({ onBack, onSuccess, onSignup }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    // Simulate login
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
              <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
              <p className="text-sm text-slate-500 mt-1">Access your HealthPredict dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input 
                label="Email Address" 
                type="email" 
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="space-y-1">
                <Input 
                  label="Password" 
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="button" className="text-[10px] font-bold text-medical-primary uppercase tracking-widest hover:underline px-1">
                  Forgot Password?
                </button>
              </div>

              {error && <p className="text-xs font-bold text-red-500 text-center">{error}</p>}

              <Button type="submit" className="w-full py-4 text-base" size="lg">
                Login
              </Button>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-50 text-center">
              <p className="text-sm text-slate-500">
                Don't have an account?{" "}
                <button 
                  onClick={onSignup}
                  className="font-bold text-medical-primary hover:underline"
                >
                  Create an account
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
