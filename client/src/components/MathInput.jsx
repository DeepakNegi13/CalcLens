import React, { useRef } from "react";
import { Sparkles, X, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const QUICK_INSERTS = [
  { label: "x²", value: "^2" },
  { label: "√x", value: "sqrt(" },
  { label: "sin", value: "sin(" },
  { label: "cos", value: "cos(" },
  { label: "ln", value: "ln(" },
  { label: "π", value: "π" },
  { label: "^", value: "^" },
  { label: "∂", value: "∂" },
  { label: "dy/dx", value: "dy/dx = " },
];

export default function MathInput({
  value,
  onChange,
  onClear,
  isValid = true,
  errorMessage = "",
  onFixWithAI,
  isFixing = false,
  onSubmit,
}) {
  const inputRef = useRef(null);

  const handleInsert = (insertText) => {
    const input = inputRef.current;
    if (!input) {
      onChange(value + insertText);
      return;
    }

    const start = input.selectionStart ?? value.length;
    const end = input.selectionEnd ?? value.length;
    const nextVal = value.substring(0, start) + insertText + value.substring(end);
    onChange(nextVal);

    setTimeout(() => {
      input.focus();
      const newCursor = start + insertText.length;
      input.setSelectionRange(newCursor, newCursor);
    }, 0);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey || !e.shiftKey)) {
      e.preventDefault();
      onSubmit?.();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-mono text-muted-foreground uppercase tracking-wider text-[11px] font-semibold">
          Expression f(x), f(x,y) or dy/dx
        </span>
        <div className="flex items-center space-x-2">
          {value.trim() && (
            isValid ? (
              <span className="flex items-center space-x-1 text-[11px] text-emerald-500 font-mono font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Valid Syntax</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1 text-[11px] text-amber-500 font-mono font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Check Syntax</span>
              </span>
            )
          )}
          {value.trim() && (
            <button
              onClick={onClear}
              className="text-xs text-muted-foreground hover:text-foreground hover:underline ml-2 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Input container */}
      <div className="relative rounded-xl border border-border/80 bg-background/50 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-inner">
        <div className="flex items-center px-3 pt-2 text-xs font-mono text-muted-foreground select-none">
          <span>f:</span>
        </div>
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. x^3 - 3*x + 1 or dy/dx = x + y"
          rows={2}
          className="w-full bg-transparent px-3 py-1 font-mono text-sm md:text-base text-foreground resize-none focus:outline-none placeholder:text-muted-foreground/40"
        />

        {value && (
          <button
            onClick={onClear}
            className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted/50 transition-colors"
            title="Clear input"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Error state & Fix with AI button */}
      {!isValid && errorMessage && (
        <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400 flex items-center justify-between gap-2">
          <span className="line-clamp-2">{errorMessage}</span>
          {onFixWithAI && (
            <Button
              size="sm"
              variant="outline"
              onClick={onFixWithAI}
              disabled={isFixing}
              className="h-7 text-xs border-amber-500/30 hover:bg-amber-500/15 text-amber-600 dark:text-amber-300 shrink-0 font-medium"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-500 animate-spin-slow" />
              {isFixing ? "Fixing..." : "Fix with AI"}
            </Button>
          )}
        </div>
      )}

      {/* Quick Insert buttons */}
      <div>
        <div className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground/80 mb-1.5 font-semibold">
          Quick Inserts
        </div>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_INSERTS.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => handleInsert(item.value)}
              className="px-2.5 py-1 text-xs font-mono rounded-md bg-secondary/80 hover:bg-secondary text-secondary-foreground border border-border/50 hover:border-primary/40 active:scale-95 transition-all"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
