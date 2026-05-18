import { motion } from "motion/react";
import { ArrowRight, ShieldCheck, HeartPulse } from "lucide-react";

interface HeroProps {
  onStart: () => void;
}

export default function Hero({ onStart }: HeroProps) {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex flex-col lg:flex-row items-center justify-between gap-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-xl text-left"
        >
          <div className="inline-block px-3 py-1 mb-6 bg-medical-soft-teal text-medical-primary text-xs font-bold rounded-full uppercase tracking-wider border border-medical-primary/10">
            AI-Powered Women's Health
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-[1.1]">
            Early Detection for <br className="hidden sm:block" />
            <span className="text-medical-primary">Women's Health</span>
          </h1>
          
          <p className="text-lg text-slate-600 mb-8 leading-relaxed">
            Assess your likelihood of PCOS and Uterine Fibroids using advanced 
            machine learning models trained on millions of health markers and 
            symptom sets.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button 
              onClick={onStart}
              className="w-full sm:w-auto bg-slate-900 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Get Started
            </button>
            <button className="w-full sm:w-auto border border-slate-200 text-slate-700 px-8 py-4 rounded-xl font-semibold bg-white hover:bg-slate-50 transition-all">
              Learn More
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="flex-1 flex justify-center lg:justify-end"
        >
          <div className="w-72 h-72 md:w-80 md:h-80 bg-medical-soft-blue rounded-[40px] flex items-center justify-center relative">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white shadow-xl rounded-2xl p-4 flex flex-col justify-center border border-slate-100">
              <span className="text-medical-primary font-bold text-lg">98%</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Accuracy Rate</span>
            </div>
            
            <div className="w-60 h-60 md:w-64 md:h-64 bg-white rounded-full shadow-inner border border-slate-100 flex items-center justify-center overflow-hidden">
              <svg className="w-full h-full p-8 text-medical-primary/10" viewBox="0 0 100 100">
                 <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6,6"/>
                 <path d="M50 20 C 60 20, 80 40, 80 50 C 80 60, 60 80, 50 80 C 40 80, 20 60, 20 50 C 20 40, 40 20, 50 20" fill="currentColor" fillOpacity="0.2" />
                 <HeartPulse className="w-10 h-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-medical-primary" />
              </svg>
            </div>
            
            <div className="absolute -bottom-6 -left-6 bg-white/90 backdrop-blur p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-100">
              <ShieldCheck className="w-6 h-6 text-emerald-500" />
              <div className="text-left">
                <div className="text-xs font-bold text-slate-900">Secure Privacy</div>
                <div className="text-[10px] text-slate-500">HIPAA Compliant Data</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
