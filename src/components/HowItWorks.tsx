import { motion } from "motion/react";
import { ClipboardList, Cpu, PieChart } from "lucide-react";

const steps = [
  {
    icon: ClipboardList,
    title: "Input Data",
    description: "Enter your health metrics including BMI, cycle details, and specific symptoms.",
    color: "bg-blue-50 text-blue-600"
  },
  {
    icon: Cpu,
    title: "AI Analysis",
    description: "Our machine learning models analyze your inputs against thousands of clinical data points.",
    color: "bg-green-50 text-green-600"
  },
  {
    icon: PieChart,
    title: "Get Result",
    description: "Receive a personalized prediction report with likelihood markers and next steps.",
    color: "bg-purple-50 text-purple-600"
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">How It Works</h3>
            <h2 className="text-4xl font-bold text-slate-900 mb-8 max-w-md">The science behind the prediction.</h2>
            <div className="space-y-6">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-6 group"
                >
                  <div className="w-10 h-10 rounded-full bg-medical-soft-teal text-medical-primary flex items-center justify-center font-bold text-sm border border-medical-primary/10 group-hover:bg-medical-primary group-hover:text-white transition-all">
                    {index + 1}
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    <span className="font-bold text-slate-900">{step.title}:</span> {step.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Live Health Feed</span>
                  </div>
                  <div className="text-[10px] text-slate-400">Region: North America</div>
               </div>
               <div className="space-y-4">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className="w-1 h-8 rounded-full bg-medical-primary/20" />
                          <div>
                            <div className="text-xs font-bold text-slate-900">Analysis #{1024 + item}</div>
                            <div className="text-[10px] text-slate-400">Status: Completed</div>
                          </div>
                       </div>
                       <PieChart className="w-4 h-4 text-medical-primary opacity-50" />
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
