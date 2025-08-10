import { Medicine } from "../models/medicine.model.js";
import { MedicineOrder } from "../models/medicineOrder.model.js";
import { ApiError } from "../utils/ApiError.js";
import { logger } from "../utils/logger.js";

class MedicineService {
  // Create a new medicine (only medicalOwner can do this)
  async createMedicine(medicineData, createdBy) {
    try {
      const medicine = new Medicine({
        ...medicineData,
        createdBy,
      });

      const savedMedicine = await medicine.save();
      logger.info(`Medicine created: ${savedMedicine._id} by user: ${createdBy}`);
      return savedMedicine;
    } catch (error) {
      logger.error(`Error creating medicine: ${error.message}`);
      
      // Handle validation errors
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(err => err.message);
        throw new ApiError(400, `Validation error: ${validationErrors.join(', ')}`);
      }
      
      // Handle duplicate key errors
      if (error.code === 11000) {
        throw new ApiError(400, "Medicine with this name already exists");
      }
      
      throw new ApiError(500, "Error creating medicine");
    }
  }

  // Get all medicines (public access)
  async getAllMedicines(filters = {}) {
    try {
      const query = { isActive: true };

      // Apply filters
      if (filters.category) {
        query.category = filters.category;
      }
      if (filters.search) {
        query.$text = { $search: filters.search };
      }
      if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        query.price = {};
        if (filters.minPrice !== undefined) {
          query.price.$gte = filters.minPrice;
        }
        if (filters.maxPrice !== undefined) {
          query.price.$lte = filters.maxPrice;
        }
      }


      const medicines = await Medicine.find(query)
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 });

      return medicines;
    } catch (error) {
      logger.error(`Error fetching medicines: ${error.message}`);
      throw new ApiError(500, "Error fetching medicines");
    }
  }

  // Get medicine by ID (public access)
  async getMedicineById(medicineId) {
    try {
      const medicine = await Medicine.findById(medicineId)
        .populate("createdBy", "name email");

      if (!medicine) {
        throw new ApiError(404, "Medicine not found");
      }

      return medicine;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error(`Error fetching medicine: ${error.message}`);
      throw new ApiError(500, "Error fetching medicine");
    }
  }

  // Update medicine (only medicalOwner can do this)
  async updateMedicine(medicineId, updateData, updatedBy) {
    try {
      const medicine = await Medicine.findById(medicineId);

      if (!medicine) {
        throw new ApiError(404, "Medicine not found");
      }

      if (medicine.createdBy.toString() !== updatedBy.toString()) {
        throw new ApiError(403, "You can only update medicines you created");
      }

      const updatedMedicine = await Medicine.findByIdAndUpdate(
        medicineId,
        { ...updateData },
        { new: true, runValidators: true }
      ).populate("createdBy", "name email");

      logger.info(`Medicine updated: ${medicineId} by user: ${updatedBy}`);
      return updatedMedicine;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error(`Error updating medicine: ${error.message}`);
      throw new ApiError(500, "Error updating medicine");
    }
  }

  // Delete medicine (only medicalOwner can do this)
  async deleteMedicine(medicineId, deletedBy) {
    try {
      const medicine = await Medicine.findById(medicineId);

      if (!medicine) {
        throw new ApiError(404, "Medicine not found");
      }

      if (medicine.createdBy.toString() !== deletedBy.toString()) {
        throw new ApiError(403, "You can only delete medicines you created");
      }

      await Medicine.findByIdAndDelete(medicineId);
      logger.info(`Medicine deleted: ${medicineId} by user: ${deletedBy}`);
      return { message: "Medicine deleted successfully" };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error(`Error deleting medicine: ${error.message}`);
      throw new ApiError(500, "Error deleting medicine");
    }
  }

  // Create medicine order
  async createOrder(orderData, userId) {
    try {
      // Validate medicines and check stock, also set prices
      const validatedMedicines = [];
      for (const item of orderData.medicines) {
        const medicine = await Medicine.findById(item.medicine);
        if (!medicine) {
          throw new ApiError(404, `Medicine with ID ${item.medicine} not found`);
        }
        if (!medicine.isActive) {
          throw new ApiError(400, `Medicine ${medicine.name} is not available`);
        }
        if (medicine.stockQuantity < item.quantity) {
          throw new ApiError(400, `Insufficient stock for ${medicine.name}`);
        }


        // Add price to the medicine item
        validatedMedicines.push({
          ...item,
          price: medicine.price,
        });
      }

      // Create order with validated medicines
      const order = new MedicineOrder({
        ...orderData,
        medicines: validatedMedicines,
        user: userId,
      });

      const savedOrder = await order.save();

      // Update stock quantities
      for (const item of validatedMedicines) {
        await Medicine.findByIdAndUpdate(item.medicine, {
          $inc: { stockQuantity: -item.quantity },
        });
      }

      logger.info(`Order created: ${savedOrder._id} by user: ${userId}`);
      return savedOrder;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error(`Error creating order: ${error.message}`);
      throw new ApiError(500, "Error creating order");
    }
  }

  // Get user orders
  async getUserOrders(userId) {
    try {
      const orders = await MedicineOrder.find({ user: userId })
        .populate("medicines.medicine")
        .populate("user", "name email")
        .sort({ createdAt: -1 });

      return orders;
    } catch (error) {
      logger.error(`Error fetching user orders: ${error.message}`);
      throw new ApiError(500, "Error fetching orders");
    }
  }

  // Get order by ID
  async getOrderById(orderId, userId) {
    try {
      const order = await MedicineOrder.findById(orderId)
        .populate("medicines.medicine")
        .populate("user", "name email");

      if (!order) {
        throw new ApiError(404, "Order not found");
      }

      // Check if user is authorized to view this order
      if (order.user._id.toString() !== userId.toString()) {
        throw new ApiError(403, "You can only view your own orders");
      }

      return order;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error(`Error fetching order: ${error.message}`);
      throw new ApiError(500, "Error fetching order");
    }
  }

  // Update order status (only medicalOwner can do this)
  async updateOrderStatus(orderId, status, updatedBy) {
    try {
      const order = await MedicineOrder.findById(orderId);

      if (!order) {
        throw new ApiError(404, "Order not found");
      }

      const updatedOrder = await MedicineOrder.findByIdAndUpdate(
        orderId,
        { status },
        { new: true, runValidators: true }
      )
        .populate("medicines.medicine")
        .populate("user", "name email");

      logger.info(`Order status updated: ${orderId} to ${status} by user: ${updatedBy}`);
      return updatedOrder;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error(`Error updating order status: ${error.message}`);
      throw new ApiError(500, "Error updating order status");
    }
  }

  // Get all orders (only medicalOwner can do this)
  async getAllOrders(filters = {}) {
    try {
      const query = {};

      if (filters.status) {
        query.status = filters.status;
      }
      if (filters.paymentStatus) {
        query.paymentStatus = filters.paymentStatus;
      }

      const orders = await MedicineOrder.find(query)
        .populate("medicines.medicine")
        .populate("user", "name email")
        .sort({ createdAt: -1 });

      return orders;
    } catch (error) {
      logger.error(`Error fetching all orders: ${error.message}`);
      throw new ApiError(500, "Error fetching orders");
    }
  }

  // Get medicine statistics (only medicalOwner can do this)
  async getMedicineStats() {
    try {
      const totalMedicines = await Medicine.countDocuments({ isActive: true });
      const lowStockMedicines = await Medicine.countDocuments({
        isActive: true,
        stockQuantity: { $lt: 10 },
      });
      const totalOrders = await MedicineOrder.countDocuments();
      const pendingOrders = await MedicineOrder.countDocuments({ status: "pending" });

      return {
        totalMedicines,
        lowStockMedicines,
        totalOrders,
        pendingOrders,
      };
    } catch (error) {
      logger.error(`Error fetching medicine stats: ${error.message}`);
      throw new ApiError(500, "Error fetching statistics");
    }
  }
}

export const medicineService = new MedicineService(); 