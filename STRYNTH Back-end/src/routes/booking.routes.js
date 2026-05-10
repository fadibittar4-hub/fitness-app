import { Router } from "express";
import {
  bookAndPay,
  getMyBookings,
  cancelBooking,
  getTrainerBookings,
} from "../controllers/booking.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/my", authenticateToken, getMyBookings);
router.get("/trainer", authenticateToken, getTrainerBookings);
router.post("/pay", authenticateToken, bookAndPay);
router.delete("/:id", authenticateToken, cancelBooking);

export default router;
