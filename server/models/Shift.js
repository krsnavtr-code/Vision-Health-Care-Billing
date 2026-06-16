import mongoose from "mongoose";

const shiftSchema = new mongoose.Schema(
  {
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    clockIn: {
      type: Date,
      required: true,
      default: Date.now,
    },
    clockOut: {
      type: Date,
      default: null,
    },
    hourlyRate: {
      type: Number,
      required: true,
      default: 150, // Rs. 150 per hour
    },
    totalHours: {
      type: Number,
      required: true,
      default: 0,
    },
    totalBilling: {
      type: Number,
      required: true,
      default: 0, // totalHours * hourlyRate
    },
    status: {
      type: String,
      enum: ["Active", "Completed"],
      default: "Active",
      required: true,
    },
    isBilled: {
      type: Boolean,
      default: false, // Set to true when this shift billing is compiled into an Invoice
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Shift", shiftSchema);
