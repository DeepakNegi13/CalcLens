import React, { useState } from "react";
import { Zap, Sparkles, Image, Keyboard, Layers } from "lucide-react";
import MathInput from "./MathInput";
import ImageUpload from "./ImageUpload";
import EquationPreview from "./EquationPreview";
import DerivativeSelector from "./DerivativeSelector";
import { Button } from "@/components/ui/button";

export default function InputPanel({
  rawInput,
  setRawInput,
  expression,
  latex,
  confidence,
  isDifferential,
  mode,
  derivativeMode,
  setDerivativeMode,
  onVisualize,
  onImageSelected,
  isUploadingImage,
  onFixWithAI,
  isFixingWithAI,
  error,
}) {
  const [activeTab, setActiveTab] = useState("type"); // "type" | "upload"

  const buttonLabel = isDifferential
    ? "Visualize ODE Slope Field"
    : mode === "3d"
    ? "Visualize 3D Surface"
    : "Visualize Curve";

  return (
    <div className="space-y-4">
      {/* Pipeline Tabs */}
      <div className="p-1 rounded-xl bg-secondary/80 border border-border/60 grid grid-cols-2 gap-1">
        <button
          type="button"
          onClick={() => setActiveTab("type")}
          className={`flex items-center justify-center space-x-2 py-2 px-3 text-xs font-mono font-medium rounded-lg transition-all ${
            activeTab === "type"
              ? "bg-card text-foreground shadow-xs font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Keyboard className="w-3.5 h-3.5" />
          <span>Type Equation</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("upload")}
          className={`flex items-center justify-center space-x-2 py-2 px-3 text-xs font-mono font-medium rounded-lg transition-all ${
            activeTab === "upload"
              ? "bg-card text-foreground shadow-xs font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Image className="w-3.5 h-3.5" />
          <span>Upload Image</span>
        </button>
      </div>

      {/* Input Tab Body */}
      {activeTab === "type" ? (
        <MathInput
          value={rawInput}
          onChange={setRawInput}
          onClear={() => setRawInput("")}
          isValid={!error}
          errorMessage={error?.message}
          onFixWithAI={onFixWithAI}
          isFixing={isFixingWithAI}
          onSubmit={() => onVisualize()}
        />
      ) : (
        <ImageUpload
          onImageSelected={onImageSelected}
          isUploading={isUploadingImage}
        />
      )}

      {/* Evaluated Target Card */}
      <EquationPreview
        latex={latex}
        expression={expression}
        confidence={confidence}
        isDifferential={isDifferential}
        onChangeExpression={(newExpr) => {
          setRawInput(newExpr);
          onVisualize(newExpr);
        }}
      />

      {/* Derivative Mode Selector */}
      <DerivativeSelector
        mode={mode}
        derivativeMode={derivativeMode}
        onChange={setDerivativeMode}
        isDifferential={isDifferential}
      />

      {/* Big Action Button */}
      <Button
        onClick={() => onVisualize()}
        className="w-full h-12 rounded-xl text-sm font-semibold tracking-wide bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-md shadow-indigo-500/25 active:scale-[0.99] transition-all flex items-center justify-center space-x-2"
      >
        <Zap className="w-4 h-4 fill-current" />
        <span>{buttonLabel}</span>
        <span className="text-[10px] font-mono opacity-70 ml-1.5 hidden sm:inline">
          ⌘ + Enter
        </span>
      </Button>

      {/* Footer compute badge */}
      <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground pt-1 px-1">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Real-time math compute</span>
        </span>
        <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded border border-border/40">
          LaTeX / Math
        </span>
      </div>
    </div>
  );
}

