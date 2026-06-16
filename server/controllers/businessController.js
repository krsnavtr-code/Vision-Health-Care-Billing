import BusinessDetails from "../models/BusinessDetails.js";

// @desc    Get business/company details
// @route   GET /api/business-details
// @access  Private
const getBusinessDetails = async (req, res) => {
  try {
    let details = await BusinessDetails.findOne();
    
    // If no details document exists yet, create one with default values
    if (!details) {
      details = await BusinessDetails.create({});
    }
    
    res.json({ success: true, data: details });
  } catch (error) {
    console.error("Get Business Details Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update business/company details
// @route   PUT /api/business-details
// @access  Private (Admin only)
const updateBusinessDetails = async (req, res) => {
  try {
    // Find the single document or create it (upsert)
    const details = await BusinessDetails.findOneAndUpdate(
      {},
      req.body,
      { new: true, upsert: true, runValidators: true }
    );
    
    res.json({ success: true, message: "Business details updated successfully", data: details });
  } catch (error) {
    console.error("Update Business Details Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export { getBusinessDetails, updateBusinessDetails };
