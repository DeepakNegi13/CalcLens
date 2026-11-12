import { extractFromImage, extractFromText } from "../services/gemini.service.js";

export async function handleExtractImage(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        ok: false,
        error: {
          code: "NO_FILE",
          message: "No image file provided. Please upload an image.",
        },
      });
    }

    const result = await extractFromImage({
      buffer: req.file.buffer,
      mimeType: req.file.mimetype,
    });

    return res.json({
      ok: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleExtractText(req, res, next) {
  try {
    const { text } = req.body;
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({
        ok: false,
        error: {
          code: "INVALID_INPUT",
          message: "Please provide a valid text equation.",
        },
      });
    }

    if (text.length > 200) {
      return res.status(400).json({
        ok: false,
        error: {
          code: "TOO_LONG",
          message: "Equation text exceeds 200 characters.",
        },
      });
    }

    const result = await extractFromText({ text: text.trim() });

    return res.json({
      ok: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
