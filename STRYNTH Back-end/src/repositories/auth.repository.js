import { dbQuery } from "../config/db.js";

const mapUser = (row) => {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    first_name: row.first_name,
    last_name: row.last_name,
    email: row.email,
    password_hash: row.password_hash,
    role: row.role,
    profile_image_url: row.profile_image_url ?? null,
    created_at: row.created_at,
  };
};

export const authRepository = {
  async findUserByEmail(email) {
    const rows = await dbQuery(
      `
        SELECT id, first_name, last_name, email, password_hash, role, profile_image_url, created_at
        FROM users
        WHERE LOWER(email) = LOWER(?)
        LIMIT 1
      `,
      [email],
    );

    return mapUser(rows[0]);
  },

  async findUserById(userId) {
    const rows = await dbQuery(
      `
        SELECT id, first_name, last_name, email, password_hash, role, profile_image_url, created_at
        FROM users
        WHERE id = ?
        LIMIT 1
      `,
      [userId],
    );

    return mapUser(rows[0]);
  },

  async createUser({ email, passwordHash, role, firstName, lastName }) {
    const result = await dbQuery(
      `
        INSERT INTO users (first_name, last_name, email, password_hash, role)
        VALUES (?, ?, ?, ?, ?)
      `,
      [firstName, lastName, email, passwordHash, role],
    );

    return this.findUserById(result.insertId);
  },

  async updateProfileImage(userId, profileImageUrl) {
    await dbQuery(
      `UPDATE users SET profile_image_url = ? WHERE id = ?`,
      [profileImageUrl, userId],
    );

    return this.findUserById(userId);
  },

  async findAllUsers() {
    const rows = await dbQuery(
      `
        SELECT id, first_name, last_name, email, role, profile_image_url, created_at
        FROM users
        ORDER BY created_at DESC
      `,
    );

    return rows.map(mapUser);
  },

  async updateUserById(userId, fields) {
    const setClauses = [];
    const values = [];

    if (fields.first_name !== undefined) {
      setClauses.push("first_name = ?");
      values.push(fields.first_name);
    }

    if (fields.last_name !== undefined) {
      setClauses.push("last_name = ?");
      values.push(fields.last_name);
    }

    if (fields.email !== undefined) {
      setClauses.push("email = ?");
      values.push(fields.email);
    }

    if (fields.role !== undefined) {
      setClauses.push("role = ?");
      values.push(fields.role);
    }

    if (setClauses.length === 0) return this.findUserById(userId);

    values.push(userId);
    await dbQuery(`UPDATE users SET ${setClauses.join(", ")} WHERE id = ?`, values);
    return this.findUserById(userId);
  },
};
