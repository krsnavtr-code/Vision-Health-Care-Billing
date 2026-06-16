import React, { useState, useEffect } from "react";
import { apiCall } from "../utils/api";
import { Plus, Search, Edit2, Trash2, X, RefreshCw } from "lucide-react";

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form Fields
  const [itemName, setItemName] = useState("");
  const [hsnCode, setHsnCode] = useState("");
  const [unit, setUnit] = useState("strip");
  const [basePrice, setBasePrice] = useState("");
  const [gstRate, setGstRate] = useState("12");
  const [stockQuantity, setStockQuantity] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  const [error, setError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const endpoint = search ? `/inventory?search=${encodeURIComponent(search)}` : "/inventory";
      const res = await apiCall(endpoint);
      if (res.success) {
        setInventory(res.data);
      }
    } catch (err) {
      console.error("Error fetching inventory:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchInventory();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search]);

  const handleOpenForm = (item = null) => {
    setError("");
    if (item) {
      setEditingItem(item);
      setItemName(item.itemName);
      setHsnCode(item.hsnCode || "");
      setUnit(item.unit);
      setBasePrice(item.basePrice);
      setGstRate(String(item.gstRate));
      setStockQuantity(item.stockQuantity);
      setBatchNumber(item.batchNumber || "");
      setExpiryDate(item.expiryDate ? item.expiryDate.split("T")[0] : "");
    } else {
      setEditingItem(null);
      setItemName("");
      setHsnCode("");
      setUnit("strip");
      setBasePrice("");
      setGstRate("12");
      setStockQuantity("");
      setBatchNumber("");
      setExpiryDate("");
    }
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFormLoading(true);

    const payload = {
      itemName: itemName.trim(),
      hsnCode: hsnCode.trim(),
      unit,
      basePrice: parseFloat(basePrice),
      gstRate: parseFloat(gstRate),
      stockQuantity: parseInt(stockQuantity),
      batchNumber: batchNumber.trim(),
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
    };

    try {
      if (editingItem) {
        await apiCall(`/inventory/${editingItem._id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiCall("/inventory", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      fetchInventory();
      handleCloseForm();
    } catch (err) {
      setError(err.message || "Failed to save inventory item.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this inventory item?")) return;
    try {
      await apiCall(`/inventory/${id}`, { method: "DELETE" });
      fetchInventory();
    } catch (err) {
      alert("Failed to delete item: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Pharmacy Inventory</h1>
          <p className="text-sm text-slate-500 font-medium">Manage medicines, consumables, and stocks</p>
        </div>
        <button
          onClick={() => handleOpenForm()}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition duration-150"
        >
          <Plus className="h-4 w-4" />
          Add Medicine
        </button>
      </div>

      {/* Controls & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Search by Medicine Name or HSN Code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        <button
          onClick={fetchInventory}
          className="p-2 border border-slate-100 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 transition"
          title="Force Reload"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Table Panel */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading && inventory.length === 0 ? (
          <div className="p-10 text-center text-slate-500 font-semibold">Loading stock catalog...</div>
        ) : inventory.length === 0 ? (
          <div className="p-10 text-center text-slate-400 font-semibold">No medicines found in the inventory.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-5 py-3 text-left text-xxs font-bold text-slate-400 uppercase">Medicine Name</th>
                  <th className="px-5 py-3 text-left text-xxs font-bold text-slate-400 uppercase">HSN Code</th>
                  <th className="px-5 py-3 text-center text-xxs font-bold text-slate-400 uppercase">Unit</th>
                  <th className="px-5 py-3 text-right text-xxs font-bold text-slate-400 uppercase">Base Price</th>
                  <th className="px-5 py-3 text-center text-xxs font-bold text-slate-400 uppercase">GST %</th>
                  <th className="px-5 py-3 text-right text-xxs font-bold text-slate-400 uppercase">Available Stock</th>
                  <th className="px-5 py-3 text-center text-xxs font-bold text-slate-400 uppercase">Batch & Expiry</th>
                  <th className="px-5 py-3 text-right text-xxs font-bold text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventory.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/50 transition">
                    <td className="px-5 py-3 whitespace-nowrap text-xs font-bold text-slate-700">
                      {item.itemName}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-xs text-slate-500 font-mono">
                      {item.hsnCode || "-"}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-xs text-center text-slate-500">
                      {item.unit}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-xs text-right font-semibold text-slate-700">
                      Rs. {item.basePrice.toFixed(2)}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-xs text-center text-slate-500">
                      {item.gstRate}%
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-right">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xxs font-bold ${
                          item.stockQuantity < 10
                            ? "bg-rose-50 text-rose-600 animate-pulse"
                            : "bg-emerald-50 text-emerald-600"
                        }`}
                      >
                        {item.stockQuantity} {item.unit}
                      </span>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-xs text-center">
                      <div className="font-semibold text-slate-600">{item.batchNumber || "N/A"}</div>
                      <div className="text-xxs text-slate-400">
                        Exp: {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString("en-IN") : "N/A"}
                      </div>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-right text-xs">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenForm(item)}
                          className="p-1 bg-slate-100 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                          title="Edit"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-1 bg-slate-100 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded transition"
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

      {/* Slide-over Form / Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h2 className="font-extrabold text-slate-800 text-sm">
                {editingItem ? "Edit Inventory Medicine" : "Add New Medicine"}
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
                  <label className="block text-xs font-bold text-slate-500 uppercase">Medicine / Consumable Name</label>
                  <input
                    type="text"
                    required
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="Paracetamol 650mg, Disprin, Syringe, etc."
                    className="mt-1 block w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">HSN Code</label>
                  <input
                    type="text"
                    value={hsnCode}
                    onChange={(e) => setHsnCode(e.target.value)}
                    placeholder="30049011"
                    className="mt-1 block w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Billing Unit</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="mt-1 block w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="strip">Strip</option>
                    <option value="box">Box</option>
                    <option value="piece">Piece</option>
                    <option value="bottle">Bottle</option>
                    <option value="capsule">Capsule</option>
                    <option value="tablet">Tablet</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Base Price (Tax Excl.)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    placeholder="Rs. 10.00"
                    className="mt-1 block w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">GST Rate (%)</label>
                  <select
                    value={gstRate}
                    onChange={(e) => setGstRate(e.target.value)}
                    className="mt-1 block w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="0">0% (Nil)</option>
                    <option value="5">5% (Surgicals/Consumables)</option>
                    <option value="12">12% (Standard Medicines)</option>
                    <option value="18">18% (Special Drugs/Services)</option>
                    <option value="28">28% (Luxury)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    placeholder="100"
                    className="mt-1 block w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Batch Number</label>
                  <input
                    type="text"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    placeholder="BT99X26"
                    className="mt-1 block w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase">Expiry Date</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
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
                  {formLoading ? "Saving..." : editingItem ? "Update Medicine" : "Add Medicine"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
