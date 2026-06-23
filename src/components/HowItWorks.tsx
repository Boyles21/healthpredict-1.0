import { motion } from "motion/react";
import { ClipboardCheck, Cpu, LayoutDashboard, ChevronRight } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: ClipboardCheck,
    title: "Enter Health Information",
    description: "Securely input key markers such as age, cycle frequency, BMI, and visual symptoms like acne or hair distribution changes.",
    color: "bg-teal-50 text-teal-600 border-teal-100/50"
  },
  {
    step: "02",
    icon: Cpu,
    title: "AI Analyzes Symptoms",
    description: "The engine runs multi-stage classifications through standard models trained on validated datasets to map complex health markers.",
    color: "bg-sky-50 text-sky-600 border-sky-100/50"
  },
  {
    step: "03",
    icon: LayoutDashboard,
    title: "Receive Risk Assessment & Recommendations",
    description: "View immediate, clear risk percentages for both PCOS and Uterine Fibroids along with guided advice and physiological report trends.",
    color: "bg-indigo-50 text-indigo-600 border-indigo-100/50"
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-slate-50/50 border-b border-slate-100 relative">
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-teal-50/20 rounded-full blur-3xl -translate-y-1/2 -z-10" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-sky-700 uppercase tracking-widest bg-sky-50 px-3.5 py-1.5 rounded-full border border-sky-200">
            Workflow Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-6 tracking-tight leading-tight">
            How the screening works.
          </h2>
          <p className="text-slate-600 font-medium mt-4 text-sm sm:text-base leading-relaxed">
            In three straightforward steps, receive clinical-grade risk screening metrics for early-detection awareness.
          </p>
        </div>

        {/* Dynamic Connected Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
          
          {/* Connector line for desktop layout */}
          <div className="absolute top-1/3 left-[15%] right-[15%] h-[2px] bg-slate-200 hidden lg:block -z-10" />

          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-teal-500/30 transition-all duration-300 flex flex-col text-left group min-h-[300px]"
              >
                <div className="flex items-center justify-between mb-6">
                  {/* Step bubble icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${item.color.replace('border-teal-100/50', 'border-teal-200').replace('border-sky-100/50', 'border-sky-200').replace('border-indigo-100/50', 'border-indigo-200')} font-bold z-10 duration-300 group-hover:scale-110`}>
                    <Icon className="w-5.5 h-5.5" />
                  </div>
                  
                  {/* Step counter */}
                  <span className="text-3xl font-extrabold font-display bg-gradient-to-br from-slate-300 to-slate-450 bg-clip-text text-transparent">
                    {item.step}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-teal-600 transition-colors duration-300">
                  {item.title}
                </h3>
                
                <p className="text-sm text-slate-600 leading-relaxed flex-grow">
                  {item.description}
                </p>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500 group-hover:text-teal-600 transition-colors duration-300">
                  <span>Learn workflow metrics</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Live processing graphic simulated badge */}
        <div className="mt-14 max-w-xl mx-auto bg-white border border-slate-200 p-4 rounded-xl shadow-sm text-center flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Real-Time Service Connection Check</span>
          </div>
          <span className="text-xs text-slate-400 italic hidden sm:block">|</span>
          <p className="text-xs text-slate-650">
            Average prediction processing speed: <span className="font-bold text-emerald-600">~120 milliseconds</span>
          </p>
        </div>
      </div>
    </section>
  );
}
