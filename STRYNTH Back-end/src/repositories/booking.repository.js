import { dbQuery, dbTransaction } from "../config/db.js";

export const bookingRepository = {
  async findBookingById(bookingId) {
    const rows = await dbQuery(
      `
        SELECT
          b.id,
          b.user_id,
          b.session_id,
          b.status,
          b.created_at,
          tu.first_name AS user_first_name,
          tu.last_name  AS user_last_name,
          s.trainer_id,
          s.session_time,
          s.status      AS session_status,
          s.capacity,
          tr.first_name AS trainer_first_name,
          tr.last_name  AS trainer_last_name
        FROM bookings b
        LEFT JOIN sessions s ON s.id = b.session_id
        LEFT JOIN users tu   ON tu.id = b.user_id
        LEFT JOIN users tr   ON tr.id = s.trainer_id
        WHERE b.id = ?
        LIMIT 1
      `,
      [bookingId],
    );

    const row = rows[0];

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      user_id: row.user_id,
      user_first_name: row.user_first_name,
      user_last_name: row.user_last_name,
      session_id: row.session_id,
      status: row.status,
      created_at: row.created_at,
      session: row.session_id
        ? {
            id: row.session_id,
            trainer_id: row.trainer_id,
            trainer_first_name: row.trainer_first_name,
            trainer_last_name: row.trainer_last_name,
            session_time: row.session_time,
            status: row.session_status,
            capacity: row.capacity,
          }
        : null,
    };
  },

  async findBookingsByUserId(userId) {
    const rows = await dbQuery(
      `
        SELECT
          b.id,
          b.user_id,
          b.session_id,
          b.status,
          b.created_at,
          s.trainer_id,
          s.session_time,
          s.status  AS session_status,
          s.capacity,
          u.first_name      AS trainer_first_name,
          u.last_name       AS trainer_last_name
        FROM bookings b
        LEFT JOIN sessions s ON s.id = b.session_id
        LEFT JOIN users u    ON u.id = s.trainer_id
        WHERE b.user_id = ?
        ORDER BY s.session_time DESC
      `,
      [userId],
    );

    return rows.map((row) => ({
      id: row.id,
      user_id: row.user_id,
      session_id: row.session_id,
      status: row.status,
      created_at: row.created_at,
      session: row.session_id
        ? {
            id: row.session_id,
            trainer_id: row.trainer_id,
            trainer_first_name: row.trainer_first_name,
            trainer_last_name: row.trainer_last_name,
            session_time: row.session_time,
            status: row.session_status,
            capacity: row.capacity,
          }
        : null,
    }));
  },

  async findBookingsByTrainerId(trainerId) {
    const rows = await dbQuery(
      `
        SELECT
          b.id,
          b.user_id,
          b.session_id,
          b.status,
          b.created_at,
          s.session_time,
          s.status   AS session_status,
          s.capacity,
          u.first_name AS user_first_name,
          u.last_name  AS user_last_name
        FROM bookings b
        INNER JOIN sessions s ON s.id = b.session_id
        INNER JOIN users u    ON u.id = b.user_id
        WHERE s.trainer_id = ?
          AND b.status = 'confirmed'
        ORDER BY s.session_time DESC
      `,
      [trainerId],
    );

    return rows.map((row) => ({
      id: row.id,
      user_id: row.user_id,
      user_first_name: row.user_first_name,
      user_last_name: row.user_last_name,
      session_id: row.session_id,
      status: row.status,
      created_at: row.created_at,
      session: row.session_id
        ? {
            id: row.session_id,
            session_time: row.session_time,
            status: row.session_status,
            capacity: row.capacity,
          }
        : null,
    }));
  },

  async findActiveBookingByUserAndSession({ userId, sessionId }) {
    const rows = await dbQuery(
      `
        SELECT id, user_id, session_id, status
        FROM bookings
        WHERE user_id = ?
          AND session_id = ?
          AND status = 'confirmed'
        LIMIT 1
      `,
      [userId, sessionId],
    );

    return rows[0] || null;
  },

  async countActiveBookingsBySessionId(sessionId) {
    const rows = await dbQuery(
      `
        SELECT COUNT(*) AS count
        FROM bookings
        WHERE session_id = ?
          AND status = 'confirmed'
      `,
      [sessionId],
    );

    return Number(rows[0]?.count ?? 0);
  },

  async cancelBookingById(bookingId) {
    await dbQuery(
      `
        UPDATE bookings
        SET status = 'cancelled'
        WHERE id = ?
      `,
      [bookingId],
    );

    return this.findBookingById(bookingId);
  },

  async deleteBookingsBySessionId(sessionId) {
    await dbQuery(`DELETE FROM bookings WHERE session_id = ?`, [sessionId]);
  },

  async bookAndPayAtomic({ userId, sessionId, amount, paymentMethod }) {
    return dbTransaction(async (conn) => {
      // Lock the session row — concurrent requests queue up here
      const [sessionRows] = await conn.execute(
        `SELECT id, status, capacity, session_time FROM sessions WHERE id = ? FOR UPDATE`,
        [sessionId],
      );

      const session = sessionRows[0];

      if (!session) {
        const err = new Error("Session not found");
        err.statusCode = 404;
        throw err;
      }

      if (session.status !== "available") {
        const err = new Error("Session is not available for booking");
        err.statusCode = 409;
        throw err;
      }

      if (new Date(session.session_time) <= new Date()) {
        const err = new Error("Cannot book a session that has already started");
        err.statusCode = 409;
        throw err;
      }

      // Check for an existing confirmed booking by this user (inside the lock)
      const [dupRows] = await conn.execute(
        `SELECT id FROM bookings
         WHERE user_id = ? AND session_id = ? AND status = 'confirmed'
         LIMIT 1`,
        [userId, sessionId],
      );

      if (dupRows[0]) {
        const err = new Error("You already have a booking for this session");
        err.statusCode = 409;
        throw err;
      }

      // Count confirmed bookings while the session row is locked
      const [countRows] = await conn.execute(
        `SELECT COUNT(*) AS count FROM bookings
         WHERE session_id = ? AND status = 'confirmed'`,
        [sessionId],
      );

      const activeCount = Number(countRows[0]?.count ?? 0);

      if (activeCount >= session.capacity) {
        const err = new Error("Session is fully booked");
        err.statusCode = 409;
        throw err;
      }

      // Mock payment attempt — happens inside the lock so a failed payment
      // rolls back atomically (no booking is created, no spot is held)
      const failingMethods = new Set(["fail", "failed", "declined", "mock_fail"]);
      if (failingMethods.has(String(paymentMethod).trim().toLowerCase())) {
        const err = new Error("Payment was declined");
        err.statusCode = 402;
        throw err;
      }

      // Insert booking as confirmed — spot is claimed atomically with the payment
      const [bookingResult] = await conn.execute(
        `INSERT INTO bookings (user_id, session_id, status) VALUES (?, ?, 'confirmed')`,
        [userId, sessionId],
      );
      const bookingId = bookingResult.insertId;

      // Insert payment as paid — both records land in the same transaction
      const [paymentResult] = await conn.execute(
        `INSERT INTO payments (user_id, booking_id, amount, payment_method, status)
         VALUES (?, ?, ?, ?, 'paid')`,
        [userId, bookingId, amount, paymentMethod],
      );

      // Auto-mark session as booked when all spots are taken
      if (activeCount + 1 === session.capacity) {
        await conn.execute(`UPDATE sessions SET status = 'booked' WHERE id = ?`, [sessionId]);
      }

      return paymentResult.insertId;
    });
  },

  async findAllBookings() {
    const rows = await dbQuery(
      `
        SELECT
          b.id,
          b.user_id,
          b.session_id,
          b.status,
          b.created_at,
          tu.first_name AS user_first_name,
          tu.last_name  AS user_last_name,
          s.trainer_id,
          s.session_time,
          s.status      AS session_status,
          s.capacity,
          tr.first_name AS trainer_first_name,
          tr.last_name  AS trainer_last_name
        FROM bookings b
        LEFT JOIN sessions s ON s.id = b.session_id
        LEFT JOIN users tu   ON tu.id = b.user_id
        LEFT JOIN users tr   ON tr.id = s.trainer_id
        ORDER BY b.created_at DESC
      `,
    );

    return rows.map((row) => ({
      id: row.id,
      user_id: row.user_id,
      user_first_name: row.user_first_name,
      user_last_name: row.user_last_name,
      session_id: row.session_id,
      status: row.status,
      created_at: row.created_at,
      session: row.session_id
        ? {
            id: row.session_id,
            trainer_id: row.trainer_id,
            trainer_first_name: row.trainer_first_name,
            trainer_last_name: row.trainer_last_name,
            session_time: row.session_time,
            status: row.session_status,
            capacity: row.capacity,
          }
        : null,
    }));
  },
};
