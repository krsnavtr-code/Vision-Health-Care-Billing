import React, { useState, useEffect } from "react";
import { apiCall } from "../utils/api";
import {
  Users,
  FileText,
  DollarSign,
  TrendingUp,
  Calendar,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Wallet,
  AlertCircle,
} from "lucide-react";

export default function StaffDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await apiCall("/staff-invoices/analytics");
      if (res.success) {
        setAnalytics(res.data);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl border border-slate-100 p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-100 rounded-full mb-3">
              <RefreshCw className="h-6 w-6 text-slate-400 animate-spin" />
            </div>
            <p className="text-sm text-slate-500 font-semibold">
              Loading analytics...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-500" />
            <p className="text-xs text-rose-700 font-bold">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  const { overview, paymentStatusBreakdown, paymentMethodBreakdown, monthlyTrends, topStaff, recentInvoices } = analytics;

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">
              Staff Analytics Dashboard
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Comprehensive overview of staff billing and payments
            </p>
          </div>
          <button
            onClick={fetchAnalytics}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-800 hover:border-slate-300 transition duration-150"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
                <Users className="h-3.5 w-3.5" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase">Total Staff</p>
            </div>
            <p className="text-2xl font-black text-slate-800">{overview.totalStaff}</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
                <FileText className="h-3.5 w-3.5" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase">Total Bills</p>
            </div>
            <p className="text-2xl font-black text-slate-800">{overview.totalInvoices}</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-purple-50 rounded-lg text-purple-600">
                <DollarSign className="h-3.5 w-3.5" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase">Total Salary</p>
            </div>
            <p className="text-lg font-black text-slate-800">{formatCurrency(overview.totalAmount)}</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-green-50 rounded-lg text-green-600">
                <Wallet className="h-3.5 w-3.5" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase">Total Paid</p>
            </div>
            <p className="text-lg font-black text-slate-800">{formatCurrency(overview.totalPaid)}</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-amber-50 rounded-lg text-amber-600">
                <TrendingUp className="h-3.5 w-3.5" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase">Deduction</p>
            </div>
            <p className="text-lg font-black text-slate-800">{formatCurrency(overview.totalDeduction)}</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-rose-50 rounded-lg text-rose-600">
                <AlertCircle className="h-3.5 w-3.5" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase">Balance</p>
            </div>
            <p className="text-lg font-black text-slate-800">{formatCurrency(overview.totalBalance)}</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Payment Status Breakdown */}
          <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
            <h3 className="text-sm font-black text-slate-800 mb-4">Payment Status</h3>
            <div className="space-y-3">
              {Object.entries(paymentStatusBreakdown).map(([status, count]) => {
                const percentage = overview.totalInvoices > 0 ? (count / overview.totalInvoices) * 100 : 0;
                const colors = {
                  Paid: "bg-emerald-500",
                  Pending: "bg-rose-500",
                  "Partially Paid": "bg-amber-500",
                };
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-600">{status}</span>
                      <span className="text-xs font-bold text-slate-800">{count} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${colors[status] || "bg-slate-400"} transition-all duration-300`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Method Breakdown */}
          <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
            <h3 className="text-sm font-black text-slate-800 mb-4">Payment Methods</h3>
            <div className="space-y-3">
              {Object.entries(paymentMethodBreakdown).map(([method, count]) => {
                const percentage = overview.totalInvoices > 0 ? (count / overview.totalInvoices) * 100 : 0;
                return (
                  <div key={method}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-600">{method}</span>
                      <span className="text-xs font-bold text-slate-800">{count} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
          <h3 className="text-sm font-black text-slate-800 mb-4">Monthly Trends (Last 6 Months)</h3>
          <div className="overflow-x-auto">
            <div className="flex items-end gap-4 min-w-max">
              {monthlyTrends.map((trend) => {
                const maxAmount = Math.max(...monthlyTrends.map((t) => t.amount));
                const height = maxAmount > 0 ? (trend.amount / maxAmount) * 100 : 0;
                return (
                  <div key={trend.month} className="flex-1 min-w-[80px]">
                    <div className="text-center mb-2">
                      <p className="text-xs font-bold text-slate-800">{formatCurrency(trend.amount)}</p>
                      <p className="text-xxs text-slate-400">{trend.count} bills</p>
                    </div>
                    <div className="h-32 bg-slate-100 rounded-lg overflow-hidden relative">
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-600 to-blue-400 transition-all duration-300"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    <p className="text-xs font-bold text-slate-600 text-center mt-2">{trend.month}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Top Staff & Recent Invoices */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Top Staff */}
          <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
            <h3 className="text-sm font-black text-slate-800 mb-4">Top Staff by Total Amount</h3>
            <div className="space-y-3">
              {topStaff.length > 0 ? (
                topStaff.map((staff, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                        <Users className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{staff.name}</p>
                        <p className="text-xxs text-slate-400">#{index + 1}</p>
                      </div>
                    </div>
                    <p className="text-sm font-black text-emerald-600">{formatCurrency(staff.amount)}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">No data available</p>
              )}
            </div>
          </div>

          {/* Recent Invoices */}
          <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
            <h3 className="text-sm font-black text-slate-800 mb-4">Recent Invoices</h3>
            <div className="space-y-2">
              {recentInvoices.length > 0 ? (
                recentInvoices.map((invoice) => (
                  <div key={invoice._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="text-xs font-bold text-slate-800">{invoice.staffId?.name || "Unknown"}</p>
                      <p className="text-xxs text-slate-400">{invoice.invoiceNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-800">{formatCurrency(invoice.totalAmount)}</p>
                      <p className="text-xxs text-slate-400">
                        {new Date(invoice.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">No invoices found</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
