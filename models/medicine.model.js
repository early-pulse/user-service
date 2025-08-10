import mongoose, { Schema } from "mongoose";

const medicineSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      enum: ["painkiller", "antibiotic", "vitamin", "supplement", "otc", "other"],
    },
    manufacturer: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stockQuantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    dosageForm: {
      type: String,
      required: true,
      trim: true,
      enum: ["tablet", "capsule", "liquid", "injection", "cream", "ointment", "drops", "other"],
    },
    strength: {
      type: String,
      trim: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better search performance
medicineSchema.index({ name: "text", description: "text", category: "text" });

export const Medicine = mongoose.model("Medicine", medicineSchema); 