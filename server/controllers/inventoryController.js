import Inventory from "../models/Inventory.js";

// @desc    Get all inventory items (with optional search filter)
// @route   GET /api/inventory
// @access  Private (All authenticated users can list)
const getInventory = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { itemName: { $regex: search, $options: "i" } },
          { hsnCode: { $regex: search, $options: "i" } },
        ],
      };
    }

    const inventory = await Inventory.find(query).sort({ itemName: 1 });
    res.json({ success: true, count: inventory.length, data: inventory });
  } catch (error) {
    console.error("Get Inventory Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single inventory item
// @route   GET /api/inventory/:id
// @access  Private
const getInventoryById = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Inventory item not found" });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    console.error("Get Inventory Item Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new inventory item
// @route   POST /api/inventory
// @access  Private (Admin, Manager, Nurse/Staff)
const createInventory = async (req, res) => {
  try {
    const {
      itemName,
      hsnCode,
      unit,
      basePrice,
      gstRate,
      stockQuantity,
      batchNumber,
      expiryDate,
    } = req.body;

    // Check if item name already exists
    const itemExists = await Inventory.findOne({ itemName: itemName.trim() });
    if (itemExists) {
      return res
        .status(400)
        .json({
          success: false,
          message: "An item with this name already exists",
        });
    }

    const item = await Inventory.create({
      itemName,
      hsnCode,
      unit,
      basePrice,
      gstRate,
      stockQuantity,
      batchNumber,
      expiryDate,
    });

    res.status(201).json({ success: true, data: item });
  } catch (error) {
    console.error("Create Inventory Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
// @access  Private (Admin, Manager, Nurse/Staff)
const updateInventory = async (req, res) => {
  try {
    const {
      itemName,
      hsnCode,
      unit,
      basePrice,
      gstRate,
      stockQuantity,
      batchNumber,
      expiryDate,
    } = req.body;

    let item = await Inventory.findById(req.params.id);
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Inventory item not found" });
    }

    // Check name uniqueness if item name is being updated
    if (itemName && itemName.trim() !== item.itemName) {
      const itemExists = await Inventory.findOne({ itemName: itemName.trim() });
      if (itemExists) {
        return res
          .status(400)
          .json({
            success: false,
            message: "An item with this name already exists",
          });
      }
    }

    // Update item
    item.itemName = itemName || item.itemName;
    item.hsnCode = hsnCode !== undefined ? hsnCode : item.hsnCode;
    item.unit = unit || item.unit;
    item.basePrice = basePrice !== undefined ? basePrice : item.basePrice;
    item.gstRate = gstRate !== undefined ? gstRate : item.gstRate;
    item.stockQuantity =
      stockQuantity !== undefined ? stockQuantity : item.stockQuantity;
    item.batchNumber =
      batchNumber !== undefined ? batchNumber : item.batchNumber;
    item.expiryDate = expiryDate !== undefined ? expiryDate : item.expiryDate;

    await item.save();

    res.json({ success: true, data: item });
  } catch (error) {
    console.error("Update Inventory Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
// @access  Private (Admin, Manager)
const deleteInventory = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Inventory item not found" });
    }

    await item.deleteOne();
    res.json({ success: true, message: "Inventory item removed" });
  } catch (error) {
    console.error("Delete Inventory Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  getInventory,
  getInventoryById,
  createInventory,
  updateInventory,
  deleteInventory,
};
