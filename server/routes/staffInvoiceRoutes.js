import express from "express";
const router = express.Router();
import {
  generateStaffInvoice,
  getStaffInvoices,
  getStaffInvoiceById,
  downloadStaffInvoicePDF,
  updateStaffInvoicePayment,
} from "../controllers/staffInvoiceController.js";
import { protect, authorize } from "../middleware/auth.js";

router.post("/", protect, authorize("Admin", "Manager"), generateStaffInvoice);
router.get("/", protect, authorize("Admin", "Manager"), getStaffInvoices);
router.get("/:id", protect, authorize("Admin", "Manager"), getStaffInvoiceById);
router.get("/:id/pdf", protect, authorize("Admin", "Manager"), downloadStaffInvoicePDF);
router.put("/:id/payment", protect, authorize("Admin", "Manager"), updateStaffInvoicePayment);

export default router;
