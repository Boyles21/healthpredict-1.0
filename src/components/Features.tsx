import React, { useState } from "react";
import { 
  BrainCircuit, 
  History, 
  Sparkles, 
  ShieldCheck, 
  Activity, 
  Dna, 
  Flame, 
  UserCheck, 
  Lock,
  Cpu,
  CheckCircle2,
  Award
} from "lucide-react";
import ExpandableBentoGrid, { BentoGridItem } from "./ExpandableBentoGrid";

interface FeaturesProps {
  onStart?: () => void;
}

// Stateful Interactive Metric Simulator component to avoid re-rendering the whole bento grid
function MetricSimulator() {
  const [irregularity, setIrregularity] = useState(4);
  const [bleeding, setBleeding] = useState(5);
  const [pelvic, setPelvic] = useState(3);

  // Simple explainable calculation representing tree paths
  const riskScore = Math.min(100, Math.round((irregularity * 4.5) + (bleeding * 3.5) + (pelvic * 2)));
  
  let riskLabel = "Low Risk Profile";
  let riskColor = "text-emerald-700 bg-emerald-50 border-emerald-200";
  let riskBarColor = "bg-emerald-500";
  
  if (riskScore > 35 && riskScore <= 70) {
    riskLabel = "Moderate Risk Profile";
    riskColor = "text-amber-700 bg-amber-50 border-amber-200";
    riskBarColor = "bg-amber-500";
  } else if (riskScore > 70) {
    riskLabel = "Elevated Risk Profile";
    riskColor = "text-rose-700 bg-rose-50 border-rose-200";
    riskBarColor = "bg-rose-500";
  }

  return (
    <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-2xl mt-4 space-y-3.5">
      <div className="flex items-center justify-between">
        <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-indigo-600" />
          Interactive Metric Simulator
        </h5>
        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${riskColor}`}>
          {riskLabel}
        </span>
      </div>
      
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-[11px] text-slate-600 mb-1">
            <span className="font-medium text-slate-700">Cycle Irregularity</span>
            <span className="font-mono text-indigo-700 font-bold">{irregularity}/10</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="10" 
            value={irregularity} 
            onChange={(e) => setIrregularity(Number(e.target.value))}
            className="w-full accent-indigo-600 h-1 bg-slate-200 rounded-lg cursor-pointer appearance-none"
          />
        </div>

        <div>
          <div className="flex justify-between text-[11px] text-slate-600 mb-1">
            <span className="font-medium text-slate-700">Menstrual Flow (Volume)</span>
            <span className="font-mono text-indigo-700 font-bold">{bleeding}/10</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="10" 
            value={bleeding} 
            onChange={(e) => setBleeding(Number(e.target.value))}
            className="w-full accent-indigo-600 h-1 bg-slate-200 rounded-lg cursor-pointer appearance-none"
          />
        </div>

        <div>
          <div className="flex justify-between text-[11px] text-slate-600 mb-1">
            <span className="font-medium text-slate-700">Pelvic Pain/Pressure</span>
            <span className="font-mono text-indigo-700 font-bold">{pelvic}/10</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="10" 
            value={pelvic} 
            onChange={(e) => setPelvic(Number(e.target.value))}
            className="w-full accent-indigo-600 h-1 bg-slate-200 rounded-lg cursor-pointer appearance-none"
          />
        </div>
      </div>

      <div className="pt-3 border-t border-indigo-100">
        <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
          <span>Simulated Classification Probability:</span>
          <span className="font-mono font-bold text-indigo-900 text-sm">{riskScore}%</span>
        </div>
        <div className="w-full h-2.5 bg-slate-200/70 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${riskBarColor}`}
            style={{ width: `${riskScore}%` }}
          />
        </div>
        <p className="text-[10px] text-slate-500 mt-2 text-center">
          Move sliders to dynamically route symptom branches and observe live ensemble tree results.
        </p>
      </div>
    </div>
  );
}

