import { Router } from "express";
import { getTrainers, getTrainerById, updateMyProfile } from "../controllers/trainer.controller.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", authenticateToken, getTrainers);
router.get("/:id", authenticateToken, getTrainerById);
router.put("/profile", authenticateToken, authorizeRoles("trainer"), updateMyProfile);

export default router;
