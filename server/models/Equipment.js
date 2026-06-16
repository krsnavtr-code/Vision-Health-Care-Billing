import mongoose from "mongoose";

const equipmentSchema = new mongoose.Schema(
  {
    equipmentName: {
      type: String,
      required: true,
      trim: true,
    },
    serialNumber: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null/undefined values if serial number is not set yet
      trim: true,
    },
    dailyRentalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    monthlyRentalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    securityDeposit: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Available", "Rented", "Maintenance"],
      default: "Available",
      required: true,
    },
    currentPatientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    rentalStartDate: {
      type: Date,
      default: null,
    },
    lastServicedDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Equipment", equipmentSchema);
