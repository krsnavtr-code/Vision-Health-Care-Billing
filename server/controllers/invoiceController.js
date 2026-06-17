import Invoice from "../models/Invoice.js";
import Inventory from "../models/Inventory.js";
import Equipment from "../models/Equipment.js";
import User from "../models/User.js";
import BusinessDetails from "../models/BusinessDetails.js";
import { generateInvoicePDF } from "../utils/pdfGenerator.js";

// @desc    Generate a new invoice (The Billing Engine)
// @route   POST /api/invoices/generate
// @access  Private (Admin, Manager, Nurse/Staff)
const generateInvoice = async (req, res) => {
  try {
    const { patientId, items, amountPaid, paymentMethod, notes } = req.body;

    // 1. Validation
    if (!patientId) {
      return res
        .status(400)
        .json({ success: false, message: "Patient ID is required" });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invoice must contain at least one item",
      });
    }

    // Verify Patient exists
    const patient = await User.findById(patientId);
    if (!patient) {
      return res
        .status(404)
        .json({ success: false, message: "Patient not found" });
    }

    // 2. Process and Enrich items
    const enrichedItems = [];

    for (let item of items) {
      const {
        itemType,
        itemId,
        quantity,
        discount,
        rentalDays,
        rentalRateType,
      } = item;
      const itemQty = quantity ? parseInt(quantity) : 1;
      const itemDisc = discount ? parseFloat(discount) : 0;

      if (itemType === "Medicine") {
        if (!itemId) {
          return res
            .status(400)
            .json({ success: false, message: "Medicine itemId is required" });
        }
        const med = await Inventory.findById(itemId);
        if (!med) {
          return res.status(404).json({
            success: false,
            message: `Medicine not found for ID: ${itemId}`,
          });
        }

        // Check and update stock
        if (med.stockQuantity < itemQty) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${med.itemName}. Available: ${med.stockQuantity}, Requested: ${itemQty}`,
          });
        }

        // Deduct stock
        med.stockQuantity -= itemQty;
        await med.save();

        enrichedItems.push({
          itemType: "Medicine",
          itemId: med._id,
          itemModel: "Inventory",
          name: med.itemName,
          quantity: itemQty,
          unitPrice: med.basePrice,
          gstRate:
            item.gstRate !== undefined ? parseFloat(item.gstRate) : med.gstRate,
          discount: itemDisc,
        });
      } else if (itemType === "Rental") {
        if (!itemId) {
          return res
            .status(400)
            .json({ success: false, message: "Equipment itemId is required" });
        }
        const eq = await Equipment.findById(itemId);
        if (!eq) {
          return res.status(404).json({
            success: false,
            message: `Equipment not found for ID: ${itemId}`,
          });
        }

        const rateType = rentalRateType || "Daily";
        const rentalPeriod = rentalDays ? parseInt(rentalDays) : 1;
        const pricePerUnit =
          rateType === "Monthly" ? eq.monthlyRentalPrice : eq.dailyRentalPrice;

        // Note: For rental, unitPrice represents the rental fee for the entire rentalPeriod OR base price.
        // Let's store unitPrice as the base price of the period, and total calculations will handle it.
        // We will define totalPrice = (unitPrice * quantity * rentalDays) + tax - discount in Invoice hooks.
        // Wait, to keep standard (unitPrice * quantity) as base price:
        // Let's set unitPrice = pricePerUnit * rentalPeriod. That way, unitPrice * quantity represents the rental cost, which fits our Invoice.js pre-save hook perfectly!
        const totalRentalPrice = pricePerUnit * rentalPeriod;

        enrichedItems.push({
          itemType: "Rental",
          itemId: eq._id,
          itemModel: "Equipment",
          name: `${eq.equipmentName} (${rentalPeriod} ${rateType === "Monthly" ? "Month(s)" : "Day(s)"})`,
          quantity: itemQty,
          unitPrice: totalRentalPrice,
          gstRate: item.gstRate !== undefined ? parseFloat(item.gstRate) : 18,
          discount: itemDisc,
          rentalDays: rentalPeriod,
          rentalRateType: rateType,
        });
      } else if (itemType === "Service") {
        // Services can be one-off and added directly by name
        if (!item.name || item.unitPrice === undefined) {
          return res.status(400).json({
            success: false,
            message: "Service name and unitPrice are required",
          });
        }

        enrichedItems.push({
          itemType: "Service",
          name: item.name,
          quantity: itemQty,
          unitPrice: parseFloat(item.unitPrice),
          gstRate: item.gstRate !== undefined ? parseFloat(item.gstRate) : 18, // Default 18% GST for services
          discount: itemDisc,
        });
      } else {
        return res
          .status(400)
          .json({ success: false, message: `Invalid itemType: ${itemType}` });
      }
    }

    // 3. Generate Unique Invoice Number
    const count = await Invoice.countDocuments();
    const year = new Date().getFullYear();
    const invoiceNumber = `INV-${year}-${(count + 1).toString().padStart(4, "0")}`;

    // 4. Create and Save Invoice
    // Pre-save hook in Invoice.js automatically computes subTotal, taxAmount, grandTotal, balance, and paymentStatus!
    const invoice = new Invoice({
      invoiceNumber,
      patientId,
      items: enrichedItems,
      amountPaid: amountPaid ? parseFloat(amountPaid) : 0,
      paymentMethod: paymentMethod || "Cash",
      notes,
    });

    await invoice.save();

    // Re-fetch with populated Patient details for response
    const populatedInvoice = await Invoice.findById(invoice._id).populate(
      "patientId",
      "name email phoneNumber address",
    );

    res.status(201).json({
      success: true,
      message: "Invoice generated successfully",
      data: populatedInvoice,
    });
  } catch (error) {
    console.error("Generate Invoice Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all invoices (with filters)
// @route   GET /api/invoices
// @access  Private (All authenticated users)
const getInvoices = async (req, res) => {
  try {
    const { patientId, paymentStatus, search } = req.query;
    let query = {};

    if (patientId) {
      query.patientId = patientId;
    }

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    if (search) {
      // Find invoices matching invoiceNumber
      query.invoiceNumber = { $regex: search, $options: "i" };
    }

    const invoices = await Invoice.find(query)
      .populate("patientId", "name email phoneNumber")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: invoices.length, data: invoices });
  } catch (error) {
    console.error("Get Invoices Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single invoice details
// @route   GET /api/invoices/:id
// @access  Private
const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("patientId", "name email phoneNumber address")
      .populate("items.itemId");

    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, message: "Invoice not found" });
    }

    res.json({ success: true, data: invoice });
  } catch (error) {
    console.error("Get Invoice Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Download PDF of invoice
// @route   GET /api/invoices/:id/pdf
// @access  Private
const downloadInvoicePDF = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate(
      "patientId",
      "name email phoneNumber address",
    );

    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, message: "Invoice not found" });
    }

    // Fetch dynamic business details from DB
    const businessDetails = await BusinessDetails.findOne();

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${invoice.invoiceNumber}.pdf`,
    );

    generateInvoicePDF(invoice, businessDetails, res);
  } catch (error) {
    console.error("Download PDF Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export { generateInvoice, getInvoices, getInvoiceById, downloadInvoicePDF };
