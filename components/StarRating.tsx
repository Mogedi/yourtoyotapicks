'use client';

// StarRating - Interactive 5-star rating component
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

const sizes = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

export function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onChange,
  className,
}: StarRatingProps) {
  const handleClick = (value: number) => {
    if (interactive && onChange) {
      onChange(value);
    }
  };

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: maxRating }, (_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= Math.round(rating);

        return (
          <button
            key={i}
            type="button"
            onClick={() => handleClick(starValue)}
            disabled={!interactive}
            className={cn(
              'transition-all',
              interactive && 'cursor-pointer hover:scale-110 active:scale-95',
              !interactive && 'cursor-default'
            )}
            aria-label={`Rate ${starValue} stars`}
          >
            <Star
              className={cn(
                sizes[size],
                isFilled
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              )}
            />
          </button>
        );
      })}
      <span className="ml-1 text-xs text-muted-foreground">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}
