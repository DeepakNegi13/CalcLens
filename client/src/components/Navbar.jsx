import React from "react";
import { Sparkles, HelpCircle, Activity, Code2 } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { Badge } from "@/components/ui/badge";

export default function Navbar({ onOpenHowItWorks, activeTab = "workspace", setActiveTab }) {
  return (
    <header className="h-14 border-b border-border/60 bg-card/70 backdrop-blur-md sticky top-0 z-50 px-4 lg:px-6 flex items-center justify-between transition-colors">
      {/* Left: Brand & Status */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20">
            <span className="font-mono text-base font-bold">λ</span>
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="font-bold tracking-tight text-lg bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
              CalcLens
            </span>
            <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              v2.4
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-1.5 pl-3 border-l border-border/60">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/50" />
          <span className="text-[11px] font-mono tracking-wider text-muted-foreground uppercase">
            Engine Live
          </span>
        </div>
      </div>

      {/* Center / Right: Navigation & Controls */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        <nav className="flex items-center space-x-1">
          <button
            onClick={() => setActiveTab?.("workspace")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === "workspace"
                ? "bg-secondary text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            Workspace
          </button>
          <button
            onClick={() => setActiveTab?.("presets")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === "presets"
                ? "bg-secondary text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            Gallery
          </button>
          <button
            onClick={onOpenHowItWorks}
            className="hidden sm:inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>How it works</span>
          </button>
        </nav>

        <div className="h-4 w-px bg-border/60" />

        <div className="flex items-center space-x-1.5">
          <ThemeToggle />
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted border border-border/50 transition-colors"
            title="View Source"
          >
            <Code2 className="w-4 h-4" />
          </a>
        </div>
      </div>
    </header>
  );
}
