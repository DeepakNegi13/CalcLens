import React from "react";
import { CheckCircle2, TrendingUp, Compass, Layers } from "lucide-react";
import MathDisplay from "./MathDisplay";
import { Badge } from "@/components/ui/badge";

export default function ResultCards({
  mode = "2d",
  expression = "",
  derivX = null,
  derivY = null,
  point = { x: 1.5, y: 1.0 },
  pointValue = 0,
  slopeX = 0,
  slopeY = 0,
  tangentLine2D = null,
  tangents3D = null,
  isDifferential = false,
  isApproximate = false,
}) {
  const is3D = mode === "3d" && !isDifferential;

  if (isDifferential) {
    return (
      <div className="space-y-3">
        {/* Differential Equation Slope Card */}
        <div className="rounded-xl border border-border/80 bg-card/60 backdrop-blur-xs p-4 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-muted-foreground uppercase tracking-wider text-[11px] font-semibold">
              Differential Equation (ODE)
            </span>
            <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
              1st Order
            </Badge>
          </div>

          <div className="p-2.5 rounded-lg bg-background/50 border border-border/40">
            <MathDisplay
              math={`\\frac{dy}{dx} = ${expression}`}
              className="text-base font-semibold"
            />
          </div>
        </div>

        {/* Instantaneous Slope at (x0, y0) */}
        <div className="rounded-xl border border-border/80 bg-card/60 backdrop-blur-xs p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-muted-foreground uppercase tracking-wider text-[11px] font-semibold">
              Instantaneous State
            </span>
            <span className="font-mono text-xs text-slope font-bold">
              ({point.x.toFixed(2)}, {point.y.toFixed(2)})
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-background/50 border border-border/40">
              <div className="text-[10px] uppercase text-muted-foreground mb-1">
                Slope at (x₀, y₀)
              </div>
              <div className="text-lg font-bold text-slope">
                {isNaN(slopeX) ? "Undefined" : (slopeX >= 0 ? `+${slopeX.toFixed(3)}` : slopeX.toFixed(3))}
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-background/50 border border-border/40">
              <div className="text-[10px] uppercase text-muted-foreground mb-1">
                Direction Vector
              </div>
              <div className="text-sm font-bold text-foreground">
                {isNaN(slopeX) ? "Undefined" : `⟨1.00, ${slopeX.toFixed(2)}⟩`}
              </div>
            </div>
          </div>

          {/* Tangent line at current point */}
          <div className="pt-2 border-t border-border/40 text-xs font-mono">
            <div className="text-[10px] uppercase text-muted-foreground mb-1 flex items-center justify-between">
              <span>Local Tangent Segment</span>
              <span className="text-muted-foreground/80">Point-Slope</span>
            </div>
            <div className="p-2 rounded bg-background/50 border border-border/40 text-foreground">
              {tangentLine2D?.equation || "y = mx + b"}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (is3D) {
    return (
      <div className="space-y-3">
        {/* Surface Point & Height */}
        <div className="rounded-xl border border-border/80 bg-card/60 backdrop-blur-xs p-4 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slope shadow-sm shadow-orange-500/50" />
              <span className="font-mono text-muted-foreground uppercase tracking-wider text-[11px] font-semibold">
                Evaluation Point P₀
              </span>
            </div>
            <span className="font-mono text-xs text-foreground font-bold">
              P({point.x.toFixed(2)}, {point.y.toFixed(2)}, {isNaN(pointValue) ? "–" : pointValue.toFixed(2)})
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-background/50 border border-border/40 text-xs font-mono flex items-center justify-between">
            <span className="text-muted-foreground">Height z = f(x₀, y₀):</span>
            <span className="text-sm font-bold text-foreground">
              {isNaN(pointValue) ? "Undefined" : pointValue >= 0 ? `+${pointValue.toFixed(2)}` : pointValue.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Slopes in X and Y */}
        <div className="grid grid-cols-2 gap-2">
          {/* Slope in X */}
          <div className="rounded-xl border border-slope/40 bg-card/60 backdrop-blur-xs p-3 space-y-2 shadow-xs">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-slope font-semibold text-[11px]">
                SLOPE IN X →
              </span>
            </div>

            <div className="font-mono text-xs">
              <div className="text-muted-foreground text-[10px] mb-0.5">∂f/∂x =</div>
              <div className="overflow-x-auto text-sm font-bold text-foreground">
                <MathDisplay math={derivX?.latex || "2x"} />
              </div>
            </div>

            <div className="pt-1.5 border-t border-border/40 font-mono text-xs">
              <div className="text-[10px] text-muted-foreground">At ({point.x.toFixed(1)}, {point.y.toFixed(1)}):</div>
              <div className="text-base font-bold text-slope">
                {isNaN(slopeX) ? "Undefined" : slopeX >= 0 ? `+${slopeX.toFixed(2)}` : slopeX.toFixed(2)}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                Vector: (1, 0, {isNaN(slopeX) ? "0" : slopeX.toFixed(2)})
              </div>
            </div>
          </div>

          {/* Slope in Y */}
          <div className="rounded-xl border border-sky-500/40 bg-card/60 backdrop-blur-xs p-3 space-y-2 shadow-xs">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-sky-500 font-semibold text-[11px]">
                SLOPE IN Y ↑
              </span>
            </div>

            <div className="font-mono text-xs">
              <div className="text-muted-foreground text-[10px] mb-0.5">∂f/∂y =</div>
              <div className="overflow-x-auto text-sm font-bold text-foreground">
                <MathDisplay math={derivY?.latex || "2y"} />
              </div>
            </div>

            <div className="pt-1.5 border-t border-border/40 font-mono text-xs">
              <div className="text-[10px] text-muted-foreground">At ({point.x.toFixed(1)}, {point.y.toFixed(1)}):</div>
              <div className="text-base font-bold text-sky-500">
                {isNaN(slopeY) ? "Undefined" : slopeY >= 0 ? `+${slopeY.toFixed(2)}` : slopeY.toFixed(2)}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                Vector: (0, 1, {isNaN(slopeY) ? "0" : slopeY.toFixed(2)})
              </div>
            </div>
          </div>
        </div>

        {/* Local Tangent Plane Approximation */}
        <div className="rounded-xl border border-border/80 bg-card/60 backdrop-blur-xs p-3.5 space-y-2 shadow-xs font-mono text-xs">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground uppercase tracking-wider text-[11px] font-semibold">
              Local Tangent Plane
            </span>
            <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
              Order 1
            </Badge>
          </div>

          <div className="p-2.5 rounded-lg bg-background/50 border border-border/40 text-xs overflow-x-auto">
            {`z - ${pointValue.toFixed(2)} = ${slopeX.toFixed(2)}(x - ${point.x.toFixed(2)}) + ${slopeY.toFixed(2)}(y - ${point.y.toFixed(2)})`}
          </div>

          <div className="text-[11px] text-muted-foreground flex items-center justify-between px-1">
            <span>Normal vector n:</span>
            <span className="font-semibold text-foreground">
              ({(-slopeX).toFixed(2)}, {(-slopeY).toFixed(2)}, 1.00)
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 2D Mode
  return (
    <div className="space-y-3">
      {/* Analytic Derivative */}
      <div className="rounded-xl border border-border/80 bg-card/60 backdrop-blur-xs p-4 space-y-2.5 shadow-xs">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono text-muted-foreground uppercase tracking-wider text-[11px] font-semibold">
            Analytic Derivative
          </span>
          <div className="flex items-center space-x-1.5">
            {isApproximate && (
              <Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20">
                approximate
              </Badge>
            )}
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
        </div>

        <div className="p-3 rounded-lg bg-background/50 border border-border/40 flex items-center justify-between">
          <div className="overflow-x-auto">
            <MathDisplay
              math={`f'(x) = ${derivX?.latex || "2x"}`}
              className="text-base md:text-lg font-bold"
            />
          </div>
        </div>
      </div>

      {/* Instantaneous State at x0 */}
      <div className="rounded-xl border border-border/80 bg-card/60 backdrop-blur-xs p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono text-muted-foreground uppercase tracking-wider text-[11px] font-semibold">
            Instantaneous State
          </span>
          <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground border border-border/40 font-bold">
            x₀ = {point.x.toFixed(2)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-3 rounded-lg bg-background/50 border border-border/40">
            <div className="text-[10px] uppercase text-muted-foreground mb-1">
              Point Height F(x₀)
            </div>
            <div className="text-xl font-bold text-foreground">
              {isNaN(pointValue) ? "Undefined" : pointValue >= 0 ? `+${pointValue.toFixed(3)}` : pointValue.toFixed(3)}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slope/10 border border-slope/30">
            <div className="text-[10px] uppercase text-slope font-semibold mb-1">
              Tangent Slope F'(x₀)
            </div>
            <div className="text-xl font-bold text-slope">
              {isNaN(slopeX) ? "Undefined" : slopeX >= 0 ? `+${slopeX.toFixed(3)}` : slopeX.toFixed(3)}
            </div>
          </div>
        </div>

        {/* Tangent Line Equation */}
        <div className="pt-2 border-t border-border/40 text-xs font-mono">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
            <span>Tangent Line Equation</span>
            <span>Point-Slope</span>
          </div>
          <div className="p-2.5 rounded-lg bg-background/50 border border-border/40 font-semibold text-foreground overflow-x-auto">
            {tangentLine2D?.equation || "y = mx + b"}
          </div>
        </div>
      </div>
    </div>
  );
}
