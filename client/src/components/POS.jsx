import React, { useState, useEffect } from "react";
import { apiCall } from "../utils/api";
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  DollarSign,
  Printer,
  X,
  PlusCircle,
  FileText,
} from "lucide-react";

export default function POS() {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchCategory, setSearchCategory] = useState("Medicine"); // Medicine, Rental, Service

  // Custom Service state
  const [customServiceName, setCustomServiceName] = useState("");
  const [customServicePrice, setCustomServicePrice] = useState("");
  const [customServiceGst, setCustomServiceGst] = useState("18");

  // Cart State
  const [cart, setCart] = useState([]);
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [notes, setNotes] = useState("");

  // Post-submit success model state
  const [generatedInvoice, setGeneratedInvoice] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchPatients = () => {
    const stored = JSON.parse(localStorage.getItem("demo_patients") || "[]");
    setPatients(stored);
    if (stored.length > 0 && !selectedPatientId) {
      setSelectedPatientId(stored[0]._id);
    }
  };

  const performSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      if (searchCategory === "Medicine") {
        const res = await apiCall(`/inventory?search=${encodeURIComponent(searchQuery)}`);
        if (res.success) setSearchResults(res.data);
      } else if (searchCategory === "Rental") {
        const res = await apiCall(`/equipment?search=${encodeURIComponent(searchQuery)}`);
        if (res.success) {
          // Only show available equipment
          setSearchResults(res.data.filter((eq) => eq.status === "Available"));
        }
      }
    } catch (err) {
      console.log("Search error:", err);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      performSearch();
    }, 250);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery, searchCategory]);

  const handleAddToCart = (item, type) => {
    // Check if already in cart
    const exists = cart.find((cartItem) => cartItem.itemId === item._id && cartItem.itemType === type);
    if (exists) {
      alert("This item is already in your cart. You can change its quantity in the cart list.");
      return;
    }

    let cartItem = {
      id: `${type}-${item._id}`,
      itemId: item._id,
      itemType: type,
      name: type === "Medicine" ? item.itemName : item.equipmentName,
      unitPrice: type === "Medicine" ? item.basePrice : item.dailyRentalPrice, // default Daily rent for equipment
      gstRate: type === "Medicine" ? item.gstRate : 18,
      quantity: 1,
      discount: 0,
      discountType: "flat", // flat or percentage
      stockQuantity: type === "Medicine" ? item.stockQuantity : 1,
      // rental specific
      rentalDays: type === "Rental" ? 1 : null,
      rentalRateType: type === "Rental" ? "Daily" : null,
      originalItem: item, // save full item for references
    };

    setCart([...cart, cartItem]);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleAddCustomService = (e) => {
    e.preventDefault();
    if (!customServiceName || !customServicePrice) {
      alert("Please provide both name and base price for the service.");
      return;
    }

    const price = parseFloat(customServicePrice);
    if (isNaN(price) || price < 0) {
      alert("Price must be a positive number.");
      return;
    }

    const serviceItem = {
      id: `Service-${Date.now()}`,
      itemType: "Service",
      name: customServiceName,
      unitPrice: price,
      gstRate: parseFloat(customServiceGst),
      quantity: 1,
      discount: 0,
      discountType: "flat",
      rentalDays: null,
      rentalRateType: null,
    };

    setCart([...cart, serviceItem]);
    setCustomServiceName("");
    setCustomServicePrice("");
    setCustomServiceGst("18");
  };

  const handleUpdateCartItem = (id, field, value) => {
    const updated = cart.map((item) => {
      if (item.id === id) {
        let updatedItem = { ...item, [field]: value };

        // Handle price changes based on daily/monthly rental type selection
        if (field === "rentalRateType") {
          const original = item.originalItem;
          if (original) {
            updatedItem.unitPrice = value === "Monthly" ? original.monthlyRentalPrice : original.dailyRentalPrice;
          }
        }

        return updatedItem;
      }
      return item;
    });
    setCart(updated);
  };

  const handleRemoveFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  // Live Math Calculations for Frontend Representational Purposes (Matched with Pre-save schema hook!)
  const calculateCartSummary = () => {
    let subTotal = 0;
    let taxAmount = 0;
    let totalDiscount = 0;

    cart.forEach((item) => {
      let basePrice = item.unitPrice * item.quantity;
      if (item.itemType === "Rental" && item.rentalDays) {
        basePrice = item.unitPrice * item.rentalDays * item.quantity;
      }

      // calculate item discount
      let itemDisc = 0;
      if (item.discountType === "percentage") {
        itemDisc = basePrice * (parseFloat(item.discount || 0) / 100);
      } else {
        itemDisc = parseFloat(item.discount || 0);
      }

      const itemTax = (basePrice) * (item.gstRate / 100);

      subTotal += basePrice;
      taxAmount += itemTax;
      totalDiscount += itemDisc;
    });

    const grandTotal = subTotal + taxAmount - totalDiscount;
    const balance = grandTotal - (parseFloat(amountPaid) || 0);

    return {
      subTotal,
      taxAmount,
      totalDiscount,
      grandTotal,
      balance: balance < 0 ? 0 : balance,
    };
  };

  const summary = calculateCartSummary();

  const handleGenerateInvoice = async () => {
    if (!selectedPatientId) {
      alert("Please select or register a patient first.");
      return;
    }
    if (cart.length === 0) {
      alert("Cart is empty.");
      return;
    }

    setError("");
    setLoading(true);

    // Prepare payload matching invoice controller requirements
    const itemsPayload = cart.map((item) => {
      // Calculate final discount value in flat Rs (as backend model expects flat 'discount' parameter)
      let basePrice = item.unitPrice * item.quantity;
      if (item.itemType === "Rental" && item.rentalDays) {
        basePrice = item.unitPrice * item.rentalDays * item.quantity;
      }

      let finalDiscVal = 0;
      if (item.discountType === "percentage") {
        finalDiscVal = parseFloat(((basePrice * (item.discount || 0)) / 100).toFixed(2));
      } else {
        finalDiscVal = parseFloat(item.discount || 0);
      }

      return {
        itemType: item.itemType,
        itemId: item.itemType !== "Service" ? item.itemId : undefined,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        gstRate: item.gstRate,
        discount: finalDiscVal,
        rentalDays: item.rentalDays,
        rentalRateType: item.rentalRateType,
      };
    });

    try {
      const res = await apiCall("/invoices/generate", {
        method: "POST",
        body: JSON.stringify({
          patientId: selectedPatientId,
          items: itemsPayload,
          amountPaid: parseFloat(amountPaid) || 0,
          paymentMethod,
          notes,
        }),
      });

      if (res.success) {
        setGeneratedInvoice(res.data);
        setShowSuccessModal(true);
        // Clear Cart
        setCart([]);
        setAmountPaid("");
        setNotes("");
      }
    } catch (err) {
      setError(err.message || "Failed to generate bill.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (invoiceId, invoiceNumber) => {
    try {
      const pdfBlob = await apiCall(`/invoices/${invoiceId}/pdf`);
      const fileURL = URL.createObjectURL(pdfBlob);
      window.open(fileURL);
    } catch (err) {
      alert("Failed to download PDF: " + err.message);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* LEFT: Item selection & Cart */}
      <div className="lg:col-span-3 space-y-6">
        {/* Header/Banner */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-5 text-white shadow-md flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Vision Billing HUB / POS
            </h1>
            <p className="text-xs text-blue-100 mt-1 font-semibold">Generate real-time invoices for pharmacy medicines, medical devices, and ICU rentals</p>
          </div>
        </div>

        {/* Search Panel */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex gap-2">
            <select
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-700"
            >
              <option value="Medicine">Medicine Catalogue</option>
              <option value="Rental">Equipment Fleet</option>
              <option value="Service">Custom Service</option>
            </select>

            {searchCategory !== "Service" ? (
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  placeholder={`Search ${searchCategory.toLowerCase()}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-semibold"
                />
              </div>
            ) : (
              <form onSubmit={handleAddCustomService} className="flex-grow flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Service Name (e.g. ICU Nurse shift, Doctor consult)"
                  value={customServiceName}
                  onChange={(e) => setCustomServiceName(e.target.value)}
                  className="flex-grow px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-semibold"
                />
                <input
                  type="number"
                  required
                  placeholder="Base Price"
                  value={customServicePrice}
                  onChange={(e) => setCustomServicePrice(e.target.value)}
                  className="w-24 px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-semibold"
                />
                <select
                  value={customServiceGst}
                  onChange={(e) => setCustomServiceGst(e.target.value)}
                  className="border border-slate-200 rounded-xl px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="0">0%</option>
                  <option value="5">5%</option>
                  <option value="12">12%</option>
                  <option value="18">18%</option>
                </select>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 shrink-0"
                >
                  <PlusCircle className="h-4 w-4" />
                  Add
                </button>
              </form>
            )}
          </div>

          {/* Search Dropdown overlay */}
          {searchResults.length > 0 && (
            <div className="border border-slate-100 rounded-xl shadow-lg divide-y divide-slate-50 overflow-hidden bg-white max-h-60 overflow-y-auto">
              {searchResults.map((item) => (
                <div
                  key={item._id}
                  className="p-3 flex justify-between items-center hover:bg-slate-50 cursor-pointer"
                  onClick={() => handleAddToCart(item, searchCategory)}
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">
                      {searchCategory === "Medicine" ? item.itemName : item.equipmentName}
                    </h4>
                    <p className="text-xxs text-slate-400 font-semibold">
                      {searchCategory === "Medicine"
                        ? `Unit: ${item.unit} | Stock: ${item.stockQuantity} | GST: ${item.gstRate}%`
                        : `S/N: ${item.serialNumber || "N/A"} | Security Deposit: Rs. ${item.securityDeposit}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-slate-700">
                      Rs. {searchCategory === "Medicine" ? item.basePrice.toFixed(2) : `${item.dailyRentalPrice.toFixed(2)}/day`}
                    </span>
                    <button className="p-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Listing */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 bg-slate-50/50 border-b border-slate-100">
            <h2 className="text-sm font-black text-slate-700 flex items-center gap-1.5">
              🛒 Items in Bill Receipt ({cart.length})
            </h2>
          </div>

          {cart.length === 0 ? (
            <div className="p-16 text-center text-slate-400">
              <ShoppingCart className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold">Billing checkout is empty.</p>
              <p className="text-xs mt-1">Search medicine/equipment or insert custom service above.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xxs font-bold text-slate-400 uppercase">Description</th>
                    <th className="px-4 py-2 text-center text-xxs font-bold text-slate-400 uppercase">Rate</th>
                    <th className="px-4 py-2 text-center text-xxs font-bold text-slate-400 uppercase">Period (Rental)</th>
                    <th className="px-4 py-2 text-center text-xxs font-bold text-slate-400 uppercase">Qty</th>
                    <th className="px-4 py-2 text-center text-xxs font-bold text-slate-400 uppercase">Discount</th>
                    <th className="px-4 py-2 text-right text-xxs font-bold text-slate-400 uppercase">Total (Excl. Tax)</th>
                    <th className="px-4 py-2 text-right text-xxs font-bold text-slate-400 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cart.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      {/* Name / Type */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-xs font-bold text-slate-800">{item.name}</div>
                        <div className="text-xxs font-semibold text-slate-400">
                          {item.itemType} {item.gstRate ? `(${item.gstRate}% GST)` : ""}
                        </div>
                      </td>

                      {/* Unit Price */}
                      <td className="px-4 py-3 whitespace-nowrap text-center text-xs font-semibold text-slate-700">
                        Rs. {item.unitPrice.toFixed(2)}
                      </td>

                      {/* Rental Days (If applicable) */}
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        {item.itemType === "Rental" ? (
                          <div className="flex justify-center items-center gap-1">
                            <input
                              type="number"
                              min="1"
                              value={item.rentalDays}
                              onChange={(e) =>
                                handleUpdateCartItem(item.id, "rentalDays", parseInt(e.target.value) || 1)
                              }
                              className="w-12 border border-slate-200 rounded px-1.5 py-0.5 text-xs text-center font-bold"
                            />
                            <select
                              value={item.rentalRateType}
                              onChange={(e) => handleUpdateCartItem(item.id, "rentalRateType", e.target.value)}
                              className="border border-slate-200 rounded px-1.5 py-0.5 text-xxs bg-white"
                            >
                              <option value="Daily">Days</option>
                              <option value="Monthly">Months</option>
                            </select>
                          </div>
                        ) : (
                          <span className="text-slate-300 font-bold">-</span>
                        )}
                      </td>

                      {/* Qty */}
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <input
                          type="number"
                          min="1"
                          max={item.itemType === "Medicine" ? item.stockQuantity : undefined}
                          value={item.quantity}
                          onChange={(e) =>
                            handleUpdateCartItem(item.id, "quantity", parseInt(e.target.value) || 1)
                          }
                          className="w-14 border border-slate-200 rounded px-1.5 py-0.5 text-xs text-center font-bold"
                        />
                        {item.itemType === "Medicine" && (
                          <div className="text-xxs text-rose-500 font-bold mt-0.5">Max: {item.stockQuantity}</div>
                        )}
                      </td>

                      {/* Discount input */}
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <div className="flex justify-center items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            value={item.discount}
                            onChange={(e) =>
                              handleUpdateCartItem(item.id, "discount", parseFloat(e.target.value) || 0)
                            }
                            className="w-14 border border-slate-200 rounded px-1.5 py-0.5 text-xs text-center font-semibold"
                          />
                          <select
                            value={item.discountType}
                            onChange={(e) => handleUpdateCartItem(item.id, "discountType", e.target.value)}
                            className="border border-slate-200 rounded px-1 py-0.5 text-xxs bg-white"
                          >
                            <option value="flat">Rs</option>
                            <option value="percentage">%</option>
                          </select>
                        </div>
                      </td>

                      {/* Line Item Total (Pre-tax representation) */}
                      <td className="px-4 py-3 whitespace-nowrap text-right text-xs font-bold text-slate-800">
                        Rs.{" "}
                        {(
                          item.unitPrice *
                          item.quantity *
                          (item.rentalDays || 1)
                        ).toFixed(2)}
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3 whitespace-nowrap text-right text-xs">
                        <button
                          onClick={() => handleRemoveFromCart(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded transition"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* RIGHT: Patient Selection & Checkout Summary */}
      <div className="space-y-6">
        {/* Patient Selection Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Patient Association</h3>
          <div>
            <label className="block text-xxs font-bold text-slate-400 uppercase">Select Billing Patient</label>
            {patients.length === 0 ? (
              <div className="mt-2 text-xs text-rose-500 font-bold">
                ⚠️ No patients registered. Please add a patient under 'Patients' page to generate invoices.
              </div>
            ) : (
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="mt-1 block w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {patients.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.phoneNumber || "No Phone"})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Calculation Summary Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Billing Checkout</h3>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-md">
              <p className="text-xxs text-red-700 font-bold">{error}</p>
            </div>
          )}

          <div className="space-y-2 border-b border-slate-50 pb-4">
            <div className="flex justify-between text-xs text-slate-500 font-medium">
              <span>Sub Total (Excl. Tax)</span>
              <span>Rs. {summary.subTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500 font-medium">
              <span>GST Tax Amount</span>
              <span>Rs. {summary.taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-rose-500 font-bold">
              <span>Total Discount</span>
              <span>- Rs. {summary.totalDiscount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-slate-800 pt-2 border-t border-dashed border-slate-100">
              <span>Grand Total</span>
              <span>Rs. {summary.grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xxs font-bold text-slate-400 uppercase">Amount Paid (Rs)</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-xs">
                  Rs.
                </div>
                <input
                  type="number"
                  min="0"
                  max={summary.grandTotal}
                  placeholder={summary.grandTotal.toFixed(2)}
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  className="block w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xxs font-bold text-slate-400 uppercase">Pay Mode</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mt-1 block w-full border border-slate-200 rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-bold text-slate-700"
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                  <option value="Bank Transfer">Bank</option>
                </select>
              </div>

              <div>
                <label className="block text-xxs font-bold text-slate-400 uppercase">Outstanding Due</label>
                <div className="mt-1 block w-full px-2.5 py-2 rounded-lg bg-rose-50 text-rose-600 font-extrabold text-xs text-right border border-rose-100/50">
                  Rs. {summary.balance.toFixed(2)}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xxs font-bold text-slate-400 uppercase">Billing Notes/Remarks</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Get well soon notes, extra payment references..."
                rows="2"
                className="mt-1 block w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handleGenerateInvoice}
              disabled={loading || cart.length === 0}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md hover:shadow-lg text-xs font-black text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 disabled:opacity-50"
            >
              {loading ? "Generating Bill..." : "⚡ Generate & Save Bill"}
            </button>
          </div>
        </div>
      </div>

      {/* Success Modal with direct Print PDF action */}
      {showSuccessModal && generatedInvoice && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden p-6 text-center space-y-5">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
              <FileText className="h-6 w-6" />
            </div>

            <div>
              <h2 className="text-lg font-black text-slate-800">Invoice Generated Successfully!</h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Receipt reference: <strong className="font-bold text-slate-700">{generatedInvoice.invoiceNumber}</strong>
              </p>
            </div>

            {/* Bill Summary Snapshots */}
            <div className="bg-slate-50 p-4 rounded-xl text-left text-xs divide-y divide-slate-100 space-y-2">
              <div className="flex justify-between text-slate-600 font-semibold pt-1">
                <span>Patient:</span>
                <span className="font-bold text-slate-800">{generatedInvoice.patientId?.name}</span>
              </div>
              <div className="flex justify-between text-slate-600 font-semibold pt-1">
                <span>Grand Total:</span>
                <span className="font-black text-slate-800">Rs. {generatedInvoice.grandTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600 font-semibold pt-1">
                <span>Amount Paid:</span>
                <span className="font-bold text-slate-800">Rs. {generatedInvoice.amountPaid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600 font-semibold pt-1">
                <span>Outstanding Balance:</span>
                <span className="font-extrabold text-rose-600">Rs. {generatedInvoice.balance.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleDownloadPDF(generatedInvoice._id, generatedInvoice.invoiceNumber)}
                className="flex-grow flex justify-center items-center gap-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow transition duration-150"
              >
                <Printer className="h-4 w-4" />
                Print / Save Vyapar PDF
              </button>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Close Hub
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
