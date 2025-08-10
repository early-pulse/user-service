import { Router } from "express";
import {
  createMedicine,
  getAllMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine,
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
  getMedicineStats,
} from "../controllers/medicine.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyMedicalOwner } from "../middlewares/role.middleware.js";
import { uploadMedicineImage, handleUploadError } from "../middlewares/upload.middleware.js";

const router = Router();

// Public routes (no authentication required)
router.route("/all").get(getAllMedicines);

// Protected routes (authentication required)
router.use(verifyJWT);

// User routes (all authenticated users)
router.route("/order").post(createOrder);
router.route("/orders").get(getUserOrders);
router.route("/order/:orderId").get(getOrderById);

// MedicalOwner only routes
router.route("/create").post(verifyMedicalOwner, uploadMedicineImage, handleUploadError, createMedicine);
router.route("/orders/all").get(verifyMedicalOwner, getAllOrders);
router.route("/stats").get(verifyMedicalOwner, getMedicineStats);
router.route("/order/:orderId/status").patch(verifyMedicalOwner, updateOrderStatus);

// Medicine CRUD routes (must be after specific routes to avoid conflicts)
router.route("/:medicineId").get(getMedicineById);
router.route("/:medicineId").patch(verifyMedicalOwner, uploadMedicineImage, handleUploadError, updateMedicine);
router.route("/:medicineId").delete(verifyMedicalOwner, deleteMedicine);

export default router; 