import React, { useState } from "react";
import {
  Building2,
  UserPlus,
  Package,
  FileText,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Settings,
  CreditCard,
  Image as ImageIcon,
  Search,
  Edit,
  Trash2,
  Plus,
  Download,
  Zap,
  Phone,
  User,
} from "lucide-react";

export default function HowToUse() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: 1,
      title: "Setup Business",
      icon: Building2,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      description: "Configure your clinic details",
      items: [
        { icon: Settings, text: "Fill business name & address" },
        { icon: Phone, text: "Add contact information" },
        { icon: CreditCard, text: "Setup bank details" },
        { icon: ImageIcon, text: "Upload signature & QR code" },
      ],
    },
    {
      id: 2,
      title: "Add Patients",
      icon: UserPlus,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600",
      description: "Register patients for billing",
      items: [
        { icon: Plus, text: "Click 'Add New Patient'" },
        { icon: User, text: "Fill patient details" },
        { icon: Search, text: "Search patients easily" },
        { icon: Edit, text: "Edit or delete anytime" },
      ],
    },
    {
      id: 3,
      title: "Manage Inventory",
      icon: Package,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      description: "Add products & services",
      items: [
        { icon: Plus, text: "Add items to inventory" },
        { icon: Package, text: "Set prices & stock" },
        { icon: Search, text: "Quick item search" },
        { icon: Edit, text: "Update stock levels" },
      ],
    },
    {
      id: 4,
      title: "Create Invoice",
      icon: FileText,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
      description: "Generate professional bills",
      items: [
        { icon: User, text: "Select patient" },
        { icon: Package, text: "Add items from inventory" },
        { icon: Zap, text: "Apply discounts" },
        { icon: CheckCircle, text: "Generate PDF invoice" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm mb-4">
          <Sparkles className="h-4 w-4 text-yellow-500" />
          <span className="text-sm font-bold text-slate-600">
            Quick Start Guide
          </span>
        </div>
        <h1 className="text-4xl font-black text-slate-800 mb-3">
          How to Use Vision Health Care
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Follow these simple steps to get started with billing in minutes
        </p>
      </div>

      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto mb-12">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = activeStep === index;
            const isCompleted = activeStep > index;

            return (
              <div key={step.id} className="flex-1 flex items-center">
                <div
                  className={`flex flex-col items-center cursor-pointer transition-all duration-300 ${
                    isActive ? "scale-110" : "scale-100"
                  }`}
                  onClick={() => setActiveStep(index)}
                >
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 ${
                      isCompleted
                        ? "bg-gradient-to-br from-green-500 to-green-600 text-white"
                        : isActive
                          ? `bg-gradient-to-br ${step.color} text-white shadow-xl ring-4 ring-offset-2 ${step.textColor.replace(
                              "text-",
                              "ring-",
                            )}`
                          : "bg-white text-slate-400"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-8 w-8" />
                    ) : (
                      <Icon className="h-8 w-8" />
                    )}
                  </div>
                  <span
                    className={`mt-2 text-xs font-bold ${
                      isActive ? step.textColor : "text-slate-400"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-4 rounded-full transition-all duration-500 ${
                      isCompleted ? "bg-green-500" : "bg-slate-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Step Content */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Step Header */}
          <div
            className={`bg-gradient-to-r ${steps[activeStep].color} p-8 text-white`}
          >
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                {React.createElement(steps[activeStep].icon, {
                  className: "h-10 w-10",
                })}
              </div>
              <div>
                <h2 className="text-2xl font-black">
                  {steps[activeStep].title}
                </h2>
                <p className="text-white/80">{steps[activeStep].description}</p>
              </div>
            </div>
          </div>

          {/* Step Content */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {steps[activeStep].items.map((item, index) => {
                const ItemIcon = item.icon;
                return (
                  <div
                    key={index}
                    className={`flex items-center gap-4 p-4 rounded-2xl ${steps[activeStep].bgColor} transition-all duration-300 hover:scale-105`}
                  >
                    <div
                      className={`p-3 rounded-xl ${steps[activeStep].textColor} bg-white shadow-sm`}
                    >
                      <ItemIcon className="h-5 w-5" />
                    </div>
                    <span className="font-semibold text-slate-700">
                      {item.text}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
              <button
                onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                disabled={activeStep === 0}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowRight className="h-4 w-4 rotate-180" />
                Previous
              </button>
              {activeStep < steps.length - 1 ? (
                <button
                  onClick={() =>
                    setActiveStep(Math.min(steps.length - 1, activeStep + 1))
                  }
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r ${steps[activeStep].color} hover:shadow-lg transition`}
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={() => setActiveStep(0)}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-green-500 to-green-600 hover:shadow-lg transition"
                >
                  Start Over
                  <Sparkles className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-yellow-100 rounded-xl">
              <Sparkles className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 mb-1">Pro Tip</h3>
              <p className="text-sm text-slate-600">
                {activeStep === 0 &&
                  "Upload a transparent PNG signature and payment QR code for professional-looking invoices."}
                {activeStep === 1 &&
                  "Use the search box to quickly find patients by name or phone number."}
                {activeStep === 2 &&
                  "Keep your inventory updated with accurate stock levels for better tracking."}
                {activeStep === 3 &&
                  "Download PDF invoices immediately after generation for backup records."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-4xl mx-auto mt-12 text-center">
        <p className="text-sm text-slate-500">
          Need more help? Check the full documentation or contact support
        </p>
      </div>
    </div>
  );
}
