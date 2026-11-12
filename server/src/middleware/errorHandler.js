export const errorHandler = (err, req, res, next) => {
  console.error("API Error:", err);

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      ok: false,
      error: {
        code: "FILE_TOO_LARGE",
        message: "Image must be under 5 MB.",
      },
    });
  }

  if (err.code === "UNSUPPORTED_TYPE" || err.message === "UNSUPPORTED_TYPE") {
    return res.status(415).json({
      ok: false,
      error: {
        code: "UNSUPPORTED_TYPE",
        message: "Only PNG, JPG, and WEBP images are supported.",
      },
    });
  }

  const statusCode = err.status || err.statusCode || 500;
  return res.status(statusCode).json({
    ok: false,
    error: {
      code: err.code || "SERVER_ERROR",
      message: err.message || "An unexpected error occurred.",
    },
  });
};

