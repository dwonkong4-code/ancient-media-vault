import { useEffect } from "react";

export function useDevToolsProtection() {
  useEffect(() => {
    // Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Disable keyboard shortcuts for dev tools
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === "F12") {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+Shift+I (Inspect)
      if (e.ctrlKey && e.shiftKey && e.key === "I") {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && e.key === "J") {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+Shift+C (Element picker)
      if (e.ctrlKey && e.shiftKey && e.key === "C") {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+U (View source)
      if (e.ctrlKey && e.key === "u") {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+S (Save)
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        return false;
      }
      
      // Cmd+Option+I (Mac Inspect)
      if (e.metaKey && e.altKey && e.key === "i") {
        e.preventDefault();
        return false;
      }
      
      // Cmd+Option+J (Mac Console)
      if (e.metaKey && e.altKey && e.key === "j") {
        e.preventDefault();
        return false;
      }
      
      // Cmd+Option+C (Mac Element picker)
      if (e.metaKey && e.altKey && e.key === "c") {
        e.preventDefault();
        return false;
      }
      
      // Cmd+Option+U (Mac View source)
      if (e.metaKey && e.altKey && e.key === "u") {
        e.preventDefault();
        return false;
      }
    };

    // Clear console periodically
    const clearConsoleInterval = setInterval(() => {
      console.clear();
    }, 100);

    // Detect DevTools opening using debugger statement timing
    let devToolsOpen = false;
    
    const detectDevTools = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      if (widthThreshold || heightThreshold) {
        if (!devToolsOpen) {
          devToolsOpen = true;
          handleDevToolsOpen();
        }
      } else {
        devToolsOpen = false;
      }
    };

    const handleDevToolsOpen = () => {
      // Clear everything and redirect
      console.clear();
      document.body.innerHTML = "";
      window.location.href = "about:blank";
    };

    // Check for devtools using debugger timing
    const devToolsChecker = setInterval(() => {
      const start = performance.now();
      // This will pause if devtools is open with breakpoints
      debugger;
      const end = performance.now();
      
      if (end - start > 100) {
        handleDevToolsOpen();
      }
    }, 1000);

    // Check window size for devtools
    const resizeChecker = setInterval(detectDevTools, 500);

    // Disable text selection
    const handleSelectStart = (e: Event) => {
      e.preventDefault();
      return false;
    };

    // Disable drag
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    // Add event listeners
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("selectstart", handleSelectStart);
    document.addEventListener("dragstart", handleDragStart);

    // Initial console clear
    console.clear();

    // Override console methods
    const noop = () => {};
    if (typeof window !== "undefined") {
      (window as any).console.log = noop;
      (window as any).console.debug = noop;
      (window as any).console.info = noop;
      (window as any).console.warn = noop;
      (window as any).console.error = noop;
      (window as any).console.table = noop;
      (window as any).console.trace = noop;
    }

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("selectstart", handleSelectStart);
      document.removeEventListener("dragstart", handleDragStart);
      clearInterval(clearConsoleInterval);
      clearInterval(devToolsChecker);
      clearInterval(resizeChecker);
    };
  }, []);
}
