const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function extractFromImage(file) {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`${API_BASE}/api/extract`, {
    method: "POST",
    body: formData,
  });

  const json = await response.json();
  if (!response.ok || !json.ok) {
    const error = new Error(json.error?.message || "Failed to extract equation from image");
    error.code = json.error?.code || "EXTRACTION_FAILED";
    throw error;
  }

  return json.data;
}

export async function extractFromText(text) {
  const response = await fetch(`${API_BASE}/api/extract/text`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  const json = await response.json();
  if (!response.ok || !json.ok) {
    const error = new Error(json.error?.message || "Failed to parse equation with AI");
    error.code = json.error?.code || "EXTRACTION_FAILED";
    throw error;
  }

  return json.data;
}

export async function explainSteps({ expression, variable = "x", type = "ordinary", point = null, isDifferential = false }) {
  const response = await fetch(`${API_BASE}/api/explain`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ expression, variable, type, point, isDifferential }),
  });

  const json = await response.json();
  if (!response.ok || !json.ok) {
    const error = new Error(json.error?.message || "Failed to generate explanation steps");
    error.code = json.error?.code || "EXPLAIN_FAILED";
    throw error;
  }

  return json.data.steps;
}
