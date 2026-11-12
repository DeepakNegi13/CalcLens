import * as math from "mathjs";

/**
 * Computes symbolic derivative with central difference fallback.
 */
export function computeDerivative(expressionString, variable = "x", evaluateFn = null) {
  if (!expressionString) {
    return {
      latex: "",
      node: null,
      compiled: null,
      isApproximate: false,
      evaluateAt: () => NaN,
    };
  }

  try {
    const derivNode = math.derivative(expressionString, variable);
    const compiled = derivNode.compile();
    const latex = derivNode.toTex({ parenthesis: "auto" });

    return {
      latex,
      node: derivNode,
      compiled,
      isApproximate: false,
      evaluateAt: (scope) => {
        try {
          const val = compiled.evaluate(scope);
          if (typeof val === "object" && val && "re" in val) {
            return Math.abs(val.im) < 1e-9 ? val.re : NaN;
          }
          return typeof val === "number" ? val : NaN;
        } catch {
          // Fall back to central difference if evaluation errors
          return numericalDerivative(evaluateFn, scope, variable);
        }
      },
    };
  } catch (err) {
    // Symbolic differentiation failed, fallback to numerical
    return {
      latex: `\\frac{d}{d${variable}} \\left( ${expressionString} \\right)`,
      node: null,
      compiled: null,
      isApproximate: true,
      evaluateAt: (scope) => numericalDerivative(evaluateFn, scope, variable),
    };
  }
}

/**
 * Central difference numerical derivative approximation.
 * (f(a + h) - f(a - h)) / (2h)
 */
export function numericalDerivative(evaluateFn, scope, variable = "x", h = 1e-5) {
  if (!evaluateFn) return NaN;

  const currentVal = scope[variable] ?? 0;
  const scopePlus = { ...scope, [variable]: currentVal + h };
  const scopeMinus = { ...scope, [variable]: currentVal - h };

  const fPlus = evaluateFn(scopePlus);
  const fMinus = evaluateFn(scopeMinus);

  if (isNaN(fPlus) || isNaN(fMinus) || !isFinite(fPlus) || !isFinite(fMinus)) {
    return NaN;
  }

  return (fPlus - fMinus) / (2 * h);
}
