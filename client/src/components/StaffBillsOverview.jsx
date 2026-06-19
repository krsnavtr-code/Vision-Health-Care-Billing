import React, { useState, useEffect } from "react";
import { apiCall } from "../utils/api";
import {
  User,
  FileText,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Calendar,
  Download,
  X,
  RefreshCw,
} from "lucide-react";

export default function StaffBillsOverview() {
  const [staffBills, setStaffBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedStaff, setExpandedStaff] = useState({});

  const fetchStaffBills = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await apiCall("/staff-invoices/overview");
      if (res.success) {
        setStaffBills(res.data);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch staff bills overview");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffBills();
  }, []);

  const toggleStaffExpand = (staffId) => {
    setExpandedStaff((prev) => ({
      ...prev,
      [staffId]: !prev[staffId],
    }));
  };

  const downloadPDF = async (invoiceId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/staff-invoices/${invoiceId}/pdf`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to download PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `staff-invoice-${invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Download error:", err);
      alert("Failed to download PDF");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">
              Staff Bills Overview
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              View all generated staff bills grouped by employee
            </p>
          </div>
          <button
            onClick={fetchStaffBills}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-800 hover:border-slate-300 transition duration-150"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto mb-4">
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 flex items-center gap-2">
            <X className="h-4 w-4 text-rose-500" />
            <p className="text-xs text-rose-700 font-bold">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && staffBills.length === 0 && (
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl border border-slate-100 p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-100 rounded-full mb-3">
              <RefreshCw className="h-6 w-6 text-slate-400 animate-spin" />
            </div>
            <p className="text-sm text-slate-500 font-semibold">
              Loading staff bills...
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && staffBills.length === 0 && (
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl border border-slate-100 p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-100 rounded-full mb-3">
              <FileText className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm text-slate-500 font-semibold">
              No staff bills found
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Generate staff invoices to see them here
            </p>
          </div>
        </div>
      )}

      {/* Staff Bills List */}
      {!loading && staffBills.length > 0 && (
        <div className="max-w-7xl mx-auto space-y-3">
          {staffBills.map((staffBill) => {
            const isExpanded = expandedStaff[staffBill.staff._id];
            return (
              <div
                key={staffBill.staff._id}
                className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden"
              >
                {/* Staff Header */}
                <div
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition"
                  onClick={() => toggleStaffExpand(staffBill.staff._id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-800">
                        {staffBill.staff.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {staffBill.staff.phone || "No phone"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-400 uppercase">
                        Total Bills
                      </p>
                      <p className="text-sm font-black text-slate-800">
                        {staffBill.totalBills}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-400 uppercase">
                        Total Amount
                      </p>
                      <p className="text-sm font-black text-emerald-600">
                        ₹{staffBill.totalAmount.toFixed(2)}
                      </p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Bills */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/50">
                    <div className="p-4">
                      <table className="min-w-full divide-y divide-slate-100">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-bold text-slate-400 uppercase">
                              Bill No
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-bold text-slate-400 uppercase">
                              Create Date
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-bold text-slate-400 uppercase">
                              Bill Month
                            </th>
                            <th className="px-3 py-2 text-right text-xs font-bold text-slate-400 uppercase">
                              Amount
                            </th>
                            <th className="px-3 py-2 text-center text-xs font-bold text-slate-400 uppercase">
                              Status
                            </th>
                            <th className="px-3 py-2 text-center text-xs font-bold text-slate-400 uppercase">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {staffBill.invoices.map((invoice) => (
                            <tr
                              key={invoice._id}
                              className="hover:bg-slate-50 transition"
                            >
                              <td className="px-3 py-2 whitespace-nowrap text-xs font-bold text-slate-700">
                                {invoice.invoiceNumber}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-xs text-slate-600">
                                {formatDate(invoice.createdAt)}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-xs text-slate-600">
                                {new Date(
                                  invoice.billingPeriod.startDate,
                                ).toLocaleDateString("en-IN", {
                                  month: "short",
                                  year: "numeric",
                                })}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-right text-xs font-semibold text-slate-800">
                                ₹{invoice.totalAmount?.toFixed(2) || "0.00"}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-center">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                                    invoice.paymentStatus === "Paid"
                                      ? "bg-emerald-50 text-emerald-600"
                                      : invoice.paymentStatus ===
                                          "Partially Paid"
                                        ? "bg-amber-50 text-amber-600"
                                        : "bg-rose-50 text-rose-600"
                                  }`}
                                >
                                  {invoice.paymentStatus}
                                </span>
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-center">
                                <button
                                  onClick={() => downloadPDF(invoice._id)}
                                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                  title="Download PDF"
                                >
                                  <Download className="h-3.5 w-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
