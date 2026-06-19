import mongoose from "mongoose";

const staffSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      enum: [
        "Nursing",
        "Administration",
        "Maintenance",
        "Support",
        "Management",
        "Other",
      ],
    },
    designation: {
      type: String,
      required: true,
      trim: true,
    },
    employmentType: {
      type: String,
      required: true,
      enum: ["Full-time", "Part-time", "Contract", "Intern"],
      default: "Full-time",
    },
    address: {
      type: String,
      trim: true,
    },
    emergencyContact: {
      name: {
        type: String,
        trim: true,
      },
      phoneNumber: {
        type: String,
        trim: true,
      },
      relation: {
        type: String,
        trim: true,
      },
    },
    upiId: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "On Leave", "Terminated"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Staff", staffSchema);
