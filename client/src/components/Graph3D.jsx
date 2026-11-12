import React, { useMemo, useState } from "react";
import Plot from "./PlotlyChart";
import { RotateCcw, Plus, Minus, Eye, Layers } from "lucide-react";
import { useTheme } from "next-themes";
import { Slider } from "@/components/ui/slider";

export default function Graph3D({
  surfaceData = { x: [], y: [], z: [] },
  point = { x: 1.2, y: 0.8 },
  onChangePoint,
  pointValue = 0.8,
  slopeX = 2.4,
  slopeY = -1.6,
  tangents3D = null,
  toggles = { dfdx: true, dfdy: true, plane: true, wireframe: true },
  xRange = [-5, 5],
  yRange = [-5, 5],
  onResetView,
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Controlled camera angles
  const [orbitAngle, setOrbitAngle] = useState(45);
  const [tiltAngle, setTiltAngle] = useState(35);
  const [zoomDistance, setZoomDistance] = useState(2.1);

  // Compute camera eye position from spherical coordinates
  const cameraSettings = useMemo(() => {
    const radOrbit = (orbitAngle * Math.PI) / 180;
    const radTilt = (tiltAngle * Math.PI) / 180;

    const x = zoomDistance * Math.cos(radOrbit) * Math.cos(radTilt);
    const y = zoomDistance * Math.sin(radOrbit) * Math.cos(radTilt);
    const z = zoomDistance * Math.sin(radTilt);

    return {
      eye: { x, y, z },
      up: { x: 0, y: 0, z: 1 },
      center: { x: 0, y: 0, z: 0 },
    };
  }, [orbitAngle, tiltAngle, zoomDistance]);

  const setPreset = (preset) => {
    if (preset === "isometric") {
      setOrbitAngle(45);
      setTiltAngle(35);
      setZoomDistance(2.1);
    } else if (preset === "top") {
      setOrbitAngle(90);
      setTiltAngle(89.5);
      setZoomDistance(2.2);
    } else if (preset === "front") {
      setOrbitAngle(270);
      setTiltAngle(10);
      setZoomDistance(2.2);
    }
  };

  // Construct 3D Plotly Traces
  const traces = useMemo(() => {
    const list = [];

    // 1. Surface z = f(x, y)
    if (surfaceData.z && surfaceData.z.length > 0) {
      list.push({
        type: "surface",
        x: surfaceData.x,
        y: surfaceData.y,
        z: surfaceData.z,
        name: "Surface f(x,y)",
        colorscale: [
          [0, isDark ? "#1e1b4b" : "#e0e7ff"],
          [0.25, isDark ? "#312e81" : "#818cf8"],
          [0.5, isDark ? "#4338ca" : "#6366f1"],
          [0.75, isDark ? "#0284c7" : "#38bdf8"],
          [1, isDark ? "#38bdf8" : "#0284c7"],
        ],
        showscale: false,
        opacity: 0.88,
        contours: {
          x: { show: toggles.wireframe, color: isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.15)", width: 1 },
          y: { show: toggles.wireframe, color: isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.15)", width: 1 },
          z: { show: false },
        },
        hoverinfo: "x+y+z",
      });
    }

    // 2. Tangent Plane (semi-transparent)
    if (toggles.plane && tangents3D?.plane) {
      list.push({
        type: "surface",
        x: tangents3D.plane.x,
        y: tangents3D.plane.y,
        z: tangents3D.plane.z,
        name: "Tangent Plane",
        showscale: false,
        opacity: 0.38,
        colorscale: [
          [0, "#f97316"],
          [1, "#f97316"],
        ],
        hoverinfo: "none",
      });
    }

    // 3. ∂f/∂x line (orange)
    if (toggles.dfdx && tangents3D?.lineX) {
      list.push({
        type: "scatter3d",
        mode: "lines",
        x: tangents3D.lineX.x,
        y: tangents3D.lineX.y,
        z: tangents3D.lineX.z,
        name: "∂f/∂x vector",
        line: {
          color: "#f97316",
          width: 6,
        },
        hoverinfo: "none",
      });
    }

    // 4. ∂f/∂y line (sky blue)
    if (toggles.dfdy && tangents3D?.lineY) {
      list.push({
        type: "scatter3d",
        mode: "lines",
        x: tangents3D.lineY.x,
        y: tangents3D.lineY.y,
        z: tangents3D.lineY.z,
        name: "∂f/∂y vector",
        line: {
          color: "#38bdf8",
          width: 6,
        },
        hoverinfo: "none",
      });
    }

    // 5. Point P0 on Surface
    if (!isNaN(pointValue) && isFinite(pointValue)) {
      list.push({
        type: "scatter3d",
        mode: "markers",
        x: [point.x],
        y: [point.y],
        z: [pointValue],
        name: "Point P₀",
        marker: {
          color: "#f97316",
          size: 7,
          line: {
            color: "#ffffff",
            width: 2,
          },
        },
        hoverinfo: "text",
        text: [
          `P₀(${point.x.toFixed(2)}, ${point.y.toFixed(2)}, ${pointValue.toFixed(2)})<br>∂f/∂x: ${slopeX.toFixed(2)}<br>∂f/∂y: ${slopeY.toFixed(2)}`,
        ],
      });
    }

    return list;
  }, [surfaceData, tangents3D, point, pointValue, slopeX, slopeY, toggles, isDark]);

  const layout = useMemo(() => {
    return {
      autosize: true,
      margin: { l: 0, r: 0, t: 0, b: 0 },
      paper_bgcolor: "transparent",
      scene: {
        camera: cameraSettings,
        aspectmode: "manual",
        aspectratio: { x: 1, y: 1, z: 0.7 }, // Keeps 3D volume strictly contained
        xaxis: {
          title: "X",
          range: xRange,
          gridcolor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
          backgroundcolor: "transparent",
          showbackground: false,
          tickfont: { family: "JetBrains Mono", size: 10, color: isDark ? "#94a3b8" : "#64748b" },
        },
        yaxis: {
          title: "Y",
          range: yRange,
          gridcolor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
          backgroundcolor: "transparent",
          showbackground: false,
          tickfont: { family: "JetBrains Mono", size: 10, color: isDark ? "#94a3b8" : "#64748b" },
        },
        zaxis: {
          title: "Z",
          gridcolor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
          backgroundcolor: "transparent",
          showbackground: false,
          tickfont: { family: "JetBrains Mono", size: 10, color: isDark ? "#94a3b8" : "#64748b" },
        },
      },
      showlegend: false,
    };
  }, [cameraSettings, xRange, yRange, isDark]);

  const config = {
    responsive: true,
    displayModeBar: false,
    scrollZoom: false, // PREVENTS runaway scroll zoom!
  };

  return (
    <div className="flex-1 flex flex-col h-full max-h-full bg-card/40 backdrop-blur-md rounded-2xl border border-border/80 overflow-hidden shadow-xs">
      {/* Top Header / Camera presets bar */}
      <div className="h-11 px-4 border-b border-border/40 flex items-center justify-between text-xs font-mono bg-card/60 shrink-0">
        <div className="flex items-center space-x-2">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span>ℝ³ Projection: Isocline 45°</span>
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
            FPS: 60.0
          </span>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => setPreset("isometric")}
            className="px-2.5 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            Isometric
          </button>
          <button
            onClick={() => setPreset("top")}
            className="px-2.5 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            Top [x-y]
          </button>
          <button
            onClick={() => setPreset("front")}
            className="px-2.5 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            Front [x-z]
          </button>

          {/* Zoom controls */}
          <button
            onClick={() => setZoomDistance((prev) => Math.max(1.2, prev * 0.85))}
            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors ml-1"
            title="Zoom In"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomDistance((prev) => Math.min(4.0, prev * 1.15))}
            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Zoom Out"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setPreset("isometric");
              onResetView?.();
            }}
            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Reset View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main 3D Plot Area - STRICTLY BOUNDED WITH ABSOLUTE INSET-0 */}
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

        {/* Floating Point 3D Badge */}
        {!isNaN(pointValue) && isFinite(pointValue) && (
          <div className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-card/85 backdrop-blur-md border border-border/80 shadow-md font-mono text-xs space-y-0.5 pointer-events-none z-10">
            <div className="flex items-center space-x-1.5 text-foreground font-semibold">
              <span className="w-2 h-2 rounded-full bg-slope animate-ping" />
              <span>P₀({point.x.toFixed(2)}, {point.y.toFixed(2)}, {pointValue.toFixed(2)})</span>
            </div>
            <div className="text-[10px] text-muted-foreground">
              ∇f = ({slopeX >= 0 ? `+${slopeX.toFixed(2)}` : slopeX.toFixed(2)}, {slopeY >= 0 ? `+${slopeY.toFixed(2)}` : slopeY.toFixed(2)})
            </div>
          </div>
        )}
      </div>

      {/* Orbit & Tilt Camera Sliders Bar directly under 3D graph (matching Stitch screenshot) */}
      <div className="p-2.5 bg-card/70 border-t border-border/40 shrink-0 font-mono text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
          <div className="flex items-center space-x-2">
            <span className="text-muted-foreground text-[11px] whitespace-nowrap w-12">Orbit:</span>
            <Slider
              value={[orbitAngle]}
              min={0}
              max={360}
              step={1}
              onValueChange={([val]) => setOrbitAngle(val)}
              className="flex-1"
            />
            <span className="text-[11px] text-foreground w-8 text-right font-bold">{orbitAngle}°</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-muted-foreground text-[11px] whitespace-nowrap w-12">Tilt:</span>
            <Slider
              value={[tiltAngle]}
              min={-60}
              max={85}
              step={1}
              onValueChange={([val]) => setTiltAngle(val)}
              className="flex-1"
            />
            <span className="text-[11px] text-foreground w-8 text-right font-bold">{tiltAngle}°</span>
          </div>
        </div>
      </div>

      {/* Bottom Status bar */}
      <div className="h-9 px-4 border-t border-border/40 flex items-center justify-between text-[11px] font-mono text-muted-foreground bg-card/50 shrink-0">
        <div className="flex items-center space-x-3">
          <span className="flex items-center gap-1.5">
            <span className="text-red-400 font-bold">+X</span>
            <span className="text-emerald-400 font-bold">+Y</span>
            <span className="text-sky-400 font-bold">+Z</span>
          </span>
          <span className="hidden sm:inline">Use Orbit & Tilt sliders or Drag to rotate</span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 rounded bg-slope/10 text-slope text-[10px] font-bold border border-slope/20">
            ∂f/∂x: {slopeX.toFixed(2)}
          </span>
          <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 text-[10px] font-bold border border-sky-500/20">
            ∂f/∂y: {slopeY.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
