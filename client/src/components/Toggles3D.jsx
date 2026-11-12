import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function Toggles3D({
  toggles = { dfdx: true, dfdy: true, plane: true, wireframe: true },
  onChangeToggle,
}) {
  return (
    <div className="rounded-xl border border-border/80 bg-card/60 backdrop-blur-xs p-3.5 space-y-3 shadow-xs">
      <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
        Viewport Layers
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="toggle-dfdx" className="text-xs font-mono flex items-center gap-2 cursor-pointer">
            <span className="w-2.5 h-2.5 rounded-sm bg-slope" />
            <span>Show ∂f/∂x tangent vector</span>
          </Label>
          <Switch
            id="toggle-dfdx"
            checked={toggles.dfdx}
            onCheckedChange={(val) => onChangeToggle("dfdx", val)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="toggle-dfdy" className="text-xs font-mono flex items-center gap-2 cursor-pointer">
            <span className="w-2.5 h-2.5 rounded-sm bg-sky-400" />
            <span>Show ∂f/∂y tangent vector</span>
          </Label>
          <Switch
            id="toggle-dfdy"
            checked={toggles.dfdy}
            onCheckedChange={(val) => onChangeToggle("dfdy", val)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="toggle-plane" className="text-xs font-mono flex items-center gap-2 cursor-pointer">
            <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500/60" />
            <span>Show Tangent Plane</span>
          </Label>
          <Switch
            id="toggle-plane"
            checked={toggles.plane}
            onCheckedChange={(val) => onChangeToggle("plane", val)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="toggle-wireframe" className="text-xs font-mono flex items-center gap-2 cursor-pointer">
            <span className="w-2.5 h-2.5 rounded-sm bg-muted-foreground" />
            <span>Show Surface Wireframe</span>
          </Label>
          <Switch
            id="toggle-wireframe"
            checked={toggles.wireframe}
            onCheckedChange={(val) => onChangeToggle("wireframe", val)}
          />
        </div>
      </div>
    </div>
  );
}

