import rateLimit from "express-rate-limit";

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    error: {
      code: "RATE_LIMITED",
      message: "Too many requests. Please wait a moment and try again.",
    },
  },
});

