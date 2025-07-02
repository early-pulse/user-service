import { Router } from "express";
import {
  registerDoctor,
  loginDoctor,
  logoutDoctor,
  refreshAccessToken,
  getCurrentDoctor,
  updateDoctorDetails,
  changeCurrentPassword,
  deleteDoctor,
  getAllDoctors,
  getDoctorsBySpecialization,
  verifyToken,
} from "../controllers/doctor.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes
router.route("/register").post(registerDoctor);
router.route("/login").post(loginDoctor);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/all").get(getAllDoctors);
router.route("/specialization/:specialization").get(getDoctorsBySpecialization);

// Protected routes
router.route("/logout").post(verifyJWT, logoutDoctor);
router.route("/current-doctor").get(verifyJWT, getCurrentDoctor);
router.route("/update").patch(verifyJWT, updateDoctorDetails);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/delete").delete(verifyJWT, deleteDoctor);

// Token verification endpoint for other services
router.route("/verify-token").get(verifyJWT, verifyToken);

export default router; 