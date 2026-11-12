import React, { useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

export default function MathDisplay({ math = "", block = false, className = "" }) {
  const html = useMemo(() => {
    if (!math) return "";
    try {
      return katex.renderToString(math, {
        displayMode: block,
        throwOnError: false,
      });
    } catch (err) {
      console.warn("KaTeX render error:", err);
      return math;
    }
  }, [math, block]);

  return (
    <span
      className={`inline-block font-math ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
