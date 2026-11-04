import React from "react";

export type WordmarkSize = "sm" | "base" | "lg" | "xl" | "hero";

export interface WordmarkProps {
  size?: WordmarkSize;
  className?: string;
  as?: "span" | "h1" | "div";
}
const sizeClasses: Record<WordmarkSize, string> = {
  sm: "text-base tracking-[0.5em] pl-[0.5em]",
  base: "text-xl md:text-2xl tracking-[0.5em] pl-[0.5em]",
  lg: "text-3xl md:text-4xl tracking-[0.5em] pl-[0.5em]",
  xl: "text-5xl md:text-6xl tracking-[0.5em] pl-[0.5em]",
  hero: "text-6xl md:text-8xl lg:text-9xl tracking-[0.5em] pl-[0.5em]",
};

export function Wordmark({
  size = "base",
  className = "",
  as: Component = "span",
}: WordmarkProps) {
  return (
    <Component
      className={`font-display font-medium uppercase inline-block leading-none select-none ${sizeClasses[size]} ${className}`}
    >
      SIRRA
    </Component>
  );
}

export default Wordmark;

