import mongoose, { Schema } from "mongoose";

const medicineOrderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    medicines: [
      {
        medicine: {
          type: Schema.Types.ObjectId,
          ref: "Medicine",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    shippingAddress: {
      street: {
        type: String,
        required: true,
        trim: true,
      },
      city: {
        type: String,
        required: true,
        trim: true,
      },
      state: {
        type: String,
        required: true,
        trim: true,
      },
      zipCode: {
        type: String,
        required: true,
        trim: true,
      },
      country: {
        type: String,
        required: true,
        trim: true,
        default: "India",
      },
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["cod"],
      default: "cod",
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    notes: {
      type: String,
      trim: true,
    },
    estimatedDeliveryDate: {
      type: Date,
    },
    actualDeliveryDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate total amount before saving
medicineOrderSchema.pre("save", async function (next) {
  if (this.medicines && this.medicines.length > 0) {
    let totalAmount = 0;
    
    for (const item of this.medicines) {
      // If price is not set, fetch it from the medicine document
      if (!item.price) {
        const medicine = await mongoose.model("Medicine").findById(item.medicine);
        if (medicine) {
          item.price = medicine.price;
        }
      }
      totalAmount += item.price * item.quantity;
    }
    
    this.totalAmount = totalAmount;
  }
  next();
});

export const MedicineOrder = mongoose.model("MedicineOrder", medicineOrderSchema); 