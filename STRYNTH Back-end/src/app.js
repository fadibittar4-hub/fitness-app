import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import sessionRoutes from "./routes/session.routes.js";
import trainerRoutes from "./routes/trainer.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const corsOptions = {
  origin: "http://localhost:4200",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.options("/{*wildcard}", cors(corsOptions));
app.use(cors(corsOptions));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/auth", authRoutes);
app.use("/api/v1/sessions", sessionRoutes);
app.use("/sessions", sessionRoutes);
app.use("/api/v1/bookings", bookingRoutes);
app.use("/bookings", bookingRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/payments", paymentRoutes);
app.use("/api/v1/trainers", trainerRoutes);
app.use("/api/v1/admin", adminRoutes);


export default app;
