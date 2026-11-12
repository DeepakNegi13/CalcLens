import React, { useState } from "react";
import { ThemeProvider } from "next-themes";
import Navbar from "./components/Navbar";
import SidebarModules from "./components/SidebarModules";
import InputPanel from "./components/InputPanel";
import ResultCards from "./components/ResultCards";
import StepsPanel from "./components/StepsPanel";
import PointSliders from "./components/PointSliders";
import Toggles3D from "./components/Toggles3D";
import Graph2D from "./components/Graph2D";
import Graph3D from "./components/Graph3D";
import GraphODE from "./components/GraphODE";
import EmptyState from "./components/EmptyState";
import HowItWorksModal from "./components/HowItWorksModal";
import { Toaster } from "@/components/ui/sonner";
import { useCalculus } from "./hooks/useCalculus";
import { Compass, TrendingUp, Layers } from "lucide-react";

export default function App() {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [activeModule, setActiveModule] = useState("derivative");

  const calc = useCalculus();

  const handleModuleChange = (modId) => {
    setActiveModule(modId);
    if (modId === "ode") {
      calc.handleSelectPreset("dy/dx = x + y", "differential");
    } else if (modId === "derivative") {
      calc.handleSelectPreset("x^3 - 3*x + 1", "2d");
    }
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={true}>
      <div className="h-screen w-screen overflow-hidden bg-background text-foreground flex flex-col antialiased selection:bg-indigo-500/20 font-sans">
        {/* Navbar */}
        <Navbar
          onOpenHowItWorks={() => setIsHelpOpen(true)}
          activeTab={activeModule === "ode" ? "presets" : "workspace"}
          setActiveTab={(t) => {
            if (t === "presets") handleModuleChange("ode");
            else handleModuleChange("derivative");
          }}
        />

        {/* Main Application Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Far-Left: Modules Navigation (Desktop) */}
          <SidebarModules
            currentModule={activeModule}
            onSelectModule={handleModuleChange}
          />

          {/* Main Workspace Layout */}
          <main className="flex-1 h-[calc(100vh-3.5rem)] flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden p-3 lg:p-4 gap-4">
            {/* Left Control Column (Inputs, Results, Steps) */}
            <div className="w-full lg:w-[380px] xl:w-[410px] shrink-0 h-auto lg:h-full overflow-y-auto space-y-4 pr-0 lg:pr-1 pb-4">
              {/* Input Pipeline Card */}
              <div className="rounded-2xl border border-border/80 bg-card/50 backdrop-blur-md p-4 sm:p-5 shadow-xs">
                <InputPanel
                  rawInput={calc.rawInput}
                  setRawInput={calc.setRawInput}
                  expression={calc.expression}
                  latex={calc.latex}
                  confidence={calc.confidence}
                  isDifferential={calc.isDifferential}
                  mode={calc.mode}
                  derivativeMode={calc.derivativeMode}
                  setDerivativeMode={calc.setDerivativeMode}
                  onVisualize={calc.visualize}
                  onImageSelected={calc.handleImageUpload}
                  isUploadingImage={calc.isUploadingImage}
                  onFixWithAI={calc.handleFixWithAI}
                  isFixingWithAI={calc.isFixingWithAI}
                  error={calc.error}
                />
              </div>

              {/* 3D Viewport Layers Toggles */}
              {calc.status === "ready" && calc.mode === "3d" && !calc.isDifferential && (
                <Toggles3D
                  toggles={calc.toggles3D}
                  onChangeToggle={calc.handleToggle3D}
                />
              )}

              {/* Numerical Derivative & Tangent Result Cards */}
              {calc.status === "ready" && (
                <ResultCards
                  mode={calc.mode}
                  expression={calc.expression}
                  derivX={calc.derivX}
                  derivY={calc.derivY}
                  point={calc.point}
                  pointValue={calc.pointValue}
                  slopeX={calc.slopeX}
                  slopeY={calc.slopeY}
                  tangentLine2D={calc.tangentLine2D}
                  tangents3D={calc.tangents3D}
                  isDifferential={calc.isDifferential}
                  isApproximate={calc.derivX?.isApproximate}
                />
              )}

              {/* Step-by-Step Derivation Explanation */}
              {calc.status === "ready" && (
                <StepsPanel
                  expression={calc.expression}
                  steps={calc.steps}
                  onFetchSteps={calc.handleFetchSteps}
                  isLoading={calc.isLoadingSteps}
                  isDifferential={calc.isDifferential}
                />
              )}
            </div>

            {/* Right Hero Panel: Interactive Graph */}
            <div className="flex-1 h-[520px] lg:h-full min-h-0 flex flex-col overflow-hidden relative">
              {calc.status === "idle" ? (
                <EmptyState onSelectPreset={calc.handleSelectPreset} />
              ) : calc.isDifferential ? (
                <GraphODE
                  expression={calc.expression}
                  evaluateFn={calc.evaluateFn}
                  point={calc.point}
                  onChangePoint={calc.setPoint}
                  slope={calc.slopeX}
                  onResetView={calc.handleResetView}
                />
              ) : calc.mode === "3d" ? (
                <Graph3D
                  surfaceData={calc.surfaceData3D}
                  point={calc.point}
                  onChangePoint={calc.setPoint}
                  pointValue={calc.pointValue}
                  slopeX={calc.slopeX}
                  slopeY={calc.slopeY}
                  tangents3D={calc.tangents3D}
                  toggles={calc.toggles3D}
                  xRange={calc.xRange}
                  yRange={calc.yRange}
                  onResetView={calc.handleResetView}
                />
              ) : (
                <Graph2D
                  curveData={calc.curveData2D}
                  tangentLine={calc.tangentLine2D}
                  point={calc.point}
                  onChangePoint={calc.setPoint}
                  pointValue={calc.pointValue}
                  slope={calc.slopeX}
                  expression={calc.expression}
                  evaluateFn={calc.evaluateFn}
                  derivFn={calc.derivFn}
                  onResetView={calc.handleResetView}
                />
              )}
            </div>
          </main>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="lg:hidden h-14 border-t border-border bg-card/90 backdrop-blur-md px-3 flex items-center justify-around text-xs font-mono select-none sticky bottom-0 z-40 shrink-0">
          <button
            onClick={() => handleModuleChange("derivative")}
            className={`flex flex-col items-center py-1 px-3 rounded-lg ${
              activeModule === "derivative" ? "text-primary font-bold" : "text-muted-foreground"
            }`}
          >
            <TrendingUp className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">2D Curve</span>
          </button>

          <button
            onClick={() => calc.handleSelectPreset("x^2 - y^2", "3d")}
            className={`flex flex-col items-center py-1 px-3 rounded-lg ${
              calc.mode === "3d" ? "text-primary font-bold" : "text-muted-foreground"
            }`}
          >
            <Layers className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">3D Surface</span>
          </button>

          <button
            onClick={() => handleModuleChange("ode")}
            className={`flex flex-col items-center py-1 px-3 rounded-lg ${
              calc.isDifferential ? "text-primary font-bold" : "text-muted-foreground"
            }`}
          >
            <Compass className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">ODE Field</span>
          </button>
        </div>

        {/* Documentation & Help Modal */}
        <HowItWorksModal
          isOpen={isHelpOpen}
          onClose={() => setIsHelpOpen(false)}
        />

        <Toaster />
      </div>
    </ThemeProvider>
  );
}
