'use client';

// BulkActionBar - Floating action bar for bulk operations with animations
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { Vehicle } from '@/lib/types';

interface BulkActionBarProps {
  selectedVehicles: Vehicle[];
  onClearSelection: () => void;
  onExport?: () => void;
  onDelete?: () => void;
}

export function BulkActionBar({
  selectedVehicles,
  onClearSelection,
  onExport,
  onDelete,
}: BulkActionBarProps) {
  if (selectedVehicles.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
      >
        <div className="bg-white rounded-lg shadow-2xl border border-gray-200 px-6 py-4">
          <div className="flex items-center gap-4">
            {/* Selection info */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100">
                <span className="text-sm font-semibold text-blue-600">
                  {selectedVehicles.length}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-700">
                {selectedVehicles.length === 1
                  ? '1 vehicle selected'
                  : `${selectedVehicles.length} vehicles selected`}
              </span>
            </div>

            <Separator orientation="vertical" className="h-8" />

            {/* Actions */}
            <div className="flex items-center gap-2">
              {onExport && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onExport}
                  className="transition-all hover:scale-105 active:scale-95"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              )}

              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDelete}
                  className="text-red-600 hover:bg-red-50 transition-all hover:scale-105 active:scale-95"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              )}
            </div>

            <Separator orientation="vertical" className="h-8" />

            {/* Clear selection */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="transition-all hover:scale-105 active:scale-95"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
