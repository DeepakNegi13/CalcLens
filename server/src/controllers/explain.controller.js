import { explainSteps } from "../services/gemini.service.js";

export async function handleExplainSteps(req, res, next) {
  try {
    const { expression, variable, type, point, isDifferential } = req.body;

    if (!expression || typeof expression !== "string") {
      return res.status(400).json({
        ok: false,
        error: {
          code: "INVALID_INPUT",
          message: "An expression string is required.",
        },
      });
    }

    const steps = await explainSteps({
      expression,
      variable: variable || "x",
      type: type || "ordinary",
      point: point || null,
      isDifferential: Boolean(isDifferential),
    });

    return res.json({
      ok: true,
      data: {
        steps,
      },
    });
  } catch (error) {
    next(error);
  }
}

