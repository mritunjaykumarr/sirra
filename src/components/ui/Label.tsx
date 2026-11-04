import React from "react";

export interface LabelProps {
  children: React.ReactNode;
  tone?: "dark" | "light";
  as?: "span" | "p" | "div";
  className?: string;
}

export function Label({
  children,
  tone = "dark",
  as: Component = "span",
  className = "",
}: LabelProps) {
  const toneClass = tone === "light" ? "text-cream/60" : "text-ink/60";

  return (
    <Component
      className={`font-sans text-[11px] md:text-[12px] uppercase tracking-[0.2em] font-medium ${toneClass} ${className}`}
    >
      {children}
    </Component>
  );
}

export default Label;

