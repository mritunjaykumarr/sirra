import React from "react";
import Link from "next/link";

export type ButtonVariant = "dark" | "light" | "outline";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  href?: string;
  target?: string;
  rel?: string;
  className?: string;
  children: React.ReactNode;
}

export function Button({
  variant = "dark",
  href,
  target,
  rel,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-sans font-semibold uppercase text-xs md:text-sm tracking-wider px-6 py-3 transition-colors duration-200 cursor-pointer select-none text-center";

  const variantStyles = {
    dark: "bg-ink text-cream hover:bg-rust active:bg-rust",
    light: "bg-cream text-ink hover:bg-gold hover:text-ink active:bg-gold",
    outline: "border border-current bg-transparent hover:bg-ink hover:text-cream active:bg-ink",
  };

  const combinedClass = `${baseStyles} ${variantStyles[variant]} ${className}`;

  if (href) {
    const isExternal = href.startsWith("http://") || href.startsWith("https://");
    if (isExternal) {
      return (
        <a
          href={href}
          target={target ?? "_blank"}
          rel={rel ?? "noopener noreferrer"}
          className={combinedClass}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={combinedClass}>
        {children}
      </Link>
    );
  }

  return (
    <button className={combinedClass} {...rest}>
      {children}
    </button>
  );
}

export default Button;

