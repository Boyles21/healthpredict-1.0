import React, { useState, useEffect } from "react";
import { 
  Activity, 
  Search, 
  TrendingUp, 
  Percent, 
  Heart, 
  HelpCircle,
  FileCheck,
  RefreshCw
} from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell
} from "recharts";
import { db } from "../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function PCOSAnalytics() {
  const [loading, setLoading] = useState(true);
  const [pcosRecords, setPcosRecords] = useState<any[]>([]);
  
  // Dynamic metrics filtering
  const [bmiFilter, setBmiFilter] = useState("all"); // all | normal | high
  const [ageRangeFilter, setAgeRangeFilter] = useState("all"); // all | under30 | over30

  useEffect(() => {
    async function loadPcosDatabase() {
      try {
        setLoading(true);
        const snapshot = await getDocs(collection(db, "assessments"));
        const records: any[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          const isPcos = data.diseaseType === "PCOS" || (!data.isFibroid && data.diseaseType !== "Fibroid");
          if (isPcos) {
            records.push({ id: doc.id, ...data });
          }
        });
        setPcosRecords(records);
      } catch (err) {
        console.error("Failed to load analytics feed:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPcosDatabase();
  }, []);

  // Compute stats on-the-fly dynamically!
  const filteredData = pcosRecords.filter((rec) => {
    // Compute BMI
    let bmiValue = 22;
    if (rec.weight && rec.height) {
      const hM = rec.height / 100;
      bmiValue = rec.weight / (hM * hM);
    }

    const recAge = rec.age || 25;

    const matchesBmi = bmiFilter === "all" ||
                       (bmiFilter === "normal" && bmiValue < 25) ||
                       (bmiFilter === "high" && bmiValue >= 25);

    const matchesAge = ageRangeFilter === "all" ||
                       (ageRangeFilter === "under30" && recAge < 30) ||
                       (ageRangeFilter === "over30" && recAge >= 30);

    return matchesBmi && matchesAge;
  });

  const totalFilteredCount = filteredData.length;

  // Symptom counts
  let cycleCount = 0;
  let weightGainCount = 0;
  let hairGrowthCount = 0;
  let acneCount = 0;
  let darkSkinCount = 0;
  let fastFoodCount = 0;

  filteredData.forEach((rec) => {
    if (rec.cycleRegularity === "irregular") cycleCount++;
    if (rec.weightGain) weightGainCount++;
    if (rec.hairGrowth) hairGrowthCount++;
    if (rec.acne) acneCount++;
    if (rec.skinDarkening) darkSkinCount++;
    if (rec.fastFood) fastFoodCount++;
  });

  const getPercentage = (count: number) => {
    if (totalFilteredCount === 0) return 0;
    return Math.round((count / totalFilteredCount) * 100);
  };

  const prevalenceMetricData = [
    { name: "Irregular Cycle", percentage: getPercentage(cycleCount), raw: cycleCount, fill: "#0d9488" },
    { name: "Weight Gain", percentage: getPercentage(weightGainCount), raw: weightGainCount, fill: "#0f766e" },
    { name: "Acne Flareups", percentage: getPercentage(acneCount), raw: acneCount, fill: "#2dd4bf" },
    { name: "Hirsutism", percentage: getPercentage(hairGrowthCount), raw: hairGrowthCount, fill: "#115e59" },
    { name: "Acanthosis", percentage: getPercentage(darkSkinCount), raw: darkSkinCount, fill: "#14b8a6" },
    { name: "Sugary Diets", percentage: getPercentage(fastFoodCount), raw: fastFoodCount, fill: "#99f6e4" },
  ];

  // High risk ratio
  const highRiskFiltered = filteredData.filter(r => r.riskCategory === "HIGH").length;
  const modRiskFiltered = filteredData.filter(r => r.riskCategory === "MODERATE").length;
  const lowRiskFiltered = Math.max(0, totalFilteredCount - highRiskFiltered - modRiskFiltered);

  const riskDistributionPie = [
    { name: "High Triage Risk", value: highRiskFiltered, color: "#ef4444" },
    { name: "Moderate Triage Risk", value: modRiskFiltered, color: "#f59e0b" },
    { name: "Low Triage Risk", value: lowRiskFiltered, color: "#10b981" },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Upper Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">PCOS Epidemiology Board</h1>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-1">Cross-sectional correlations and metabolic symptom markers tracker</p>
        </div>
        
        {/* Real-time slider filter panel */}
        <div className="flex gap-2.5 flex-wrap">
          <select
            id="pcos-bmi-selector"
            value={bmiFilter}
            onChange={(e) => setBmiFilter(e.target.value)}
            className="bg-white border border-slate-200 shadow-xs rounded-xl px-3 py-2 text-xs font-bold text-slate-600 focus:outline-none cursor-pointer"
          >
            <option value="all">BMI Index: All</option>
            <option value="normal">Normal BMI (&lt; 25)</option>
            <option value="high">Overweight BMI (&ge; 25)</option>
          </select>

          <select
            id="pcos-age-selector"
            value={ageRangeFilter}
            onChange={(e) => setAgeRangeFilter(e.target.value)}
            className="bg-white border border-slate-200 shadow-xs rounded-xl px-3 py-2 text-xs font-bold text-slate-600 focus:outline-none cursor-pointer"
          >
            <option value="all">Age Bounds: All</option>
            <option value="under30">Age Under 30 yrs</option>
            <option value="over30">Age 30 yrs &amp; Over</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-500 mb-2" />
          <p className="text-xs font-semibold">Loading epidemiological database maps...</p>
        </div>
      ) : (
        <>
          {/* Summary Mini Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center font-extrabold">
                <Percent className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-2xl font-extrabold text-slate-900">{totalFilteredCount}</span>
                <span className="block text-[11px] font-bold text-slate-400 uppercase mt-0.5">Filtered Patient Size</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center font-extrabold font-mono">
                {totalFilteredCount > 0 ? Math.round((highRiskFiltered / totalFilteredCount) * 100) : 0}%
              </div>
              <div>
                <span className="block text-2xl font-extrabold text-slate-900">{highRiskFiltered}</span>
                <span className="block text-[11px] font-bold text-slate-400 uppercase mt-0.5">High Severity Triage</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center font-extrabold font-mono">
                {totalFilteredCount > 0 ? getPercentage(cycleCount) : 0}%
              </div>
              <div>
                <span className="block text-2xl font-extrabold text-slate-900">{cycleCount}</span>
                <span className="block text-[11px] font-bold text-slate-400 uppercase mt-0.5">Irregular Menstrual Cycles</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Chart prevalence distribution */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs lg:col-span-7">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">Symptomatology Prevalence Percentage</h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="95%">
                  <BarChart data={prevalenceMetricData} layout="vertical" margin={{ top: 5, right: 30, left: 35, bottom: 5 }}>
                    <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10, fontWeight: 600 }} stroke="#e2e8f0" />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fontWeight: 700, fill: '#334155' }} stroke="#e2e8f0" />
                    <Tooltip formatter={(value) => [`${value}%`]} />
                    <Bar dataKey="percentage" radius={[0, 6, 6, 0]} barSize={16}>
                      {prevalenceMetricData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Severity pie chart */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs lg:col-span-5">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">Risk Stratification Map</h3>
              <div className="h-70 w-full flex items-center justify-center">
                {totalFilteredCount === 0 ? (
                  <p className="text-xs text-slate-400 font-semibold italic">No data fits search boundary.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={riskDistributionPie}
                        cx="50%"
                        cy="45%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {riskDistributionPie.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 10, fontWeight: 600 }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
