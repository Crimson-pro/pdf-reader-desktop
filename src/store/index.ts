import { create } from "zustand";
import * as pdfjsLib from "pdfjs-dist";
import {
  Highlight,
  Note,
  ToolType,
  PdfDocument,
  Session,
  AISettings,
  DEFAULT_AI_SETTINGS,
  ChatMessage,
} from "@/types";
import { storage } from "@/services/storage/persistence";

export interface PdfTab {
  id: string;
  pdfDocument: PdfDocument;
  pdfProxy: pdfjsLib.PDFDocumentProxy;
  currentPage: number;
  scale: number;
  highlights: Highlight[];
  notes: Note[];
  sessions: Session[];
  activeSessionId: string | null;
  streamingContent: Record<string, string>;
}

interface PdfStore {
  // --- Tab Management ---
  tabs: PdfTab[];
  activeTabId: string | null;
  addTab: (tab: PdfTab) => void;
  removeTab: (id: string) => void;
  setActiveTab: (id: string) => void;

  // --- PDF State (synced from active tab) ---
  pdfDocument: PdfDocument | null;
  setPdfDocument: (doc: PdfDocument | null) => void;

  pdfProxy: pdfjsLib.PDFDocumentProxy | null;
  setPdfProxy: (proxy: pdfjsLib.PDFDocumentProxy | null) => void;

  currentPage: number;
  setCurrentPage: (page: number) => void;

  scale: number;
  setScale: (scale: number) => void;

  highlights: Highlight[];
  addHighlight: (highlight: Highlight) => void;
  removeHighlight: (id: string) => void;
  clearHighlights: () => void;

  notes: Note[];
  addNote: (note: Note) => void;
  removeNote: (id: string) => void;
  updateNote: (id: string, content: string) => void;
  clearNotes: () => void;

  tool: ToolType;
  setTool: (tool: ToolType) => void;

  // --- AI Session State ---
  sessions: Session[];
  activeSessionId: string | null;
  addSession: (session: Session) => void;
  updateSession: (id: string, updates: Partial<Session>) => void;
  removeSession: (id: string) => void;
  setActiveSessionId: (id: string | null) => void;
  addMessageToSession: (sessionId: string, message: ChatMessage) => void;
  clearSessions: () => void;

  // --- AI Streaming State ---
  streamingContent: Record<string, string>;
  appendStreamChunk: (sessionId: string, chunk: string) => void;
  clearStreamContent: (sessionId: string) => void;

  // --- AI Settings ---
  aiSettings: AISettings;
  setAISettings: (settings: Partial<AISettings>) => void;
  loadPersistedSettings: () => Promise<void>;

  // --- UI State ---
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  sidebarWidth: number;
  setSidebarWidth: (width: number) => void;

  selectedNoteId: string | null;
  setSelectedNoteId: (id: string | null) => void;

  showSettings: boolean;
  setShowSettings: (show: boolean) => void;

  isAITyping: boolean;
  setIsAITyping: (typing: boolean) => void;

  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  isSaving: boolean;
  setIsSaving: (saving: boolean) => void;
}

/** Save current flat state into the active tab entry in the tabs array */
function snapshotActiveTab(state: PdfStore): PdfTab[] {
  if (!state.activeTabId || !state.pdfDocument || !state.pdfProxy) {
    return state.tabs;
  }
  return state.tabs.map((t) =>
    t.id === state.activeTabId
      ? {
          ...t,
          pdfDocument: state.pdfDocument!,
          pdfProxy: state.pdfProxy!,
          currentPage: state.currentPage,
          scale: state.scale,
          highlights: state.highlights,
          notes: state.notes,
          sessions: state.sessions,
          activeSessionId: state.activeSessionId,
          streamingContent: state.streamingContent,
        }
      : t
  );
}

/** Extract flat state fields from a tab */
function hydrateFromTab(tab: PdfTab) {
  return {
    pdfDocument: tab.pdfDocument,
    pdfProxy: tab.pdfProxy,
    currentPage: tab.currentPage,
    scale: tab.scale,
    highlights: tab.highlights,
    notes: tab.notes,
    sessions: tab.sessions,
    activeSessionId: tab.activeSessionId,
    streamingContent: tab.streamingContent,
  };
}

