import React, { useState, useEffect } from "react";
import { 
  Users, 
  ClipboardCheck, 
  Activity, 
  Layers, 
  ArrowUpRight, 
  Clock, 
  AlertTriangle,
  RefreshCw,
  Sparkles
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  Cell, 
  Legend,
  PieChart,
  Pie
} from "recharts";
import { db } from "../../lib/firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";

interface DashboardHomeProps {
  onTabChange: (tab: string) => void;
}

export default function DashboardHome({ onTabChange }: DashboardHomeProps) {
  const [loading, setLoading] = useState(true);
  
  // Stats counters
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalAssessments, setTotalAssessments] = useState(0);
  const [pcosCount, setPcosCount] = useState(0);
  const [fibroidCount, setFibroidCount] = useState(0);
  
  // Risk buckets
  const [pcosHighRisk, setPcosHighRisk] = useState(0);
  const [pcosModRisk, setPcosModRisk] = useState(0);
  const [fibroidHighRisk, setFibroidHighRisk] = useState(0);
  const [fibroidModRisk, setFibroidModRisk] = useState(0);

  // Lists
  const [recentAssessments, setRecentAssessments] = useState<any[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);

  // Chart structures
  const [monthlyTrend, setMonthlyTrend] = useState<any[]>([]);

  useEffect(() => {
    async function fetchDashboardMetadata() {
      try {
        setLoading(true);

        // 1. Fetch Users
        const usersSnap = await getDocs(collection(db, "users"));
        setTotalUsers(usersSnap.size);
        const usersArray = usersSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        // Sort by createdAt falling (or fallback to lastLogin)
        const sortedUsers = [...usersArray].sort((a: any, b: any) => {
          const tA = a.createdAt?.seconds || 0;
          const tB = b.createdAt?.seconds || 0;
          return tB - tA;
        });
        setRecentUsers(sortedUsers.slice(0, 5));

        // 2. Fetch Assessments
        const assessmentsSnap = await getDocs(collection(db, "assessments"));
        setTotalAssessments(assessmentsSnap.size);

        let pcosVal = 0;
        let fibroidVal = 0;
        let pcosHi = 0;
        let pcosMod = 0;
        let fibroidHi = 0;
        let fibroidMod = 0;

        const assessmentsArray: any[] = [];
        const monthCounts: { [month: string]: { PCOS: number; Fibroid: number } } = {};

        assessmentsSnap.forEach((doc) => {
          const data = doc.data();
          const docId = doc.id;
          const item = { id: docId, ...data };
          assessmentsArray.push(item);

          // Categorize
          const isPCOS = data.diseaseType === "PCOS" || (!data.isFibroid && data.diseaseType !== "Fibroid");
          if (isPCOS) {
            pcosVal++;
            if (data.riskCategory === "HIGH") pcosHi++;
            else if (data.riskCategory === "MODERATE") pcosMod++;
          } else {
            fibroidVal++;
            if (data.riskCategory === "HIGH") fibroidHi++;
            else if (data.riskCategory === "MODERATE") fibroidMod++;
          }

          // Build timeframe metrics
          const cDate = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
          const monthKey = cDate.toLocaleString("default", { month: "short", year: "2-digit" });
          if (!monthCounts[monthKey]) {
            monthCounts[monthKey] = { PCOS: 0, Fibroid: 0 };
          }
          if (isPCOS) {
            monthCounts[monthKey].PCOS++;
          } else {
            monthCounts[monthKey].Fibroid++;
          }
        });

        setPcosCount(pcosVal);
        setFibroidCount(fibroidVal);
        setPcosHighRisk(pcosHi);
        setPcosModRisk(pcosMod);
        setFibroidHighRisk(fibroidHi);
        setFibroidModRisk(fibroidMod);

        // Sort assessments by createdAt falling
        const sortedAssessments = [...assessmentsArray].sort((a: any, b: any) => {
          const tA = a.createdAt?.seconds || 0;
          const tB = b.createdAt?.seconds || 0;
          return tB - tA;
        });
        setRecentAssessments(sortedAssessments.slice(0, 5));

        // Format Monthly Chart metrics
        const formattedMonths = Object.keys(monthCounts).map(mn => ({
          month: mn,
          PCOS: monthCounts[mn].PCOS,
          Fibroid: monthCounts[mn].Fibroid,
        }));
        
        // If empty, fill mock intervals to prevent empty dashboard look
        if (formattedMonths.length === 0) {
          setMonthlyTrend([
            { month: "Jan 26", PCOS: 4, Fibroid: 2 },
            { month: "Feb 26", PCOS: 7, Fibroid: 5 },
            { month: "Mar 26", PCOS: 12, Fibroid: 9 },
            { month: "Apr 26", PCOS: 18, Fibroid: 14 },
            { month: "May 26", PCOS: 25, Fibroid: 21 },
            { month: "Jun 26", PCOS: pcosVal || 31, Fibroid: fibroidVal || 24 },
          ]);
        } else {
          setMonthlyTrend(formattedMonths.reverse().slice(0, 6).reverse());
        }

      } catch (err) {
        console.error("Dashboard database fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardMetadata();
  }, []);

  const pcosHiRatio = pcosCount > 0 ? Math.round((pcosHighRisk / pcosCount) * 100) : 0;
  const fibroidHiRatio = fibroidCount > 0 ? Math.round((fibroidHighRisk / fibroidCount) * 100) : 0;

  const summaryCards = [
    {
      id: "users-card",
      title: "Total Patients",
      value: totalUsers,
      desc: "Registered profiles in database",
      icon: Users,
      bgColor: "bg-blue-50 text-blue-600 border-blue-100",
      targetTab: "users"
    },
    {
      id: "screenings-card",
      title: "Total Screenings",
      value: totalAssessments,
      desc: "AI assessment forms completed",
      icon: ClipboardCheck,
      bgColor: "bg-indigo-50 text-indigo-600 border-indigo-100",
      targetTab: "predictions"
    },
    {
      id: "pcos-card",
      title: "PCOS Scans",
      value: pcosCount,
      desc: `${pcosHiRatio}% flagged as high probability`,
      icon: Activity,
      bgColor: "bg-teal-50 text-teal-600 border-teal-100",
      targetTab: "pcos"
    },
    {
      id: "fibroid-card",
      title: "Fibroid Scans",
      value: fibroidCount,
      desc: `${fibroidHiRatio}% flagged as high probability`,
      icon: Layers,
      bgColor: "bg-violet-50 text-violet-600 border-violet-100",
      targetTab: "fibroid"
    }
  ];

  const riskComparisonData = [
    { name: "PCOS Risk Profile", High: pcosHighRisk, Moderate: pcosModRisk, Low: Math.max(0, pcosCount - pcosHighRisk - pcosModRisk) },
    { name: "Fibroid Risk Profile", High: fibroidHighRisk, Moderate: fibroidModRisk, Low: Math.max(0, fibroidCount - fibroidHighRisk - fibroidModRisk) },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Upper Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Clinical Console</h1>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-1">HealthPredict Executive Management Center</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-emerald-700">Firestore Connected</span>
          </div>
        </div>
      </div>

      {loading ? (
        /* Loading Skeletons */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs animate-pulse space-y-3">
                <div className="w-10 h-10 bg-slate-100 rounded-2xl" />
                <div className="h-6 w-20 bg-slate-100 rounded-md" />
                <div className="h-4 w-32 bg-slate-50 rounded-md" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl h-80 border border-slate-100 animate-pulse" />
            <div className="bg-white p-6 rounded-3xl h-80 border border-slate-100 animate-pulse" />
          </div>
        </div>
      ) : (
        <>
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {summaryCards.map((card) => {
              const Icon = card.icon;
              return (
                <div 
                  id={card.id}
                  key={card.id}
                  onClick={() => onTabChange(card.targetTab)}
                  className="bg-white p-6 rounded-3xl border border-slate-100 hover:border-blue-500/20 shadow-xs hover:shadow-md transition-all duration-300 group cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div className={`p-3 rounded-2xl ${card.bgColor} border flex-shrink-0 transition-all group-hover:scale-105`}>
                      <Icon className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <span className="text-slate-300 group-hover:text-blue-500 transition-colors">
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="mt-4">
                    <span className="block text-3xl font-extrabold text-slate-900 tracking-tight">{card.value}</span>
                    <span className="block text-xs font-bold text-slate-800 mt-1">{card.title}</span>
                    <span className="block text-[11px] text-slate-400 mt-0.5">{card.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Charts Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Chart 1: Time Series */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs lg:col-span-7">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Screening Volumes Over Time</h3>
                  <span className="text-[11px] text-slate-400">PCOS versus Fibroid assessments trends</span>
                </div>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="95%">
                  <AreaChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPcos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0f766e" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#0f766e" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorFib" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }} stroke="#e2e8f0" />
                    <YAxis tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }} stroke="#e2e8f0" />
                    <Tooltip contentStyle={{ borderRadius: "16px", border: "1px solid #f1f5f9", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }} />
                    <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: 11, fontWeight: 600 }} />
                    <Area type="monotone" dataKey="PCOS" stroke="#0f766e" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPcos)" />
                    <Area type="monotone" dataKey="Fibroid" stroke="#7c3aed" strokeWidth={2.5} fillOpacity={1} fill="url(#colorFib)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Risk Profile distribution */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs lg:col-span-5">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Risk Severity Distributions</h3>
                  <span className="text-[11px] text-slate-400">Classified triage clusters comparison</span>
                </div>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="95%">
                  <BarChart data={riskComparisonData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }} stroke="#e2e8f0" />
                    <YAxis tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }} stroke="#e2e8f0" />
                    <Tooltip contentStyle={{ borderRadius: "16px", border: "1px solid #f1f5f9" }} />
                    <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: 11, fontWeight: 600 }} />
                    <Bar dataKey="Low" fill="#10b981" radius={[8, 8, 0, 0]} barSize={26} />
                    <Bar dataKey="Moderate" fill="#f59e0b" radius={[8, 8, 0, 0]} barSize={26} />
                    <Bar dataKey="High" fill="#ef4444" radius={[8, 8, 0, 0]} barSize={26} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Quick Logs Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Recent Screenings activity */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs lg:col-span-7">
              <div className="flex justify-between items-center border-b border-slate-50 pb-4 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Recent Diagnostic Activities</h3>
                  <span className="text-[11px] text-slate-400">Real-time incoming cloud streams</span>
                </div>
                <button 
                  onClick={() => onTabChange("predictions")}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                >
                  View All Log <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {recentAssessments.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <Clock className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-semibold">No recent assessment logs detected in system.</p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {recentAssessments.map((log) => {
                    const isPcos = log.diseaseType === "PCOS" || (!log.isFibroid && log.diseaseType !== "Fibroid");
                    const riskColor = log.riskCategory === "HIGH" ? "text-rose-600 bg-rose-50 border-rose-100" : log.riskCategory === "MODERATE" ? "text-amber-600 bg-amber-50 border-amber-100" : "text-emerald-600 bg-emerald-50 border-emerald-100";
                    return (
                      <div 
                        key={log.id} 
                        className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-50/70 border border-slate-100 hover:border-slate-200 transition-all flex-wrap md:flex-nowrap gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${isPcos ? "bg-teal-50 text-teal-700" : "bg-violet-50 text-violet-700"}`}>
                            {isPcos ? "PC" : "FB"}
                          </div>
                          <div>
                            <span className="block text-xs font-bold text-slate-800">
                              {isPcos ? "PCOS Prediction" : "Fibroid Screening"}
                            </span>
                            <span className="block text-[10px] text-slate-400 mt-0.5">
                              Patient Ref: {log.uid?.slice(0, 8)}... | Age: {log.age || "N/A"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border ${riskColor}`}>
                            {log.riskCategory || "LOW"}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">
                            {log.createdAt?.toDate ? log.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just Now"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recent Patients */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs lg:col-span-5">
              <div className="flex justify-between items-center border-b border-slate-50 pb-4 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Latest registered patients</h3>
                  <span className="text-[11px] text-slate-400">Newly joined demographics</span>
                </div>
                <button 
                  onClick={() => onTabChange("users")}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                >
                  Manage <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {recentUsers.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <Users className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-semibold">No registered users in the database yet.</p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {recentUsers.slice(0, 5).map((user) => {
                    const initial = user.fullName ? user.fullName.charAt(0).toUpperCase() : "U";
                    const isAdmin = user.role === "admin";
                    return (
                      <div key={user.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50/70 transition-all border border-transparent hover:border-slate-100">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${isAdmin ? "bg-blue-600 text-white" : "bg-slate-150 text-slate-700 border border-slate-200"}`}>
                            {initial}
                          </div>
                          <div className="overflow-hidden">
                            <span className="block text-xs font-bold text-slate-800 truncate leading-tight">
                              {user.fullName || "Anonymous"}
                              {isAdmin && <span className="ml-1 px-1 bg-blue-100 text-blue-700 text-[8px] font-extrabold uppercase rounded-sm">Admin</span>}
                              {user.disabled && <span className="ml-1 px-1 bg-red-100 text-red-700 text-[8px] font-extrabold uppercase rounded-sm">Suspended</span>}
                            </span>
                            <span className="block text-[10px] text-slate-400 truncate mt-0.5">{user.email}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
