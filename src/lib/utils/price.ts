import { getUnitPrice } from '../constants';

export function calculateOrderTotal(quantity: number) {
  const unitPrice = getUnitPrice(quantity);
  const subtotal = +(unitPrice * quantity).toFixed(2);
  const shipping = 0; // free shipping for MVP
  const total = +(subtotal + shipping).toFixed(2);

  return { unitPrice, subtotal, shipping, total };
}
