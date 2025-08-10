import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { medicineService } from "../services/medicine.service.js";
import { logger } from "../utils/logger.js";

// Create medicine (only medicalOwner)
const createMedicine = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    category,
    manufacturer,
    price,
    stockQuantity,
    imageUrl,
    dosageForm,
    strength,
    expiryDate,
  } = req.body;

  // Handle uploaded image
  let finalImageUrl = imageUrl;
  if (req.file) {
    // Use the uploaded file path
    finalImageUrl = `/uploads/medicines/${req.file.filename}`;
  }

  // Validate required fields
  const requiredFields = [
    { field: "name", value: name, message: "Medicine name is required" },
    { field: "description", value: description, message: "Description is required" },
    { field: "category", value: category, message: "Category is required" },
    { field: "manufacturer", value: manufacturer, message: "Manufacturer is required" },
    { field: "price", value: price, message: "Price is required" },
    { field: "stockQuantity", value: stockQuantity, message: "Stock quantity is required" },
    { field: "dosageForm", value: dosageForm, message: "Dosage form is required" },
    { field: "expiryDate", value: expiryDate, message: "Expiry date is required" },
  ];

  for (const field of requiredFields) {
    if (!field.value || field.value.toString().trim() === "") {
      logger.logApi("/medicine/create", req.method, 400);
      throw new ApiError(400, field.message);
    }
  }

  // Validate price and stock quantity
  if (price < 0) {
    throw new ApiError(400, "Price cannot be negative");
  }
  if (stockQuantity < 0) {
    throw new ApiError(400, "Stock quantity cannot be negative");
  }

  // Validate expiry date
  const expiryDateObj = new Date(expiryDate);
  if (expiryDateObj <= new Date()) {
    throw new ApiError(400, "Expiry date must be in the future");
  }

  const medicineData = {
    name: name.trim(),
    description: description.trim(),
    category,
    manufacturer: manufacturer.trim(),
    price: parseFloat(price),
    stockQuantity: parseInt(stockQuantity),
    imageUrl: finalImageUrl,
    dosageForm,
    strength: strength?.trim(),
    expiryDate: expiryDateObj,
  };

  const medicine = await medicineService.createMedicine(medicineData, req.user._id);

  logger.logApi("/medicine/create", req.method, 201);
  return res
    .status(201)
    .json(new ApiResponse(201, medicine, "Medicine created successfully"));
});

// Get all medicines (public access)
const getAllMedicines = asyncHandler(async (req, res) => {
  const { category, search, minPrice, maxPrice } = req.query;

  const filters = {};
  if (category) filters.category = category;
  if (search) filters.search = search;
  if (minPrice) filters.minPrice = parseFloat(minPrice);
  if (maxPrice) filters.maxPrice = parseFloat(maxPrice);

  const medicines = await medicineService.getAllMedicines(filters);

  logger.logApi("/medicine/all", req.method, 200);
  return res
    .status(200)
    .json(new ApiResponse(200, medicines, "Medicines fetched successfully"));
});

// Get medicine by ID (public access)
const getMedicineById = asyncHandler(async (req, res) => {
  const { medicineId } = req.params;

  const medicine = await medicineService.getMedicineById(medicineId);

  logger.logApi(`/medicine/${medicineId}`, req.method, 200);
  return res
    .status(200)
    .json(new ApiResponse(200, medicine, "Medicine fetched successfully"));
});

// Update medicine (only medicalOwner)
const updateMedicine = asyncHandler(async (req, res) => {
  const { medicineId } = req.params;
  const updateData = req.body;

  // Handle uploaded image
  if (req.file) {
    updateData.imageUrl = `/uploads/medicines/${req.file.filename}`;
  }

  // Remove fields that shouldn't be updated
  delete updateData.createdBy;
  delete updateData._id;

  const medicine = await medicineService.updateMedicine(medicineId, updateData, req.user._id);

  logger.logApi(`/medicine/${medicineId}`, req.method, 200);
  return res
    .status(200)
    .json(new ApiResponse(200, medicine, "Medicine updated successfully"));
});

// Delete medicine (only medicalOwner)
const deleteMedicine = asyncHandler(async (req, res) => {
  const { medicineId } = req.params;

  const result = await medicineService.deleteMedicine(medicineId, req.user._id);

  logger.logApi(`/medicine/${medicineId}`, req.method, 200);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Medicine deleted successfully"));
});

// Create medicine order
const createOrder = asyncHandler(async (req, res) => {
  const {
    medicines,
    shippingAddress,
    notes,
  } = req.body;

  // Validate required fields
  if (!medicines || !Array.isArray(medicines) || medicines.length === 0) {
    throw new ApiError(400, "At least one medicine is required");
  }

  if (!shippingAddress) {
    throw new ApiError(400, "Shipping address is required");
  }

  // Validate shipping address
  const requiredAddressFields = ["street", "city", "state", "zipCode"];
  for (const field of requiredAddressFields) {
    if (!shippingAddress[field] || shippingAddress[field].trim() === "") {
      throw new ApiError(400, `${field} is required in shipping address`);
    }
  }

  // Validate medicines array
  for (const item of medicines) {
    if (!item.medicine || !item.quantity || item.quantity < 1) {
      throw new ApiError(400, "Each medicine must have medicine ID and quantity (minimum 1)");
    }
  }

  const orderData = {
    medicines,
    shippingAddress,
    paymentMethod: "cod",
    notes: notes?.trim(),
  };

  const order = await medicineService.createOrder(orderData, req.user._id);

  logger.logApi("/medicine/order", req.method, 201);
  return res
    .status(201)
    .json(new ApiResponse(201, order, "Order created successfully"));
});

// Get user orders
const getUserOrders = asyncHandler(async (req, res) => {
  const orders = await medicineService.getUserOrders(req.user._id);

  logger.logApi("/medicine/orders", req.method, 200);
  return res
    .status(200)
    .json(new ApiResponse(200, orders, "Orders fetched successfully"));
});

// Get order by ID
const getOrderById = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await medicineService.getOrderById(orderId, req.user._id);

  logger.logApi(`/medicine/order/${orderId}`, req.method, 200);
  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order fetched successfully"));
});

// Update order status (only medicalOwner)
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  if (!status) {
    throw new ApiError(400, "Status is required");
  }

  const validStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
  if (!validStatuses.includes(status)) {
    throw new ApiError(400, "Invalid status");
  }

  const order = await medicineService.updateOrderStatus(orderId, status, req.user._id);

  logger.logApi(`/medicine/order/${orderId}/status`, req.method, 200);
  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order status updated successfully"));
});

// Get all orders (only medicalOwner)
const getAllOrders = asyncHandler(async (req, res) => {
  const { status, paymentStatus } = req.query;

  const filters = {};
  if (status) filters.status = status;
  if (paymentStatus) filters.paymentStatus = paymentStatus;

  const orders = await medicineService.getAllOrders(filters);

  logger.logApi("/medicine/orders/all", req.method, 200);
  return res
    .status(200)
    .json(new ApiResponse(200, orders, "Orders fetched successfully"));
});

// Get medicine statistics (only medicalOwner)
const getMedicineStats = asyncHandler(async (req, res) => {
  const stats = await medicineService.getMedicineStats();

  logger.logApi("/medicine/stats", req.method, 200);
  return res
    .status(200)
    .json(new ApiResponse(200, stats, "Statistics fetched successfully"));
});

export {
  createMedicine,
  getAllMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine,
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
  getMedicineStats,
}; 