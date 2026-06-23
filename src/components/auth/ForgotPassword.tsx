import React, { useState } from "react";
import { motion } from "motion/react";
import { ShieldPlus, ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../ui/Button";
import Input from "../ui/Input";

interface ForgotPasswordProps {
  onBackToLogin: () => void;
}

export default function ForgotPassword({ onBackToLogin }: ForgotPasswordProps) {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please specify your registered email address.");
      return;
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please specify a valid email address.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      console.error("Password reset error:", err);
      // Friendly, clean error messaging
      if (err.code === "auth/user-not-found") {
        setError("No account with this email address was found.");
      } else if (err.code === "auth/invalid-email") {
        setError("The email address provided is invalid.");
      } else {
        setError(err.message || "An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="p-6">
        <button 
          onClick={onBackToLogin}
          className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest hover:text-medical-primary transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </button>
      </nav>

      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white p-8 md:p-10 rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100">
            <div className="flex flex-col items-center mb-8 text-center animate-fade-in">
              <div className="w-12 h-12 bg-medical-primary rounded-xl flex items-center justify-center text-white mb-4">
                <ShieldPlus className="w-7 h-7 stroke-[2.5]" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Reset Password</h1>
              <p className="text-sm text-slate-500 mt-1">We'll send you setup instructions</p>
            </div>

            {success ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 text-center"
              >
                <div className="mx-auto w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-900">Reset instructions sent!</p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Check your inbox at <span className="font-bold text-slate-700">{email}</span> and follow the instructions to secure your login.
                  </p>
                </div>
                <Button onClick={onBackToLogin} className="w-full mt-4" variant="outline">
                  Return to Login
                </Button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input 
                  label="Email Address" 
                  type="email" 
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  disabled={loading}
                />

                {error && <p className="text-xs font-bold text-red-500 text-center">{error}</p>}

                <Button type="submit" className="w-full py-4 text-base" size="lg" disabled={loading}>
                  {loading ? "Sending..." : "Send Reset Email"}
                </Button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
