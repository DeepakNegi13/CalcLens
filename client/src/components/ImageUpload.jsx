import React, { useState, useRef, useEffect } from "react";
import { Upload, ImageIcon, Loader2, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ImageUpload({ onImageSelected, isUploading = false }) {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef(null);

  // Global clipboard paste listener
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            handleFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  const handleFile = (file) => {
    if (!file) return;

    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      alert("Please upload a PNG, JPG, or WEBP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image exceeds 5 MB size limit.");
      return;
    }

    setFileName(file.name || "Pasted image.png");
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    onImageSelected?.(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const clearImage = (e) => {
    e?.stopPropagation();
    setPreviewUrl(null);
    setFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-mono text-muted-foreground uppercase tracking-wider text-[11px] font-semibold">
          Optical Math Recognition
        </span>
        <span className="text-[10px] text-primary font-mono flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          Gemini Vision 2.5
        </span>
      </div>

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 overflow-hidden ${
          dragActive
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-border/80 hover:border-primary/50 bg-background/40 hover:bg-background/80"
        } ${isUploading ? "pointer-events-none opacity-80" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) handleFile(e.target.files[0]);
          }}
        />

        {previewUrl ? (
          <div className="relative group flex flex-col items-center">
            <div className="relative max-h-40 rounded-lg overflow-hidden border border-border shadow-xs bg-black/10">
              <img
                src={previewUrl}
                alt="Uploaded preview"
                className="max-h-40 object-contain mx-auto"
              />
              {isUploading && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-xs flex flex-col items-center justify-center p-3">
                  <Loader2 className="w-6 h-6 text-primary animate-spin mb-2" />
                  <span className="text-xs font-medium text-foreground">
                    Reading your equation...
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between w-full mt-2.5 px-1">
              <span className="text-xs font-mono text-muted-foreground truncate max-w-[200px]">
                {fileName}
              </span>
              {!isUploading && (
                <button
                  type="button"
                  onClick={clearImage}
                  className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-3">
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-primary mb-3 shadow-inner">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              Drop equation photo or <span className="text-primary underline">browse</span>
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              PNG, JPG, WEBP up to 5 MB · or press Ctrl+V to paste
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

