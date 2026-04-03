import { useEffect, useState, useCallback } from "react";

interface TextSelectionState {
  selectedText: string;
  showFloatingToolbar: boolean;
  toolbarPosition: { x: number; y: number };
  showBubble: boolean;
  bubblePosition: { x: number; y: number };
  bubbleTag: "inspiration" | "confusion";
  bubbleMessage: string;
  setBubbleMessage: (msg: string) => void;
  handleTagSelect: (tag: "inspiration" | "confusion") => void;
  closeBubble: () => void;
  closeToolbar: () => void;
}

export function useTextSelection(): TextSelectionState {
  const [selectedText, setSelectedText] = useState("");
  const [showFloatingToolbar, setShowFloatingToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });
  const [showBubble, setShowBubble] = useState(false);
  const [bubblePosition, setBubblePosition] = useState({ x: 0, y: 0 });
  const [bubbleTag, setBubbleTag] = useState<"inspiration" | "confusion">(
    "inspiration"
  );
  const [bubbleMessage, setBubbleMessage] = useState("");

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 2) {
        const text = selection.toString().trim();
        setSelectedText(text);

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        // Boundary detection
        const toolbarWidth = 200;
        const toolbarHeight = 50;
        let x = rect.left + rect.width / 2 - toolbarWidth / 2;
        let y = rect.top + window.scrollY - toolbarHeight;

        if (x + toolbarWidth > window.innerWidth) {
          x = window.innerWidth - toolbarWidth - 8;
        }
        if (x < 8) x = 8;
        if (y < 8) {
          y = rect.bottom + window.scrollY + 8;
        }

        setToolbarPosition({ x, y });
        setShowFloatingToolbar(true);
        setShowBubble(false);
      } else {
        setShowFloatingToolbar(false);
      }
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () =>
      document.removeEventListener("selectionchange", handleSelectionChange);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        !target.closest(".floating-toolbar") &&
        !target.closest(".inline-bubble")
      ) {
        setShowFloatingToolbar(false);
        setShowBubble(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTagSelect = useCallback(
    (tag: "inspiration" | "confusion") => {
      setBubbleTag(tag);
      setBubblePosition({
        x: toolbarPosition.x,
        y: toolbarPosition.y + 50,
      });
      setBubbleMessage("");
      setShowFloatingToolbar(false);
      setShowBubble(true);
    },
    [toolbarPosition]
  );

  const closeBubble = useCallback(() => setShowBubble(false), []);
  const closeToolbar = useCallback(() => setShowFloatingToolbar(false), []);

  return {
    selectedText,
    showFloatingToolbar,
    toolbarPosition,
    showBubble,
    bubblePosition,
    bubbleTag,
    bubbleMessage,
    setBubbleMessage,
    handleTagSelect,
    closeBubble,
    closeToolbar,
  };
}
