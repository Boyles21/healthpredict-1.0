import React from "react";
import { 
  LayoutDashboard, 
  Users, 
  ClipboardCheck, 
  Activity, 
  Layers, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  ChevronLeft, 
  ChevronRight,
  Heart
} from "lucide-react";

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  adminName: string;
  adminEmail: string;
}

export default function Sidebar({
  currentTab,
  onTabChange,
  onLogout,
  isCollapsed,
  setIsCollapsed,
  adminName,
  adminEmail,
}: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "users", label: "Users Management", icon: Users },
    { id: "predictions", label: "Predictions Log", icon: ClipboardCheck },
    { id: "pcos", label: "PCOS Analytics", icon: Activity },
    { id: "fibroid", label: "Fibroid Analytics", icon: Layers },
    { id: "reports", label: "Clinical Reports", icon: BarChart3 },
    { id: "settings", label: "System Settings", icon: Settings },
  ];

  return (
    <aside 
      id="admin-sidebar"
      className={`fixed top-0 left-0 h-screen bg-slate-900 text-slate-300 flex flex-col justify-between transition-all duration-300 z-50 shadow-xl ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white flex-shrink-0 animate-pulse">
              <Heart className="w-5 h-5 fill-white/10" />
            </div>
            {!isCollapsed && (
              <span className="font-extrabold text-white text-md tracking-tight whitespace-nowrap">
                HealthPredict <span className="text-blue-500 font-bold text-xs ml-1 bg-blue-500/10 px-1.5 py-0.5 rounded-md border border-blue-500/20">Admin</span>
              </span>
            )}
          </div>
          <button 
            id="sidebar-toggle"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                id={`sidebar-tab-${item.id}`}
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-xl transition-all font-semibold text-xs uppercase tracking-wider cursor-pointer group ${
                  isActive 
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/10" 
                    : "hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-105 ${isActive ? "text-white" : "text-slate-400 group-hover:text-white"}`} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Logout */}
      <div className="p-3 border-t border-slate-800 space-y-2">
        {!isCollapsed && (
          <div className="px-3 py-2 bg-slate-800/40 rounded-xl border border-slate-800 overflow-hidden">
            <p className="text-xs font-bold text-white truncate">{adminName}</p>
            <p className="text-[10px] text-slate-500 truncate mt-0.5">{adminEmail}</p>
          </div>
        )}

        <button
          id="sidebar-logout"
          onClick={onLogout}
          className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-xl hover:bg-red-500/10 hover:text-red-400 text-slate-400 transition-colors cursor-pointer font-bold text-xs uppercase tracking-wider ${
            isCollapsed ? "justify-center" : ""
          }`}
          title="Logout from console"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
