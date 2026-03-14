'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrder } from '@/lib/context/OrderContext';
import { Address, Recipient } from '@/lib/types';
import { QUICK_QUANTITIES, US_STATES, getUnitPrice, getTotalPrice, getSavingsMessage } from '@/lib/constants';
import { validateAddress } from '@/lib/utils/address';
import StepIndicator from '@/components/ui/StepIndicator';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const emptyAddress: Address = {
  fullName: '',
  address1: '',
  address2: '',
  city: '',
  state: '',
  zip: '',
};

function AddressForm({
  address,
  onChange,
  errors,
}: {
  address: Address;
  onChange: (address: Address) => void;
  errors: Partial<Record<keyof Address, string>>;
}) {
  return (
    <div className="space-y-3">
      <Input
        label="Full name"
        value={address.fullName}
        onChange={(e) => onChange({ ...address, fullName: e.target.value })}
        error={errors.fullName}
        placeholder="John Smith"
      />
      <Input
        label="Address line 1"
        value={address.address1}
        onChange={(e) => onChange({ ...address, address1: e.target.value })}
        error={errors.address1}
        placeholder="123 Main St"
      />
      <Input
        label="Address line 2 (optional)"
        value={address.address2}
        onChange={(e) => onChange({ ...address, address2: e.target.value })}
        placeholder="Apt 4B"
      />
      <div className="grid grid-cols-5 gap-3">
        <div className="col-span-2">
          <Input
            label="City"
            value={address.city}
            onChange={(e) => onChange({ ...address, city: e.target.value })}
            error={errors.city}
            placeholder="Boston"
          />
        </div>
        <div className="col-span-1">
          <label className="block text-sm font-medium text-stone-700 mb-1">State</label>
          <select
            value={address.state}
            onChange={(e) => onChange({ ...address, state: e.target.value })}
            className={`w-full px-2 py-3 rounded-xl border bg-white text-stone-900 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
              errors.state ? 'border-red-400' : 'border-stone-300'
            }`}
          >
            <option value="">--</option>
            {US_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {errors.state && <p className="mt-1 text-sm text-red-500">{errors.state}</p>}
        </div>
        <div className="col-span-2">
          <Input
            label="ZIP"
            value={address.zip}
            onChange={(e) => onChange({ ...address, zip: e.target.value })}
            error={errors.zip}
            placeholder="02118"
          />
        </div>
      </div>
    </div>
  );
}

export default function RecipientsPage() {
  const router = useRouter();
  const { state, dispatch } = useOrder();
  const [selfAddress, setSelfAddress] = useState<Address>(state.selfAddress || emptyAddress);
  const [selfErrors, setSelfErrors] = useState<Partial<Record<keyof Address, string>>>({});
  const [newRecipient, setNewRecipient] = useState<Address>(emptyAddress);
  const [recipientErrors, setRecipientErrors] = useState<Partial<Record<keyof Address, string>>>({});
  const [showAddForm, setShowAddForm] = useState(state.recipients.length === 0);

  useEffect(() => {
    if (!state.croppedImage) {
      router.replace('/upload');
    }
  }, [state.croppedImage, router]);

  if (!state.croppedImage) return null;

  const quantity = state.mode === 'friends' ? Math.max(1, state.recipients.length) : state.quantity;
  const unitPrice = getUnitPrice(quantity);
  const total = getTotalPrice(quantity);
  const savings = getSavingsMessage(quantity);

  const handleContinue = () => {
    if (state.mode === 'self') {
      const result = validateAddress(selfAddress);
      if (!result.valid) {
        setSelfErrors(result.errors);
        return;
      }
      dispatch({ type: 'SET_SELF_ADDRESS', payload: selfAddress });
      dispatch({ type: 'SET_QUANTITY', payload: state.quantity });
    } else {
      if (state.recipients.length === 0) return;
    }
    router.push('/checkout');
  };

  const addRecipient = () => {
    const result = validateAddress(newRecipient);
    if (!result.valid) {
      setRecipientErrors(result.errors);
      return;
    }
    setRecipientErrors({});
    dispatch({
      type: 'ADD_RECIPIENT',
      payload: {
        id: `r-${Date.now()}`,
        address: newRecipient,
      },
    });
    setNewRecipient(emptyAddress);
    setShowAddForm(false);
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

      <StepIndicator currentStep={3} />

      <div className="px-6 pb-12 max-w-lg mx-auto">
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-stone-900 text-center mb-2">
          Who&apos;s it for?
        </h1>
        <p className="text-center text-stone-500 mb-8">Send magnets to yourself or friends</p>

        {/* Mode toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 rounded-xl mb-8">
          <button
            onClick={() => dispatch({ type: 'SET_MODE', payload: 'self' })}
            className={`py-3 rounded-lg font-medium text-sm transition-all ${
              state.mode === 'self'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            Send to Myself
          </button>
          <button
            onClick={() => dispatch({ type: 'SET_MODE', payload: 'friends' })}
            className={`py-3 rounded-lg font-medium text-sm transition-all ${
              state.mode === 'friends'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            Send to Friends
          </button>
        </div>

        {state.mode === 'self' ? (
          <>
            {/* Quantity selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-stone-700 mb-3">Quantity</label>
              <div className="flex gap-2">
                {QUICK_QUANTITIES.map((q) => (
                  <button
                    key={q}
                    onClick={() => dispatch({ type: 'SET_QUANTITY', payload: q })}
                    className={`flex-1 py-3 rounded-xl border-2 font-medium text-sm transition-all ${
                      state.quantity === q
                        ? 'border-amber-600 bg-amber-50 text-amber-800'
                        : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Address form */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-stone-700 mb-3">Shipping address</label>
              <div className="bg-white rounded-2xl p-4 border border-stone-200">
                <AddressForm address={selfAddress} onChange={setSelfAddress} errors={selfErrors} />
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Recipients list */}
            {state.recipients.length > 0 && (
              <div className="space-y-3 mb-4">
                {state.recipients.map((r, i) => (
                  <div
                    key={r.id}
                    className="bg-white rounded-xl p-4 border border-stone-200 flex items-start justify-between"
                  >
                    <div>
                      <p className="font-medium text-stone-800">{r.address.fullName}</p>
                      <p className="text-sm text-stone-500">
                        {r.address.address1}, {r.address.city}, {r.address.state} {r.address.zip}
                      </p>
                    </div>
                    <button
                      onClick={() => dispatch({ type: 'REMOVE_RECIPIENT', payload: r.id })}
                      className="text-stone-400 hover:text-red-500 text-sm ml-3 shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            {showAddForm ? (
              <div className="bg-white rounded-2xl p-4 border border-stone-200 mb-4">
                <h3 className="text-sm font-medium text-stone-700 mb-3">
                  Recipient {state.recipients.length + 1}
                </h3>
                <AddressForm
                  address={newRecipient}
                  onChange={setNewRecipient}
                  errors={recipientErrors}
                />
                <div className="flex gap-2 mt-4">
                  {state.recipients.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowAddForm(false);
                        setNewRecipient(emptyAddress);
                        setRecipientErrors({});
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button variant="secondary" size="sm" fullWidth onClick={addRecipient}>
                    Add Recipient
                  </Button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full py-3 border-2 border-dashed border-stone-300 rounded-xl text-stone-500 hover:border-amber-400 hover:text-amber-700 transition-colors text-sm font-medium mb-4"
              >
                + Add another recipient
              </button>
            )}
          </>
        )}

        {/* Price summary */}
        <div className="bg-stone-100 rounded-2xl p-4 mb-6">
          <div className="flex justify-between text-sm text-stone-600 mb-1">
            <span>{quantity} magnet{quantity !== 1 ? 's' : ''} × ${unitPrice.toFixed(2)}</span>
            <span className="font-medium">${total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-stone-600">
            <span>Shipping</span>
            <span className="font-medium text-green-600">Free</span>
          </div>
          <div className="border-t border-stone-200 mt-2 pt-2 flex justify-between">
            <span className="font-semibold text-stone-800">Total</span>
            <span className="font-semibold text-stone-800">${total.toFixed(2)}</span>
          </div>
          {savings && (
            <p className="text-xs text-amber-600 mt-2">{savings}</p>
          )}
        </div>

        <Button
          variant="primary"
          fullWidth
          size="lg"
          onClick={handleContinue}
          disabled={state.mode === 'friends' && state.recipients.length === 0}
        >
          Continue to Checkout
        </Button>
      </div>
    </div>
  );
}
