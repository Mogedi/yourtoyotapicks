'use client';

// useKeyboardShortcuts - Handle keyboard shortcuts
import { useEffect } from 'react';

export interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description?: string;
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Find matching shortcut
      const matchingShortcut = shortcuts.find((shortcut) => {
        return (
          event.key.toLowerCase() === shortcut.key.toLowerCase() &&
          !!event.ctrlKey === !!shortcut.ctrl &&
          !!event.shiftKey === !!shortcut.shift &&
          !!event.altKey === !!shortcut.alt
        );
      });

      if (matchingShortcut) {
        event.preventDefault();
        matchingShortcut.action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

// Predefined common shortcuts
export const CommonShortcuts = {
  search: { key: '/', description: 'Focus search' },
  escape: { key: 'Escape', description: 'Close/Clear' },
  selectAll: { key: 'a', ctrl: true, description: 'Select all' },
  refresh: { key: 'r', ctrl: true, description: 'Refresh' },
  help: { key: '?', shift: true, description: 'Show help' },
};
