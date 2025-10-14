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
 * Handles SSR and hydration properly for direct page loads
 */
export function CarImage({
  src,
  alt,
  className,
  onError,
  priority,
}: CarImageProps) {
  const [error, setError] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [mounted, setMounted] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  // Handle SSR: Only show loading state after client-side mount
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Check if image is already loaded (cached or complete)
  React.useEffect(() => {
    if (!imgRef.current) return;

    // Image already loaded (cached from previous navigation or complete)
    if (imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setLoading(false);
    }
  }, [src]);

  // Fallback: Assume loaded after timeout (handles stalled loads)
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
      }
    }, 5000); // 5 second timeout

    return () => clearTimeout(timeout);
  }, [loading]);

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
      {loading && mounted && (
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
        ref={imgRef}
        src={src}
        alt={alt}
        className={cn(
          'w-full h-full object-cover transition-opacity',
          className,
          {
            'opacity-0': loading && mounted,
            'opacity-100': !loading || !mounted,
          }
        )}
        onError={handleError}
        onLoad={handleLoad}
        loading={priority ? 'eager' : 'lazy'}
      />
    </>
  );
}
