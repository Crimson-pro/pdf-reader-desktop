import { usePdfStore } from "@/store";
import type { AISettings } from "@/types";

export function SettingsPanel() {
  const { showSettings, setShowSettings, aiSettings, setAISettings } =
    usePdfStore();

  if (!showSettings) return null;

  const updateField = <K extends keyof AISettings>(
    key: K,
    value: AISettings[K]
  ) => {
    setAISettings({ [key]: value });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={() => setShowSettings(false)}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-800">AI 助手配置</h3>
            <button
              onClick={() => setShowSettings(false)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* API Settings */}
          <div className="mb-8">
            <h4 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">
              接口配置
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  API Key
                </label>
                <input
                  type="password"
                  placeholder="sk-..."
                  value={aiSettings.apiKey}
                  onChange={(e) => updateField("apiKey", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Base URL
                </label>
                <input
                  type="text"
                  placeholder="https://api.openai.com/v1"
                  value={aiSettings.baseUrl}
                  onChange={(e) => updateField("baseUrl", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  模型
                </label>
                <input
                  type="text"
                  placeholder="gpt-4o-mini"
                  value={aiSettings.model}
                  onChange={(e) => updateField("model", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Role Customization */}
          <div className="mb-8">
            <h4 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">
              角色自定义
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  角色名称
                </label>
                <input
                  type="text"
                  placeholder="巫布利多教授"
                  value={aiSettings.roleName}
                  onChange={(e) => updateField("roleName", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  角色 Emoji
                </label>
                <input
                  type="text"
                  placeholder="🧙"
                  value={aiSettings.roleEmoji}
                  onChange={(e) => updateField("roleEmoji", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  maxLength={4}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  温度 (Temperature)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={aiSettings.temperature}
                    onChange={(e) =>
                      updateField("temperature", parseFloat(e.target.value))
                    }
                    className="flex-1 accent-purple-600"
                  />
                  <span className="text-sm text-slate-600 w-10 text-center font-mono">
                    {aiSettings.temperature.toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  自定义系统 Prompt（留空使用默认）
                </label>
                <textarea
                  placeholder="留空则使用默认的灵感/困惑提示词..."
                  value={aiSettings.systemPromptOverride}
                  onChange={(e) =>
                    updateField("systemPromptOverride", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm resize-none"
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowSettings(false)}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all text-sm font-medium"
            >
              完成
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
