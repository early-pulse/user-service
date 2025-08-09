import multer from "multer";
import path from "path";
import { ApiError } from "../utils/ApiError.js";

// Configure storage for medicine images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/medicines/");
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "medicine-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  // Check if file is an image
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new ApiError(400, "Only image files are allowed"), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Middleware for single image upload
export const uploadMedicineImage = upload.single("image");

// Middleware for multiple images (if needed in future)
export const uploadMultipleImages = upload.array("images", 5);

// Error handling middleware for multer
export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        statusCode: 400,
        message: "File size too large. Maximum size is 5MB.",
      });
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        statusCode: 400,
        message: "Too many files. Maximum 5 files allowed.",
      });
    }
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        statusCode: 400,
        message: "Unexpected file field.",
      });
    }
  }
  
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      statusCode: error.statusCode,
      message: error.message,
    });
  }
  
  next(error);
};

