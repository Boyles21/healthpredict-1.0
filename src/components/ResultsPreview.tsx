import { motion } from "motion/react";
import { AlertCircle, FileText, Sparkles, CheckCircle2, ChevronRight, Activity } from "lucide-react";

export default function ResultsPreview() {
  return (
    <section id="results-preview" className="py-24 bg-slate-50 border-b border-slate-100 relative">
      <div className="absolute top-1/3 right-0 w-80 h-80 bg-indigo-50/30 rounded-full blur-3xl -z-10" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-15 text-left">
            <span className="text-xs font-bold text-teal-705 uppercase tracking-widest bg-teal-50 px-3.5 py-1.5 rounded-full border border-teal-200">
              Interactive Preview
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-6 tracking-tight leading-tight">
              Actionable screening results, clearly explained.
            </h2>
            <p className="text-slate-600 font-medium mt-4 text-sm sm:text-base leading-relaxed">
              No confusing medical jargon or raw telemetry. Our platform translates your predictive scores into a clean, comprehensive checklist, complete with specific, clinical-backed recommendations to take to your family doctor.
            </p>

            <div className="mt-10 space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 mt-1 flex-shrink-0 font-bold">
                  <span className="text-[10px]">1</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Immediate Risk Category</h4>
                  <p className="text-xs text-slate-600 leading-relaxed mt-0.5">Easily visualize normal, moderate, and high likelihood classifications.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 mt-1 flex-shrink-0 font-bold">
                  <span className="text-[10px]">2</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Drilled-Down Symptom Weights</h4>
                  <p className="text-xs text-slate-600 leading-relaxed mt-0.5">Understand which clinical factor inputs skewed your risk scores higher.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 mt-1 flex-shrink-0 font-bold">
                  <span className="text-[10px]">3</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Doctor-Friendly Report Exporters</h4>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Extract formatted clinical summaries directly to bring along to your appointments.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Image/Mockup Column */}
          <div className="lg:col-span-7 w-full flex justify-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden text-left hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.01]"
            >
              {/* Card Header Banner */}
              <div className="bg-slate-950 p-6 text-white flex items-center justify-between">
                <div>
                  <span className="text-xs bg-teal-500/20 text-teal-300 font-extrabold uppercase px-2 py-0.5 rounded border border-teal-500/20">
                    Sample Patient Report
                  </span>
                  <h3 className="text-lg font-bold mt-2.5">Hormonal Profile Summary</h3>
                </div>
                <FileText className="w-8 h-8 text-slate-400 opacity-60" />
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-6">
                
                {/* Score Circle & Category row */}
                <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-200">
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    {/* Ring background */}
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="48" cy="48" r="40" fill="transparent" stroke="#e2e8f0" strokeWidth="6" />
                      <circle cx="48" cy="48" r="40" fill="transparent" stroke="#0d9488" strokeWidth="6" strokeDasharray="251" strokeDashoffset="55" strokeLinecap="round" />
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-2xl font-black text-slate-900">78%</span>
                      <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider">Likelihood</span>
                    </div>
                  </div>
                  
                  <div className="text-center sm:text-left">
                    <span className="px-2.5 py-0.5 text-xs bg-red-50 text-red-700 font-bold uppercase rounded-full border border-red-250">
                      High Likelihood Detected
                    </span>
                    <h4 className="text-base font-bold text-slate-900 mt-2.5">PCOS Screening Indicators</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">Our Random Forest engine identified multiple key indicators matching standard PCOS symptoms.</p>
                  </div>
                </div>

                {/* Detected Indicators Checklist */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-550 mb-3.5">Detected Clinical Indicators</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { name: "BMI Elevation", val: "28.3 (Overweight status)", highlight: true },
                      { name: "Cycle Length Variance", val: "Irregular (>38 days delay)", highlight: true },
                      { name: "Visual Acne Markers", val: "Moderate to high severity", highlight: true },
                      { name: "Hirsutism Signs", val: "Mild excess hair distribution", highlight: true },
                      { name: "Pelvic Cramps", val: "Low frequency", highlight: false },
                      { name: "Excess Bleeding", val: "Absent", highlight: false }
                    ].map((ind, i) => (
                      <div key={i} className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                        <div className={`w-2 h-2 rounded-full ${ind.highlight ? 'bg-red-500' : 'bg-slate-400'}`} />
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">{ind.name}</span>
                          <span className="text-[10px] text-slate-600 font-semibold block mt-0.5">{ind.val}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-teal-50/40 p-4.5 rounded-2xl border border-teal-200">
                  <div className="flex items-center gap-2 mb-2 text-teal-800 font-bold text-xs">
                    <Sparkles className="w-4 h-4" />
                    <span>Evidence-Backed Recommendations</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-slate-700 leading-relaxed">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Schedule a Gynaecologist Consultation:</strong> Present this calibrated screening indicator list for formal diagnosis.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Bloodwork Preparation:</strong> Request free androgen index and fasting glucose test recommendations during consults.</span>
                    </li>
                  </ul>
                </div>

              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
