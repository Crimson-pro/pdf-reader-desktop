import { AISettings } from "@/types";

export function buildSystemPrompt(
  tag: "inspiration" | "confusion",
  aiSettings: AISettings
): string {
  if (aiSettings.systemPromptOverride.trim()) {
    return aiSettings.systemPromptOverride;
  }

  const roleIntro = `你的名字是${aiSettings.roleName}。`;

  const tagPrompt =
    tag === "inspiration"
      ? "你是一个善于启发思考的阅读助手。请围绕这段文本，引导用户深入思考，可以提出一些启发性的问题，或者分享相关的见解。"
      : "你是一个耐心的解疑答惑助手。请详细解释这段文本的内容，用通俗易懂的方式帮助用户理解。";

  return `${roleIntro}${tagPrompt}`;
}

export function buildUserMessage(
  selectedText: string,
  userMessage: string,
  tag: "inspiration" | "confusion"
): string {
  const defaultMessage =
    tag === "inspiration"
      ? "请给我一些启发。"
      : "请帮我解释一下这段内容。";

  const message = userMessage.trim() || defaultMessage;
  return `请分析以下文本：\n\n"${selectedText}"\n\n${message}`;
}
