import { dbQuery } from "../config/db.js";
import { Payment } from "../models/payment.model.js";

const mapPaymentRow = (row) => {
  if (!row) {
    return null;
  }

  return new Payment({
    id: row.id,
    user_id: row.user_id,
    user_first_name: row.user_first_name ?? null,
    user_last_name: row.user_last_name ?? null,
    trainer_first_name: row.trainer_first_name ?? null,
    trainer_last_name: row.trainer_last_name ?? null,
    booking_id: row.booking_id,
    amount: row.amount === null || row.amount === undefined ? null : Number(row.amount),
    payment_method: row.payment_method,
    status: row.status,
    created_at: row.created_at,
  });
};

export const paymentRepository = {
  async findPaymentById(paymentId) {
    const rows = await dbQuery(
      `
        SELECT
          p.id,
          p.user_id,
          p.booking_id,
          p.amount,
          p.payment_method,
          p.status,
          p.created_at,
          tu.first_name AS user_first_name,
          tu.last_name  AS user_last_name,
          tr.first_name AS trainer_first_name,
          tr.last_name  AS trainer_last_name
        FROM payments p
        INNER JOIN users tu      ON tu.id = p.user_id
        LEFT JOIN bookings b     ON b.id = p.booking_id
        LEFT JOIN sessions s     ON s.id = b.session_id
        LEFT JOIN users tr       ON tr.id = s.trainer_id
        WHERE p.id = ?
        LIMIT 1
      `,
      [paymentId],
    );

    return mapPaymentRow(rows[0]);
  },

};
