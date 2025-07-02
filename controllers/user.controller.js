import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { userService } from "../services/user.service.js";
import { logger } from "../utils/logger.js";
import jwt from "jsonwebtoken";

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, phoneNumber, address, emergencyContactNumber, password } = req.body;

  // Validate required fields
  if ([name, email, phoneNumber, address, emergencyContactNumber, password].some((field) => field?.trim() === "")) {
    logger.logApi('/user/register', req.method, 400);
    throw new ApiError(400, "All fields are required");
  }

  const user = await userService.register({
    name,
    email,
    phoneNumber,
    address,
    emergencyContactNumber,
    password,
  });

  logger.logApi('/user/register', req.method, 201);
  return res
    .status(201)
    .json(new ApiResponse(201, user, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    logger.logApi('/user/login', req.method, 400);
    throw new ApiError(400, "Email and password are required");
  }

  const { user, accessToken, refreshToken } = await userService.login(email, password);

  const options = {
    httpOnly: true,
    secure: true,
  };

  logger.logApi('/user/login', req.method, 200);
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await userService.logout(req.user._id);

  const options = {
    httpOnly: true,
    secure: true,
  };

  logger.logApi('/user/logout', req.method, 200);
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    logger.logApi('/user/refresh-token', req.method, 401);
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await userService.verifyToken(decodedToken?._id);

    if (incomingRefreshToken !== user?.refreshToken) {
      logger.logApi('/user/refresh-token', req.method, 401);
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const { accessToken, refreshToken } = await userService.refreshToken(user._id);

    const options = {
      httpOnly: true,
      secure: true,
    };

    logger.logApi('/user/refresh-token', req.method, 200);
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
    logger.logApi('/user/refresh-token', req.method, 401);
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await userService.getCurrentUser(req.user._id);

  logger.logApi('/user/current-user', req.method, 200);
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Current user fetched successfully"));
});

const updateUserDetails = asyncHandler(async (req, res) => {
  const { name, phoneNumber, address, emergencyContactNumber } = req.body;

  const user = await userService.updateUser(req.user._id, {
    name,
    phoneNumber,
    address,
    emergencyContactNumber,
  });

  logger.logApi('/user/update', req.method, 200);
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User details updated successfully"));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    logger.logApi('/user/change-password', req.method, 400);
    throw new ApiError(400, "Old password and new password are required");
  }

  const result = await userService.changePassword(req.user._id, oldPassword, newPassword);

  logger.logApi('/user/change-password', req.method, 200);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Password changed successfully"));
});

const deleteUser = asyncHandler(async (req, res) => {
  const result = await userService.deleteUser(req.user._id);

  const options = {
    httpOnly: true,
    secure: true,
  };

  logger.logApi('/user/delete', req.method, 200);
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, result, "User account deleted successfully"));
});

// Token verification endpoint for other services
const verifyToken = asyncHandler(async (req, res) => {
  const user = await userService.verifyToken(req.user._id);
  
  logger.logApi('/user/verify-token', req.method, 200);
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Token verified successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  updateUserDetails,
  changeCurrentPassword,
  deleteUser,
  verifyToken,
};
