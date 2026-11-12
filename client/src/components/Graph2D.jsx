import React, { useMemo, useState } from "react";
import Plot from "./PlotlyChart";
import { Download, RotateCcw, Plus, Minus, Layers, TrendingUp } from "lucide-react";
import { useTheme } from "next-themes";
import { sampleMultipleSlopes } from "../lib/sampleFunction.js";
import { compute2DSecantLine } from "../lib/tangent.js";

export default function Graph2D({
  curveData = { x: [], y: [] },
  tangentLine = { x: [], y: [], equation: "" },
  point = { x: 1.5, y: 1.0 },
  pointValue = 0,
  slope = 0,
  expression = "",
  evaluateFn = null,
  derivFn = null,
  xRange = [-5, 5],
  yRange = [-5, 5],
  onResetView,
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [showSecant, setShowSecant] = useState(false);
  const [showMultiSlope, setShowMultiSlope] = useState(false);

  // Compute secant line
  const secantData = useMemo(() => {
    if (!showSecant || !evaluateFn) return null;
    return compute2DSecantLine(evaluateFn, point.x, 0.5, xRange);
  }, [showSecant, evaluateFn, point.x, xRange]);

  // Compute multiple slopes along the curve (User requested feature!)
  const multiSlopeData = useMemo(() => {
    if (!showMultiSlope || !evaluateFn || !derivFn) return null;
    return sampleMultipleSlopes(evaluateFn, derivFn, xRange, 9, 0.8);
  }, [showMultiSlope, evaluateFn, derivFn, xRange]);

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
      margin: { l: 45, r: 25, t: 20, b: 35 },
      paper_bgcolor: "transparent",
      plot_bgcolor: "transparent",
      showlegend: false,
      xaxis: {
        range: xRange,
        gridcolor: isDark ? "rgba(255, 255, 255, 0.07)" : "rgba(0, 0, 0, 0.07)",
        zerolinecolor: isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)",
        zerolinewidth: 1.5,
        tickfont: {
          family: "JetBrains Mono, monospace",
          size: 11,
          color: isDark ? "#94a3b8" : "#64748b",
        },
      },
      yaxis: {
        range: yRange,
        gridcolor: isDark ? "rgba(255, 255, 255, 0.07)" : "rgba(0, 0, 0, 0.07)",
        zerolinecolor: isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)",
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
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-card/40 backdrop-blur-md rounded-2xl border border-border/80 overflow-hidden relative shadow-xs">
      {/* Top Header / Legend bar */}
      <div className="h-11 px-4 border-b border-border/40 flex items-center justify-between text-xs font-mono bg-card/60">
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
            <TrendingUp className="w-3 h-3" />
            <span>Multiple Slopes</span>
          </button>
        </div>

        {/* Right Toolbar */}
        <div className="flex items-center space-x-1">
          <button
            onClick={onResetView}
            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Reset View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Plot Area */}
      <div className="flex-1 w-full min-h-[350px] relative">
        <Plot
          data={traces}
          layout={layout}
          config={config}
          style={{ width: "100%", height: "100%" }}
          useResizeHandler={true}
        />

        {/* Floating Point Badge */}
        {!isNaN(pointValue) && isFinite(pointValue) && (
          <div className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-card/80 backdrop-blur-md border border-border/80 shadow-md font-mono text-xs flex items-center space-x-2 pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-slope animate-ping" />
            <span className="text-foreground font-medium">
              x: {point.x.toFixed(2)} | f(x): {pointValue.toFixed(2)} | m:{" "}
              <span className="text-slope font-bold">{slope >= 0 ? `+${slope.toFixed(2)}` : slope.toFixed(2)}</span>
            </span>
          </div>
        )}
      </div>

      {/* Bottom Status bar */}
      <div className="h-10 px-4 border-t border-border/40 flex items-center justify-between text-[11px] font-mono text-muted-foreground bg-card/50">
        <div className="flex items-center space-x-4">
          <span className="text-emerald-500 font-medium">● Instantaneous Slope active</span>
          <span className="hidden sm:inline">Range: [{xRange[0]}, {xRange[1]}]</span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[10px] px-2 py-0.5 rounded bg-slope/10 text-slope border border-slope/20 font-bold">
            m = {isNaN(slope) ? "undefined" : slope.toFixed(3)}
          </span>
        </div>
      </div>
    </div>
  );
}
