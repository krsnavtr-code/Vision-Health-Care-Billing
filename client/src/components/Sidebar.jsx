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
  HelpCircle,
} from "lucide-react";

export default function Sidebar({ user, handleLogout, isOpen, onClose }) {
  const location = useLocation();

  // Navigation Items Mapping
  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Patients", icon: Users, path: "/patients" },
    { name: "Equipment Rentals", icon: Layers, path: "/rentals" },
    { name: "Inventory", icon: Package, path: "/inventory" },
    { name: "POS / Billing", icon: ShoppingCart, path: "/pos" },
    { name: "How To Use", icon: HelpCircle, path: "/how-to-use" },
  ];

  if (user && (user.role === "Admin" || user.role === "Manager")) {
    menuItems.push({
      name: "Business Settings",
      icon: Settings,
      path: "/settings",
    });
  }

  return (
    <>
      {/* MOBILE BACKDROP OVERLAY */}
      <div
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* SIDEBAR ASIDE DRAWER */}
      <aside
        className={`fixed inset-y-0 left-0 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col shrink-0 z-50 transform transition-all duration-300 ease-in-out h-full md:static md:translate-x-0 ${
          isOpen
            ? "w-52 translate-x-0 md:ml-0"
            : "-translate-x-full md:w-14 md:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div
          className={`p-1.5 border-b border-slate-800 flex items-center gap-2 transition-all duration-300 ${!isOpen ? "md:justify-center md:px-0" : ""}`}
        >
          <div className="flex items-center gap-2">
            <div className="p-1 bg-blue-600 rounded-lg text-white shrink-0">
              <Activity className="h-4 w-4 animate-pulse" />
            </div>
            <div
              className={`transition-all duration-200 ${!isOpen ? "md:opacity-0 md:w-0 md:overflow-hidden md:hidden" : "opacity-100"}`}
            >
              <h2 className="font-black text-white text-xs tracking-wider whitespace-nowrap">
                VISION HEALTH
              </h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest whitespace-nowrap">
                Enterprise ERP
              </p>
            </div>
          </div>
        </div>

        {/* Navigation lists */}
        <nav className="flex-grow p-1.5 space-y-0.5 overflow-y-auto scrollbar-none">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 768) {
                    onClose();
                  }
                }}
                title={!isOpen ? item.name : undefined}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold tracking-wide transition-all duration-150 ${
                  !isOpen
                    ? "md:justify-center md:px-0 md:h-9 md:w-9 md:mx-auto"
                    : ""
                } ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                    : "hover:bg-slate-800/60 hover:text-white text-slate-400"
                }`}
              >
                <IconComponent className="h-3.5 w-3.5 shrink-0" />
                <span
                  className={`transition-all duration-200 ${!isOpen ? "md:opacity-0 md:w-0 md:overflow-hidden md:hidden" : "opacity-100"}`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* User Account / Footer */}
        <div
          className={`p-1.5 border-t border-slate-800 space-y-2 transition-all duration-300 ${!isOpen ? "md:px-1.5" : ""}`}
        >
          <div
            className={`flex items-center gap-2 transition-all duration-300 ${!isOpen ? "md:justify-center" : ""}`}
          >
            <div
              className="p-1.5 bg-slate-800 rounded-full text-slate-300 shrink-0"
              title={`${user.name} (${user.role})`}
            >
              <UserIcon className="h-3.5 w-3.5" />
            </div>
            <div
              className={`min-w-0 flex-grow transition-all duration-200 ${!isOpen ? "md:opacity-0 md:w-0 md:overflow-hidden md:hidden" : "opacity-100"}`}
            >
              <h4 className="text-xs font-black text-white truncate leading-tight whitespace-nowrap">
                {user.name}
              </h4>
              <p className="text-xs text-blue-400 font-bold uppercase tracking-wide mt-0.5 whitespace-nowrap">
                {user.role}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title={!isOpen ? "Sign Out" : undefined}
            className={`w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-slate-800/80 hover:bg-rose-950 hover:text-rose-400 rounded-lg text-xs font-bold text-slate-400 transition-all duration-150 ${
              !isOpen ? "md:h-9 md:w-9 md:p-0 md:mx-auto" : ""
            }`}
          >
            <LogOut className="h-3 w-3 shrink-0" />
            <span
              className={`transition-all duration-200 ${!isOpen ? "md:opacity-0 md:w-0 md:overflow-hidden md:hidden" : "opacity-100"}`}
            >
              Sign Out
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
