import React from "react";
import { useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function Header({ isOpen, onMenuToggle }) {
  const location = useLocation();

  // Auto-resolve title from URL segment elegantly
  const getTabName = () => {
    const segment = location.pathname.split("/")[1] || "";
    if (!segment || segment === "dashboard") return "Dashboard";

    // Handle special acronyms / exceptions
    const specialCases = {
      pos: "POS / Billing",
      rentals: "Equipment Rentals",
      settings: "Business Settings",
    };

    if (specialCases[segment]) {
      return specialCases[segment];
    }

    // Auto capitalize and format hyphens (e.g., staff-shifts -> Staff Shifts)
    return segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const currentTabName = getTabName();

  return (
    <header className="h-12 bg-white border-b border-slate-100 px-1.5 md:px-3 flex justify-between items-center shrink-0">
      <div className="flex items-center gap-2 md:gap-3">
        {/* Mobile & Desktop menu toggle button */}
        <button
          onClick={onMenuToggle}
          className="p-1 hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded-lg transition border border-slate-100"
          aria-label="Toggle sidebar"
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>

        <div>
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
            Workspace
          </span>
          <h2 className="text-xs font-black text-slate-700 uppercase tracking-wider">
            {currentTabName} Hub
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
        <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping" />
        <span className="hidden sm:inline">Connection Secure (Cloud DB)</span>
      </div>
    </header>
  );
}
