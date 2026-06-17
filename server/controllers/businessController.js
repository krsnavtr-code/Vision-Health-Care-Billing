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
    } else {
      // Clean up any extra duplicate documents if they exist
      await BusinessDetails.deleteMany({ _id: { $ne: details._id } });
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
    console.log("Received body:", req.body);
    console.log(
      "Signature image in body:",
      req.body.signatureImage ? "Present" : "Missing",
    );
    console.log("QR code in body:", req.body.qrCode ? "Present" : "Missing");
    console.log("Signature image length:", req.body.signatureImage?.length);
    console.log("QR code length:", req.body.qrCode?.length);

    let details = await BusinessDetails.findOne();
    if (!details) {
      details = await BusinessDetails.create(req.body);
    } else {
      details = await BusinessDetails.findByIdAndUpdate(details._id, req.body, {
        new: true,
        runValidators: true,
      });
    }

    // Clean up any extra duplicate documents if they exist
    await BusinessDetails.deleteMany({ _id: { $ne: details._id } });

    console.log(
      "Saved details signatureImage:",
      details.signatureImage ? "Present" : "Missing",
    );
    console.log(
      "Saved details qrCode:",
      details.qrCode ? "Present" : "Missing",
    );

    res.json({
      success: true,
      message: "Business details updated successfully",
      data: details,
    });
  } catch (error) {
    console.error("Update Business Details Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export { getBusinessDetails, updateBusinessDetails };
