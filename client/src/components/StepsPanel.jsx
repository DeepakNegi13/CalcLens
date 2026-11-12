import React, { useState } from "react";
import { ChevronDown, ChevronUp, Sparkles, BookOpen, Loader2 } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

export default function StepsPanel({
  expression = "",
  steps = [],
  onFetchSteps,
  isLoading = false,
  isDifferential = false,
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="rounded-xl border border-border/80 bg-card/60 backdrop-blur-xs overflow-hidden shadow-xs transition-all">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between p-3.5 border-b border-border/40">
          <CollapsibleTrigger asChild>
            <button className="flex items-center space-x-2 text-left w-full hover:opacity-80 transition-opacity">
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-foreground">
                Step-by-Step Derivation
              </span>
              {isOpen ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground ml-auto" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground ml-auto" />
              )}
            </button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent>
          <div className="p-4 space-y-3 font-mono text-xs">
            {steps && steps.length > 0 ? (
              <div className="space-y-2.5">
                {steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-background/50 border border-border/40 space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-[10px]">
                        {idx + 1}
                      </span>
                      <span className="text-[11px] font-bold text-foreground">
                        {step.title || `STEP ${idx + 1}`}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-xs pl-7 leading-relaxed font-sans">
                      {step.desc || step}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-2 text-center space-y-3">
                <p className="text-xs text-muted-foreground">
                  Get a personalized, step-by-step calculus walkthrough explaining the rules applied and slope behavior.
                </p>
                <Button
                  size="sm"
                  onClick={onFetchSteps}
                  disabled={isLoading}
                  className="h-8 text-xs font-mono font-medium"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      Explaining Steps...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                      Explain with Gemini AI
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

