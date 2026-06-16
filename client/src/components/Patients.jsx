import React, { useState, useEffect } from "react";
import { apiCall } from "../utils/api";
import { Plus, Search, X, User, Phone, MapPin, Mail, RefreshCw } from "lucide-react";

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  
  const [error, setError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      // In our design, we register patients as Users with role "Patient"
      // Let's load registered patients from localStorage or fetch profile
      // To load all Patients, we can register them. We also keep a cache in localStorage for fast UX in client
      const storedPatients = JSON.parse(localStorage.getItem("demo_patients") || "[]");
      setPatients(storedPatients);
    } catch (err) {
      console.error("Error loading patients:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleOpenForm = () => {
    setName("");
    setEmail("");
    setPhoneNumber("");
    setAddress("");
    setError("");
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFormLoading(true);

    const emailStr = email.trim() || `patient_${Date.now()}@vision.com`;

    try {
      // Register Patient as a DB User
      const res = await apiCall("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          email: emailStr.toLowerCase(),
          password: "patient123", // Default password for patient accounts
          role: "Patient",
          phoneNumber: phoneNumber.trim(),
          address: address.trim(),
        }),
      });

      if (res.success) {
        // Save to Local patients list cache for easy access
        const newPatient = res.data;
        // Wait, auth register returns { _id, name, email, role, token }.
        // Let's normalize it to save name, email, phoneNumber, address in localStorage
        const normalized = {
          _id: newPatient._id,
          name: name.trim(),
          email: emailStr,
          phoneNumber: phoneNumber.trim(),
          address: address.trim(),
        };

        const storedPatients = JSON.parse(localStorage.getItem("demo_patients") || "[]");
        const updated = [normalized, ...storedPatients];
        localStorage.setItem("demo_patients", JSON.stringify(updated));
        setPatients(updated);
        handleCloseForm();
      }
    } catch (err) {
      setError(err.message || "Failed to register patient.");
    } finally {
      setFormLoading(false);
    }
  };

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.phoneNumber && p.phoneNumber.includes(search))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Patient Directory</h1>
          <p className="text-sm text-slate-500 font-medium font-semibold">Register and manage hospital patients</p>
        </div>
        <button
          onClick={handleOpenForm}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition duration-150"
        >
          <Plus className="h-4 w-4" />
          Add New Patient
        </button>
      </div>

      {/* Control Box */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex gap-4 items-center">
        <div className="relative w-full md:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Search by Patient Name or Phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        <button
          onClick={fetchPatients}
          className="p-2 border border-slate-100 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 transition"
          title="Reload Directory"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Listing Directory */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {filteredPatients.length === 0 ? (
          <div className="p-12 text-center">
            <User className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400 font-bold">No registered patients match your query.</p>
            <p className="text-xs text-slate-400 mt-1">Add a new patient to generate custom bills.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-5 py-3 text-left text-xxs font-bold text-slate-400 uppercase">Patient Name</th>
                  <th className="px-5 py-3 text-left text-xxs font-bold text-slate-400 uppercase">Phone Number</th>
                  <th className="px-5 py-3 text-left text-xxs font-bold text-slate-400 uppercase">Email Address</th>
                  <th className="px-5 py-3 text-left text-xxs font-bold text-slate-400 uppercase">Home Address</th>
                  <th className="px-5 py-3 text-center text-xxs font-bold text-slate-400 uppercase">System ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/50 transition">
                    <td className="px-5 py-3 whitespace-nowrap text-xs font-bold text-slate-700 flex items-center gap-2">
                      <div className="p-1.5 rounded-full bg-slate-100 text-slate-500">
                        <User className="h-3.5 w-3.5" />
                      </div>
                      {p.name}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-xs text-slate-600 font-medium">
                      {p.phoneNumber || "-"}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-xs text-slate-500">
                      {p.email}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-xs text-slate-500 max-w-xs truncate">
                      {p.address || "-"}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-center text-xxs font-mono text-slate-400">
                      {p._id}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Register Patient Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h2 className="font-extrabold text-slate-800 text-sm">Register New Patient</h2>
              <button onClick={handleCloseForm} className="text-slate-400 hover:text-slate-600 transition">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                  <p className="text-xs text-red-700 font-semibold">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase">Patient Name (Required)</label>
                <div className="mt-1 relative rounded-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ramesh Kumar"
                    className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase">Phone Number</label>
                <div className="mt-1 relative rounded-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 98765 00000"
                    className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase">Email Address (Optional)</label>
                <div className="mt-1 relative rounded-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ramesh@gmail.com"
                    className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase">Permanent Address</label>
                <div className="mt-1 relative rounded-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Sector 62, Noida"
                    className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition disabled:opacity-50"
                >
                  {formLoading ? "Registering..." : "Register Patient"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
