import mongoose from "mongoose";
import Staff from "./Staff.js";

const staffInvoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      unique: true,
      required: false,
    },
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
    },
    billingPeriod: {
      startDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
        required: true,
      },
    },
    totalAmount: {
      type: Number,
      required: false,
      default: 0,
      min: 0, // Total bill amount (Total Salary)
    },
    deduction: {
      type: Number,
      required: false,
      default: 0,
      min: 0, // Deduction amount
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Partially Paid"],
      default: "Pending",
      required: true,
    },
    amountPaid: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    balance: {
      type: Number,
      required: true,
      default: 0, // totalAmount - deduction - amountPaid
    },
    paymentMethod: {
      type: String,
      enum: ["Bank Transfer", "Cash", "Cheque", "UPI"],
      default: "Bank Transfer",
      required: true,
    },
    paymentDate: {
      type: Date,
    },
    invoiceDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // Admin/Manager who generated the invoice
    },
  },
  {
    timestamps: true,
  },
);

// Pre-validate hook to calculate balance automatically
staffInvoiceSchema.pre("validate", function () {
  // Calculate balance
  this.balance = parseFloat(
    (this.totalAmount - this.deduction - this.amountPaid).toFixed(2),
  );

  // Update payment status automatically
  if (this.amountPaid === 0) {
    this.paymentStatus = "Pending";
  } else if (this.balance <= 0) {
    this.balance = 0;
    this.paymentStatus = "Paid";
    this.paymentDate = this.paymentDate || new Date();
  } else {
    this.paymentStatus = "Partially Paid";
  }
});

// Generate invoiceNumber before saving if not provided
staffInvoiceSchema.pre("save", async function () {
  if (!this.invoiceNumber) {
    const staff = await Staff.findById(this.staffId);
    const name = staff ? staff.name : "XXX";
    const namePart = name.substring(0, 3).toUpperCase();
    const date = new Date();
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);
    const randomLetters = Math.random()
      .toString(36)
      .substring(2, 4)
      .toUpperCase();
    const count = await mongoose.model("StaffInvoice").countDocuments();
    const serial = String(count + 1).padStart(3, "0");
    this.invoiceNumber = `${namePart}${day}${month}${year}${randomLetters}${serial}`;
  }
});

export default mongoose.model("StaffInvoice", staffInvoiceSchema);
