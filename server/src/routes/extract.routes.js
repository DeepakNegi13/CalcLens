import { Router } from "express";
import { upload } from "../middleware/upload.js";
import {
  handleExtractImage,
  handleExtractText,
} from "../controllers/extract.controller.js";

const router = Router();

router.post("/", upload.single("image"), handleExtractImage);
router.post("/text", handleExtractText);

export default router;
