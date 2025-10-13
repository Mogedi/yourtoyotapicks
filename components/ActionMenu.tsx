'use client';

// ActionMenu - Three-dot dropdown menu for row actions
import { MoreVertical, Eye, Star, Trash2, ExternalLink } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface ActionMenuProps {
  onView?: () => void;
  onRate?: () => void;
  onDelete?: () => void;
  onOpenExternal?: () => void;
  className?: string;
}

export function ActionMenu({
  onView,
  onRate,
  onDelete,
  onOpenExternal,
  className,
}: ActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={className}
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        {onView && (
          <DropdownMenuItem onClick={onView}>
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </DropdownMenuItem>
        )}

        {onRate && (
          <DropdownMenuItem onClick={onRate}>
            <Star className="h-4 w-4 mr-2" />
            Add Rating
          </DropdownMenuItem>
        )}

        {onOpenExternal && (
          <DropdownMenuItem onClick={onOpenExternal}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Listing
          </DropdownMenuItem>
        )}

        {onDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-red-600">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
