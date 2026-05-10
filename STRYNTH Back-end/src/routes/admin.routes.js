import { Router } from "express";
import {
  getAllUsers,
  getAllBookings,
  getAllSessions,
  updateUser,
  updateTrainerProfile,
  updateSession,
} from "../controllers/admin.controller.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/users", authenticateToken, requireAdmin, getAllUsers);
router.get("/bookings", authenticateToken, requireAdmin, getAllBookings);
router.get("/sessions", authenticateToken, requireAdmin, getAllSessions);

router.put("/users/:id", authenticateToken, requireAdmin, updateUser);
router.put("/trainers/:id/profile", authenticateToken, requireAdmin, updateTrainerProfile);
router.put("/sessions/:id", authenticateToken, requireAdmin, updateSession);

export default router;
