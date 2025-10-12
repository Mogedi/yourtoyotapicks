'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import {
  Car,
  MapPin,
  User,
  AlertTriangle,
  Trophy,
  DollarSign,
  Gauge,
  Calendar,
  Shield,
  ExternalLink,
  ChevronLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  History,
  Settings,
  Eye,
  Star,
} from 'lucide-react';
import type { Vehicle, MileageRating, OverallRating } from '@/lib/types';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ReviewSection } from '@/components/ReviewSection';
import { CarImage } from '@/components/CarImage';

export interface VehicleDetailProps {
  vehicle: Vehicle;
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
  return new Intl.NumberFormat('en-US').format(mileage);
};

// Helper function to format date
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Helper function to get mileage badge styles
const getMileageBadgeStyle = (
  rating?: MileageRating
): { className: string; label: string; icon: React.ReactNode } => {
  switch (rating) {
    case 'excellent':
      return {
        className: 'bg-green-500 hover:bg-green-600 text-white border-0',
        label: 'Excellent Mileage',
        icon: <CheckCircle className="w-4 h-4" />,
      };
    case 'good':
      return {
        className: 'bg-blue-500 hover:bg-blue-600 text-white border-0',
        label: 'Good Mileage',
        icon: <CheckCircle className="w-4 h-4" />,
      };
    case 'acceptable':
      return {
        className: 'bg-gray-500 hover:bg-gray-600 text-white border-0',
        label: 'Acceptable Mileage',
        icon: <AlertCircle className="w-4 h-4" />,
      };
    default:
      return {
        className: 'bg-gray-300 text-gray-700',
        label: 'Unknown',
        icon: <AlertCircle className="w-4 h-4" />,
      };
  }
};

// Helper function to get overall rating badge
const getOverallRatingBadge = (rating?: OverallRating) => {
  switch (rating) {
    case 'high':
      return {
        className: 'bg-green-500 hover:bg-green-600 text-white border-0',
        label: 'High Quality',
      };
    case 'medium':
      return {
        className: 'bg-blue-500 hover:bg-blue-600 text-white border-0',
        label: 'Medium Quality',
      };
    case 'low':
      return {
        className: 'bg-orange-500 hover:bg-orange-600 text-white border-0',
        label: 'Lower Quality',
      };
    default:
      return null;
  }
};

// Placeholder car image component
const CarPlaceholder = () => (
  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
    <Car className="w-32 h-32 text-gray-400 dark:text-gray-600" />
  </div>
);

