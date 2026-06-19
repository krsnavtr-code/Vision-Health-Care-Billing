import React, { useState, useEffect } from "react";
import { apiCall } from "../utils/api";
import {
  Users,
  Plus,
  Edit,
  Trash2,
  X,
  RefreshCw,
  ShieldAlert,
  Building2,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Calendar,
} from "lucide-react";

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    department: "Nursing",
    designation: "",
    employmentType: "Full-time",
    address: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",
    upiId: "",
    status: "Active",
  });

  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await apiCall("/staff");
      if (res.success) {
        setStaff(res.data);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch staff");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleOpenForm = (staffMember = null) => {
    if (staffMember) {
      setEditingStaff(staffMember);
      setFormData({
        name: staffMember.name || "",
        email: staffMember.email || "",
        phoneNumber: staffMember.phoneNumber || "",
        department: staffMember.department || "Nursing",
        designation: staffMember.designation || "",
        employmentType: staffMember.employmentType || "Full-time",
        address: staffMember.address || "",
        emergencyContactName: staffMember.emergencyContact?.name || "",
        emergencyContactPhone: staffMember.emergencyContact?.phoneNumber || "",
        emergencyContactRelation: staffMember.emergencyContact?.relation || "",
        upiId: staffMember.upiId || "",
        status: staffMember.status || "Active",
      });
    } else {
      setEditingStaff(null);
      setFormData({
        name: "",
        email: "",
        phoneNumber: "",
        department: "Nursing",
        designation: "",
        employmentType: "Full-time",
        address: "",
        emergencyContactName: "",
        emergencyContactPhone: "",
        emergencyContactRelation: "",
        upiId: "",
        status: "Active",
      });
    }
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingStaff(null);
    setFormData({
      name: "",
      email: "",
      phoneNumber: "",
      department: "Nursing",
      designation: "",
      employmentType: "Full-time",
      address: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      emergencyContactRelation: "",
      upiId: "",
      status: "Active",
    });
  };

  const handleToggleStatus = async (member) => {
    try {
      const newStatus = member.status === "Active" ? "Inactive" : "Active";
      await apiCall(`/staff/${member._id}`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });
      fetchStaff();
    } catch (err) {
      setError(err.message || "Failed to update status");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      setError("");

      const payload = {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        department: formData.department,
        designation: formData.designation,
        employmentType: formData.employmentType,
        address: formData.address,
        emergencyContact: {
          name: formData.emergencyContactName,
          phoneNumber: formData.emergencyContactPhone,
          relation: formData.emergencyContactRelation,
        },
        upiId: formData.upiId,
        status: formData.status,
      };

      if (editingStaff) {
        if (!editingStaff._id) {
          setError("Invalid staff member ID. Please try again.");
          setFormLoading(false);
          return;
        }
        await apiCall(`/staff/${editingStaff._id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiCall("/staff", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      handleCloseForm();
      fetchStaff();
    } catch (err) {
      setError(err.message || "Failed to save staff");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this staff member?")) {
      return;
    }

    try {
      await apiCall(`/staff/${id}`, { method: "DELETE" });
      fetchStaff();
    } catch (err) {
      setError(err.message || "Failed to delete staff");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">
              Staff Management
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage staff members and their details
            </p>
          </div>
          <button
            onClick={() => handleOpenForm(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-md hover:shadow-lg transition duration-150"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Staff
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto mb-4">
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-rose-500" />
            <p className="text-xs text-rose-700 font-bold">{error}</p>
          </div>
        </div>
      )}

      {/* Staff List */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <RefreshCw className="h-6 w-6 text-slate-400 mx-auto mb-2 animate-spin" />
              <p className="text-sm text-slate-500 font-semibold">
                Loading staff...
              </p>
            </div>
          ) : staff.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500 font-semibold">
                No staff members found
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Add staff members to get started
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-bold text-slate-400 uppercase">
                      Name
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-bold text-slate-400 uppercase">
                      Department
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-bold text-slate-400 uppercase">
                      Designation
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-bold text-slate-400 uppercase">
                      Phone
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-bold text-slate-400 uppercase">
                      Status
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-bold text-slate-400 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {staff.map((member) => (
                    <tr
                      key={member._id}
                      className="hover:bg-slate-50/50 transition"
                    >
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="text-xs font-bold text-slate-700">
                          {member.name}
                        </div>
                        <div className="text-xxs text-slate-400">
                          {member.email}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-slate-600">
                        {member.department}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-slate-600">
                        {member.designation}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-slate-600">
                        {member.phoneNumber}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span
                          onClick={() => handleToggleStatus(member)}
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold cursor-pointer hover:opacity-80 transition ${
                            member.status === "Active"
                              ? "bg-emerald-50 text-emerald-600"
                              : member.status === "Inactive"
                                ? "bg-rose-50 text-rose-600"
                                : member.status === "On Leave"
                                  ? "bg-amber-50 text-amber-600"
                                  : "bg-rose-50 text-rose-600"
                          }`}
                          title="Click to toggle status"
                        >
                          {member.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenForm(member)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(member._id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
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
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-4 py-3 flex justify-between items-center">
              <h2 className="text-sm font-extrabold text-slate-800">
                {editingStaff ? "Edit Staff" : "Add New Staff"}
              </h2>
              <button
                onClick={handleCloseForm}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-md">
                  <p className="text-xs text-red-700 font-semibold">{error}</p>
                </div>
              )}

              {/* Basic Information */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-slate-500 uppercase flex items-center gap-2">
                  <Users className="h-3 w-3" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                      Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phoneNumber: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                      Department <span className="text-rose-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.department}
                      onChange={(e) =>
                        setFormData({ ...formData, department: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="Nursing">Nursing</option>
                      <option value="Administration">Administration</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Support">Support</option>
                      <option value="Management">Management</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                      Designation <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.designation}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          designation: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                      Employment Type <span className="text-rose-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.employmentType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          employmentType: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Intern">Intern</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-slate-500 uppercase flex items-center gap-2">
                  <Phone className="h-3 w-3" />
                  Emergency Contact
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={formData.emergencyContactName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          emergencyContactName: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.emergencyContactPhone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          emergencyContactPhone: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                      Relation
                    </label>
                    <input
                      type="text"
                      value={formData.emergencyContactRelation}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          emergencyContactRelation: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* UPI Details */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-slate-500 uppercase flex items-center gap-2">
                  <Building2 className="h-3 w-3" />
                  UPI Details
                </h3>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    UPI ID
                  </label>
                  <input
                    type="text"
                    value={formData.upiId}
                    onChange={(e) =>
                      setFormData({ ...formData, upiId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., example@upi"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                      Status <span className="text-rose-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="On Leave">On Leave</option>
                      <option value="Terminated">Terminated</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition disabled:opacity-50"
                >
                  {formLoading
                    ? "Saving..."
                    : editingStaff
                      ? "Update"
                      : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
