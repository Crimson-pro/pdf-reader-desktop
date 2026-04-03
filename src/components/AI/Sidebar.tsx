import { useState, useRef, useEffect, useCallback } from "react";
import { usePdfStore } from "@/store";
import { SessionList } from "./SessionList";
import { ChatView } from "./ChatView";
import { streamChat } from "@/services/ai/streaming";
import { buildSystemPrompt } from "@/services/ai/prompt-builder";
import { nanoid } from "nanoid";
import type { ChatMessage } from "@/types";

export function Sidebar() {
  const {
    sidebarOpen,
    sidebarWidth,
    setSidebarWidth,
    sessions,
    activeSessionId,
    setActiveSessionId,
    removeSession,
    addMessageToSession,
    aiSettings,
    setIsAITyping,
    appendStreamChunk,
    clearStreamContent,
  } = usePdfStore();

  const [isDragging, setIsDragging] = useState(false);
  const abortRef = useRef<{ abort: () => void } | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  // Drag to resize
  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      const startX = e.clientX;
      const startWidth = sidebarWidth;

      const handleMove = (e: MouseEvent) => {
        const delta = startX - e.clientX;
        const newWidth = Math.max(280, Math.min(window.innerWidth * 0.5, startWidth + delta));
        setSidebarWidth(newWidth);
      };

      const handleUp = () => {
        setIsDragging(false);
        document.removeEventListener("mousemove", handleMove);
        document.removeEventListener("mouseup", handleUp);
      };

      document.addEventListener("mousemove", handleMove);
      document.addEventListener("mouseup", handleUp);
    },
    [sidebarWidth, setSidebarWidth]
  );

  // Handle continue chat with streaming
  const handleSendMessage = useCallback(
    (message: string) => {
      if (!activeSession || !aiSettings.apiKey) return;

      const userMsg: ChatMessage = {
        id: nanoid(),
        role: "user",
        content: message,
        status: "done",
        timestamp: Date.now(),
      };
      addMessageToSession(activeSession.id, userMsg);

      // Create placeholder assistant message
      const assistantMsgId = nanoid();
      const assistantMsg: ChatMessage = {
        id: assistantMsgId,
        role: "assistant",
        content: "",
        status: "streaming",
        timestamp: Date.now(),
      };
      addMessageToSession(activeSession.id, assistantMsg);
      setIsAITyping(true);

      const systemPrompt = buildSystemPrompt(activeSession.tag, aiSettings);
      const messages = [
        { role: "system", content: systemPrompt },
        ...activeSession.messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        { role: "user", content: message },
      ];

      const { abort } = streamChat({
        messages,
        aiSettings,
        onChunk: (chunk) => {
          appendStreamChunk(activeSession.id, chunk);
        },
        onDone: (fullText) => {
          clearStreamContent(activeSession.id);
          // Update the placeholder message with full content
          const store = usePdfStore.getState();
          const session = store.sessions.find(
            (s) => s.id === activeSession.id
          );
          if (session) {
            const updatedMessages = session.messages.map((m) =>
              m.id === assistantMsgId
                ? { ...m, content: fullText, status: "done" as const }
                : m
            );
            store.updateSession(activeSession.id, {
              messages: updatedMessages,
            });
          }
          setIsAITyping(false);
          abortRef.current = null;
        },
        onError: (error) => {
          clearStreamContent(activeSession.id);
          const store = usePdfStore.getState();
          const session = store.sessions.find(
            (s) => s.id === activeSession.id
          );
          if (session) {
            const updatedMessages = session.messages.map((m) =>
              m.id === assistantMsgId
                ? {
                    ...m,
                    content: `抱歉，AI 服务暂时不可用，请稍后重试。\n\n(${error.message})`,
                    status: "error" as const,
                  }
                : m
            );
            store.updateSession(activeSession.id, {
              messages: updatedMessages,
            });
          }
          setIsAITyping(false);
          abortRef.current = null;
        },
      });

      abortRef.current = { abort };
    },
    [
      activeSession,
      aiSettings,
      addMessageToSession,
      setIsAITyping,
      appendStreamChunk,
      clearStreamContent,
    ]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  if (!sidebarOpen) return null;

  return (
    <div
      ref={sidebarRef}
      className="bg-white border-l border-slate-200 flex flex-col shadow-xl relative shrink-0 sidebar-enter"
      style={{ width: sidebarWidth }}
    >
      {/* Drag handle */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 transition-colors z-10 ${
          isDragging ? "bg-blue-400" : "bg-transparent"
        }`}
        onMouseDown={handleDragStart}
      />

      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">{aiSettings.roleEmoji}</span>
          <h2 className="text-lg font-bold text-slate-800">
            {aiSettings.roleName}
          </h2>
        </div>
        {activeSession && (
          <button
            onClick={() => setActiveSessionId(null)}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-1"
          >
            <span>←</span>
            返回列表
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeSession ? (
          <ChatView
            session={activeSession}
            onSendMessage={handleSendMessage}
          />
        ) : (
          <SessionList
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSelectSession={setActiveSessionId}
            onDeleteSession={removeSession}
          />
        )}
      </div>
    </div>
  );
}
