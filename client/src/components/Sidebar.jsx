import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Activity,
  LayoutDashboard,
  ShoppingCart,
  Package,
  Layers,
  Users,
  LogOut,
  User as UserIcon,
  Settings,
} from "lucide-react";

export default function Sidebar({ user, handleLogout }) {
  const location = useLocation();

  // Navigation Items Mapping
  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "POS / Billing", icon: ShoppingCart, path: "/pos" },
    { name: "Inventory", icon: Package, path: "/inventory" },
    { name: "Equipment Rentals", icon: Layers, path: "/rentals" },
    { name: "Patients", icon: Users, path: "/patients" },
  ];

  if (user && (user.role === "Admin" || user.role === "Manager")) {
    menuItems.push({
      name: "Business Settings",
      icon: Settings,
      path: "/settings",
    });
  }

  return (
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
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition duration-150 ${
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                  : "hover:bg-slate-800/60 hover:text-white text-slate-400"
              }`}
            >
              <IconComponent className="h-4 w-4" />
              {item.name}
            </Link>
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
  );
}
