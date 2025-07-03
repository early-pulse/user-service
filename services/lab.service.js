import { Lab } from "../models/lab.model.js";
import { ApiError } from "../utils/ApiError.js";
import { logger } from "../utils/logger.js";
import { getCoordinatesFromAddress } from '../utils/asyncHandler.js';

class LabService {
  async register(labData) {
    const { name, email, phoneNumber, address, testsOffered, password } = labData;

    // Check if lab already exists
    const existingLab = await Lab.findOne({ email });
    if (existingLab) {
      throw new ApiError(409, "Lab with this email already exists");
    }

    // Create new lab
    let coordinates = [0, 0];
    try {
      coordinates = await getCoordinatesFromAddress(address);
    } catch (e) {
      logger.error('Geocoding failed for lab registration:', e.message);
    }
    const lab = await Lab.create({
      name,
      email,
      phoneNumber,
      address,
      testsOffered,
      password,
      coordinates: { type: 'Point', coordinates },
    });

    // Return lab without password
    const createdLab = await Lab.findById(lab._id).select("-password -refreshToken");
    
    if (!createdLab) {
      throw new ApiError(500, "Something went wrong while registering the lab");
    }

    return createdLab;
  }

  async login(email, password) {
    // Find lab by email
    const lab = await Lab.findOne({ email });
    if (!lab) {
      throw new ApiError(404, "Lab does not exist");
    }

    // Verify password
    const isPasswordValid = await lab.isPasswordCorrect(password);
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid credentials");
    }

    // Generate tokens
    const accessToken = lab.generateAccessToken();
    const refreshToken = lab.generateRefreshToken();

    // Save refresh token
    lab.refreshToken = refreshToken;
    await lab.save({ validateBeforeSave: false });

    // Return lab data and tokens
    const loggedInLab = await Lab.findById(lab._id).select("-password -refreshToken");
    
    return {
      lab: loggedInLab,
      accessToken,
      refreshToken,
    };
  }

  async logout(labId) {
    await Lab.findByIdAndUpdate(
      labId,
      {
        $unset: { refreshToken: 1 },
      },
      { new: true }
    );
  }

  async refreshToken(labId) {
    const lab = await Lab.findById(labId);
    if (!lab) {
      throw new ApiError(401, "Invalid refresh token");
    }

    const accessToken = lab.generateAccessToken();
    const refreshToken = lab.generateRefreshToken();

    lab.refreshToken = refreshToken;
    await lab.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  }

  async getCurrentLab(labId) {
    const lab = await Lab.findById(labId).select("-password -refreshToken");
    if (!lab) {
      throw new ApiError(404, "Lab not found");
    }
    return lab;
  }

  async updateLab(labId, updateData) {
    const allowedUpdates = ["name", "phoneNumber", "address", "testsOffered"];
    const updates = {};

    // Only allow specific fields to be updated
    Object.keys(updateData).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = updateData[key];
      }
    });

    const lab = await Lab.findByIdAndUpdate(
      labId,
      { $set: updates },
      { new: true }
    ).select("-password -refreshToken");

    if (!lab) {
      throw new ApiError(404, "Lab not found");
    }

    return lab;
  }

  async changePassword(labId, oldPassword, newPassword) {
    const lab = await Lab.findById(labId);
    if (!lab) {
      throw new ApiError(404, "Lab not found");
    }

    const isPasswordValid = await lab.isPasswordCorrect(oldPassword);
    if (!isPasswordValid) {
      throw new ApiError(400, "Invalid old password");
    }

    lab.password = newPassword;
    await lab.save();

    return { message: "Password changed successfully" };
  }

  async deleteLab(labId) {
    const lab = await Lab.findByIdAndDelete(labId);
    if (!lab) {
      throw new ApiError(404, "Lab not found");
    }
    return { message: "Lab deleted successfully" };
  }

  async verifyToken(labId) {
    const lab = await Lab.findById(labId).select("-password -refreshToken");
    if (!lab) {
      throw new ApiError(401, "Invalid token");
    }
    return lab;
  }

  async getAllLabs() {
    const labs = await Lab.find({}).select("-password -refreshToken");
    return labs;
  }

  async getLabsByTest(testName) {
    const labs = await Lab.find({ 
      testsOffered: { $regex: testName, $options: 'i' } 
    }).select("-password -refreshToken");
    return labs;
  }

  async addTest(labId, testName) {
    const lab = await Lab.findByIdAndUpdate(
      labId,
      { $addToSet: { testsOffered: testName } },
      { new: true }
    ).select("-password -refreshToken");

    if (!lab) {
      throw new ApiError(404, "Lab not found");
    }

    return lab;
  }

  async removeTest(labId, testName) {
    const lab = await Lab.findByIdAndUpdate(
      labId,
      { $pull: { testsOffered: testName } },
      { new: true }
    ).select("-password -refreshToken");

    if (!lab) {
      throw new ApiError(404, "Lab not found");
    }

    return lab;
  }

  async updateBloodInventory(labId, bloodType, quantity) {
    const lab = await Lab.findById(labId);
    if (!lab) {
      throw new ApiError(404, "Lab not found");
    }
    // Validate blood type
    const validBloodTypes = [
      'A_Positive', 'A_Negative', 'B_Positive', 'B_Negative',
      'AB_Positive', 'AB_Negative', 'O_Positive', 'O_Negative'
    ];
    if (!validBloodTypes.includes(bloodType)) {
      throw new ApiError(400, "Invalid blood type");
    }
    lab.bloodInventory[bloodType] = Math.max(0, quantity);
    await lab.save();
    return lab;
  }

  async getLabsByBloodType(bloodType) {
    const labs = await Lab.find({
      [`bloodInventory.${bloodType}`]: { $gt: 0 }
    }).select("-password -refreshToken");
    return labs;
  }

  async searchLabsByLocation(location) {
    const labs = await Lab.find({
      address: { $regex: location, $options: 'i' }
    }).select("-password -refreshToken");
    return labs;
  }
}

export const labService = new LabService(); 