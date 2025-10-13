'use client';

// QualityTierBadge - Color-coded badge for vehicle quality tiers
// Based on priority score: 80+ = Top Pick, 65-79 = Good Buy, <65 = Caution

import { cn } from '@/lib/utils';

interface QualityTierBadgeProps {
  score: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function QualityTierBadge({
  score,
  showLabel = true,
  size = 'md',
  className,
}: QualityTierBadgeProps) {
  // Determine tier based on score
  const getTier = (score: number) => {
    if (score >= 80) return 'top_pick';
    if (score >= 65) return 'good_buy';
    return 'caution';
  };

  const tier = getTier(score);

  // Tier configurations
  const tierConfig = {
    top_pick: {
      label: 'Top Pick',
      bgClass: 'bg-green-100',
      textClass: 'text-green-800',
      borderClass: 'border-green-200',
      icon: '🟩',
    },
    good_buy: {
      label: 'Good Buy',
      bgClass: 'bg-yellow-100',
      textClass: 'text-yellow-800',
      borderClass: 'border-yellow-200',
      icon: '🟨',
    },
    caution: {
      label: 'Caution',
      bgClass: 'bg-gray-100',
      textClass: 'text-gray-600',
      borderClass: 'border-gray-200',
      icon: '⚪',
    },
  };

  const config = tierConfig[tier];

  // Size variants
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full font-medium border',
        config.bgClass,
        config.textClass,
        config.borderClass,
        sizeClasses[size],
        className
      )}
    >
      {showLabel ? (
        <>
          <span className="mr-1">{config.icon}</span>
          <span>{config.label}</span>
          <span className="ml-1.5 font-semibold">({score})</span>
        </>
      ) : (
        <span className="font-semibold">{score}</span>
      )}
    </div>
  );
}

// Export tier helper for use in other components
export function getQualityTier(
  score: number
): 'top_pick' | 'good_buy' | 'caution' {
  if (score >= 80) return 'top_pick';
  if (score >= 65) return 'good_buy';
  return 'caution';
}

// Export tier label helper
export function getQualityTierLabel(
  tier: 'top_pick' | 'good_buy' | 'caution'
): string {
  const labels = {
    top_pick: 'Top Pick',
    good_buy: 'Good Buy',
    caution: 'Caution',
  };
  return labels[tier];
}
