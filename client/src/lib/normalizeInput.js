/**
 * Normalizes mathematical input string into math.js compatible syntax.
 * Also detects differential equation syntax (e.g. dy/dx = ..., y' = ...).
 */
export function normalizeInput(raw) {
  if (!raw || typeof raw !== "string") {
    return {
      normalized: "",
      isDifferential: false,
      lhs: "",
      rhs: "",
    };
  }

  let text = raw.trim();

  // Check if it's a differential equation (e.g., dy/dx = ..., y' = ...)
  let isDifferential = false;
  let lhs = "";
  let rhs = text;

  // Patterns for differential equations
  const diffMatch = text.match(/^(?:dy\s*\/\s*dx|y'|\\frac\{dy\}\{dx\}|\dot\{y\})\s*=\s*(.+)$/i);
  if (diffMatch) {
    isDifferential = true;
    lhs = "dy/dx";
    rhs = diffMatch[1];
  } else if (/dy\s*\/\s*dx|y'/i.test(text) && text.includes("=")) {
    // Other forms of diff equation like y' = ...
    const parts = text.split("=");
    if (/dy\s*\/\s*dx|y'/i.test(parts[0])) {
      isDifferential = true;
      lhs = "dy/dx";
      rhs = parts.slice(1).join("=");
    }
  }

  // If not differential, strip standard function prefixes like y =, z =, f(x) =, f(x,y) =
  if (!isDifferential) {
    rhs = rhs.replace(/^(?:y|z|f\s*\(\s*[a-z]\s*(?:,\s*[a-z]\s*)?\))\s*=\s*/i, "");
  }

  // Symbol transformations for math.js
  let normalized = rhs
    .replace(/[×·]/g, "*")
    .replace(/[÷]/g, "/")
    .replace(/²/g, "^2")
    .replace(/³/g, "^3")
    .replace(/⁴/g, "^4")
    .replace(/π/g, "pi")
    .replace(/√\s*\(/g, "sqrt(")
    .replace(/√\s*([a-zA-Z0-9]+)/g, "sqrt($1)")
    // math.js log is the natural log (ln)
    .replace(/\bln\s*\(/g, "log(")
    // handle implicit multiplication like 3x -> 3*x, 4(x) -> 4*(x), x y -> x*y
    .replace(/(\d+)([a-zA-Z(])/g, "$1*$2")
    .replace(/(\))([a-zA-Z0-9(])/g, "$1*$2")
    // replace e^x with exp(x) if appropriate, but math.js handles e^x fine
    .trim();

  return {
    raw,
    normalized,
    isDifferential,
    lhs: isDifferential ? "dy/dx" : "y",
    rhs: normalized,
  };
}
