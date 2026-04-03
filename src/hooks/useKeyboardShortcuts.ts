import { useEffect } from "react";
import { usePdfStore } from "@/store";

interface KeyboardShortcutsOptions {
  onOpenFile: () => void;
  onSave: () => void;
}

export function useKeyboardShortcuts(options: KeyboardShortcutsOptions) {
  const { onOpenFile, onSave } = options;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;

      // Ctrl+O: Open file
      if (isCtrl && e.key === "o") {
        e.preventDefault();
        onOpenFile();
        return;
      }

      // Ctrl+S: Save
      if (isCtrl && e.key === "s") {
        e.preventDefault();
        onSave();
        return;
      }

      // Ctrl+=: Zoom in
      if (isCtrl && (e.key === "=" || e.key === "+")) {
        e.preventDefault();
        const { scale, setScale } = usePdfStore.getState();
        setScale(Math.min(3, scale + 0.25));
        return;
      }

      // Ctrl+-: Zoom out
      if (isCtrl && e.key === "-") {
        e.preventDefault();
        const { scale, setScale } = usePdfStore.getState();
        setScale(Math.max(0.5, scale - 0.25));
        return;
      }

      // Ctrl+0: Reset zoom
      if (isCtrl && e.key === "0") {
        e.preventDefault();
        usePdfStore.getState().setScale(1.0);
        return;
      }

      // Ctrl+B: Toggle sidebar
      if (isCtrl && e.key === "b") {
        e.preventDefault();
        const { sidebarOpen, setSidebarOpen } = usePdfStore.getState();
        setSidebarOpen(!sidebarOpen);
        return;
      }

      // Escape: Close panels
      if (e.key === "Escape") {
        const { showSettings, setShowSettings } =
          usePdfStore.getState();
        if (showSettings) {
          setShowSettings(false);
        }
        return;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onOpenFile, onSave]);
}
