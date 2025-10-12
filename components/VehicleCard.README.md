# VehicleCard Component

A beautiful, reusable React component for displaying vehicle listings in the YourToyotaPicks project.

## Features

- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- **Image Display**: Shows vehicle images with fallback placeholder
- **Key Information**: Displays make, model, year, price, mileage, and location
- **Visual Indicators**:
  - Color-coded mileage rating badges (Excellent/Good/Acceptable)
  - Priority score badge for high-value listings
  - Rust belt warning indicator
  - Owner count badge
- **Hover Effects**: Subtle animations for better user experience
- **Tooltips**: Additional context on hover for badges and icons
- **Fully Typed**: Complete TypeScript support
- **Accessible**: Built with shadcn/ui components following best practices

## Installation

The component uses the following dependencies (already included in the project):

```bash
# UI Components (shadcn/ui)
npx shadcn@latest add tooltip  # Already installed
npx shadcn@latest add card     # Already installed
npx shadcn@latest add badge    # Already installed
npx shadcn@latest add button   # Already installed

# Icons
npm install lucide-react       # Already installed
```

## Props Interface

```typescript
export interface VehicleCardProps {
  vehicle: Vehicle | ListingSummary;
  className?: string;
}
```

### Vehicle/ListingSummary Properties Used:
- `vin`: Vehicle Identification Number (for linking to details)
- `make`: Vehicle make (Toyota/Honda)
- `model`: Vehicle model name
- `year`: Vehicle year
- `price`: Price in USD
- `mileage`: Odometer reading
- `mileage_rating`: Rating (excellent/good/acceptable)
- `priority_score`: Numeric score (0-100)
- `current_location`: City, State
- `distance_miles`: Distance from user
- `dealer_name`: Optional dealer name
- `images_url`: Array of image URLs (first one is used)
- `owner_count`: Number of previous owners
- `flag_rust_concern`: Boolean for rust belt warning

## Usage Examples

### Basic Usage

```tsx
import { VehicleCard } from "@/components/VehicleCard";
import type { ListingSummary } from "@/lib/types";

const vehicle: ListingSummary = {
  id: "1",
  vin: "4T1BF1FK9HU123456",
  make: "Toyota",
  model: "RAV4 XLE",
  year: 2018,
  price: 16500,
  mileage: 45000,
  mileage_rating: "excellent",
  priority_score: 92,
  current_location: "Silver Spring, MD",
  distance_miles: 12,
  owner_count: 1,
  flag_rust_concern: false,
  // ... other required fields
};

export function MyPage() {
  return <VehicleCard vehicle={vehicle} />;
}
```

### Grid Layout

```tsx
export function VehicleGrid({ vehicles }: { vehicles: ListingSummary[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {vehicles.map((vehicle) => (
        <VehicleCard key={vehicle.id} vehicle={vehicle} />
      ))}
    </div>
  );
}
```

### List Layout

```tsx
export function VehicleList({ vehicles }: { vehicles: ListingSummary[] }) {
  return (
    <div className="space-y-4 max-w-2xl">
      {vehicles.map((vehicle) => (
        <VehicleCard key={vehicle.id} vehicle={vehicle} />
      ))}
    </div>
  );
}
```

### Custom Styling

```tsx
export function FeaturedVehicle({ vehicle }: { vehicle: ListingSummary }) {
  return (
    <VehicleCard
      vehicle={vehicle}
      className="border-2 border-primary shadow-xl"
    />
  );
}
```

## Design Decisions

### Visual Design
- **Card-based Layout**: Uses shadcn/ui Card component for consistency
- **Hover Effects**: Subtle lift and shadow on hover (-translate-y-1, shadow-lg)
- **Image Scaling**: Smooth zoom effect on card hover (scale-105)
- **Placeholder**: Clean SVG placeholder when no image is available
- **Responsive**: Optimized for all screen sizes

### Color-Coded Badges
- **Excellent Mileage**: Green (bg-green-500)
- **Good Mileage**: Blue (bg-blue-500)
- **Acceptable Mileage**: Gray (bg-gray-500)
- **Priority**: Amber/Gold (bg-amber-500) with trophy icon
- **Rust Belt Warning**: Orange (bg-orange-500) with alert icon

### Information Hierarchy
1. **Primary**: Vehicle image and title (year, make, model)
2. **Secondary**: Price and mileage (most important metrics)
3. **Tertiary**: Location and distance
4. **Supporting**: Badges (mileage rating, owner count, priority)
5. **Additional**: Dealer name (if available)

### Icons Used
- `Car`: Placeholder image
- `DollarSign`: Price indicator
- `Gauge`: Mileage indicator
- `MapPin`: Location indicator
- `User`: Owner count
- `Trophy`: Priority badge
- `AlertTriangle`: Rust belt warning

### Accessibility
- Tooltips provide additional context
- Semantic HTML structure
- Proper contrast ratios
- Focus states on interactive elements
- Alt text for images

## Component Structure

```
VehicleCard
├── Card (container)
│   ├── Image Section
│   │   ├── Vehicle Image / Placeholder
│   │   ├── Priority Badge (overlay)
│   │   └── Rust Belt Warning (overlay)
│   │
│   ├── CardContent
│   │   ├── Vehicle Title
│   │   ├── Price & Mileage
│   │   ├── Location & Distance
│   │   ├── Badges (mileage, owners)
│   │   └── Dealer Name
│   │
│   └── CardFooter
│       └── View Details Button
```

## Helper Functions

### `formatPrice(price: number): string`
Formats price as USD currency without cents.

```tsx
formatPrice(16500); // "$16,500"
```

### `formatMileage(mileage: number): string`
Formats mileage with K suffix for thousands.

```tsx
formatMileage(45000);  // "45K miles"
formatMileage(950);    // "950 miles"
```

### `getMileageBadgeStyle(rating?: MileageRating)`
Returns the appropriate badge variant, className, and label for a mileage rating.

### `isHighPriority(score: number): boolean`
Determines if a priority score is high enough to show the priority badge (>= 80).

## Customization

### Adjusting Priority Threshold
Change the threshold in the `isHighPriority` function:

```tsx
const isHighPriority = (score: number): boolean => {
  return score >= 85; // Adjust from 80 to 85
};
```

### Custom Badge Colors
Modify the `getMileageBadgeStyle` function to use different colors:

```tsx
case "excellent":
  return {
    variant: "default",
    className: "bg-emerald-500 hover:bg-emerald-600 text-white border-0",
    label: "Excellent Mileage",
  };
```

### Different Image Aspect Ratio
Change the height class on the image container:

```tsx
<div className="relative h-56 w-full overflow-hidden"> {/* Changed from h-48 */}
```

## Browser Support

Works on all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Uses Next.js Image component for optimized loading (if configured)
- Lazy loading of images
- Minimal re-renders with React.memo (can be added if needed)
- Efficient CSS transitions
- No heavy dependencies

## Future Enhancements

Potential improvements for future versions:
- Add "Save" or "Favorite" button
- Comparison checkbox
- Quick view modal
- Image carousel for multiple photos
- Share functionality
- More detailed tooltips with full vehicle specs
- Animation on mount (stagger effect)
- Skeleton loading state

## Related Files

- `/lib/types.ts`: TypeScript type definitions
- `/components/ui/card.tsx`: Card component
- `/components/ui/badge.tsx`: Badge component
- `/components/ui/button.tsx`: Button component
- `/components/ui/tooltip.tsx`: Tooltip component
- `/components/VehicleCard.example.tsx`: Usage examples

## License

Part of the YourToyotaPicks project.
