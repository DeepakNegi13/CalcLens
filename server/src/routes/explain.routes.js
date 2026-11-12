import { Router } from "express";
import { handleExplainSteps } from "../controllers/explain.controller.js";

const router = Router();

router.post("/", handleExplainSteps);

export default router;

