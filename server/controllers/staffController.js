import Staff from "../models/Staff.js";

// @desc    Create new staff member
// @route   POST /api/staff
// @access  Private (Admin, Manager)
const createStaff = async (req, res) => {
  try {
    const {
      name,
      email,
      phoneNumber,
      department,
      designation,
      employmentType,
      address,
      emergencyContact,
      upiId,
      status,
    } = req.body;

    // Check if email already exists
    const existingStaff = await Staff.findOne({ email });
    if (existingStaff) {
      return res.status(400).json({
        success: false,
        message: "Staff with this email already exists",
      });
    }

    const staff = await Staff.create({
      name,
      email,
      phoneNumber,
      department,
      designation,
      employmentType,
      address,
      emergencyContact,
      upiId,
      status,
    });

    res.status(201).json({
      success: true,
      message: "Staff member created successfully",
      data: staff,
    });
  } catch (error) {
    console.error("Create Staff Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all staff members
// @route   GET /api/staff
// @access  Private (Admin, Manager)
const getStaff = async (req, res) => {
  try {
    const { department, status, search } = req.query;
    let query = {};

    if (department) {
      query.department = department;
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const staff = await Staff.find(query)
      .select("-__v")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: staff.length, data: staff });
  } catch (error) {
    console.error("Get Staff Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single staff member
// @route   GET /api/staff/:id
// @access  Private (Admin, Manager)
const getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      return res
        .status(404)
        .json({ success: false, message: "Staff member not found" });
    }

    res.json({ success: true, data: staff });
  } catch (error) {
    console.error("Get Staff By ID Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update staff member
// @route   PUT /api/staff/:id
// @access  Private (Admin, Manager)
const updateStaff = async (req, res) => {
  try {
    const {
      name,
      email,
      phoneNumber,
      department,
      designation,
      employmentType,
      address,
      emergencyContact,
      upiId,
      status,
    } = req.body;

    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      return res
        .status(404)
        .json({ success: false, message: "Staff member not found" });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== staff.email) {
      const existingStaff = await Staff.findOne({ email });
      if (existingStaff) {
        return res.status(400).json({
          success: false,
          message: "Staff with this email already exists",
        });
      }
    }

    staff.name = name || staff.name;
    staff.email = email || staff.email;
    staff.phoneNumber = phoneNumber || staff.phoneNumber;
    staff.department = department || staff.department;
    staff.designation = designation || staff.designation;
    staff.employmentType = employmentType || staff.employmentType;
    staff.address = address || staff.address;
    staff.emergencyContact = emergencyContact || staff.emergencyContact;
    staff.upiId = upiId || staff.upiId;
    staff.status = status || staff.status;

    await staff.save();

    res.json({
      success: true,
      message: "Staff member updated successfully",
      data: staff,
    });
  } catch (error) {
    console.error("Update Staff Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete staff member
// @route   DELETE /api/staff/:id
// @access  Private (Admin)
const deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      return res
        .status(404)
        .json({ success: false, message: "Staff member not found" });
    }

    await staff.deleteOne();

    res.json({
      success: true,
      message: "Staff member deleted successfully",
    });
  } catch (error) {
    console.error("Delete Staff Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export { createStaff, getStaff, getStaffById, updateStaff, deleteStaff };
