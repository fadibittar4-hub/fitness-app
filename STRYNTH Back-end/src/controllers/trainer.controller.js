import { trainerService } from "../services/trainer.service.js";

export const getTrainers = async (req, res, next) => {
  try {
    const trainers = await trainerService.listTrainers();

    res.status(200).json({
      success: true,
      data: trainers,
    });
  } catch (error) {
    next(error);
  }
};

export const getTrainerById = async (req, res, next) => {
  try {
    const trainer = await trainerService.getTrainer(req.params.id);

    res.status(200).json({
      success: true,
      data: trainer,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMyProfile = async (req, res, next) => {
  try {
    const { description, specialties, years_experience } = req.body;
    const updated = await trainerService.updateMyProfile(req.user.id, {
      description,
      specialties,
      years_experience,
    });

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};
