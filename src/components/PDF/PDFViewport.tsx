import { useRef, useMemo, useCallback } from "react";
import { usePdfStore } from "@/store";
import { useVisiblePages } from "@/hooks/useVisiblePages";
import { PageRenderer } from "./PageRenderer";

export function PDFViewport() {
  const { pdfProxy, pdfDocument, scale } = usePdfStore();
  const numPages = pdfDocument?.numPages ?? 0;
  const containerRef = useRef<HTMLDivElement>(null);
  const { visiblePages, observePage } = useVisiblePages(numPages, containerRef);

  const pageNumbers = useMemo(
    () => Array.from({ length: numPages }, (_, i) => i + 1),
    [numPages]
  );

  const pageRefCallback = useCallback(
    (pageNum: number) => (el: HTMLDivElement | null) => {
      observePage(el, pageNum);
    },
    [observePage]
  );

  if (!pdfProxy) return null;

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-auto bg-slate-200 p-8 scroll-smooth"
      id="pdf-viewport"
    >
      <div className="flex flex-col items-center gap-4">
        {pageNumbers.map((pageNum) => (
          <div
            key={pageNum}
            data-page={pageNum}
            ref={pageRefCallback(pageNum)}
            className="w-full flex justify-center"
          >
            {visiblePages.has(pageNum) ? (
              <PageRenderer
                pageNumber={pageNum}
                pdfProxy={pdfProxy}
                scale={scale}
              />
            ) : (
              <div
                className="bg-white shadow-lg rounded-lg flex items-center justify-center animate-pulse"
                style={{ width: 595 * scale, height: 842 * scale }}
              >
                <span className="text-slate-400 text-sm">
                  第 {pageNum} 页
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
