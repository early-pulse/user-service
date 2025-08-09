import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use("/uploads", express.static("uploads")); // Serve uploaded files
app.use(cookieParser());

// Import routes
import userRouter from "./routes/user.routes.js";
import doctorRouter from "./routes/doctor.routes.js";
import labRouter from "./routes/lab.routes.js";
import medicineRouter from "./routes/medicine.routes.js";

// Use routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/doctors", doctorRouter);
app.use("/api/v1/labs", labRouter);
app.use("/api/v1/medicines", medicineRouter);

// Health check endpoint
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "User Service is running",
    timestamp: new Date().toISOString(),
  });
});

export { app };
