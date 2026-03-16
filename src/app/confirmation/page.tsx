'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useOrder } from '@/lib/context/OrderContext';
import { getTotalPrice } from '@/lib/constants';
import Button from '@/components/ui/Button';

interface ApiOrderData {
  orderId: string;
  orderDate: string;
  email: string;
  quantity: number;
  totalPrice: number;
  mode: string;
  caption: string;
  selectedFrame: string;
  selfAddress: { fullName: string } | null;
  recipients: { id: string }[];
  croppedImage?: string;
}

function ConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, dispatch } = useOrder();

  const sessionId = searchParams.get('session_id');

  const [apiOrder, setApiOrder] = useState<ApiOrderData | null>(null);
  const [loading, setLoading] = useState(!!sessionId);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionId) return;

    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/by-session?session_id=${sessionId}`);
        if (!res.ok) throw new Error('Failed to fetch order');
        const data = await res.json();
        setApiOrder(data);
      } catch {
        setError('Could not load your order. Please check your email for confirmation.');
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [sessionId]);

  useEffect(() => {
    if (apiOrder) {
      dispatch({ type: 'RESET' });
    }
  }, [apiOrder, dispatch]);

  useEffect(() => {
    if (!sessionId && !state.orderId) {
      router.replace('/upload');
    }
  }, [sessionId, state.orderId, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-stone-400" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-stone-500">Loading your order...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-stone-900 mb-2">
            Something went wrong
          </h1>
          <p className="text-stone-500 mb-6">{error}</p>
          <Button variant="primary" onClick={() => router.push('/')}>
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const orderId = apiOrder?.orderId || state.orderId;
  const orderEmail = apiOrder?.email || state.email;
  const orderMode = apiOrder?.mode || state.mode;
  const croppedImage = apiOrder?.croppedImage || state.croppedImage;

  const quantity = apiOrder
    ? apiOrder.quantity
    : orderMode === 'friends'
    ? Math.max(1, state.recipients.length)
    : state.quantity;

  const total = apiOrder ? apiOrder.totalPrice : getTotalPrice(quantity);

  const recipientCount = apiOrder
    ? apiOrder.recipients?.length || 0
    : state.recipients.length;

  const shippingTo = apiOrder
    ? apiOrder.mode === 'self'
      ? apiOrder.selfAddress?.fullName || 'You'
      : `${recipientCount} recipient${recipientCount !== 1 ? 's' : ''}`
    : state.mode === 'self'
    ? state.selfAddress?.fullName || 'You'
    : `${state.recipients.length} recipient${state.recipients.length !== 1 ? 's' : ''}`;

  if (!orderId) return null;

  return (
    <div className="min-h-screen">
      <nav className="flex items-center justify-center px-6 py-4 max-w-3xl mx-auto">
        <span className="font-[family-name:var(--font-playfair)] text-xl font-bold" style={{ color: '#0066FF' }}>
          Memora
        </span>
      </nav>

      <div className="px-6 pb-12 max-w-xl mx-auto text-center">
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

        <div className="bg-white rounded-2xl p-6 border border-stone-200 text-left mb-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-stone-500">Order number</span>
            <span className="font-mono font-semibold text-stone-800">{orderId}</span>
          </div>

          {croppedImage && (
            <div className="flex justify-center mb-4">
              <div className="bg-white p-2 pb-6 shadow-md rounded-sm transform -rotate-1">
                <img
                  src={croppedImage}
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
              <span className="text-stone-800">{shippingTo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Estimated delivery</span>
              <span className="text-stone-800">3–7 business days</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-stone-500 mb-4">
          A confirmation email has been sent to <strong>{orderEmail}</strong>
        </p>

        <div className="bg-stone-50 rounded-xl p-4 mb-6 text-sm text-stone-500">
          Questions about your order? Contact us at{' '}
          <a href="mailto:support@memoramagnet.shop" className="text-[#0066FF] font-medium hover:underline">
            support@memoramagnet.shop
          </a>
        </div>

        <div className="mt-2">
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
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <svg className="animate-spin h-8 w-8 text-stone-400" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}
