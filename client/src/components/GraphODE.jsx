import React, { useMemo, useState } from "react";
import Plot from "./PlotlyChart";
import { RotateCcw, Plus, Minus, Activity, ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme } from "next-themes";
import { sampleSlopeField, solveODE_RK4 } from "../lib/sampleFunction.js";
import { compute2DTangentLine } from "../lib/tangent.js";
import { Slider } from "@/components/ui/slider";

export default function GraphODE({
  expression = "x + y",
  evaluateFn = null,
  point = { x: 1.0, y: 1.0 },
  onChangePoint,
  slope = 2.0,
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
  const [showTrajectory, setShowTrajectory] = useState(true);

  // 1. Compute Slope Field (Multiple Slopes grid)
  const slopeFieldData = useMemo(() => {
    if (!evaluateFn || !showField) return null;
    return sampleSlopeField(evaluateFn, xRange, yRange, 18, 18);
  }, [evaluateFn, showField, xRange, yRange]);

  // 2. Compute Solution Trajectory through (x0, y0) using RK4
  const trajectoryData = useMemo(() => {
    if (!evaluateFn || !showTrajectory) return null;
    return solveODE_RK4(evaluateFn, point.x, point.y, xRange, 0.02);
  }, [evaluateFn, showTrajectory, point.x, point.y, xRange]);

  // 3. Compute Local Tangent at (x0, y0)
  const localTangent = useMemo(() => {
    return compute2DTangentLine(point.x, point.y, slope, xRange);
  }, [point.x, point.y, slope, xRange]);

  const traces = useMemo(() => {
    const list = [];

    // 1. Multiple Slope Segments (Direction Field)
    if (showField && slopeFieldData && slopeFieldData.linesX.length > 0) {
      list.push({
        x: slopeFieldData.linesX,
        y: slopeFieldData.linesY,
        type: "scatter",
        mode: "lines",
        name: "Slope Field (Multiple Slopes)",
        line: {
          color: isDark ? "rgba(148, 163, 184, 0.45)" : "rgba(100, 116, 139, 0.5)",
          width: 1.8,
        },
        hoverinfo: "none",
      });
    }

    // 2. Integral Solution Curve (RK4 Trajectory)
    if (showTrajectory && trajectoryData && trajectoryData.x.length > 0) {
      list.push({
        x: trajectoryData.x,
        y: trajectoryData.y,
        type: "scatter",
        mode: "lines",
        name: "Solution Trajectory y(x)",
        line: {
          color: isDark ? "#818cf8" : "#4f46e5",
          width: 3.5,
        },
        hoverinfo: "x+y",
        hovertemplate: "<b>x:</b> %{x:.2f}<br><b>y(x):</b> %{y:.2f}<extra></extra>",
      });
    }

    // 3. Local Tangent at (x0, y0)
    if (localTangent && localTangent.x.length > 0) {
      list.push({
        x: localTangent.x,
        y: localTangent.y,
        type: "scatter",
        mode: "lines",
        name: "Local Tangent",
        line: {
          color: "#f97316",
          width: 2.5,
          dash: "dash",
        },
        hoverinfo: "none",
      });
    }

    // 4. Initial Condition Point (x0, y0)
    list.push({
      x: [point.x],
      y: [point.y],
      type: "scatter",
      mode: "markers",
      name: "Initial Point (x₀, y₀)",
      marker: {
        color: "#f97316",
        size: 11,
        line: {
          color: "#ffffff",
          width: 2.5,
        },
      },
      hoverinfo: "text",
      text: [`P₀(${point.x.toFixed(2)}, ${point.y.toFixed(2)}) | dy/dx = ${slope.toFixed(2)}`],
    });

    return list;
  }, [showField, slopeFieldData, showTrajectory, trajectoryData, localTangent, point, slope, isDark]);

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
    scrollZoom: false,
    doubleClick: "reset",
  };

  const handleZoom = (factor) => {
    setZoomFactor((prev) => Math.max(0.2, Math.min(4.0, prev * factor)));
  };

  const handleReset = () => {
    setZoomFactor(1);
    onResetView?.();
  };

  const stepCoord = (axis, delta) => {
    if (!onChangePoint) return;
    const range = axis === "x" ? xRange : yRange;
    const nextVal = Math.min(range[1], Math.max(range[0], point[axis] + delta));
    onChangePoint({ ...point, [axis]: parseFloat(nextVal.toFixed(2)) });
  };

  return (
    <div className="flex-1 flex flex-col h-full max-h-full bg-card/40 backdrop-blur-md rounded-2xl border border-border/80 overflow-hidden shadow-xs">
      {/* Top Header bar */}
      <div className="h-11 px-4 border-b border-border/40 flex items-center justify-between text-xs font-mono bg-card/60 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slope shadow-xs" />
            <span className="font-semibold text-foreground">ODE Slope Field (Multiple Slopes)</span>
          </div>

          <button
            onClick={() => setShowField(!showField)}
            className={`px-2 py-0.5 rounded text-xs transition-colors ${
              showField
                ? "bg-primary/20 text-primary font-bold border border-primary/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Grid Slopes
          </button>

          <button
            onClick={() => setShowTrajectory(!showTrajectory)}
            className={`px-2 py-0.5 rounded text-xs transition-colors ${
              showTrajectory
                ? "bg-indigo-500/20 text-indigo-400 font-bold border border-indigo-500/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            RK4 Trajectory
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

      {/* Main Plot Area - STRICTLY CONSTRAINED WITH ABSOLUTE INSET-0 */}
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
        <div className="absolute top-3 right-3 px-3 py-1 rounded-lg bg-card/85 backdrop-blur-md border border-border/80 shadow-md font-mono text-xs flex items-center space-x-2 pointer-events-none z-10">
          <span className="w-2 h-2 rounded-full bg-slope animate-ping" />
          <span className="text-foreground font-medium">
            (x₀, y₀) = ({point.x.toFixed(2)}, {point.y.toFixed(2)}) · dy/dx ={" "}
            <span className="text-slope font-bold">
              {isNaN(slope) ? "undefined" : slope >= 0 ? `+${slope.toFixed(2)}` : slope.toFixed(2)}
            </span>
          </span>
        </div>
      </div>

      {/* Point scrubber under graph */}
      {onChangePoint && (
        <div className="p-3 bg-card/70 border-t border-border/40 shrink-0 font-mono text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            {/* X Slider */}
            <div className="flex items-center space-x-2">
              <span className="text-muted-foreground text-[11px] whitespace-nowrap w-8">x₀:</span>
              <button
                onClick={() => stepCoord("x", -0.1)}
                className="p-1 rounded bg-secondary hover:bg-muted text-muted-foreground"
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
              <Slider
                value={[point.x]}
                min={xRange[0]}
                max={xRange[1]}
                step={0.01}
                onValueChange={([val]) => onChangePoint({ ...point, x: val })}
                className="flex-1"
              />
              <button
                onClick={() => stepCoord("x", +0.1)}
                className="p-1 rounded bg-secondary hover:bg-muted text-muted-foreground"
              >
                <ChevronRight className="w-3 h-3" />
              </button>
              <span className="text-slope font-bold text-[11px] w-10 text-right">{point.x.toFixed(2)}</span>
            </div>

            {/* Y Slider */}
            <div className="flex items-center space-x-2">
              <span className="text-muted-foreground text-[11px] whitespace-nowrap w-8">y₀:</span>
              <button
                onClick={() => stepCoord("y", -0.1)}
                className="p-1 rounded bg-secondary hover:bg-muted text-muted-foreground"
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
              <Slider
                value={[point.y]}
                min={yRange[0]}
                max={yRange[1]}
                step={0.01}
                onValueChange={([val]) => onChangePoint({ ...point, y: val })}
                className="flex-1"
              />
              <button
                onClick={() => stepCoord("y", +0.1)}
                className="p-1 rounded bg-secondary hover:bg-muted text-muted-foreground"
              >
                <ChevronRight className="w-3 h-3" />
              </button>
              <span className="text-sky-400 font-bold text-[11px] w-10 text-right">{point.y.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Status bar */}
      <div className="h-9 px-4 border-t border-border/40 flex items-center justify-between text-[11px] font-mono text-muted-foreground bg-card/50 shrink-0">
        <div className="flex items-center space-x-3">
          <span className="text-emerald-500 font-medium">● Numerical Integrator: RK4 (h=0.02)</span>
          <span className="hidden sm:inline">Range: [{xRange[0].toFixed(1)}, {xRange[1].toFixed(1)}]</span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 rounded bg-slope/10 text-slope text-[10px] font-bold border border-slope/20">
            dy/dx = {isNaN(slope) ? "undefined" : slope.toFixed(3)}
          </span>
        </div>
      </div>
    </div>
  );
}
