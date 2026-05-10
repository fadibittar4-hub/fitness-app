import { authRepository } from "../repositories/auth.repository.js";
import { bookingRepository } from "../repositories/booking.repository.js";
import { sessionRepository } from "../repositories/session.repository.js";
import { trainerService } from "../services/trainer.service.js";
import { sessionService } from "../services/session.service.js";
import { buildError, validatePositiveId } from "../utils/serviceHelpers.js";

const VALID_ROLES = new Set(["member", "trainer", "admin"]);

export const adminService = {
  async getAllUsers() {
    return authRepository.findAllUsers();
  },

  async getAllBookings() {
    return bookingRepository.findAllBookings();
  },

  async getAllSessions() {
    return sessionRepository.findAllSessions();
  },

  async updateUser(userId, data) {
    const id = validatePositiveId(userId, "user id");
    const user = await authRepository.findUserById(id);

    if (!user) throw buildError("User not found", 404);

    const fields = {};

    if (data.first_name !== undefined) {
      if (!String(data.first_name).trim()) throw buildError("first_name cannot be empty");
      fields.first_name = String(data.first_name).trim();
    }

    if (data.last_name !== undefined) {
      if (!String(data.last_name).trim()) throw buildError("last_name cannot be empty");
      fields.last_name = String(data.last_name).trim();
    }

    if (data.email !== undefined) {
      const email = String(data.email).trim().toLowerCase();
      if (!email.includes("@")) throw buildError("email is invalid");
      fields.email = email;
    }

    if (data.role !== undefined) {
      if (!VALID_ROLES.has(data.role)) {
        throw buildError(`role must be one of: ${[...VALID_ROLES].join(", ")}`);
      }
      fields.role = data.role;
    }

    return authRepository.updateUserById(id, fields);
  },

  async updateTrainerProfile(userId, data) {
    const id = validatePositiveId(userId, "trainer id");
    const user = await authRepository.findUserById(id);

    if (!user) throw buildError("User not found", 404);
    if (user.role !== "trainer") throw buildError("User is not a trainer", 400);

    return trainerService.updateMyProfile(id, data);
  },

  async updateSession(sessionId, data) {
    return sessionService.adminUpdateSession(sessionId, data);
  },
};
