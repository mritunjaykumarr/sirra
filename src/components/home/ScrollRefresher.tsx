"use client";

import { useEffect } from "react";
import { refreshScroll } from "@/lib/motion";

export function ScrollRefresher() {
  useEffect(() => {
    refreshScroll();
    const timer = setTimeout(() => {
      refreshScroll();
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  return null;
}

export default ScrollRefresher;

