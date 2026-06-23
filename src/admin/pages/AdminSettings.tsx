import React, { useState, useEffect } from "react";
import { 
  Sliders, 
  ShieldCheck, 
  Database, 
  Save, 
  HelpCircle,
  RefreshCw,
  BellRing
} from "lucide-react";
import { db } from "../../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Button from "../../components/ui/Button";

export default function AdminSettings() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Scopes and states
  const [pcosHigh, setPcosHigh] = useState(70);
  const [pcosMod, setPcosMod] = useState(35);
  const [fibroidHigh, setFibroidHigh] = useState(70);
  const [fibroidMod, setFibroidMod] = useState(35);

  // Security Toggles
  const [mfaForAdmins, setMfaForAdmins] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [complianceLogs, setComplianceLogs] = useState(true);

  useEffect(() => {
    async function loadThresholdSettings() {
      try {
        setLoading(true);
        const settingsSnap = await getDoc(doc(db, "settings", "thresholds"));
        if (settingsSnap.exists()) {
          const data = settingsSnap.data();
          if (data.pcosHigh) setPcosHigh(data.pcosHigh);
          if (data.pcosMod) setPcosMod(data.pcosMod);
          if (data.fibroidHigh) setFibroidHigh(data.fibroidHigh);
          if (data.fibroidMod) setFibroidMod(data.fibroidMod);
        }
      } catch (err) {
        console.error("Failed to load threshold settings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadThresholdSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await setDoc(doc(db, "settings", "thresholds"), {
        pcosHigh,
        pcosMod,
        fibroidHigh,
        fibroidMod,
        updatedAt: new Date()
      });
      alert("System thresholds and rules have been successfully persisted in Firestore.");
    } catch (err) {
      console.error("Failed to write clinical threshold parameters:", err);
      alert("Failed to save. Confirm your administrative permission rules database connection.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Upper Panel */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Console Configuration</h1>
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-1">Configure metabolic metrics thresholds, classification bounds, and active session properties</p>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-500 mb-2" />
          <p className="text-xs font-semibold">Retrieving system configurations...</p>
        </div>
      ) : (
        <form onSubmit={handleSaveSettings} className="space-y-6 max-w-3xl mx-auto">
          {/* Section 1: Scopes */}
          <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" /> Triage Risk Scoring Bounds
            </h3>
            
            <div className="space-y-6">
              {/* PCOS Slider */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                  <span>PCOS Risk Threshold bounds</span>
                  <span className="text-blue-600">MODERATE: &ge;{pcosMod}% | HIGH: &ge;{pcosHigh}%</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Moderate Limit (%)</label>
                    <input 
                      type="range" 
                      min="10" 
                      max="50" 
                      value={pcosMod}
                      onChange={(e) => setPcosMod(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">High Limit (%)</label>
                    <input 
                      type="range" 
                      min="51" 
                      max="90" 
                      value={pcosHigh}
                      onChange={(e) => setPcosHigh(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Fibroid Slider */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800 border-t border-slate-50 pt-4">
                  <span>Fibroid Risk Threshold bounds</span>
                  <span className="text-blue-600 font-bold">MODERATE: &ge;{fibroidMod}% | HIGH: &ge;{fibroidHigh}%</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Moderate Limit (%)</label>
                    <input 
                      type="range" 
                      min="10" 
                      max="50" 
                      value={fibroidMod}
                      onChange={(e) => setFibroidMod(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">High Limit (%)</label>
                    <input 
                      type="range" 
                      min="51" 
                      max="90" 
                      value={fibroidHigh}
                      onChange={(e) => setFibroidHigh(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Security & Protocols */}
          <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" /> Administrative Security Gates
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-slate-50/50 rounded-2xl border border-slate-100">
                <div>
                  <span className="block text-xs font-bold text-slate-800">Compliance Auditing</span>
                  <span className="block text-[10px] text-slate-400 leading-normal font-semibold mt-0.5">Enforce real-time logs recording of every record modification or deletion.</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={complianceLogs}
                  onChange={(e) => setComplianceLogs(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50/50 rounded-2xl border border-slate-100">
                <div>
                  <span className="block text-xs font-bold text-slate-800">Enforce Admin Multi-Factor (MFA)</span>
                  <span className="block text-[10px] text-slate-400 leading-normal font-semibold mt-0.5">Enable secure OTP/MFA checks upon entering the admin panel.</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={mfaForAdmins}
                  onChange={(e) => setMfaForAdmins(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50/50 rounded-2xl border border-slate-100">
                <div>
                  <span className="block text-xs font-bold text-slate-800">Dynamic Session Timeout Limit</span>
                  <span className="block text-[10px] text-slate-400 leading-normal font-semibold mt-0.5">System auto signs out admins after inactive increments.</span>
                </div>
                <select
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.value)}
                  className="bg-white border border-slate-200/80 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-600 focus:outline-none cursor-pointer"
                >
                  <option value="15">15 Minutes</option>
                  <option value="30">30 Minutes</option>
                  <option value="60">1 Hour</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Trigger Button */}
          <div className="flex justify-end pt-2">
            <Button
              id="save-settings-action"
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-md shadow-blue-500/10 flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4.5 h-4.5" />
              {saving ? "Saving settings parameters..." : "Save Console Configuration"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
