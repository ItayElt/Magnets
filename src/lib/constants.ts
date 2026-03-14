import { FrameStyle } from './types';

export const FRAMES: { id: FrameStyle; name: string; description: string }[] = [
  { id: 'minimal-polaroid', name: 'Minimal Polaroid', description: 'Clean white border' },
  { id: 'vintage-border', name: 'Vintage Border', description: 'Warm cream border' },
  { id: 'caption-frame', name: 'Caption Frame', description: 'With text strip' },
];

export const PRICING_TIERS = [
  { minQty: 5, pricePerUnit: 4.49 },
  { minQty: 3, pricePerUnit: 4.99 },
  { minQty: 1, pricePerUnit: 5.99 },
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
  return +(getUnitPrice(quantity) * quantity).toFixed(2);
}

export function getSavingsMessage(quantity: number): string | null {
  if (quantity >= 5) return null;
  if (quantity >= 3) {
    const savings = +((5 - quantity) * (getUnitPrice(quantity) - getUnitPrice(5))).toFixed(2);
    const moreNeeded = 5 - quantity;
    return `Add ${moreNeeded} more → save $${(savings + moreNeeded * getUnitPrice(5) - moreNeeded * getUnitPrice(quantity)).toFixed(2)} total`;
  }
  const moreNeeded = 3 - quantity;
  const currentTotal = getTotalPrice(quantity);
  const newTotal = getTotalPrice(quantity + moreNeeded);
  const savings = (currentTotal + moreNeeded * getUnitPrice(quantity)) - newTotal;
  if (savings > 0) {
    return `Add ${moreNeeded} more magnet${moreNeeded > 1 ? 's' : ''} → save $${savings.toFixed(2)}`;
  }
  return null;
}
