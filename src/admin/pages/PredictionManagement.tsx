import React, { useState, useEffect } from "react";
import { 
  Search, 
  Trash2, 
  FileText, 
  Activity, 
  Layers, 
  ChevronRight, 
  Info,
  SlidersHorizontal,
  X,
  AlertCircle,
  Clock,
  ClipboardList,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { db } from "../../lib/firebase";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";

export default function PredictionManagement() {
  const [loading, setLoading] = useState(true);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [usersMap, setUsersMap] = useState<{ [uid: string]: any }>({});
  
  // Filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [diseaseTypeFilter, setDiseaseTypeFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");

  // Selection
  const [selectedAssessment, setSelectedAssessment] = useState<any | null>(null);

  const fetchAssessmentsHistory = async () => {
    try {
      setLoading(true);
      // Fetch assessments
      const assessmentsSnap = await getDocs(collection(db, "assessments"));
      const records = assessmentsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAssessments(records);

      // Fetch users to map patient names
      const usersSnap = await getDocs(collection(db, "users"));
      const uMap: { [uid: string]: any } = {};
      usersSnap.forEach(d => {
        uMap[d.id] = d.data();
      });
      setUsersMap(uMap);
    } catch (err) {
      console.error("Failed to retrieve diagnostics list:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessmentsHistory();
  }, []);

  // Delete records
  const handleDeleteAssessment = async (record: any) => {
    if (!window.confirm(`Warning: Are you sure you want to permanently delete screening record ${record.id}? This clinical process is irreversible.`)) {
      return;
    }

    try {
      const docRef = doc(db, "assessments", record.id);
      await deleteDoc(docRef);
      
      // Update local state proactively
      setAssessments(prev => prev.filter(r => r.id !== record.id));
      if (selectedAssessment?.id === record.id) {
        setSelectedAssessment(null);
      }
    } catch (error) {
      console.error("Failed to delete assessment record:", error);
      alert("Permission denied or database query error.");
    }
  };

  // Filter ledger list
  const filteredAssessments = assessments.filter(rec => {
    const isPcos = rec.diseaseType === "PCOS" || (!rec.isFibroid && rec.diseaseType !== "Fibroid");
    const recType = isPcos ? "PCOS" : "fibroid";
    
    const user = usersMap[rec.uid] || {};
    const textStr = `${user.fullName || ""} ${rec.id || ""} ${rec.uid || ""}`.toLowerCase();
    const queryMatch = textStr.includes(searchQuery.toLowerCase());

    const typeMatch = diseaseTypeFilter === "all" || 
                        (diseaseTypeFilter === "pcos" && isPcos) ||
                        (diseaseTypeFilter === "fibroid" && !isPcos);

    const riskMatch = riskFilter === "all" || 
                        (rec.riskCategory === riskFilter.toUpperCase());

    return queryMatch && typeMatch && riskMatch;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Upper Panel */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Diagnostics Ledger</h1>
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-1">Review diagnostic histories, clinical biomarkers submissions, and delete erroneous entries</p>
      </div>

      {/* Query Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 relative h-4 text-slate-400" />
          <input
            id="screening-search-field"
            type="text"
            placeholder="Search by patient name, ID or system Ref..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50/50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500/80 focus:bg-white transition-all"
          />
        </div>

        <div className="flex gap-3 w-full md:w-auto self-start md:self-center flex-wrap">
          <select
            id="screening-type-filter"
            value={diseaseTypeFilter}
            onChange={(e) => setDiseaseTypeFilter(e.target.value)}
            className="bg-slate-50/50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 focus:outline-none cursor-pointer"
          >
            <option value="all">Conditions: All</option>
            <option value="pcos">PCOS Prediction</option>
            <option value="fibroid">Fibroid Screening</option>
          </select>

          <select
            id="screening-risk-filter"
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-slate-50/50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 focus:outline-none cursor-pointer"
          >
            <option value="all">Risk Level: All</option>
            <option value="low">Low Risk</option>
            <option value="moderate">Moderate Risk</option>
            <option value="high">High Risk</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-500 mb-2" />
          <p className="text-xs font-semibold">Loading diagnostic files ledger...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Records Table list */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xs lg:col-span-7 overflow-hidden">
            <div className="p-5 border-b border-slate-50">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Completed Diagnostic Records</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50 font-bold text-slate-450 uppercase text-[10px] tracking-wider text-left border-b border-slate-100">
                    <th className="py-3 px-5">Patient Details</th>
                    <th className="py-3 px-1">Type</th>
                    <th className="py-3 px-5">Triage State</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredAssessments.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-400 text-xs font-semibold">
                        No screenings match query filters.
                      </td>
                    </tr>
                  ) : (
                    filteredAssessments.map((rec) => {
                      const user = usersMap[rec.uid] || { fullName: "Jane Doe" };
                      const isSelected = selectedAssessment?.id === rec.id;
                      const isPcos = rec.diseaseType === "PCOS" || (!rec.isFibroid && rec.diseaseType !== "Fibroid");
                      const riskColor = rec.riskCategory === "HIGH" ? "text-rose-600 bg-rose-50 border-rose-100" : rec.riskCategory === "MODERATE" ? "text-amber-600 bg-amber-50 border-amber-100" : "text-emerald-600 bg-emerald-50 border-emerald-100";
                      return (
                        <tr 
                          id={`s-row-${rec.id}`}
                          key={rec.id}
                          className={`hover:bg-slate-50/50 transition-colors ${isSelected ? "bg-slate-50/@80" : ""}`}
                        >
                          <td className="py-4 px-5">
                            <span className="block text-xs font-bold text-slate-900 leading-tight truncate max-w-[150px]">{user.fullName || "Jane Doe"}</span>
                            <span className="block text-[8px] font-mono text-slate-400 mt-1 uppercase">ID: {rec.id?.slice(0, 10)}...</span>
                          </td>
                          <td className="py-4 px-1">
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${isPcos ? "bg-teal-50 text-teal-700" : "bg-violet-50 text-violet-700"}`}>
                              {isPcos ? "PCOS" : "FIB"}
                            </span>
                          </td>
                          <td className="py-4 px-5">
                            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${riskColor}`}>
                              {rec.riskCategory || "LOW"} ({rec.predictionPercentage || 10}%)
                            </span>
                          </td>
                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                id={`inspect-s-btn-${rec.id}`}
                                onClick={() => setSelectedAssessment(rec)}
                                className="p-1 px-2 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-slate-400 text-xs font-bold transition-all cursor-pointer"
                              >
                                View File
                              </button>
                              <button
                                id={`delete-s-btn-${rec.id}`}
                                onClick={() => handleDeleteAssessment(rec)}
                                className="p-1 px-1.5 hover:bg-red-50 hover:text-red-500 rounded-lg text-slate-400 transition-all cursor-pointer"
                                title="Delete system entry"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Biomarkers Inspection Panel */}
          <div className="lg:col-span-5 space-y-6">
            {!selectedAssessment ? (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-8 rounded-3xl text-center text-slate-400 space-y-3">
                <ClipboardList className="w-8 h-8 mx-auto text-slate-300" />
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">No screening selected</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-semibold mt-1">Select an active clinical screening row to open biomarkers files, diagnostics logs, and clinician feedback parameters.</p>
                </div>
              </div>
            ) : (
              <div id="screening-inspector-card" className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden animate-fadeIn space-y-6">
                {/* Header */}
                <div className="p-5 border-b border-slate-50 bg-slate-900 text-white flex justify-between items-center">
                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Diagnostic biomarkers</h3>
                    <p className="text-sm font-extrabold mt-1 truncate">ID: {selectedAssessment.id}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedAssessment(null)}
                    className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {/* High level overview widget */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 grid grid-cols-2 gap-4">
                    <div>
                      <span className="block text-slate-400 text-[9px] font-bold uppercase tracking-wider">Patient Name</span>
                      <span className="text-xs font-extrabold text-slate-800 truncate block">{(usersMap[selectedAssessment.uid] || {}).fullName || "Unknown Patient"}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 text-[9px] font-bold uppercase tracking-wider">Triage Level</span>
                      <span className={`text-xs font-extrabold block truncate ${selectedAssessment.riskCategory === "HIGH" ? "text-rose-600" : selectedAssessment.riskCategory === "MODERATE" ? "text-amber-600" : "text-emerald-600"}`}>{selectedAssessment.riskCategory} ({selectedAssessment.predictionPercentage || 5}%)</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 text-[9px] font-bold uppercase tracking-wider">Age profile</span>
                      <span className="text-xs font-bold text-slate-800">{selectedAssessment.age || "N/A"} yrs</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 text-[9px] font-bold uppercase tracking-wider">Created at</span>
                      <span className="text-xs font-semibold text-slate-800 truncate block">{selectedAssessment.createdAt?.toDate ? selectedAssessment.createdAt.toDate().toLocaleDateString() : "Present"}</span>
                    </div>
                  </div>

                  {/* Indicators / Symptoms Checklist */}
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 border-b border-slate-50 pb-2 mb-3">Submissions Biomarkers</h4>
                    
                    {/* Render different indicator parameters based on diagnostic type */}
                    {selectedAssessment.diseaseType === "PCOS" || (!selectedAssessment.isFibroid && selectedAssessment.diseaseType !== "Fibroid") ? (
                      /* PCOS checklist */
                      <div className="grid grid-cols-2 gap-y-2 text-xs font-semibold text-slate-650">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${selectedAssessment.cycleRegularity === "irregular" ? "bg-amber-500" : "bg-slate-300"}`} />
                          <span>Cycle: <strong>{selectedAssessment.cycleRegularity || "regular"}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${selectedAssessment.weightGain ? "bg-teal-500" : "bg-slate-300"}`} />
                          <span>Weight Gain: <strong>{selectedAssessment.weightGain ? "Yes" : "No"}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${selectedAssessment.hairGrowth ? "bg-teal-500" : "bg-slate-300"}`} />
                          <span>Hair Growth: <strong>{selectedAssessment.hairGrowth ? "Yes" : "No"}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${selectedAssessment.hairLoss ? "bg-teal-500" : "bg-slate-300"}`} />
                          <span>Hair Loss: <strong>{selectedAssessment.hairLoss ? "Yes" : "No"}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${selectedAssessment.acne ? "bg-teal-500" : "bg-slate-300"}`} />
                          <span>Acne: <strong>{selectedAssessment.acne ? "Yes" : "No"}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${selectedAssessment.fastFood ? "bg-teal-500" : "bg-slate-300"}`} />
                          <span>High Sugar Diet: <strong>{selectedAssessment.fastFood ? "Yes" : "No"}</strong></span>
                        </div>
                      </div>
                    ) : (
                      /* Fibroid checklist */
                      <div className="grid grid-cols-2 gap-y-2 text-xs font-semibold text-slate-650">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${selectedAssessment.heavyBleeding ? "bg-violet-500" : "bg-slate-300"}`} />
                          <span>Heavy Flow: <strong>{selectedAssessment.heavyBleeding ? "Yes" : "No"}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${selectedAssessment.prolongedMenstruation ? "bg-violet-500" : "bg-slate-300"}`} />
                          <span>Prolonged bleed: <strong>{selectedAssessment.prolongedMenstruation ? "Yes" : "No"}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${selectedAssessment.pelvicPain ? "bg-violet-500" : "bg-slate-300"}`} />
                          <span>Pelvic Pain: <strong>{selectedAssessment.pelvicPain ? "Yes" : "No"}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${selectedAssessment.abdominalSwelling ? "bg-violet-500" : "bg-slate-300"}`} />
                          <span>Abdo Swelling: <strong>{selectedAssessment.abdominalSwelling ? "Yes" : "No"}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${selectedAssessment.frequentUrination ? "bg-violet-500" : "bg-slate-300"}`} />
                          <span>Urgency: <strong>{selectedAssessment.frequentUrination ? "Yes" : "No"}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${selectedAssessment.fatigueAnemia ? "bg-violet-500" : "bg-slate-300"}`} />
                          <span>Anemia/Fatigue: <strong>{selectedAssessment.fatigueAnemia ? "Yes" : "No"}</strong></span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Clinician Advice Panel */}
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 border-b border-slate-50 pb-2 mb-3">Clinician Advisory</h4>
                    {selectedAssessment.recommendations && selectedAssessment.recommendations.length > 0 ? (
                      <div className="space-y-2">
                        {selectedAssessment.recommendations.map((rec: string, idx: number) => (
                          <div key={idx} className="flex gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200/50">
                            <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                            <p className="text-[10px] text-slate-600 font-semibold leading-relaxed">{rec}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 font-semibold italic text-center">No advice prompts saved for this assessment file.</p>
                    )}
                  </div>

                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
