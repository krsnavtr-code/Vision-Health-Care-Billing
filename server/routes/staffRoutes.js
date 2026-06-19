import express from "express";
const router = express.Router();
import {
  createStaff,
  getStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
} from "../controllers/staffController.js";
import { protect, authorize } from "../middleware/auth.js";

router.post("/", protect, authorize("Admin", "Manager"), createStaff);
router.get("/", protect, authorize("Admin", "Manager"), getStaff);
router.get("/:id", protect, authorize("Admin", "Manager"), getStaffById);
router.put("/:id", protect, authorize("Admin", "Manager"), updateStaff);
router.delete("/:id", protect, authorize("Admin"), deleteStaff);

export default router;
