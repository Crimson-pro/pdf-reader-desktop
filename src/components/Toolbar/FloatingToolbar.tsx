interface FloatingToolbarProps {
  show: boolean;
  position: { x: number; y: number };
  onTagSelect: (tag: "inspiration" | "confusion") => void;
}

export function FloatingToolbar({
  show,
  position,
  onTagSelect,
}: FloatingToolbarProps) {
  if (!show) return null;

  return (
    <div
      className="floating-toolbar fixed z-50 bg-white rounded-xl shadow-2xl border border-slate-200 p-1.5 flex gap-1 animate-fade-in"
      style={{ left: position.x, top: position.y }}
    >
      <button
        onClick={() => onTagSelect("inspiration")}
        className="px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-1.5 font-medium text-sm"
      >
        <span>💡</span>
        灵感
      </button>
      <button
        onClick={() => onTagSelect("confusion")}
        className="px-4 py-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors flex items-center gap-1.5 font-medium text-sm"
      >
        <span>❓</span>
        困惑
      </button>
    </div>
  );
}
