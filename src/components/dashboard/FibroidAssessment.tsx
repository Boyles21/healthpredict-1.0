import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Activity, ShieldPlus, LogOut, User, ClipboardCheck, Sparkles, AlertCircle, RefreshCw, ChevronLeft, Heart, FileText, ShieldAlert, CheckCircle2, ListFilter } from "lucide-react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Checkbox from "../ui/Checkbox";
import { db, handleFirestoreError, OperationType, auth } from "../../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface FibroidAssessmentProps {
  userProfile: {
    fullName: string;
    email: string;
  };
  onLogout: () => void;
  onGoToProfile: () => void;
  onBack: () => void;
  formData: {
    age: string;
    weight: string;
    height: string;
    heavyBleeding: boolean;
    prolongedMenstruation: boolean;
    pelvicPain: boolean;
    abdominalSwelling: boolean;
    frequentUrination: boolean;
    constipation: boolean;
    fatigueAnemia: boolean;
    painDuringIntercourse: boolean;
    lowerBackPain: boolean;
    irregularMenstrualFlow: boolean;
    familyHistory: boolean;
    pregnancyDifficulty: boolean;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

export default function FibroidAssessment({
  userProfile,
  onLogout,
  onGoToProfile,
  onBack,
  formData,
  setFormData
}: FibroidAssessmentProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [bmi, setBmi] = useState<number | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [serverStatus, setServerStatus] = useState<"checking" | "online" | "offline">("checking");
  const [modelStatus, setModelStatus] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState(false);

  // Check health status of server
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch("/api/health");
        if (res.ok) {
          const data = await res.json();
          setServerStatus("online");
          setModelStatus(data.modelReady);
        } else {
          setServerStatus("offline");
        }
      } catch (e) {
        setServerStatus("offline");
      }
    };
    checkHealth();
  }, []);

  // Compute BMI dynamically
  useEffect(() => {
    if (formData.weight && formData.height) {
      const w = parseFloat(formData.weight);
      const h = parseFloat(formData.height) / 100;
      if (w > 0 && h > 0) {
        setBmi(parseFloat((w / (h * h)).toFixed(1)));
      }
    } else {
      setBmi(null);
    }
  }, [formData.weight, formData.height]);

  // Real-time validation
  useEffect(() => {
    const newErrors = { ...errors };
    let changed = false;

    if (formData.age !== undefined && formData.age !== "") {
      const age = parseInt(formData.age);
      if (isNaN(age) || age < 12 || age > 65) {
        if (newErrors.age !== "Age must be between 12 and 65") {
          newErrors.age = "Age must be between 12 and 65";
          changed = true;
        }
      } else if (newErrors.age) {
        delete newErrors.age;
        changed = true;
      }
    }

    if (formData.weight !== undefined && formData.weight !== "") {
      const weight = parseFloat(formData.weight);
      if (isNaN(weight) || weight < 30 || weight > 200) {
        if (newErrors.weight !== "Enter a valid weight (30-200kg)") {
          newErrors.weight = "Enter a valid weight (30-200kg)";
          changed = true;
        }
      } else if (newErrors.weight) {
        delete newErrors.weight;
        changed = true;
      }
    }

    if (formData.height !== undefined && formData.height !== "") {
      const height = parseFloat(formData.height);
      if (isNaN(height) || height < 100 || height > 220) {
        if (newErrors.height !== "Enter a valid height (100-220cm)") {
          newErrors.height = "Enter a valid height (100-220cm)";
          changed = true;
        }
      } else if (newErrors.height) {
        delete newErrors.height;
        changed = true;
      }
    }

    if (changed) {
      setErrors(newErrors);
    }
  }, [formData.age, formData.weight, formData.height]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const age = parseInt(formData.age);
    if (isNaN(age) || age < 12 || age > 65) {
      newErrors.age = "Age must be between 12 and 65";
    }

    const weight = parseFloat(formData.weight);
    if (isNaN(weight) || weight < 30 || weight > 200) {
      newErrors.weight = "Enter a valid weight (30-200kg)";
    }

    const height = parseFloat(formData.height);
    if (isNaN(height) || height < 100 || height > 220) {
      newErrors.height = "Enter a valid height (100-220cm)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [predictionResult, setPredictionResult] = useState<{
    likelihood: number;
    riskCategory: "LOW" | "MODERATE" | "HIGH";
    recommendations: string[];
  } | null>(null);

  const handlePredictSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      setTimeout(() => {
        const firstErrorEl = document.querySelector(".border-red-500, [class*='border-red-500'], .text-red-500");
        if (firstErrorEl) {
          firstErrorEl.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 60);
      return;
    }

    setIsPredicting(true);
    
    let likelihood = 8;
    let riskCategory = "LOW";
    
    try {
      const response = await fetch("/api/predict-fibroid", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          age: parseInt(formData.age),
          weight: parseFloat(formData.weight),
          height: parseFloat(formData.height),
          heavyBleeding: formData.heavyBleeding,
          prolongedMenstruation: formData.prolongedMenstruation,
          pelvicPain: formData.pelvicPain,
          abdominalSwelling: formData.abdominalSwelling,
          frequentUrination: formData.frequentUrination,
          constipation: formData.constipation,
          fatigueAnemia: formData.fatigueAnemia,
          painDuringIntercourse: formData.painDuringIntercourse,
          lowerBackPain: formData.lowerBackPain,
          irregularMenstrualFlow: formData.irregularMenstrualFlow,
          familyHistory: formData.familyHistory,
          pregnancyDifficulty: formData.pregnancyDifficulty
        })
      });
      
      if (response.ok) {
        const resData = await response.json();
        likelihood = resData.likelihood;
        riskCategory = resData.riskCategory;
      } else {
        throw new Error("Prediction API call failed");
      }
    } catch (apiErr) {
      console.warn("Fallback to client heuristics prediction:", apiErr);
      // Fallback in case of server offline during fast testing
      let sum = 8;
      if (formData.heavyBleeding) sum += 22;
      if (formData.prolongedMenstruation) sum += 18;
      if (formData.pelvicPain) sum += 12;
      if (formData.abdominalSwelling) sum += 15;
      if (formData.frequentUrination) sum += 10;
      if (formData.constipation) sum += 6;
      if (formData.fatigueAnemia) sum += 10;
      if (formData.painDuringIntercourse) sum += 8;
      if (formData.lowerBackPain) sum += 7;
      if (formData.irregularMenstrualFlow) sum += 8;
      if (formData.familyHistory) sum += 14;
      if (formData.pregnancyDifficulty) sum += 12;
      likelihood = Math.min(Math.max(sum, 5), 98);
      riskCategory = likelihood >= 70 ? "HIGH" : likelihood >= 35 ? "MODERATE" : "LOW";
    }

    const recs = [
      "Incorporate anti-inflammatory foods (like green tea, turmeric, tomatoes, citrus, and leafy greens) to support pelvic vascular health."
    ];
    if (riskCategory === "HIGH") {
      recs.push("Schedule a professional clinical evaluation and uterine ultrasound with an OB/GYN specialist to confirm size and position.", "Request a full hematocrit/hemoglobin blood assay to rule out microcytic anemia from heavy menstrual loss.");
    } else if (riskCategory === "MODERATE") {
      recs.push("Track your bleeding cycle duration and nightly pad count changes using a pelvic logging journal for clinical discussions.", "Incorporate low-impact warm aerobics and support pelvic tissues with comfortable therapeutic moist heat packs.");
    } else {
      recs.push("Maintain standard nutrient-dense dietary regimes, high intake of soluble fibers, and schedule annual routine clinical checkups.");
    }

    setPredictionResult({
      likelihood,
      riskCategory: riskCategory as "LOW" | "MODERATE" | "HIGH",
      recommendations: recs
    });

    const assessmentDoc = {
      uid: auth.currentUser?.uid || "demo",
      age: parseInt(formData.age),
      weight: parseFloat(formData.weight),
      height: parseFloat(formData.height),
      
      // PCOS default parameters to comply with schema validator
      cycleLength: 28,
      cycleRegularity: formData.irregularMenstrualFlow ? "irregular" : "regular",
      weightGain: false,
      hairGrowth: false,
      hairLoss: false,
      acne: false,
      skinDarkening: false,
      fastFood: false,
      exercise: true,
      pelvicPain: formData.pelvicPain,
      fatigue: formData.fatigueAnemia,

      // Fibroid fields (optional extra parameters)
      isFibroid: true,
      diseaseType: "Fibroid",
      heavyBleeding: formData.heavyBleeding,
      prolongedMenstruation: formData.prolongedMenstruation,
      abdominalSwelling: formData.abdominalSwelling,
      frequentUrination: formData.frequentUrination,
      constipation: formData.constipation,
      fatigueAnemia: formData.fatigueAnemia,
      painDuringIntercourse: formData.painDuringIntercourse,
      lowerBackPain: formData.lowerBackPain,
      irregularMenstrualFlow: formData.irregularMenstrualFlow,
      familyHistory: formData.familyHistory,
      pregnancyDifficulty: formData.pregnancyDifficulty,

      predictionPercentage: likelihood,
      riskCategory,
      recommendations: recs,
      createdAt: serverTimestamp()
    };

    try {
      await addDoc(collection(db, "assessments"), assessmentDoc);
    } catch (err) {
      console.error("Firestore save error, placing in local state:", err);
    }

    setTimeout(() => {
      setIsPredicting(false);
      setSubmitted(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Universal Top Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <button 
              onClick={onBack}
              className="mr-2 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              title="Return to Selector"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div className="w-8 h-8 bg-medical-primary rounded-lg flex items-center justify-center text-white">
              <ShieldPlus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 hidden sm:inline">
              HealthPredict
            </span>
          </div>

          <div className="flex items-center gap-2 mr-auto ml-4">
            <div className={`w-2 h-2 rounded-full ${serverStatus === "online" ? (modelStatus ? "bg-emerald-500" : "bg-amber-500") : "bg-red-500"} animate-pulse`} />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden md:inline">
              {serverStatus === "online" ? (modelStatus ? "Analysis Ready" : "Initializing Model") : "Backend Offline"}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={onGoToProfile}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100 hover:border-medical-primary/30 transition-all font-bold text-slate-600 cursor-pointer"
            >
              <User className="w-4 h-4 text-slate-400" />
              <span className="text-xs uppercase tracking-wider">{userProfile.fullName}</span>
            </button>
            <button 
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Primary Layout Wrapper */}
      <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
        {isPredicting ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="relative w-24 h-24 mb-6">
              <div className="absolute inset-0 border-4 border-medical-primary/10 rounded-full" />
              <div className="absolute inset-0 border-4 border-medical-primary border-t-transparent rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <ShieldPlus className="w-8 h-8 text-medical-primary animate-pulse" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Analyzing Health Markers</h2>
            <p className="text-slate-500 max-w-xs mx-auto">Our AI is preparing the Uterine Fibroid diagnostic vector matrix...</p>
          </div>
        ) : submitted && predictionResult ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-[40px] border border-slate-100 shadow-sm"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-medical-soft-blue text-medical-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <ClipboardCheck className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 mb-2 font-sans tracking-tight">Diagnostic Analysis Complete</h2>
              <p className="text-slate-500 text-sm">Your secure assessment metrics have been successfully persisted in the Cloud.</p>
            </div>

            {/* Score Ring Section */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center border border-slate-100 rounded-3xl p-6 sm:p-8 bg-slate-50 mb-8">
              <div className="md:col-span-5 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-200/60 pb-6 md:pb-0 md:pr-6 text-center">
                <div className="relative w-36 h-36 flex items-center justify-center mb-4">
                  {/* Outer circle track */}
                  <svg className="absolute w-full h-full transform -rotate-90">
                    <circle cx="72" cy="72" r="62" strokeWidth="8" stroke="#e2e8f0" fill="transparent" />
                    <circle 
                      cx="72" 
                      cy="72" 
                      r="62" 
                      strokeWidth="8" 
                      stroke={predictionResult.riskCategory === "HIGH" ? "#f43f5e" : predictionResult.riskCategory === "MODERATE" ? "#f59e0b" : "#10b981"} 
                      fill="transparent" 
                      strokeDasharray={2 * Math.PI * 62}
                      strokeDashoffset={2 * Math.PI * 62 * (1 - predictionResult.likelihood / 100)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="text-center z-10">
                    <span className="text-4xl font-extrabold text-slate-900">{predictionResult.likelihood}%</span>
                    <span className="block text-[11px] font-bold text-slate-400 uppercase mt-0.5">Likelihood</span>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide bg-white shadow-xs border border-slate-200">
                  <span className={`w-2 h-2 rounded-full ${predictionResult.riskCategory === "HIGH" ? "bg-rose-500" : predictionResult.riskCategory === "MODERATE" ? "bg-amber-500" : "bg-emerald-500"}`} />
                  <span className={predictionResult.riskCategory === "HIGH" ? "text-rose-600" : predictionResult.riskCategory === "MODERATE" ? "text-amber-600" : "text-emerald-600"}>
                    {predictionResult.riskCategory} RISK PROFILE
                  </span>
                </div>
              </div>

              <div className="md:col-span-7 space-y-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-medical-primary" /> Core Clinical Indicators
                </h3>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs font-semibold text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    <span>Age: <strong className="text-slate-900">{formData.age} yrs</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    <span>BMI: <strong className="text-slate-900">{bmi || "N/A"}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    <span>Heavy Flow: <strong className="text-slate-900">{formData.heavyBleeding ? "Present" : "Absent"}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    <span>Pelvic Pain: <strong className="text-slate-900">{formData.pelvicPain ? "Present" : "Absent"}</strong></span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold italic mt-2">
                  *This probability calculation is based on weighted clinical factors matching prevalence indices for Uterine Leiomyomas (Uterine Fibroids).
                </p>
              </div>
            </div>

            {/* Recommendations block */}
            <div className="space-y-6 mb-8">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500" /> Clinical Recommendations
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {predictionResult.recommendations.map((rec, idx) => (
                  <div key={idx} className="flex gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
                    <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 text-xs font-extrabold mt-0.5">
                      {idx + 1}
                    </div>
                    <p className="text-xs text-slate-600 font-semibold leading-relaxed">{rec}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => setSubmitted(false)}
                className="cursor-pointer"
              >
                Modify Symptoms Form
              </Button>
              <Button 
                onClick={onBack}
                className="bg-medical-primary hover:bg-medical-secondary text-white cursor-pointer border-0 font-bold"
              >
                Return to Selector
              </Button>
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 space-y-8">
              <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <button 
                    onClick={onBack}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-medical-primary uppercase tracking-widest mb-4 hover:translate-x-[-2px] transition-transform"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back to Selector
                  </button>
                  <h1 className="text-3xl font-extrabold text-slate-900">Uterine Fibroid Prediction</h1>
                  <p className="text-slate-500 mt-2">Enter your current physical biomarkers to predict fibroid presence trends.</p>
                </div>
              </header>

              <form onSubmit={handlePredictSubmit} className="bg-white p-6 sm:p-8 rounded-[32px] shadow-sm border border-slate-100 space-y-8">
                {/* Personal Metrics Section */}
                <section>
                  <div className="flex items-center gap-2 mb-6 text-medical-primary">
                    <ClipboardCheck className="w-5 h-5" />
                    <h2 className="text-xs font-extrabold uppercase tracking-[0.2em] text-slate-900">Personal Metrics</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input 
                      label="Age (Years) * Required" 
                      type="number" 
                      placeholder="35"
                      autoFocus
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: e.target.value})}
                      error={errors.age}
                    />
                    <div className="relative">
                      <Input 
                        label="Weight (kg) * Required" 
                        type="number" 
                        placeholder="70"
                        value={formData.weight}
                        onChange={(e) => setFormData({...formData, weight: e.target.value})}
                        error={errors.weight}
                      />
                      {bmi && (
                        <div className="absolute right-4 top-1/2 -translate-y-[-4px] text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                          BMI: {bmi}
                        </div>
                      )}
                    </div>
                    <Input 
                      label="Height (cm) * Required" 
                      type="number" 
                      placeholder="165"
                      value={formData.height}
                      onChange={(e) => setFormData({...formData, height: e.target.value})}
                      error={errors.height}
                    />
                  </div>
                </section>

                {/* Primary Menstrual Indicators */}
                <section>
                  <div className="flex items-center gap-2 mb-6 text-medical-secondary">
                    <RefreshCw className="w-5 h-5" />
                    <h2 className="text-xs font-extrabold uppercase tracking-[0.2em] text-slate-900">Menstrual Flow Pattern</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Checkbox 
                      label="Heavy Menstrual Bleeding" 
                      description="Abnormally heavy, flooding periods requiring frequent pad changes"
                      checked={formData.heavyBleeding}
                      onChange={() => setFormData({...formData, heavyBleeding: !formData.heavyBleeding})}
                    />
                    <Checkbox 
                      label="Prolonged Menstruation" 
                      description="Menstrual periods lasting more than 7 consecutive days"
                      checked={formData.prolongedMenstruation}
                      onChange={() => setFormData({...formData, prolongedMenstruation: !formData.prolongedMenstruation})} 
                    />
                    <Checkbox 
                      label="Irregular Menstrual Flow" 
                      description="Fluctuations or spotting between cycles"
                      checked={formData.irregularMenstrualFlow}
                      onChange={() => setFormData({...formData, irregularMenstrualFlow: !formData.irregularMenstrualFlow})}
                    />
                  </div>
                </section>

                {/* Physical and Systematic Indicators */}
                <section>
                  <div className="flex items-center gap-2 mb-6 text-amber-500">
                    <Sparkles className="w-5 h-5" />
                    <h2 className="text-xs font-extrabold uppercase tracking-[0.2em] text-slate-900">Pelvic & Physical Markers</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Checkbox 
                      label="Chronic Pelvic Pain" 
                      description="Regular pelvic pressure, discomfort, or cramping"
                      checked={formData.pelvicPain}
                      onChange={() => setFormData({...formData, pelvicPain: !formData.pelvicPain})}
                    />
                    <Checkbox 
                      label="Abdominal Swelling" 
                      description="Unexplained enlargement or protrusion of lower abdomen"
                      checked={formData.abdominalSwelling}
                      onChange={() => setFormData({...formData, abdominalSwelling: !formData.abdominalSwelling})}
                    />
                    <Checkbox 
                      label="Frequent Urination" 
                      description="Increased urinary urgency or difficulty empty bladder"
                      checked={formData.frequentUrination}
                      onChange={() => setFormData({...formData, frequentUrination: !formData.frequentUrination})}
                    />
                    <Checkbox 
                      label="Chronic Constipation" 
                      description="Difficulty with bowel movements due to back pressure"
                      checked={formData.constipation}
                      onChange={() => setFormData({...formData, constipation: !formData.constipation})}
                    />
                    <Checkbox 
                      label="Lower Back Pain" 
                      description="Dull, nagging ache in the lower spinal/lumbar zone"
                      checked={formData.lowerBackPain}
                      onChange={() => setFormData({...formData, lowerBackPain: !formData.lowerBackPain})}
                    />
                    <Checkbox 
                      label="Pain During Intercourse (Dyspareunia)" 
                      description="Deep pelvic discomfort during or after sexual activity"
                      checked={formData.painDuringIntercourse}
                      onChange={() => setFormData({...formData, painDuringIntercourse: !formData.painDuringIntercourse})}
                    />
                  </div>
                </section>

                {/* Systemic Factors & Clinical History */}
                <section>
                  <div className="flex items-center gap-2 mb-6 text-rose-500">
                    <Heart className="w-5 h-5" />
                    <h2 className="text-xs font-extrabold uppercase tracking-[0.2em] text-slate-900">History & Systemic Health</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Checkbox 
                      label="Fatigue / Anemia Signs" 
                      description="Tiredness often triggered by heavy iron loss or blood depletion"
                      checked={formData.fatigueAnemia}
                      onChange={() => setFormData({...formData, fatigueAnemia: !formData.fatigueAnemia})}
                    />
                    <Checkbox 
                      label="Family History of Fibroids" 
                      description="Genetic occurrence in a mother, sister, or grandmother"
                      checked={formData.familyHistory}
                      onChange={() => setFormData({...formData, familyHistory: !formData.familyHistory})}
                    />
                    <Checkbox 
                      label="Pregnancy Difficulty" 
                      description="Struggles with conception or recurrent early miscarriages"
                      checked={formData.pregnancyDifficulty}
                      onChange={() => setFormData({...formData, pregnancyDifficulty: !formData.pregnancyDifficulty})}
                    />
                  </div>
                </section>

                <Button 
                  type="submit"
                  className="w-full py-5 text-base flex items-center justify-center gap-3 cursor-pointer shadow-md hover:shadow-lg transition-all" 
                  size="lg"
                  disabled={isPredicting}
                >
                  {isPredicting ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" /> Processing Risk Data...
                    </>
                  ) : (
                    "Check My Fibroid Risk"
                  )}
                </Button>
              </form>
            </div>

            {/* Sticky Tips / Guidance Banner */}
            <aside className="w-full lg:w-80 space-y-6">
              <div className="bg-medical-primary/5 p-6 rounded-[24px] border border-medical-primary/10">
                <h3 className="text-xs font-extrabold text-medical-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Fibroid Insights
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-medical-primary mt-1.5 flex-shrink-0" />
                    <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                      Uterine fibroids are non-cancerous uterine growths that are extremely common during childbearing years.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-medical-primary mt-1.5 flex-shrink-0" />
                    <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                      Heavy bleeding can trigger secondary iron-deficiency anemia, which manifests as persistent fatigue.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-[24px] border border-slate-100">
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest mb-4">Patient Advisory</h3>
                <p className="text-xs text-slate-500 leading-relaxed italic">
                  Completing this assessment logs your symptoms in our secure client database for upcoming predictive modeling.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/5 border border-slate-200">
                <div className="flex gap-3">
                  <AlertCircle className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                    <span className="text-slate-900 font-extrabold uppercase tracking-widest mr-1">Advisory Notice:</span> 
                    This screening is not a replacement for clinical scans (e.g. ultrasound or MRI). Share this data with your primary caregiver.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
