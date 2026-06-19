import StaffInvoice from "../models/StaffInvoice.js";
import Staff from "../models/Staff.js";
import BusinessDetails from "../models/BusinessDetails.js";
import { generateStaffInvoicePDF } from "../utils/staffPdfGenerator.js";
import User from "../models/User.js";

// @desc    Generate new staff invoice
// @route   POST /api/staff-invoices
// @access  Private (Admin, Manager)
const generateStaffInvoice = async (req, res) => {
  try {
    const {
      staffId,
      billingPeriod,
      totalAmount,
      deduction,
      amountPaid,
      paymentMethod,
      notes,
    } = req.body;

    // Validation
    if (!staffId) {
      return res
        .status(400)
        .json({ success: false, message: "Staff ID is required" });
    }
    if (!billingPeriod || !billingPeriod.startDate || !billingPeriod.endDate) {
      return res
        .status(400)
        .json({ success: false, message: "Billing period is required" });
    }

    // Verify staff exists
    const staff = await Staff.findById(staffId);
    if (!staff) {
      return res
        .status(404)
        .json({ success: false, message: "Staff member not found" });
    }

    // Get user who is generating the invoice
    const user = await User.findById(req.user.id);

    // Create invoice
    const invoice = new StaffInvoice({
      staffId,
      billingPeriod,
      totalAmount: totalAmount || 0,
      deduction: deduction || 0,
      amountPaid: amountPaid || 0,
      paymentMethod: paymentMethod || "Bank Transfer",
      notes,
      generatedBy: req.user.id,
    });

    await invoice.save();

    // Re-fetch with populated staff details
    const populatedInvoice = await StaffInvoice.findById(invoice._id)
      .populate(
        "staffId",
        "name designation department phoneNumber email address upiId",
      )
      .populate("generatedBy", "name");

    res.status(201).json({
      success: true,
      message: "Staff invoice generated successfully",
      data: populatedInvoice,
    });
  } catch (error) {
    console.error("Generate Staff Invoice Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all staff invoices
// @route   GET /api/staff-invoices
// @access  Private (Admin, Manager)
const getStaffInvoices = async (req, res) => {
  try {
    const { staffId, paymentStatus, search } = req.query;
    let query = {};

    if (staffId) {
      query.staffId = staffId;
    }

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    if (search) {
      query.invoiceNumber = { $regex: search, $options: "i" };
    }

    const invoices = await StaffInvoice.find(query)
      .populate("staffId", "name designation department")
      .populate("generatedBy", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: invoices.length, data: invoices });
  } catch (error) {
    console.error("Get Staff Invoices Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single staff invoice
// @route   GET /api/staff-invoices/:id
// @access  Private (Admin, Manager)
const getStaffInvoiceById = async (req, res) => {
  try {
    const invoice = await StaffInvoice.findById(req.params.id)
      .populate(
        "staffId",
        "name designation department phoneNumber email address upiId",
      )
      .populate("generatedBy", "name");

    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, message: "Staff invoice not found" });
    }

    res.json({ success: true, data: invoice });
  } catch (error) {
    console.error("Get Staff Invoice Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Download PDF of staff invoice
// @route   GET /api/staff-invoices/:id/pdf
// @access  Private (Admin, Manager)
const downloadStaffInvoicePDF = async (req, res) => {
  try {
    const invoice = await StaffInvoice.findById(req.params.id).populate(
      "staffId",
      "name designation department phoneNumber email address upiId",
    );

    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, message: "Staff invoice not found" });
    }

    // Fetch business details
    const businessDetails = await BusinessDetails.findOne();

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${invoice.invoiceNumber}.pdf`,
    );

    generateStaffInvoicePDF(invoice, businessDetails, res);
  } catch (error) {
    console.error("Download Staff PDF Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update staff invoice payment
// @route   PUT /api/staff-invoices/:id/payment
// @access  Private (Admin, Manager)
const updateStaffInvoicePayment = async (req, res) => {
  try {
    const { amountPaid, paymentMethod } = req.body;

    const invoice = await StaffInvoice.findById(req.params.id);

    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, message: "Staff invoice not found" });
    }

    invoice.amountPaid =
      amountPaid !== undefined ? amountPaid : invoice.amountPaid;
    invoice.paymentMethod = paymentMethod || invoice.paymentMethod;

    await invoice.save();

    const updatedInvoice = await StaffInvoice.findById(invoice._id).populate(
      "staffId",
      "name designation department",
    );

    res.json({
      success: true,
      message: "Payment updated successfully",
      data: updatedInvoice,
    });
  } catch (error) {
    console.error("Update Staff Invoice Payment Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get staff invoices overview grouped by staff
// @route   GET /api/staff-invoices/overview
// @access  Private (Admin, Manager)
const getStaffInvoicesOverview = async (req, res) => {
  try {
    const invoices = await StaffInvoice.find()
      .populate("staffId", "name phone designation")
      .sort({ createdAt: -1 });

    // Group invoices by staff
    const staffBillsMap = new Map();

    invoices.forEach((invoice) => {
      if (!invoice.staffId) return;

      const staffId = invoice.staffId._id.toString();

      if (!staffBillsMap.has(staffId)) {
        staffBillsMap.set(staffId, {
          staff: invoice.staffId,
          invoices: [],
          totalBills: 0,
          totalAmount: 0,
        });
      }

      const staffBill = staffBillsMap.get(staffId);
      staffBill.invoices.push(invoice);
      staffBill.totalBills += 1;
      staffBill.totalAmount += invoice.totalAmount || 0;
    });

    const staffBills = Array.from(staffBillsMap.values());

    res.json({ success: true, data: staffBills });
  } catch (error) {
    console.error("Get Staff Invoices Overview Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  generateStaffInvoice,
  getStaffInvoices,
  getStaffInvoiceById,
  downloadStaffInvoicePDF,
  updateStaffInvoicePayment,
  getStaffInvoicesOverview,
};
