import fs from "fs/promises";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authRepository } from "../repositories/auth.repository.js";
import { buildError } from "../utils/serviceHelpers.js";
import { UPLOADS_DIR } from "../middleware/upload.middleware.js";

const ALLOWED_ROLES = new Set(["admin", "trainer", "trainee", "member"]);
const PASSWORD_MIN_LENGTH = 6;
const BCRYPT_SALT_ROUNDS = 10;

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const normalizeRole = (role) => {
  const normalizedRole = String(role || "").trim().toLowerCase();

  if (!ALLOWED_ROLES.has(normalizedRole)) {
    throw buildError("role must be one of: admin, trainer, trainee", 400);
  }

  return normalizedRole === "member" ? "trainee" : normalizedRole;
};

const validateSignupPayload = ({ email, password, role, first_name, last_name }) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const normalizedPassword = String(password || "");
  const normalizedFirstName = String(first_name || "").trim();
  const normalizedLastName = String(last_name || "").trim();

  if (!normalizedEmail || !normalizedPassword || role === undefined) {
    throw buildError("email, password, and role are required", 400);
  }

  if (!normalizedFirstName) {
    throw buildError("first_name is required", 400);
  }

  if (!normalizedLastName) {
    throw buildError("last_name is required", 400);
  }

  if (!isValidEmail(normalizedEmail)) {
    throw buildError("email must be a valid email address", 400);
  }

  if (normalizedPassword.length < PASSWORD_MIN_LENGTH) {
    throw buildError(`password must be at least ${PASSWORD_MIN_LENGTH} characters long`, 400);
  }

  return {
    email: normalizedEmail,
    password: normalizedPassword,
    role: normalizeRole(role),
    firstName: normalizedFirstName,
    lastName: normalizedLastName,
  };
};

const validateLoginPayload = ({ email, password }) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const normalizedPassword = String(password || "");

  if (!normalizedEmail || !normalizedPassword) {
    throw buildError("email and password are required", 400);
  }

  if (!isValidEmail(normalizedEmail)) {
    throw buildError("email must be a valid email address", 400);
  }

  return {
    email: normalizedEmail,
    password: normalizedPassword,
  };
};

const signAccessToken = (user) => {
  const secret = String(process.env.JWT_SECRET || "");

  if (!secret) {
    throw buildError("JWT_SECRET is missing. Add it to your .env file before using auth.", 500);
  }

  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    secret,
    {
      subject: String(user.id),
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    },
  );
};

const sanitizeUser = (user) => ({
  id: user.id,
  first_name: user.first_name,
  last_name: user.last_name,
  email: user.email,
  role: user.role,
  profile_image_url: user.profile_image_url ?? null,
  created_at: user.created_at,
});

export const authService = {
  async signup(payload) {
    const { email, password, role, firstName, lastName } = validateSignupPayload(payload);
    const existingUser = await authRepository.findUserByEmail(email);

    if (existingUser) {
      throw buildError("A user with this email already exists", 409);
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    const createdUser = await authRepository.createUser({
      email,
      passwordHash,
      role,
      firstName,
      lastName,
    });

    return sanitizeUser(createdUser);
  },

  async login(payload) {
    const { email, password } = validateLoginPayload(payload);
    const user = await authRepository.findUserByEmail(email);

    if (!user) {
      throw buildError("Invalid email or password", 401);
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      throw buildError("Invalid email or password", 401);
    }

    const accessToken = signAccessToken(user);

    return {
      access_token: accessToken,
      user: sanitizeUser(user),
    };
  },

  async uploadProfileImage(file, user) {
    if (!file) {
      throw buildError("No image file provided", 400);
    }

    const userId = Number(user?.id);
    const imageUrl = `/uploads/profile-images/${file.filename}`;

    // Delete the previous image file from disk if one exists
    const existing = await authRepository.findUserById(userId);
    if (existing?.profile_image_url) {
      const oldFilename = existing.profile_image_url.split("/").pop();
      const oldPath = `${UPLOADS_DIR}/${oldFilename}`;
      await fs.unlink(oldPath).catch(() => {});
    }

    const updated = await authRepository.updateProfileImage(userId, imageUrl);
    return sanitizeUser(updated);
  },

  async logout() {
    return {
      message: "Logout successful",
    };
  },
};
