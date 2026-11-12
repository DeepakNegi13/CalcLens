import express from "express";
import cors from "cors";
import helmet from "helmet";
import { PORT, CLIENT_ORIGIN } from "./config/env.js";
import { apiLimiter } from "./middleware/rateLimit.js";
import { errorHandler } from "./middleware/errorHandler.js";

import healthRoutes from "./routes/health.routes.js";
import extractRoutes from "./routes/extract.routes.js";
import explainRoutes from "./routes/explain.routes.js";

const app = express();

// Security headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server) or matching CLIENT_ORIGIN
      if (!origin || origin === CLIENT_ORIGIN || CLIENT_ORIGIN === "*") {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// Rate limit API routes
app.use("/api", apiLimiter);

// API Routes
app.use("/api/health", healthRoutes);
app.use("/api/extract", extractRoutes);
app.use("/api/explain", explainRoutes);

// Error Handler
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`\n🚀 CalcLens Server running on http://localhost:${PORT}`);
  console.log(`📡 Allowed client origin: ${CLIENT_ORIGIN}\n`);
});

export default app;
