import React, { useState } from "react";
import { motion } from "motion/react";
import { ShieldPlus, ArrowLeft } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../ui/Button";
import Input from "../ui/Input";

interface SignupProps {
  onBack: () => void;
  onSuccess: () => void;
  onLogin: () => void;
}

export default function Signup({ onBack, onSuccess, onLogin }: SignupProps) {
  const { register, loginWithGoogle } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.password) {
      setError("Please fill in all required fields");
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please specify a valid email address.");
      return;
    }

    // Password strength check
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await register(formData.email.trim(), formData.password, formData.fullName.trim());
      onSuccess();
    } catch (err: any) {
      console.error("Registration failed:", err);
      // Beautiful error translations
      if (err.code === "auth/email-already-in-use") {
        setError("An account associated with this email address already exists.");
      } else if (err.code === "auth/invalid-email") {
        setError("The provided email format is invalid.");
      } else if (err.code === "auth/weak-password") {
        setError("The password must contain at least 6 alphanumeric characters.");
      } else if (err.code === "auth/operation-not-allowed") {
        setError("Email/Password accounts are not yet enabled in your Firebase settings. Go to Authentication > Sign-in method in the Firebase Console and enable Email/Password, or use 'Continue with Google' below which is pre-enabled!");
      } else {
        setError(err.message || "An unexpected registration failure occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle();
      onSuccess();
    } catch (err: any) {
      console.error("Google authentication failed:", err);
      setError(err.message || "Google Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="p-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest hover:text-medical-primary transition-colors cursor-pointer"
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
                <ShieldPlus className="w-7 h-7 stroke-[2.5]" />
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
                disabled={loading}
              />
              <Input 
                label="Email Address" 
                type="email" 
                placeholder="jane@example.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                disabled={loading}
              />
              <Input 
                label="Password" 
                type="password" 
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                disabled={loading}
              />
              <Input 
                label="Confirm Password" 
                type="password" 
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                disabled={loading}
              />

              {error && <p className="text-xs font-bold text-red-500 text-center mt-2">{error}</p>}

              <Button type="submit" className="w-full py-4 text-base mt-4" size="lg" disabled={loading}>
                {loading ? "Registering..." : "Create Account"}
              </Button>
            </form>

            <div className="relative my-6 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <span className="relative bg-white px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Or</span>
            </div>

            <Button 
              type="button" 
              onClick={handleGoogleSignIn}
              variant="custom"
              className="w-full py-4 text-base flex items-center justify-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm transition-all rounded-xl cursor-pointer"
              size="lg" 
              disabled={loading}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 mr-1 shrink-0" style={{ fill: "currentColor" }}>
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </Button>

            <div className="mt-8 pt-8 border-t border-slate-50 text-center">
              <p className="text-sm text-slate-500">
                Already have an account?{" "}
                <button 
                  onClick={onLogin}
                  className="font-bold text-medical-primary hover:underline cursor-pointer"
                  disabled={loading}
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
