import { Address } from '../types';
import { US_STATES } from '../constants';

export interface ValidationResult {
  valid: boolean;
  errors: Partial<Record<keyof Address, string>>;
}

export function validateAddress(address: Address): ValidationResult {
  const errors: Partial<Record<keyof Address, string>> = {};

  if (!address.fullName.trim()) errors.fullName = 'Name is required';
  if (!address.address1.trim()) errors.address1 = 'Address is required';
  if (!address.city.trim()) errors.city = 'City is required';
  if (!address.state) errors.state = 'State is required';
  else if (!US_STATES.includes(address.state)) errors.state = 'Invalid state';
  if (!address.zip.trim()) errors.zip = 'ZIP code is required';
  else if (!/^\d{5}(-\d{4})?$/.test(address.zip)) errors.zip = 'Invalid ZIP code';

  return { valid: Object.keys(errors).length === 0, errors };
}
