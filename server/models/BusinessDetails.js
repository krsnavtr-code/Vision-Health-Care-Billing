import mongoose from "mongoose";

const businessDetailsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      default: "Vision Health Care and Home Care Services",
      trim: true,
    },
    address: {
      type: String,
      required: true,
      default: "Sector 62, Noida, NCR Delhi",
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      default: "+91 99887 76655",
      trim: true,
    },
    email: {
      type: String,
      required: true,
      default: "billing@visionhealthcare.com",
      trim: true,
    },
    gstin: {
      type: String,
      required: true,
      default: "07GPYPS6223A1ZH",
      trim: true,
    },
    state: {
      type: String,
      required: true,
      default: "07-Delhi",
      trim: true,
    },
    website: {
      type: String,
      required: true,
      default: "www.visionhealthcare.com",
      trim: true,
    },
    bankName: {
      type: String,
      required: true,
      default: "Au Small Finance Bank Limited",
      trim: true,
    },
    bankBranch: {
      type: String,
      required: true,
      default: "Noida, Delhi NCR",
      trim: true,
    },
    bankAccountNo: {
      type: String,
      required: true,
      default: "2402210060989650",
      trim: true,
    },
    bankIfscCode: {
      type: String,
      required: true,
      default: "AUBL0002100",
      trim: true,
    },
    accountHolderName: {
      type: String,
      required: true,
      default: "Vision Health Care Services",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("BusinessDetails", businessDetailsSchema);
