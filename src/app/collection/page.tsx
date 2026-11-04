"use client";

import React, { useState, useEffect, useRef, useTransition, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  CollectionHero,
  FilterBar,
  ProductCard,
  ProductDrawer,
} from "@/components/collection";
import { PRODUCTS, getProduct } from "@/content";
import { useGsap, fadeUpStagger, refreshScroll } from "@/lib/motion";

function CollectionContent() {
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  // Read initial query params from URL
  const initialFamilyParam = searchParams.get("family");
  const initialOpenParam = searchParams.get("open");

  const [activeFamily, setActiveFamily] = useState<string>(() => {
    if (!initialFamilyParam) return "All";
    const match = ["All", "Fresh", "Woody", "Amber", "Spicy", "Floral", "Gourmand"].find(
      (f) => f.toLowerCase() === initialFamilyParam.toLowerCase()
    );
    return match || "All";
  });

  const [openedSlug, setOpenedSlug] = useState<string | null>(() => {
    if (!initialOpenParam) return null;
    return getProduct(initialOpenParam) ? initialOpenParam : null;
  });

  const gridRef = useRef<HTMLDivElement>(null);

  useGsap(() => {
    if (gridRef.current) {
      const cards = gridRef.current.querySelectorAll(".product-card");
      fadeUpStagger(Array.from(cards), {
        trigger: gridRef.current,
        start: "top 80%",
        stagger: 0.1,
      });
    }
  }, [], gridRef);

  useEffect(() => {
    refreshScroll();
  }, []);

  // Sync state with URL without triggering full page reload or scrolling
  const updateUrl = (newFamily: string, newOpen: string | null) => {
    startTransition(() => {
      const params = new URLSearchParams();
      if (newFamily.toLowerCase() !== "all") {
        params.set("family", newFamily.toLowerCase());
      }
      if (newOpen) {
        params.set("open", newOpen);
      }
      const queryString = params.toString();
      const newUrl = queryString ? `/collection?${queryString}` : "/collection";
      window.history.replaceState(null, "", newUrl);
    });
  };

  const handleSelectFamily = (family: string) => {
    setActiveFamily(family);
    updateUrl(family, openedSlug);
  };

  const handleOpenDrawer = (slug: string) => {
    setOpenedSlug(slug);
    updateUrl(activeFamily, slug);
  };

  const handleCloseDrawer = () => {
    setOpenedSlug(null);
    updateUrl(activeFamily, null);
  };

  // Filter calculation
  const isFamilyMatch = (families: string[]) => {
    if (activeFamily.toLowerCase() === "all") return true;
    return families.some((f) => f.toLowerCase() === activeFamily.toLowerCase());
  };

  const matchingCount = PRODUCTS.filter((p) => isFamilyMatch(p.families)).length;
  const openedProduct = openedSlug ? getProduct(openedSlug) || null : null;

  return (
    <div className="w-full flex flex-col bg-grey min-h-screen">
      {/* 1. Hero Band (ink, 60svh) */}
      <CollectionHero />

      {/* 2. Sticky Filter Bar */}
      <FilterBar
        activeFamily={activeFamily}
        onSelectFamily={handleSelectFamily}
        matchingCount={matchingCount}
      />

      {/* 3. Product Grid (4 cols desktop, 2 tablet, 1 mobile; 4px gap) */}
      <section className="w-full py-12 md:py-20 px-5 md:px-10">
        <div className="max-w-[1440px] mx-auto">
          <div
            ref={gridRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1"
          >
            {PRODUCTS.map((product) => {
              const isMatch = isFamilyMatch(product.families);
              return (
                <ProductCard
                  key={product.slug}
                  product={product}
                  isMatching={isMatch}
                  onOpenDrawer={handleOpenDrawer}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Product Drawer */}
      <ProductDrawer
        product={openedProduct}
        onClose={handleCloseDrawer}
        onSelectProduct={handleOpenDrawer}
      />
    </div>
  );
}

export default function CollectionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-grey" />}>
      <CollectionContent />
    </Suspense>
  );
}

