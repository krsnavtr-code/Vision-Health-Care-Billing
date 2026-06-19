import React, { useEffect, useState } from "react";
import { apiCall } from "../utils/api";
import {
  DollarSign,
  Activity,
  AlertTriangle,
  FileText,
  Clock,
  Printer,
  TrendingUp,
  RefreshCw,
} from "lucide-react";

export default function Dashboard({ onNavigateToPos }) {
  const [metrics, setMetrics] = useState({
    pendingPayments: 0,
    activeRentals: 0,
    lowStockCount: 0,
    totalRevenue: 0,
  });
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Invoices for Pending Payments and Recent table
      const invoicesRes = await apiCall("/invoices");
      const invoices = invoicesRes.success ? invoicesRes.data : [];

      let pending = 0;
      let revenue = 0;
      invoices.forEach((inv) => {
        pending += inv.balance;
        revenue += inv.amountPaid;
      });

      // 2. Fetch Equipments for Active Rentals
      const eqRes = await apiCall("/equipment");
      const equipments = eqRes.success ? eqRes.data : [];
      const activeRentals = equipments.filter(
        (eq) => eq.status === "Rented",
      ).length;

      // 3. Fetch Inventory for Low Stock
      const invRes = await apiCall("/inventory");
      const inventory = invRes.success ? invRes.data : [];
      const lowStock = inventory.filter((item) => item.stockQuantity < 10);

      setMetrics({
        pendingPayments: pending,
        activeRentals: activeRentals,
        lowStockCount: lowStock.length,
        totalRevenue: revenue,
      });

      setRecentInvoices(invoices.slice(0, 5));
      setLowStockItems(lowStock.slice(0, 5));
    } catch (error) {
      console.error("Dashboard Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handlePrintPDF = async (invoiceId, invoiceNumber) => {
    try {
      const pdfBlob = await apiCall(`/invoices/${invoiceId}/pdf`);
      const fileURL = URL.createObjectURL(pdfBlob);
      const pdfWindow = window.open(fileURL);
      if (pdfWindow) {
        pdfWindow.name = invoiceNumber;
      }
    } catch (err) {
      alert("Failed to generate PDF: " + err.message);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-black text-slate-800 tracking-tight">
            ERP Dashboard
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            VISION HEALTH CARE ERP - Real-time Operations Status
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-800 hover:border-slate-300 transition duration-150"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1 */}
        <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-50 text-orange-500">
            <DollarSign className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Pending Payments
            </p>
            <h3 className="text-sm font-black text-slate-800 mt-0.5">
              Rs.{" "}
              {metrics.pendingPayments.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </h3>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-500">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Active Rentals (ICU)
            </p>
            <h3 className="text-sm font-black text-slate-800 mt-0.5">
              {metrics.activeRentals} Units
            </h3>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="p-2 rounded-lg bg-rose-50 text-rose-500">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Low Stock Medicines
            </p>
            <h3 className="text-sm font-black text-slate-800 mt-0.5">
              {metrics.lowStockCount} Items
            </h3>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-500">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Revenue
            </p>
            <h3 className="text-sm font-black text-slate-800 mt-0.5">
              Rs.{" "}
              {metrics.totalRevenue.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Invoices */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm lg:col-span-2 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-50 flex justify-between items-center">
            <h2 className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-slate-500" />
              Recent Bills / Invoices
            </h2>
            <button
              onClick={onNavigateToPos}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
            >
              + Create Bill
            </button>
          </div>

          {loading ? (
            <div className="p-6 text-center text-xs text-slate-500 font-semibold">
              Loading data...
            </div>
          ) : recentInvoices.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 font-semibold">
              No bills generated yet.
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
                      Patient
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-bold text-slate-400 uppercase">
                      Total
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-bold text-slate-400 uppercase">
                      Status
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-bold text-slate-400 uppercase">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentInvoices.map((inv) => (
                    <tr
                      key={inv._id}
                      className="hover:bg-slate-50/50 transition"
                    >
                      <td className="px-3 py-2 whitespace-nowrap text-xs font-bold text-slate-700">
                        {inv.invoiceNumber}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-slate-600 font-medium">
                        {inv.patientId?.name || "Unknown Patient"}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-right font-semibold text-slate-800">
                        Rs. {inv.grandTotal.toFixed(2)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                            inv.paymentStatus === "Paid"
                              ? "bg-emerald-50 text-emerald-600"
                              : inv.paymentStatus === "Partially Paid"
                                ? "bg-orange-50 text-orange-600"
                                : "bg-rose-50 text-rose-600"
                          }`}
                        >
                          {inv.paymentStatus}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-right">
                        <button
                          onClick={() =>
                            handlePrintPDF(inv._id, inv.invoiceNumber)
                          }
                          className="p-1 bg-slate-100 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                          title="Print / PDF"
                        >
                          <Printer className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-slate-50">
            <h2 className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-slate-500" />
              Low Stock Alerts (&lt; 10)
            </h2>
          </div>

          {loading ? (
            <div className="p-6 text-center text-xs text-slate-500 font-semibold flex-grow">
              Loading data...
            </div>
          ) : lowStockItems.length === 0 ? (
            <div className="p-6 text-center text-xs text-emerald-500 font-bold flex-grow flex flex-col justify-center items-center gap-1">
              ✨ All inventory stocks are healthy!
            </div>
          ) : (
            <div className="divide-y divide-slate-100 flex-grow">
              {lowStockItems.map((item) => (
                <div
                  key={item._id}
                  className="p-3 flex justify-between items-center hover:bg-slate-50/50"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-700">
                      {item.itemName}
                    </h4>
                    <p className="text-xs text-slate-400 font-medium">
                      HSN: {item.hsnCode || "N/A"}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2 py-0.5 rounded-md text-xs font-black bg-rose-50 text-rose-600">
                      Stock: {item.stockQuantity} {item.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
