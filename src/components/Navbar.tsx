import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Activity, Menu, X } from "lucide-react";

interface NavbarProps {
  onLogin: () => void;
  onSignup: () => void;
}

export default function Navbar({ onLogin, onSignup }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-medical-primary rounded-lg flex items-center justify-center text-white">
              <Activity className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Health<span className="text-medical-primary">Predict</span>
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#" className="text-medical-primary">Home</a>
            <a href="#about" className="text-slate-600 hover:text-slate-900 transition-colors">About</a>
            <a href="#how-it-works" className="text-slate-600 hover:text-slate-900 transition-colors">How it Works</a>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={onLogin}
              className="text-sm font-semibold text-slate-600 px-4 hover:text-slate-900 transition-colors"
            >
              Login
            </button>
            <button 
              onClick={onSignup}
              className="bg-medical-primary text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-sm hover:bg-medical-primary-hover transition-all"
            >
              Sign Up
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <button 
              onClick={toggleMenu}
              className="p-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Content */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-slate-100 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              <div className="flex flex-col gap-4 text-sm font-medium">
                <a 
                  href="#" 
                  className="text-medical-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </a>
                <a 
                  href="#about" 
                  className="text-slate-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </a>
                <a 
                  href="#how-it-works" 
                  className="text-slate-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  How it Works
                </a>
              </div>
              <hr className="border-slate-100" />
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => { onLogin(); setIsMenuOpen(false); }}
                  className="w-full text-left text-sm font-semibold text-slate-600 py-2"
                >
                  Login
                </button>
                <button 
                  onClick={() => { onSignup(); setIsMenuOpen(false); }}
                  className="w-full bg-medical-primary text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-sm"
                >
                  Sign Up
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
