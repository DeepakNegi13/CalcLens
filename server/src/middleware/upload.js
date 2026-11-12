import multer from "multer";

const storage = multer.memoryStorage();

const allowedMimeTypes = ["image/png", "image/jpeg", "image/webp"];

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error("UNSUPPORTED_TYPE");
    error.code = "UNSUPPORTED_TYPE";
    cb(error, false);
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter,
});

