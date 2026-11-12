import { useState, useMemo, useCallback, useEffect } from "react";
import { normalizeInput } from "../lib/normalizeInput.js";
import { parseExpression } from "../lib/parseExpression.js";
import { computeDerivative } from "../lib/derivatives.js";
import { sample2D, sample3D } from "../lib/sampleFunction.js";
import { compute2DTangentLine, compute3DTangents } from "../lib/tangent.js";
import { extractFromImage, extractFromText, explainSteps } from "../services/api.js";

export function useCalculus() {
  const [rawInput, setRawInput] = useState("x^3 - 3*x + 1");
  const [expression, setExpression] = useState("x^3 - 3*x + 1");
  const [latex, setLatex] = useState("x^3 - 3x + 1");
  const [isDifferential, setIsDifferential] = useState(false);
  const [mode, setMode] = useState("2d"); // "2d" | "3d" | "differential"
  const [derivativeMode, setDerivativeMode] = useState("ordinary"); // "ordinary" | "partial_x" | "partial_y"
  const [point, setPoint] = useState({ x: 1.5, y: 1.0 });
  const [xRange, setXRange] = useState([-5, 5]);
  const [yRange, setYRange] = useState([-5, 5]);
  const [toggles3D, setToggles3D] = useState({
    dfdx: true,
    dfdy: true,
    plane: true,
    wireframe: true,
  });

  const [status, setStatus] = useState("ready"); // "idle" | "loading" | "ready" | "error"
  const [error, setError] = useState(null);
  const [confidence, setConfidence] = useState(0.98);
  const [steps, setSteps] = useState([]);
  const [isLoadingSteps, setIsLoadingSteps] = useState(false);
  const [isFixingWithAI, setIsFixingWithAI] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // 1. Parse current normalized expression
  const parseResult = useMemo(() => {
    if (!expression) return null;
    return parseExpression(expression, isDifferential);
  }, [expression, isDifferential]);

  // 2. Compute derivatives (Symbolic with numerical fallback)
  const derivX = useMemo(() => {
    if (!parseResult?.success) return null;
    if (isDifferential) {
      return {
        latex: expression,
        isApproximate: false,
        evaluateAt: (scope) => parseResult.evaluate(scope),
      };
    }
    return computeDerivative(expression, "x", parseResult.evaluate);
  }, [expression, parseResult, isDifferential]);

  const derivY = useMemo(() => {
    if (!parseResult?.success || mode !== "3d" || isDifferential) return null;
    return computeDerivative(expression, "y", parseResult.evaluate);
  }, [expression, parseResult, mode, isDifferential]);

  // 3. Sample 2D curve data (only recomputes when expression or xRange changes)
  const curveData2D = useMemo(() => {
    if (!parseResult?.success || mode !== "2d" || isDifferential) return { x: [], y: [] };
    return sample2D(parseResult.evaluate, xRange[0], xRange[1], 400);
  }, [parseResult, mode, isDifferential, xRange]);

  // 4. Sample 3D surface data (cached, only recomputes when expression or range changes)
  const surfaceData3D = useMemo(() => {
    if (!parseResult?.success || mode !== "3d" || isDifferential) return { x: [], y: [], z: [] };
    return sample3D(parseResult.evaluate, xRange, yRange, 45);
  }, [parseResult, mode, isDifferential, xRange, yRange]);

  // 5. Compute point height/value
  const pointValue = useMemo(() => {
    if (!parseResult?.success) return NaN;
    if (isDifferential) return point.y;
    if (mode === "3d") {
      return parseResult.evaluate({ x: point.x, y: point.y });
    }
    return parseResult.evaluate({ x: point.x });
  }, [parseResult, point, mode, isDifferential]);

  // 6. Compute slopes at active point
  const slopeX = useMemo(() => {
    if (!parseResult?.success || !derivX) return NaN;
    if (isDifferential) {
      return parseResult.evaluate({ x: point.x, y: point.y });
    }
    if (mode === "3d") {
      return derivX.evaluateAt({ x: point.x, y: point.y });
    }
    return derivX.evaluateAt({ x: point.x });
  }, [parseResult, derivX, point, mode, isDifferential]);

  const slopeY = useMemo(() => {
    if (!parseResult?.success || !derivY || mode !== "3d" || isDifferential) return NaN;
    return derivY.evaluateAt({ x: point.x, y: point.y });
  }, [parseResult, derivY, point, mode, isDifferential]);

  // 7. Compute 2D Tangent Line
  const tangentLine2D = useMemo(() => {
    if (mode !== "2d" && !isDifferential) return null;
    const y0 = isDifferential ? point.y : pointValue;
    return compute2DTangentLine(point.x, y0, slopeX, xRange);
  }, [mode, isDifferential, point, pointValue, slopeX, xRange]);

  // 8. Compute 3D Tangents (lines & plane)
  const tangents3D = useMemo(() => {
    if (mode !== "3d" || isDifferential) return null;
    return compute3DTangents(point.x, point.y, pointValue, slopeX, slopeY, xRange, yRange);
  }, [mode, isDifferential, point, pointValue, slopeX, slopeY, xRange, yRange]);

  // Action: Visualize an input expression
  const visualize = useCallback((inputOverride = null) => {
    const textToProcess = inputOverride !== null ? inputOverride : rawInput;
    if (!textToProcess.trim()) {
      setStatus("error");
      setError({ code: "EMPTY", message: "Please enter a mathematical expression." });
      return;
    }

    const norm = normalizeInput(textToProcess);
    const parsed = parseExpression(norm.normalized, norm.isDifferential);

    if (!parsed.success) {
      setStatus("error");
      setError(parsed.error);
      return;
    }

    setExpression(norm.normalized);
    setIsDifferential(norm.isDifferential);
    setMode(parsed.mode);
    setDerivativeMode(norm.isDifferential ? "ordinary" : parsed.mode === "3d" ? "partial_x" : "ordinary");
    setError(null);
    setStatus("ready");
    setSteps([]); // Reset steps for new expression
  }, [rawInput]);

  // Action: Select preset
  const handleSelectPreset = useCallback((presetRaw, presetMode) => {
    setRawInput(presetRaw);
    const norm = normalizeInput(presetRaw);
    const parsed = parseExpression(norm.normalized, norm.isDifferential);

    if (parsed.success) {
      setExpression(norm.normalized);
      setIsDifferential(norm.isDifferential);
      setMode(parsed.mode);
      setDerivativeMode(norm.isDifferential ? "ordinary" : parsed.mode === "3d" ? "partial_x" : "ordinary");
      if (presetMode === "3d") {
        setPoint({ x: 1.2, y: 0.8 });
      } else {
        setPoint({ x: 1.5, y: 1.0 });
      }
      setError(null);
      setStatus("ready");
      setSteps([]);
    }
  }, []);

  // Action: Handle Image Upload & Gemini OCR
  const handleImageUpload = useCallback(async (file) => {
    setIsUploadingImage(true);
    setStatus("loading");
    setError(null);

    try {
      const data = await extractFromImage(file);
      if (data && data.expression) {
        setRawInput(data.expression);
        setLatex(data.latex || data.expression);
        setConfidence(data.confidence || 0.95);

        const norm = normalizeInput(data.expression);
        const isDiff = Boolean(data.isDifferential || norm.isDifferential);
        const parsed = parseExpression(norm.normalized, isDiff);

        if (parsed.success) {
          setExpression(norm.normalized);
          setIsDifferential(isDiff);
          setMode(parsed.mode);
          setDerivativeMode(
            isDiff
              ? "ordinary"
              : data.intent === "partial_y"
              ? "partial_y"
              : parsed.mode === "3d"
              ? "partial_x"
              : "ordinary"
          );
          setStatus("ready");
          setSteps([]);
        } else {
          setStatus("error");
          setError(parsed.error);
        }
      }
    } catch (err) {
      setStatus("error");
      setError({
        code: err.code || "EXTRACTION_FAILED",
        message: err.message || "Could not read equation from this image.",
      });
    } finally {
      setIsUploadingImage(false);
    }
  }, []);

  // Action: Fix with AI (Gemini text normalization)
  const handleFixWithAI = useCallback(async () => {
    if (!rawInput.trim()) return;
    setIsFixingWithAI(true);

    try {
      const data = await extractFromText(rawInput);
      if (data && data.expression) {
        setRawInput(data.expression);
        setLatex(data.latex || data.expression);
        setConfidence(data.confidence || 0.95);

        const norm = normalizeInput(data.expression);
        const isDiff = Boolean(data.isDifferential || norm.isDifferential);
        const parsed = parseExpression(norm.normalized, isDiff);

        if (parsed.success) {
          setExpression(norm.normalized);
          setIsDifferential(isDiff);
          setMode(parsed.mode);
          setError(null);
          setStatus("ready");
        }
      }
    } catch (err) {
      setError({
        code: err.code || "AI_FIX_FAILED",
        message: err.message || "AI was unable to normalize this equation.",
      });
    } finally {
      setIsFixingWithAI(false);
    }
  }, [rawInput]);

  // Action: Fetch Step-by-Step explanation with Gemini
  const handleFetchSteps = useCallback(async () => {
    if (!expression) return;
    setIsLoadingSteps(true);

    try {
      const resultSteps = await explainSteps({
        expression,
        variable: derivativeMode === "partial_y" ? "y" : "x",
        type: isDifferential ? "differential_equation" : mode === "3d" ? "partial" : "ordinary",
        point,
        isDifferential,
      });
      setSteps(resultSteps);
    } catch (err) {
      console.warn("Could not fetch AI steps:", err);
      // Fallback local pedagogical explanation steps
      if (isDifferential) {
        setSteps([
          { title: "SLOPE FIELD DEFINITION", desc: `The differential equation dy/dx = ${expression} determines the instantaneous direction at each point (x, y).` },
          { title: "EVALUATION AT INITIAL POINT", desc: `Substituting x = ${point.x.toFixed(2)}, y = ${point.y.toFixed(2)} gives slope m = ${slopeX.toFixed(3)}.` },
          { title: "TANGENT VECTOR", desc: `The local tangent vector is ⟨1, ${slopeX.toFixed(3)}⟩.` },
          { title: "NUMERICAL INTEGRATION", desc: `4th-order Runge-Kutta steps along these local vectors to construct the solution curve.` },
        ]);
      } else {
        setSteps([
          { title: "IDENTIFY FUNCTION", desc: `Target function: f(x) = ${expression}.` },
          { title: "APPLY DERIVATIVE RULES", desc: `Differentiate with respect to x using standard calculus rules (power rule, chain rule).` },
          { title: "ANALYTIC DERIVATIVE", desc: `f'(x) = ${derivX?.latex || "computed derivative"}.` },
          { title: "EVALUATE AT POINT", desc: `Substitute x = ${point.x.toFixed(2)} to get instantaneous tangent slope m = ${slopeX.toFixed(3)}.` },
        ]);
      }
    } finally {
      setIsLoadingSteps(false);
    }
  }, [expression, derivativeMode, mode, isDifferential, point, slopeX, derivX]);

  const handleToggle3D = useCallback((key, val) => {
    setToggles3D((prev) => ({ ...prev, [key]: val }));
  }, []);

  const handleResetView = useCallback(() => {
    if (mode === "3d") {
      setPoint({ x: 1.2, y: 0.8 });
    } else {
      setPoint({ x: 1.5, y: 1.0 });
    }
    setXRange([-5, 5]);
    setYRange([-5, 5]);
  }, [mode]);

  return {
    rawInput,
    setRawInput,
    expression,
    latex,
    isDifferential,
    mode,
    derivativeMode,
    setDerivativeMode,
    point,
    setPoint,
    pointValue,
    slopeX,
    slopeY,
    derivX,
    derivY,
    xRange,
    yRange,
    curveData2D,
    surfaceData3D,
    tangentLine2D,
    tangents3D,
    toggles3D,
    handleToggle3D,
    status,
    setStatus,
    error,
    confidence,
    steps,
    isLoadingSteps,
    isFixingWithAI,
    isUploadingImage,
    visualize,
    handleSelectPreset,
    handleImageUpload,
    handleFixWithAI,
    handleFetchSteps,
    handleResetView,
    evaluateFn: parseResult?.evaluate,
    derivFn: derivX?.evaluateAt,
  };
}
