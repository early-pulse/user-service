import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { Doctor } from "../models/doctor.model.js";
import { Lab } from "../models/lab.model.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    // console.log(token);
    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    let entity;

    // Find the entity based on the entityType in the token
    switch (decodedToken.entityType) {
      case "User":
        entity = await User.findById(decodedToken?._id).select("-password -refreshToken");
        break;
      case "Doctor":
        entity = await Doctor.findById(decodedToken?._id).select("-password -refreshToken");
        break;
      case "Lab":
        entity = await Lab.findById(decodedToken?._id).select("-password -refreshToken");
        break;
      default:
        throw new ApiError(401, "Invalid entity type in token");
    }

    if (!entity) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = entity;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});
