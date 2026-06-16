import express from "express";
const router = express.Router();
import { getBusinessDetails, updateBusinessDetails } from "../controllers/businessController.js";
import { protect, authorize } from "../middleware/auth.js";

router
  .route("/")
  .get(protect, getBusinessDetails)
  .put(protect, authorize("Admin"), updateBusinessDetails);

export default router;
