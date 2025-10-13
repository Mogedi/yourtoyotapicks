'use client';

// StatusBadge - Enhanced status badge with icons
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getMileageRatingColor } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';

type StatusType =
  | 'excellent'
  | 'good'
  | 'acceptable'
  | 'reviewed'
  | 'not-reviewed';

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  showIcon?: boolean;
  className?: string;
}

const statusConfig = {
  excellent: {
    icon: CheckCircle,
    label: 'Excellent',
  },
  good: {
    icon: CheckCircle,
    label: 'Good',
  },
  acceptable: {
    icon: AlertCircle,
    label: 'Acceptable',
  },
  reviewed: {
    icon: CheckCircle,
    label: 'Reviewed',
  },
  'not-reviewed': {
    icon: Clock,
    label: 'Not Reviewed',
  },
};

export function StatusBadge({
  status,
  label,
  showIcon = true,
  className,
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const displayLabel = label || config.label;

  // Get colors for mileage ratings
  const colors =
    status === 'excellent' || status === 'good' || status === 'acceptable'
      ? getMileageRatingColor(status)
      : status === 'reviewed'
        ? {
            bg: 'bg-green-50',
            text: 'text-green-700',
            border: 'border-green-200',
          }
        : {
            bg: 'bg-gray-50',
            text: 'text-gray-700',
            border: 'border-gray-200',
          };

  return (
    <Badge
      variant="outline"
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border',
        colors.bg,
        colors.text,
        colors.border,
        className
      )}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      <span className="text-xs font-medium">{displayLabel}</span>
    </Badge>
  );
}
