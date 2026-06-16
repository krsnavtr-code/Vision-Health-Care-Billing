import Equipment from "../models/Equipment.js";

// @desc    Get all equipment (with optional search and status filter)
// @route   GET /api/equipment
// @access  Private (All authenticated users)
const getEquipment = async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = {};

    if (search) {
      query.equipmentName = { $regex: search, $options: "i" };
    }

    if (status) {
      query.status = status;
    }

    const equipment = await Equipment.find(query)
      .populate("currentPatientId", "name email phoneNumber")
      .sort({ equipmentName: 1 });

    res.json({ success: true, count: equipment.length, data: equipment });
  } catch (error) {
    console.error("Get Equipment Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single equipment
// @route   GET /api/equipment/:id
// @access  Private
const getEquipmentById = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id).populate(
      "currentPatientId",
      "name email phoneNumber address"
    );
    if (!equipment) {
      return res.status(404).json({ success: false, message: "Equipment not found" });
    }
    res.json({ success: true, data: equipment });
  } catch (error) {
    console.error("Get Equipment Item Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new equipment
// @route   POST /api/equipment
// @access  Private (Admin, Manager, Nurse/Staff)
const createEquipment = async (req, res) => {
  try {
    const { equipmentName, serialNumber, dailyRentalPrice, monthlyRentalPrice, securityDeposit, status } = req.body;

    // Check if serial number already exists (if provided)
    if (serialNumber) {
      const serialExists = await Equipment.findOne({ serialNumber: serialNumber.trim() });
      if (serialExists) {
        return res.status(400).json({ success: false, message: "An equipment with this serial number already exists" });
      }
    }

    const equipment = await Equipment.create({
      equipmentName,
      serialNumber,
      dailyRentalPrice,
      monthlyRentalPrice,
      securityDeposit,
      status,
    });

    res.status(201).json({ success: true, data: equipment });
  } catch (error) {
    console.error("Create Equipment Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update equipment details
// @route   PUT /api/equipment/:id
// @access  Private (Admin, Manager, Nurse/Staff)
const updateEquipment = async (req, res) => {
  try {
    const { equipmentName, serialNumber, dailyRentalPrice, monthlyRentalPrice, securityDeposit, status, lastServicedDate } = req.body;

    let equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({ success: false, message: "Equipment not found" });
    }

    // Check serial number uniqueness if updated
    if (serialNumber && serialNumber.trim() !== equipment.serialNumber) {
      const serialExists = await Equipment.findOne({ serialNumber: serialNumber.trim() });
      if (serialExists) {
        return res.status(400).json({ success: false, message: "An equipment with this serial number already exists" });
      }
    }

    // Update fields
    equipment.equipmentName = equipmentName || equipment.equipmentName;
    equipment.serialNumber = serialNumber !== undefined ? serialNumber : equipment.serialNumber;
    equipment.dailyRentalPrice = dailyRentalPrice !== undefined ? dailyRentalPrice : equipment.dailyRentalPrice;
    equipment.monthlyRentalPrice = monthlyRentalPrice !== undefined ? monthlyRentalPrice : equipment.monthlyRentalPrice;
    equipment.securityDeposit = securityDeposit !== undefined ? securityDeposit : equipment.securityDeposit;
    equipment.status = status || equipment.status;
    equipment.lastServicedDate = lastServicedDate !== undefined ? lastServicedDate : equipment.lastServicedDate;

    await equipment.save();

    res.json({ success: true, data: equipment });
  } catch (error) {
    console.error("Update Equipment Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete equipment
// @route   DELETE /api/equipment/:id
// @access  Private (Admin, Manager)
const deleteEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({ success: false, message: "Equipment not found" });
    }

    // Ensure we don't delete equipment that is currently rented out
    if (equipment.status === "Rented") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete equipment that is currently rented by a patient",
      });
    }

    await equipment.deleteOne();
    res.json({ success: true, message: "Equipment removed" });
  } catch (error) {
    console.error("Delete Equipment Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Rent/Assign equipment to patient
// @route   POST /api/equipment/:id/assign
// @access  Private (Admin, Manager, Nurse/Staff)
const assignEquipment = async (req, res) => {
  try {
    const { patientId, rentalStartDate } = req.body;

    if (!patientId) {
      return res.status(400).json({ success: false, message: "Patient ID is required" });
    }

    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({ success: false, message: "Equipment not found" });
    }

    if (equipment.status !== "Available") {
      return res.status(400).json({
        success: false,
        message: `Equipment is currently ${equipment.status.toLowerCase()} and cannot be rented`,
      });
    }

    equipment.status = "Rented";
    equipment.currentPatientId = patientId;
    equipment.rentalStartDate = rentalStartDate || new Date();

    await equipment.save();

    res.json({ success: true, message: "Equipment rented successfully", data: equipment });
  } catch (error) {
    console.error("Assign Equipment Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Release/Return equipment from patient
// @route   POST /api/equipment/:id/return
// @access  Private (Admin, Manager, Nurse/Staff)
const returnEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({ success: false, message: "Equipment not found" });
    }

    if (equipment.status !== "Rented") {
      return res.status(400).json({
        success: false,
        message: "Equipment is not currently rented",
      });
    }

    equipment.status = "Available";
    equipment.currentPatientId = null;
    equipment.rentalStartDate = null;

    await equipment.save();

    res.json({ success: true, message: "Equipment returned successfully", data: equipment });
  } catch (error) {
    console.error("Return Equipment Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  getEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  assignEquipment,
  returnEquipment,
};
