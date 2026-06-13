"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useInView() {
  const [isInView, setIsInView] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const ref = useCallback((node: HTMLElement | null) => {
    if (isInView) return; // If already in view, no need to observe

    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    if (node) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(node);
          }
        },
        {
          threshold: 0.15,
        }
      );
      observer.observe(node);
      observerRef.current = observer;
    }
  }, [isInView]);

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return [ref, isInView] as const;
}

