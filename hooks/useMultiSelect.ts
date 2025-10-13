'use client';

// useMultiSelect - Manage multi-selection for bulk actions
import { useState, useCallback, useMemo } from 'react';

interface UseMultiSelectReturn<T> {
  selectedKeys: Set<string>;
  selectedItems: T[];
  toggleItem: (item: T) => void;
  toggleAll: () => void;
  clearSelection: () => void;
  isSelected: (item: T) => boolean;
  hasSelection: boolean;
  allSelected: boolean;
}

export function useMultiSelect<T>(
  items: T[],
  getKey: (item: T) => string
): UseMultiSelectReturn<T> {
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  const toggleItem = useCallback(
    (item: T) => {
      const key = getKey(item);
      setSelectedKeys((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(key)) {
          newSet.delete(key);
        } else {
          newSet.add(key);
        }
        return newSet;
      });
    },
    [getKey]
  );

  const toggleAll = useCallback(() => {
    setSelectedKeys((prev) => {
      // If all selected, clear selection
      if (prev.size === items.length) {
        return new Set();
      }
      // Otherwise, select all
      return new Set(items.map(getKey));
    });
  }, [items, getKey]);

  const clearSelection = useCallback(() => {
    setSelectedKeys(new Set());
  }, []);

  const isSelected = useCallback(
    (item: T) => {
      return selectedKeys.has(getKey(item));
    },
    [selectedKeys, getKey]
  );

  const selectedItems = useMemo(() => {
    return items.filter((item) => selectedKeys.has(getKey(item)));
  }, [items, selectedKeys, getKey]);

  const hasSelection = selectedKeys.size > 0;
  const allSelected = items.length > 0 && selectedKeys.size === items.length;

  return {
    selectedKeys,
    selectedItems,
    toggleItem,
    toggleAll,
    clearSelection,
    isSelected,
    hasSelection,
    allSelected,
  };
}
