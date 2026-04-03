import { useCallback, useEffect, useRef } from "react";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { nanoid } from "nanoid";
import { usePdfStore } from "@/store";
import { useTextSelection } from "@/hooks/useTextSelection";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { streamChat } from "@/services/ai/streaming";
import { buildSystemPrompt, buildUserMessage } from "@/services/ai/prompt-builder";
import { savePdfWithAnnotations, downloadPdf } from "@/utils/pdf";
import { WelcomeScreen } from "@/components/PDF/WelcomeScreen";
import { PDFViewport } from "@/components/PDF/PDFViewport";
import { Header } from "@/components/Layout/Header";
import { TabBar } from "@/components/Layout/TabBar";
import { SettingsPanel } from "@/components/Layout/SettingsPanel";
import { Sidebar } from "@/components/AI/Sidebar";
import { FloatingToolbar } from "@/components/Toolbar/FloatingToolbar";
import { InlineBubble } from "@/components/Toolbar/InlineBubble";
import type { ChatMessage } from "@/types";

function App() {
  const {
    pdfDocument,
    activeTabId,
    aiSettings,
    highlights,
    notes,
    currentPage,
    setIsAITyping,
    setSidebarOpen,
    setActiveSessionId,
    addSession,
    appendStreamChunk,
    clearStreamContent,
    updateSession,
    isSaving,
    setIsSaving,
    loadPersistedSettings,
  } = usePdfStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<{ abort: () => void } | null>(null);

  // Load persisted settings on mount
  useEffect(() => {
    loadPersistedSettings();
  }, [loadPersistedSettings]);

  const textSelection = useTextSelection();

  const handleOpenFile = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleSave = useCallback(async () => {
    if (!pdfDocument || isSaving) return;
    setIsSaving(true);
    try {
      const bytes = await savePdfWithAnnotations(pdfDocument.file, highlights, notes);
      const filename = pdfDocument.file.name.replace(".pdf", "_annotated.pdf");
      downloadPdf(bytes, filename);
      toast.success("PDF 保存成功");
    } catch (error) {
      console.error("Failed to save PDF:", error);
      toast.error("保存 PDF 失败，请重试。");
    } finally {
      setIsSaving(false);
    }
  }, [pdfDocument, highlights, notes, isSaving, setIsSaving]);

  useKeyboardShortcuts({
    onOpenFile: handleOpenFile,
    onSave: handleSave,
  });

  const handleSendToAI = useCallback(() => {
    if (!aiSettings.apiKey) {
      toast.error("请先在设置中配置 API Key");
      usePdfStore.getState().setShowSettings(true);
      return;
    }

    const sessionId = nanoid();
    const userContent = buildUserMessage(
      textSelection.selectedText,
      textSelection.bubbleMessage,
      textSelection.bubbleTag
    );

    const userMsg: ChatMessage = {
      id: nanoid(),
      role: "user",
      content: textSelection.bubbleMessage || (textSelection.bubbleTag === "inspiration" ? "请给我一些启发。" : "请帮我解释一下这段内容。"),
      status: "done",
      timestamp: Date.now(),
    };

    const assistantMsgId = nanoid();
    const assistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      status: "streaming",
      timestamp: Date.now(),
    };

    const now = Date.now();
    addSession({
      id: sessionId,
      tag: textSelection.bubbleTag,
      highlightText: textSelection.selectedText,
      pageNumber: currentPage,
      messages: [userMsg, assistantMsg],
      createdAt: now,
      updatedAt: now,
    });

    setActiveSessionId(sessionId);
    setSidebarOpen(true);
    textSelection.closeBubble();
    setIsAITyping(true);

    const systemPrompt = buildSystemPrompt(textSelection.bubbleTag, aiSettings);

    const { abort } = streamChat({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      aiSettings,
      onChunk: (chunk) => {
        appendStreamChunk(sessionId, chunk);
      },
      onDone: (fullText) => {
        clearStreamContent(sessionId);
        const store = usePdfStore.getState();
        const session = store.sessions.find((s) => s.id === sessionId);
        if (session) {
          const updatedMessages = session.messages.map((m) =>
            m.id === assistantMsgId
              ? { ...m, content: fullText, status: "done" as const }
              : m
          );
          store.updateSession(sessionId, { messages: updatedMessages });
        }
        setIsAITyping(false);
        abortRef.current = null;
      },
      onError: (error) => {
        clearStreamContent(sessionId);
        const store = usePdfStore.getState();
        const session = store.sessions.find((s) => s.id === sessionId);
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
          store.updateSession(sessionId, { messages: updatedMessages });
        }
        setIsAITyping(false);
        abortRef.current = null;
      },
    });

    abortRef.current = { abort };
  }, [
    aiSettings,
    textSelection,
    currentPage,
    addSession,
    setActiveSessionId,
    setSidebarOpen,
    setIsAITyping,
    appendStreamChunk,
    clearStreamContent,
    updateSession,
  ]);

  if (!pdfDocument) {
    return (
      <>
        <WelcomeScreen />
        <Toaster position="top-center" />
      </>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-slate-50">
      <Header />
      <TabBar />
      <SettingsPanel />

      <div className="flex-1 flex overflow-hidden">
        <PDFViewport key={activeTabId || "empty"} />
        <Sidebar />
      </div>

      <FloatingToolbar
        show={textSelection.showFloatingToolbar}
        position={textSelection.toolbarPosition}
        onTagSelect={textSelection.handleTagSelect}
      />

      <InlineBubble
        show={textSelection.showBubble}
        position={textSelection.bubblePosition}
        tag={textSelection.bubbleTag}
        selectedText={textSelection.selectedText}
        message={textSelection.bubbleMessage}
        onMessageChange={textSelection.setBubbleMessage}
        onSend={handleSendToAI}
        onClose={textSelection.closeBubble}
      />

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "12px",
            fontSize: "14px",
          },
        }}
      />
    </div>
  );
}

export default App;
