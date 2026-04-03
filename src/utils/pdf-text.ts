import * as pdfjsLib from "pdfjs-dist";

export interface TextItem {
  str: string;
  transform: number[];
  width: number;
  height: number;
  fontName: string;
  hasEOL: boolean;
}

export interface TextContent {
  items: TextItem[];
  styles: Record<string, any>;
}

export async function getPageTextContent(
  page: pdfjsLib.PDFPageProxy
): Promise<TextContent> {
  const textContent = await page.getTextContent();
  return textContent as unknown as TextContent;
}

export function renderTextLayer(
  textContent: TextContent,
  viewport: pdfjsLib.PageViewport,
  container: HTMLElement
) {
  container.innerHTML = "";
  container.style.position = "absolute";
  container.style.left = "0";
  container.style.top = "0";
  container.style.right = "0";
  container.style.bottom = "0";
  container.style.pointerEvents = "auto";
  container.style.zIndex = "10";

  const { items } = textContent;
  const fragment = document.createDocumentFragment();

  for (const item of items) {
    if (!item.str) continue;

    const [, , , scaleY, x, y] = item.transform;
    const textDiv = document.createElement("div");

    const transform = viewport.transform;
    const px = transform[0] * x + transform[2] * y + transform[4];
    const py = transform[1] * x + transform[3] * y + transform[5];
    const width = item.width * viewport.scale;
    const height = Math.abs(scaleY) * viewport.scale;

    textDiv.style.cssText = `
      left: ${px}px;
      top: ${py - height}px;
      width: ${width}px;
      height: ${height}px;
      font-size: ${height}px;
      font-family: ${item.fontName || "sans-serif"};
    `;
    textDiv.textContent = item.str;

    fragment.appendChild(textDiv);
  }

  container.appendChild(fragment);
}
