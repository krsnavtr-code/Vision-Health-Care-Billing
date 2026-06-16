import express from "express";
const router = express.Router();
import {
  getEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  assignEquipment,
  returnEquipment,
} from "../controllers/equipmentController.js";
import { protect, authorize } from "../middleware/auth.js";

router
  .route("/")
  .get(protect, getEquipment)
  .post(protect, authorize("Admin", "Manager", "Nurse/Staff"), createEquipment);

router
  .route("/:id")
  .get(protect, getEquipmentById)
  .put(protect, authorize("Admin", "Manager", "Nurse/Staff"), updateEquipment)
  .delete(protect, authorize("Admin", "Manager"), deleteEquipment);

router.post("/:id/assign", protect, authorize("Admin", "Manager", "Nurse/Staff"), assignEquipment);
router.post("/:id/return", protect, authorize("Admin", "Manager", "Nurse/Staff"), returnEquipment);

export default router;
