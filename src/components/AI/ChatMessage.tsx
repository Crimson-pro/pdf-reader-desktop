import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ChatMessage as ChatMessageType } from "@/types";

interface ChatMessageProps {
  message: ChatMessageType;
  streamingContent?: string;
}

export function ChatMessage({ message, streamingContent }: ChatMessageProps) {
  const isUser = message.role === "user";
  const isStreaming = message.status === "streaming";
  const content =
    isStreaming && streamingContent ? streamingContent : message.content;

  return (
    <div className={`max-w-[85%] ${isUser ? "ml-auto" : "mr-auto"}`}>
      <div
        className={`p-3 rounded-xl ${
          isUser
            ? "bg-blue-600 text-white rounded-br-sm"
            : "bg-slate-100 text-slate-800 rounded-bl-sm"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap text-sm">{content}</p>
        ) : (
          <div className="markdown-body text-sm">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content || " "}
            </ReactMarkdown>
            {isStreaming && (
              <span className="inline-block w-1.5 h-4 bg-slate-400 animate-pulse ml-0.5 align-text-bottom" />
            )}
          </div>
        )}
      </div>
      {message.status === "error" && (
        <p className="text-xs text-red-500 mt-1 ml-1">发送失败</p>
      )}
    </div>
  );
}