export function VehicleDetail({ vehicle: initialVehicle }: VehicleDetailProps) {
  const [selectedImage, setSelectedImage] = React.useState(0);
  const [vehicle, setVehicle] = React.useState(initialVehicle);
  const mileageBadge = getMileageBadgeStyle(vehicle.mileage_rating);
  const overallRatingBadge = getOverallRatingBadge(vehicle.overall_rating);
  const images = vehicle.images_url || [];

  // Handle review update callback
  const handleReviewUpdate = (data: { reviewed: boolean; rating?: number; notes?: string }) => {
    setVehicle({
      ...vehicle,
      reviewed_by_user: data.reviewed,
      user_rating: data.rating,
      user_notes: data.notes,
    });
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div>
        <Button variant="ghost" asChild>
          <Link href="/dashboard">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      {/* Hero Section */}
      <Card className="overflow-hidden">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Image Section */}
          <div className="space-y-4 p-6">
            {/* Main Image */}
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
              {images.length > 0 ? (
                <CarImage
                  src={images[selectedImage]}
                  alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                  priority={true}
                />
              ) : (
                <CarPlaceholder />
              )}

              {/* Priority Badge Overlay */}
              {vehicle.priority_score >= 80 && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-0 shadow-lg">
                    <Trophy className="w-3 h-3 mr-1" />
                    High Priority
                  </Badge>
                </div>
              )}

              {/* Rust Belt Warning Overlay */}
              {vehicle.flag_rust_concern && (
                <div className="absolute top-4 left-4">
                  <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-0 shadow-lg">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Rust Belt State
                  </Badge>
                </div>
              )}
            </div>

            {/* Image Gallery Thumbnails */}
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {images.slice(0, 5).map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={cn(
                      'aspect-square rounded-md overflow-hidden border-2 transition-all',
                      selectedImage === idx
                        ? 'border-primary shadow-md ring-2 ring-primary ring-offset-2'
                        : 'border-transparent hover:border-gray-300 hover:shadow'
                    )}
                  >
                    <CarImage src={img} alt={`View ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Vehicle Info Section */}
          <div className="p-6 space-y-6">
            {/* Title */}
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h1>
              {vehicle.body_type && (
                <p className="text-muted-foreground text-lg">{vehicle.body_type}</p>
              )}
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="text-xl font-bold">{formatPrice(vehicle.price)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Gauge className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mileage</p>
                  <p className="text-xl font-bold">{formatMileage(vehicle.mileage)} mi</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Owners</p>
                  <p className="text-xl font-bold">{vehicle.owner_count}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Distance</p>
                  <p className="text-xl font-bold">{vehicle.distance_miles} mi</p>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge className={mileageBadge.className}>
                {mileageBadge.icon}
                <span className="ml-1">{mileageBadge.label}</span>
              </Badge>

              {overallRatingBadge && (
                <Badge className={overallRatingBadge.className}>
                  {overallRatingBadge.label}
                </Badge>
              )}

              <Badge variant="outline">
                <Shield className="w-3 h-3 mr-1" />
                {vehicle.title_status}
              </Badge>

              <Badge variant="secondary">
                Score: {vehicle.priority_score}
              </Badge>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="font-medium">{vehicle.current_location}</p>
                  {vehicle.dealer_name && (
                    <p className="text-sm text-muted-foreground">{vehicle.dealer_name}</p>
                  )}
                  {vehicle.state_of_origin && (
                    <p className="text-sm text-muted-foreground">
                      Originally from: {vehicle.state_of_origin}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid gap-3">
              <Button asChild size="lg" className="w-full">
                <a href={vehicle.source_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on {vehicle.source_platform}
                </a>
              </Button>

              <Button asChild variant="outline" size="lg" className="w-full">
                <a
                  href={`https://vpic.nhtsa.dot.gov/decoder/Decoder?vin=${vehicle.vin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Check VIN on NHTSA
                </a>
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="review" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="review">
            <Eye className="w-4 h-4 mr-2" />
            Review
          </TabsTrigger>
          <TabsTrigger value="specifications">
            <Settings className="w-4 h-4 mr-2" />
            Specifications
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="w-4 h-4 mr-2" />
            History
          </TabsTrigger>
          <TabsTrigger value="filters">
            <CheckCircle className="w-4 h-4 mr-2" />
            Filter Results
          </TabsTrigger>
          <TabsTrigger value="details">
            <FileText className="w-4 h-4 mr-2" />
            Details
          </TabsTrigger>
        </TabsList>

        {/* Review Tab */}
        <TabsContent value="review" className="space-y-4">
          <ReviewSection
            vin={vehicle.vin}
            initialReviewed={vehicle.reviewed_by_user}
            initialRating={vehicle.user_rating}
            initialNotes={vehicle.user_notes}
            onReviewUpdate={handleReviewUpdate}
          />
        </TabsContent>

        {/* Specifications Tab */}
        <TabsContent value="specifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Specifications</CardTitle>
              <CardDescription>
                Detailed specifications from VIN decode and listing data
              </CardDescription>
            </CardHeader>
            <CardContent>
              {vehicle.vin_decode_data ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <SpecItem label="VIN" value={vehicle.vin} />
                    <SpecItem label="Make" value={vehicle.vin_decode_data.make} />
                    <SpecItem label="Model" value={vehicle.vin_decode_data.model} />
                    <SpecItem label="Year" value={vehicle.vin_decode_data.year} />
                    <SpecItem label="Body Type" value={vehicle.vin_decode_data.body_type} />
                    <SpecItem label="Trim" value={vehicle.vin_decode_data.trim} />
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <SpecItem label="Engine" value={vehicle.vin_decode_data.engine_type} />
                    <SpecItem label="Fuel Type" value={vehicle.vin_decode_data.fuel_type} />
                    <SpecItem label="Drive Type" value={vehicle.vin_decode_data.drive_type} />
                    <SpecItem label="Transmission" value={vehicle.vin_decode_data.transmission} />
                    <SpecItem label="Manufacturer" value={vehicle.vin_decode_data.manufacturer} />
                    <SpecItem label="Plant Country" value={vehicle.vin_decode_data.plant_country} />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <SpecItem label="VIN" value={vehicle.vin} />
                  <SpecItem label="Make" value={vehicle.make} />
                  <SpecItem label="Model" value={vehicle.model} />
                  <SpecItem label="Year" value={vehicle.year.toString()} />
                  <SpecItem label="Body Type" value={vehicle.body_type} />
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Detailed VIN decode data not available. Basic information shown above.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mileage Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Mileage Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <SpecItem label="Current Mileage" value={`${formatMileage(vehicle.mileage)} miles`} />
              {vehicle.age_in_years && (
                <SpecItem label="Vehicle Age" value={`${vehicle.age_in_years} years`} />
              )}
              {vehicle.mileage_per_year && (
                <SpecItem
                  label="Mileage Per Year"
                  value={`${formatMileage(vehicle.mileage_per_year)} miles/year`}
                />
              )}
              <SpecItem
                label="Mileage Rating"
                value={mileageBadge.label}
                badge={<Badge className={mileageBadge.className}>{mileageBadge.label}</Badge>}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle History Report</CardTitle>
              <CardDescription>
                Title status, accident history, and ownership information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {vehicle.vin_history_data ? (
                <div className="space-y-6">
                  {/* History Summary */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <HistoryItem
                      label="Title Status"
                      value={vehicle.vin_history_data.title_status}
                      status={vehicle.vin_history_data.title_status === 'clean' ? 'good' : 'warning'}
                    />
                    <HistoryItem
                      label="Accident Count"
                      value={vehicle.vin_history_data.accident_count.toString()}
                      status={vehicle.vin_history_data.accident_count === 0 ? 'good' : 'warning'}
                    />
                    <HistoryItem
                      label="Owner Count"
                      value={vehicle.vin_history_data.owner_count.toString()}
                      status={vehicle.vin_history_data.owner_count <= 2 ? 'good' : 'neutral'}
                    />
                    <HistoryItem
                      label="State of Origin"
                      value={vehicle.vin_history_data.state_of_origin || 'Unknown'}
                      status="neutral"
                    />
                  </div>

                  <Separator />

                  {/* Red Flags */}
                  <div>
                    <h3 className="font-semibold mb-3">Red Flags & Concerns</h3>
                    <div className="space-y-2">
                      <FlagItem
                        label="Rental Vehicle"
                        value={vehicle.vin_history_data.is_rental}
                      />
                      <FlagItem
                        label="Fleet Vehicle"
                        value={vehicle.vin_history_data.is_fleet}
                      />
                      <FlagItem label="Has Lien" value={vehicle.vin_history_data.has_lien} />
                      <FlagItem
                        label="Flood Damage"
                        value={vehicle.vin_history_data.flood_damage}
                      />
                      <FlagItem
                        label="Salvage Title"
                        value={vehicle.vin_history_data.salvage_title}
                      />
                      <FlagItem
                        label="Odometer Rollback"
                        value={vehicle.vin_history_data.odometer_rollback}
                      />
                      <FlagItem
                        label="Theft Record"
                        value={vehicle.vin_history_data.theft_record}
                      />
                    </div>
                  </div>

                  {vehicle.vin_history_data.last_reported_odometer && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <SpecItem
                          label="Last Reported Odometer"
                          value={`${formatMileage(vehicle.vin_history_data.last_reported_odometer)} miles`}
                        />
                        {vehicle.vin_history_data.last_reported_date && (
                          <SpecItem
                            label="Last Report Date"
                            value={formatDate(vehicle.vin_history_data.last_reported_date)}
                          />
                        )}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="p-6 bg-muted rounded-lg text-center">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Vehicle history data not available. This information may be added after
                    running a VIN history check.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Basic History (Always Available) */}
          <Card>
            <CardHeader>
              <CardTitle>Listing Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <SpecItem label="Title Status" value={vehicle.title_status} />
              <SpecItem label="Accident Count" value={vehicle.accident_count.toString()} />
              <SpecItem label="Owner Count" value={vehicle.owner_count.toString()} />
              <div className="space-y-2">
                <FlagItem label="Rental Vehicle" value={vehicle.is_rental} />
                <FlagItem label="Fleet Vehicle" value={vehicle.is_fleet} />
                <FlagItem label="Has Lien" value={vehicle.has_lien} />
                <FlagItem label="Flood Damage" value={vehicle.flood_damage} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Filter Results Tab */}
        <TabsContent value="filters" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Filter Criteria Results</CardTitle>
              <CardDescription>
                How this vehicle performed against your search filters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="quality">
                  <AccordionTrigger>Quality Filters</AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    <FilterResultItem
                      label="Title Status"
                      passed={vehicle.title_status === 'clean'}
                      value={vehicle.title_status}
                    />
                    <FilterResultItem
                      label="Mileage Rating"
                      passed={!!vehicle.mileage_rating}
                      value={vehicle.mileage_rating || 'N/A'}
                    />
                    <FilterResultItem
                      label="Overall Rating"
                      passed={!!vehicle.overall_rating}
                      value={vehicle.overall_rating || 'N/A'}
                    />
                    <FilterResultItem
                      label="Accident Count"
                      passed={vehicle.accident_count <= 1}
                      value={`${vehicle.accident_count} accidents`}
                    />
                    <FilterResultItem
                      label="Owner Count"
                      passed={vehicle.owner_count <= 3}
                      value={`${vehicle.owner_count} owners`}
                    />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="history">
                  <AccordionTrigger>History Checks</AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    <FilterResultItem
                      label="Not a Rental"
                      passed={!vehicle.is_rental}
                      value={vehicle.is_rental ? 'Failed' : 'Passed'}
                    />
                    <FilterResultItem
                      label="Not a Fleet Vehicle"
                      passed={!vehicle.is_fleet}
                      value={vehicle.is_fleet ? 'Failed' : 'Passed'}
                    />
                    <FilterResultItem
                      label="No Lien"
                      passed={!vehicle.has_lien}
                      value={vehicle.has_lien ? 'Has lien' : 'No lien'}
                    />
                    <FilterResultItem
                      label="No Flood Damage"
                      passed={!vehicle.flood_damage}
                      value={vehicle.flood_damage ? 'Failed' : 'Passed'}
                    />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="location">
                  <AccordionTrigger>Location Checks</AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    <FilterResultItem
                      label="Not from Rust Belt"
                      passed={!vehicle.is_rust_belt_state}
                      value={vehicle.is_rust_belt_state ? 'Rust belt state' : 'Non-rust belt'}
                    />
                    <FilterResultItem
                      label="Rust Concern Flag"
                      passed={!vehicle.flag_rust_concern}
                      value={vehicle.flag_rust_concern ? 'Flagged' : 'Not flagged'}
                    />
                    <SpecItem label="Distance from You" value={`${vehicle.distance_miles} miles`} />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="priority">
                  <AccordionTrigger>Priority Score Breakdown</AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Overall Priority Score</span>
                      <Badge variant={vehicle.priority_score >= 80 ? 'default' : 'secondary'}>
                        {vehicle.priority_score}/100
                      </Badge>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div
                        className={cn(
                          'h-3 rounded-full transition-all',
                          vehicle.priority_score >= 80
                            ? 'bg-amber-500'
                            : vehicle.priority_score >= 60
                            ? 'bg-blue-500'
                            : 'bg-gray-400'
                        )}
                        style={{ width: `${vehicle.priority_score}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Priority score is calculated based on model preference, mileage, price,
                      condition, and history.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Listing Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <SpecItem label="Source Platform" value={vehicle.source_platform} />
              <SpecItem label="Listing ID" value={vehicle.source_listing_id} />
              <SpecItem label="First Seen" value={formatDate(vehicle.first_seen_at)} />
              <SpecItem label="Last Updated" value={formatDate(vehicle.last_updated_at)} />
              <SpecItem label="Created At" value={formatDate(vehicle.created_at)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <SpecItem
                label="Reviewed"
                value={vehicle.reviewed_by_user ? "Yes" : "No"}
                badge={
                  vehicle.reviewed_by_user ? (
                    <Badge className="bg-green-500 hover:bg-green-600 text-white border-0">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Reviewed
                    </Badge>
                  ) : (
                    <Badge variant="outline">Not Reviewed</Badge>
                  )
                }
              />
              {vehicle.user_rating && vehicle.user_rating > 0 && (
                <SpecItem
                  label="Your Rating"
                  value={`${vehicle.user_rating}/5 stars`}
                  badge={
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            'w-4 h-4',
                            i < vehicle.user_rating!
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          )}
                        />
                      ))}
                    </div>
                  }
                />
              )}
              {vehicle.user_notes && (
                <div>
                  <p className="text-sm font-medium mb-2">Your Notes:</p>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">{vehicle.user_notes}</p>
                  </div>
                </div>
              )}
              {!vehicle.reviewed_by_user && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    You haven't reviewed this vehicle yet. Click the "Review" tab to add your review, rating, and notes.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper Components

function SpecItem({
  label,
  value,
  badge,
}: {
  label: string;
  value?: string;
  badge?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      {badge ? (
        badge
      ) : (
        <span className="text-sm font-medium">{value || 'N/A'}</span>
      )}
    </div>
  );
}

function HistoryItem({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status: 'good' | 'warning' | 'neutral';
}) {
  const statusConfig = {
    good: { icon: CheckCircle, className: 'text-green-500' },
    warning: { icon: AlertTriangle, className: 'text-orange-500' },
    neutral: { icon: AlertCircle, className: 'text-blue-500' },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
      <div className="flex items-center gap-2">
        <Icon className={cn('w-4 h-4', config.className)} />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className="text-sm">{value}</span>
    </div>
  );
}

function FlagItem({ label, value }: { label: string; value: boolean }) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
      <span className="text-sm">{label}</span>
      <div className="flex items-center gap-2">
        {value ? (
          <>
            <XCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-500 font-medium">Yes</span>
          </>
        ) : (
          <>
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-500 font-medium">No</span>
          </>
        )}
      </div>
    </div>
  );
}

function FilterResultItem({
  label,
  passed,
  value,
}: {
  label: string;
  passed: boolean;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-2">
        {passed ? (
          <CheckCircle className="w-4 h-4 text-green-500" />
        ) : (
          <XCircle className="w-4 h-4 text-orange-500" />
        )}
        <span className="text-sm">{label}</span>
      </div>
      <span className="text-sm text-muted-foreground">{value}</span>
    </div>
  );
}

export default VehicleDetail;
