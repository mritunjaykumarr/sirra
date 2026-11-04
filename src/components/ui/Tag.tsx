import React from "react";

export type TagColor = "rust" | "wayfarer" | "equinox" | "silkSmoke" | "silk-smoke" | "heartthrob" | "gold" | "ink";

export interface TagProps {
  children: React.ReactNode;
  color?: TagColor | string;
  className?: string;
}

const colorClassMap: Record<string, string> = {
  rust: "bg-rust",
  wayfarer: "bg-wayfarer",
  equinox: "bg-equinox",
  silkSmoke: "bg-silkSmoke",
  "silk-smoke": "bg-silkSmoke",
  heartthrob: "bg-heartthrob",
  gold: "bg-gold text-ink",
  ink: "bg-ink",
};

export function Tag({ children, color = "rust", className = "" }: TagProps) {
  const bgClass = colorClassMap[color] || "";
  const isCustomColor = !bgClass;

  return (
    <span
      className={`inline-block font-sans font-bold uppercase tracking-wider text-xs md:text-sm text-cream px-4 py-2 select-none -rotate-3 transition-transform ${bgClass} ${className}`}
      style={isCustomColor ? { backgroundColor: color } : undefined}
    >
      {children}
    </span>
  );
}

export default Tag;

