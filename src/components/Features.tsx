import { motion } from "motion/react";
import { BrainCircuit, LayoutDashboard, History, Sparkles, ShieldCheck, Activity } from "lucide-react";

const keyFeatures = [
  {
    icon: BrainCircuit,
    title: "AI Risk Prediction",
    description: "Multi-layered Random Forest algorithm that reads symptom variables and returns precise positive/negative classification scoring.",
    color: "text-teal-600 bg-teal-50 border-teal-100/50"
  },
  {
    icon: LayoutDashboard,
    title: "Health Assessment Dashboard",
    description: "An intuitive clinical-quality control panel designed to simplify metabolic data entry and display high-level health indices.",
    color: "text-sky-600 bg-sky-50 border-sky-100/50"
  },
  {
    icon: History,
    title: "Prediction History Tracking",
    description: "Secure, chronological screening archive logs to trace cycle fluctuation, weight changes, and symptom history over time.",
    color: "text-indigo-600 bg-indigo-50 border-indigo-100/50"
  },
  {
    icon: Sparkles,
    title: "Personalized Recommendations",
    description: "Evidence-backed lifestyle, dietary guidance, and Gynaecologist-consult preparation material tailored to your risk results.",
    color: "text-rose-600 bg-rose-50 border-rose-100/50"
  },
  {
    icon: ShieldCheck,
    title: "Secure Authentication",
    description: "Your health records are shielded by secure credentialed user auth to protect clinical details from third-party tracking.",
    color: "text-emerald-600 bg-emerald-50 border-emerald-100/50"
  },
  {
    icon: Activity,
    title: "Real-Time Analysis",
    description: "Our backend server outputs classification scores almost instantly, executing multi-estimator matrix computations in under 200ms.",
    color: "text-amber-600 bg-amber-50 border-amber-100/50"
  }
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-slate-50/50 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-teal-600 uppercase tracking-widest bg-teal-50 px-3.5 py-1 rounded-full border border-teal-100/50">
            Platform Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-4 tracking-tight leading-tight">
            Comprehensive platform features built for wellness discovery.
          </h2>
          <p className="text-slate-500 mt-4 text-sm leading-relaxed">
            Every component of HealthPredict is built with meticulous attention to detail, balancing modern engineering with intuitive, responsive interface layouts.
          </p>
        </div>

        {/* Feature Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {keyFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 hover:-translate-y-0.5 transition-all group text-left"
              >
                <div className={`w-11 h-11 rounded-lg flex items-center justify-center mb-6 border ${feature.color} transition-transform group-hover:scale-105 duration-300`}>
                  <Icon className="w-5.5 h-5.5" />
                </div>
                
                <h3 className="text-base font-bold text-slate-900 mb-2.5 group-hover:text-teal-600 transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-xs text-slate-500 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
