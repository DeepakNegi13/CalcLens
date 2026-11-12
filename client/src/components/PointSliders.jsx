import React, { useEffect, useRef, useState } from "react";
import { Play, Pause, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { Slider } from "@/components/ui/slider";

export default function PointSliders({
  mode = "2d",
  point = { x: 1.5, y: 1.0 },
  onChangePoint,
  xRange = [-5, 5],
  yRange = [-5, 5],
  isDifferential = false,
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const animRef = useRef(null);
  const directionRef = useRef(1);

  const is3D = mode === "3d" && !isDifferential;

  // Auto-scrubbing animation
  useEffect(() => {
    if (!isPlaying) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }

    const stepSize = 0.02;
    const animate = () => {
      onChangePoint((prev) => {
        let nextX = prev.x + stepSize * directionRef.current;
        if (nextX >= xRange[1]) {
          nextX = xRange[1];
          directionRef.current = -1;
        } else if (nextX <= xRange[0]) {
          nextX = xRange[0];
          directionRef.current = 1;
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

  const stepX = (delta) => {
    const nextX = Math.min(xRange[1], Math.max(xRange[0], point.x + delta));
    onChangePoint({ ...point, x: parseFloat(nextX.toFixed(2)) });
  };

  const stepY = (delta) => {
    const nextY = Math.min(yRange[1], Math.max(yRange[0], point.y + delta));
    onChangePoint({ ...point, y: parseFloat(nextY.toFixed(2)) });
  };

  return (
    <div className="rounded-xl border border-border/80 bg-card/60 backdrop-blur-xs p-4 space-y-4 shadow-xs">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slope shadow-sm shadow-orange-500/50" />
          <span className="font-mono text-muted-foreground uppercase tracking-wider text-[11px] font-semibold">
            Point Scrubbing
          </span>
        </div>

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`flex items-center space-x-1 px-2.5 py-1 text-xs font-mono rounded-md border transition-all ${
            isPlaying
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-secondary text-secondary-foreground border-border/60 hover:border-primary/40"
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-3 h-3" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-3 h-3 fill-current" />
              <span>Trace Curve</span>
            </>
          )}
        </button>
      </div>

      {/* Coordinate X Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-muted-foreground flex items-center gap-1">
            <span>Coordinate x₀</span>
          </span>
          <span className="font-bold text-slope px-2 py-0.5 rounded-md bg-slope/10 border border-slope/20">
            x = {point.x.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => stepX(-0.1)}
            className="p-1 rounded-md bg-secondary text-secondary-foreground hover:bg-muted border border-border/40 text-xs font-mono"
            title="Step -0.1"
          >
            -0.1
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
            className="p-1 rounded-md bg-secondary text-secondary-foreground hover:bg-muted border border-border/40 text-xs font-mono"
            title="Step +0.1"
          >
            +0.1
          </button>
        </div>
      </div>

      {/* Coordinate Y Slider (3D or 2-variable ODE) */}
      {(is3D || isDifferential) && (
        <div className="space-y-2 pt-2 border-t border-border/40">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-muted-foreground flex items-center gap-1">
              <span>Coordinate y₀</span>
            </span>
            <span className="font-bold text-sky-500 px-2 py-0.5 rounded-md bg-sky-500/10 border border-sky-500/20">
              y = {point.y.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => stepY(-0.1)}
              className="p-1 rounded-md bg-secondary text-secondary-foreground hover:bg-muted border border-border/40 text-xs font-mono"
              title="Step -0.1"
            >
              -0.1
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
              onClick={() => stepY(+0.1)}
              className="p-1 rounded-md bg-secondary text-secondary-foreground hover:bg-muted border border-border/40 text-xs font-mono"
              title="Step +0.1"
            >
              +0.1
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
