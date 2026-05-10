import { dbQuery } from "../config/db.js";

const mapTrainer = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    first_name: row.first_name,
    last_name: row.last_name,
    email: row.email,
    role: row.role,
    profile_image_url: row.profile_image_url ?? null,
    created_at: row.created_at,
    description: row.description ?? null,
    specialties: row.specialties ?? null,
    years_experience: row.years_experience ?? null,
  };
};

export const trainerRepository = {
  async findAllTrainers() {
    const rows = await dbQuery(
      `
        SELECT u.id, u.first_name, u.last_name, u.email, u.role,
               u.profile_image_url, u.created_at,
               tp.description, tp.specialties, tp.years_experience
        FROM users u
        LEFT JOIN trainer_profiles tp ON tp.user_id = u.id
        WHERE u.role = 'trainer'
        ORDER BY u.first_name, u.last_name
      `,
      [],
    );
    return rows.map(mapTrainer);
  },

  async findTrainerById(id) {
    const rows = await dbQuery(
      `
        SELECT u.id, u.first_name, u.last_name, u.email, u.role,
               u.profile_image_url, u.created_at,
               tp.description, tp.specialties, tp.years_experience
        FROM users u
        LEFT JOIN trainer_profiles tp ON tp.user_id = u.id
        WHERE u.id = ? AND u.role = 'trainer'
        LIMIT 1
      `,
      [id],
    );
    return mapTrainer(rows[0]);
  },

  async upsertTrainerProfile(userId, { description, specialties, years_experience }) {
    await dbQuery(
      `
        INSERT INTO trainer_profiles (user_id, description, specialties, years_experience)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          description      = VALUES(description),
          specialties      = VALUES(specialties),
          years_experience = VALUES(years_experience)
      `,
      [userId, description ?? null, specialties ?? null, years_experience ?? null],
    );
  },
};
