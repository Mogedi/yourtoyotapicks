'use client';

import * as React from 'react';
import { Car } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CarImageProps {
  src: string;
  alt: string;
  className?: string;
  onError?: () => void;
  priority?: boolean;
}

/**
 * CarImage component with automatic fallback handling
 * Shows placeholder if image fails to load
 */
export function CarImage({ src, alt, className, onError, priority }: CarImageProps) {
  const [error, setError] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  const handleError = () => {
    setError(true);
    setLoading(false);
    onError?.();
  };

  const handleLoad = () => {
    setLoading(false);
  };

  if (error) {
    return (
      <div
        className={cn(
          'w-full h-full flex items-center justify-center',
          'bg-gradient-to-br from-gray-100 to-gray-200',
          'dark:from-gray-800 dark:to-gray-900',
          className
        )}
      >
        <Car className="w-16 h-16 text-gray-400 dark:text-gray-600" />
      </div>
    );
  }

  return (
    <>
      {loading && (
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center',
            'bg-gradient-to-br from-gray-100 to-gray-200',
            'dark:from-gray-800 dark:to-gray-900',
            'animate-pulse'
          )}
        >
          <Car className="w-16 h-16 text-gray-400 dark:text-gray-600 animate-bounce" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={cn('w-full h-full object-cover transition-opacity', className, {
          'opacity-0': loading,
          'opacity-100': !loading,
        })}
        onError={handleError}
        onLoad={handleLoad}
        loading={priority ? 'eager' : 'lazy'}
      />
    </>
  );
}
