import Shift from "../models/Shift.js";
import Invoice from "../models/Invoice.js";
import Inventory from "../models/Inventory.js";
import Equipment from "../models/Equipment.js";
import User from "../models/User.js";

// @desc    Clock-in / Start Shift
// @route   POST /api/shifts/clock-in
// @access  Private (Nurse/Staff, Admin, Manager)
const clockIn = async (req, res) => {
  try {
    const { patientId, hourlyRate } = req.body;
    const staffId = req.user._id;

    if (!patientId) {
      return res.status(400).json({ success: false, message: "Patient ID is required" });
    }

    // Check if there's already an active shift for this staff
    const activeShift = await Shift.findOne({ staffId, status: "Active" });
    if (activeShift) {
      return res.status(400).json({
        success: false,
        message: "You already have an active shift. Please clock-out first.",
        data: activeShift,
      });
    }

    // Verify Patient exists
    const patient = await User.findById(patientId);
    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    const shift = await Shift.create({
      staffId,
      patientId,
      hourlyRate: hourlyRate || 150,
      clockIn: new Date(),
    });

    res.status(201).json({ success: true, message: "Clocked-in successfully", data: shift });
  } catch (error) {
    console.error("Clock-in Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Clock-out / End Shift & calculate hours
// @route   POST /api/shifts/clock-out
// @access  Private (Nurse/Staff, Admin, Manager)
const clockOut = async (req, res) => {
  try {
    const staffId = req.user._id;

    const activeShift = await Shift.findOne({ staffId, status: "Active" });
    if (!activeShift) {
      return res.status(400).json({ success: false, message: "No active shift found to clock-out from." });
    }

    const clockOutTime = new Date();
    const durationMs = clockOutTime - activeShift.clockIn;
    
    // Calculate total hours, round to 2 decimal places. Minimum 0.1 hours for testing purposes
    let hours = durationMs / (1000 * 60 * 60);
    hours = parseFloat(Math.max(hours, 0.1).toFixed(2));

    activeShift.clockOut = clockOutTime;
    activeShift.totalHours = hours;
    activeShift.totalBilling = parseFloat((hours * activeShift.hourlyRate).toFixed(2));
    activeShift.status = "Completed";

    await activeShift.save();

    res.json({ success: true, message: "Clocked-out successfully", data: activeShift });
  } catch (error) {
    console.error("Clock-out Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all shifts for authenticated staff member
// @route   GET /api/shifts/my-shifts
// @access  Private (Nurse/Staff, Admin, Manager)
const getStaffShifts = async (req, res) => {
  try {
    const staffId = req.user._id;
    const shifts = await Shift.find({ staffId })
      .populate("patientId", "name email phoneNumber")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: shifts.length, data: shifts });
  } catch (error) {
    console.error("Get Staff Shifts Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Append consumables directly to Patient's active unpaid Invoice
// @route   POST /api/shifts/patient/:patientId/log-consumable
// @access  Private (Nurse/Staff, Admin, Manager)
const appendConsumable = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { itemId, quantity, discount } = req.body;
    const qty = quantity ? parseInt(quantity) : 1;

    if (!itemId) {
      return res.status(400).json({ success: false, message: "Consumable Inventory itemId is required" });
    }

    // 1. Fetch consumable from stock
    const item = await Inventory.findById(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: "Inventory consumable item not found" });
    }

    // Check stock
    if (item.stockQuantity < qty) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for ${item.itemName}. Available: ${item.stockQuantity}, Requested: ${qty}`,
      });
    }

    // 2. Find latest active Unpaid invoice for this patient, or create a brand new draft if none exists
    let invoice = await Invoice.findOne({ patientId, paymentStatus: { $ne: "Paid" } });
    
    if (!invoice) {
      // Create new draft Invoice
      const count = await Invoice.countDocuments();
      const year = new Date().getFullYear();
      const invoiceNumber = `INV-${year}-${(count + 1).toString().padStart(4, "0")}`;

      invoice = new Invoice({
        invoiceNumber,
        patientId,
        items: [],
        amountPaid: 0,
        paymentMethod: "Cash",
        notes: "Auto-initiated by home nursing shift consumable logger",
      });
    }

    // Deduct Stock
    item.stockQuantity -= qty;
    await item.save();

    // 3. Append to Invoice items
    invoice.items.push({
      itemType: "Medicine", // medicines/consumables are mapped to Medicine type in schema
      itemId: item._id,
      itemModel: "Inventory",
      name: item.itemName,
      quantity: qty,
      unitPrice: item.basePrice,
      gstRate: item.gstRate,
      discount: discount ? parseFloat(discount) : 0,
    });

    // 4. Save Invoice - Pre-save hooks automatically re-evaluate subTotal, taxAmount, grandTotal, and outstanding balance!
    await invoice.save();

    const populated = await Invoice.findById(invoice._id).populate("patientId", "name email phoneNumber");

    res.json({
      success: true,
      message: `${item.itemName} successfully logged to Patient running bill!`,
      data: populated,
    });
  } catch (error) {
    console.error("Append Consumable Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get dynamic ledger for Patient and Family
// @route   GET /api/shifts/patient/:patientId/ledger
// @access  Private (All roles)
const getPatientLedger = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Verify patient
    const patient = await User.findById(patientId).select("name email phoneNumber address");
    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    // 1. Fetch all unpaid/partially paid Invoices (ledger totals)
    const activeInvoices = await Invoice.find({ patientId, paymentStatus: { $ne: "Paid" } })
      .sort({ createdAt: -1 });

    // 2. Fetch all completed but unbilled nursing shifts
    const unbilledShifts = await Shift.find({ patientId, status: "Completed", isBilled: false })
      .populate("staffId", "name phoneNumber")
      .sort({ createdAt: -1 });

    // 3. Fetch active equipment rentals
    const activeRentals = await Equipment.find({ currentPatientId: patientId, status: "Rented" });

    // Summary calculations
    let totalOutstandingInvoices = 0;
    activeInvoices.forEach((inv) => (totalOutstandingInvoices += inv.balance));

    let totalUnbilledNurseFee = 0;
    unbilledShifts.forEach((shift) => (totalUnbilledNurseFee += shift.totalBilling));

    const totalDueWithNurseFee = totalOutstandingInvoices + totalUnbilledNurseFee;

    res.json({
      success: true,
      patient,
      summary: {
        outstandingInvoicesTotal: totalOutstandingInvoices,
        unbilledHomeNurseTotal: totalUnbilledNurseFee,
        grandTotalDueBalance: totalDueWithNurseFee,
        activeRentalsCount: activeRentals.length,
      },
      details: {
        unpaidInvoices: activeInvoices,
        unbilledShifts,
        rentedEquipments: activeRentals,
      },
    });
  } catch (error) {
    console.error("Get Patient Ledger Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  clockIn,
  clockOut,
  getStaffShifts,
  appendConsumable,
  getPatientLedger,
};
