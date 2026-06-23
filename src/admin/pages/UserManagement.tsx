import React, { useState, useEffect } from "react";
import { 
  Search, 
  Trash2, 
  ShieldAlert, 
  UserCheck, 
  FileText, 
  Activity, 
  Layers, 
  ChevronRight, 
  Info,
  SlidersHorizontal,
  X,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { db } from "../../lib/firebase";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import Button from "../../components/ui/Button";

export default function UserManagement() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<{ [uid: string]: any }>({});
  const [assessments, setAssessments] = useState<any[]>([]);
  
  // Filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Selected patient details
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userAssessments, setUserAssessments] = useState<any[]>([]);

  const fetchUsersData = async () => {
    try {
      setLoading(true);
      // Retrieve users
      const usersSnap = await getDocs(collection(db, "users"));
      const usersList = usersSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersList);

      // Retrieve profiles
      const profilesSnap = await getDocs(collection(db, "profiles"));
      const profilesMap: { [uid: string]: any } = {};
      profilesSnap.forEach(doc => {
        profilesMap[doc.id] = doc.data();
      });
      setProfiles(profilesMap);

      // Retrieve assessments to tie histories
      const assessmentsSnap = await getDocs(collection(db, "assessments"));
      const assessmentsList = assessmentsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAssessments(assessmentsList);

    } catch (err) {
      console.error("Failed to retrieve users directory:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersData();
  }, []);

  // Update suspension lock
  const handleToggleSuspension = async (user: any) => {
    const nextStatus = !user.disabled;
    const msg = `Are you sure you want to ${nextStatus ? "suspend" : "reactivate"} user ${user.fullName || user.email}?`;
    if (!window.confirm(msg)) return;

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { disabled: nextStatus });
      
      // Update local state proactively
      setUsers(prev => prev.map(u => u.uid === user.uid ? { ...u, disabled: nextStatus } : u));
      if (selectedUser?.uid === user.uid) {
        setSelectedUser(prev => ({ ...prev, disabled: nextStatus }));
      }
    } catch (error) {
      console.error("Failed to alter suspension flag:", error);
      alert("Permission denied or database update error.");
    }
  };

  // Inspect profile
  const handleSelectUser = (user: any) => {
    setSelectedUser(user);
    const history = assessments.filter(a => a.uid === user.uid);
    // Sort falling by date
    const sortedHistory = [...history].sort((a, b) => {
      const tA = a.createdAt?.seconds || 0;
      const tB = b.createdAt?.seconds || 0;
      return tB - tA;
    });
    setUserAssessments(sortedHistory);
  };

  // Filter lists
  const filteredUsers = users.filter(user => {
    const profile = profiles[user.uid] || {};
    const text = `${user.fullName || ""} ${user.email || ""} ${profile.location || ""}`.toLowerCase();
    const queryMatch = text.includes(searchQuery.toLowerCase());
    
    const roleMatch = roleFilter === "all" || 
                      (roleFilter === "admin" && user.role === "admin") ||
                      (roleFilter === "user" && user.role !== "admin");

    const statusMatch = statusFilter === "all" ||
                        (statusFilter === "suspended" && user.disabled) ||
                        (statusFilter === "active" && !user.disabled);

    return queryMatch && roleMatch && statusMatch;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Upper Panel */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Patient Directory</h1>
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-1">Review profiles, medical records, and edit authentication states</p>
      </div>

      {/* Filter and Query bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 relative h-4 text-slate-400" />
          <input
            id="user-search-field"
            type="text"
            placeholder="Search by patient name, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50/50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500/80 focus:bg-white transition-all"
          />
        </div>

        <div className="flex gap-3 w-full md:w-auto self-start md:self-center flex-wrap">
          <select
            id="user-role-filter"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-50/50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 focus:outline-none cursor-pointer"
          >
            <option value="all">Roles: All</option>
            <option value="user">Patient Role</option>
            <option value="admin">Admin Role</option>
          </select>

          <select
            id="user-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50/50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 focus:outline-none cursor-pointer"
          >
            <option value="all">Status: All</option>
            <option value="active">Active Accounts</option>
            <option value="suspended">Suspended Accounts</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-500 mb-2" />
          <p className="text-xs font-semibold">Loading system registry...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Patients roster Table */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xs lg:col-span-7 overflow-hidden">
            <div className="p-5 border-b border-slate-50">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Patients & Accounts list</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50 font-bold text-slate-450 uppercase text-[10px] tracking-wider text-left border-b border-slate-100">
                    <th className="py-3 px-5">Demographics</th>
                    <th className="py-3 px-5">Role</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-400 text-xs font-semibold">
                        No matches correspond to search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const profile = profiles[user.uid] || {};
                      const isSelected = selectedUser?.uid === user.uid;
                      const initial = user.fullName ? user.fullName.charAt(0).toUpperCase() : "U";
                      const count = assessments.filter(a => a.uid === user.uid).length;
                      return (
                        <tr 
                          id={`p-row-${user.uid}`}
                          key={user.uid}
                          className={`hover:bg-slate-50/50 transition-colors ${isSelected ? "bg-slate-50/80" : ""}`}
                        >
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-slate-100 font-bold text-xs text-slate-700 flex items-center justify-center flex-shrink-0">
                                {initial}
                              </div>
                              <div className="max-w-[180px]">
                                <span className="block text-xs font-bold text-slate-900 truncate leading-tight">{user.fullName || "Jane Doe"}</span>
                                <span className="block text-[10px] text-slate-400 truncate mt-0.5">{user.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-5">
                            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${user.role === "admin" ? "bg-blue-50 text-blue-700 border border-blue-100" : "bg-teal-50 text-teal-700 border border-teal-100"}`}>
                              {user.role === "admin" ? "ADMIN" : "PATIENT"}
                            </span>
                          </td>
                          <td className="py-4 px-5">
                            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${user.disabled ? "bg-red-50 text-red-700 border border-red-100" : "bg-emerald-50 text-emerald-700 border border-emerald-100"}`}>
                              {user.disabled ? "SUSPENDED" : "ACTIVE"}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                id={`inspect-btn-${user.uid}`}
                                onClick={() => handleSelectUser(user)}
                                className="p-1 px-2 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-slate-400 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                                title="Inspect medical files"
                              >
                                Inspect <ChevronRight className="w-3.5 h-3.5" />
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

          {/* Interactive Inspection panel */}
          <div className="lg:col-span-5 space-y-6">
            {!selectedUser ? (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-8 rounded-3xl text-center text-slate-400 space-y-3">
                <Info className="w-8 h-8 mx-auto text-slate-300" />
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">No Patient Selected</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-semibold mt-1">Click "Inspect" on any directory row to open clinical notes, vitals, allergies, and diagnostics history files.</p>
                </div>
              </div>
            ) : (
              <div id="inspector-card" className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden animate-fadeIn space-y-6">
                {/* Drawer Header */}
                <div className="p-5 border-b border-slate-50 bg-slate-900 text-white flex justify-between items-center">
                  <div className="overflow-hidden">
                    <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Clinical File Inspector</h3>
                    <p className="text-sm font-extrabold truncate mt-1">{selectedUser.fullName}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedUser(null)}
                    className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
                    title="Close file"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Patient medical parameters */}
                <div className="p-6 space-y-6">
                  {/* Account settings suspension panel */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-4">
                    <div>
                      <span className="block text-xs font-bold text-slate-800">Security & Gateways</span>
                      <span className="block text-[10px] text-slate-400 leading-snug font-semibold mt-0.5">Control login capability. Suspended accounts are signed out.</span>
                    </div>
                    <button
                      id="toggle-suspend-action"
                      onClick={() => handleToggleSuspension(selectedUser)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                        selectedUser.disabled 
                          ? "bg-emerald-500 text-white hover:bg-emerald-600" 
                          : "bg-red-500 text-white hover:bg-red-600"
                      }`}
                    >
                      {selectedUser.disabled ? (
                        <>
                          <UserCheck className="w-3.5 h-3.5" /> Reactivate
                        </>
                      ) : (
                        <>
                          <ShieldAlert className="w-3.5 h-3.5" /> Suspend
                        </>
                      )}
                    </button>
                  </div>

                  {/* Vitals profile panel */}
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 border-b border-slate-50 pb-2 mb-3">Vitals Profile</h4>
                    {profiles[selectedUser.uid] ? (
                      <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 text-xs">
                        <div>
                          <span className="block text-slate-400 font-bold mb-0.5 uppercase text-[9px] tracking-wider">Location</span>
                          <span className="text-slate-800 font-semibold">{profiles[selectedUser.uid].location || "N/A"}</span>
                        </div>
                        <div>
                          <span className="block text-slate-400 font-bold mb-0.5 uppercase text-[9px] tracking-wider">Ethnicity</span>
                          <span className="text-slate-800 font-semibold">{profiles[selectedUser.uid].ethnicity || "N/A"}</span>
                        </div>
                        <div>
                          <span className="block text-slate-400 font-bold mb-0.5 uppercase text-[9px] tracking-wider">Blood Type</span>
                          <span className="text-slate-800 font-bold text-blue-600">{profiles[selectedUser.uid].bloodType || "N/A"}</span>
                        </div>
                        <div>
                          <span className="block text-slate-400 font-bold mb-0.5 uppercase text-[9px] tracking-wider">Allergies</span>
                          <span className="text-slate-800 font-semibold leading-relaxed truncate block max-w-xs">{profiles[selectedUser.uid].allergies || "None logged"}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="block text-slate-400 font-bold mb-0.5 uppercase text-[9px] tracking-wider">Chronic Conditions</span>
                          <span className="text-slate-800 font-semibold leading-relaxed truncate block max-w-full">{profiles[selectedUser.uid].chronicConditions || "None logs"}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="block text-slate-400 font-bold mb-0.5 uppercase text-[9px] tracking-wider">Active Medications</span>
                          <span className="text-slate-800 font-semibold leading-relaxed truncate block max-w-full">{profiles[selectedUser.uid].medications || "None"}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/50">
                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                        <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">No medical clinical health file created yet. Demographics will synchronize upon user onboarding.</p>
                      </div>
                    )}
                  </div>

                  {/* Assessments history panel */}
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 border-b border-slate-50 pb-2 mb-3">Diagnostic History ({userAssessments.length})</h4>
                    {userAssessments.length === 0 ? (
                      <p className="text-[10px] text-slate-400 font-semibold text-center py-4">No health predictions compiled for this client yet.</p>
                    ) : (
                      <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                        {userAssessments.map((as) => {
                          const isPcos = as.diseaseType === "PCOS" || (!as.isFibroid && as.diseaseType !== "Fibroid");
                          const riskBadge = as.riskCategory === "HIGH" ? "text-rose-600 bg-rose-50 border-rose-100" : as.riskCategory === "MODERATE" ? "text-amber-600 bg-amber-50 border-amber-100" : "text-emerald-600 bg-emerald-50 border-emerald-100";
                          return (
                            <div key={as.id} className="p-3 rounded-2xl border border-slate-100 hover:bg-slate-50/50 transition-all flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-[10px] ${isPcos ? "bg-teal-50 text-teal-700" : "bg-violet-50 text-violet-700"}`}>
                                  {isPcos ? "PC" : "FB"}
                                </div>
                                <div>
                                  <span className="block text-xs font-bold text-slate-800">{isPcos ? "PCOS Prediction" : "Fibroid Screening"}</span>
                                  <span className="block text-[9px] text-slate-400 mt-0.5">{as.createdAt?.toDate ? as.createdAt.toDate().toLocaleDateString() : "Just Now"}</span>
                                </div>
                              </div>
                              <span className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase border ${riskBadge}`}>
                                {as.riskCategory || "LOW"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
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
