'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useOrder } from '@/lib/context/OrderContext';
import { getUnitPrice, getTotalPrice } from '@/lib/constants';
import Button from '@/components/ui/Button';

export default function ConfirmationPage() {
  const router = useRouter();
  const { state, dispatch } = useOrder();

  useEffect(() => {
    if (!state.orderId) {
      router.replace('/upload');
    }
  }, [state.orderId, router]);

  if (!state.orderId) return null;

  const quantity =
    state.mode === 'friends' ? Math.max(1, state.recipients.length) : state.quantity;
  const total = getTotalPrice(quantity);

  return (
    <div className="min-h-screen">
      <nav className="flex items-center justify-center px-6 py-4 max-w-2xl mx-auto">
        <span className="font-[family-name:var(--font-playfair)] text-xl font-bold text-stone-800">
          Memora
        </span>
      </nav>

      <div className="px-6 pb-12 max-w-lg mx-auto text-center">
        {/* Success checkmark */}
        <div className="mt-8 mb-6">
          <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center animate-[scale-in_0.3s_ease-out]">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-stone-900 mb-2">
          Order confirmed!
        </h1>
        <p className="text-stone-500 mb-8">
          Your magnets are on their way to being made
        </p>

        {/* Order details */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 text-left mb-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-stone-500">Order number</span>
            <span className="font-mono font-semibold text-stone-800">{state.orderId}</span>
          </div>

          {state.croppedImage && (
            <div className="flex justify-center mb-4">
              <div className="bg-white p-2 pb-6 shadow-md rounded-sm transform -rotate-1">
                <img
                  src={state.croppedImage}
                  alt="Your magnet"
                  className="w-40 rounded-sm"
                  style={{ aspectRatio: '4/3', objectFit: 'cover' }}
                />
              </div>
            </div>
          )}

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-stone-500">Quantity</span>
              <span className="text-stone-800">{quantity} magnet{quantity !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Total</span>
              <span className="font-medium text-stone-800">${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Shipping to</span>
              <span className="text-stone-800">
                {state.mode === 'self'
                  ? state.selfAddress?.fullName || 'You'
                  : `${state.recipients.length} recipient${state.recipients.length !== 1 ? 's' : ''}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Estimated delivery</span>
              <span className="text-stone-800">3–7 business days</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-stone-500 mb-8">
          A confirmation email has been sent to <strong>{state.email}</strong>
        </p>

        <Button
          variant="primary"
          fullWidth
          size="lg"
          onClick={() => {
            dispatch({ type: 'RESET' });
            router.push('/');
          }}
        >
          Create Another Magnet
        </Button>
      </div>
    </div>
  );
}
