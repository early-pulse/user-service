import { Doctor } from "../models/doctor.model.js";
import { ApiError } from "../utils/ApiError.js";
import { logger } from "../utils/logger.js";
import { getCoordinatesFromAddress } from '../utils/asyncHandler.js';

class DoctorService {
  async register(doctorData) {
    const { name, email, phoneNumber, address, specialization, password, role } = doctorData;

    // Check if doctor already exists
    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      throw new ApiError(409, "A doctor account with this email address already exists. Please use a different email or try logging in.");
    }

    // Create new doctor
    let coordinates = [0, 0];
    try {
      coordinates = await getCoordinatesFromAddress(address);
    } catch (e) {
      logger.error('Geocoding failed for doctor registration:', e.message);
    }
    
    try {
      const doctor = await Doctor.create({
        name,
        email,
        phoneNumber,
        address,
        specialization,
        password,
        role,
        coordinates: { type: 'Point', coordinates },
      });

      // Return doctor without password
      const createdDoctor = await Doctor.findById(doctor._id).select("-password -refreshToken");
      
      if (!createdDoctor) {
        throw new ApiError(500, "Failed to create doctor account. Please try again.");
      }

      return createdDoctor;
    } catch (error) {
      if (error.code === 11000) {
        throw new ApiError(409, "A doctor account with this email address already exists. Please use a different email or try logging in.");
      }
      throw new ApiError(500, "Failed to create doctor account. Please try again.");
    }
  }

  async login(email, password) {
    // Find doctor by email
    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      throw new ApiError(401, "No doctor account found with this email address. Please check your email or create a new account.");
    }

    // Verify password
    const isPasswordValid = await doctor.isPasswordCorrect(password);
    if (!isPasswordValid) {
      throw new ApiError(401, "Incorrect password. Please check your password and try again.");
    }

    // Generate tokens
    const accessToken = doctor.generateAccessToken();
    const refreshToken = doctor.generateRefreshToken();

    // Save refresh token
    doctor.refreshToken = refreshToken;
    await doctor.save({ validateBeforeSave: false });

    // Return doctor data and tokens
    const loggedInDoctor = await Doctor.findById(doctor._id).select("-password -refreshToken");
    
    return {
      doctor: loggedInDoctor,
      accessToken,
      refreshToken,
    };
  }

  async logout(doctorId) {
    await Doctor.findByIdAndUpdate(
      doctorId,
      {
        $unset: { refreshToken: 1 },
      },
      { new: true }
    );
  }

  async refreshToken(doctorId) {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      throw new ApiError(401, "Invalid refresh token");
    }

    const accessToken = doctor.generateAccessToken();
    const refreshToken = doctor.generateRefreshToken();

    doctor.refreshToken = refreshToken;
    await doctor.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  }

  async getCurrentDoctor(doctorId) {
    const doctor = await Doctor.findById(doctorId).select("-password -refreshToken");
    if (!doctor) {
      throw new ApiError(404, "Doctor not found");
    }
    return doctor;
  }

  async updateDoctor(doctorId, updateData) {
    const allowedUpdates = ["name", "phoneNumber", "address", "specialization"];
    const updates = {};

    // Only allow specific fields to be updated
    Object.keys(updateData).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = updateData[key];
      }
    });

    const doctor = await Doctor.findByIdAndUpdate(
      doctorId,
      { $set: updates },
      { new: true }
    ).select("-password -refreshToken");

    if (!doctor) {
      throw new ApiError(404, "Doctor not found");
    }

    return doctor;
  }

  async changePassword(doctorId, oldPassword, newPassword) {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      throw new ApiError(404, "Doctor not found");
    }

    const isPasswordValid = await doctor.isPasswordCorrect(oldPassword);
    if (!isPasswordValid) {
      throw new ApiError(400, "Invalid old password");
    }

    doctor.password = newPassword;
    await doctor.save({ validateBeforeSave: false });

    return { message: "Password changed successfully" };
  }

  async deleteDoctor(doctorId) {
    const doctor = await Doctor.findByIdAndDelete(doctorId);
    if (!doctor) {
      throw new ApiError(404, "Doctor not found");
    }
    return { message: "Doctor deleted successfully" };
  }

  async verifyToken(doctorId) {
    const doctor = await Doctor.findById(doctorId).select("-password -refreshToken");
    if (!doctor) {
      throw new ApiError(401, "Invalid token");
    }
    return doctor;
  }

  async getAllDoctors() {
    const doctors = await Doctor.find({}).select("-password -refreshToken");
    return doctors;
  }

  async getDoctorsBySpecialization(specialization) {
    const doctors = await Doctor.find({ 
      specialization: { $regex: specialization, $options: 'i' } 
    }).select("-password -refreshToken");
    return doctors;
  }
}

export const doctorService = new DoctorService(); 