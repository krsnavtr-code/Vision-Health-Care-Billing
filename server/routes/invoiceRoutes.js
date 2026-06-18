import express from "express";
const router = express.Router();
import {
  generateInvoice,
  getInvoices,
  getInvoiceById,
  downloadInvoicePDF,
  getInvoicesByUser,
} from "../controllers/invoiceController.js";
import { protect, authorize } from "../middleware/auth.js";

router.post(
  "/generate",
  protect,
  authorize("Admin", "Manager", "Nurse/Staff"),
  generateInvoice,
);
router.get("/", protect, getInvoices);
router.get("/:id", protect, getInvoiceById);
router.get("/:id/pdf", protect, downloadInvoicePDF);
router.get(
  "/admin/overview",
  protect,
  authorize("Admin", "Manager"),
  getInvoicesByUser,
);

export default router;
