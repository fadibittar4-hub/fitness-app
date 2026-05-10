export const buildError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const resolveAuthenticatedUserId = (user) => {
  const userId = Number(user?.id ?? user?.userId ?? user?.sub);

  if (!Number.isInteger(userId) || userId <= 0) {
    throw buildError("Authentication is required", 401);
  }

  return userId;
};

export const validatePositiveId = (value, label) => {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw buildError(`${label} must be a positive integer`);
  }

  return parsed;
};

export const assertTrainerRole = (user) => {
  if (String(user?.role || "").toLowerCase() !== "trainer") {
    throw buildError("Only trainers can perform this action", 403);
  }
};
