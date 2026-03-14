'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrder } from '@/lib/context/OrderContext';
import { getUnitPrice, getTotalPrice } from '@/lib/constants';
import { saveOrder } from '@/lib/mock-data';
import { CompletedOrder, FrameStyle } from '@/lib/types';
import StepIndicator from '@/components/ui/StepIndicator';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

function generateOrderId(): string {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `MEM-${num}`;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { state, dispatch } = useOrder();
  const [email, setEmail] = useState(state.email);
  const [emailError, setEmailError] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!state.croppedImage) {
      router.replace('/upload');
    }
  }, [state.croppedImage, router]);

  if (!state.croppedImage) return null;

  const quantity =
    state.mode === 'friends' ? Math.max(1, state.recipients.length) : state.quantity;
  const unitPrice = getUnitPrice(quantity);
  const total = getTotalPrice(quantity);

  const handlePlaceOrder = async () => {
    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    setEmailError('');

    setProcessing(true);
    dispatch({ type: 'SET_EMAIL', payload: email });

    // Simulate payment processing
    await new Promise((res) => setTimeout(res, 1500));

    const orderId = generateOrderId();
    const orderDate = new Date().toISOString();

    // Save to completed orders
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
  };

  return (
    <div className="min-h-screen">
      <nav className="flex items-center justify-between px-6 py-4 max-w-2xl mx-auto">
        <button onClick={() => router.back()} className="text-stone-500 hover:text-stone-700">
          ← Back
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
              <span>{quantity} × ${unitPrice.toFixed(2)}</span>
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

        {/* Mock payment */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 mb-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-stone-700">Payment</p>
            <span className="text-xs text-stone-400 bg-stone-100 px-2 py-1 rounded-full">
              Demo mode
            </span>
          </div>

          <div className="space-y-3">
            <Input
              label="Card number"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
              placeholder="4242 4242 4242 4242"
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Expiry"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value.slice(0, 5))}
                placeholder="MM/YY"
              />
              <Input
                label="CVC"
                value={cvc}
                onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="123"
              />
            </div>
          </div>
        </div>

        <Button
          variant="primary"
          fullWidth
          size="lg"
          onClick={handlePlaceOrder}
          disabled={processing}
        >
          {processing ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Processing...
            </span>
          ) : (
            `Pay $${total.toFixed(2)}`
          )}
        </Button>
      </div>
    </div>
  );
}
