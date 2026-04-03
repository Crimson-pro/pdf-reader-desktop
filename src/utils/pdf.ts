import * as pdfjsLib from "pdfjs-dist";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Highlight, Note } from "@/types";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export async function loadPdf(
  file: File,
  onProgress?: (percent: number) => void
): Promise<pdfjsLib.PDFDocumentProxy> {
  try {
    // Use blob URL instead of copying entire file into ArrayBuffer.
    // pdfjs can range-read from the URL, avoiding full memory copy upfront.
    const url = URL.createObjectURL(file);

    const loadingTask = pdfjsLib.getDocument({
      url,
      useSystemFonts: true,
      // Only fetch page data when that page is actually requested,
      // instead of downloading the entire PDF structure at once.
      disableAutoFetch: true,
      // Allow pdfjs to stream data in chunks.
      disableStream: false,
    });

    if (onProgress) {
      loadingTask.onProgress = (progress: { loaded: number; total: number }) => {
        if (progress.total > 0) {
          onProgress(Math.round((progress.loaded / progress.total) * 100));
        }
      };
    }

    const pdf = await loadingTask.promise;

    // Revoke after pdfjs has opened the document (it caches internally)
    URL.revokeObjectURL(url);

    return pdf;
  } catch (error) {
    console.error("PDF load error:", error);
    throw error;
  }
}

export async function renderPage(
  page: pdfjsLib.PDFPageProxy,
  scale: number,
  canvas: HTMLCanvasElement
) {
  const viewport = page.getViewport({ scale });
  const context = canvas.getContext("2d")!;
  canvas.height = viewport.height;
  canvas.width = viewport.width;

  const renderContext = {
    canvasContext: context,
    viewport: viewport,
  };

  await page.render(renderContext).promise;
}

export async function savePdfWithAnnotations(
  originalFile: File,
  highlights: Highlight[],
  notes: Note[]
): Promise<Uint8Array> {
  const arrayBuffer = await originalFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pages = pdfDoc.getPages();
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  for (const highlight of highlights) {
    const pageIndex = highlight.pageNumber - 1;
    if (pageIndex >= 0 && pageIndex < pages.length) {
      const page = pages[pageIndex];
      const { height } = page.getSize();

      const color = hexToRgb(highlight.color);
      page.drawRectangle({
        x: highlight.x1,
        y: height - highlight.y2,
        width: highlight.x2 - highlight.x1,
        height: highlight.y2 - highlight.y1,
        color: rgb(color.r, color.g, color.b),
        opacity: 0.4,
      });
    }
  }

  for (const note of notes) {
    const pageIndex = note.pageNumber - 1;
    if (pageIndex >= 0 && pageIndex < pages.length) {
      const page = pages[pageIndex];
      const { height } = page.getSize();

      page.drawText(note.content, {
        x: note.x,
        y: height - note.y,
        size: 10,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });

      page.drawCircle({
        x: note.x - 10,
        y: height - note.y + 10,
        size: 8,
        color: rgb(1, 0.8, 0),
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      });
    }
  }

  return pdfDoc.save();
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255,
      }
    : { r: 1, g: 1, b: 0.2 };
}

export function downloadPdf(bytes: Uint8Array, filename: string) {
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
