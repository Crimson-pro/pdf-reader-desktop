import { AISettings } from "@/types";

export interface StreamChatOptions {
  messages: { role: string; content: string }[];
  aiSettings: AISettings;
  onChunk: (text: string) => void;
  onDone: (fullText: string) => void;
  onError: (error: Error) => void;
}

export function streamChat(options: StreamChatOptions): { abort: () => void } {
  const { messages, aiSettings, onChunk, onDone, onError } = options;
  const controller = new AbortController();

  (async () => {
    try {
      const response = await fetch(`${aiSettings.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${aiSettings.apiKey}`,
        },
        body: JSON.stringify({
          model: aiSettings.model,
          messages,
          temperature: aiSettings.temperature,
          stream: true,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status} ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("无法读取响应流");
      }

      const decoder = new TextDecoder();
      let fullText = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;

          const data = trimmed.slice(6);
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              onChunk(content);
            }
          } catch {
            // Skip malformed JSON chunks
          }
        }
      }

      onDone(fullText);
    } catch (error) {
      if ((error as Error).name === "AbortError") return;
      onError(error instanceof Error ? error : new Error("未知错误"));
    }
  })();

  return { abort: () => controller.abort() };
}

/** Non-streaming fallback for APIs that don't support SSE */
export async function chatCompletion(
  messages: { role: string; content: string }[],
  aiSettings: AISettings
): Promise<string> {
  const response = await fetch(`${aiSettings.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${aiSettings.apiKey}`,
    },
    body: JSON.stringify({
      model: aiSettings.model,
      messages,
      temperature: aiSettings.temperature,
    }),
  });

  if (!response.ok) {
    throw new Error(`API 请求失败: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
