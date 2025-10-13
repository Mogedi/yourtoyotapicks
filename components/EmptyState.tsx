'use client';

import { LucideIcon, Car } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Legacy interface for backwards compatibility
interface LegacyEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

// New interface for Dashboard V2
interface NewEmptyStateProps {
  message?: string;
  description?: string;
  onClearFilters?: () => void;
  showClearButton?: boolean;
  className?: string;
}

type EmptyStateProps = LegacyEmptyStateProps | NewEmptyStateProps;

function isLegacyProps(props: EmptyStateProps): props is LegacyEmptyStateProps {
  return 'icon' in props;
}

export function EmptyState(props: EmptyStateProps) {
  // Legacy mode (for existing usages)
  if (isLegacyProps(props)) {
    const { icon: Icon, title, description, action } = props;
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <div className="rounded-full bg-blue-50 p-3 mb-4">
            <Icon className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground max-w-md mb-4">
            {description}
          </p>
          {action && <div className="mt-2">{action}</div>}
        </CardContent>
      </Card>
    );
  }

  // Dashboard V2 mode (enhanced with glow effect)
  const {
    message = 'No vehicles found',
    description = 'Try adjusting your filters or search criteria',
    onClearFilters,
    showClearButton = true,
    className,
  } = props;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-6 text-center',
        className
      )}
    >
      {/* Icon with glow effect */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl" />
        <Car className="relative h-20 w-20 text-muted-foreground" />
      </div>

      {/* Message */}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{message}</h3>
      <p className="text-sm text-gray-600 mb-6 max-w-md">{description}</p>

      {/* Action button */}
      {showClearButton && onClearFilters && (
        <Button onClick={onClearFilters} variant="outline">
          Clear All Filters
        </Button>
      )}
    </div>
  );
}
