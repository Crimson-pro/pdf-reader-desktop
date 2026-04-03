import { useRef, useState } from "react";
import { nanoid } from "nanoid";
import { usePdfStore } from "@/store";
import toast from "react-hot-toast";
import { savePdfWithAnnotations, downloadPdf } from "@/utils/pdf";
import { loadPdf } from "@/utils/pdf";

export function Header() {
  const {
    pdfDocument,
    addTab,
    scale,
    setScale,
    showSettings,
    setShowSettings,
    sidebarOpen,
    setSidebarOpen,
    sessions,
    highlights,
    notes,
    isSaving,
    setIsSaving,
    setIsLoading,
  } = usePdfStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pageInput, setPageInput] = useState("");
  const [isEditingPage, setIsEditingPage] = useState(false);

  const numPages = pdfDocument?.numPages ?? 0;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const pdf = await loadPdf(file);
      addTab({
        id: nanoid(),
        pdfDocument: {
          file,
          numPages: pdf.numPages,
          title: file.name.replace(".pdf", ""),
        },
        pdfProxy: pdf,
        currentPage: 1,
        scale: 1.0,
        highlights: [],
        notes: [],
        sessions: [],
        activeSessionId: null,
        streamingContent: {},
      });
    } catch (error) {
      console.error("Failed to load PDF:", error);
      toast.error(
        `加载 PDF 失败：${error instanceof Error ? error.message : "未知错误"}`
      );
    } finally {
      setIsLoading(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleSave = async () => {
    if (!pdfDocument) return;
    setIsSaving(true);
    try {
      const bytes = await savePdfWithAnnotations(
        pdfDocument.file,
        highlights,
        notes
      );
      const filename = pdfDocument.file.name.replace(".pdf", "_annotated.pdf");
      downloadPdf(bytes, filename);
      toast.success("PDF 保存成功");
    } catch (error) {
      console.error("Failed to save PDF:", error);
      toast.error("保存 PDF 失败，请重试。");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePageJump = () => {
    const page = parseInt(pageInput, 10);
    if (isNaN(page) || page < 1 || page > numPages) {
      toast.error(`请输入 1 到 ${numPages} 之间的页码`);
      setIsEditingPage(false);
      return;
    }
    const el = document.querySelector(`[data-page="${page}"]`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    usePdfStore.getState().setCurrentPage(page);
    setIsEditingPage(false);
  };

  return (
    <header className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shadow-sm shrink-0">
      {/* Left section */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-xl">📄</span>
          <h1 className="text-base font-bold text-slate-800 hidden sm:block">
            {pdfDocument?.title || "PDF 阅读器"}
          </h1>
        </div>
        <input
          type="file"
          accept="application/pdf"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-1.5 text-sm"
          title="Ctrl+O"
        >
          <span>📂</span>
          打开
        </button>
      </div>

      {/* Center section - page navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setScale(Math.max(0.5, scale - 0.25))}
          className="w-8 h-8 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-semibold text-sm flex items-center justify-center"
          title="Ctrl+-"
        >
          −
        </button>
        <span className="text-xs text-slate-600 font-medium w-12 text-center">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={() => setScale(Math.min(3, scale + 0.25))}
          className="w-8 h-8 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-semibold text-sm flex items-center justify-center"
          title="Ctrl+="
        >
          +
        </button>

        {numPages > 0 && (
          <>
            <div className="w-px h-6 bg-slate-300 mx-1" />
            {isEditingPage ? (
              <input
                type="text"
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                onBlur={() => setIsEditingPage(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handlePageJump();
                  if (e.key === "Escape") setIsEditingPage(false);
                }}
                className="w-16 text-center text-sm border border-blue-400 rounded px-1 py-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            ) : (
              <button
                onClick={() => {
                  setPageInput("");
                  setIsEditingPage(true);
                }}
                className="text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 px-2 py-0.5 rounded transition-colors"
                title="点击跳转到指定页码"
              >
                共 {numPages} 页
              </button>
            )}
          </>
        )}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-sm ${
            showSettings
              ? "bg-purple-100 text-purple-700"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <span>⚙️</span>
          设置
        </button>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-sm ${
            sidebarOpen
              ? "bg-blue-100 text-blue-700"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
          title="Ctrl+B"
        >
          <span>💬</span>
          对话
          {sessions.length > 0 && (
            <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {sessions.length}
            </span>
          )}
        </button>

        <div className="w-px h-6 bg-slate-300" />

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-3 py-1.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-1.5 text-sm"
          title="Ctrl+S"
        >
          <span>💾</span>
          {isSaving ? "保存中..." : "保存"}
        </button>
      </div>
    </header>
  );
}
