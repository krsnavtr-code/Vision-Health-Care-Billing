import express from "express";
const router = express.Router();
import {
  clockIn,
  clockOut,
  getStaffShifts,
  appendConsumable,
  getPatientLedger,
} from "../controllers/shiftController.js";
import { protect, authorize } from "../middleware/auth.js";

router.post("/clock-in", protect, clockIn);
router.post("/clock-out", protect, clockOut);
router.get("/my-shifts", protect, getStaffShifts);
router.post("/patient/:patientId/log-consumable", protect, authorize("Admin", "Manager", "Nurse/Staff"), appendConsumable);
router.get("/patient/:patientId/ledger", protect, getPatientLedger);

export default router;
