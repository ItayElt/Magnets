'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrder } from '@/lib/context/OrderContext';
import { Address } from '@/lib/types';
import { US_STATES, getUnitPrice, getTotalPrice, getSavingsMessage } from '@/lib/constants';
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
        label="Street address"
        value={address.address1}
        onChange={(e) => onChange({ ...address, address1: e.target.value })}
        error={errors.address1}
        placeholder="123 Main St"
      />
      <Input
        label="Apt / Suite (optional)"
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
            className={`w-full px-2 py-3 rounded-xl border bg-white text-stone-900 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] focus:border-transparent ${
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

function QtyStepper({ qty, onChange, allowZero }: { qty: number; onChange: (n: number) => void; allowZero?: boolean }) {
  const min = allowZero ? 0 : 1;
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onChange(Math.max(min, qty - 1))}
        className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-lg font-medium transition-colors"
      >
        −
      </button>
      <span className="w-6 text-center text-sm font-semibold text-stone-800">{qty}</span>
      <button
        onClick={() => onChange(Math.min(10, qty + 1))}
        className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-lg font-medium transition-colors"
      >
        +
      </button>
    </div>
  );
}

/* Reusable recipient card — used for both "myself" and each friend.
   Pressing minus at qty 1 removes the card (qty goes to 0 → onRemove fires). */
function RecipientCard({
  icon,
  label,
  qty,
  onQtyChange,
  onRemove,
  children,
  defaultOpen,
}: {
  icon: string;
  label: string;
  qty: number;
  onQtyChange: (n: number) => void;
  onRemove: () => void;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);

  const handleQtyChange = (n: number) => {
    if (n === 0) {
      onRemove();
    } else {
      onQtyChange(n);
    }
  };

  return (
    <div className="border-2 border-stone-200 rounded-xl overflow-hidden transition-all">
      {/* Header row */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-white cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">{icon}</span>
          <p className="font-medium text-sm text-stone-800">{label}</p>
        </div>
        <div className="flex items-center gap-3">
          <div onClick={(e) => e.stopPropagation()}>
            <QtyStepper qty={qty} onChange={handleQtyChange} allowZero />
          </div>
          <svg className={`w-4 h-4 text-stone-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Expandable content */}
      {open && (
        <div className="px-4 pb-4 pt-2 bg-stone-50 border-t border-stone-100">
          {children}
        </div>
      )}
    </div>
  );
}

