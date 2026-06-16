import mongoose from "mongoose";

const invoiceItemSchema = new mongoose.Schema({
  itemType: {
    type: String,
    enum: ["Medicine", "Service", "Rental"],
    required: true,
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: function () {
      return this.itemType !== "Service"; // Services could be one-off and might not require a reference ID
    },
    refPath: "items.itemModel",
  },
  itemModel: {
    type: String,
    required: function () {
      return this.itemType !== "Service";
    },
    enum: ["Inventory", "Equipment"],
  },
  name: {
    type: String,
    required: true, // Snapshot of item name at invoice time
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  gstRate: {
    type: Number,
    required: true,
    min: 0,
    default: 0, // GST rate in percentage (e.g. 5, 12, 18)
  },
  taxAmount: {
    type: Number,
    required: true,
    min: 0,
    default: 0, // calculated: unitPrice * quantity * (gstRate / 100)
  },
  discount: {
    type: Number,
    required: true,
    min: 0,
    default: 0, // Discount amount on this specific item
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0, // calculated: (unitPrice * quantity) + taxAmount - discount
  },
  // Rental specific fields (if itemType is Rental)
  rentalDays: {
    type: Number,
    default: null,
  },
  rentalRateType: {
    type: String,
    enum: ["Daily", "Monthly"],
    default: null,
  },
});

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      unique: true,
      required: true, // e.g. INV-2026-0001
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [invoiceItemSchema],
    subTotal: {
      type: Number,
      required: true,
      min: 0, // Sum of (unitPrice * quantity) before taxes and discount
    },
    totalDiscount: {
      type: Number,
      required: true,
      min: 0,
      default: 0, // Sum of item-wise discounts + any overall invoice discount
    },
    taxAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0, // Total accumulated tax amount
    },
    grandTotal: {
      type: Number,
      required: true,
      min: 0, // subTotal + taxAmount - totalDiscount
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
      default: 0, // grandTotal - amountPaid
    },
    paymentStatus: {
      type: String,
      enum: ["Unpaid", "Partially Paid", "Paid"],
      default: "Unpaid",
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Card", "UPI", "Bank Transfer", "Mixed"],
      default: "Cash",
      required: true,
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
  },
  {
    timestamps: true,
  },
);

// Pre-validate hook to calculate and update balance & paymentStatus automatically
invoiceSchema.pre("validate", function () {
  // Recalculate subTotal, taxAmount, and grandTotal from items for accuracy
  let computedSubTotal = 0;
  let computedTaxAmount = 0;
  let computedTotalDiscount = 0;

  this.items.forEach((item) => {
    // 1. Calculate Tax Amount
    const baseAmount = item.unitPrice * item.quantity;
    item.taxAmount = parseFloat((baseAmount * (item.gstRate / 100)).toFixed(2));

    // 2. Calculate Total Price for the item
    item.totalPrice = parseFloat(
      (baseAmount + item.taxAmount - item.discount).toFixed(2),
    );

    computedSubTotal += baseAmount;
    computedTaxAmount += item.taxAmount;
    computedTotalDiscount += item.discount;
  });

  this.subTotal = parseFloat(computedSubTotal.toFixed(2));
  this.taxAmount = parseFloat(computedTaxAmount.toFixed(2));
  this.totalDiscount = parseFloat(computedTotalDiscount.toFixed(2));
  this.grandTotal = parseFloat(
    (this.subTotal + this.taxAmount - this.totalDiscount).toFixed(2),
  );

  // 3. Compute balance
  this.balance = parseFloat((this.grandTotal - this.amountPaid).toFixed(2));

  // 4. Update payment status automatically
  if (this.amountPaid === 0) {
    this.paymentStatus = "Unpaid";
  } else if (this.balance <= 0) {
    this.balance = 0; // Prevent negative balance representation
    this.paymentStatus = "Paid";
  } else {
    this.paymentStatus = "Partially Paid";
  }
});

export default mongoose.model("Invoice", invoiceSchema);
