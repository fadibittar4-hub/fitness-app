import { sessionRepository } from "../repositories/session.repository.js";
import { bookingRepository } from "../repositories/booking.repository.js";
import {
  buildError,
  resolveAuthenticatedUserId,
  validatePositiveId,
  assertTrainerRole,
} from "../utils/serviceHelpers.js";

const VALID_STATUSES = new Set(["available", "booked", "completed", "cancelled"]);

const buildSessionUpdates = (payload) => {
  const updates = {};

  if (payload.session_time !== undefined) {
    const sessionTime = new Date(payload.session_time);
    if (Number.isNaN(sessionTime.getTime())) {
      throw buildError("session_time must be a valid date-time value");
    }
    updates.sessionTime = sessionTime.toISOString().slice(0, 19).replace("T", " ");
  }

  if (payload.status !== undefined) {
    if (!VALID_STATUSES.has(payload.status)) {
      throw buildError(`status must be one of: ${[...VALID_STATUSES].join(", ")}`);
    }
    updates.status = payload.status;
  }

  if (payload.capacity !== undefined) {
    const parsedCapacity = Number(payload.capacity);
    if (!Number.isInteger(parsedCapacity) || parsedCapacity < 1) {
      throw buildError("capacity must be a positive integer");
    }
    updates.capacity = parsedCapacity;
  }

  if (payload.price !== undefined) {
    const parsedPrice = Number(payload.price);
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      throw buildError("price must be a non-negative number");
    }
    updates.price = parsedPrice;
  }

  return updates;
};

export const sessionService = {
  async createSession(payload, user) {
    assertTrainerRole(user);
    const trainerId = resolveAuthenticatedUserId(user);

    const { session_time, capacity, price } = payload ?? {};

    if (!session_time) {
      throw buildError("session_time is required");
    }

    const sessionTime = new Date(session_time);

    if (Number.isNaN(sessionTime.getTime())) {
      throw buildError("session_time must be a valid date-time value");
    }

    if (sessionTime <= new Date()) {
      throw buildError("session_time must be in the future");
    }

    const parsedCapacity = capacity === undefined ? 1 : Number(capacity);

    if (!Number.isInteger(parsedCapacity) || parsedCapacity < 1) {
      throw buildError("capacity must be a positive integer");
    }

    const parsedPrice = price === undefined ? 0 : Number(price);

    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      throw buildError("price must be a non-negative number");
    }

    return sessionRepository.createSession({
      trainerId,
      sessionTime: sessionTime.toISOString().slice(0, 19).replace("T", " "),
      status: "available",
      capacity: parsedCapacity,
      price: parsedPrice,
    });
  },

  async getTrainerSessions(user) {
    assertTrainerRole(user);
    const trainerId = resolveAuthenticatedUserId(user);

    return sessionRepository.findSessionsByTrainerId(trainerId);
  },

  async listAvailableSessions() {
    return sessionRepository.findAvailableSessions();
  },

  async updateSession(sessionId, payload, user) {
    assertTrainerRole(user);
    const trainerId = resolveAuthenticatedUserId(user);
    const parsedSessionId = validatePositiveId(sessionId, "session id");

    const session = await sessionRepository.findSessionById(parsedSessionId);

    if (!session) {
      throw buildError("Session not found", 404);
    }

    if (Number(session.trainer_id) !== trainerId) {
      throw buildError("You can only update your own sessions", 403);
    }

    return sessionRepository.updateSessionById(parsedSessionId, buildSessionUpdates(payload));
  },

  async adminUpdateSession(sessionId, payload) {
    const parsedSessionId = validatePositiveId(sessionId, "session id");
    const session = await sessionRepository.findSessionById(parsedSessionId);

    if (!session) throw buildError("Session not found", 404);

    return sessionRepository.updateSessionById(parsedSessionId, buildSessionUpdates(payload));
  },

  async deleteSession(sessionId, user) {
    assertTrainerRole(user);
    const trainerId = resolveAuthenticatedUserId(user);
    const parsedSessionId = validatePositiveId(sessionId, "session id");

    const session = await sessionRepository.findSessionById(parsedSessionId);

    if (!session) {
      throw buildError("Session not found", 404);
    }

    if (Number(session.trainer_id) !== trainerId) {
      throw buildError("You can only delete your own sessions", 403);
    }

    const confirmedCount = await bookingRepository.countActiveBookingsBySessionId(parsedSessionId);

    if (confirmedCount > 0) {
      throw buildError("Cannot delete a session that has confirmed bookings", 409);
    }

    // Remove any leftover cancelled/non-active bookings so the FK allows deletion
    await bookingRepository.deleteBookingsBySessionId(parsedSessionId);
    await sessionRepository.deleteSessionById(parsedSessionId);
  },
};
