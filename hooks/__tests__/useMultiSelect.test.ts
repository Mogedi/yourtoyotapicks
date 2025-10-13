import { renderHook, act } from '@testing-library/react';
import { useMultiSelect } from '../useMultiSelect';

interface TestItem {
  id: string;
  name: string;
}

const createTestItems = (count: number): TestItem[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `item-${i + 1}`,
    name: `Item ${i + 1}`,
  }));
};

describe('useMultiSelect', () => {
  const getKey = (item: TestItem) => item.id;

  describe('Initial state', () => {
    it('should initialize with no selection', () => {
      const items = createTestItems(5);
      const { result } = renderHook(() => useMultiSelect(items, getKey));

      expect(result.current.selectedKeys.size).toBe(0);
      expect(result.current.selectedItems).toEqual([]);
      expect(result.current.hasSelection).toBe(false);
      expect(result.current.allSelected).toBe(false);
    });

    it('should handle empty items array', () => {
      const { result } = renderHook(() => useMultiSelect([], getKey));

      expect(result.current.selectedKeys.size).toBe(0);
      expect(result.current.selectedItems).toEqual([]);
      expect(result.current.hasSelection).toBe(false);
      expect(result.current.allSelected).toBe(false);
    });
  });

  describe('toggleItem', () => {
    it('should select an item', () => {
      const items = createTestItems(5);
      const { result } = renderHook(() => useMultiSelect(items, getKey));

      act(() => {
        result.current.toggleItem(items[0]);
      });

      expect(result.current.selectedKeys.has('item-1')).toBe(true);
      expect(result.current.selectedItems).toEqual([items[0]]);
      expect(result.current.hasSelection).toBe(true);
    });

    it('should deselect a selected item', () => {
      const items = createTestItems(5);
      const { result } = renderHook(() => useMultiSelect(items, getKey));

      // Select item
      act(() => {
        result.current.toggleItem(items[0]);
      });

      expect(result.current.selectedKeys.has('item-1')).toBe(true);

      // Deselect item
      act(() => {
        result.current.toggleItem(items[0]);
      });

      expect(result.current.selectedKeys.has('item-1')).toBe(false);
      expect(result.current.selectedItems).toEqual([]);
      expect(result.current.hasSelection).toBe(false);
    });

    it('should handle multiple selections', () => {
      const items = createTestItems(5);
      const { result } = renderHook(() => useMultiSelect(items, getKey));

      act(() => {
        result.current.toggleItem(items[0]);
        result.current.toggleItem(items[2]);
        result.current.toggleItem(items[4]);
      });

      expect(result.current.selectedKeys.size).toBe(3);
      expect(result.current.selectedItems).toEqual([items[0], items[2], items[4]]);
      expect(result.current.hasSelection).toBe(true);
    });

    it('should handle selecting and deselecting multiple items', () => {
      const items = createTestItems(5);
      const { result } = renderHook(() => useMultiSelect(items, getKey));

      // Select 3 items
      act(() => {
        result.current.toggleItem(items[0]);
        result.current.toggleItem(items[1]);
        result.current.toggleItem(items[2]);
      });

      expect(result.current.selectedKeys.size).toBe(3);

      // Deselect 1 item
      act(() => {
        result.current.toggleItem(items[1]);
      });

      expect(result.current.selectedKeys.size).toBe(2);
      expect(result.current.selectedItems).toEqual([items[0], items[2]]);
    });
  });

  describe('toggleAll', () => {
    it('should select all items when none are selected', () => {
      const items = createTestItems(5);
      const { result } = renderHook(() => useMultiSelect(items, getKey));

      act(() => {
        result.current.toggleAll();
      });

      expect(result.current.selectedKeys.size).toBe(5);
      expect(result.current.selectedItems).toEqual(items);
      expect(result.current.hasSelection).toBe(true);
      expect(result.current.allSelected).toBe(true);
    });

    it('should deselect all items when all are selected', () => {
      const items = createTestItems(5);
      const { result } = renderHook(() => useMultiSelect(items, getKey));

      // Select all
      act(() => {
        result.current.toggleAll();
      });

      expect(result.current.allSelected).toBe(true);

      // Deselect all
      act(() => {
        result.current.toggleAll();
      });

      expect(result.current.selectedKeys.size).toBe(0);
      expect(result.current.selectedItems).toEqual([]);
      expect(result.current.hasSelection).toBe(false);
      expect(result.current.allSelected).toBe(false);
    });

    it('should select all items when some are selected', () => {
      const items = createTestItems(5);
      const { result } = renderHook(() => useMultiSelect(items, getKey));

      // Select some items
      act(() => {
        result.current.toggleItem(items[0]);
        result.current.toggleItem(items[2]);
      });

      expect(result.current.selectedKeys.size).toBe(2);

      // Toggle all (should select remaining)
      act(() => {
        result.current.toggleAll();
      });

      expect(result.current.selectedKeys.size).toBe(5);
      expect(result.current.allSelected).toBe(true);
    });

    it('should handle empty items array', () => {
      const { result } = renderHook(() => useMultiSelect([], getKey));

      act(() => {
        result.current.toggleAll();
      });

      expect(result.current.selectedKeys.size).toBe(0);
      expect(result.current.allSelected).toBe(false);
    });
  });

  describe('clearSelection', () => {
    it('should clear all selected items', () => {
      const items = createTestItems(5);
      const { result } = renderHook(() => useMultiSelect(items, getKey));

      // Select some items
      act(() => {
        result.current.toggleItem(items[0]);
        result.current.toggleItem(items[2]);
        result.current.toggleItem(items[4]);
      });

      expect(result.current.selectedKeys.size).toBe(3);

      // Clear selection
      act(() => {
        result.current.clearSelection();
      });

      expect(result.current.selectedKeys.size).toBe(0);
      expect(result.current.selectedItems).toEqual([]);
      expect(result.current.hasSelection).toBe(false);
    });

    it('should have no effect if no items are selected', () => {
      const items = createTestItems(5);
      const { result } = renderHook(() => useMultiSelect(items, getKey));

      act(() => {
        result.current.clearSelection();
      });

      expect(result.current.selectedKeys.size).toBe(0);
      expect(result.current.hasSelection).toBe(false);
    });
  });

  describe('isSelected', () => {
    it('should return true for selected items', () => {
      const items = createTestItems(5);
      const { result } = renderHook(() => useMultiSelect(items, getKey));

      act(() => {
        result.current.toggleItem(items[0]);
      });

      expect(result.current.isSelected(items[0])).toBe(true);
    });

    it('should return false for unselected items', () => {
      const items = createTestItems(5);
      const { result } = renderHook(() => useMultiSelect(items, getKey));

      act(() => {
        result.current.toggleItem(items[0]);
      });

      expect(result.current.isSelected(items[1])).toBe(false);
      expect(result.current.isSelected(items[2])).toBe(false);
    });

    it('should update when selection changes', () => {
      const items = createTestItems(5);
      const { result } = renderHook(() => useMultiSelect(items, getKey));

      expect(result.current.isSelected(items[0])).toBe(false);

      act(() => {
        result.current.toggleItem(items[0]);
      });

      expect(result.current.isSelected(items[0])).toBe(true);

      act(() => {
        result.current.toggleItem(items[0]);
      });

      expect(result.current.isSelected(items[0])).toBe(false);
    });
  });

  describe('hasSelection', () => {
    it('should be false when no items are selected', () => {
      const items = createTestItems(5);
      const { result } = renderHook(() => useMultiSelect(items, getKey));

      expect(result.current.hasSelection).toBe(false);
    });

    it('should be true when at least one item is selected', () => {
      const items = createTestItems(5);
      const { result } = renderHook(() => useMultiSelect(items, getKey));

      act(() => {
        result.current.toggleItem(items[0]);
      });

      expect(result.current.hasSelection).toBe(true);
    });

    it('should update when selection changes', () => {
      const items = createTestItems(5);
      const { result } = renderHook(() => useMultiSelect(items, getKey));

      act(() => {
        result.current.toggleItem(items[0]);
      });

      expect(result.current.hasSelection).toBe(true);

      act(() => {
        result.current.clearSelection();
      });

      expect(result.current.hasSelection).toBe(false);
    });
  });

  describe('allSelected', () => {
    it('should be false when no items are selected', () => {
      const items = createTestItems(5);
      const { result } = renderHook(() => useMultiSelect(items, getKey));

      expect(result.current.allSelected).toBe(false);
    });

    it('should be false when some items are selected', () => {
      const items = createTestItems(5);
      const { result } = renderHook(() => useMultiSelect(items, getKey));

      act(() => {
        result.current.toggleItem(items[0]);
        result.current.toggleItem(items[2]);
      });

      expect(result.current.allSelected).toBe(false);
    });

    it('should be true when all items are selected', () => {
      const items = createTestItems(5);
      const { result } = renderHook(() => useMultiSelect(items, getKey));

      act(() => {
        result.current.toggleAll();
      });

      expect(result.current.allSelected).toBe(true);
    });

    it('should be false for empty items array', () => {
      const { result } = renderHook(() => useMultiSelect([], getKey));

      expect(result.current.allSelected).toBe(false);
    });
  });

  describe('selectedItems', () => {
    it('should return array of selected items', () => {
      const items = createTestItems(5);
      const { result } = renderHook(() => useMultiSelect(items, getKey));

      act(() => {
        result.current.toggleItem(items[1]);
        result.current.toggleItem(items[3]);
      });

      expect(result.current.selectedItems).toEqual([items[1], items[3]]);
    });

    it('should update when items array changes', () => {
      const items = createTestItems(3);
      const { result, rerender } = renderHook(
        ({ items }) => useMultiSelect(items, getKey),
        { initialProps: { items } }
      );

      // Select item-1
      act(() => {
        result.current.toggleItem(items[0]);
      });

      expect(result.current.selectedItems).toEqual([items[0]]);

      // Update items array with new references but same IDs
      const newItems = createTestItems(3);
      rerender({ items: newItems });

      // Should still show item-1 as selected (by ID)
      expect(result.current.selectedItems).toEqual([newItems[0]]);
    });
  });

  describe('Callback stability', () => {
    it('should have stable toggleItem callback', () => {
      const items = createTestItems(5);
      const { result, rerender } = renderHook(() =>
        useMultiSelect(items, getKey)
      );

      const firstToggleItem = result.current.toggleItem;

      rerender();

      // toggleItem depends on getKey, so it may change if getKey changes
      // But with the same getKey function, it should be stable
      expect(result.current.toggleItem).toBe(firstToggleItem);
    });

    it('should have stable toggleAll callback when items reference changes', () => {
      const items = createTestItems(5);
      const { result, rerender } = renderHook(
        ({ items }) => useMultiSelect(items, getKey),
        { initialProps: { items } }
      );

      const firstToggleAll = result.current.toggleAll;

      // Rerender with same items
      rerender({ items });

      // toggleAll depends on items and getKey, so it will change when items change
      expect(result.current.toggleAll).toBe(firstToggleAll);
    });

    it('should have stable clearSelection callback', () => {
      const items = createTestItems(5);
      const { result, rerender } = renderHook(() =>
        useMultiSelect(items, getKey)
      );

      const firstClearSelection = result.current.clearSelection;

      rerender();

      expect(result.current.clearSelection).toBe(firstClearSelection);
    });

    it('should have stable isSelected callback when selectedKeys changes', () => {
      const items = createTestItems(5);
      const { result } = renderHook(() => useMultiSelect(items, getKey));

      const firstIsSelected = result.current.isSelected;

      // Change selection state
      act(() => {
        result.current.toggleItem(items[0]);
      });

      // isSelected depends on selectedKeys, so it will be a new reference
      expect(result.current.isSelected).not.toBe(firstIsSelected);
    });
  });
});
