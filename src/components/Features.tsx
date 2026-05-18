import { motion } from "motion/react";
import { Shield, Zap, Sparkles, ArrowRight } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your health data is encrypted and never shared. We prioritize your privacy above all else.",
    color: "text-blue-500"
  },
  {
    icon: Sparkles,
    title: "Easy to Use",
    description: "An intuitive interface designed for humans, not medical machines. Accessible on any device.",
    color: "text-amber-500"
  },
  {
    icon: Zap,
    title: "Fast Results",
    description: "Get predictive insights in seconds. No waiting for lab tests for initial likelihood assessments.",
    color: "text-emerald-500"
  }
];

export default function Features() {
  return (
    <section id="about" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
          <div className="max-w-xl">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Platform Features</h3>
            <h2 className="text-4xl font-bold text-slate-900">Built for accuracy and user privacy.</h2>
          </div>
          <button className="text-sm font-bold text-medical-primary flex items-center gap-2 hover:gap-3 transition-all">
            See all capabilities <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-slate-50 group-hover:scale-110 transition-transform`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
