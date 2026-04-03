import { useEffect, useRef, useState, useCallback } from "react";

export function useVisiblePages(
  numPages: number,
  containerRef: React.RefObject<HTMLDivElement | null>
) {
  const [visiblePages, setVisiblePages] = useState<Set<number>>(new Set());
  const visibleRef = useRef<Set<number>>(new Set());

  const observerRef = useRef<IntersectionObserver | null>(null);
  // Stores elements registered via observePage, whether or not the observer
  // exists yet.  When the observer is created it will retroactively observe
  // every element already in this map – this fixes the timing issue where
  // React ref callbacks (commit phase) fire before useEffect.
  const pendingElements = useRef<Map<number, HTMLElement>>(new Map());

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let changed = false;
        for (const entry of entries) {
          const pageNum = Number(
            (entry.target as HTMLElement).dataset.page
          );
          if (isNaN(pageNum)) continue;

          if (entry.isIntersecting) {
            if (!visibleRef.current.has(pageNum)) {
              visibleRef.current.add(pageNum);
              changed = true;
            }
          } else {
            if (visibleRef.current.has(pageNum)) {
              visibleRef.current.delete(pageNum);
              changed = true;
            }
          }
        }
        if (changed) {
          setVisiblePages(new Set(visibleRef.current));
        }
      },
      {
        root: container,
        rootMargin: "500px 0px",
        threshold: 0,
      }
    );

    observerRef.current = observer;

    // Retroactively observe any elements that were registered via
    // observePage *before* this useEffect ran (the ref-callback-first case).
    for (const [, el] of pendingElements.current) {
      observer.observe(el);
    }

    return () => {
      observer.disconnect();
      observerRef.current = null;
      visibleRef.current = new Set();
    };
  }, [containerRef, numPages]);

  const observePage = useCallback((el: HTMLElement | null, pageNum: number) => {
    const observer = observerRef.current;

    // Unobserve previous element for this page number (if any)
    const prev = pendingElements.current.get(pageNum);
    if (prev && observer) {
      observer.unobserve(prev);
    }
    pendingElements.current.delete(pageNum);

    if (el) {
      // Always store the element so the useEffect can pick it up later
      pendingElements.current.set(pageNum, el);
      // If observer already exists, observe immediately
      if (observer) {
        observer.observe(el);
      }
    }
  }, []);

  return { visiblePages, observePage };
}