export default function RecipientsPage() {
  const router = useRouter();
  const { state, dispatch } = useOrder();

  const [includeSelf, setIncludeSelf] = useState(true);
  const [myAddress, setMyAddress] = useState<Address>(state.selfAddress || emptyAddress);
  const [myErrors, setMyErrors] = useState<Partial<Record<keyof Address, string>>>({});
  const [myQty, setMyQty] = useState(1);

  const [friendQtys, setFriendQtys] = useState<Record<string, number>>({});

  const [showFriendForm, setShowFriendForm] = useState(false);
  const [friendAddress, setFriendAddress] = useState<Address>(emptyAddress);
  const [friendErrors, setFriendErrors] = useState<Partial<Record<keyof Address, string>>>({});
  const [newFriendQty, setNewFriendQty] = useState(1);

  useEffect(() => {
    if (!state.croppedImage) {
      router.replace('/upload');
    }
  }, [state.croppedImage, router]);

  if (!state.croppedImage) return null;

  const getFriendQty = (id: string) => friendQtys[id] || 1;
  const friendTotal = state.recipients.reduce((sum, r) => sum + getFriendQty(r.id), 0);
  const selfTotal = includeSelf ? myQty : 0;
  const pendingFriendTotal = showFriendForm ? newFriendQty : 0;
  const totalQty = selfTotal + friendTotal + pendingFriendTotal;
  const unitPrice = getUnitPrice(Math.max(1, totalQty));
  const total = getTotalPrice(Math.max(1, totalQty));
  const savings = getSavingsMessage(Math.max(1, totalQty));

  const hasAnyAddress = includeSelf || state.recipients.length > 0 || showFriendForm;

  const addFriend = () => {
    const result = validateAddress(friendAddress);
    if (!result.valid) {
      setFriendErrors(result.errors);
      return;
    }
    setFriendErrors({});
    const id = `r-${Date.now()}`;
    dispatch({ type: 'ADD_RECIPIENT', payload: { id, address: friendAddress } });
    setFriendQtys((prev) => ({ ...prev, [id]: newFriendQty }));
    setFriendAddress(emptyAddress);
    setNewFriendQty(1);
    setShowFriendForm(false);
  };

  const handleContinue = () => {
    if (totalQty === 0) return;

    // Auto-add pending friend if form is open with data
    if (showFriendForm && friendAddress.fullName.trim()) {
      const result = validateAddress(friendAddress);
      if (!result.valid) {
        setFriendErrors(result.errors);
        return;
      }
      setFriendErrors({});
      const id = `r-${Date.now()}`;
      dispatch({ type: 'ADD_RECIPIENT', payload: { id, address: friendAddress } });
      setFriendQtys((prev) => ({ ...prev, [id]: newFriendQty }));
      setFriendAddress(emptyAddress);
      setNewFriendQty(1);
      setShowFriendForm(false);
    }

    if (includeSelf) {
      const result = validateAddress(myAddress);
      if (!result.valid) {
        setMyErrors(result.errors);
        return;
      }
      dispatch({ type: 'SET_SELF_ADDRESS', payload: myAddress });
    } else {
      dispatch({ type: 'SET_SELF_ADDRESS', payload: null as unknown as Address });
    }
    dispatch({ type: 'SET_QUANTITY', payload: totalQty });
    dispatch({ type: 'SET_MODE', payload: (state.recipients.length > 0 || showFriendForm) ? 'friends' : 'self' });
    router.push('/checkout');
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
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-stone-900 text-center mb-1">
          Where should we send it?
        </h1>
        <p className="text-center text-stone-500 text-sm mb-8">Add addresses &middot; choose quantity for each</p>

        {/* ── RECIPIENT CARDS ── */}
        <div className="space-y-3 mb-4">
          {/* My address — optional */}
          {includeSelf && (
            <RecipientCard
              icon="🏠"
              label="My address"
              qty={myQty}
              onQtyChange={setMyQty}
              onRemove={() => {
                setIncludeSelf(false);
                setMyErrors({});
              }}
              defaultOpen={true}
            >
              <AddressForm address={myAddress} onChange={setMyAddress} errors={myErrors} />
            </RecipientCard>
          )}

          {/* Added friends */}
          {state.recipients.map((r) => (
            <RecipientCard
              key={r.id}
              icon="🎁"
              label={r.address.fullName}
              qty={getFriendQty(r.id)}
              onQtyChange={(n) => setFriendQtys((prev) => ({ ...prev, [r.id]: n }))}
              onRemove={() => {
                dispatch({ type: 'REMOVE_RECIPIENT', payload: r.id });
                setFriendQtys((prev) => {
                  const next = { ...prev };
                  delete next[r.id];
                  return next;
                });
              }}
            >
              <p className="text-sm text-stone-500">
                {r.address.address1}{r.address.address2 ? `, ${r.address.address2}` : ''}<br />
                {r.address.city}, {r.address.state} {r.address.zip}
              </p>
            </RecipientCard>
          ))}
        </div>

        {/* ── ADD NEW ADDRESS ── */}
        {showFriendForm ? (
          <div className="border-2 border-stone-200 rounded-xl overflow-hidden mb-6">
            {/* Same header style as RecipientCard */}
            <div className="flex items-center justify-between px-4 py-3 bg-white">
              <div className="flex items-center gap-3">
                <span className="text-lg">🎁</span>
                <p className="font-medium text-sm text-stone-800">Add a friend</p>
              </div>
              <QtyStepper qty={newFriendQty} onChange={(n) => {
                if (n === 0) {
                  setShowFriendForm(false);
                  setFriendAddress(emptyAddress);
                  setFriendErrors({});
                  setNewFriendQty(1);
                } else {
                  setNewFriendQty(n);
                }
              }} allowZero />
            </div>
            <div className="px-4 pb-4 pt-2 bg-stone-50 border-t border-stone-100">
              <AddressForm address={friendAddress} onChange={setFriendAddress} errors={friendErrors} />
              <div className="flex gap-2 mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowFriendForm(false);
                    setFriendAddress(emptyAddress);
                    setFriendErrors({});
                    setNewFriendQty(1);
                  }}
                >
                  Cancel
                </Button>
                <Button variant="secondary" size="sm" fullWidth onClick={addFriend}>
                  Add
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2 mb-6">
            {!includeSelf && (
              <button
                onClick={() => setIncludeSelf(true)}
                className="w-full py-3 border-2 border-dashed border-stone-300 rounded-xl text-stone-500 hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] transition-colors text-sm font-medium"
              >
                + My address
              </button>
            )}
            <button
              onClick={() => setShowFriendForm(true)}
              className="w-full py-3 border-2 border-dashed border-stone-300 rounded-xl text-stone-500 hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] transition-colors text-sm font-medium"
            >
              + A friend&apos;s address
            </button>
          </div>
        )}

        {/* ── PRICE SUMMARY ── */}
        {totalQty > 0 && (
          <div className="bg-stone-100 rounded-2xl p-4 mb-6">
            <div className="flex justify-between text-sm text-stone-600 mb-1">
              <span>{totalQty} magnet{totalQty !== 1 ? 's' : ''} × ${unitPrice.toFixed(2)}</span>
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
              <p className="text-xs text-[var(--color-brand)] mt-2">{savings}</p>
            )}
          </div>
        )}

        {/* Empty state hint */}
        {!hasAnyAddress && (
          <p className="text-center text-stone-400 text-sm mb-6">Add at least one address to continue</p>
        )}

        <Button
          variant="primary"
          fullWidth
          size="lg"
          onClick={handleContinue}
          disabled={totalQty === 0}
        >
          Continue to Checkout
        </Button>
      </div>
    </div>
  );
}
