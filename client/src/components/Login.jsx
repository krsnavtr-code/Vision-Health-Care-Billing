import React, { useState } from "react";
import { apiCall } from "../utils/api";
import {
  Lock,
  Mail,
  User,
  Shield,
  Phone,
  MapPin,
  Activity,
  Clock,
  ChevronRight,
} from "lucide-react";

export default function Login({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("Nurse/Staff");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Registration Pending Approval screen state
  const [regPending, setRegPending] = useState(false);
  const [regUserEmail, setRegUserEmail] = useState("");
  const [regUserRole, setRegUserRole] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        // Normalize role "Nurse/Staff" -> "Nurse/Staff" as expected by Mongoose enum
        const res = await apiCall("/auth/register", {
          method: "POST",
          body: JSON.stringify({
            name,
            email,
            password,
            role,
            phoneNumber,
            address,
          }),
        });

        if (res.success) {
          if (res.data.isApproved) {
            // First user or auto-approved
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data));
            onLoginSuccess(res.data);
          } else {
            // Public registration - pending approval
            setRegUserEmail(res.data.email);
            setRegUserRole(res.data.role);
            setRegPending(true);

            // Clear inputs
            setName("");
            setEmail("");
            setPassword("");
            setPhoneNumber("");
            setAddress("");
          }
        }
      } else {
        const res = await apiCall("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        if (res.success) {
          localStorage.setItem("token", res.data.token);
          localStorage.setItem("user", JSON.stringify(res.data));
          onLoginSuccess(res.data);
        }
      }
    } catch (err) {
      setError(err.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Render Pending Approval Screen
  if (regPending) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center text-amber-500 mb-2">
            <Clock className="h-12 w-12 animate-pulse" />
          </div>
          <h2 className="text-center text-lg font-extrabold text-slate-900 tracking-tight">
            Account Pending Approval
          </h2>
          <p className="mt-2 text-center text-xs text-slate-600">
            Vision Health Care Portal
          </p>
        </div>

        <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-6 px-5 shadow-xl rounded-xl border border-slate-100 space-y-4">
            <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-r-lg">
              <h3 className="text-xs font-bold text-amber-800">
                Registration Successful!
              </h3>
              <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                Your account is currently registered as{" "}
                <strong>PENDING APPROVAL</strong>. Only approved users are
                authorized to access the system core.
              </p>
            </div>

            <div className="border border-slate-100 rounded-lg p-3 bg-slate-50/50 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="font-bold text-slate-500">
                  Registered Email:
                </span>
                <span className="font-black text-slate-800">
                  {regUserEmail}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-slate-500">
                  Requested Access Role:
                </span>
                <span className="font-black text-blue-600 uppercase">
                  {regUserRole}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500 text-center leading-relaxed">
              Please contact your Branch Manager or Administrator to approve
              your account. You will be able to log in immediately once
              approved.
            </p>

            <button
              onClick={() => {
                setRegPending(false);
                setIsRegister(false);
                setError("");
              }}
              className="w-full flex justify-center items-center gap-1.5 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow transition duration-150"
            >
              Go to Login Page
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-blue-600 mb-2">
          <Activity className="h-10 w-10 animate-pulse" />
        </div>
        <h2 className="text-center text-xl font-extrabold text-slate-900 tracking-tight">
          Vision Health Care
        </h2>
        <p className="mt-2 text-center text-xs text-slate-600">
          Smart ERP & Billing Engine
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 px-4 shadow-xl rounded-xl sm:px-6 border border-slate-100">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-md">
                <p className="text-xs text-red-700 font-medium">{error}</p>
              </div>
            )}

            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Full Name
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
                    placeholder="Dr. Alok Sharma"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Email Address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
                  placeholder="admin@vision.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {isRegister && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Role
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Shield className="h-4 w-4" />
                      </div>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs bg-white"
                      >
                        <option value="Admin">Admin</option>
                        <option value="Manager">Manager</option>
                        <option value="Nurse/Staff">Nurse/Staff</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Phone
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Phone className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Address
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
                      placeholder="Hospital Unit / Branch"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 disabled:opacity-50"
              >
                {loading ? "Please wait..." : isRegister ? "Sign Up" : "Log In"}
              </button>
            </div>
          </form>

          <div className="mt-4 border-t border-slate-100 pt-3 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError("");
              }}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 transition duration-150"
            >
              {isRegister
                ? "Already have an account? Log In"
                : "Need an enterprise account? Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
