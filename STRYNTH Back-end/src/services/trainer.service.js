import { trainerRepository } from "../repositories/trainer.repository.js";
import { buildError, validatePositiveId } from "../utils/serviceHelpers.js";

export const trainerService = {
  async listTrainers() {
    return trainerRepository.findAllTrainers();
  },

  async getTrainer(id) {
    const trainerId = validatePositiveId(id, "trainer id");
    const trainer = await trainerRepository.findTrainerById(trainerId);

    if (!trainer) {
      throw buildError("Trainer not found", 404);
    }

    return trainer;
  },

  async updateMyProfile(trainerId, data) {
    const { description, specialties, years_experience } = data;

    if (years_experience !== undefined && years_experience !== null) {
      const exp = Number(years_experience);
      if (!Number.isInteger(exp) || exp < 0) {
        throw buildError("years_experience must be a non-negative integer", 400);
      }
    }

    await trainerRepository.upsertTrainerProfile(trainerId, {
      description: description ?? null,
      specialties: specialties ?? null,
      years_experience: years_experience ?? null,
    });

    return trainerRepository.findTrainerById(trainerId);
  },
};
