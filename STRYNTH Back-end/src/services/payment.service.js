import { paymentRepository } from "../repositories/payment.repository.js";
import {
  buildError,
  resolveAuthenticatedUserId,
  validatePositiveId,
} from "../utils/serviceHelpers.js";

const assertOwnerOrAdmin = (payment, user) => {
  const userId = resolveAuthenticatedUserId(user);
  const isAdmin = String(user?.role || "").toLowerCase() === "admin";

  if (!isAdmin && Number(payment.user_id) !== userId) {
    throw buildError("You are not allowed to access this payment", 403);
  }
};

export const paymentService = {
  async getPaymentById(paymentId, user) {
    const resolvedPaymentId = validatePositiveId(paymentId, "payment id");
    const payment = await paymentRepository.findPaymentById(resolvedPaymentId);

    if (!payment) {
      throw buildError("Payment not found", 404);
    }

    assertOwnerOrAdmin(payment, user);
    return payment;
  },
};
