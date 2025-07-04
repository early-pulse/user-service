import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { labService } from "../services/lab.service.js";
import { logger } from "../utils/logger.js";
import jwt from "jsonwebtoken";

const registerLab = asyncHandler(async (req, res) => {
  const { name, email, phoneNumber, address, testsOffered, password, role } = req.body;

  // Validate required fields
  if ([name, email, phoneNumber, address, password, role].some((field) => field?.trim() === "")) {
    logger.logApi("/lab/register", req.method, 400);
    throw new ApiError(400, "Name, email, phone number, address, password, and role are required");
  }

  if (!testsOffered || !Array.isArray(testsOffered) || testsOffered.length === 0) {
    logger.logApi("/lab/register", req.method, 400);
    throw new ApiError(400, "At least one test must be offered");
  }

  const lab = await labService.register({
    name,
    email,
    phoneNumber,
    address,
    testsOffered,
    password,
    role,
  });

  logger.logApi("/lab/register", req.method, 201);
  return res
    .status(201)
    .json(new ApiResponse(201, lab, "Lab registered successfully"));
});

const loginLab = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    logger.logApi("/lab/login", req.method, 400);
    throw new ApiError(400, "Email and password are required");
  }

  const { lab, accessToken, refreshToken } = await labService.login(
    email,
    password
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  logger.logApi("/lab/login", req.method, 200);
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          lab,
          accessToken,
          refreshToken,
        },
        "Lab logged in successfully"
      )
    );
});

const logoutLab = asyncHandler(async (req, res) => {
  await labService.logout(req.user._id);

  const options = {
    httpOnly: true,
    secure: true,
  };

  logger.logApi("/lab/logout", req.method, 200);
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Lab logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    logger.logApi("/lab/refresh-token", req.method, 401);
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const lab = await labService.verifyToken(decodedToken?._id);

    if (incomingRefreshToken !== lab?.refreshToken) {
      logger.logApi("/lab/refresh-token", req.method, 401);
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const { accessToken, refreshToken } = await labService.refreshToken(
      lab._id
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    logger.logApi("/lab/refresh-token", req.method, 200);
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
    logger.logApi("/lab/refresh-token", req.method, 401);
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const getCurrentLab = asyncHandler(async (req, res) => {
  const lab = await labService.getCurrentLab(req.user._id);

  logger.logApi("/lab/current-lab", req.method, 200);
  return res
    .status(200)
    .json(new ApiResponse(200, lab, "Current lab fetched successfully"));
});

const updateLabDetails = asyncHandler(async (req, res) => {
  const { name, phoneNumber, address, testsOffered } = req.body;

  const lab = await labService.updateLab(req.user._id, {
    name,
    phoneNumber,
    address,
    testsOffered,
  });

  logger.logApi("/lab/update", req.method, 200);
  return res
    .status(200)
    .json(new ApiResponse(200, lab, "Lab details updated successfully"));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    logger.logApi("/lab/change-password", req.method, 400);
    throw new ApiError(400, "Old password and new password are required");
  }

  const result = await labService.changePassword(
    req.user._id,
    oldPassword,
    newPassword
  );

  logger.logApi("/lab/change-password", req.method, 200);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Password changed successfully"));
});

const deleteLab = asyncHandler(async (req, res) => {
  const result = await labService.deleteLab(req.user._id);

  const options = {
    httpOnly: true,
    secure: true,
  };

  logger.logApi("/lab/delete", req.method, 200);
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, result, "Lab account deleted successfully"));
});

// Test management endpoints
const addTest = asyncHandler(async (req, res) => {
  const { testName } = req.body;

  if (!testName || testName.trim() === "") {
    logger.logApi("/lab/add-test", req.method, 400);
    throw new ApiError(400, "Test name is required");
  }

  const lab = await labService.addTest(req.user._id, testName.trim());

  logger.logApi("/lab/add-test", req.method, 200);
  return res
    .status(200)
    .json(new ApiResponse(200, lab, "Test added successfully"));
});

const removeTest = asyncHandler(async (req, res) => {
  const { testName } = req.body;

  if (!testName || testName.trim() === "") {
    logger.logApi("/lab/remove-test", req.method, 400);
    throw new ApiError(400, "Test name is required");
  }

  const lab = await labService.removeTest(req.user._id, testName.trim());

  logger.logApi("/lab/remove-test", req.method, 200);
  return res
    .status(200)
    .json(new ApiResponse(200, lab, "Test removed successfully"));
});

// Public endpoints
const getAllLabs = asyncHandler(async (req, res) => {
  const labs = await labService.getAllLabs();

  logger.logApi("/lab/all", req.method, 200);
  return res
    .status(200)
    .json(new ApiResponse(200, labs, "All labs fetched successfully"));
});

const getLabsByTest = asyncHandler(async (req, res) => {
  const { testName } = req.params;

  if (!testName) {
    logger.logApi("/lab/test", req.method, 400);
    throw new ApiError(400, "Test name is required");
  }

  const labs = await labService.getLabsByTest(testName);

  logger.logApi("/lab/test", req.method, 200);
  return res
    .status(200)
    .json(new ApiResponse(200, labs, "Labs by test fetched successfully"));
});

// Token verification endpoint for other services
const verifyToken = asyncHandler(async (req, res) => {
  const lab = await labService.verifyToken(req.user._id);

  logger.logApi("/lab/verify-token", req.method, 200);
  return res
    .status(200)
    .json(new ApiResponse(200, lab, "Token verified successfully"));
});

// --- BloodBank features merged below ---

const updateBloodInventory = asyncHandler(async (req, res) => {
  const { bloodType, quantity } = req.body;
  if (!bloodType || quantity === undefined || quantity < 0) {
    logger.logApi("/labs/update-inventory", req.method, 400);
    throw new ApiError(400, "Blood type and valid quantity are required");
  }
  const lab = await labService.updateBloodInventory(
    req.user._id,
    bloodType,
    quantity
  );
  logger.logApi("/labs/update-inventory", req.method, 200);
  return res
    .status(200)
    .json(new ApiResponse(200, lab, "Blood inventory updated successfully"));
});

const getLabsByBloodType = asyncHandler(async (req, res) => {
  const { bloodType } = req.params;
  if (!bloodType) {
    logger.logApi("/labs/blood-type", req.method, 400);
    throw new ApiError(400, "Blood type is required");
  }
  const labs = await labService.getLabsByBloodType(bloodType);
  logger.logApi("/labs/blood-type", req.method, 200);
  return res
    .status(200)
    .json(
      new ApiResponse(200, labs, "Labs by blood type fetched successfully")
    );
});

const searchLabsByLocation = asyncHandler(async (req, res) => {
  const { location } = req.query;
  if (!location) {
    logger.logApi("/labs/search", req.method, 400);
    throw new ApiError(400, "Location is required");
  }
  const labs = await labService.searchLabsByLocation(location);
  logger.logApi("/labs/search", req.method, 200);
  return res
    .status(200)
    .json(new ApiResponse(200, labs, "Labs search completed successfully"));
});

// export * from './lab.controller.js'; // keep all previous exports
export {
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
};
