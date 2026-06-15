import { motion } from "motion/react";
import { Cpu, ShieldCheck, Database, SearchCode } from "lucide-react";

const trustFactors = [
  {
    icon: Cpu,
    title: "Machine Learning Powered",
    description: "Evaluated by calibrated multi-tree Random Forest classifiers to weigh subtle symptom correlations with clinical precision.",
    gradient: "from-teal-500/10 to-teal-500/0",
    iconColor: "text-teal-600 bg-teal-50"
  },
  {
    icon: ShieldCheck,
    title: "Secure Health Data",
    description: "Your health records are confidential and stored with industry-standard cryptographic protocol parameters. We never share or sell personal information.",
    gradient: "from-sky-500/10 to-sky-500/0",
    iconColor: "text-sky-600 bg-sky-50"
  },
  {
    icon: Database,
    title: "Evidence-Based Assessment",
    description: "Our features correspond to diagnostic components found in real peer-reviewed clinical studies. Built on validated patient metrics.",
    gradient: "from-indigo-500/10 to-indigo-500/0",
    iconColor: "text-indigo-600 bg-indigo-50"
  },
  {
    icon: SearchCode,
    title: "Early Risk Detection",
    description: "Designed as an initial non-invasive screening tool to discover subtle physiological patterns before seeking advanced diagnostic procedures.",
    gradient: "from-rose-500/10 to-rose-500/0",
    iconColor: "text-rose-600 bg-rose-50"
  }
];

export default function TrustCredibility() {
  return (
    <section id="trust" className="py-20 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-teal-600 uppercase tracking-widest bg-teal-50 px-3.5 py-1 rounded-full border border-teal-100/50">
            Trust & Credibility
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-4 tracking-tight leading-tight">
            Designed for clinical relevance and data sovereignty.
          </h2>
          <p className="text-slate-500 mt-4 leading-relaxed">
            By combining mathematical models with standardized health datasets, we help you translate everyday physiological indicators into actionable health intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {trustFactors.map((factor, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative p-6 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:border-slate-200 transition-all group overflow-hidden flex flex-col text-left"
            >
              {/* Subtle hover gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${factor.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-0`} />
              
              <div className={`w-11 h-11 rounded-lg flex items-center justify-center mb-5 ${factor.iconColor} font-bold z-10 transition-transform group-hover:scale-105 duration-300`}>
                <factor.icon className="w-5.5 h-5.5" />
              </div>

              <h4 className="text-base font-bold text-slate-900 mb-2 relative z-10">
                {factor.title}
              </h4>
              
              <p className="text-xs text-slate-500 leading-relaxed relative z-10 flex-grow">
                {factor.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
