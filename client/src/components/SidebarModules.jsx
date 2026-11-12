import React from "react";
import { TrendingUp, AreaChart, Sparkles, Compass, Command } from "lucide-react";

export default function SidebarModules({
  currentModule = "derivative",
  onSelectModule,
}) {
  const MODULES = [
    {
      id: "derivative",
      label: "Derivative Engine",
      icon: TrendingUp,
      status: "f(x) Ready",
      activeColor: "bg-primary text-primary-foreground shadow-sm shadow-primary/25",
    },
    {
      id: "ode",
      label: "Vector Fields & ODEs",
      icon: Compass,
      status: "Slope Field",
      activeColor: "bg-primary text-primary-foreground shadow-sm shadow-primary/25",
    },
    {
      id: "riemann",
      label: "Riemann & Integrals",
      icon: AreaChart,
      status: "Preview",
      activeColor: "bg-secondary text-foreground",
    },
    {
      id: "taylor",
      label: "Taylor Approximation",
      icon: Sparkles,
      status: "Preview",
      activeColor: "bg-secondary text-foreground",
    },
  ];

  return (
    <aside className="w-56 hidden xl:flex flex-col border-r border-border/60 bg-card/40 backdrop-blur-md p-4 justify-between select-none">
      <div className="space-y-4">
        <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold px-2">
          <span>Calculus Modules</span>
        </div>

        <nav className="space-y-1.5">
          {MODULES.map((m) => {
            const Icon = m.icon;
            const isActive = currentModule === m.id;
            return (
              <button
                key={m.id}
                onClick={() => onSelectModule(m.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-mono transition-all text-left ${
                  isActive
                    ? m.activeColor
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="font-sans font-medium text-xs">{m.label}</span>
                </div>
                {m.status && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-md ${
                      isActive
                        ? "bg-white/20 text-white font-bold"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {m.status}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-border/40 text-[11px] font-mono text-muted-foreground flex items-center justify-between px-2">
        <span className="flex items-center gap-1">
          <Command className="w-3 h-3" />
          <span>LaTeX Mode</span>
        </span>
        <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded border border-border/40 font-bold">
          ⌘K
        </span>
      </div>
    </aside>
  );
}
