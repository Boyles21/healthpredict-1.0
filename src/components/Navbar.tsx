import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldPlus, Menu, X } from "lucide-react";

interface NavbarProps {
  onLogin: () => void;
  onSignup: () => void;
}

const navItems = [
  { id: "hero", label: "Home" },
  { id: "trust", label: "Clinical Trust" },
  { id: "conditions", label: "Conditions" },
  { id: "how-it-works", label: "Process" },
  { id: "machine-learning", label: "AI Technology" },
  { id: "faq", label: "Support & FAQ" }
];

export default function Navbar({ onLogin, onSignup }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // 1. Shadow/Padding transition state on scroll
      setIsScrolled(window.scrollY > 20);

      // 2. Active Section detection
      const scrollPosition = window.scrollY + 160; // offset for nav height
      for (const item of navItems) {
        const el = document.getElementById(item.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(item.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    // Initial check
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setIsMenuOpen(false);
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
      setActiveSection(id);
    }
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? "bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-md py-3" 
        : "bg-white/80 backdrop-blur-md border-b border-slate-200/40 shadow-sm py-4"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-medical-primary rounded-xl flex items-center justify-center text-white transition-transform hover:scale-105 duration-250">
              <ShieldPlus className="w-5.5 h-5.5 stroke-[2.5]" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Health<span className="text-medical-primary">Predict</span>
            </span>
          </div>
          
          <div className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-semibold">
            {navItems.map((item) => (
              <a 
                key={item.id}
                href={`#${item.id}`} 
                onClick={(e) => handleScrollTo(e, item.id)}
                className={`transition-colors focus-visible:ring-2 focus-visible:ring-teal-500/50 outline-none rounded-md px-2 py-1 ${
                  activeSection === item.id 
                    ? "text-teal-600 font-extrabold border-b-2 border-teal-600" 
                    : "text-slate-600 hover:text-slate-950"
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={onLogin}
              className="text-sm font-bold text-slate-705 px-4 py-2 hover:text-slate-950 transition-colors focus-visible:ring-2 focus-visible:ring-teal-500/50 outline-none rounded-full min-h-[44px]"
            >
              Login
            </button>
            <button 
              onClick={onSignup}
              className="bg-medical-primary text-white text-sm font-bold px-6 py-2.5 rounded-full shadow-md hover:bg-medical-primary-hover hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 focus-visible:ring-2 focus-visible:ring-teal-500/50 outline-none min-h-[44px]"
            >
              Sign Up
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-4">
            <button 
              onClick={toggleMenu}
              className="p-3 text-slate-755 hover:text-slate-950 transition-colors focus-visible:ring-2 focus-visible:ring-teal-500/50 outline-none rounded-lg min-w-[48px] min-h-[48px] flex items-center justify-center"
              aria-label="Toggle Menu"
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
            className="lg:hidden bg-white border-b border-slate-200 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              <div className="flex flex-col gap-2 text-sm font-semibold">
                {navItems.map((item) => (
                  <a 
                    key={item.id}
                    href={`#${item.id}`} 
                    className={`py-3 px-2 rounded-lg transition-colors min-h-[48px] flex items-center ${
                      activeSection === item.id 
                        ? "text-teal-600 bg-teal-50/50 font-extrabold" 
                        : "text-slate-700 hover:text-teal-600 hover:bg-slate-50"
                    }`}
                    onClick={(e) => handleScrollTo(e, item.id)}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
              <hr className="border-slate-200" />
              <div className="flex flex-col gap-3 pt-2">
                <button 
                  onClick={() => { onLogin(); setIsMenuOpen(false); }}
                  className="w-full text-left text-sm font-bold text-slate-700 py-3 px-3 hover:text-slate-950 hover:bg-slate-50 rounded-lg min-h-[48px]"
                >
                  Login
                </button>
                <button 
                  onClick={() => { onSignup(); setIsMenuOpen(false); }}
                  className="w-full bg-medical-primary text-white text-sm font-bold px-5 py-3 rounded-xl shadow-md hover:bg-medical-primary-hover active:scale-[0.98] transition-all min-h-[48px]"
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
