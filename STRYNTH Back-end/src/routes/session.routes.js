import { Router } from "express";
import {
  createSession,
  getTrainerSessions,
  getAvailableSessions,
  updateSession,
  deleteSession,
} from "../controllers/session.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

// Trainee: browse open sessions
router.get("/available", authenticateToken, getAvailableSessions);

// Trainer: manage own sessions
router.get("/trainer", authenticateToken, getTrainerSessions);
router.post("/", authenticateToken, createSession);
router.patch("/:id", authenticateToken, updateSession);
router.delete("/:id", authenticateToken, deleteSession);

export default router;
