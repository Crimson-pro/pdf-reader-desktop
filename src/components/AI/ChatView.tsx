import { useRef, useEffect } from "react";
import { usePdfStore } from "@/store";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import type { Session } from "@/types";

interface ChatViewProps {
  session: Session;
  onSendMessage: (message: string) => void;
  onRetry?: (messageId: string) => void;
}

export function ChatView({ session, onSendMessage }: ChatViewProps) {
  const { isAITyping, streamingContent } = usePdfStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isInspiration = session.tag === "inspiration";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session.messages, streamingContent[session.id]]);

  return (
    <div className="flex flex-col h-full">
      {/* Context header */}
      <div className="p-3 border-b border-slate-200 bg-slate-50 shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              isInspiration
                ? "bg-green-100 text-green-700"
                : "bg-orange-100 text-orange-700"
            }`}
          >
            {isInspiration ? "💡 灵感" : "❓ 困惑"}
          </span>
          <span className="text-xs text-slate-400">
            第 {session.pageNumber} 页
          </span>
        </div>
        <p className="text-sm text-slate-600 italic bg-white p-2.5 rounded-lg line-clamp-3">
          &ldquo;{session.highlightText}&rdquo;
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {session.messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            streamingContent={
              msg.status === "streaming"
                ? streamingContent[session.id]
                : undefined
            }
          />
        ))}
        {isAITyping &&
          !session.messages.some((m) => m.status === "streaming") && (
            <div className="max-w-[85%] mr-auto">
              <div className="bg-slate-100 text-slate-500 p-3 rounded-xl rounded-bl-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={onSendMessage} disabled={isAITyping} />
    </div>
  );
}
