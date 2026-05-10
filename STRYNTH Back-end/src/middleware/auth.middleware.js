import jwt from "jsonwebtoken";

const buildAuthError = (message = "Unauthorized", statusCode = 401) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const authenticateToken = (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization || "";

    if (!authorizationHeader.startsWith("Bearer ")) {
      throw buildAuthError("Authorization token is required", 401);
    }

    const token = authorizationHeader.slice("Bearer ".length).trim();
    const secret = String(process.env.JWT_SECRET || "");

    if (!secret) {
      throw buildAuthError(
        "JWT_SECRET is missing. Add it to your .env file before using protected routes.",
        500,
      );
    }

    const decoded = jwt.verify(token, secret);
    const userId = Number(decoded?.id ?? decoded?.userId ?? decoded?.sub);

    if (!Number.isInteger(userId) || userId <= 0) {
      throw buildAuthError("Token payload is missing a valid user id", 401);
    }

    req.user = {
      ...decoded,
      id: userId,
      role: String(decoded?.role || "").toLowerCase(),
    };

    next();
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 401;
      error.message = "Invalid or expired token";
    }

    next(error);
  }
};

export const authorizeRoles = (...allowedRoles) => (req, res, next) => {
  const normalizedRoles = allowedRoles.map((role) => String(role).toLowerCase());
  const currentRole = String(req.user?.role || "").toLowerCase();

  if (!req.user?.id) {
    return next(buildAuthError("Authentication is required", 401));
  }

  if (!normalizedRoles.includes(currentRole)) {
    return next(buildAuthError("You do not have permission to access this resource", 403));
  }

  return next();
};

export const requireAdmin = authorizeRoles("admin");
export const requireTrainer = authorizeRoles("trainer");
export const requireTrainee = authorizeRoles("trainee", "member");
