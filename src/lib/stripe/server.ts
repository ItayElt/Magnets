import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripeServer(): Stripe {
  if (_stripe) return _stripe;
  _stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
    apiVersion: '2026-02-25.clover',
  });
  return _stripe;
}

// Backward-compatible export
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (getStripeServer() as any)[prop];
  },
});
