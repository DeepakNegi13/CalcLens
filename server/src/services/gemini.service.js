import { GoogleGenAI } from "@google/genai";
import {
  GEMINI_API_KEY,
  GEMINI_MODEL,
  isApiKeyConfigured,
} from "../config/env.js";
import { EXTRACT_EQUATION_SYSTEM_PROMPT } from "../prompts/extractEquation.js";
import { EXPLAIN_STEPS_SYSTEM_PROMPT } from "../prompts/explainSteps.js";

let aiClient = null;

function getAiClient() {
  if (!isApiKeyConfigured()) {
    const error = new Error(
      "Gemini API key is not configured. Open server/.env and paste your GEMINI_API_KEY."
    );
    error.code = "KEY_NOT_CONFIGURED";
    error.status = 503;
    throw error;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  }
  return aiClient;
}

export async function extractFromImage({ buffer, mimeType }) {
  const ai = getAiClient();
  const base64Data = buffer.toString("base64");

  const imagePart = {
    inlineData: {
      data: base64Data,
      mimeType: mimeType,
    },
  };

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            imagePart,
            {
              text: "Extract the mathematical equation or differential equation from this image following the system instructions.",
            },
          ],
        },
      ],
      config: {
        systemInstruction: EXTRACT_EQUATION_SYSTEM_PROMPT,
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    const parsed = JSON.parse(text);

    if (parsed.error === "UNREADABLE") {
      const err = new Error(parsed.message || "Could not read an equation from this image.");
      err.code = "UNREADABLE";
      err.status = 422;
      throw err;
    }

    return parsed;
  } catch (error) {
    if (error.code === "UNREADABLE" || error.code === "KEY_NOT_CONFIGURED") {
      throw error;
    }
    console.error("Gemini Image Extraction Error:", error);
    const err = new Error(error.message || "Failed to extract equation from image");
    err.code = "GEMINI_FAILED";
    err.status = 502;
    throw err;
  }
}

export async function extractFromText({ text }) {
  const ai = getAiClient();

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Normalize and extract the math function or differential equation from this input: "${text}"`,
            },
          ],
        },
      ],
      config: {
        systemInstruction: EXTRACT_EQUATION_SYSTEM_PROMPT,
        responseMimeType: "application/json",
      },
    });

    const resText = response.text;
    const parsed = JSON.parse(resText);

    if (parsed.error === "UNREADABLE") {
      const err = new Error(parsed.message || "Could not parse equation from text.");
      err.code = "UNREADABLE";
      err.status = 422;
      throw err;
    }

    return parsed;
  } catch (error) {
    if (error.code === "UNREADABLE" || error.code === "KEY_NOT_CONFIGURED") {
      throw error;
    }
    console.error("Gemini Text Extraction Error:", error);
    const err = new Error(error.message || "Failed to normalize equation");
    err.code = "GEMINI_FAILED";
    err.status = 502;
    throw err;
  }
}

export async function explainSteps({ expression, variable = "x", type = "ordinary", point = null, isDifferential = false }) {
  const ai = getAiClient();

  const promptInput = {
    expression,
    variable,
    type: isDifferential ? "differential_equation" : type,
    point,
  };

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Explain step-by-step for: ${JSON.stringify(promptInput)}`,
            },
          ],
        },
      ],
      config: {
        systemInstruction: EXPLAIN_STEPS_SYSTEM_PROMPT,
        responseMimeType: "application/json",
      },
    });

    const resText = response.text;
    const parsed = JSON.parse(resText);
    return parsed.steps || [];
  } catch (error) {
    if (error.code === "KEY_NOT_CONFIGURED") {
      throw error;
    }
    console.error("Gemini Explain Steps Error:", error);
    const err = new Error(error.message || "Failed to generate explanation steps");
    err.code = "GEMINI_FAILED";
    err.status = 502;
    throw err;
  }
}
