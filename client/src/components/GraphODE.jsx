import React, { useMemo, useState, useRef, useEffect } from "react";
import Plot from "./PlotlyChart";
import { RotateCcw, Plus, Minus, Play, Pause, ChevronLeft, ChevronRight, Layers, Sliders } from "lucide-react";
import { useTheme } from "next-themes";
import { sampleSlopeField, solveFamilyOfODE } from "../lib/sampleFunction.js";
import { compute2DTangentLine } from "../lib/tangent.js";
import { Slider } from "@/components/ui/slider";

export default function GraphODE({
  expression = "x + y",
  evaluateFn = null,
  point = { x: 1.0, y: 1.0 },
  onChangePoint,
  constantC = 1.0,
  onChangeConstantC,
  onResetView,
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [zoomFactor, setZoomFactor] = useState(1);
  const baseRange = 5;
  const currentRange = baseRange * zoomFactor;
  const xRange = useMemo(() => [-currentRange, currentRange], [currentRange]);
  const yRange = useMemo(() => [-currentRange, currentRange], [currentRange]);

  const [showField, setShowField] = useState(true);
  const [showFamily, setShowFamily] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const animRef = useRef(null);
  const dirRef = useRef(1);

  // Auto-trace animation along the curve
  useEffect(() => {
    if (!isPlaying) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }

    const step = 0.02;
    const animate = () => {
      onChangePoint?.((prev) => {
        let nextX = prev.x + step * dirRef.current;
        if (nextX >= xRange[1] * 0.9) {
          nextX = xRange[1] * 0.9;
          dirRef.current = -1;
        } else if (nextX <= xRange[0] * 0.9) {
          nextX = xRange[0] * 0.9;
          dirRef.current = 1;
        }
        return { ...prev, x: parseFloat(nextX.toFixed(2)) };
      });
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying, xRange, onChangePoint]);

  // 1. Solve ODE Family of Curves y(x; C) and compute point (x0, y(x0)) on active curve
  const odeFamily = useMemo(() => {
    return solveFamilyOfODE(evaluateFn, constantC, point.x, xRange, showFamily);
  }, [evaluateFn, constantC, point.x, xRange, showFamily]);

  const pointOnCurve = odeFamily.point;
  const slopeAtPoint = odeFamily.slope;

  // 2. Compute Local Tangent line at (x0, y(x0))
  const localTangent = useMemo(() => {
    return compute2DTangentLine(pointOnCurve.x, pointOnCurve.y, slopeAtPoint, xRange);
  }, [pointOnCurve, slopeAtPoint, xRange]);

  // 3. Compute Slope Field (Multiple Slopes grid)
  const slopeFieldData = useMemo(() => {
    if (!evaluateFn || !showField) return null;
    return sampleSlopeField(evaluateFn, xRange, yRange, 18, 18);
  }, [evaluateFn, showField, xRange, yRange]);

  // Construct Plotly Traces
  const traces = useMemo(() => {
    const list = [];

    // 1. Multiple Slope Segments (Direction Field)
    if (showField && slopeFieldData && slopeFieldData.linesX.length > 0) {
      list.push({
        x: slopeFieldData.linesX,
        y: slopeFieldData.linesY,
        type: "scatter",
        mode: "lines",
        name: "Slope Field (Direction Grid)",
        line: {
          color: isDark ? "rgba(148, 163, 184, 0.40)" : "rgba(100, 116, 139, 0.40)",
          width: 1.6,
        },
        hoverinfo: "none",
      });
    }

    // 2. Family of Integral Curves (C ± k)
    if (showFamily && odeFamily.familyCurves) {
      odeFamily.familyCurves.forEach((fc) => {
        list.push({
          x: fc.x,
          y: fc.y,
          type: "scatter",
          mode: "lines",
          name: `Family C=${fc.C}`,
          line: {
            color: isDark ? "rgba(99, 102, 241, 0.35)" : "rgba(79, 70, 229, 0.35)",
            width: 1.8,
            dash: "dot",
          },
          hoverinfo: "none",
        });
      });
    }

    // 3. Active Integral Curve y(x; C)
    if (odeFamily.activeCurve && odeFamily.activeCurve.x.length > 0) {
      list.push({
        x: odeFamily.activeCurve.x,
        y: odeFamily.activeCurve.y,
        type: "scatter",
        mode: "lines",
        name: `Active Curve (C=${constantC})`,
        line: {
          color: isDark ? "#818cf8" : "#4f46e5",
          width: 3.8,
        },
        hoverinfo: "x+y",
        hovertemplate: "<b>x:</b> %{x:.2f}<br><b>y(x):</b> %{y:.2f}<extra></extra>",
      });
    }

    // 4. Tangent Line T(x) at (x0, y(x0))
    if (localTangent && localTangent.x.length > 0) {
      list.push({
        x: localTangent.x,
        y: localTangent.y,
        type: "scatter",
        mode: "lines",
        name: "Tangent Slope Line",
        line: {
          color: "#f97316",
          width: 2.5,
          dash: "dash",
        },
        hoverinfo: "none",
      });
    }

    // 5. Active Point P0(x0, y(x0))
    if (!isNaN(pointOnCurve.y) && isFinite(pointOnCurve.y)) {
      list.push({
        x: [pointOnCurve.x],
        y: [pointOnCurve.y],
        type: "scatter",
        mode: "markers",
        name: "Point P₀(x, y)",
        marker: {
          color: "#f97316",
          size: 12,
          line: {
            color: "#ffffff",
            width: 2.5,
          },
        },
        hoverinfo: "text",
        text: [
          `P₀(${pointOnCurve.x.toFixed(2)}, ${pointOnCurve.y.toFixed(2)})<br>dy/dx: ${slopeAtPoint.toFixed(2)}<br>Constant C: ${constantC.toFixed(2)}`,
        ],
      });
    }

    return list;
  }, [showField, slopeFieldData, showFamily, odeFamily, constantC, localTangent, pointOnCurve, slopeAtPoint, isDark]);

  const layout = useMemo(() => {
    return {
      autosize: true,
      margin: { l: 40, r: 20, t: 20, b: 30 },
      paper_bgcolor: "transparent",
      plot_bgcolor: "transparent",
      showlegend: false,
      dragmode: "pan",
      xaxis: {
        range: xRange,
        gridcolor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.07)",
        zerolinecolor: isDark ? "rgba(255, 255, 255, 0.25)" : "rgba(0, 0, 0, 0.25)",
        zerolinewidth: 1.5,
        tickfont: {
          family: "JetBrains Mono, monospace",
          size: 11,
          color: isDark ? "#94a3b8" : "#64748b",
        },
      },
      yaxis: {
        range: yRange,
        scaleanchor: "x",
        scaleratio: 1,
        gridcolor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.07)",
        zerolinecolor: isDark ? "rgba(255, 255, 255, 0.25)" : "rgba(0, 0, 0, 0.25)",
        zerolinewidth: 1.5,
        tickfont: {
          family: "JetBrains Mono, monospace",
          size: 11,
          color: isDark ? "#94a3b8" : "#64748b",
        },
      },
      hoverlabel: {
        bgcolor: isDark ? "#1e293b" : "#ffffff",
        bordercolor: "#f97316",
        font: { family: "JetBrains Mono, monospace", size: 12 },
      },
    };
  }, [xRange, yRange, isDark]);

  const config = {
    responsive: true,
    displayModeBar: false,
    scrollZoom: false, // PREVENTS accidental wheel zoom
    doubleClick: "reset",
  };

  const handleZoom = (factor) => {
    setZoomFactor((prev) => Math.max(0.2, Math.min(4.0, prev * factor)));
  };

  const handleReset = () => {
    setZoomFactor(1);
    onResetView?.();
  };

  const stepX = (delta) => {
    if (!onChangePoint) return;
    const nextX = Math.min(xRange[1], Math.max(xRange[0], point.x + delta));
    onChangePoint({ ...point, x: parseFloat(nextX.toFixed(2)) });
  };

  const stepC = (delta) => {
    if (!onChangeConstantC) return;
    const nextC = Math.min(5, Math.max(-5, constantC + delta));
    onChangeConstantC(parseFloat(nextC.toFixed(2)));
  };

  return (
    <div className="flex-1 flex flex-col h-full max-h-full bg-card/40 backdrop-blur-md rounded-2xl border border-border/80 overflow-hidden shadow-xs">
      {/* Top Header bar */}
      <div className="h-11 px-4 border-b border-border/40 flex items-center justify-between text-xs font-mono bg-card/60 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span className="font-semibold text-foreground">Integral Curve y(x; C)</span>
          </div>

          <button
            onClick={() => setShowFamily(!showFamily)}
            className={`px-2 py-0.5 rounded text-xs transition-colors ${
              showFamily
                ? "bg-indigo-500/20 text-indigo-400 font-bold border border-indigo-500/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Toggle family of integral curves for C ± k"
          >
            Family Curves
          </button>

          <button
            onClick={() => setShowField(!showField)}
            className={`px-2 py-0.5 rounded text-xs transition-colors ${
              showField
                ? "bg-primary/20 text-primary font-bold border border-primary/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Toggle grid slope field"
          >
            Slope Field
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => handleZoom(0.8)}
            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Zoom In"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleZoom(1.25)}
            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Zoom Out"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleReset}
            className="px-2 py-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground text-[11px] font-mono transition-colors flex items-center gap-1"
            title="Reset View"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">1:1</span>
          </button>
        </div>
      </div>

      {/* Main Plot Area - STRICTLY CONSTRAINED */}
      <div className="relative flex-1 min-h-[260px] w-full overflow-hidden">
        <div className="absolute inset-0">
          <Plot
            data={traces}
            layout={layout}
            config={config}
            style={{ width: "100%", height: "100%" }}
            useResizeHandler={true}
          />
        </div>

        {/* Floating Point Badge */}
        {!isNaN(pointOnCurve.y) && isFinite(pointOnCurve.y) && (
          <div className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-card/85 backdrop-blur-md border border-border/80 shadow-md font-mono text-xs flex items-center space-x-2 pointer-events-none z-10">
            <span className="w-2 h-2 rounded-full bg-slope animate-ping" />
            <span className="text-foreground font-medium">
              ({pointOnCurve.x.toFixed(2)}, {pointOnCurve.y.toFixed(2)}) · dy/dx ={" "}
              <span className="text-slope font-bold">
                {isNaN(slopeAtPoint) ? "–" : slopeAtPoint >= 0 ? `+${slopeAtPoint.toFixed(2)}` : slopeAtPoint.toFixed(2)}
              </span>{" "}
              · <span className="text-indigo-400 font-bold">C = {constantC.toFixed(2)}</span>
            </span>
          </div>
        )}
      </div>

      {/* Interactive Controls Bar: Constant C & Variable x Scrubber */}
      <div className="p-3 bg-card/70 border-t border-border/40 shrink-0 font-mono text-xs space-y-2.5">
        {/* Row 1: Constant C Slider (Changes the entire curve) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span className="text-muted-foreground uppercase text-[11px] font-semibold whitespace-nowrap">
              Constant C:
            </span>
            <span className="text-indigo-400 font-bold text-xs px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
              C = {constantC >= 0 ? `+${constantC.toFixed(2)}` : constantC.toFixed(2)}
            </span>
          </div>

          <div className="flex-1 flex items-center space-x-2 max-w-md mx-2">
            <button
              onClick={() => stepC(-0.5)}
              className="p-1 rounded bg-secondary hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-mono"
              title="C - 0.5"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <Slider
              value={[constantC]}
              min={-5}
              max={5}
              step={0.05}
              onValueChange={([val]) => onChangeConstantC?.(val)}
              className="flex-1"
            />
            <button
              onClick={() => stepC(+0.5)}
              className="p-1 rounded bg-secondary hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-mono"
              title="C + 0.5"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <span className="text-[10px] text-muted-foreground hidden md:inline">
            Shifts solution curve y(x; C)
          </span>
        </div>

        {/* Row 2: Variable x Slider (Moves point along the curve, updating slope) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-border/30">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-1 rounded-md border transition-all ${
                isPlaying
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary text-secondary-foreground border-border/50 hover:bg-muted"
              }`}
              title={isPlaying ? "Pause" : "Trace along curve"}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            </button>

            <span className="w-2 h-2 rounded-full bg-slope" />
            <span className="text-muted-foreground uppercase text-[11px] font-semibold whitespace-nowrap">
              Variable x:
            </span>
            <span className="text-slope font-bold text-xs px-2 py-0.5 rounded bg-slope/10 border border-slope/20">
              x = {point.x.toFixed(2)}
            </span>
          </div>

          <div className="flex-1 flex items-center space-x-2 max-w-md mx-2">
            <button
              onClick={() => stepX(-0.1)}
              className="p-1 rounded bg-secondary hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-mono"
              title="x - 0.1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <Slider
              value={[point.x]}
              min={xRange[0]}
              max={xRange[1]}
              step={0.01}
              onValueChange={([val]) => onChangePoint?.({ ...point, x: val })}
              className="flex-1"
            />
            <button
              onClick={() => stepX(+0.1)}
              className="p-1 rounded bg-secondary hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-mono"
              title="x + 0.1"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center space-x-1 shrink-0 self-end sm:self-center">
            <span className="text-muted-foreground text-[11px]">Slope dy/dx:</span>
            <span className="font-bold text-slope px-2 py-0.5 rounded bg-slope/10 border border-slope/20">
              {isNaN(slopeAtPoint) ? "–" : slopeAtPoint >= 0 ? `+${slopeAtPoint.toFixed(2)}` : slopeAtPoint.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Status bar */}
      <div className="h-9 px-4 border-t border-border/40 flex items-center justify-between text-[11px] font-mono text-muted-foreground bg-card/50 shrink-0">
        <div className="flex items-center space-x-4">
          <span className="text-emerald-500 font-medium">● General Solution: y(x) = ∫ f(x, y) dx + C</span>
          <span className="hidden sm:inline">dy/dx at ({pointOnCurve.x.toFixed(2)}, {pointOnCurve.y.toFixed(2)}) = {slopeAtPoint.toFixed(2)}</span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 rounded bg-slope/10 text-slope text-[10px] font-bold border border-slope/20">
            Tangent Slope = {isNaN(slopeAtPoint) ? "–" : slopeAtPoint.toFixed(3)}
          </span>
        </div>
      </div>
    </div>
  );
}
