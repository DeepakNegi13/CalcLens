import React from "react";

export default function DerivativeSelector({
  mode = "2d",
  derivativeMode = "ordinary",
  onChange,
  isDifferential = false,
}) {
  const is2D = mode === "2d" && !isDifferential;
  const is3D = mode === "3d" && !isDifferential;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-mono text-muted-foreground uppercase tracking-wider text-[11px] font-semibold">
          Derivative Mode
        </span>
        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border/50">
          {isDifferential ? "ODE Field" : mode.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-1 p-1 bg-secondary/60 rounded-xl border border-border/50">
        <button
          type="button"
          disabled={is3D}
          onClick={() => onChange("ordinary")}
          className={`py-1.5 px-2 text-xs font-mono font-medium rounded-lg transition-all text-center ${
            derivativeMode === "ordinary" || isDifferential
              ? "bg-primary text-primary-foreground shadow-xs font-semibold"
              : is3D
              ? "opacity-40 cursor-not-allowed text-muted-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
          }`}
        >
          {isDifferential ? "Slope dy/dx" : "Ordinary dy/dx"}
        </button>

        <button
          type="button"
          disabled={is2D || isDifferential}
          onClick={() => onChange("partial_x")}
          className={`py-1.5 px-2 text-xs font-mono font-medium rounded-lg transition-all text-center ${
            derivativeMode === "partial_x" && !isDifferential
              ? "bg-primary text-primary-foreground shadow-xs font-semibold"
              : is2D || isDifferential
              ? "opacity-40 cursor-not-allowed text-muted-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
          }`}
        >
          Partial ∂/∂x
        </button>

        <button
          type="button"
          disabled={is2D || isDifferential}
          onClick={() => onChange("partial_y")}
          className={`py-1.5 px-2 text-xs font-mono font-medium rounded-lg transition-all text-center ${
            derivativeMode === "partial_y" && !isDifferential
              ? "bg-primary text-primary-foreground shadow-xs font-semibold"
              : is2D || isDifferential
              ? "opacity-40 cursor-not-allowed text-muted-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
          }`}
        >
          Partial ∂/∂y
        </button>
      </div>
    </div>
  );
}

