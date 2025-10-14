'use client';

// ProductImage - Circular vehicle image with fallback
import { useState } from 'react';
import Image from 'next/image';
import { Car } from 'lucide-react';
import { getCarImageUrl } from '@/lib/utils/car-images';
import type { Vehicle, ListingSummary } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ProductImageProps {
  vehicle: Vehicle | ListingSummary;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
};

const iconSizes = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

export function ProductImage({
  vehicle,
  size = 'md',
  className,
}: ProductImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const imageUrl = getCarImageUrl({
    year: vehicle.year,
    make: vehicle.make,
    model: vehicle.model,
    angle: 'side',
  });

  // Show fallback if image fails to load
  if (imageError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-gray-100 border border-gray-200',
          sizes[size],
          className
        )}
      >
        <Car className={cn('text-gray-400', iconSizes[size])} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative rounded-full overflow-hidden bg-gray-100 border border-gray-200',
        sizes[size],
        className
      )}
    >
      {/* Loading shimmer */}
      {!imageLoaded && (
        <div className="absolute inset-0 animate-pulse bg-gray-200" />
      )}

      <Image
        src={imageUrl}
        alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
        fill
        className={cn(
          'object-cover transition-opacity duration-200',
          imageLoaded ? 'opacity-100' : 'opacity-0'
        )}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
      />
    </div>
  );
}
