import { sessionService } from "../services/session.service.js";

export const createSession = async (req, res, next) => {
  try {
    const session = await sessionService.createSession(req.body, req.user);

    res.status(201).json({
      success: true,
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

export const getTrainerSessions = async (req, res, next) => {
  try {
    const sessions = await sessionService.getTrainerSessions(req.user);

    res.status(200).json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    next(error);
  }
};

export const getAvailableSessions = async (req, res, next) => {
  try {
    const sessions = await sessionService.listAvailableSessions();

    res.status(200).json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSession = async (req, res, next) => {
  try {
    const session = await sessionService.updateSession(req.params.id, req.body, req.user);

    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSession = async (req, res, next) => {
  try {
    await sessionService.deleteSession(req.params.id, req.user);

    res.status(200).json({
      success: true,
      message: "Session deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
