import { PhotoStyle } from './types';

export const PHOTO_STYLES: { id: PhotoStyle; name: string; description: string; emoji: string }[] = [
  { id: 'vintage', name: 'Vintage Film', description: 'Warm, faded', emoji: '🎞️' },
  { id: 'normal', name: 'Original', description: 'Your photo as-is', emoji: '📸' },
  { id: 'bw-vintage', name: 'Black & White', description: 'Timeless mono', emoji: '🖤' },
];

/** @deprecated Use PHOTO_STYLES */
export const FRAMES = PHOTO_STYLES;

export const PRICING_TIERS = [
  { minQty: 5, pricePerUnit: 4.99 },
  { minQty: 3, pricePerUnit: 5.99 },
  { minQty: 1, pricePerUnit: 6.99 },
];

export const QUICK_QUANTITIES = [1, 3, 5, 10];

export const STEP_LABELS = [
  'Upload',
  'Crop',
  'Customize',
  'Recipients',
  'Checkout',
  'Confirmation',
];

export const MAX_CAPTION_LENGTH = 40;

export const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC',
];

export function getUnitPrice(quantity: number): number {
  for (const tier of PRICING_TIERS) {
    if (quantity >= tier.minQty) return tier.pricePerUnit;
  }
  return PRICING_TIERS[PRICING_TIERS.length - 1].pricePerUnit;
}

export function getTotalPrice(quantity: number): number {
  // Fixed bundle prices for exact tier quantities
  if (quantity === 3) return 17.99;
  if (quantity === 5) return 24.99;
  return +(getUnitPrice(quantity) * quantity).toFixed(2);
}

export function getSavingsMessage(quantity: number): string | null {
  if (quantity >= 5) return null;
  if (quantity >= 3) {
    // Show savings from upgrading all magnets to the 5+ tier
    const moreNeeded = 5 - quantity;
    const withoutDiscount = quantity * getUnitPrice(quantity) + moreNeeded * getUnitPrice(quantity);
    const withDiscount = 5 * getUnitPrice(5);
    const savings = +(withoutDiscount - withDiscount).toFixed(2);
    return `Add ${moreNeeded} more to unlock $${getUnitPrice(5).toFixed(2)}/ea — save $${savings.toFixed(2)}`;
  }
  // quantity 1–2: show savings from reaching the 3-magnet tier
  const moreNeeded = 3 - quantity;
  const withoutDiscount = 3 * getUnitPrice(1);
  const withDiscount = 3 * getUnitPrice(3);
  const savings = +(withoutDiscount - withDiscount).toFixed(2);
  if (savings > 0) {
    return `Add ${moreNeeded} more to unlock $${getUnitPrice(3).toFixed(2)}/ea — save $${savings.toFixed(2)}`;
  }
  return null;
}
