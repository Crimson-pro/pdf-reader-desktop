interface InlineBubbleProps {
  show: boolean;
  position: { x: number; y: number };
  tag: "inspiration" | "confusion";
  selectedText: string;
  message: string;
  onMessageChange: (msg: string) => void;
  onSend: () => void;
  onClose: () => void;
}

export function InlineBubble({
  show,
  position,
  tag,
  selectedText,
  message,
  onMessageChange,
  onSend,
  onClose,
}: InlineBubbleProps) {
  if (!show) return null;

  return (
    <div
      className="inline-bubble fixed z-50 bg-white rounded-xl shadow-2xl border border-slate-200 p-4 w-80 animate-fade-in"
      style={{ left: position.x, top: position.y }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            tag === "inspiration"
              ? "bg-green-100 text-green-700"
              : "bg-orange-100 text-orange-700"
          }`}
        >
          {tag === "inspiration" ? "💡 灵感" : "❓ 困惑"}
        </span>
      </div>
      <div className="text-sm text-slate-600 mb-3 bg-slate-50 p-3 rounded-lg italic line-clamp-3">
        &ldquo;{selectedText}&rdquo;
      </div>
      <textarea
        value={message}
        onChange={(e) => onMessageChange(e.target.value)}
        placeholder={
          tag === "inspiration" ? "分享你的想法..." : "描述你的困惑..."
        }
        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-3 text-sm"
        rows={3}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            onSend();
          }
        }}
        autoFocus
      />
      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          className="px-4 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm"
        >
          取消
        </button>
        <button
          onClick={onSend}
          className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all text-sm"
        >
          发送
        </button>
      </div>
    </div>
  );
}
