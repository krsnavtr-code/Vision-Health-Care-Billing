import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Inventory from "./components/Inventory";
import Equipment from "./components/Equipment";
import Patients from "./components/Patients";
import POS from "./components/POS";
import {
  Activity,
  LayoutDashboard,
  ShoppingCart,
  Package,
  Layers,
  Users,
  LogOut,
  User as UserIcon,
} from "lucide-react";

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [activeTab, setActiveTab] = useState("Dashboard");

  // Load auth state from localStorage on boot
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }

    // Set up interceptor for Auth failure events
    const handleAuthFailed = () => {
      setToken(null);
      setUser(null);
    };

    window.addEventListener("auth-failed", handleAuthFailed);
    return () => window.removeEventListener("auth-failed", handleAuthFailed);
  }, []);

  const handleLoginSuccess = (userData) => {
    setToken(userData.token);
    setUser(userData);
    setActiveTab("Dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  if (!token) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Navigation Items Mapping
  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "POS / Billing", icon: ShoppingCart },
    { name: "Inventory", icon: Package },
    { name: "Equipment Rentals", icon: Layers },
    { name: "Patients", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col shrink-0">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-2.5">
          <div className="p-1.5 bg-blue-600 rounded-lg text-white">
            <Activity className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h2 className="font-black text-white text-sm tracking-wider">
              VISION HEALTH
            </h2>
            <p className="text-xxs text-slate-500 font-bold uppercase tracking-widest">
              Enterprise ERP
            </p>
          </div>
        </div>

        {/* Navigation lists */}
        <nav className="flex-grow p-4 space-y-1">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.name;
            return (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition duration-150 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                    : "hover:bg-slate-800/60 hover:text-white text-slate-400"
                }`}
              >
                <IconComponent className="h-4 w-4" />
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* User Account / Footer */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-800 rounded-full text-slate-300">
              <UserIcon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-grow">
              <h4 className="text-xs font-black text-white truncate leading-tight">
                {user.name}
              </h4>
              <p className="text-xxs text-blue-400 font-bold uppercase tracking-wide mt-0.5">
                {user.role}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-rose-950 hover:text-rose-400 rounded-xl text-xs font-bold text-slate-400 transition"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN LAYOUT CONTENT */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-100 px-8 flex justify-between items-center shrink-0">
          <div>
            <span className="text-xxs font-black text-slate-400 uppercase tracking-widest">
              Workspace
            </span>
            <h2 className="text-xs font-black text-slate-700 uppercase tracking-wider">
              {activeTab} Hub
            </h2>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 font-bold">
            <span className="h-2 w-2 bg-emerald-500 rounded-full animate-ping" />
            <span>Connection Secure (Cloud DB)</span>
          </div>
        </header>

        {/* Main Routing Wrapper */}
        <main className="flex-grow p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {activeTab === "Dashboard" && (
            <Dashboard onNavigateToPos={() => setActiveTab("POS / Billing")} />
          )}
          {activeTab === "POS / Billing" && <POS />}
          {activeTab === "Inventory" && <Inventory />}
          {activeTab === "Equipment Rentals" && <Equipment />}
          {activeTab === "Patients" && <Patients />}
        </main>
      </div>
    </div>
  );
}
