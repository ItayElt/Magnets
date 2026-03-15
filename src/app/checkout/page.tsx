'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrder } from '@/lib/context/OrderContext';
import { getUnitPrice, getTotalPrice } from '@/lib/constants';
import { saveOrder } from '@/lib/mock-data';
import { CompletedOrder, FrameStyle } from '@/lib/types';
import { uploadCroppedImage } from '@/lib/services/image-upload';
import StepIndicator from '@/components/ui/StepIndicator';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

function generateOrderId(): string {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `MEM-${num}`;
}

const isStripeConfigured = typeof window !== 'undefined' && !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

export default function CheckoutPage() {
  const router = useRouter();
  const { state, dispatch } = useOrder();
  const [email, setEmail] = useState(state.email);
  const [emailError, setEmailError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');

  useEffect(() => {
    if (!state.croppedImage) {
      router.replace('/upload');
    }
  }, [state.croppedImage, router]);

  if (!state.croppedImage) return null;

  const quantity = Math.max(1, state.quantity);
  const unitPrice = getUnitPrice(quantity);
  const total = getTotalPrice(quantity);

  const handleProceedToPayment = async () => {
    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    setEmailError('');
    setProcessing(true);
    dispatch({ type: 'SET_EMAIL', payload: email });

    if (!isStripeConfigured) {
      // Fallback: mock behavior for development
      setProcessingMessage('Processing...');
      await new Promise((res) => setTimeout(res, 1500));

      const orderId = generateOrderId();
      const orderDate = new Date().toISOString();

      const completedOrder: CompletedOrder = {
        orderId,
        orderDate,
        email,
        mode: state.mode,
        quantity,
        selectedFrame: state.selectedFrame,
        caption: state.caption,
        croppedImage: state.croppedImage || '',
        selfAddress: state.selfAddress,
        recipients: state.recipients,
        unitPrice,
        totalPrice: total,
        status: 'processing',
      };
      saveOrder(completedOrder);

      dispatch({
        type: 'COMPLETE_ORDER',
        payload: { orderId, orderDate },
      });

      router.push('/confirmation');
      return;
    }

    try {
      // Step 1: Upload image via server-side API
      let imagePath: string | null = null;
      if (state.croppedImage) {
        setProcessingMessage('Uploading image...');
        try {
          // Convert data URL to blob then upload via API route
          const res = await fetch(state.croppedImage);
          const blob = await res.blob();
          const formData = new FormData();
          formData.append('file', blob, 'magnet.jpg');

          const uploadRes = await fetch('/api/upload-image', {
            method: 'POST',
            body: formData,
          });

          if (uploadRes.ok) {
            const { imagePath: path } = await uploadRes.json();
            imagePath = path;
          } else {
            console.error('Image upload failed:', await uploadRes.text());
          }
        } catch (err) {
          console.error('Image upload failed, continuing without image:', err);
        }
      }

      // Step 2: Create Stripe Checkout session
      setProcessingMessage('Preparing payment...');
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          quantity,
          photoStyle: state.selectedFrame,
          caption: state.caption,
          mode: state.mode,
          selfAddress: state.selfAddress,
          recipients: state.recipients,
          imagePath,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();

      if (!url) {
        throw new Error('No checkout URL returned');
      }

      // Step 3: Redirect to Stripe Checkout
      window.location.href = url;
    } catch (err) {
      console.error('Checkout error:', err);
      setProcessingMessage('');
      setProcessing(false);
      setEmailError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen">
      <nav className="flex items-center justify-between px-6 py-4 max-w-2xl mx-auto">
        <button onClick={() => router.push('/recipients')} className="text-stone-500 hover:text-stone-700">
          &larr; Back
        </button>
        <span className="font-[family-name:var(--font-playfair)] text-xl font-bold text-stone-800">
          Memora
        </span>
        <div className="w-12" />
      </nav>

      <StepIndicator currentStep={4} />

      <div className="px-6 pb-12 max-w-lg mx-auto">
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-stone-900 text-center mb-8">
          Checkout
        </h1>

        {/* Order summary */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 mb-6">
          <div className="flex gap-4">
            <div className="shrink-0">
              <div className="bg-white p-1 pb-3 shadow rounded-sm">
                <img
                  src={state.croppedImage}
                  alt="Your magnet"
                  className="w-20 h-auto rounded-sm"
                  style={{ aspectRatio: '4/3', objectFit: 'cover' }}
                />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-stone-800">
                {quantity} magnet{quantity !== 1 ? 's' : ''}
              </p>
              <p className="text-sm text-stone-500 capitalize">
                {state.selectedFrame.replace('-', ' ')} frame
              </p>
              {state.caption && (
                <p className="text-sm text-stone-400 truncate">&ldquo;{state.caption}&rdquo;</p>
              )}
              <p className="text-sm text-stone-500 mt-1">
                {state.mode === 'self'
                  ? 'Shipping to you'
                  : `Shipping to ${state.recipients.length} friend${state.recipients.length !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
          <div className="border-t border-stone-100 mt-3 pt-3">
            <div className="flex justify-between text-sm text-stone-600">
              <span>{quantity} &times; ${unitPrice.toFixed(2)}</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-stone-600">
              <span>Shipping</span>
              <span className="text-green-600">Free</span>
            </div>
            <div className="flex justify-between font-semibold text-stone-800 mt-1">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Email */}
        <div className="mb-6">
          <Input
            label="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={emailError}
            placeholder="you@example.com"
          />
          <p className="text-xs text-stone-400 mt-1">For order confirmation and shipping updates</p>
        </div>

        {/* CTA Button */}
        <Button
          variant="primary"
          fullWidth
          size="lg"
          onClick={handleProceedToPayment}
          disabled={processing}
        >
          {processing ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {processingMessage || 'Processing...'}
            </span>
          ) : (
            `Proceed to Payment — $${total.toFixed(2)}`
          )}
        </Button>

        {/* Stripe badge */}
        <div className="flex items-center justify-center gap-1.5 mt-4 text-stone-400">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          <span className="text-xs font-[family-name:var(--font-dm-sans)]">Secure payment by Stripe</span>
        </div>
      </div>
    </div>
  );
}
