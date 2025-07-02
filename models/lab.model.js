import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const labSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    testsOffered: [{
      type: String,
      required: true,
      trim: true,
    }],
    bloodInventory: {
      A_Positive: { type: Number, default: 0 },
      A_Negative: { type: Number, default: 0 },
      B_Positive: { type: Number, default: 0 },
      B_Negative: { type: Number, default: 0 },
      AB_Positive: { type: Number, default: 0 },
      AB_Negative: { type: Number, default: 0 },
      O_Positive: { type: Number, default: 0 },
      O_Negative: { type: Number, default: 0 },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Password hashing middleware
labSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Password verification method
labSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Access token generation
labSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      name: this.name,
      entityType: "Lab",
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

// Refresh token generation
labSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      entityType: "Lab",
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const Lab = mongoose.model("Lab", labSchema); 