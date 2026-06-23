import { motion } from "motion/react";
import { ArrowRight, ShieldCheck, ShieldPlus, BrainCircuit, Activity, TrendingUp } from "lucide-react";

interface HeroProps {
  onStart: () => void;
}

export default function Hero({ onStart }: HeroProps) {
  return (
    <section id="hero" className="relative pt-32 pb-24 lg:pt-44 lg:pb-32 overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50/50">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-teal-50/40 rounded-full blur-3xl -translate-y-1/2 -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-sky-50/30 rounded-full blur-3xl translate-y-1/3 -z-10" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex-1 text-left max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 bg-teal-50/80 text-teal-700 text-xs font-bold rounded-full border border-teal-100 backdrop-blur-sm">
              <BrainCircuit className="w-3.5 h-3.5" />
              <span>Evidence-Based Reproductive Screening</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-[1.15] tracking-tight">
              AI-Powered Early <br className="hidden sm:block" />
              Screening for <span className="text-teal-600">PCOS</span> & <span className="text-sky-600">Fibroids</span>
            </h1>
            
            <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-xl">
              Evaluate your risk levels for PCOS and Uterine Fibroids early and securely. 
              Our calibrated machine learning engine processes complex symptoms to deliver evidence-based insight in seconds.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-10">
              <button 
                id="btn-hero-cta-start"
                onClick={onStart}
                className="w-full sm:w-auto bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-750 hover:to-emerald-750 text-white px-8 py-4.5 rounded-xl font-bold text-base shadow-md hover:shadow-xl hover:shadow-teal-600/10 transition-all duration-300 flex items-center justify-center gap-2 group hover:scale-[1.03] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-teal-500/50 focus-visible:ring-offset-2 outline-none min-h-[52px]"
              >
                <span>Start Free Assessment</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <a 
                id="btn-hero-learn-more"
                href="#conditions"
                className="w-full sm:w-auto text-center border border-slate-200 text-slate-700 px-8 py-4.5 rounded-xl font-semibold text-sm bg-white hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 shadow-sm focus-visible:ring-2 focus-visible:ring-teal-500/50 focus-visible:ring-offset-2 outline-none min-h-[52px]"
              >
                Learn More
              </a>
            </div>

            {/* Quick trust metrics */}
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 pt-6 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-semibold text-slate-600">100% Encrypted & Private</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-teal-600" />
                <span className="text-xs font-semibold text-slate-600">Dual-Symptom Classification</span>
              </div>
            </div>
          </motion.div>

          {/* Graphical Mockup with Real ML Stats */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.7 }}
            className="flex-1 w-full max-w-xl lg:max-w-none flex justify-center lg:justify-end"
          >
            <div className="relative w-full max-w-md">
              {/* Outer Glow Background Ring */}
              <div className="absolute inset-0 bg-gradient-to-tr from-teal-200/20 to-sky-200/30 rounded-3xl blur-2xl -z-10" />
              
              {/* Main Medical Dashboard Glassmorphism Mockup */}
              <div className="bg-white/80 backdrop-blur-xl border border-slate-100 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-sky-500" />
                
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                      <ShieldPlus className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">HealthPredict Engine</h3>
                      <p className="text-[10px] text-slate-400 font-medium">Model: Calibrated Random Forest (v1.2.0)</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] bg-emerald-50 text-emerald-700 font-bold uppercase rounded border border-emerald-100 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Verified
                  </span>
                </div>

                {/* Grid of Verified Back-End ML Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100/80">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Accuracy</div>
                    <div className="text-2xl font-extrabold text-slate-900">90.83%</div>
                    <div className="text-[9px] text-slate-400 mt-0.5 font-medium">Standard validation split</div>
                  </div>
                  <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100/80">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Precision</div>
                    <div className="text-2xl font-extrabold text-teal-600">96.30%</div>
                    <div className="text-[9px] text-slate-400 mt-0.5 font-medium">Minimizing false positives</div>
                  </div>
                  <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100/80">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Sensitivity (Recall)</div>
                    <div className="text-2xl font-extrabold text-sky-600">74.29%</div>
                    <div className="text-[9px] text-slate-400 mt-0.5 font-medium">Symptom capture sensitivity</div>
                  </div>
                  <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100/80">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">F1 Classification</div>
                    <div className="text-2xl font-extrabold text-indigo-600">83.87%</div>
                    <div className="text-[9px] text-slate-400 mt-0.5 font-medium">Optimal harmonic mean</div>
                  </div>
                </div>

                {/* Simulated Real-Time Waveform / Calibration Activity */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-left font-mono">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
                    <span className="text-[9px] text-sky-400 font-bold uppercase tracking-wider">Evaluation logs</span>
                  </div>
                  <div className="space-y-1 text-[9px] text-slate-400">
                    <div className="text-slate-500">{"$ npm test --model=calibrated"}</div>
                    <div><span className="text-emerald-400">✓</span> loaded pcos_dataset.csv (n=541 patients)</div>
                    <div><span className="text-teal-400">✓</span> RandomForest trained with 100 estimators</div>
                    <div className="text-slate-200">Confusion Matrix: TP: 26, TN: 73, FP: 1, FN: 9</div>
                  </div>
                </div>

                {/* Absolute Floating Accents */}
                <div className="absolute -bottom-3 -right-3 w-16 h-16 bg-gradient-to-tr from-sky-400 to-teal-400 rounded-full blur-xl opacity-20 -z-10" />
              </div>

              {/* Smaller floating widget */}
              <div className="absolute -bottom-6 -left-6 bg-white border border-slate-100 p-3.5 rounded-xl shadow-lg flex items-center gap-3 animate-bounce" style={{ animationDuration: '4s' }}>
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <TrendingUp className="w-4.5 h-4.5" />
                </div>
                <div className="text-left">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Clinical Trust</div>
                  <div className="text-xs font-bold text-slate-900">Validated Markers</div>
                </div>
              </div>

            </div>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}
