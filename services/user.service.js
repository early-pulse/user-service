import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { logger } from "../utils/logger.js";
import { getCoordinatesFromAddress } from '../utils/asyncHandler.js';

class UserService {
  async register(userData) {
    const { name, email, phoneNumber, address, emergencyContactNumber, password, role } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(409, "An account with this email address already exists. Please use a different email or try logging in.");
    }

    // Create new user
    let coordinates = [0, 0];
    try {
      coordinates = await getCoordinatesFromAddress(address);
    } catch (e) {
      logger.error('Geocoding failed for user registration:', e.message);
    }
    
    try {
      const user = await User.create({
        name,
        email,
        phoneNumber,
        address,
        emergencyContactNumber,
        password,
        role,
        coordinates: { type: 'Point', coordinates },
      });

      // Return user without password
      const createdUser = await User.findById(user._id).select("-password -refreshToken");
      
      if (!createdUser) {
        throw new ApiError(500, "Failed to create user account. Please try again.");
      }

      return createdUser;
    } catch (error) {
      if (error.code === 11000) {
        throw new ApiError(409, "An account with this email address already exists. Please use a different email or try logging in.");
      }
      throw new ApiError(500, "Failed to create user account. Please try again.");
    }
  }

  async login(email, password) {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(401, "No account found with this email address. Please check your email or create a new account.");
    }

    // Verify password
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      throw new ApiError(401, "Incorrect password. Please check your password and try again.");
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