import React from "react";
import { GitFork, Grid3X3, RotateCcw, Plus, Minus, Maximize2, Sparkles } from "lucide-react";

export default function EmptyState({ onSelectPreset }) {
  const PRESETS = [
    { label: "f(x) = x²", raw: "x^2", mode: "2d" },
    { label: "f(x) = sin(x)", raw: "sin(x)", mode: "2d" },
    { label: "f(x, y) = x² - y²", raw: "x^2 - y^2", mode: "3d" },
    { label: "dy/dx = x + y", raw: "dy/dx = x + y", mode: "differential" },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-card/30 backdrop-blur-md rounded-2xl border border-border/70 overflow-hidden relative">
      {/* Top toolbar */}
      <div className="h-11 px-4 border-b border-border/40 flex items-center justify-between text-xs font-mono text-muted-foreground bg-card/40">
        <div className="flex items-center space-x-3">
          <span className="flex items-center gap-1.5">
            <span className="text-primary">∇</span>
            <span>X: 0.00 | Y: 0.00</span>
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary text-[10px] text-muted-foreground border border-border/40">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Euler-Heun Integrator Ready
          </span>
        </div>

        <div className="flex items-center space-x-1">
          <button className="px-2 py-1 rounded hover:bg-muted text-xs flex items-center gap-1">
            <Grid3X3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Grid</span>
          </button>
          <button className="p-1.5 rounded hover:bg-muted" title="Reset view">
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 rounded hover:bg-muted" title="Zoom In">
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 rounded hover:bg-muted" title="Zoom Out">
            <Minus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main empty stage */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6 relative overflow-hidden">
        {/* Subtle coordinate grid background pattern */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="relative z-10 flex flex-col items-center max-w-md space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/10 animate-pulse">
            <GitFork className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
              Your graph will appear here
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              Type an equation on the left, upload an image of a math problem, or explore differential equations & 3D surfaces in real time.
            </p>
          </div>

          {/* Try sample presets */}
          <div className="pt-3 space-y-2 w-full">
            <div className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground/80 font-semibold">
              Try Sample Presets
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.raw}
                  onClick={() => onSelectPreset?.(p.raw, p.mode)}
                  className="px-3 py-1.5 text-xs font-mono rounded-lg bg-secondary/80 hover:bg-secondary text-foreground border border-border/60 hover:border-primary/50 transition-all hover:scale-105 active:scale-95 shadow-xs"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Status bar */}
      <div className="h-10 px-4 border-t border-border/40 flex items-center justify-between text-[11px] font-mono text-muted-foreground bg-card/40">
        <div className="flex items-center space-x-4">
          <span>Δx → 0</span>
          <span className="hidden sm:inline">Step: 0.001</span>
          <span className="hidden md:inline">Secant Angle: 45.0°</span>
        </div>

        <div className="flex items-center space-x-1">
          <span className="px-2 py-0.5 rounded bg-primary/15 text-primary text-[10px] font-semibold border border-primary/20">
            2D PLANE
          </span>
          <span className="px-2 py-0.5 rounded bg-secondary text-muted-foreground text-[10px]">
            VECTOR FIELD
          </span>
          <span className="px-2 py-0.5 rounded bg-secondary text-muted-foreground text-[10px]">
            3D SURFACE
          </span>
        </div>
      </div>
    </div>
  );
}
