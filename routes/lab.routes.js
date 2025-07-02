import { Router } from "express";
import {
  registerLab,
  loginLab,
  logoutLab,
  refreshAccessToken,
  getCurrentLab,
  updateLabDetails,
  changeCurrentPassword,
  deleteLab,
  addTest,
  removeTest,
  getAllLabs,
  getLabsByTest,
  verifyToken,
  updateBloodInventory,
  getLabsByBloodType,
  searchLabsByLocation,
} from "../controllers/lab.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes
router.route("/register").post(registerLab);
router.route("/login").post(loginLab);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/all").get(getAllLabs);
router.route("/test/:testName").get(getLabsByTest);
router.route("/blood-type/:bloodType").get(getLabsByBloodType);
router.route("/search").get(searchLabsByLocation);

// Protected routes
router.route("/logout").post(verifyJWT, logoutLab);
router.route("/current-lab").get(verifyJWT, getCurrentLab);
router.route("/update").patch(verifyJWT, updateLabDetails);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/delete").delete(verifyJWT, deleteLab);

// Test management routes
router.route("/add-test").post(verifyJWT, addTest);
router.route("/remove-test").delete(verifyJWT, removeTest);

// Blood inventory management routes
router.route("/update-inventory").patch(verifyJWT, updateBloodInventory);

// Token verification endpoint for other services
router.route("/verify-token").get(verifyJWT, verifyToken);

export default router; 