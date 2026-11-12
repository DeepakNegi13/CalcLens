import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT || 5000;
export const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export const isApiKeyConfigured = () => {
  return (
    GEMINI_API_KEY &&
    GEMINI_API_KEY !== "PASTE_YOUR_KEY_HERE" &&
    GEMINI_API_KEY.trim().length > 0
  );
};

if (!isApiKeyConfigured()) {
  console.warn("\n========================================================");
  console.warn("⚠️  ATTENTION: Open server/.env and paste your Gemini API key.");
  console.warn("   (Extraction and AI steps require GEMINI_API_KEY)");
  console.warn("========================================================\n");
}
