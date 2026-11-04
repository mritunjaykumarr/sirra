import React from "react";
import Link from "next/link";
import Tag from "@/components/ui/Tag";

export default function NotFound() {
  return (
    <section className="w-full min-h-[75vh] flex flex-col items-center justify-center bg-cream text-ink text-center px-6 py-24">
      <div className="max-w-md mx-auto flex flex-col items-center gap-4">
        <Tag color="rust">404 · NOT FOUND</Tag>
        <h1 className="font-display font-light text-5xl md:text-6xl text-ink leading-tight">
          Page not found
        </h1>
        <p className="font-sans text-xs uppercase tracking-widest text-ink/70 max-w-sm mb-4">
          This page does not exist or has moved. Explore the four scents in the collection.
        </p>
        <Link
          href="/#collection"
          className="px-6 py-3 bg-ink text-cream font-sans text-xs uppercase tracking-wider font-semibold transition-colors hover:bg-ink/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          Discover the collection
        </Link>
      </div>
    </section>
  );
}

