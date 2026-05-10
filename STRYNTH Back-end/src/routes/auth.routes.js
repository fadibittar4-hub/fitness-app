import { Router } from "express";
import { login, logout, signup, uploadProfileImage } from "../controllers/auth.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { uploadSingleProfileImage } from "../middleware/upload.middleware.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", authenticateToken, logout);
router.patch("/me/profile-image", authenticateToken, uploadSingleProfileImage, uploadProfileImage);

export default router;
