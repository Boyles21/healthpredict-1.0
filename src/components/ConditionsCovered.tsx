import { motion } from "motion/react";
import { ChevronRight, CalendarCheck, HelpCircle, Flame, Sparkles } from "lucide-react";

export default function ConditionsCovered() {
  return (
    <section id="conditions" className="py-24 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 animate-fade-in animate-duration-500">
          <span className="text-xs font-bold text-teal-700 uppercase tracking-widest bg-teal-50 px-3.5 py-1.5 rounded-full border border-teal-200">
            Pathological Coverage
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-6 tracking-tight leading-tight">
            Comprehensive screening for key gynecological conditions.
          </h2>
          <p className="text-slate-600 font-medium mt-4 text-sm sm:text-base leading-relaxed">
            Our technology provides dedicated evaluation across two primary gynecological pathologies that affect millions globally, but are highly under-diagnosed.
          </p>
        </div>

        {/* Dual Condition Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Card 1: PCOS Prediction */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="group bg-gradient-to-br from-teal-50/50 via-white to-white border border-slate-200 rounded-3xl p-8 lg:p-10 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-teal-300 transition-all duration-300 flex flex-col relative overflow-hidden text-left"
          >
            {/* Top colored accent glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-300/10 rounded-full blur-2xl -z-10" />
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-md shadow-teal-600/20">
                PC
              </div>
              <div>
                <span className="text-xs uppercase font-bold text-teal-700 tracking-wider">Metabolic & Endocrine</span>
                <h3 className="text-2xl font-extrabold text-slate-950">PCOS Prediction</h3>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-8 leading-relaxed">
              Polycystic Ovary Syndrome (PCOS) is a hormonal disorder common among women of reproductive age. Our model evaluates secondary skin, metabolic, and cycle symptoms to calculate a comprehensive risk rating.
            </p>

            <h4 className="text-xs font-bold uppercase text-slate-500 tracking-widest mb-4">Key Symptom Indicators Evaluated</h4>
            
            {/* Symptom list as structured rows */}
            <div className="space-y-3.5 mb-8 flex-grow">
              {[
                { label: "Irregular cycles", desc: "Missed, infrequent, or prolonged menstrual cycles" },
                { label: "Weight gain", desc: "Difficulty managing weight or rapid waistline increase" },
                { label: "Acne", desc: "Persistent severe breakout patterns due to androgen levels" },
                { label: "Excess hair growth", desc: "Hirsutism on face, chin, or areas typically male-patterned" },
                { label: "Hormonal indicators", desc: "Higher biochemical androgen markers or insulin resistance factors" }
              ].map((symptom, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-teal-50/30 p-3 rounded-lg border border-teal-100/50 hover:bg-teal-50/60 transition-colors duration-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-1.5 flex-shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">{symptom.label}</span>
                    <span className="text-[11px] text-slate-600 block leading-normal mt-0.5">{symptom.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-semibold">Model Sensitivity: ~74.29%</span>
              <div className="flex items-center gap-1.5 text-xs font-bold text-teal-600 group-hover:text-teal-700 transition-colors">
                <span>View scientific basis</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.div>

          {/* Card 2: Uterine Fibroid Prediction */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="group bg-gradient-to-br from-sky-50/50 via-white to-white border border-slate-200 rounded-3xl p-8 lg:p-10 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-sky-300 transition-all duration-300 flex flex-col relative overflow-hidden text-left"
          >
            {/* Top colored accent glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-300/10 rounded-full blur-2xl -z-10" />

            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-sky-500 text-white flex items-center justify-center font-bold shadow-md shadow-sky-500/20">
                UF
              </div>
              <div>
                <span className="text-xs uppercase font-bold text-sky-700 tracking-wider">Benign Muscular Growths</span>
                <h3 className="text-2xl font-extrabold text-slate-950">Uterine Fibroid Prediction</h3>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-8 leading-relaxed">
              Uterine Fibroids are non-cancerous growths of the uterus that often appear during childbearing years. Our engine processes bleeding intensity, pelvic signals, and energy patterns to isolate sub-clinical fibroid indicators.
            </p>

            <h4 className="text-xs font-bold uppercase text-slate-500 tracking-widest mb-4">Key Symptom Indicators Evaluated</h4>

            {/* Symptom list as structured rows */}
            <div className="space-y-3.5 mb-8 flex-grow">
              {[
                { label: "Heavy bleeding", desc: "Excessive, prolonged menstrual bleeding or blood-loss duration" },
                { label: "Pelvic pain", desc: "Persistent pelvic pressure, abdominal fullness, or backaches" },
                { label: "Fatigue", desc: "Chronic low energy levels, often linked with blood-loss anemia" },
                { label: "Menstrual abnormalities", desc: "Painful cramping (dysmenorrhea) and irregular spotting" },
                { label: "Reproductive health indicators", desc: "Bladder pressure, frequent urination, or pelvic congestion factors" }
              ].map((symptom, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-sky-50/30 p-3 rounded-lg border border-sky-100/50 hover:bg-sky-50/60 transition-colors duration-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">{symptom.label}</span>
                    <span className="text-[11px] text-slate-600 block leading-normal mt-0.5">{symptom.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-semibold">Validation Accuracy: ~90.83%</span>
              <div className="flex items-center gap-1.5 text-xs font-bold text-sky-600 group-hover:text-sky-700 transition-colors">
                <span>View scientific basis</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