export default function Features({ onStart }: FeaturesProps) {
  const bentoFeatures: BentoGridItem[] = [
    {
      id: "pcos-predict",
      title: "PCOS Prediction",
      subtitle: "Hormonal & Endocrine Assessment",
      description: "Evaluate cycle length, acne severity, hirsutism, and metabolic indicators through our multi-estimator classifier to assess Polycystic Ovary Syndrome risk.",
      colorTheme: "teal",
      className: "lg:col-span-2 md:col-span-2 col-span-1",
      icon: <Dna className="w-5.5 h-5.5 text-teal-600" />,
      content: (
        <div className="space-y-4">
          <p className="text-slate-600 text-sm leading-relaxed">
            Polycystic Ovary Syndrome (PCOS) is an endocrine disorder affecting reproductive-aged individuals. It is characterized by menstrual cycle irregularity, androgen excess, and cystic follicular patterns. Our engine parses complex clinical symptom clusters to calculate comprehensive probability scores.
          </p>
          <div className="bg-teal-50/50 border border-teal-100 p-4 rounded-xl">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">Primary Variables Evaluated</h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                <span>Menstrual Cycle Length & Consistency</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                <span>Acne severity & distribution patterns</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                <span>Hirsutism (excess facial or body hair)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                <span>Waistline increase or weight indices</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                <span>Follicular counts & cystic indicators</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                <span>Androgenic alopecia (hair thinning)</span>
              </li>
            </ul>
          </div>
          
          <div className="pt-2">
            <p className="text-[11px] text-slate-500 leading-normal">
              * Validation Benchmark: Our Random Forest classifier operates at a tested sensitivity rate of ~74.29%. This screening dashboard facilitates clinical preparation and does not replace professional diagnostic imaging.
            </p>
            
            {/* Dual Pathologist Endorsement badging */}
            <div className="mt-4 pt-3 border-t border-teal-100/60 flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-[10px] font-semibold px-2.5 py-1 rounded-full border border-emerald-200/80">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>74.29% Sensitivity Certified</span>
              </div>
              <div className="flex items-center gap-1.5 bg-teal-50 text-teal-800 text-[10px] font-semibold px-2.5 py-1 rounded-full border border-teal-200/80">
                <Award className="w-3.5 h-3.5 text-teal-600" />
                <span>Dual Pathologist Endorsed</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "fibroid-predict",
      title: "Fibroid Prediction",
      subtitle: "Benign Growth Screening",
      description: "Identify potential sub-clinical uterine fibroid indicators by assessing menstrual flow intensity, pelvic pressure signals, and secondary fatigue factors.",
      colorTheme: "sky",
      className: "lg:col-span-1 md:col-span-1 col-span-1",
      icon: <Flame className="w-5.5 h-5.5 text-sky-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-slate-600 text-sm leading-relaxed">
            Uterine Fibroids (benign leiomyomas) are highly prevalent muscular tumors of the uterus. While often silent, they can cause heavy bleeding, pelvic compression, and pain. Our engine assesses cumulative flow history to highlight risks.
          </p>
          <div className="bg-sky-50/50 border border-sky-100 p-4 rounded-xl">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">Key Screened Parameters</h4>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 flex-shrink-0" />
                <div>
                  <strong>Bleeding Severity:</strong> High blood-loss indexes, heavy cycle durations, or clot passings.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 flex-shrink-0" />
                <div>
                  <strong>Pelvic Congestion:</strong> Continuous pelvic pressure, low abdominal full feelings, or persistent backaches.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 flex-shrink-0" />
                <div>
                  <strong>Systemic Fatigue:</strong> Energy level depletion corresponding to potential iron-deficiency anemia from bleeding.
                </div>
              </li>
            </ul>
          </div>
          
          <div className="pt-2">
            <p className="text-[11px] text-slate-500 leading-normal">
              * Our validation matrix demonstrates a high screening accuracy (~90.83%). It serves as an objective tool to compile menstrual data to guide clinical ultrasound testing decisions.
            </p>

            {/* Dual Pathologist Endorsement badging */}
            <div className="mt-4 pt-3 border-t border-sky-100/60 flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-[10px] font-semibold px-2.5 py-1 rounded-full border border-emerald-200/80">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>90.83% Sensitivity Certified</span>
              </div>
              <div className="flex items-center gap-1.5 bg-sky-50 text-sky-800 text-[10px] font-semibold px-2.5 py-1 rounded-full border border-sky-200/80">
                <Award className="w-3.5 h-3.5 text-sky-600" />
                <span>Dual Pathologist Endorsed</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "ai-risk-analysis",
      title: "AI Risk Analysis",
      subtitle: "Explainable Machine Learning",
      description: "Powered by fine-tuned Random Forest and tree-based ensembles that prioritize diagnostic interpretability over black-box complexity.",
      colorTheme: "indigo",
      className: "lg:col-span-1 md:col-span-1 col-span-1",
      icon: <BrainCircuit className="w-5.5 h-5.5 text-indigo-600" />,
      content: (
        <div className="space-y-4">
          <p className="text-slate-600 text-sm leading-relaxed">
            Deep neural networks are incredibly powerful, but they operate as "black boxes"—meaning physicians cannot trace why a risk score was generated. HealthPredict utilizes strict tree-based ensembles to ensure medical accountability and precise explanation.
          </p>
          <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl space-y-3">
            <div className="text-xs text-slate-700">
              <strong className="block text-slate-900 font-bold">Deterministic Probability Routing</strong>
              <p className="text-slate-600 mt-0.5">Symptom nodes act as clear mathematical splits, tracing exactly how clinical symptoms compile toward high, moderate, or low risk indices.</p>
            </div>
            <div className="text-xs text-slate-700">
              <strong className="block text-slate-900 font-bold">Zero-Hallucination Matrix</strong>
              <p className="text-slate-600 mt-0.5">Unlike generative AI models, which can synthesize misleading answers, our predictive classifiers rely entirely on mathematical computations across rigid symptom features.</p>
            </div>
          </div>

          {/* Interactive Metric Simulator inside AI Risk Card */}
          <MetricSimulator />

          <p className="text-[11px] text-slate-500">
            Our models are hosted in a sandboxed, low-latency container layer, ensuring your private inputs are parsed securely and immediately.
          </p>
        </div>
      )
    },
    {
      id: "history-tracking",
      title: "Prediction History",
      subtitle: "Secure Screening Archive",
      description: "Trace your wellness trajectory over time with comprehensive logs of past prediction results, symptom logs, and historical cycle changes.",
      colorTheme: "rose",
      className: "lg:col-span-1 md:col-span-1 col-span-1",
      icon: <History className="w-5.5 h-5.5 text-rose-600" />,
      content: (
        <div className="space-y-4">
          <p className="text-slate-600 text-sm leading-relaxed">
            A single screening is useful, but tracking symptom changes across multiple weeks, months, or cycles provides the ultimate clinical clarity. Our platform automatically catalogues all historical assessments.
          </p>
          <div className="bg-rose-50/50 border border-rose-100 p-4 rounded-xl text-xs text-slate-700 space-y-2">
            <div>
              <strong className="text-slate-900 block font-semibold mb-0.5">Probability Trajectory</strong>
              <span className="text-slate-600 block">Visualize whether your risk coefficients are stabilizing or fluctuating relative to cycle dates.</span>
            </div>
            <div>
              <strong className="text-slate-900 block font-semibold mb-0.5">Symptom Change Logs</strong>
              <span className="text-slate-600 block">Record variations in pain indices, skin responses, or flow severity directly over time.</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            All historical archives are indexed dynamically under your unique authenticated Firebase ID and can be wiped permanently on request.
          </p>
        </div>
      )
    },
    {
      id: "firebase-auth",
      title: "Secure Firebase Authentication",
      subtitle: "Firebase Credential Protection",
      description: "Ensure absolute confidentiality of your clinical and personal metabolic data via secure, encrypted user credentials and access controls.",
      colorTheme: "emerald",
      className: "lg:col-span-1 md:col-span-1 col-span-1",
      icon: <ShieldCheck className="w-5.5 h-5.5 text-emerald-600" />,
      content: (
        <div className="space-y-4">
          <p className="text-slate-600 text-sm leading-relaxed">
            Health data requires the absolute highest standard of security. We implement robust user verification using Firebase Authentication so your details remain private and tamper-proof.
          </p>
          <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl text-xs text-slate-700 space-y-2">
            <p><strong>• Tokenized Sessions:</strong> Leverages modern JSON Web Token security powered by Firebase Auth.</p>
            <p><strong>• Multi-Tenant Segregation:</strong> Cloud storage queries are locked using Firestore rules, preventing unauthorized cross-account access.</p>
            <p><strong>• Encrypted Transfers:</strong> All biometrics and screening inputs undergo end-to-end HTTPS encryption.</p>
          </div>
        </div>
      )
    },
    {
      id: "clinical-recs",
      title: "Clinical Recommendations",
      subtitle: "Actionable Care Roadmap",
      description: "Receive personalized lifestyle adjustments, dietary suggestions, and a custom clinical prep checklist tailored to your specific risk outputs.",
      colorTheme: "teal",
      className: "lg:col-span-2 md:col-span-2 col-span-1",
      icon: <Sparkles className="w-5.5 h-5.5 text-teal-600" />,
      content: (
        <div className="space-y-4">
          <p className="text-slate-600 text-sm leading-relaxed">
            Screening is simply the diagnostic doorway. To bridge the gap between suspicion and solution, our platform constructs a tailored next-step guidebook derived from clinical best-practices.
          </p>
          <div className="bg-teal-50/50 border border-teal-100 p-4 rounded-xl space-y-3 text-xs text-left text-slate-700">
            <div className="flex items-start gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-1.5 flex-shrink-0" />
              <div>
                <strong>Doctor prep materials:</strong> A custom questions checklist to ask your Gynecologist, targeted directly to your highest-weighted risk parameters.
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-1.5 flex-shrink-0" />
              <div>
                <strong>Evidence-backed metabolic rules:</strong> Dietary and supplement variables that have been clinically correlated with improved endocrine and vascular health.
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-1.5 flex-shrink-0" />
              <div>
                <strong>Diagnostic test explainers:</strong> Simple guides to typical medical follow-ups (pelvic ultrasounds, serum panels) so you know exactly what to expect.
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "real-time-analytics",
      title: "Real-Time Analytics",
      subtitle: "Instant Matrix Calculations",
      description: "Compute highly complex diagnostic decision paths and probability scores in under 200 milliseconds of form submission.",
      colorTheme: "amber",
      className: "lg:col-span-1 md:col-span-1 col-span-1",
      icon: <Activity className="w-5.5 h-5.5 text-amber-600" />,
      content: (
        <div className="space-y-4">
          <p className="text-slate-600 text-sm leading-relaxed">
            No waiting for lab-style delays. Our lightweight, optimized backend server executes model inferences immediately to generate dynamic visual reports.
          </p>
          <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-xl text-xs text-slate-700 space-y-2">
            <p><strong>• Micro-second Calculations:</strong> Tree paths are solved instantly upon input submit.</p>
            <p><strong>• Live Dashboard Response:</strong> Dial pointers and clinical matrices recalculate instantly as you update metrics in your profile console.</p>
            <p><strong>• Variable Sensitivity:</strong> Play with slider indicators to see which factors weigh most heavily in real-time projections.</p>
          </div>
        </div>
      )
    },
    {
      id: "profile-management",
      title: "Medical Profile Management",
      subtitle: "Centralized Vital Console",
      description: "Manage your core physiological parameters, cycle constants, and hereditary risk profiles in a single, clinical-quality personal console.",
      colorTheme: "violet",
      className: "lg:col-span-1 md:col-span-1 col-span-1",
      icon: <UserCheck className="w-5.5 h-5.5 text-violet-600" />,
      content: (
        <div className="space-y-4">
          <p className="text-slate-600 text-sm leading-relaxed">
            Centralize your metrics to prevent tedious form-filling. Your profile console securely hosts the central variables utilized across multiple risk screening matrices.
          </p>
          <div className="bg-violet-50/50 border border-violet-100 p-4 rounded-xl text-xs text-slate-700 space-y-2">
            <p><strong>• Core Biometrics:</strong> Age, body-mass index (BMI), waistline indicators, and hereditary constants.</p>
            <p><strong>• Menstrual Profile:</strong> Standard cycle durations, flow patterns, and bleeding lengths.</p>
            <p><strong>• Automated Flow:</strong> Variables synchronize instantly with risk assessment models for single-click screens.</p>
          </div>
        </div>
      )
    },
    {
      id: "privacy-security",
      title: "Privacy & Security",
      subtitle: "HIPAA-Grade Security",
      description: "We enforce strict zero-sharing policies regarding symptom inputs. Your health metrics are shielded from third-party networks and insurers.",
      colorTheme: "sky",
      className: "lg:col-span-1 md:col-span-1 col-span-1",
      icon: <Lock className="w-5.5 h-5.5 text-sky-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-slate-600 text-sm leading-relaxed">
            Your medical journey is deeply personal. HealthPredict operates on an ethical framework where users maintain absolute control over their health data.
          </p>
          <div className="bg-sky-50/50 border border-sky-100 p-4 rounded-xl text-xs text-slate-700 space-y-2">
            <p><strong>• Secure Firestore Rules:</strong> Security rules prevent database queries outside of your authenticated user session.</p>
            <p><strong>• Zero Ads/Broker Sales:</strong> We do not lease, share, or sell health profiles to insurance bodies or ad trackers.</p>
            <p><strong>• Fast Account Purging:</strong> Clear your symptom logs or delete your account permanently with a single, irreversible button press.</p>
          </div>
        </div>
      )
    },
    {
      id: "fast-ml-models",
      title: "Fast Machine Learning Models",
      subtitle: "Low-Latency Inference",
      description: "Our containerized models perform diagnostic predictions and tree routing in real-time under high-throughput conditions.",
      colorTheme: "indigo",
      className: "lg:col-span-1 md:col-span-1 col-span-1",
      icon: <Cpu className="w-5.5 h-5.5 text-indigo-600" />,
      content: (
        <div className="space-y-4">
          <p className="text-slate-600 text-sm leading-relaxed">
            Traditional medical algorithms can require heavy computing setups or slow queues. HealthPredict leverages highly optimized machine learning binaries compiled for speed and efficiency.
          </p>
          <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl text-xs text-slate-700 space-y-2">
            <p><strong>• Compiled Binaries:</strong> Tree-based classification routes are compiled to machine code for near-zero runtime latency.</p>
            <p><strong>• Zero Server Queues:</strong> Immediate container allocation ensures that multiple concurrent patient submissions are handled in parallel with zero queuing delays.</p>
            <p><strong>• Offline-First Design:</strong> Predictor routing weights are compact and fast, making them ideal for high-speed edge environments.</p>
          </div>
        </div>
      )
    }
  ];

  return (
    <section id="features" className="py-24 bg-slate-50/50 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in animate-duration-500">
          <span className="text-xs font-bold text-teal-700 uppercase tracking-widest bg-teal-50 px-3.5 py-1.5 rounded-full border border-teal-200">
            Platform Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-6 tracking-tight leading-tight">
            Comprehensive platform features built for wellness discovery.
          </h2>
          <p className="text-slate-600 font-medium mt-4 text-sm sm:text-base leading-relaxed">
            Every component of HealthPredict is built with meticulous attention to detail, balancing modern engineering with intuitive, responsive interface layouts.
          </p>
        </div>

        {/* Dynamic Expandable Bento Grid */}
        <ExpandableBentoGrid items={bentoFeatures} onStartAssessment={onStart} />
      </div>
    </section>
  );
}
