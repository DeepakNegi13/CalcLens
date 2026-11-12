import React, { useState } from "react";
import { Pencil, Check, AlertTriangle, Sparkles } from "lucide-react";
import MathDisplay from "./MathDisplay";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function EquationPreview({
  latex = "",
  expression = "",
  confidence = 1.0,
  isDifferential = false,
  onEdit,
  onChangeExpression,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(expression);

  if (!expression && !latex) return null;

  const isLowConfidence = confidence > 0 && confidence < 0.6;
  const matchPercentage = Math.round((confidence || 0.95) * 100);

  const handleSave = () => {
    setIsEditing(false);
    onChangeExpression?.(editText);
  };

  return (
    <div className="rounded-xl border border-border/80 bg-card/60 backdrop-blur-xs p-3.5 space-y-2.5 shadow-xs transition-all">
      <div className="flex items-center justify-between text-xs">
        <span className="font-mono text-muted-foreground uppercase tracking-wider text-[11px] font-semibold">
          Evaluated Target
        </span>
        <div className="flex items-center space-x-1.5">
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              isLowConfidence ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
            }`}
          />
          <span className="text-[11px] font-mono text-muted-foreground">
            {matchPercentage}% match
          </span>
        </div>
      </div>

      {isEditing ? (
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="flex-1 font-mono text-sm px-2.5 py-1.5 rounded-lg border border-primary/50 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
          />
          <Button size="sm" onClick={handleSave} className="h-8 px-2.5">
            <Check className="w-3.5 h-3.5 mr-1" />
            Save
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between bg-background/50 rounded-lg p-2.5 border border-border/40">
          <div className="overflow-x-auto py-0.5">
            {latex ? (
              <MathDisplay math={latex} className="text-base font-medium" />
            ) : (
              <MathDisplay
                math={
                  isDifferential
                    ? `\\frac{dy}{dx} = ${expression}`
                    : `f(x) = ${expression}`
                }
                className="text-base font-medium"
              />
            )}
          </div>
          <button
            onClick={() => {
              setEditText(expression);
              setIsEditing(true);
              onEdit?.();
            }}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 ml-2 transition-colors"
            title="Edit equation"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {isLowConfidence && (
        <div className="flex items-center space-x-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 p-2 rounded-md border border-amber-500/20">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>Low recognition confidence. Please check the equation above.</span>
        </div>
      )}
    </div>
  );
}

