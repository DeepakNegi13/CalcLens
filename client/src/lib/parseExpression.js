import * as math from "mathjs";

const CONSTANTS = new Set(["pi", "e", "tau", "i", "infinity", "nan"]);

/**
 * Parses expression, extracts free variables, compiles function.
 */
export function parseExpression(expressionString, isDifferential = false) {
  if (!expressionString || expressionString.trim() === "") {
    return {
      success: false,
      error: { code: "EMPTY", message: "Please enter an equation." },
    };
  }

  try {
    const node = math.parse(expressionString);

    // Collect all symbol nodes
    const foundSymbols = new Set();

    node.traverse((childNode, path) => {
      // Avoid function names (where path is 'fn')
      if (childNode.isSymbolNode && path !== "fn") {
        const name = childNode.name.toLowerCase();
        if (!CONSTANTS.has(name)) {
          foundSymbols.add(name);
        }
      }
    });

    let variables = Array.from(foundSymbols);

    // Prefer x before y, then alphabetical
    variables.sort((a, b) => {
      if (a === "x" && b === "y") return -1;
      if (a === "y" && b === "x") return 1;
      return a.localeCompare(b);
    });

    // Check variable count
    let mode = "2d";
    if (isDifferential) {
      mode = "differential";
      // Differential equations dy/dx = f(x, y) can have 1 or 2 variables (x, y)
      if (variables.length === 0) {
        variables = ["x"];
      } else if (variables.length > 2) {
        return {
          success: false,
          error: {
            code: "TOO_MANY_VARIABLES",
            message: "CalcLens supports differential equations with up to two variables (x and y).",
          },
        };
      }
    } else {
      if (variables.length === 0) {
        // Constant function, e.g. 5
        variables = ["x"];
        mode = "2d";
      } else if (variables.length === 1) {
        mode = "2d";
      } else if (variables.length === 2) {
        mode = "3d";
      } else {
        return {
          success: false,
          error: {
            code: "TOO_MANY_VARIABLES",
            message: "CalcLens supports functions of up to two variables (x and y).",
          },
        };
      }
    }

    const compiled = node.compile();

    return {
      success: true,
      node,
      compiled,
      variables,
      mode,
      isDifferential,
      evaluate: (scope) => {
        try {
          const val = compiled.evaluate(scope);
          if (typeof val === "object" && val && "re" in val) {
            // Complex number
            return Math.abs(val.im) < 1e-9 ? val.re : NaN;
          }
          return typeof val === "number" ? val : NaN;
        } catch {
          return NaN;
        }
      },
    };
  } catch (err) {
    return {
      success: false,
      error: {
        code: "PARSE_ERROR",
        message: err.message || "Invalid mathematical expression syntax.",
      },
    };
  }
}
