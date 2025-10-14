import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Car,
  MapPin,
  User,
  AlertTriangle,
  Trophy,
  DollarSign,
  Gauge,
  Star,
  CheckCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Vehicle, ListingSummary, MileageRating } from '@/lib/types';
import { CarImage } from '@/components/vehicle/CarImage';
import { QualityTierBadge } from '@/components/vehicle/QualityTierBadge';
import { QUALITY_TIER } from '@/lib/config/constants';

// Props interface for the VehicleCard component
export interface VehicleCardProps {
  vehicle: Vehicle | ListingSummary;
  className?: string;
}

// Helper function to format price
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

// Helper function to format mileage
const formatMileage = (mileage: number): string => {
  if (mileage >= 1000) {
    return `${Math.round(mileage / 1000)}K miles`;
  }
  return `${mileage} miles`;
};

// Helper function to get mileage badge styles
const getMileageBadgeStyle = (
  rating?: MileageRating
): { variant: string; className: string; label: string } => {
  switch (rating) {
    case 'excellent':
      return {
        variant: 'default',
        className: 'bg-green-500 hover:bg-green-600 text-white border-0',
        label: 'Excellent Mileage',
      };
    case 'good':
      return {
        variant: 'default',
        className: 'bg-blue-500 hover:bg-blue-600 text-white border-0',
        label: 'Good Mileage',
      };
    case 'acceptable':
      return {
        variant: 'secondary',
        className: 'bg-gray-500 hover:bg-gray-600 text-white border-0',
        label: 'Acceptable Mileage',
      };
    default:
      return {
        variant: 'outline',
        className: '',
        label: 'Unknown',
      };
  }
};

// Helper function to check if priority score is high
const isHighPriority = (score: number): boolean => {
  return score >= QUALITY_TIER.TOP_PICK.MIN_SCORE;
};

// Placeholder car image component (SVG)
const CarPlaceholder = () => (
  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
    <Car className="w-16 h-16 text-gray-400 dark:text-gray-600" />
  </div>
);

export function VehicleCard({ vehicle, className }: VehicleCardProps) {
  const mileageBadgeStyle = getMileageBadgeStyle(vehicle.mileage_rating);
  const showPriorityBadge = isHighPriority(vehicle.priority_score);

  // Get the first image or use placeholder
  const imageUrl = vehicle.images_url?.[0];

  // Check if vehicle has review data (Vehicle type has these fields)
  const hasReview = 'reviewed_by_user' in vehicle && vehicle.reviewed_by_user;
  const userRating = 'user_rating' in vehicle ? vehicle.user_rating : undefined;

  return (
    <TooltipProvider>
      <Card
        data-testid="vehicle-card"
        className={cn(
          'overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group',
          className
        )}
      >
        {/* Image Section */}
        <div className="relative h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
          {imageUrl ? (
            <CarImage
              src={imageUrl}
              alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
              className="transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <CarPlaceholder />
          )}

          {/* Priority Badge Overlay */}
          {showPriorityBadge && (
            <div className="absolute top-3 right-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-0 shadow-lg">
                    <Trophy className="w-3 h-3 mr-1" />
                    Priority
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>High priority listing (Score: {vehicle.priority_score})</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}

          {/* Rust Belt Warning Overlay */}
          {vehicle.flag_rust_concern && (
            <div className="absolute top-3 left-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="bg-orange-500 text-white rounded-full p-1.5 shadow-lg">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Vehicle from rust belt state</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}

          {/* Reviewed Badge Overlay */}
          {hasReview && (
            <div className="absolute bottom-3 left-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge className="bg-green-500 hover:bg-green-600 text-white border-0 shadow-lg">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Reviewed
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>You have reviewed this vehicle</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}

          {/* Star Rating Overlay */}
          {userRating && userRating > 0 && (
            <div className="absolute bottom-3 right-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-0.5 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-md shadow-lg">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-medium">{userRating}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Your rating: {userRating}/5 stars</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>

        {/* Content Section */}
        <CardContent className="p-4">
          {/* Vehicle Title */}
          <h3 className="text-lg font-semibold mb-2 line-clamp-1">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h3>

          {/* Price and Mileage */}
          <div className="flex items-center gap-2 mb-3 text-base">
            <div className="flex items-center font-bold text-primary">
              <DollarSign className="w-4 h-4" />
              <span>{formatPrice(vehicle.price)}</span>
            </div>
            <span className="text-muted-foreground">•</span>
            <div className="flex items-center text-muted-foreground">
              <Gauge className="w-4 h-4 mr-1" />
              <span>{formatMileage(vehicle.mileage)}</span>
            </div>
          </div>

          {/* Location and Distance */}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="line-clamp-1">
              {vehicle.current_location} ({vehicle.distance_miles} mi)
            </span>
          </div>

          {/* Badges Section */}
          <div className="flex flex-wrap gap-2">
            {/* Quality Tier Badge */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <QualityTierBadge
                    score={vehicle.priority_score}
                    showLabel={true}
                    size="sm"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Priority score based on multiple factors</p>
              </TooltipContent>
            </Tooltip>

            {/* Mileage Rating Badge */}
            {vehicle.mileage_rating && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge className={mileageBadgeStyle.className}>
                    {mileageBadgeStyle.label}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Based on mileage per year</p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Owner Count Badge */}
            {vehicle.owner_count && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="gap-1">
                    <User className="w-3 h-3" />
                    {vehicle.owner_count} Owner
                    {vehicle.owner_count > 1 ? 's' : ''}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Number of previous owners</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Dealer Name (if available) */}
          {vehicle.dealer_name && (
            <div className="mt-3 text-xs text-muted-foreground line-clamp-1">
              Dealer: {vehicle.dealer_name}
            </div>
          )}
        </CardContent>

        {/* Footer Section */}
        <CardFooter className="p-4 pt-0">
          <Button asChild className="w-full">
            <Link href={`/dashboard/${vehicle.vin}`}>View Details</Link>
          </Button>
        </CardFooter>
      </Card>
    </TooltipProvider>
  );
}

// Export default for convenience
export default VehicleCard;
