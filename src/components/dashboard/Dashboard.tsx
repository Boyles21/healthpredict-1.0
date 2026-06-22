import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Activity, LogOut, User, ClipboardCheck, Sparkles, AlertCircle, RefreshCw, PieChart, X, FileUp, CheckCircle2, TrendingUp, FileText, Download, Import } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { jsPDF } from "jspdf";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Checkbox from "../ui/Checkbox";

import { useAuth } from "../../contexts/AuthContext";
import { db, handleFirestoreError, OperationType } from "../../lib/firebase";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";

interface DashboardProps {
  userProfile: {
    fullName: string;
    email: string;
    location: string;
    ethnicity: string;
    bloodType: string;
    allergies: string;
    chronicConditions: string;
    medications: string;
  };
  onLogout: () => void;
  onGoToProfile: () => void;
}

export default function Dashboard({ userProfile, onLogout, onGoToProfile }: DashboardProps) {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    age: "",
    weight: "",
    height: "",
    cycleLength: "",
    cycleRegularity: "regular",
    weightGain: false,
    hairGrowth: false,
    hairLoss: false,
    pimples: false,
    skinDarkening: false,
    fastFood: false,
    regularExercise: true,
    pelvicPain: false,
    fatigue: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [bmi, setBmi] = useState<number | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [prediction, setPrediction] = useState<{
    status: string;
    description: string;
    likelihood: number;
    color: string;
    prediction?: string;
    dataUsed?: any;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [serverStatus, setServerStatus] = useState<"checking" | "online" | "offline">("checking");
  const [modelStatus, setModelStatus] = useState<boolean>(false);
  
  // Real Firestore History state
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  // Migration from localStorage state
  const [migrationAvailable, setMigrationAvailable] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);

  // Validate form inputs
  const validate = () => {
    const newErrors: Record<string, string> = {};
    const age = parseInt(formData.age);
    if (isNaN(age) || age < 12 || age > 60) newErrors.age = "Age must be between 12 and 60";
    
    const weight = parseFloat(formData.weight);
    if (isNaN(weight) || weight < 30 || weight > 200) newErrors.weight = "Enter a valid weight (30-200kg)";
    
    const height = parseFloat(formData.height);
    if (isNaN(height) || height < 100 || height > 220) newErrors.height = "Enter a valid height (100-220cm)";
    
    const cycleLength = parseInt(formData.cycleLength);
    if (isNaN(cycleLength) || cycleLength < 2 || cycleLength > 15) newErrors.cycleLength = "Enter typical flow length (2-15 days)";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const prepareMLPayload = () => {
    return {
      age: parseInt(formData.age),
      weight: parseFloat(formData.weight),
      height: parseFloat(formData.height),
      cycleRegularity: formData.cycleRegularity === "irregular" ? "irregular" : "regular",
      cycleLength: parseInt(formData.cycleLength),
      weightGain: formData.weightGain ? "yes" : "no",
      hairGrowth: formData.hairGrowth ? "yes" : "no",
      hairLoss: formData.hairLoss ? "yes" : "no",
      pimples: formData.pimples ? "yes" : "no",
      skinDarkening: formData.skinDarkening ? "yes" : "no",
      fastFood: formData.fastFood ? "yes" : "no",
      regularExercise: formData.regularExercise ? "yes" : "no",
    };
  };

  // Check backend server status
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
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  // BMI calculation logic
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

  // Load History from Firestore
  const fetchHistory = async () => {
    if (!user) return;
    setHistoryLoading(true);
    try {
      const q = query(
        collection(db, "assessments"),
        where("uid", "==", user.uid)
      );
      const querySnapshot = await getDocs(q);
      const list = querySnapshot.docs.map(doc => {
        const data = doc.data();
        let dateStr = new Date().toISOString().split("T")[0];
        if (data.createdAt) {
          try {
            dateStr = data.createdAt.toDate().toISOString().split("T")[0];
          } catch (e) {
            // Fallback if timestamp form differs
            dateStr = new Date(data.createdAt).toISOString().split("T")[0];
          }
        }
        return {
          id: doc.id,
          ...data,
          date: dateStr,
          likelihood: data.predictionPercentage
        };
      });

      // Sort client-side by date / creation order descending
      list.sort((a: any, b: any) => {
        const t1 = a.createdAt?.seconds || 0;
        const t2 = b.createdAt?.seconds || 0;
        return t2 - t1;
      });

      setHistory(list);
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `assessments`);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  // Check for device-level history to migrate
  useEffect(() => {
    const saved = localStorage.getItem("health_predict_history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMigrationAvailable(true);
        }
      } catch (e) {
        console.error("Local history check failed:", e);
      }
    }
  }, []);

  // Handle migration from localStorage to Firestore
  const handleMigrateHistory = async () => {
    if (!user) return;
    setIsMigrating(true);
    try {
      const saved = localStorage.getItem("health_predict_history");
      if (!saved) return;
      const parsed = JSON.parse(saved);
      
      for (const item of parsed) {
        // Construct basic placeholder inputs matching required assessments schema
        const profile = getRiskProfile(item.likelihood || 15);
        const recStrings = profile.recommendations.map(r => r.text);

        const assessmentDoc = {
          uid: user.uid,
          age: 25, // default fallbacks for imported simple histories
          weight: 60,
          height: 160,
          cycleRegularity: "regular",
          cycleLength: 5,
          weightGain: false,
          hairGrowth: false,
          hairLoss: false,
          acne: false,
          skinDarkening: false,
          fastFood: false,
          exercise: true,
          pelvicPain: false,
          fatigue: false,
          predictionPercentage: item.likelihood || 15,
          riskCategory: profile.themeKey.toUpperCase(),
          recommendations: recStrings,
          createdAt: serverTimestamp() // timestamp mapping
        };

        try {
          await addDoc(collection(db, "assessments"), assessmentDoc);
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, "assessments");
        }
      }

      // Successful migration: remove old browser local data
      localStorage.removeItem("health_predict_history");
      setMigrationAvailable(false);
      alert("Success! Your offline health assessments have been securely imported back into your Cloud Profile.");
      await fetchHistory();
    } catch (e) {
      console.error("Migration fatal error:", e);
      alert("Local history migration failed. Please try again.");
    } finally {
      setIsMigrating(false);
    }
  };

  const handleExportPDF = () => {
    if (!prediction) return;
    const { likelihood, status, description } = prediction;
    const profile = getRiskProfile(likelihood);
    
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42); 
    doc.text("HealthPredict Analysis Report", 20, 30);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); 
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 38);
    doc.text(`Patient Name: ${userProfile.fullName}`, 20, 43);
    
    // Separator
    doc.setDrawColor(241, 245, 249);
    doc.line(20, 50, 190, 50);
    
    // Result Section
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text("Assessment Results", 20, 65);
    
    doc.setFontSize(32);
    if (likelihood > 65) doc.setTextColor(225, 29, 72); 
    else if (likelihood >= 36) doc.setTextColor(217, 119, 6); 
    else doc.setTextColor(5, 150, 105); 
    
    doc.text(`${likelihood}%`, 20, 80);
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(`Status: ${status}`, 20, 90);
    
    // Description
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105); 
    const splitDescription = doc.splitTextToSize(description, 170);
    doc.text(splitDescription, 20, 100);
    
    // Recommendations
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text("Key Recommendations", 20, 125);
    
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    profile.recommendations.forEach((rec, index) => {
      doc.text(`• ${rec.text}`, 25, 135 + (index * 8));
    });
    
    // Data Used
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text("Data Provided for Analysis", 20, 175);
    
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    const dataPoints = [
      `Age: ${formData.age} years`,
      `BMI: ${bmi || "N/A"}`,
      `Cycle Regularity: ${formData.cycleRegularity}`,
      `Cycle Flow: ${formData.cycleLength} days`,
      `Weight Gain: ${formData.weightGain ? "Yes" : "No"}`,
      `Hair Growth: ${formData.hairGrowth ? "Yes" : "No"}`,
      `Hair Loss: ${formData.hairLoss ? "Yes" : "No"}`,
      `Pimples/Acne: ${formData.pimples ? "Yes" : "No"}`,
      `Skin Darkening: ${formData.skinDarkening ? "Yes" : "No"}`,
      `Fast Food Habits: ${formData.fastFood ? "Yes" : "No"}`,
      `Regular Exercise: ${formData.regularExercise ? "Yes" : "No"}`,
      `Pelvic Pain: ${formData.pelvicPain ? "Yes" : "No"}`,
      `Fatigue: ${formData.fatigue ? "Yes" : "No"}`,
    ];
    
    dataPoints.forEach((point, index) => {
      const col = index % 2 === 0 ? 20 : 100;
      const row = 185 + (Math.floor(index / 2) * 6);
      doc.text(point, col, row);
    });
    
    // Disclaimer
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); 
    const disclaimer = "Medical Disclaimer: This report is an AI-assisted prediction and NOT a clinical diagnosis. Please consult a qualified gynecologist or healthcare professional for a complete clinical workup.";
    const splitDisclaimer = doc.splitTextToSize(disclaimer, 170);
    doc.text(splitDisclaimer, 20, 275);
    
    doc.save(`HealthPredict_Report_${userProfile.fullName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const handleExportCSV = () => {
    if (!prediction) return;
    const { likelihood, status, description } = prediction;
    
    const rows = [
      ["Metric", "Value"],
      ["Patient Name", userProfile.fullName],
      ["Report Date", new Date().toLocaleString()],
      ["PCOS Risk Likelihood", `${likelihood}%`],
      ["Risk Status", status],
      ["AI Description", description],
      ["", ""],
      ["Analyzed Health Markers", ""],
      ["Age", formData.age],
      ["BMI", bmi || "N/A"],
      ["Cycle Regularity", formData.cycleRegularity],
      ["Cycle Length", formData.cycleLength],
      ["Weight Gain", formData.weightGain ? "Yes" : "No"],
      ["Hair Growth", formData.hairGrowth ? "Yes" : "No"],
      ["Hair Loss", formData.hairLoss ? "Yes" : "No"],
      ["Pimples", formData.pimples ? "Yes" : "No"],
      ["Skin Darkening", formData.skinDarkening ? "Yes" : "No"],
      ["Fast Food Intake", formData.fastFood ? "Yes" : "No"],
      ["Exercise Habits", formData.regularExercise ? "Yes" : "No"],
      ["Pelvic Pain", formData.pelvicPain ? "Yes" : "No"],
      ["Fatigue", formData.fatigue ? "Yes" : "No"],
    ];

    const csvContent = "data:text/csv;charset=utf-8," 
      + rows.map(e => e.map(cell => `"${cell}"`).join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `HealthPredict_Data_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const HistorySection = () => {
    if (historyLoading) {
      return (
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest py-4">
          <RefreshCw className="w-4 h-4 animate-spin text-medical-primary" /> Syncing Cloud Database...
        </div>
      );
    }

    return (
      <section className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-slate-400" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-[0.2em]">Prediction History</h2>
          </div>
          <div className="flex items-center gap-2">
            {migrationAvailable && (
              <Button 
                onClick={handleMigrateHistory}
                disabled={isMigrating}
                variant="custom"
                className="py-1.5 px-3 text-[10px] uppercase font-black bg-amber-100/60 text-amber-800 hover:bg-amber-100 border border-amber-200/50 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Import className="w-3.5 h-3.5" />
                {isMigrating ? "Syncing..." : "Migrate Local Data"}
              </Button>
            )}
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded">
              {history.length} Cloud Analysed
            </span>
          </div>
        </div>

        {history.length === 0 && (
          <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-6">
            <p className="text-sm text-slate-400 italic font-medium">No previous assessments detected on this account. Complete your first assessment above to sync with the cloud.</p>
          </div>
        )}

        {/* Trend Chart */}
        {history.length > 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Risk Trend Analysis</h3>
                <p className="text-[10px] text-slate-400 font-medium italic">Likelihood tracking over time</p>
              </div>
            </div>

            <div className="h-48 w-full font-sans">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart 
                  data={[...history].reverse().map(item => ({
                    date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                    risk: item.likelihood
                  }))}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 600 }}
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: "16px", 
                      border: "none", 
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                      fontSize: "11px",
                      fontWeight: "bold",
                      padding: "8px 12px"
                    }}
                    itemStyle={{ color: "#0ea5e9" }}
                    cursor={{ stroke: "#0ea5e9", strokeWidth: 2, strokeDasharray: "4 4" }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="risk" 
                    stroke="#0ea5e9" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorRisk)" 
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
        
        <div className="space-y-3">
          {history.map((item: any) => {
            const profile = getRiskProfile(item.likelihood);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-medical-primary/20 transition-all hover:shadow-md animate-fade-in"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm ${profile.theme.bgLight} ${profile.theme.text}`}>
                    {item.likelihood}%
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{profile.status}</h4>
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                      {new Date(item.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${profile.theme.bgLight} ${profile.theme.text}`}>
                    {profile.badge}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    );
  };

  const handlePredict = async () => {
    if (!user) return;
    if (!validate()) return;

    const payload = prepareMLPayload();
    console.log(">>> [FRONTEND] Processed ML Payload:", payload);
    setIsPredicting(true);
    setPrediction(null);
    setUploadSuccess(false);
    
    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log(">>> [FRONTEND] API Response Status:", response.status);

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error(">>> [FRONTEND] Server returned non-JSON:", text.substring(0, 1000));
        throw new Error("Server returned non-JSON output.");
      }
      
      if (!response.ok || data.status === "error") {
        throw new Error(data.message || "Server analysis error");
      }

      // Save Assessment to Firestore Database (Phase 6 Integration)
      const profileInfo = getRiskProfile(data.likelihood);
      const recStrings = profileInfo.recommendations.map(r => r.text);

      const assessmentDoc = {
        uid: user.uid,
        age: parseInt(formData.age),
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height),
        cycleRegularity: formData.cycleRegularity,
        cycleLength: parseInt(formData.cycleLength),
        weightGain: formData.weightGain,
        hairGrowth: formData.hairGrowth,
        hairLoss: formData.hairLoss,
        acne: formData.pimples,
        skinDarkening: formData.skinDarkening,
        fastFood: formData.fastFood,
        exercise: formData.regularExercise,
        pelvicPain: formData.pelvicPain,
        fatigue: formData.fatigue,
        predictionPercentage: data.likelihood,
        riskCategory: profileInfo.themeKey.toUpperCase(),
        recommendations: recStrings,
        createdAt: serverTimestamp()
      };

      try {
        await addDoc(collection(db, "assessments"), assessmentDoc);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, "assessments");
      }
      
      setPrediction(data);
      // Refresh user's saved list from the cloud
      await fetchHistory();
    } catch (error: any) {
      console.error("Prediction failed:", error);
      alert(error.message || "Analysis engine encountered an error. Please check your connection.");
    } finally {
      setIsPredicting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setIsPredicting(true);
    setPrediction(null);
    setUploadSuccess(false);

    const data = new FormData();
    data.append("file", file);

    try {
      const response = await fetch("/api/predict-excel", {
        method: "POST",
        body: data,
      });

      console.log(">>> [FRONTEND] Excel Upload Status:", response.status);

      let result;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
      } else {
        const text = await response.text();
        console.error(">>> [FRONTEND] Excel upload returned non-JSON:", text.substring(0, 1000));
        throw new Error("Server returned non-JSON processing results.");
      }

      if (result.status === "error") throw new Error(result.message);

      // Save Assessment to Firestore (Phase 6 Integration)
      const profileInfo = getRiskProfile(result.likelihood);
      const recStrings = profileInfo.recommendations.map(r => r.text);

      const resolvedData = result.dataUsed || {};

      const assessmentDoc = {
        uid: user.uid,
        age: parseInt(resolvedData.age || resolvedData["Age (yrs)"] || formData.age || "25"),
        weight: parseFloat(resolvedData.weight || resolvedData["Weight (Kg)"] || formData.weight || "60"),
        height: parseFloat(resolvedData.height || resolvedData["Height(Cm)"] || formData.height || "160"),
        cycleRegularity: resolvedData.cycleRegularity || (resolvedData["Cycle(R/I)"] === 4 ? "irregular" : "regular"),
        cycleLength: parseInt(resolvedData.cycleLength || resolvedData["Cycle length(days)"] || formData.cycleLength || "5"),
        weightGain: resolvedData.weightGain || resolvedData["Weight gain(Y/N)"] === "yes" || false,
        hairGrowth: resolvedData.hairGrowth || resolvedData["hair growth(Y/N)"] === "yes" || false,
        hairLoss: resolvedData.hairLoss || resolvedData["Hair loss(Y/N)"] === "yes" || false,
        acne: resolvedData.pimples || resolvedData["Pimples(Y/N)"] === "yes" || false,
        skinDarkening: resolvedData.skinDarkening || resolvedData["Skin darkening(Y/N)"] === "yes" || false,
        fastFood: resolvedData.fastFood || resolvedData["Fast food (Y/N)"] === "yes" || false,
        exercise: resolvedData.regularExercise || resolvedData["Reg.Exercise(Y/N)"] === "yes" || true,
        pelvicPain: resolvedData.pelvicPain || false,
        fatigue: resolvedData.fatigue || false,
        predictionPercentage: result.likelihood,
        riskCategory: profileInfo.themeKey.toUpperCase(),
        recommendations: recStrings,
        createdAt: serverTimestamp()
      };

      try {
        await addDoc(collection(db, "assessments"), assessmentDoc);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, "assessments");
      }

      setPrediction(result);
      setUploadSuccess(true);
      
      // Update form fields for transparency
      if (result.dataUsed) {
        const u = result.dataUsed;
        const normalizedRegularity = (u["Cycle(R/I)"] === 4) ? "irregular" : "regular";
        setFormData(prev => ({
          ...prev,
          age: (u.age || u["Age (yrs)"])?.toString() || prev.age,
          weight: (u.weight || u["Weight (Kg)"])?.toString() || prev.weight,
          height: (u.height || u["Height(Cm)"])?.toString() || prev.height,
          cycleLength: (u.cycleLength || u["Cycle length(days)"])?.toString() || prev.cycleLength,
          cycleRegularity: u.cycleRegularity || normalizedRegularity || prev.cycleRegularity,
          weightGain: u.weightGain || u["Weight gain(Y/N)"] === "yes" || prev.weightGain,
          hairGrowth: u.hairGrowth || u["hair growth(Y/N)"] === "yes" || prev.hairGrowth,
          hairLoss: u.hairLoss || u["Hair loss(Y/N)"] === "yes" || prev.hairLoss,
          pimples: u.pimples || u["Pimples(Y/N)"] === "yes" || prev.pimples,
          skinDarkening: u.skinDarkening || u["Skin darkening(Y/N)"] === "yes" || prev.skinDarkening,
          fastFood: u.fastFood || u["Fast food (Y/N)"] === "yes" || prev.fastFood,
          regularExercise: u.regularExercise || u["Reg.Exercise(Y/N)"] === "yes" || prev.regularExercise,
        }));
      }

      // Refresh assessments list
      await fetchHistory();

    } catch (error) {
      console.error("File upload prediction failed:", error);
      alert("Failed to process Excel file. Please ensure it follows the correct format.");
    } finally {
      setIsUploading(false);
      setIsPredicting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Centralized Risk Classification Utility
  const getRiskProfile = (percentage: number) => {
    const risk = percentage;
    let category: "LOW" | "MODERATE" | "HIGH" = "LOW";
    
    if (risk > 65) category = "HIGH";
    else if (risk >= 36) category = "MODERATE";
    else category = "LOW";

    const profiles = {
      LOW: {
        themeKey: "emerald" as const,
        status: "Low Risk Detected",
        badge: "Low Risk Profile",
        description: "Your health metrics currently show minimal correlation with major PCOS indicators.",
        colorClass: "text-emerald-600 bg-emerald-50",
         recommendations: [
          { icon: CheckCircle2, text: "Maintain a healthy balanced lifestyle.", urgent: false },
          { icon: Activity, text: "Continue routine menstrual cycle monitoring.", urgent: false },
          { icon: Sparkles, text: "Keep up with routine preventative medical checkups.", urgent: false },
        ]
      },
      MODERATE: {
        themeKey: "amber" as const,
        status: "Moderate Risk Detected",
        badge: "Moderate Risk Profile",
        description: "Some hormonal and menstrual indicators associated with PCOS were detected. Further monitoring is recommended.",
        colorClass: "text-amber-600 bg-amber-50",
        recommendations: [
          { icon: RefreshCw, text: "Closely track any menstrual irregularities.", urgent: false },
          { icon: Activity, text: "Improve diet and maintain consistent exercise.", urgent: false },
          { icon: ClipboardCheck, text: "Consider a preventative hormonal evaluation.", urgent: false },
          { icon: AlertCircle, text: "Consult a healthcare professional if symptoms persist.", urgent: true },
        ]
      },
      HIGH: {
        themeKey: "rose" as const,
        status: "High Risk Detected",
        badge: "High Risk Profile",
        description: "Multiple significant PCOS-related indicators were detected. Clinical evaluation is strongly recommended.",
        colorClass: "text-rose-600 bg-rose-50",
        recommendations: [
          { icon: User, text: "Recommended: Immediate consultation with a Gynecologist.", urgent: true },
          { icon: Activity, text: "Suggest complete hormonal and ultrasound evaluation.", urgent: true },
          { icon: AlertCircle, text: "Encourage medical follow-up for official diagnosis.", urgent: true },
          { icon: Sparkles, text: "Strictly monitor all detected metabolic symptoms.", urgent: false },
        ]
      }
    };

    const profile = profiles[category];

    const themeStyles = {
      emerald: {
        bg: "bg-emerald-500",
        text: "text-emerald-600",
        bgLight: "bg-emerald-50",
        border: "border-emerald-100",
        lightText: "text-emerald-700",
        stroke: "stroke-emerald-500"
      },
      amber: {
        bg: "bg-amber-500",
        text: "text-amber-600",
        bgLight: "bg-amber-50",
        border: "border-amber-100",
        lightText: "text-amber-700",
        stroke: "stroke-amber-500"
      },
      rose: {
        bg: "bg-rose-500",
        text: "text-rose-600",
        bgLight: "bg-rose-50",
        border: "border-rose-100",
        lightText: "text-rose-700",
        stroke: "stroke-rose-500"
      }
    };

    const theme = themeStyles[profile.themeKey];

    return { ...profile, theme, risk };
  };

  // Prediction results visual components
  const PredictionView = () => {
    if (!prediction) return null;

    const { theme, risk, status, badge, description, recommendations, themeKey } = getRiskProfile(prediction.likelihood);

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-8 pb-20"
      >
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => setPrediction(null)}
            className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            New Assessment
          </Button>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={handleExportPDF}
              className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              Export PDF
            </Button>
            <Button 
              variant="outline" 
              onClick={handleExportCSV}
              className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              CSV
            </Button>
          </div>
        </div>

        {/* Main Result Card */}
        <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
          <div className={`h-2 ${theme.bg}`} />
          <div className="p-8 sm:p-12">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              {/* Circular Chart */}
              <div className="relative w-48 h-48 sm:w-64 sm:h-64 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90 text-slate-50">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="45%"
                    className="fill-none stroke-current stroke-[8px]"
                  />
                  <motion.circle
                    cx="50%"
                    cy="50%"
                    r="45%"
                    initial={{ strokeDasharray: "0 1000" }}
                    animate={{ strokeDasharray: `${risk * 2.82} 1000` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className={`fill-none ${theme.stroke} stroke-[8px] stroke-round`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className={`text-4xl sm:text-6xl font-black ${theme.text} tabular-nums`}>{risk}%</span>
                  <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">AI Confidence</span>
                </div>
              </div>

              {/* Summary Text */}
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-100 mb-6">
                  <div className={`w-2 h-2 rounded-full ${theme.bg} animate-pulse`} />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Medical Intelligence Scan</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">{status}</h2>
                <div className={`inline-block px-4 py-1 rounded-lg font-bold text-sm mb-6 ${theme.bgLight} ${theme.text}`}>
                  {badge}
                </div>
                <p className="text-slate-500 leading-relaxed text-lg italic tracking-tight">
                  "{description}"
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Assessment Breakdown */}
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-medical-primary" />
              Markers Detected
            </h3>
            <div className="space-y-3">
              {[
                { label: "Cycle Flow Regularity", value: formData.cycleRegularity === "irregular" ? "Irregular Patterns" : "Regular Intervals", active: formData.cycleRegularity === "irregular" },
                { label: "Weight Dynamics", value: "Unexplained Gain", active: formData.weightGain },
                { label: "Hirsutism Signs", value: "Excess Hair Growth", active: formData.hairGrowth },
                { label: "Acne Flareups", value: "Skin Breakouts", active: formData.pimples },
                { label: "Dermal Melasma", value: "Darkening Patches", active: formData.skinDarkening },
                { label: "Pelvic Tendency", value: "Lower Chronic Pain", active: formData.pelvicPain },
                { label: "Energy Index", value: "Persistent Fatigue", active: formData.fatigue },
              ].map((item, idx) => (
                <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border ${item.active ? "bg-rose-50 border-rose-100 text-rose-700 font-semibold" : "bg-slate-50 border-slate-200 text-slate-600 font-semibold"}`}>
                  <span className="text-xs font-bold uppercase">{item.label}</span>
                  <span className="text-xs font-medium">{item.active ? item.value : "Normal"}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-slate-900 text-white p-8 rounded-[32px] shadow-sm border border-slate-800">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-400" />
              Recommendations
            </h3>
            <ul className="space-y-4 font-sans">
              {recommendations.map((rec, idx) => {
                const IconComp = rec.icon;
                return (
                  <li key={idx} className="flex gap-3 items-start">
                    <IconComp className={`w-5 h-5 flex-shrink-0 ${rec.urgent ? (themeKey === "rose" ? "text-rose-400" : "text-amber-400") : "text-teal-400"}`} />
                    <p className="text-sm text-slate-300 leading-snug">{rec.text}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-dotted border-slate-200">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-slate-400 flex-shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Medical Disclaimer</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                This system is an AI-assisted prediction tool and not a medical diagnosis. The result is generated based on a machine learning model trained on clinical datasets. Final confirmation requires clinical testing and professional evaluation by a qualified medical practitioner.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Dashboard Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-medical-primary rounded-lg flex items-center justify-center text-white">
              <Activity className="w-5 h-5 stroke-[2.5]" />
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

      <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {isPredicting ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[60vh] text-center"
            >
              <div className="relative w-24 h-24 mb-6">
                <div className="absolute inset-0 border-4 border-medical-primary/10 rounded-full" />
                <div className="absolute inset-0 border-4 border-medical-primary border-t-transparent rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Activity className="w-8 h-8 text-medical-primary animate-pulse" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Analyzing Health Markers</h2>
              <p className="text-slate-500 max-w-xs mx-auto">Our AI is processing your clinical indicators against our medical database...</p>
            </motion.div>
          ) : prediction ? (
            <div className="space-y-12">
              <PredictionView key="results" />
              
              <div className="max-w-4xl mx-auto pt-12 border-t border-slate-100">
                <HistorySection />
              </div>
            </div>
          ) : (
            <div key="form" className="flex flex-col lg:flex-row gap-8">
              {/* Left Column: Form */}
              <div className="flex-1 space-y-8">
                <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900">{userProfile.fullName}'s Health Assessment</h1>
                    <p className="text-slate-500 mt-2">Enter your current health details for a precision AI prediction.</p>
                  </div>
                  
                  {/* Excel Upload Trigger */}
                  <div className="flex-shrink-0">
                    <input 
                      type="file" 
                      accept=".xlsx, .xls" 
                      className="hidden" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                    />
                    <Button 
                      variant="outline" 
                      className="rounded-2xl flex items-center gap-2 h-12 px-6 border-medical-primary/20 hover:bg-medical-primary/5 text-medical-primary font-bold transition-all cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <FileUp className="w-4 h-4" />
                      )}
                      {isUploading ? "Uploading..." : "Upload Health Excel"}
                    </Button>
                  </div>
                </header>

                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-6 sm:p-8 rounded-[32px] shadow-sm border border-slate-100"
                >
                  <div className="space-y-8">
                {/* Personal Data Section */}
                <section>
                  <div className="flex items-center gap-2 mb-6">
                    <ClipboardCheck className="w-5 h-5 text-medical-primary" />
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-[0.2em]">Personal Metrics</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input 
                      label="Age (Years)" 
                      type="number" 
                      placeholder="25"
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: e.target.value})}
                      error={errors.age}
                    />
                    <div className="relative">
                      <Input 
                        label="Weight (kg)" 
                        type="number" 
                        placeholder="65"
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
                      label="Height (cm)" 
                      type="number" 
                      placeholder="165"
                      value={formData.height}
                      onChange={(e) => setFormData({...formData, height: e.target.value})}
                      error={errors.height}
                    />
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-900 uppercase tracking-widest px-1">Menstrual Cycle Regularity</label>
                      <select 
                        value={formData.cycleRegularity}
                        onChange={(e) => setFormData({...formData, cycleRegularity: e.target.value})}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-medical-primary/10 focus:border-medical-primary transition-all appearance-none"
                      >
                        <option value="regular">Regularly Monthly</option>
                        <option value="irregular">Irregular/Missing/Late</option>
                      </select>
                      <p className="text-[10px] text-slate-400 px-1 italic font-medium">Regular intervals are usually between 21 to 35 days.</p>
                    </div>
                  </div>
                </section>

                {/* Menstrual Details Section */}
                <section>
                  <div className="flex items-center gap-2 mb-6 text-medical-secondary">
                    <RefreshCw className="w-5 h-5" />
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-[0.2em]">Flow & Cycle Characteristics</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input 
                      label="Flow Duration (avg days)" 
                      type="number" 
                      placeholder="5"
                      description="Average number of days your period lasts"
                      value={formData.cycleLength}
                      onChange={(e) => setFormData({...formData, cycleLength: e.target.value})}
                      error={errors.cycleLength}
                    />
                  </div>
                </section>

                {/* Physical Indicators & Profile Mapping */}
                <section>
                  <div className="flex items-center gap-2 mb-6 text-amber-500">
                    <Sparkles className="w-5 h-5" />
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-[0.2em]">Physical & Hormonal Indicators</h2>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Checkbox 
                        label="Unexplained Weight Gain" 
                        description="Difficulty losing weight or rapid increase"
                        checked={formData.weightGain} 
                        onChange={() => setFormData({...formData, weightGain: !formData.weightGain})} 
                      />
                      <Checkbox 
                        label="Excess Facial/Body Hair" 
                        description="Excessive growth on face, chest, or back"
                        checked={formData.hairGrowth} 
                        onChange={() => setFormData({...formData, hairGrowth: !formData.hairGrowth})} 
                      />
                      <Checkbox 
                        label="Persistent Hair Loss" 
                        description="Thinning of scalp hair or excessive fall"
                        checked={formData.hairLoss} 
                        onChange={() => setFormData({...formData, hairLoss: !formData.hairLoss})} 
                      />
                      <Checkbox 
                        label="Severe Acne / Pimples" 
                        description="Frequent breakouts or oily skin"
                        checked={formData.pimples} 
                        onChange={() => setFormData({...formData, pimples: !formData.pimples})} 
                      />
                      <Checkbox 
                        label="Skin Darkening (Acanthosis)" 
                        description="Velvety dark patches on neck or armpits"
                        checked={formData.skinDarkening} 
                        onChange={() => setFormData({...formData, skinDarkening: !formData.skinDarkening})} 
                      />
                      <Checkbox 
                        label="Chronic Pelvic Pain" 
                        description="Regular pain or discomfort in the lower pelvic region"
                        checked={formData.pelvicPain} 
                        onChange={() => setFormData({...formData, pelvicPain: !formData.pelvicPain})} 
                      />
                      <Checkbox 
                        label="Persistent Fatigue" 
                        description="General tiredness, low energy, or chronic exhaustion"
                        checked={formData.fatigue} 
                        onChange={() => setFormData({...formData, fatigue: !formData.fatigue})} 
                      />
                    </div>
                  </div>
                </section>

                {/* Lifestyle Section */}
                <section>
                  <div className="flex items-center gap-2 mb-6 text-emerald-500">
                    <Activity className="w-5 h-5" />
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-[0.2em]">Lifestyle Factors</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Checkbox 
                      label="Frequent Fast Food" 
                      description="Consuming processed foods >3 times/week"
                      checked={formData.fastFood} 
                      onChange={() => setFormData({...formData, fastFood: !formData.fastFood})} 
                    />
                    <Checkbox 
                      label="Regular Exercise" 
                      description="At least 30 mins of activity, 4 days/week"
                      checked={formData.regularExercise} 
                      onChange={() => setFormData({...formData, regularExercise: !formData.regularExercise})} 
                    />
                  </div>
                </section>

                <Button 
                  className="w-full py-5 text-base flex items-center justify-center gap-3 cursor-pointer" 
                  size="lg"
                  onClick={handlePredict}
                  disabled={isPredicting}
                >
                  {isPredicting ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" /> Processing...
                    </>
                  ) : (
                    "Run AI Health Prediction"
                  )}
                </Button>
              </div>
            </motion.div>

            <div className="pt-8">
              <HistorySection />
            </div>
          </div>

          {/* Right Column: Tips & Info */}
          <aside className="w-full lg:w-80 space-y-6">
            <div className="bg-medical-primary/5 p-6 rounded-[24px] border border-medical-primary/10">
              <h3 className="text-sm font-bold text-medical-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                AI Insights
              </h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-medical-primary mt-1.5 flex-shrink-0" />
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">Regular exercise can improve insulin sensitivity and help regulate cycles.</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-medical-primary mt-1.5 flex-shrink-0" />
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">Tracking your BMI helps the AI identify metabolic patterns tied to PCOS.</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[24px] border border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4">Need Help?</h3>
              <p className="text-xs text-slate-500 leading-relaxed italic">
                If you're unsure about any terms, look for the lowercase descriptions under the input fields.
              </p>
            </div>
            
            <div className="p-6 rounded-2xl bg-slate-900/5 border border-slate-200">
              <div className="flex gap-3">
                <AlertCircle className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  <span className="text-slate-900 font-bold uppercase tracking-widest mr-1">Medical Disclaimer:</span> 
                  This tool uses machine learning for risk assessment and information only. It is not a clinical diagnosis. Always consult a physician for official medical evaluations.
                </p>
              </div>
            </div>
          </aside>
        </div>
      )}
    </AnimatePresence>
  </main>
    </div>
  );
}
