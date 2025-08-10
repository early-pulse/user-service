import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Middleware to verify if user is medicalOwner
export const verifyMedicalOwner = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, "User not authenticated");
  }

  if (req.user.role !== "medicalOwner") {
    throw new ApiError(403, "Access denied. Only medical owners can perform this action");
  }

  next();
});

// Middleware to verify if user is admin
export const verifyAdmin = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, "User not authenticated");
  }

  if (req.user.role !== "admin") {
    throw new ApiError(403, "Access denied. Only admins can perform this action");
  }

  next();
});

// Middleware to verify if user is doctor
export const verifyDoctor = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, "User not authenticated");
  }

  if (req.user.role !== "doctor") {
    throw new ApiError(403, "Access denied. Only doctors can perform this action");
  }

  next();
});

// Middleware to verify if user is lab
export const verifyLab = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, "User not authenticated");
  }

  if (req.user.role !== "lab") {
    throw new ApiError(403, "Access denied. Only labs can perform this action");
  }

  next();
});

// Middleware to verify if user has any of the specified roles
export const verifyRoles = (...roles) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, "User not authenticated");
    }

    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, `Access denied. Required roles: ${roles.join(", ")}`);
    }

    next();
  });
}; 