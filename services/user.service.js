import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { logger } from "../utils/logger.js";
import { getCoordinatesFromAddress } from '../utils/asyncHandler.js';

class UserService {
  async register(userData) {
    const { name, email, phoneNumber, address, emergencyContactNumber, password } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(409, "User with this email already exists");
    }

    // Create new user
    let coordinates = [0, 0];
    try {
      coordinates = await getCoordinatesFromAddress(address);
    } catch (e) {
      logger.error('Geocoding failed for user registration:', e.message);
    }
    const user = await User.create({
      name,
      email,
      phoneNumber,
      address,
      emergencyContactNumber,
      password,
      coordinates: { type: 'Point', coordinates },
    });

    // Return user without password
    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    
    if (!createdUser) {
      throw new ApiError(500, "Something went wrong while registering the user");
    }

    return createdUser;
  }

  async login(email, password) {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(404, "User does not exist");
    }

    // Verify password
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid credentials");
    }

    // Generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Return user data and tokens
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
    
    return {
      user: loggedInUser,
      accessToken,
      refreshToken,
    };
  }

  async logout(userId) {
    await User.findByIdAndUpdate(
      userId,
      {
        $unset: { refreshToken: 1 },
      },
      { new: true }
    );
  }

  async refreshToken(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  }

  async getCurrentUser(userId) {
    const user = await User.findById(userId).select("-password -refreshToken");
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    return user;
  }

  async updateUser(userId, updateData) {
    const allowedUpdates = ["name", "phoneNumber", "address", "emergencyContactNumber"];
    const updates = {};

    // Only allow specific fields to be updated
    Object.keys(updateData).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = updateData[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true }
    ).select("-password -refreshToken");

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return user;
  }

  async changePassword(userId, oldPassword, newPassword) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordValid) {
      throw new ApiError(400, "Invalid old password");
    }

    user.password = newPassword;
    await user.save();

    return { message: "Password changed successfully" };
  }

  async deleteUser(userId) {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    return { message: "User deleted successfully" };
  }

  async verifyToken(userId) {
    const user = await User.findById(userId).select("-password -refreshToken");
    if (!user) {
      throw new ApiError(401, "Invalid token");
    }
    return user;
  }
}

export const userService = new UserService(); 