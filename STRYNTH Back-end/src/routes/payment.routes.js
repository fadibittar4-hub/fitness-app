import { Router } from "express";
import { getPaymentById } from "../controllers/payment.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/:id", authenticateToken, getPaymentById);

export default router;
