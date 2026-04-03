import { useRef, useState } from "react";
import { nanoid } from "nanoid";
import { usePdfStore } from "@/store";
import { loadPdf } from "@/utils/pdf";
import toast from "react-hot-toast";

export function WelcomeScreen() {
  const { isLoading, setIsLoading, addTab } = usePdfStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loadProgress, setLoadProgress] = useState(0);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setLoadProgress(0);
    try {
      const pdf = await loadPdf(file, (percent) => {
        setLoadProgress(percent);
      });
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
      setLoadProgress(0);
      if (e.target) e.target.value = "";
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="text-center">
        <div className="text-6xl mb-6">📄</div>
        <h1 className="text-4xl font-bold text-slate-800 mb-4">PDF 阅读器</h1>
        <p className="text-slate-600 mb-8 text-lg">
          支持高亮、划线、备注、AI 对话，并可保存到 PDF
        </p>
        <input
          type="file"
          accept="application/pdf"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-lg font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl active:scale-95"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              加载中 {loadProgress > 0 ? `${loadProgress}%` : "..."}
            </span>
          ) : (
            "打开 PDF 文件"
          )}
        </button>
        {isLoading && loadProgress > 0 && (
          <div className="mt-4 w-64 mx-auto">
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${loadProgress}%` }}
              />
            </div>
          </div>
        )}
        <p className="text-slate-400 text-sm mt-4">
          支持快捷键 Ctrl+O 打开文件
        </p>
      </div>
    </div>
  );
}
