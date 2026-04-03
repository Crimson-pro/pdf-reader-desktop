import { usePdfStore } from "@/store";

export function TabBar() {
  const { tabs, activeTabId, setActiveTab, removeTab } = usePdfStore();

  if (tabs.length === 0) return null;

  return (
    <div className="bg-white border-b border-slate-200 flex items-center px-1 overflow-x-auto shrink-0">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        return (
          <div
            key={tab.id}
            className={`group flex items-center gap-1.5 px-3 py-1.5 text-sm cursor-pointer border-b-2 transition-colors min-w-0 max-w-[200px] ${
              isActive
                ? "border-blue-600 text-blue-700 bg-blue-50/50"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="text-xs">📄</span>
            <span className="truncate text-xs">
              {tab.pdfDocument.title || "未命名"}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeTab(tab.id);
              }}
              className="shrink-0 w-4 h-4 flex items-center justify-center rounded hover:bg-slate-200 text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity text-xs leading-none"
            >
              x
            </button>
          </div>
        );
      })}
    </div>
  );
}
