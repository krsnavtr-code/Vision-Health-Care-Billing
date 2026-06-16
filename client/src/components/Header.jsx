import React from "react";
import { useLocation } from "react-router-dom";

export default function Header() {
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
    <header className="h-16 bg-white border-b border-slate-100 px-8 flex justify-between items-center shrink-0">
      <div>
        <span className="text-xxs font-black text-slate-400 uppercase tracking-widest">
          Workspace
        </span>
        <h2 className="text-xs font-black text-slate-700 uppercase tracking-wider">
          {currentTabName} Hub
        </h2>
      </div>

      <div className="flex items-center gap-3 text-xs text-slate-500 font-bold">
        <span className="h-2 w-2 bg-emerald-500 rounded-full animate-ping" />
        <span>Connection Secure (Cloud DB)</span>
      </div>
    </header>
  );
}
