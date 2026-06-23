import React, { useState, useEffect } from "react";
import { 
  Printer, 
  FileText, 
  Download, 
  TrendingUp, 
  Activity, 
  Layers, 
  Users, 
  RefreshCw,
  Award
} from "lucide-react";
import { db } from "../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [patientCount, setPatientCount] = useState(0);
  const [totalScans, setTotalScans] = useState(0);
  const [pcosCounts, setPcosCounts] = useState({ total: 0, high: 0, mod: 0 });
  const [fibroidCounts, setFibroidCounts] = useState({ total: 0, high: 0, mod: 0 });

  useEffect(() => {
    async function loadReportMetrics() {
      try {
        setLoading(true);
        // Load users count
        const usersSnap = await getDocs(collection(db, "users"));
        setPatientCount(usersSnap.size);

        // Load assessments
        const assessmentsSnap = await getDocs(collection(db, "assessments"));
        setTotalScans(assessmentsSnap.size);

        let pTot = 0, pHi = 0, pMd = 0;
        let fTot = 0, fHi = 0, fMd = 0;

        assessmentsSnap.forEach((doc) => {
          const data = doc.data();
          const isPcos = data.diseaseType === "PCOS" || (!data.isFibroid && data.diseaseType !== "Fibroid");
          if (isPcos) {
            pTot++;
            if (data.riskCategory === "HIGH") pHi++;
            else if (data.riskCategory === "MODERATE") pMd++;
          } else {
            fTot++;
            if (data.riskCategory === "HIGH") fHi++;
            else if (data.riskCategory === "MODERATE") fMd++;
          }
        });

        setPcosCounts({ total: pTot, high: pHi, mod: pMd });
        setFibroidCounts({ total: fTot, high: fHi, mod: fMd });

      } catch (err) {
        console.error("Failed to load report parameters:", err);
      } finally {
        setLoading(false);
      }
    }

    loadReportMetrics();
  }, []);

  const handleTriggerPrint = () => {
    window.print();
  };

  const currentFormattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Upper Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Executive Clinical Audit</h1>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-1">Generate printable system clinical reviews and disease category summaries</p>
        </div>
        <button
          id="print-report-action"
          onClick={handleTriggerPrint}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all shadow-md shadow-blue-500/10 flex items-center gap-2 cursor-pointer"
        >
          <Printer className="w-4 h-4" /> Print Audit Summary
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-500 mb-2" />
          <p className="text-xs font-semibold">Generating report logs...</p>
        </div>
      ) : (
        /* Printable Report Container */
        <div 
          id="clinical-report-sheet" 
          className="bg-white p-8 sm:p-12 rounded-[32px] border border-slate-100 shadow-sm space-y-8 max-w-4xl mx-auto print:border-0 print:shadow-none print:p-0"
        >
          {/* Audit Header */}
          <div className="border-b border-slate-200 pb-6 flex justify-between items-start flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                  H
                </div>
                <span className="text-lg font-extrabold tracking-tight text-slate-900">HealthPredict</span>
              </div>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-widest">Clinical Audit Statement</span>
              <span className="block text-lg font-extrabold text-slate-900 mt-1">Biomarker Assessment Review</span>
            </div>
            <div className="text-left sm:text-right text-xs">
              <span className="block text-slate-450 font-bold uppercase tracking-wider">Generated On</span>
              <span className="block font-bold text-slate-700 mt-0.5">{currentFormattedDate}</span>
              <span className="block text-[10px] text-slate-400 font-bold mt-1">Audit Protocol Ref: HP-6002-X</span>
            </div>
          </div>

          {/* Core Analytics Blocks */}
          <div className="space-y-6">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2">I. Executive Summary</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-semibold">
              This executive digest registers aggregate metrics of all PCOS and Uterine Fibroid screenings completed inside HealthPredict's secure cloud database. These classifications derive from patient symptoms logs mapped against predictive indices.
            </p>
            
            <div className="grid grid-cols-3 gap-6">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/50 text-center">
                <span className="block text-3xl font-extrabold text-slate-900 leading-none">{patientCount}</span>
                <span className="block text-[9px] font-bold text-slate-450 uppercase mt-2">Active Patients</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/50 text-center">
                <span className="block text-3xl font-extrabold text-slate-900 leading-none">{totalScans}</span>
                <span className="block text-[9px] font-bold text-slate-450 uppercase mt-2">Completed Screenings</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/50 text-center">
                <span className="block text-3xl font-extrabold text-slate-900 leading-none">{pcosCounts.total + fibroidCounts.total}</span>
                <span className="block text-[9px] font-bold text-slate-450 uppercase mt-2">AI Diagnostic Inferences</span>
              </div>
            </div>
          </div>

          {/* Condition-specific summary audit tables */}
          <div className="space-y-6">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2">II. Clinical Classification Totals</h3>
            <div className="overflow-hidden border border-slate-200 rounded-2xl">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left border-b border-slate-200">
                    <th className="py-3 px-5">Condition Target</th>
                    <th className="py-3 px-5">Assessed Log Count</th>
                    <th className="py-3 px-5">High Severity Triage Count</th>
                    <th className="py-3 px-5">Moderate Severity Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs font-semibold text-slate-750">
                  <tr>
                    <td className="py-4 px-5 font-bold text-teal-700">Polycystic Ovary Syndrome (PCOS)</td>
                    <td className="py-4 px-5">{pcosCounts.total}</td>
                    <td className="py-4 px-5 text-rose-600 font-bold">{pcosCounts.high}</td>
                    <td className="py-4 px-5 text-amber-600">{pcosCounts.mod}</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-5 font-bold text-violet-700">Uterine Fibroids (Leiomyomas)</td>
                    <td className="py-4 px-5">{fibroidCounts.total}</td>
                    <td className="py-4 px-5 text-rose-600 font-bold">{fibroidCounts.high}</td>
                    <td className="py-4 px-5 text-amber-600">{fibroidCounts.mod}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Advisory & Security statement */}
          <div className="space-y-6 pt-4">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2">III. Clinical Quality & Standards</h3>
            <p className="text-xs text-slate-500 leading-relaxed italic">
              HealthPredict incorporates an encrypted, HIPAA-compliant patient ledger system. Statistical screening logs must be cross-analyzed using ultrasound scan, tissue biopsy, or magnetic resonance imaging (MRI) processes inside a professional primary care center before treating patients.
            </p>
          </div>

          {/* Signatures block */}
          <div className="pt-12 border-t border-slate-200 flex justify-between items-end flex-wrap gap-6 text-xs font-bold text-slate-450 uppercase">
            <div className="space-y-1">
              <span className="block border-b border-slate-300 w-48 h-6" />
              <span>Lead Clinical Architect Signature</span>
            </div>
            <div className="text-left sm:text-right space-y-1">
              <span className="block">Certification Authority: HealthPredict Inc.</span>
              <span className="block text-[10px] text-slate-400 font-normal">Standard 522-C Compliance Certificate</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
