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
  UserPlus,
} from "lucide-react";

export default function POS() {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchCategory, setSearchCategory] = useState("Rental"); // Medicine, Rental, Service

  // Custom Service state
  const [customServiceName, setCustomServiceName] = useState("");
  const [customServicePrice, setCustomServicePrice] = useState("");
  const [customServiceGst, setCustomServiceGst] = useState("18");

  // Cart State
  const [cart, setCart] = useState([]);
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [notes, setNotes] = useState("");
  const [enableGst, setEnableGst] = useState(false);

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
    try {
      if (searchCategory === "Medicine") {
        const endpoint = searchQuery.trim()
          ? `/inventory?search=${encodeURIComponent(searchQuery)}`
          : `/inventory`;
        const res = await apiCall(endpoint);
        if (res.success) setSearchResults(res.data);
      } else if (searchCategory === "Rental") {
        const endpoint = searchQuery.trim()
          ? `/equipment?search=${encodeURIComponent(searchQuery)}`
          : `/equipment`;
        const res = await apiCall(endpoint);
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
    const exists = cart.find(
      (cartItem) => cartItem.itemId === item._id && cartItem.itemType === type,
    );
    if (exists) {
      alert(
        "This item is already in your cart. You can change its quantity in the cart list.",
      );
      return;
    }

    let cartItem = {
      id: `${type}-${item._id}`,
      itemId: item._id,
      itemType: type,
      name: type === "Medicine" ? item.itemName : item.equipmentName,
      unitPrice:
        type === "Medicine" ? item.basePrice : item.dailyRentalPrice * 1, // default Daily rent * 1 day for equipment
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

        // Handle price changes based on daily/monthly rental type selection or rental days
        if (field === "rentalRateType" || field === "rentalDays") {
          const original = item.originalItem;
          if (original && item.itemType === "Rental") {
            const days = field === "rentalDays" ? value : item.rentalDays;
            const rateType =
              field === "rentalRateType" ? value : item.rentalRateType;
            const pricePerUnit =
              rateType === "Monthly"
                ? original.monthlyRentalPrice
                : original.dailyRentalPrice;
            updatedItem.unitPrice = pricePerUnit * days;
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
      // Calculate base price: unitPrice * quantity
      // For rentals, unitPrice should already include the rental period (daily * days)
      let basePrice = item.unitPrice * item.quantity;

      // calculate item discount
      let itemDisc = 0;
      if (item.discountType === "percentage") {
        itemDisc = basePrice * (parseFloat(item.discount || 0) / 100);
      } else {
        itemDisc = parseFloat(item.discount || 0);
      }

      // Only calculate tax if GST is enabled
      if (enableGst) {
        const itemTax = basePrice * (item.gstRate / 100);
        taxAmount += itemTax;
      }

      subTotal += basePrice;
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

  const summary = React.useMemo(
    () => calculateCartSummary(),
    [cart, amountPaid, enableGst],
  );

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
        finalDiscVal = parseFloat(
          ((basePrice * (item.discount || 0)) / 100).toFixed(2),
        );
      } else {
        finalDiscVal = parseFloat(item.discount || 0);
      }

      return {
        itemType: item.itemType,
        itemId: item.itemType !== "Service" ? item.itemId : undefined,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        gstRate: enableGst ? item.gstRate : 0,
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
            <p className="text-xs text-blue-100 mt-1 font-semibold">
              Generate real-time invoices for pharmacy medicines, medical
              devices, and ICU rentals
            </p>
          </div>
        </div>

        {/* Search Panel */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          {/* Category Tabs */}
          <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
            {[
              { id: "Rental", label: "🏥 Equipment", icon: "🏥" },
              { id: "Medicine", label: "💊 Medicine", icon: "💊" },
              { id: "Service", label: "⚡ Services", icon: "⚡" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSearchCategory(cat.id);
                  setSearchQuery("");
                  setSearchResults([]);
                }}
                className={`flex-1 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                  searchCategory === cat.id
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search/Service Input */}
          {searchCategory !== "Service" ? (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="h-3.5 w-3.5" />
              </div>
              <input
                type="text"
                placeholder={`Search ${searchCategory === "Medicine" ? "medicines by name" : "equipment by name or serial number"}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-semibold bg-slate-50 focus:bg-white transition"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSearchResults([]);
                  }}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ) : (
            <form onSubmit={handleAddCustomService} className="space-y-2">
              <input
                type="text"
                required
                placeholder="Service Name (e.g. ICU Nurse shift, Doctor consult)"
                value={customServiceName}
                onChange={(e) => setCustomServiceName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-semibold bg-slate-50 focus:bg-white transition"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  required
                  placeholder="Base Price (₹)"
                  value={customServicePrice}
                  onChange={(e) => setCustomServicePrice(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-semibold bg-slate-50 focus:bg-white transition"
                />
                <select
                  value={customServiceGst}
                  onChange={(e) => setCustomServiceGst(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-bold bg-white"
                >
                  <option value="0">0% GST</option>
                  <option value="5">5% GST</option>
                  <option value="12">12% GST</option>
                  <option value="18">18% GST</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Add Service to Bill
              </button>
            </form>
          )}

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="border border-slate-200 rounded-lg shadow-lg divide-y divide-slate-100 overflow-hidden bg-white max-h-64 overflow-y-auto">
              {searchResults.map((item) => (
                <div
                  key={item._id}
                  className="p-3 flex justify-between items-center hover:bg-blue-50 cursor-pointer transition group"
                  onClick={() => handleAddToCart(item, searchCategory)}
                >
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-700 transition">
                      {searchCategory === "Medicine"
                        ? item.itemName
                        : item.equipmentName}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      {searchCategory === "Medicine" ? (
                        <>
                          <span className="inline-block px-2 py-0.5 bg-slate-100 rounded text-xs font-bold text-slate-600 mr-2">
                            {item.unit}
                          </span>
                          <span className="text-slate-400">Stock: </span>
                          <span className="font-semibold text-slate-700">
                            {item.stockQuantity}
                          </span>
                          <span className="mx-2 text-slate-300">|</span>
                          <span className="text-slate-400">GST: </span>
                          <span className="font-semibold text-slate-700">
                            {item.gstRate}%
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-slate-400">S/N: </span>
                          <span className="font-semibold text-slate-700">
                            {item.serialNumber || "N/A"}
                          </span>
                          <span className="mx-2 text-slate-300">|</span>
                          <span className="text-slate-400">Deposit: </span>
                          <span className="font-semibold text-slate-700">
                            ₹{item.securityDeposit}
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <div className="text-right">
                      <div className="text-xs font-black text-slate-800">
                        ₹
                        {searchCategory === "Medicine"
                          ? item.basePrice.toFixed(2)
                          : `${item.dailyRentalPrice.toFixed(2)}/day`}
                      </div>
                      {searchCategory === "Rental" &&
                        item.monthlyRentalPrice && (
                          <div className="text-xs text-slate-500 font-medium">
                            ₹{item.monthlyRentalPrice.toFixed(2)}/month
                          </div>
                        )}
                    </div>
                    <button className="p-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition shadow-md group-hover:shadow-lg">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state for search */}
          {searchQuery && searchResults.length === 0 && (
            <div className="text-center py-6 text-slate-400">
              <Search className="h-6 w-6 mx-auto mb-2 opacity-50" />
              <p className="text-xs font-medium">
                No {searchCategory.toLowerCase()}s found
              </p>
              <p className="text-xs mt-1">Try a different search term</p>
            </div>
          )}
        </div>

        {/* Cart Listing */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-3 py-2.5 bg-slate-50/50 border-b border-slate-100">
            <h2 className="text-xs font-black text-slate-700 flex items-center gap-1.5">
              🛒 Items in Bill Receipt ({cart.length})
            </h2>
          </div>

          {cart.length === 0 ? (
            <div className="p-10 text-center text-slate-400">
              <ShoppingCart className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold">Billing checkout is empty.</p>
              <p className="text-xs mt-1">
                Search medicine/equipment or insert custom service above.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-1.5 text-left text-xs font-bold text-slate-400 uppercase">
                      Description
                    </th>
                    <th className="px-3 py-1.5 text-center text-xs font-bold text-slate-400 uppercase">
                      Rate
                    </th>
                    <th className="px-3 py-1.5 text-center text-xs font-bold text-slate-400 uppercase">
                      Period (Rental)
                    </th>
                    <th className="px-3 py-1.5 text-center text-xs font-bold text-slate-400 uppercase">
                      Qty
                    </th>
                    <th className="px-3 py-1.5 text-center text-xs font-bold text-slate-400 uppercase">
                      Discount
                    </th>
                    <th className="px-3 py-1.5 text-right text-xs font-bold text-slate-400 uppercase">
                      Total (Excl. Tax)
                    </th>
                    <th className="px-3 py-1.5 text-right text-xs font-bold text-slate-400 uppercase">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cart.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      {/* Name / Type */}
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="text-xs font-bold text-slate-800">
                          {item.name}
                        </div>
                        <div className="text-xs font-semibold text-slate-400">
                          {item.itemType}{" "}
                          {item.gstRate ? `(${item.gstRate}% GST)` : ""}
                        </div>
                      </td>

                      {/* Unit Price */}
                      <td className="px-3 py-2 whitespace-nowrap text-center text-xs font-semibold text-slate-700">
                        Rs. {item.unitPrice.toFixed(2)}
                      </td>

                      {/* Rental Days (If applicable) */}
                      <td className="px-3 py-2 whitespace-nowrap text-center">
                        {item.itemType === "Rental" ? (
                          <div className="flex justify-center items-center gap-1">
                            <select
                              value={item.rentalRateType}
                              onChange={(e) =>
                                handleUpdateCartItem(
                                  item.id,
                                  "rentalRateType",
                                  e.target.value,
                                )
                              }
                              className="border border-slate-200 rounded px-1 py-0.5 text-xs bg-white"
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
                      <td className="px-3 py-2 whitespace-nowrap text-center">
                        <input
                          type="number"
                          min="1"
                          max={
                            item.itemType === "Medicine"
                              ? item.stockQuantity
                              : undefined
                          }
                          value={item.quantity}
                          onChange={(e) =>
                            handleUpdateCartItem(
                              item.id,
                              "quantity",
                              parseInt(e.target.value) || 1,
                            )
                          }
                          className="w-12 border border-slate-200 rounded px-1 py-0.5 text-xs text-center font-bold"
                        />
                        {item.itemType === "Medicine" && (
                          <div className="text-xs text-rose-500 font-bold mt-0.5">
                            Max: {item.stockQuantity}
                          </div>
                        )}
                      </td>

                      {/* Discount input */}
                      <td className="px-3 py-2 whitespace-nowrap text-center">
                        <div className="flex justify-center items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            value={item.discount}
                            onChange={(e) =>
                              handleUpdateCartItem(
                                item.id,
                                "discount",
                                parseFloat(e.target.value) || 0,
                              )
                            }
                            className="w-12 border border-slate-200 rounded px-1 py-0.5 text-xs text-center font-semibold"
                          />
                          <select
                            value={item.discountType}
                            onChange={(e) =>
                              handleUpdateCartItem(
                                item.id,
                                "discountType",
                                e.target.value,
                              )
                            }
                            className="border border-slate-200 rounded px-1 py-0.5 text-xs bg-white"
                          >
                            <option value="flat">Rs</option>
                            <option value="percentage">%</option>
                          </select>
                        </div>
                      </td>

                      {/* Line Item Total (Pre-tax representation) */}
                      <td className="px-3 py-2 whitespace-nowrap text-right text-xs font-bold text-slate-800">
                        <div className="text-slate-400 line-through text-xs">
                          Rs. {(item.unitPrice * item.quantity).toFixed(2)}
                        </div>
                        <div className="text-slate-800">
                          Rs.{" "}
                          {(() => {
                            const basePrice = item.unitPrice * item.quantity;
                            let discountAmount = 0;
                            if (item.discountType === "percentage") {
                              discountAmount =
                                basePrice *
                                (parseFloat(item.discount || 0) / 100);
                            } else {
                              discountAmount = parseFloat(item.discount || 0);
                            }
                            return (basePrice - discountAmount).toFixed(2);
                          })()}
                        </div>
                      </td>

                      {/* Action */}
                      <td className="px-3 py-2 whitespace-nowrap text-right text-xs">
                        <button
                          onClick={() => handleRemoveFromCart(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded transition"
                        >
                          <Trash2 className="h-3 w-3" />
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
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-xl border border-blue-100 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-600 rounded-lg text-white">
              <UserPlus className="h-3.5 w-3.5" />
            </div>
            <h3 className="font-extrabold text-slate-800 text-xs">
              Patient Selection
            </h3>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">
              Select Patient for Billing
            </label>
            {patients.length === 0 ? (
              <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-center">
                <p className="text-xs text-rose-700 font-bold">
                  ⚠️ No patients registered
                </p>
                <p className="text-xs text-rose-600 mt-1">
                  Add patients from the "Patients" page to generate invoices
                </p>
              </div>
            ) : (
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="block w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
              >
                {patients.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} {p.phoneNumber ? `• ${p.phoneNumber}` : ""}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Calculation Summary Card */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-3 rounded-xl border border-emerald-100 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-600 rounded-lg text-white">
              <DollarSign className="h-3.5 w-3.5" />
            </div>
            <h3 className="font-extrabold text-slate-800 text-xs">
              Billing Summary
            </h3>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-2">
              <p className="text-xs text-rose-700 font-bold">{error}</p>
            </div>
          )}

          <div className="bg-white rounded-lg p-3 space-y-2 shadow-sm">
            {/* GST Toggle */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-700">
                Enable GST Tax
              </span>
              <button
                onClick={() => setEnableGst(!enableGst)}
                className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
                  enableGst ? "bg-emerald-500" : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                    enableGst ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="flex justify-between text-xs text-slate-600 font-medium">
              <span>Sub Total</span>
              <span className="font-bold text-slate-800">
                ₹{summary.subTotal.toFixed(2)}
              </span>
            </div>
            {enableGst && (
              <div className="flex justify-between text-xs text-slate-600 font-medium">
                <span>GST Tax</span>
                <span className="font-bold text-slate-800">
                  ₹{summary.taxAmount.toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-xs text-rose-600 font-bold">
              <span>Discount</span>
              <span>- ₹{summary.totalDiscount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-slate-800 pt-2 border-t border-slate-100">
              <span>Grand Total</span>
              <span>₹{summary.grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">
                Amount Paid (₹)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold">
                  ₹
                </div>
                <input
                  type="number"
                  min="0"
                  max={summary.grandTotal}
                  placeholder={summary.grandTotal.toFixed(2)}
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  className="block w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Payment Mode
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="block w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white shadow-sm"
                >
                  <option value="Cash">💵 Cash</option>
                  <option value="UPI">📱 UPI</option>
                  <option value="Card">💳 Card</option>
                  <option value="Bank Transfer">🏦 Bank</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Balance Due
                </label>
                <div className="block w-full px-3 py-2 rounded-lg bg-rose-100 text-rose-700 font-extrabold text-xs text-right border border-rose-200 shadow-sm">
                  ₹{summary.balance.toFixed(2)}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes or remarks..."
                rows="2"
                className="block w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white shadow-sm resize-none"
              />
            </div>

            <button
              onClick={handleGenerateInvoice}
              disabled={loading || cart.length === 0}
              className="w-full py-2.5 px-3 border border-transparent rounded-lg shadow-lg hover:shadow-xl text-xs font-black text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating Bill...
                </>
              ) : (
                <>
                  <FileText className="h-3.5 w-3.5" />
                  Generate Invoice
                </>
              )}
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
              <h2 className="text-lg font-black text-slate-800">
                Invoice Generated Successfully!
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Receipt reference:{" "}
                <strong className="font-bold text-slate-700">
                  {generatedInvoice.invoiceNumber}
                </strong>
              </p>
            </div>

            {/* Bill Summary Snapshots */}
            <div className="bg-slate-50 p-4 rounded-xl text-left text-xs divide-y divide-slate-100 space-y-2">
              <div className="flex justify-between text-slate-600 font-semibold pt-1">
                <span>Patient:</span>
                <span className="font-bold text-slate-800">
                  {generatedInvoice.patientId?.name}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 font-semibold pt-1">
                <span>Grand Total:</span>
                <span className="font-black text-slate-800">
                  Rs. {generatedInvoice.grandTotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 font-semibold pt-1">
                <span>Amount Paid:</span>
                <span className="font-bold text-slate-800">
                  Rs. {generatedInvoice.amountPaid.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 font-semibold pt-1">
                <span>Outstanding Balance:</span>
                <span className="font-extrabold text-rose-600">
                  Rs. {generatedInvoice.balance.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() =>
                  handleDownloadPDF(
                    generatedInvoice._id,
                    generatedInvoice.invoiceNumber,
                  )
                }
                className="flex-grow flex justify-center items-center gap-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow transition duration-150"
              >
                <Printer className="h-4 w-4" />
                Print / Save Bill PDF
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
