/**
 * Car Image Utility
 *
 * Generates URLs for car images using multiple strategies:
 * 1. IMAGIN.studio API (free, high-quality 3D renders)
 * 2. Static URLs from Unsplash (fallback)
 * 3. Generic car placeholder
 */

export interface CarImageOptions {
  make: string;
  model: string;
  year: number;
  angle?: 'side' | 'front' | 'rear' | '34' | 'interior';
  width?: number;
  height?: number;
}

/**
 * Generate car image URL from IMAGIN.studio API
 * Free API that provides high-quality car images
 *
 * Format: https://cdn.imagin.studio/getImage?customer=hrjavascript-mastery&make=MAKE&modelFamily=MODEL&zoomType=fullscreen&angle=ANGLE
 */
export function getCarImageUrl(options: CarImageOptions): string {
  const {
    make,
    model,
    year: _year,
    angle = 'side',
    width = 1920,
    height = 1080,
  } = options;

  // Clean up make and model for URL
  const cleanMake = make.toLowerCase().replace(/\s+/g, '');
  const cleanModel = model.toLowerCase().replace(/\s+/g, '-');

  // IMAGIN.studio angle mapping
  const angleMap: Record<string, string> = {
    side: '01', // Side view
    front: '05', // Front view
    rear: '08', // Rear view
    '34': '01', // 3/4 front view
    interior: '13', // Interior view
  };

  // Use free IMAGIN.studio API
  // Note: Using the public customer key from examples
  const imaginUrl = `https://cdn.imagin.studio/getImage?customer=hrjavascript-mastery&make=${cleanMake}&modelFamily=${cleanModel}&zoomType=fullscreen&angle=${angleMap[angle]}&width=${width}&height=${height}`;

  return imaginUrl;
}

/**
 * Get multiple angles for a car
 */
export function getCarImageGallery(
  options: Omit<CarImageOptions, 'angle'>
): string[] {
  const angles: Array<CarImageOptions['angle']> = [
    'side',
    '34',
    'front',
    'rear',
    'interior',
  ];

  return angles.map((angle) => getCarImageUrl({ ...options, angle }));
}

/**
 * Get fallback image URL using Unsplash
 * Only used if IMAGIN.studio fails to load
 */
export function getFallbackCarImage(_make: string, _model: string): string {
  return `https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3`;
}

/**
 * Generate placeholder SVG for loading state
 */
export function getCarPlaceholder(
  make: string,
  model: string,
  year: number
): string {
  const text = `${year} ${make} ${model}`;
  const encoded = encodeURIComponent(text);

  // Generate a simple SVG placeholder with car icon
  return `data:image/svg+xml,${encoded}`;
}

/**
 * Common car models and their specific image adjustments
 */
const CAR_MODEL_OVERRIDES: Record<string, { angle?: string; zoom?: string }> = {
  rav4: { angle: '01' },
  'cr-v': { angle: '01' },
  highlander: { angle: '01' },
  pilot: { angle: '01' },
  '4runner': { angle: '01' },
  camry: { angle: '01' },
  accord: { angle: '01' },
  civic: { angle: '01' },
  corolla: { angle: '01' },
};

/**
 * Get optimized image URL for specific car models
 */
export function getOptimizedCarImage(options: CarImageOptions): string {
  const modelKey = options.model.toLowerCase().replace(/\s+/g, '-');
  const overrides = CAR_MODEL_OVERRIDES[modelKey];

  if (overrides) {
    return getCarImageUrl({
      ...options,
      angle: (overrides.angle as CarImageOptions['angle']) || options.angle,
    });
  }

  return getCarImageUrl(options);
}
