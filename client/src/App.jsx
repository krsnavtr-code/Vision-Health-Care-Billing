import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./components/Login";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import Inventory from "./components/Inventory";
import Equipment from "./components/Equipment";
import Patients from "./components/Patients";
import POS from "./components/POS";
import BusinessSettings from "./components/BusinessSettings";

export default function App() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

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
    navigate("/dashboard");
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

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* SIDEBAR NAVIGATION */}
      <Sidebar user={user} handleLogout={handleLogout} />

      {/* MAIN LAYOUT CONTENT */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Top Header */}
        <Header />

        {/* Main Routing Wrapper */}
        <main className="flex-grow p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          <Routes>
            <Route
              path="/dashboard"
              element={<Dashboard onNavigateToPos={() => navigate("/pos")} />}
            />
            <Route path="/pos" element={<POS />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/rentals" element={<Equipment />} />
            <Route path="/patients" element={<Patients />} />
            {user && (user.role === "Admin" || user.role === "Manager") && (
              <Route path="/settings" element={<BusinessSettings />} />
            )}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
