import React from "react";

export type SectionBackground = "ink" | "cream" | "grey";

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  bg?: SectionBackground;
  children: React.ReactNode;
  id?: string;
  className?: string;
  containerClassName?: string;
  fullWidth?: boolean;
}

const bgClasses: Record<SectionBackground, string> = {
  ink: "bg-ink text-cream",
  cream: "bg-cream text-ink",
  grey: "bg-grey text-ink",
};

export function Section({
  bg = "cream",
  children,
  id,
  className = "",
  containerClassName = "",
  fullWidth = false,
  ...rest
}: SectionProps) {
  return (
    <section
      id={id}
      className={`py-[72px] md:py-[120px] transition-colors ${bgClasses[bg]} ${className}`}
      {...rest}
    >
      {fullWidth ? (
        children
      ) : (
        <div className={`max-w-7xl mx-auto px-6 md:px-12 ${containerClassName}`}>
          {children}
        </div>
      )}
    </section>
  );
}

export default Section;