export const usePdfStore = create<PdfStore>((set, get) => ({
  // --- Tab Management ---
  tabs: [],
  activeTabId: null,

  addTab: (tab) => {
    const state = get();
    const updatedTabs = snapshotActiveTab(state);
    set({
      tabs: [...updatedTabs, tab],
      activeTabId: tab.id,
      ...hydrateFromTab(tab),
    });
  },

  removeTab: (id) => {
    const state = get();
    const newTabs = state.tabs.filter((t) => t.id !== id);

    if (state.activeTabId === id) {
      if (newTabs.length > 0) {
        const oldIndex = state.tabs.findIndex((t) => t.id === id);
        const newIndex = Math.min(oldIndex, newTabs.length - 1);
        const nextTab = newTabs[newIndex];
        set({
          tabs: newTabs,
          activeTabId: nextTab.id,
          ...hydrateFromTab(nextTab),
        });
      } else {
        set({
          tabs: [],
          activeTabId: null,
          pdfDocument: null,
          pdfProxy: null,
          currentPage: 1,
          scale: 1.0,
          highlights: [],
          notes: [],
          sessions: [],
          activeSessionId: null,
          streamingContent: {},
          sidebarOpen: false,
        });
      }
    } else {
      set({ tabs: newTabs });
    }
  },

  setActiveTab: (id) => {
    const state = get();
    if (state.activeTabId === id) return;

    const updatedTabs = snapshotActiveTab(state);
    const newTab = updatedTabs.find((t) => t.id === id);
    if (!newTab) return;

    set({
      tabs: updatedTabs,
      activeTabId: id,
      ...hydrateFromTab(newTab),
    });
  },

  // --- PDF State ---
  pdfDocument: null,
  setPdfDocument: (doc) => set({ pdfDocument: doc }),

  pdfProxy: null,
  setPdfProxy: (proxy) => set({ pdfProxy: proxy }),

  currentPage: 1,
  setCurrentPage: (page) => set({ currentPage: page }),

  scale: 1.0,
  setScale: (scale) => set({ scale }),

  highlights: [],
  addHighlight: (highlight) =>
    set((state) => ({ highlights: [...state.highlights, highlight] })),
  removeHighlight: (id) =>
    set((state) => ({
      highlights: state.highlights.filter((h) => h.id !== id),
    })),
  clearHighlights: () => set({ highlights: [] }),

  notes: [],
  addNote: (note) => set((state) => ({ notes: [...state.notes, note] })),
  removeNote: (id) =>
    set((state) => ({ notes: state.notes.filter((n) => n.id !== id) })),
  updateNote: (id, content) =>
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? { ...n, content } : n)),
    })),
  clearNotes: () => set({ notes: [] }),

  tool: { type: "select", color: "#FFEB3B" },
  setTool: (tool) => set({ tool }),

  // --- AI Session State ---
  sessions: [],
  activeSessionId: null,
  addSession: (session) =>
    set((state) => ({ sessions: [...state.sessions, session] })),
  updateSession: (id, updates) =>
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === id ? { ...s, ...updates, updatedAt: Date.now() } : s
      ),
    })),
  removeSession: (id) =>
    set((state) => ({
      sessions: state.sessions.filter((s) => s.id !== id),
      activeSessionId:
        state.activeSessionId === id ? null : state.activeSessionId,
    })),
  setActiveSessionId: (id) => set({ activeSessionId: id }),
  addMessageToSession: (sessionId, message) =>
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              messages: [...s.messages, message],
              updatedAt: Date.now(),
            }
          : s
      ),
    })),
  clearSessions: () => set({ sessions: [], activeSessionId: null }),

  // --- AI Streaming State ---
  streamingContent: {},
  appendStreamChunk: (sessionId, chunk) =>
    set((state) => ({
      streamingContent: {
        ...state.streamingContent,
        [sessionId]: (state.streamingContent[sessionId] ?? "") + chunk,
      },
    })),
  clearStreamContent: (sessionId) =>
    set((state) => {
      const { [sessionId]: _, ...rest } = state.streamingContent;
      return { streamingContent: rest };
    }),

  // --- AI Settings ---
  aiSettings: DEFAULT_AI_SETTINGS,
  setAISettings: (settings) =>
    set((state) => {
      const newSettings = { ...state.aiSettings, ...settings };
      storage.set("ai-settings", newSettings);
      return { aiSettings: newSettings };
    }),
  loadPersistedSettings: async () => {
    const saved = await storage.get<AISettings>("ai-settings", DEFAULT_AI_SETTINGS);
    set({ aiSettings: { ...DEFAULT_AI_SETTINGS, ...saved } });
    const savedWidth = await storage.get<number>("sidebar-width", 384);
    set({ sidebarWidth: savedWidth });
  },

  // --- UI State ---
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  sidebarWidth: 384,
  setSidebarWidth: (width) => {
    set({ sidebarWidth: width });
    storage.set("sidebar-width", width);
  },

  selectedNoteId: null,
  setSelectedNoteId: (id) => set({ selectedNoteId: id }),

  showSettings: false,
  setShowSettings: (show) => set({ showSettings: show }),

  isAITyping: false,
  setIsAITyping: (typing) => set({ isAITyping: typing }),

  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),

  isSaving: false,
  setIsSaving: (saving) => set({ isSaving: saving }),
}));
