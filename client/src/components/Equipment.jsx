import React, { useState, useEffect } from "react";
import { apiCall } from "../utils/api";
import { Plus, Search, Edit2, Trash2, X, RefreshCw, Eye, CornerDownLeft, ShieldAlert } from "lucide-react";

export default function Equipment() {
  const [equipments, setEquipments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [selectedEq, setSelectedEq] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  // Core Form Fields
  const [equipmentName, setEquipmentName] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [dailyRentalPrice, setDailyRentalPrice] = useState("");
  const [monthlyRentalPrice, setMonthlyRentalPrice] = useState("");
  const [securityDeposit, setSecurityDeposit] = useState("");
  const [status, setStatus] = useState("Available");

  // Assign Form Fields
  const [assignedPatientId, setAssignedPatientId] = useState("");

  const [error, setError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const fetchEquipments = async () => {
    setLoading(true);
    try {
      let queryStr = [];
      if (search) queryStr.push(`search=${encodeURIComponent(search)}`);
      if (statusFilter) queryStr.push(`status=${encodeURIComponent(statusFilter)}`);
      
      const endpoint = queryStr.length > 0 ? `/equipment?${queryStr.join("&")}` : "/equipment";
      const res = await apiCall(endpoint);
      if (res.success) {
        setEquipments(res.data);
      }
    } catch (err) {
      console.error("Error fetching equipment:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      // Patients are Users with role "Patient"
      const res = await apiCall("/auth/profile"); // Just dummy or we can register a Patient list later
      // To get all patients, let's load them. Since we don't have a separate fetch patients route,
      // let's fetch patients by hitting the billing system or creating a simple user lookup.
      // Wait, let's look at registerUser. Admin can query users, let's add a patient query endpoint or load patients from our list.
      // Wait, we can fetch all users and filter role === Patient if authorized, or fetch from /auth route.
      // Since /auth/profile is private, let's create a Patient Management screen too where we keep a list of patients!
      // For now, let's query patients using localStorage or fetch them.
      const storedPatients = JSON.parse(localStorage.getItem("demo_patients") || "[]");
      setPatients(storedPatients);
    } catch (err) {
      console.log("Error loading patients:", err);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchEquipments();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search, statusFilter]);

  useEffect(() => {
    fetchPatients();
  }, [showAssignForm]);

  const handleOpenForm = (item = null) => {
    setError("");
    if (item) {
      setEditingItem(item);
      setEquipmentName(item.equipmentName);
      setSerialNumber(item.serialNumber || "");
      setDailyRentalPrice(item.dailyRentalPrice);
      setMonthlyRentalPrice(item.monthlyRentalPrice);
      setSecurityDeposit(item.securityDeposit);
      setStatus(item.status);
    } else {
      setEditingItem(null);
      setEquipmentName("");
      setSerialNumber("");
      setDailyRentalPrice("");
      setMonthlyRentalPrice("");
      setSecurityDeposit("");
      setStatus("Available");
    }
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const handleOpenAssign = (item) => {
    setSelectedEq(item);
    setAssignedPatientId("");
    setError("");
    setShowAssignForm(true);
  };

  const handleCloseAssign = () => {
    setShowAssignForm(false);
    setSelectedEq(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFormLoading(true);

    const payload = {
      equipmentName: equipmentName.trim(),
      serialNumber: serialNumber.trim() || undefined,
      dailyRentalPrice: parseFloat(dailyRentalPrice),
      monthlyRentalPrice: parseFloat(monthlyRentalPrice),
      securityDeposit: parseFloat(securityDeposit),
      status,
    };

    try {
      if (editingItem) {
        await apiCall(`/equipment/${editingItem._id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiCall("/equipment", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      fetchEquipments();
      handleCloseForm();
    } catch (err) {
      setError(err.message || "Failed to save equipment.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this equipment?")) return;
    try {
      await apiCall(`/equipment/${id}`, { method: "DELETE" });
      fetchEquipments();
    } catch (err) {
      alert("Failed to delete equipment: " + err.message);
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFormLoading(true);

    try {
      await apiCall(`/equipment/${selectedEq._id}/assign`, {
        method: "POST",
        body: JSON.stringify({ patientId: assignedPatientId }),
      });
      fetchEquipments();
      handleCloseAssign();
    } catch (err) {
      setError(err.message || "Failed to assign equipment.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleReturn = async (id) => {
    if (!window.confirm("Are you sure you want to return this equipment to Available status?")) return;
    try {
      await apiCall(`/equipment/${id}/return`, { method: "POST" });
      fetchEquipments();
    } catch (err) {
      alert("Failed to return equipment: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">ICU Equipment Rental</h1>
          <p className="text-sm text-slate-500 font-medium">Manage ICU beds, oxygen concentrators, and medical devices</p>
        </div>
        <button
          onClick={() => handleOpenForm()}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition duration-150"
        >
          <Plus className="h-4 w-4" />
          Add Equipment
        </button>
      </div>

      {/* Controls & Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Search by Equipment Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Rented">Rented</option>
            <option value="Maintenance">Maintenance</option>
          </select>

          <button
            onClick={fetchEquipments}
            className="p-2 border border-slate-100 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 transition"
            title="Force Reload"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Equipment Grid */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading && equipments.length === 0 ? (
          <div className="p-10 text-center text-slate-500 font-semibold">Loading rental fleets...</div>
        ) : equipments.length === 0 ? (
          <div className="p-10 text-center text-slate-400 font-semibold">No equipments registered yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-5 py-3 text-left text-xxs font-bold text-slate-400 uppercase">Equipment Name</th>
                  <th className="px-5 py-3 text-left text-xxs font-bold text-slate-400 uppercase">Serial Number</th>
                  <th className="px-5 py-3 text-right text-xxs font-bold text-slate-400 uppercase">Daily Rent</th>
                  <th className="px-5 py-3 text-right text-xxs font-bold text-slate-400 uppercase">Monthly Rent</th>
                  <th className="px-5 py-3 text-right text-xxs font-bold text-slate-400 uppercase">Security Deposit</th>
                  <th className="px-5 py-3 text-center text-xxs font-bold text-slate-400 uppercase">Status</th>
                  <th className="px-5 py-3 text-left text-xxs font-bold text-slate-400 uppercase">Current Patient / Date</th>
                  <th className="px-5 py-3 text-right text-xxs font-bold text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {equipments.map((eq) => (
                  <tr key={eq._id} className="hover:bg-slate-50/50 transition">
                    <td className="px-5 py-3 whitespace-nowrap text-xs font-bold text-slate-700">
                      {eq.equipmentName}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-xs text-slate-500 font-mono">
                      {eq.serialNumber || "-"}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-xs text-right font-semibold text-slate-600">
                      Rs. {eq.dailyRentalPrice.toFixed(2)}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-xs text-right font-semibold text-slate-600">
                      Rs. {eq.monthlyRentalPrice.toFixed(2)}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-xs text-right font-semibold text-slate-600">
                      Rs. {eq.securityDeposit.toFixed(2)}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xxs font-bold ${
                          eq.status === "Available"
                            ? "bg-emerald-50 text-emerald-600"
                            : eq.status === "Rented"
                            ? "bg-blue-50 text-blue-600"
                            : "bg-amber-50 text-orange-600"
                        }`}
                      >
                        {eq.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-xs">
                      {eq.status === "Rented" && eq.currentPatientId ? (
                        <div>
                          <div className="font-bold text-slate-700">{eq.currentPatientId.name}</div>
                          <div className="text-xxs text-slate-400">
                            Since: {eq.rentalStartDate ? new Date(eq.rentalStartDate).toLocaleDateString("en-IN") : "N/A"}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-right text-xs">
                      <div className="flex justify-end gap-2">
                        {eq.status === "Available" && (
                          <button
                            onClick={() => handleOpenAssign(eq)}
                            className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded text-xxs font-bold transition"
                            title="Rent to Patient"
                          >
                            Rent Out
                          </button>
                        )}
                        {eq.status === "Rented" && (
                          <button
                            onClick={() => handleReturn(eq._id)}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded text-xxs font-bold transition"
                            title="Return to Stock"
                          >
                            Return Fleets
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenForm(eq)}
                          className="p-1 bg-slate-100 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                          title="Edit"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(eq._id)}
                          disabled={eq.status === "Rented"}
                          className="p-1 bg-slate-100 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded transition disabled:opacity-30"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Core Equipment Form Model */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h2 className="font-extrabold text-slate-800 text-sm">
                {editingItem ? "Edit Equipment Detail" : "Add Rentable ICU Setup"}
              </h2>
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

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase">Equipment Name</label>
                  <input
                    type="text"
                    required
                    value={equipmentName}
                    onChange={(e) => setEquipmentName(e.target.value)}
                    placeholder="ICU Bed Deluxe, Oxygen Concentrator, Syringe Pump"
                    className="mt-1 block w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Serial Number (Unique)</label>
                  <input
                    type="text"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="SN-BED-228"
                    className="mt-1 block w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Rental Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    disabled={editingItem && editingItem.status === "Rented"}
                    className="mt-1 block w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="Available">Available</option>
                    <option value="Maintenance">Maintenance</option>
                    {editingItem && editingItem.status === "Rented" && <option value="Rented">Rented</option>}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Daily Rental Price</label>
                  <input
                    type="number"
                    required
                    value={dailyRentalPrice}
                    onChange={(e) => setDailyRentalPrice(e.target.value)}
                    placeholder="Rs. 450"
                    className="mt-1 block w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Monthly Rental Price</label>
                  <input
                    type="number"
                    required
                    value={monthlyRentalPrice}
                    onChange={(e) => setMonthlyRentalPrice(e.target.value)}
                    placeholder="Rs. 9500"
                    className="mt-1 block w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase">Security Deposit Amount</label>
                  <input
                    type="number"
                    required
                    value={securityDeposit}
                    onChange={(e) => setSecurityDeposit(e.target.value)}
                    placeholder="Rs. 5000"
                    className="mt-1 block w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  {formLoading ? "Saving..." : editingItem ? "Update FLEETS" : "Save FLEETS"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign to Patient Model */}
      {showAssignForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h2 className="font-extrabold text-slate-800 text-sm">
                Assign Equipment: {selectedEq?.equipmentName}
              </h2>
              <button onClick={handleCloseAssign} className="text-slate-400 hover:text-slate-600 transition">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                  <p className="text-xs text-red-700 font-semibold">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase">Select Registered Patient</label>
                {patients.length === 0 ? (
                  <div className="mt-2 text-xs text-rose-500 font-semibold flex items-center gap-1">
                    <ShieldAlert className="h-4 w-4" />
                    No patient found! Register patients under 'Patients' menu first.
                  </div>
                ) : (
                  <select
                    required
                    value={assignedPatientId}
                    onChange={(e) => setAssignedPatientId(e.target.value)}
                    className="mt-1 block w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">-- Choose Patient --</option>
                    {patients.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} ({p.phoneNumber || "No Phone"})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseAssign}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading || !assignedPatientId}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition disabled:opacity-50"
                >
                  {formLoading ? "Assigning..." : "Assign Out"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
