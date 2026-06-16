import express from "express";
const router = express.Router();
import {
  getInventory,
  getInventoryById,
  createInventory,
  updateInventory,
  deleteInventory,
} from "../controllers/inventoryController.js";
import { protect, authorize } from "../middleware/auth.js";

router
  .route("/")
  .get(protect, getInventory)
  .post(protect, authorize("Admin", "Manager", "Nurse/Staff"), createInventory);

router
  .route("/:id")
  .get(protect, getInventoryById)
  .put(protect, authorize("Admin", "Manager", "Nurse/Staff"), updateInventory)
  .delete(protect, authorize("Admin", "Manager"), deleteInventory);

export default router;
