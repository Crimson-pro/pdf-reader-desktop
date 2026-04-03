export interface Highlight {
  id: string;
  pageNumber: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  text?: string;
}

export interface Note {
  id: string;
  pageNumber: number;
  x: number;
  y: number;
  content: string;
}

export interface PdfDocument {
  file: File;
  numPages: number;
  title?: string;
}

export interface ToolType {
  type: "select" | "highlight" | "underline" | "note";
  color: string;
}

// --- AI Types ---

export type MessageStatus = "sending" | "streaming" | "done" | "error";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  status: MessageStatus;
  timestamp: number;
}

export interface Session {
  id: string;
  tag: "inspiration" | "confusion";
  highlightText: string;
  pageNumber: number;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface AISettings {
  apiKey: string;
  baseUrl: string;
  model: string;
  roleName: string;
  roleEmoji: string;
  systemPromptOverride: string;
  temperature: number;
}

export const DEFAULT_AI_SETTINGS: AISettings = {
  apiKey: "",
  baseUrl: "https://api.openai.com/v1",
  model: "gpt-4o-mini",
  roleName: "巫布利多教授",
  roleEmoji: "🧙",
  systemPromptOverride: "",
  temperature: 0.7,
};
