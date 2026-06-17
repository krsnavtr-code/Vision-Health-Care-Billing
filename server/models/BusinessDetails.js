import mongoose from "mongoose";

const businessDetailsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
      trim: true,
    },
    address: {
      type: String,
      default: "",
      trim: true,
    },
    phoneNumber: {
      type: String,
      default: "",
      trim: true,
    },
    email: {
      type: String,
      default: "",
      trim: true,
    },
    state: {
      type: String,
      default: "",
      trim: true,
    },
    website: {
      type: String,
      default: "",
      trim: true,
    },
    bankName: {
      type: String,
      default: "",
      trim: true,
    },
    bankBranch: {
      type: String,
      default: "",
      trim: true,
    },
    bankAccountNo: {
      type: String,
      default: "",
      trim: true,
    },
    bankIfscCode: {
      type: String,
      default: "",
      trim: true,
    },
    accountHolderName: {
      type: String,
      default: "",
      trim: true,
    },
    signatureImage: {
      type: String,
      default: "",
    },
    qrCode: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("BusinessDetails", businessDetailsSchema);
