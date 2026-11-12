import React, { useMemo, useState, useRef, useEffect } from "react";
import Plot from "./PlotlyChart";
import { Download, RotateCcw, Plus, Minus, Play, Pause, ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";
import { useTheme } from "next-themes";
import { sampleMultipleSlopes } from "../lib/sampleFunction.js";
import { compute2DSecantLine } from "../lib/tangent.js";
import { Slider } from "@/components/ui/slider";

export default function Graph2D({
  curveData = { x: [], y: [] },
  tangentLine = { x: [], y: [], equation: "" },
  point = { x: 1.5, y: 1.0 },
  onChangePoint,
  pointValue = 0,
  slope = 0,
  expression = "",
  evaluateFn = null,
  derivFn = null,
  onResetView,
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Controlled zoom ranges so the graph never expands uncontrollably
  const [zoomFactor, setZoomFactor] = useState(1);
  const baseRange = 5;
  const currentRange = baseRange * zoomFactor;
  const xRange = useMemo(() => [-currentRange, currentRange], [currentRange]);
  const yRange = useMemo(() => [-currentRange, currentRange], [currentRange]);

  const [showSecant, setShowSecant] = useState(false);
  const [showMultiSlope, setShowMultiSlope] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const animRef = useRef(null);
  const dirRef = useRef(1);

  // Auto-trace animation
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

  // Compute secant line
  const secantData = useMemo(() => {
    if (!showSecant || !evaluateFn) return null;
    return compute2DSecantLine(evaluateFn, point.x, 0.5, xRange);
  }, [showSecant, evaluateFn, point.x, xRange]);

  // Compute multiple slopes along the curve (User requested feature!)
  const multiSlopeData = useMemo(() => {
    if (!showMultiSlope || !evaluateFn || !derivFn) return null;
    return sampleMultipleSlopes(evaluateFn, derivFn, xRange, 9, 0.8 * zoomFactor);
  }, [showMultiSlope, evaluateFn, derivFn, xRange, zoomFactor]);

  // Plotly traces
  const traces = useMemo(() => {
    const list = [];

    // 1. Function Curve f(x)
    list.push({
      x: curveData.x,
      y: curveData.y,
      type: "scatter",
      mode: "lines",
      name: "f(x)",
      line: {
        color: isDark ? "#818cf8" : "#4f46e5",
        width: 3.5,
        shape: "spline",
        smoothing: 1.1,
      },
      hoverinfo: "x+y",
      hovertemplate: "<b>x:</b> %{x:.2f}<br><b>f(x):</b> %{y:.2f}<extra></extra>",
    });

    // 2. Tangent Line T(x)
    if (tangentLine.x && tangentLine.x.length > 0) {
      list.push({
        x: tangentLine.x,
        y: tangentLine.y,
        type: "scatter",
        mode: "lines",
        name: "Tangent T(x)",
        line: {
          color: "#f97316",
          width: 2.5,
          dash: "dash",
        },
        hoverinfo: "none",
      });
    }

    // 3. Secant Line (if toggled)
    if (showSecant && secantData && secantData.x.length > 0) {
      list.push({
        x: secantData.x,
        y: secantData.y,
        type: "scatter",
        mode: "lines",
        name: "Secant (Δx=0.5)",
        line: {
          color: "#38bdf8",
          width: 2,
          dash: "dot",
        },
        hoverinfo: "none",
      });
    }

    // 4. Multiple Slopes along curve (if toggled)
    if (showMultiSlope && multiSlopeData && multiSlopeData.linesX.length > 0) {
      list.push({
        x: multiSlopeData.linesX,
        y: multiSlopeData.linesY,
        type: "scatter",
        mode: "lines",
        name: "Multi-Slopes",
        line: {
          color: isDark ? "#fb923c" : "#ea580c",
          width: 1.8,
        },
        hoverinfo: "none",
      });
    }

    // 5. Active Evaluation Point (P0)
    if (!isNaN(pointValue) && isFinite(pointValue)) {
      list.push({
        x: [point.x],
        y: [pointValue],
        type: "scatter",
        mode: "markers",
        name: "Point P₀",
        marker: {
          color: "#f97316",
          size: 11,
          line: {
            color: "#ffffff",
            width: 2.5,
          },
        },
        hoverinfo: "text",
        text: [`P₀(${point.x.toFixed(2)}, ${pointValue.toFixed(2)}) | slope = ${slope.toFixed(2)}`],
      });
    }

    return list;
  }, [
    curveData,
    tangentLine,
    point,
    pointValue,
    slope,
    isDark,
    showSecant,
    secantData,
    showMultiSlope,
    multiSlopeData,
  ]);

  const layout = useMemo(() => {
    return {
      autosize: true,
      margin: { l: 40, r: 20, t: 20, b: 30 },
      paper_bgcolor: "transparent",
      plot_bgcolor: "transparent",
      showlegend: false,
      dragmode: "pan", // Prevents runaway zoom box
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
        scaleratio: 1, // Keeps 1:1 proportional coordinate geometry
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
    scrollZoom: false, // PREVENTS uncontrollable mouse wheel zooming!
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

  return (
    <div className="flex-1 flex flex-col h-full max-h-full bg-card/40 backdrop-blur-md rounded-2xl border border-border/80 overflow-hidden shadow-xs">
      {/* Top Header / Legend bar */}
      <div className="h-11 px-4 border-b border-border/40 flex items-center justify-between text-xs font-mono bg-card/60 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span className="font-semibold text-foreground">f(x)</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slope" />
            <span className="font-semibold text-slope">Tangent T(x)</span>
          </div>

          <button
            onClick={() => setShowSecant(!showSecant)}
            className={`flex items-center space-x-1 px-2 py-0.5 rounded transition-colors ${
              showSecant
                ? "bg-sky-500/20 text-sky-400 font-bold border border-sky-500/40"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span>Secant</span>
          </button>

          {/* Multiple Slopes Toggle */}
          <button
            onClick={() => setShowMultiSlope(!showMultiSlope)}
            className={`flex items-center space-x-1 px-2 py-0.5 rounded transition-colors ${
              showMultiSlope
                ? "bg-orange-500/20 text-orange-400 font-bold border border-orange-500/40"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Toggle multiple slope segments along the curve"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Multi-Slopes</span>
          </button>
        </div>

        {/* Zoom & View Controls */}
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
            title="Reset to 1:1 Scale"
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

        {/* Floating Point Coordinates Tag */}
        {!isNaN(pointValue) && isFinite(pointValue) && (
          <div className="absolute top-3 right-3 px-3 py-1 rounded-lg bg-card/85 backdrop-blur-md border border-border/80 shadow-md font-mono text-xs flex items-center space-x-2 pointer-events-none z-10">
            <span className="w-2 h-2 rounded-full bg-slope animate-ping" />
            <span className="text-foreground font-medium">
              ({point.x.toFixed(2)}, {pointValue.toFixed(2)}) · m ={" "}
              <span className="text-slope font-bold">{slope >= 0 ? `+${slope.toFixed(2)}` : slope.toFixed(2)}</span>
            </span>
          </div>
        )}
      </div>

      {/* Active Coordinate Scrubber directly under the graph matching Stitch designs */}
      {onChangePoint && (
        <div className="p-3 bg-card/70 border-t border-border/40 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`p-1.5 rounded-lg border transition-all ${
                  isPlaying
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-secondary text-secondary-foreground border-border/50 hover:bg-muted"
                }`}
                title={isPlaying ? "Pause" : "Trace Curve"}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              </button>

              <div className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                ACTIVE COORDINATE{" "}
                <span className="text-foreground font-bold font-mono text-sm ml-1 px-1.5 py-0.5 rounded bg-secondary">
                  x = {point.x.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Slider with step buttons */}
            <div className="flex-1 flex items-center space-x-2 max-w-md mx-2">
              <button
                onClick={() => stepX(-0.1)}
                className="p-1 rounded bg-secondary hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-mono"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
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
                onClick={() => stepX(+0.1)}
                className="p-1 rounded bg-secondary hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-mono"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Slope summary tag */}
            <div className="font-mono text-xs flex items-center space-x-1 shrink-0 self-end sm:self-center">
              <span className="text-muted-foreground">Slope:</span>
              <span className="font-bold text-slope px-2 py-0.5 rounded bg-slope/10 border border-slope/20">
                {slope >= 0 ? `+${slope.toFixed(2)}` : slope.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Status strip */}
      <div className="h-9 px-4 border-t border-border/40 flex items-center justify-between text-[11px] font-mono text-muted-foreground bg-card/50 shrink-0">
        <div className="flex items-center space-x-3">
          <span className="text-emerald-500 font-medium">● 2D Mode Active</span>
          <span className="hidden sm:inline">Domain: [{xRange[0].toFixed(1)}, {xRange[1].toFixed(1)}]</span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[10px] text-muted-foreground">Drag to Pan · Double-click to Reset</span>
        </div>
      </div>
    </div>
  );
}
