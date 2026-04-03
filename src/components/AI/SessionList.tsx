import type { Session } from "@/types";

interface SessionListProps {
  sessions: Session[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
}

export function SessionList({
  sessions,
  activeSessionId,
  onSelectSession,
  onDeleteSession,
}: SessionListProps) {
  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 p-8">
        <div className="text-4xl mb-4">💭</div>
        <p className="text-center text-sm">在 PDF 中划选文本，</p>
        <p className="text-center text-sm">
          点击&ldquo;灵感&rdquo;或&ldquo;困惑&rdquo;开始对话
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full">
      {sessions.map((session) => (
        <div
          key={session.id}
          className={`group relative w-full text-left p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer ${
            activeSessionId === session.id ? "bg-blue-50" : ""
          }`}
          onClick={() => onSelectSession(session.id)}
        >
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`px-2 py-0.5 rounded text-xs font-semibold ${
                session.tag === "inspiration"
                  ? "bg-green-100 text-green-700"
                  : "bg-orange-100 text-orange-700"
              }`}
            >
              {session.tag === "inspiration" ? "💡" : "❓"}
            </span>
            <span className="text-xs text-slate-500">
              第 {session.pageNumber} 页
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteSession(session.id);
              }}
              className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500 text-xs px-1.5 py-0.5 rounded hover:bg-red-50"
              title="删除会话"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-slate-700 line-clamp-2">
            {session.highlightText}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {session.messages.length} 条消息
          </p>
        </div>
      ))}
    </div>
  );
}
