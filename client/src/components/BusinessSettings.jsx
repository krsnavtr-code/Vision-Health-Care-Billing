import React, { useState, useEffect } from "react";
import { apiCall } from "../utils/api";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  FileText,
  Globe,
  Save,
  Loader2,
  CheckCircle2,
  CreditCard,
  Sparkles,
  RefreshCw,
  Upload,
  X,
} from "lucide-react";

export default function BusinessSettings() {
  const [details, setDetails] = useState({
    name: "",
    address: "",
    phoneNumber: "",
    email: "",
    state: "",
    website: "",
    bankName: "",
    bankBranch: "",
    bankAccountNo: "",
    bankIfscCode: "",
    accountHolderName: "",
    signatureImage: "",
    qrCode: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Fetch current business settings from database
  useEffect(() => {
    fetchBusinessDetails();
  }, []);

  const fetchBusinessDetails = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiCall("/business-details");
      if (response && response.success && response.data) {
        setDetails((prev) => ({
          ...prev,
          ...response.data,
        }));
      } else {
        setError("Failed to load business settings");
      }
    } catch (err) {
      console.error("Error fetching business details:", err);
      setError(err.message || "Failed to load business settings");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDetails((prev) => ({
          ...prev,
          signatureImage: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleQrCodeUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDetails((prev) => ({
          ...prev,
          qrCode: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");
      setSuccess(false);

      const response = await apiCall("/business-details", {
        method: "PUT",
        body: JSON.stringify(details),
      });

      if (response && response.success && response.data) {
        setDetails((prev) => ({
          ...prev,
          ...response.data,
        }));
        setSuccess(true);
        setTimeout(() => setSuccess(false), 4000); // clear success badge after 4s
      } else {
        setError(response.message || "Failed to save details");
      }
    } catch (err) {
      console.error("Error saving business details:", err);
      setError(err.message || "Failed to save details");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
        <p className="text-xs text-slate-500 font-bold tracking-wide uppercase">
          Loading Invoice Settings...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-slate-900/10">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xxs font-extrabold uppercase tracking-widest">
              <Sparkles className="h-3 w-3" /> Billing Configuration
            </div>
            <h1 className="text-2xl font-black tracking-tight">
              Business Settings
            </h1>
            <p className="text-xs text-slate-400 max-w-xl font-medium leading-relaxed">
              Configure your clinical or pharmacy business details, bank
              details, tax rates, and UPI payments. These settings are stored
              centrally in the database and automatically synchronized on all
              generated Tax Invoices.
            </p>
          </div>

          <button
            onClick={fetchBusinessDetails}
            className="self-start md:self-center flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700/80 rounded-xl text-xs font-bold text-slate-300 transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reload Config
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Alerts */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs text-rose-600 font-bold leading-relaxed shadow-sm flex items-center gap-3">
            <span className="h-2 w-2 bg-rose-500 rounded-full animate-pulse" />
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-xs text-emerald-700 font-bold leading-relaxed shadow-sm flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            Invoice configuration saved successfully! Central PDF templates
            updated dynamically.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* COLUMN 1: Company Profile details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-100 p-6 space-y-5 shadow-sm">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-50">
                <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800">
                    Business Profile
                  </h3>
                  <p className="text-xxs text-slate-400 font-medium">
                    Core company details displayed at the top left of your
                    bills.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-1 md:col-span-2">
                  <label className="text-xxs font-black text-slate-500 uppercase tracking-wider">
                    Business / Company Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={details.name}
                    onChange={handleChange}
                    placeholder="e.g. Shreyansh Pharma and Home Care Services"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 rounded-xl text-xs font-semibold text-slate-700 outline-none transition"
                  />
                </div>

                <div className="space-y-1.5 col-span-1 md:col-span-2">
                  <label className="text-xxs font-black text-slate-500 uppercase tracking-wider">
                    Complete Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <textarea
                      name="address"
                      value={details.address}
                      onChange={handleChange}
                      rows="2"
                      placeholder="e.g. Najafgarh, New Delhi"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 rounded-xl text-xs font-semibold text-slate-700 outline-none transition resize-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xxs font-black text-slate-500 uppercase tracking-wider">
                    Phone / Contact Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      name="phoneNumber"
                      value={details.phoneNumber}
                      onChange={handleChange}
                      placeholder="e.g. 07014626159"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 rounded-xl text-xs font-semibold text-slate-700 outline-none transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xxs font-black text-slate-500 uppercase tracking-wider">
                    Business Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      value={details.email}
                      onChange={handleChange}
                      placeholder="e.g. business@gmail.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 rounded-xl text-xs font-semibold text-slate-700 outline-none transition"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 p-6 space-y-5 shadow-sm">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-50">
                <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800">
                    Tax & Registration Details
                  </h3>
                  <p className="text-xxs text-slate-400 font-medium">
                    Corporate registration state and website details.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xxs font-black text-slate-500 uppercase tracking-wider">
                    State & Code
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={details.state}
                    onChange={handleChange}
                    placeholder="e.g. 07-Delhi"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 rounded-xl text-xs font-semibold text-slate-700 outline-none transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xxs font-black text-slate-500 uppercase tracking-wider">
                    Website URL
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      name="website"
                      value={details.website}
                      onChange={handleChange}
                      placeholder="e.g. www.business.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 rounded-xl text-xs font-semibold text-slate-700 outline-none transition"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMN 2: Bank details */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-100 p-6 space-y-5 shadow-sm h-full">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-50">
                <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800">
                    Payment & Bank Setup
                  </h3>
                  <p className="text-xxs text-slate-400 font-medium">
                    Configure where customers pay you. Updates PDF QR scan data.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xxs font-black text-slate-500 uppercase tracking-wider">
                    Account Holder Name
                  </label>
                  <input
                    type="text"
                    name="accountHolderName"
                    value={details.accountHolderName}
                    onChange={handleChange}
                    placeholder="e.g. Shreyansh pharma"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 rounded-xl text-xs font-semibold text-slate-700 outline-none transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xxs font-black text-slate-500 uppercase tracking-wider">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    value={details.bankName}
                    onChange={handleChange}
                    placeholder="e.g. Au Small Finance Bank Limited"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 rounded-xl text-xs font-semibold text-slate-700 outline-none transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xxs font-black text-slate-500 uppercase tracking-wider">
                    Bank Branch / Location
                  </label>
                  <input
                    type="text"
                    name="bankBranch"
                    value={details.bankBranch}
                    onChange={handleChange}
                    placeholder="e.g. Dwarka Delhi"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 rounded-xl text-xs font-semibold text-slate-700 outline-none transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xxs font-black text-slate-500 uppercase tracking-wider">
                    Account Number
                  </label>
                  <input
                    type="text"
                    name="bankAccountNo"
                    value={details.bankAccountNo}
                    onChange={handleChange}
                    placeholder="e.g. 2402210060989650"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 rounded-xl text-xs font-semibold text-slate-700 outline-none transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xxs font-black text-slate-500 uppercase tracking-wider">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    name="bankIfscCode"
                    value={details.bankIfscCode}
                    onChange={handleChange}
                    required
                    placeholder="e.g. AUBL0002100"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 rounded-xl text-xs font-semibold text-slate-700 outline-none transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xxs font-black text-slate-500 uppercase tracking-wider">
                    Signature Image (Transparent PNG)
                  </label>
                  <div className="space-y-2">
                    {details.signatureImage ? (
                      <div className="relative inline-block">
                        <img
                          src={details.signatureImage}
                          alt="Signature"
                          className="h-16 max-w-xs object-contain bg-slate-50 rounded-lg border border-slate-200"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setDetails((prev) => ({
                              ...prev,
                              signatureImage: "",
                            }))
                          }
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <input
                          type="file"
                          id="signature-upload"
                          accept="image/png,image/jpeg"
                          onChange={handleSignatureUpload}
                          className="hidden"
                        />
                        <label
                          htmlFor="signature-upload"
                          className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50 rounded-xl cursor-pointer transition"
                        >
                          <Upload className="h-4 w-4 text-slate-400" />
                          <span className="text-xs font-semibold text-slate-500">
                            Upload signature image
                          </span>
                        </label>
                      </div>
                    )}
                    <p className="text-xxs text-slate-400">
                      Upload a transparent PNG signature for invoices
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xxs font-black text-slate-500 uppercase tracking-wider">
                    QR Code (Payment)
                  </label>
                  <div className="space-y-2">
                    {details.qrCode ? (
                      <div className="relative inline-block">
                        <img
                          src={details.qrCode}
                          alt="QR Code"
                          className="h-24 max-w-xs object-contain bg-slate-50 rounded-lg border border-slate-200"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setDetails((prev) => ({
                              ...prev,
                              qrCode: "",
                            }))
                          }
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <input
                          type="file"
                          id="qr-upload"
                          accept="image/png,image/jpeg"
                          onChange={handleQrCodeUpload}
                          className="hidden"
                        />
                        <label
                          htmlFor="qr-upload"
                          className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50 rounded-xl cursor-pointer transition"
                        >
                          <Upload className="h-4 w-4 text-slate-400" />
                          <span className="text-xs font-semibold text-slate-500">
                            Upload QR code image
                          </span>
                        </label>
                      </div>
                    )}
                    <p className="text-xxs text-slate-400">
                      Upload QR code for payment on invoices
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Actions footer bar */}
        <div className="bg-white rounded-3xl border border-slate-100 p-4 shadow-sm flex items-center justify-between gap-4">
          <p className="text-xxs text-slate-400 font-extrabold uppercase tracking-wider hidden sm:block">
            * Ensure all values match official GST registry
          </p>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black shadow-lg shadow-blue-600/20 transition duration-150 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving Details...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Business Profile
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
