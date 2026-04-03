import { useEffect, useRef, useState, memo } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { renderPage } from "@/utils/pdf";
import { getPageTextContent, renderTextLayer } from "@/utils/pdf-text";

interface PageRendererProps {
  pageNumber: number;
  pdfProxy: pdfjsLib.PDFDocumentProxy;
  scale: number;
}

export const PageRenderer = memo(function PageRenderer({
  pageNumber,
  pdfProxy,
  scale,
}: PageRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const renderTaskRef = useRef<number>(0);

  useEffect(() => {
    if (!pdfProxy || !canvasRef.current) return;

    const taskId = ++renderTaskRef.current;

    const render = async () => {
      try {
        const page = await pdfProxy.getPage(pageNumber);

        // Check if this render task is still current
        if (taskId !== renderTaskRef.current) return;

        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        setCanvasSize({ width: viewport.width, height: viewport.height });

        await renderPage(page, scale, canvas);

        if (taskId !== renderTaskRef.current) return;

        if (textLayerRef.current) {
          const textContent = await getPageTextContent(page);
          if (taskId !== renderTaskRef.current) return;
          const textViewport = page.getViewport({ scale });
          renderTextLayer(textContent, textViewport, textLayerRef.current);
        }
      } catch (err) {
        if (taskId === renderTaskRef.current) {
          console.error(`Failed to render page ${pageNumber}:`, err);
        }
      }
    };

    render();

    return () => {
      // Cleanup text layer on unmount or re-render
      if (textLayerRef.current) {
        textLayerRef.current.innerHTML = "";
      }
    };
  }, [pdfProxy, pageNumber, scale]);

  return (
    <div
      className="bg-white shadow-lg rounded-lg overflow-hidden"
      style={{ width: canvasSize.width || "auto" }}
    >
      <div className="bg-slate-100 px-4 py-1.5 text-xs text-slate-500 border-b border-slate-200 flex items-center justify-between">
        <span className="font-medium">第 {pageNumber} 页</span>
      </div>
      <div
        className="relative"
        style={{ width: canvasSize.width, height: canvasSize.height }}
      >
        <canvas
          ref={canvasRef}
          className="block"
          style={{ width: canvasSize.width, height: canvasSize.height }}
        />
        <div
          ref={textLayerRef}
          className="text-layer absolute top-0 left-0"
          style={{
            width: canvasSize.width,
            height: canvasSize.height,
          }}
        />
      </div>
    </div>
  );
});
