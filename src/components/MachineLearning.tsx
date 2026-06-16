import { motion } from "motion/react";
import { Search, Sliders, BrainCircuit, CheckCircle, Keyboard, Cpu, BarChart2 } from "lucide-react";

const mlTopics = [
  {
    icon: BrainCircuit,
    title: "Random Forest Algorithm",
    description: "An ensemble learning method that constructs a multitude of decision trees during calibration. It handles complex, non-linear relationships and interactions among clinical features beautifully while minimizing over-fitting risk.",
    bulletPoints: ["Combines over 100 decision estimators", "Robust resistance to noise", "High classification accuracy"]
  },
  {
    icon: Search,
    title: "Symptom-Based Prediction",
    description: "Our approach targets physical, cycle, and morphological indicators. This non-invasive assessment serves as an accessible first-step screening filter prior to expensive ultrasound imaging or hormone panels.",
    bulletPoints: ["Non-invasive data collection", "Low cost and instant outcomes", "Identifies early physical warning markers"]
  },
  {
    icon: Sliders,
    title: "Data Preprocessing",
    description: "Clinical patient records undergo standard normalization and encoding. Numerical features like Age, BMI, and weight status are calibrated, while sparse categorical flags are transformed to feed the machine learning matrix.",
    bulletPoints: ["BMI ratio calculation", "Categorical factor balancing", "Null-value compensation pipelines"]
  },
  {
    icon: BarChart2,
    title: "Model Evaluation Process",
    description: "Trained on high-confidence datasets, our model metrics are continuously evaluated via cross-validation split schemas to verify sensitivity (recall) and precision constraints before production build deployment.",
    bulletPoints: ["Rigorous testing splits", "90.83% verified model accuracy", "Balanced Precision-Recall harmony"]
  }
];

export default function MachineLearning() {
  return (
    <section id="machine-learning" className="py-24 bg-white border-b border-slate-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="text-xs font-bold text-teal-600 uppercase tracking-widest bg-teal-50 px-3.5 py-1 rounded-full border border-teal-100/50">
            ML Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-4 tracking-tight leading-tight">
            Advanced Machine Learning Screening Engine.
          </h2>
          <p className="text-slate-500 mt-4 text-sm sm:text-base leading-relaxed">
            Discover the mathematics and preprocessing pipeline powering the HealthPredict risk classification models.
          </p>
        </div>

        {/* Workflow Diagram */}
        <div className="mb-24">
          <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 max-w-4xl mx-auto">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8 text-center">Prediction Processing Pipeline</h3>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative">
              
              {/* Step 1: User Input */}
              <div className="flex-1 w-full bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center relative z-10 flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
                  <Keyboard className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">User Input</h4>
                <p className="text-[10px] text-slate-400">BMI, Period cycle, Acne, Hirsutism, Pain markers</p>
              </div>

              {/* Connector */}
              <div className="hidden md:block text-slate-300 select-none">
                <span className="text-xl font-bold">→</span>
              </div>

              {/* Step 2: Data Preprocessing */}
              <div className="flex-1 w-full bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center relative z-10 flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mb-3">
                  <Sliders className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">Data Processing</h4>
                <p className="text-[10px] text-slate-400">Factor encoding, Null cleaning, Normalization</p>
              </div>

              {/* Connector */}
              <div className="hidden md:block text-slate-300 select-none">
                <span className="text-xl font-bold">→</span>
              </div>

              {/* Step 3: ML Model */}
              <div className="flex-1 w-full bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center relative z-10 flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                  <Cpu className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">ML Model</h4>
                <p className="text-[10px] text-slate-400">Random Forest Classifier, Multi-estimator weights</p>
              </div>

              {/* Connector */}
              <div className="hidden md:block text-slate-300 select-none">
                <span className="text-xl font-bold">→</span>
              </div>

              {/* Step 4: Prediction Results */}
              <div className="flex-1 w-full bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center relative z-10 flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">Results Preview</h4>
                <p className="text-[10px] text-slate-400">Risk ratio percentage, Detailed indicator breakdown</p>
              </div>

            </div>
          </div>
        </div>

        {/* Detailed Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {mlTopics.map((topic, index) => {
            const Icon = topic.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="bg-slate-50/50 p-8 rounded-2xl border border-slate-100 flex flex-col md:flex-row gap-6 text-left hover:bg-slate-50/80 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-white text-slate-800 border border-slate-150 flex items-center justify-center shadow-sm flex-shrink-0">
                  <Icon className="w-6 h-6 text-teal-600" />
                </div>
                
                <div>
                  <h3 className="text-base font-bold text-slate-950 mb-2">{topic.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">{topic.description}</p>
                  
                  <ul className="space-y-1.5">
                    {topic.bulletPoints.map((bp, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                        <CheckCircle className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                        <span>{bp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
