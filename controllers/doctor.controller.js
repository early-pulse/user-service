import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { doctorService } from "../services/doctor.service.js";
import { logger } from "../utils/logger.js";
import jwt from "jsonwebtoken";

const registerDoctor = asyncHandler(async (req, res) => {
  const { name, email, phoneNumber, address, specialization, password } = req.body;

  // Validate required fields
  if ([name, email, phoneNumber, address, specialization, password].some((field) => field?.trim() === "")) {
    logger.logApi('/doctor/register', req.method, 400);
    throw new ApiError(400, "All fields are required");
  }

  const doctor = await doctorService.register({
    name,
    email,
    phoneNumber,
    address,
    specialization,
    password,
  });

  logger.logApi('/doctor/register', req.method, 201);
  return res
    .status(201)
    .json(new ApiResponse(201, doctor, "Doctor registered successfully"));
});

const loginDoctor = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    logger.logApi('/doctor/login', req.method, 400);
    throw new ApiError(400, "Email and password are required");
  }

  const { doctor, accessToken, refreshToken } = await doctorService.login(email, password);

  const options = {
    httpOnly: true,
    secure: true,
  };

  logger.logApi('/doctor/login', req.method, 200);
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          doctor,
          accessToken,
          refreshToken,
        },
        "Doctor logged in successfully"
      )
    );
});

const logoutDoctor = asyncHandler(async (req, res) => {
  await doctorService.logout(req.user._id);

  const options = {
    httpOnly: true,
    secure: true,
  };

  logger.logApi('/doctor/logout', req.method, 200);
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Doctor logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    logger.logApi('/doctor/refresh-token', req.method, 401);
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const doctor = await doctorService.verifyToken(decodedToken?._id);

    if (incomingRefreshToken !== doctor?.refreshToken) {
      logger.logApi('/doctor/refresh-token', req.method, 401);
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const { accessToken, refreshToken } = await doctorService.refreshToken(doctor._id);

    const options = {
      httpOnly: true,
      secure: true,
    };

    logger.logApi('/doctor/refresh-token', req.method, 200);
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    logger.logApi('/doctor/refresh-token', req.method, 401);
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const getCurrentDoctor = asyncHandler(async (req, res) => {
  const doctor = await doctorService.getCurrentDoctor(req.user._id);

  logger.logApi('/doctor/current-doctor', req.method, 200);
  return res
    .status(200)
    .json(new ApiResponse(200, doctor, "Current doctor fetched successfully"));
});

const updateDoctorDetails = asyncHandler(async (req, res) => {
  const { name, phoneNumber, address, specialization } = req.body;

  const doctor = await doctorService.updateDoctor(req.user._id, {
    name,
    phoneNumber,
    address,
    specialization,
  });

  logger.logApi('/doctor/update', req.method, 200);
  return res
    .status(200)
    .json(new ApiResponse(200, doctor, "Doctor details updated successfully"));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    logger.logApi('/doctor/change-password', req.method, 400);
    throw new ApiError(400, "Old password and new password are required");
  }

  const result = await doctorService.changePassword(req.user._id, oldPassword, newPassword);

  logger.logApi('/doctor/change-password', req.method, 200);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Password changed successfully"));
});

const deleteDoctor = asyncHandler(async (req, res) => {
  const result = await doctorService.deleteDoctor(req.user._id);

  const options = {
    httpOnly: true,
    secure: true,
  };

  logger.logApi('/doctor/delete', req.method, 200);
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, result, "Doctor account deleted successfully"));
});

// Public endpoints
const getAllDoctors = asyncHandler(async (req, res) => {
  const doctors = await doctorService.getAllDoctors();

  logger.logApi('/doctor/all', req.method, 200);
  return res
    .status(200)
    .json(new ApiResponse(200, doctors, "All doctors fetched successfully"));
});

const getDoctorsBySpecialization = asyncHandler(async (req, res) => {
  const { specialization } = req.params;

  if (!specialization) {
    logger.logApi('/doctor/specialization', req.method, 400);
    throw new ApiError(400, "Specialization is required");
  }

  const doctors = await doctorService.getDoctorsBySpecialization(specialization);

  logger.logApi('/doctor/specialization', req.method, 200);
  return res
    .status(200)
    .json(new ApiResponse(200, doctors, "Doctors by specialization fetched successfully"));
});

// Token verification endpoint for other services
const verifyToken = asyncHandler(async (req, res) => {
  const doctor = await doctorService.verifyToken(req.user._id);
  
  logger.logApi('/doctor/verify-token', req.method, 200);
  return res
    .status(200)
    .json(new ApiResponse(200, doctor, "Token verified successfully"));
});

export {
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
}; 