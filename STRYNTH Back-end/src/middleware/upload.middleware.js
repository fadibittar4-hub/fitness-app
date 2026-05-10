import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const UPLOADS_DIR = path.join(__dirname, "../../uploads/profile-images");

// Ensure the uploads directory exists at module load time
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `user-${req.user.id}-${Date.now()}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    const err = new Error("Only JPEG, PNG, and WebP images are allowed");
    err.statusCode = 400;
    cb(err, false);
  }
};

const maxSizeBytes = () => (Number(process.env.UPLOAD_MAX_SIZE_MB) || 5) * 1024 * 1024;

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxSizeBytes() },
});

export const uploadSingleProfileImage = (req, res, next) => {
  upload.single("profile_image")(req, res, (err) => {
    if (!err) return next();

    if (err.code === "LIMIT_FILE_SIZE") {
      const maxMb = Number(process.env.UPLOAD_MAX_SIZE_MB) || 5;
      err.message = `Image must be smaller than ${maxMb}MB`;
      err.statusCode = 400;
    } else if (!err.statusCode) {
      err.statusCode = 400;
    }

    next(err);
  });
};
