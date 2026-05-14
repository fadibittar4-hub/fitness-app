import { bookingRepository } from "../repositories/booking.repository.js";
import { paymentRepository } from "../repositories/payment.repository.js";
import {
  buildError,
  resolveAuthenticatedUserId,
  validatePositiveId,
  assertTrainerRole,
} from "../utils/serviceHelpers.js";

const validateBookAndPayPayload = (payload) => {
  const { session_id, amount, payment_method } = payload;

  if (amount === undefined || amount === null) {
    throw buildError("amount is required");
  }

  const sessionId = validatePositiveId(session_id, "session_id");
  const numericAmount = Number(amount);
  const paymentMethod = String(payment_method || "").trim();

  if (!Number.isFinite(numericAmount) || numericAmount < 0) {
    throw buildError("amount must be a non-negative number");
  }

  if (!paymentMethod) {
    throw buildError("payment_method is required");
  }

  return { sessionId, amount: numericAmount, paymentMethod };
};

export const bookingService = {
  async bookAndPay(payload, user) {
    const userId = resolveAuthenticatedUserId(user);
    const { sessionId, amount, paymentMethod } = validateBookAndPayPayload(payload ?? {});

    const paymentId = await bookingRepository.bookAndPayAtomic({
      userId,
      sessionId,
      amount,
      paymentMethod,
    });

    return paymentRepository.findPaymentById(paymentId);
  },

  async getMyBookings(user) {
    const userId = resolveAuthenticatedUserId(user);

    return bookingRepository.findBookingsByUserId(userId);
  },

  async getTrainerBookings(user) {
    assertTrainerRole(user);
    const trainerId = resolveAuthenticatedUserId(user);

    return bookingRepository.findBookingsByTrainerId(trainerId);
  },

  async cancelBooking(bookingId, user) {
    const parsedBookingId = validatePositiveId(bookingId, "booking id");
    const userId = resolveAuthenticatedUserId(user);

    const booking = await bookingRepository.findBookingById(parsedBookingId);

    if (!booking) {
      throw buildError("Booking not found", 404);
    }

    if (Number(booking.user_id) !== userId) {
      throw buildError("You can only cancel your own bookings", 403);
    }

    if (booking.status === "cancelled") {
      return booking;
    }

    const cancelled = await bookingRepository.cancelBookingById(parsedBookingId);

    // Restore session to available if it was auto-set to booked
    const session = await sessionRepository.findSessionById(Number(booking.session_id));

    if (session && session.status === "booked") {
      await sessionRepository.updateSessionById(Number(booking.session_id), {
        status: "available",
      });
    }

    return cancelled;
  },
};
