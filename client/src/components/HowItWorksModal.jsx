import React from "react";
import { X, Sparkles, BookOpen, Key, Layers, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HowItWorksModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-card/80">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-lg text-foreground tracking-tight">
              About CalcLens
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-foreground">
          <section className="space-y-2">
            <h4 className="font-bold text-sm text-primary uppercase font-mono tracking-wider">
              1. See the Slope Live
            </h4>
            <p className="text-muted-foreground leading-relaxed">
              CalcLens is a calculus and differential equation visualizer. Type an equation or upload a photo of handwritten math, and watch CalcLens plot the curve or surface along with its exact tangent slope line in real-time.
            </p>
          </section>

          <section className="space-y-2">
            <h4 className="font-bold text-sm text-primary uppercase font-mono tracking-wider">
              2. Supported Modes & Math
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-secondary/50 border border-border/60">
                <div className="font-bold text-foreground mb-1">2D Curves</div>
                <div className="text-muted-foreground">y = f(x) with tangent line y = f(a) + f'(a)(x - a)</div>
              </div>
              <div className="p-3 rounded-xl bg-secondary/50 border border-border/60">
                <div className="font-bold text-foreground mb-1">3D Surfaces</div>
                <div className="text-muted-foreground">z = f(x,y) with ∂f/∂x, ∂f/∂y lines and tangent plane</div>
              </div>
              <div className="p-3 rounded-xl bg-secondary/50 border border-border/60">
                <div className="font-bold text-foreground mb-1">Differential ODEs</div>
                <div className="text-muted-foreground">dy/dx = f(x,y) with slope field & RK4 trajectory</div>
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <h4 className="font-bold text-sm text-primary uppercase font-mono tracking-wider">
              3. AI Image-to-Equation & Gemini
            </h4>
            <p className="text-muted-foreground leading-relaxed">
              Upload any photo of a calculus problem from your notebook or textbook. Gemini Vision analyzes the handwriting, normalizes the math, and renders the interactive plot instantly.
            </p>
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-mono text-amber-600 dark:text-amber-400 flex items-start gap-2.5">
              <Key className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Gemini API Key:</span> To enable image recognition and step-by-step explanations, paste your free Gemini API key into <code className="bg-background px-1 py-0.5 rounded border border-border">server/.env</code>.
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border bg-card/60 flex justify-end">
          <Button onClick={onClose} className="px-5">
            Got it
          </Button>
        </div>
      </div>
    </div>
  );
}
