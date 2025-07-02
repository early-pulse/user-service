import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  updateUserDetails,
  changeCurrentPassword,
  deleteUser,
  verifyToken,
} from "../controllers/user.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken);

// Protected routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update").patch(verifyJWT, updateUserDetails);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/delete").delete(verifyJWT, deleteUser);

// Token verification endpoint for other services
router.route("/verify-token").get(verifyJWT, verifyToken);

export default router;
