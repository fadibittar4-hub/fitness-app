import { dbQuery } from "../config/db.js";

export const sessionRepository = {
  async createSession({ trainerId, sessionTime, status, capacity, price }) {
    const result = await dbQuery(
      `
        INSERT INTO sessions (trainer_id, session_time, status, capacity, price)
        VALUES (?, ?, ?, ?, ?)
      `,
      [trainerId, sessionTime, status, capacity, price ?? 0],
    );

    return this.findSessionById(result.insertId);
  },

  async findSessionById(sessionId) {
    const rows = await dbQuery(
      `
        SELECT id, trainer_id, session_time, status, capacity, price, created_at
        FROM sessions
        WHERE id = ?
        LIMIT 1
      `,
      [sessionId],
    );

    return rows[0] || null;
  },

  async findSessionsByTrainerId(trainerId) {
    const rows = await dbQuery(
      `
        SELECT
          s.id,
          s.trainer_id,
          s.session_time,
          s.status,
          s.capacity,
          s.price,
          s.created_at,
          u.first_name AS trainer_first_name,
          u.last_name  AS trainer_last_name
        FROM sessions s
        INNER JOIN users u ON u.id = s.trainer_id
        WHERE s.trainer_id = ?
        ORDER BY s.session_time ASC
      `,
      [trainerId],
    );

    return rows.map((row) => ({
      id: row.id,
      trainer_id: row.trainer_id,
      trainer_first_name: row.trainer_first_name,
      trainer_last_name: row.trainer_last_name,
      session_time: row.session_time,
      status: row.status,
      capacity: row.capacity,
      price: row.price,
      created_at: row.created_at,
    }));
  },

  async findAvailableSessions() {
    const rows = await dbQuery(
      `
        SELECT
          s.id,
          s.trainer_id,
          s.session_time,
          s.status,
          s.capacity,
          s.price,
          s.created_at,
          u.first_name AS trainer_first_name,
          u.last_name  AS trainer_last_name
        FROM sessions s
        INNER JOIN users u ON u.id = s.trainer_id
        WHERE s.status = 'available'
          AND s.session_time > NOW()
        ORDER BY s.session_time ASC
      `,
    );

    return rows.map((row) => ({
      id: row.id,
      trainer_id: row.trainer_id,
      trainer_first_name: row.trainer_first_name,
      trainer_last_name: row.trainer_last_name,
      session_time: row.session_time,
      status: row.status,
      capacity: row.capacity,
      price: row.price,
      created_at: row.created_at,
    }));
  },

  async updateSessionById(sessionId, fields) {
    const setClauses = [];
    const values = [];

    if (fields.sessionTime !== undefined) {
      setClauses.push("session_time = ?");
      values.push(fields.sessionTime);
    }

    if (fields.status !== undefined) {
      setClauses.push("status = ?");
      values.push(fields.status);
    }

    if (fields.capacity !== undefined) {
      setClauses.push("capacity = ?");
      values.push(fields.capacity);
    }

    if (fields.price !== undefined) {
      setClauses.push("price = ?");
      values.push(fields.price);
    }

    if (setClauses.length === 0) {
      return this.findSessionById(sessionId);
    }

    values.push(sessionId);

    await dbQuery(`UPDATE sessions SET ${setClauses.join(", ")} WHERE id = ?`, values);

    return this.findSessionById(sessionId);
  },

  async deleteSessionById(sessionId) {
    await dbQuery(`DELETE FROM sessions WHERE id = ?`, [sessionId]);
  },

  async findAllSessions() {
    const rows = await dbQuery(
      `
        SELECT
          s.id,
          s.trainer_id,
          s.session_time,
          s.status,
          s.capacity,
          s.price,
          s.created_at,
          u.first_name AS trainer_first_name,
          u.last_name  AS trainer_last_name
        FROM sessions s
        INNER JOIN users u ON u.id = s.trainer_id
        ORDER BY s.session_time DESC
      `,
    );

    return rows.map((row) => ({
      id: row.id,
      trainer_id: row.trainer_id,
      trainer_first_name: row.trainer_first_name,
      trainer_last_name: row.trainer_last_name,
      session_time: row.session_time,
      status: row.status,
      capacity: row.capacity,
      price: row.price,
      created_at: row.created_at,
    }));
  },
};
