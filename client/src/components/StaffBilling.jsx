import React, { useState, useEffect } from "react";
import { apiCall } from "../utils/api";
import {
  FileText,
  Plus,
  Trash2,
  RefreshCw,
  DollarSign,
  Calendar,
  Download,
  ShieldAlert,
  User,
  X,
  CheckCircle,
} from "lucide-react";

export default function StaffBilling() {
  const [staff, setStaff] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [billingPeriod, setBillingPeriod] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const [totalSalary, setTotalSalary] = useState("");
  const [deduction, setDeduction] = useState("0");
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [notes, setNotes] = useState("");

  const fetchStaff = async () => {
    try {
      const res = await apiCall("/staff");
      if (res.success) {
        setStaff(res.data.filter((s) => s.status === "Active"));
      }
    } catch (err) {
      console.error("Failed to fetch staff:", err);
    }
  };

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await apiCall("/staff-invoices");
      if (res.success) {
        setInvoices(res.data);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
    fetchInvoices();
  }, []);

  const handleGenerateInvoice = async (e) => {
    e.preventDefault();

    if (!selectedStaffId) {
      setError("Please select a staff member");
      return;
    }
    if (!billingPeriod.month || !billingPeriod.year) {
      setError("Please select billing period");
      return;
    }

    try {
      setFormLoading(true);
      setError("");

      // Convert month/year to startDate/endDate
      const startDate = new Date(
        billingPeriod.year,
        billingPeriod.month - 1,
        1,
      );
      const endDate = new Date(billingPeriod.year, billingPeriod.month, 0);

      const totalSalaryNum = parseFloat(totalSalary) || 0;
      const deductionNum = parseFloat(deduction) || 0;
      const amountPaidNum = totalSalaryNum - deductionNum;

      const payload = {
        staffId: selectedStaffId,
        billingPeriod: {
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
        },
        totalAmount: totalSalaryNum,
        deduction: deductionNum,
        amountPaid: amountPaidNum,
        paymentMethod,
        notes,
      };

      const res = await apiCall("/staff-invoices", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.success) {
        setShowForm(false);
        setSelectedStaffId("");
        setBillingPeriod({
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
        });
        setTotalSalary("");
        setDeduction("0");
        setPaymentMethod("Bank Transfer");
        setNotes("");
        fetchInvoices();
      }
    } catch (err) {
      setError(err.message || "Failed to generate invoice");
    } finally {
      setFormLoading(false);
    }
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
    return new Date(dateString).toLocaleDateString("en-IN");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">
              Staff Billing
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Generate official work bills for staff members
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-md hover:shadow-lg transition duration-150"
          >
            <Plus className="h-3.5 w-3.5" />
            Generate Bill
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

      {/* Invoices List */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <RefreshCw className="h-6 w-6 text-slate-400 mx-auto mb-2 animate-spin" />
              <p className="text-sm text-slate-500 font-semibold">
                Loading invoices...
              </p>
            </div>
          ) : invoices.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500 font-semibold">
                No invoices found
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Generate staff bills to see them here
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-bold text-slate-400 uppercase">
                      Bill No
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-bold text-slate-400 uppercase">
                      Staff
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-bold text-slate-400 uppercase">
                      Period
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-bold text-slate-400 uppercase">
                      Net Payable
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
                  {invoices.map((invoice) => (
                    <tr
                      key={invoice._id}
                      className="hover:bg-slate-50/50 transition"
                    >
                      <td className="px-3 py-2 whitespace-nowrap text-xs font-bold text-slate-700">
                        {invoice.invoiceNumber}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="text-xs font-bold text-slate-700">
                          {invoice.staffId?.name}
                        </div>
                        <div className="text-xxs text-slate-400">
                          {invoice.staffId?.designation}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-slate-600">
                        {formatDate(invoice.billingPeriod.startDate)} -{" "}
                        {formatDate(invoice.billingPeriod.endDate)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-right text-xs font-semibold text-slate-800">
                        ₹{invoice.totalAmount?.toFixed(2) || "0.00"}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                            invoice.paymentStatus === "Paid"
                              ? "bg-emerald-50 text-emerald-600"
                              : invoice.paymentStatus === "Partially Paid"
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
          )}
        </div>
      </div>

      {/* Generate Invoice Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-4 py-3 flex justify-between items-center">
              <h2 className="text-sm font-extrabold text-slate-800">
                Generate Staff Bill
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleGenerateInvoice} className="p-4 space-y-4">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-md">
                  <p className="text-xs text-red-700 font-semibold">{error}</p>
                </div>
              )}

              {/* Staff Selection */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-slate-500 uppercase flex items-center gap-2">
                  <User className="h-3 w-3" />
                  Staff Selection
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                      Select Staff
                    </label>
                    <select
                      required
                      value={selectedStaffId}
                      onChange={(e) => setSelectedStaffId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="">-- Select Staff --</option>
                      {staff.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name} - {s.designation}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                      Payment Method
                    </label>
                    <select
                      required
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cash">Cash</option>
                      <option value="Cheque">Cheque</option>
                      <option value="UPI">UPI</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Billing Period */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-slate-500 uppercase flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  Billing Period
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                      Month
                    </label>
                    <select
                      required
                      value={billingPeriod.month}
                      onChange={(e) =>
                        setBillingPeriod({
                          ...billingPeriod,
                          month: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value={1}>January</option>
                      <option value={2}>February</option>
                      <option value={3}>March</option>
                      <option value={4}>April</option>
                      <option value={5}>May</option>
                      <option value={6}>June</option>
                      <option value={7}>July</option>
                      <option value={8}>August</option>
                      <option value={9}>September</option>
                      <option value={10}>October</option>
                      <option value={11}>November</option>
                      <option value={12}>December</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                      Year
                    </label>
                    <select
                      required
                      value={billingPeriod.year}
                      onChange={(e) =>
                        setBillingPeriod({
                          ...billingPeriod,
                          year: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      {[...Array(5)].map((_, i) => {
                        const year = new Date().getFullYear() - 2 + i;
                        return (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-slate-500 uppercase">
                  Payment Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                      Total Salary (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={totalSalary}
                      onChange={(e) => setTotalSalary(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                      Deduction (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={deduction}
                      onChange={(e) => setDeduction(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                      Notes
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition disabled:opacity-50 flex items-center gap-2"
                >
                  {formLoading ? (
                    <>
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="h-3.5 w-3.5" />
                      Generate Bill
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
