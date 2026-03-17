'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useOrder } from '@/lib/context/OrderContext';
import { Address } from '@/lib/types';
import { US_STATES, getUnitPrice, getTotalPrice, getSavingsMessage } from '@/lib/constants';
import { validateAddress } from '@/lib/utils/address';
import StepIndicator from '@/components/ui/StepIndicator';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const STATE_NAMES: Record<string, string> = {
  AL:'Alabama',AK:'Alaska',AZ:'Arizona',AR:'Arkansas',CA:'California',
  CO:'Colorado',CT:'Connecticut',DE:'Delaware',FL:'Florida',GA:'Georgia',
  HI:'Hawaii',ID:'Idaho',IL:'Illinois',IN:'Indiana',IA:'Iowa',
  KS:'Kansas',KY:'Kentucky',LA:'Louisiana',ME:'Maine',MD:'Maryland',
  MA:'Massachusetts',MI:'Michigan',MN:'Minnesota',MS:'Mississippi',MO:'Missouri',
  MT:'Montana',NE:'Nebraska',NV:'Nevada',NH:'New Hampshire',NJ:'New Jersey',
  NM:'New Mexico',NY:'New York',NC:'North Carolina',ND:'North Dakota',OH:'Ohio',
  OK:'Oklahoma',OR:'Oregon',PA:'Pennsylvania',RI:'Rhode Island',SC:'South Carolina',
  SD:'South Dakota',TN:'Tennessee',TX:'Texas',UT:'Utah',VT:'Vermont',
  VA:'Virginia',WA:'Washington',WV:'West Virginia',WI:'Wisconsin',WY:'Wyoming',DC:'Washington DC',
};

function StateAutocomplete({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (val: string) => void;
  error?: string;
}) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number; flipped: boolean } | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sync external value changes
  useEffect(() => { setQuery(value); }, [value]);

  // Update dropdown position on scroll/resize, close if input scrolls out of view
  useEffect(() => {
    if (!open) return;
    const updatePos = () => {
      if (!wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      // Close if input scrolled out of viewport
      if (rect.bottom < 0 || rect.top > window.innerHeight) {
        setOpen(false);
        return;
      }
      const dropdownHeight = 200; // approximate max height
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const flipAbove = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;
      const dropdownWidth = Math.min(window.innerWidth - 32, 220);
      setDropdownPos({
        top: flipAbove ? rect.top - 4 : rect.bottom + 4,
        left: Math.min(rect.left, window.innerWidth - dropdownWidth - 8),
        flipped: flipAbove,
      });
    };
    updatePos();
    window.addEventListener('scroll', updatePos, { passive: true });
    window.addEventListener('resize', updatePos, { passive: true });
    return () => {
      window.removeEventListener('scroll', updatePos);
      window.removeEventListener('resize', updatePos);
    };
  }, [open]);

  const filtered = query
    ? US_STATES.filter((s) => {
        const q = query.toLowerCase();
        const abbr = s.toLowerCase();
        const name = STATE_NAMES[s]?.toLowerCase() ?? '';
        return abbr.startsWith(q) || name.startsWith(q) || name.split(' ').some(w => w.startsWith(q));
      })
    : US_STATES;

  const handleSelect = (abbr: string) => {
    onChange(abbr);
    setQuery(abbr);
    setOpen(false);
    setHighlightIdx(-1);
  };

  const handleBlur = (e: React.FocusEvent) => {
    if (wrapperRef.current?.contains(e.relatedTarget as Node)) return;
    const match = US_STATES.find(
      (s) => s.toLowerCase() === query.toLowerCase() || STATE_NAMES[s]?.toLowerCase() === query.toLowerCase()
    );
    if (match) {
      handleSelect(match);
    } else if (query && !US_STATES.includes(query)) {
      setQuery(value);
    }
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') { setOpen(true); e.preventDefault(); }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIdx((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightIdx >= 0 && filtered[highlightIdx]) {
        handleSelect(filtered[highlightIdx]);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-sm font-medium text-stone-700 mb-1">State</label>
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange('');
          setOpen(true);
          setHighlightIdx(0);
        }}
        onFocus={() => setOpen(true)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder="CA"
        className={`w-full px-2 py-3 rounded-xl border bg-white text-stone-900 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent ${
          error ? 'border-red-400' : 'border-stone-300'
        }`}
      />
      {open && dropdownPos && filtered.length > 0 && (
        <div
          className="fixed z-[100] bg-white border border-stone-200 rounded-xl shadow-lg max-h-[200px] overflow-y-auto animate-in fade-in duration-150"
          style={{
            top: dropdownPos.flipped ? undefined : dropdownPos.top,
            bottom: dropdownPos.flipped ? `${window.innerHeight - dropdownPos.top}px` : undefined,
            left: dropdownPos.left,
            width: Math.min(window.innerWidth - 32, 220),
          }}
        >
          {filtered.map((s, i) => (
            <button
              key={s}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(s)}
              className={`w-full text-left px-3 py-3 text-sm transition-colors min-h-[44px] ${
                i === highlightIdx ? 'bg-[#0066FF] text-white' : 'text-stone-700 hover:bg-stone-50'
              } ${i === 0 ? 'rounded-t-xl' : ''} ${i === filtered.length - 1 ? 'rounded-b-xl' : ''}`}
            >
              <span className="font-medium">{s}</span>
              <span className={`ml-1.5 ${i === highlightIdx ? 'text-blue-100' : 'text-stone-400'}`}>
                {STATE_NAMES[s]}
              </span>
            </button>
          ))}
        </div>
      )}
      {open && dropdownPos && filtered.length === 0 && query && (
        <div
          className="fixed z-[100] bg-white border border-stone-200 rounded-xl shadow-lg px-3 py-3 text-sm text-stone-400"
          style={{
            top: dropdownPos.flipped ? undefined : dropdownPos.top,
            bottom: dropdownPos.flipped ? `${window.innerHeight - dropdownPos.top}px` : undefined,
            left: dropdownPos.left,
            width: Math.min(window.innerWidth - 32, 220),
          }}
        >
          No matching state
        </div>
      )}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

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
  const [zipLoading, setZipLoading] = useState(false);
  const [zipAutoFilled, setZipAutoFilled] = useState(false);

  const handleZipChange = useCallback(
    async (zip: string) => {
      onChange({ ...address, zip });
      // Auto-fill city & state from ZIP when exactly 5 digits
      if (/^\d{5}$/.test(zip)) {
        setZipLoading(true);
        try {
          const res = await fetch(`https://api.zippopotam.us/us/${zip}`);
          if (res.ok) {
            const data = await res.json();
            const place = data?.places?.[0];
            if (place) {
              onChange({
                ...address,
                zip,
                city: place['place name'] || address.city,
                state: place['state abbreviation'] || address.state,
              });
              setZipAutoFilled(true);
              setTimeout(() => setZipAutoFilled(false), 2000);
            }
          }
        } catch {
          // Silently fail — user can type manually
        } finally {
          setZipLoading(false);
        }
      }
    },
    [address, onChange]
  );

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

      {/* ZIP first, then City & State — ZIP auto-fills the others */}
      <div className="grid grid-cols-5 gap-3">
        <div className="col-span-2">
          <div className="relative">
            <Input
              label="ZIP"
              value={address.zip}
              onChange={(e) => handleZipChange(e.target.value)}
              error={errors.zip}
              placeholder="02118"
              inputMode="numeric"
              maxLength={5}
            />
            {zipLoading && (
              <div className="absolute right-3 top-[34px]">
                <div className="w-4 h-4 border-2 border-[#0066FF] border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {zipAutoFilled && !zipLoading && (
              <div className="absolute right-3 top-[34px]">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
            )}
          </div>
        </div>
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
          <StateAutocomplete
            value={address.state}
            onChange={(val) => onChange({ ...address, state: val })}
            error={errors.state}
          />
        </div>
      </div>
    </div>
  );
}

function QtyStepper({ qty, onChange, allowZero }: { qty: number; onChange: (n: number) => void; allowZero?: boolean }) {
  const min = allowZero ? 0 : 1;
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-stone-400 uppercase tracking-wide mr-0.5">Qty</span>
      <button
        onClick={() => onChange(Math.max(min, qty - 1))}
        className="w-7 h-7 rounded-full bg-white hover:bg-stone-100 text-stone-600 flex items-center justify-center text-lg font-medium transition-colors border border-stone-200"
      >
        −
      </button>
      <span className="w-6 text-center text-sm font-semibold text-stone-800">{qty}</span>
      <button
        onClick={() => onChange(Math.min(10, qty + 1))}
        className="w-7 h-7 rounded-full bg-white hover:bg-stone-100 text-stone-600 flex items-center justify-center text-lg font-medium transition-colors border border-stone-200"
      >
        +
      </button>
    </div>
  );
}

/* Recipient card — clean soft card style */
function RecipientCard({
  icon,
  iconBg,
  label,
  qty,
  onQtyChange,
  onRemove,
  children,
  defaultOpen,
}: {
  icon: React.ReactNode;
  iconBg: string;
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
    <div className="bg-[#F5F7FF] rounded-2xl transition-all">
      {/* Header row */}
      <div
        className="flex items-center justify-between gap-2 px-4 py-3.5 cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
            {icon}
          </div>
          <p className="font-semibold text-sm text-stone-800">{label}</p>
        </div>
        <div className="flex items-center gap-3">
          <div onClick={(e) => e.stopPropagation()}>
            <QtyStepper qty={qty} onChange={handleQtyChange} allowZero />
          </div>
          <svg className={`w-4 h-4 text-stone-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Expandable content — smooth height animation */}
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-in-out"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4 pt-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/* SVG Icons */
function HomeIcon() {
  return (
    <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  );
}

function GiftIcon() {
  return (
    <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H4.5a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

export default function RecipientsPage() {
  const router = useRouter();
  const { state, dispatch } = useOrder();

  const [includeSelf, setIncludeSelf] = useState(false);
  const [myAddress, setMyAddress] = useState<Address>(state.selfAddress || emptyAddress);
  const [myErrors, setMyErrors] = useState<Partial<Record<keyof Address, string>>>({});
  const [myQty, setMyQty] = useState(1);

  const [friendQtys, setFriendQtys] = useState<Record<string, number>>({});

  const [showFriendForm, setShowFriendForm] = useState(false);
  const [friendFormOpen, setFriendFormOpen] = useState(false);
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
    <div className="min-h-screen bg-white">
      <nav className="flex items-center justify-between px-6 py-4 max-w-3xl mx-auto">
        <button onClick={() => router.push('/customize')} className="text-stone-500 hover:text-stone-700 text-sm font-medium">
          ← Back
        </button>
        <span className="text-2xl font-bold tracking-tight" style={{ color: '#0066FF' }}>
          Memora
        </span>
        <div className="w-12" />
      </nav>

      <StepIndicator currentStep={3} />

      <div className="px-6 pb-12 max-w-xl md:max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 text-center tracking-tight mb-1">
          Where should we send it?
        </h1>
        <p
          className="text-center text-[#0066FF] mb-8"
          style={{ fontFamily: 'var(--font-caveat), cursive', fontSize: '1.1rem' }}
        >
          add addresses and choose quantity
        </p>

        {/* ── RECIPIENT CARDS ── */}
        <div className="space-y-3 mb-4">
          {/* My address — optional */}
          {includeSelf && (
            <RecipientCard
              icon={<HomeIcon />}
              iconBg="bg-[#0066FF]"
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
              icon={<GiftIcon />}
              iconBg="bg-amber-500"
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
        <div className="space-y-3 mb-6">
          {/* "My address" add button */}
          {!includeSelf && (
            <button
              onClick={() => setIncludeSelf(true)}
              className="w-full py-4 rounded-2xl bg-[#F5F7FF] hover:bg-[#EEF1FF] text-stone-600 hover:text-[#0066FF] transition-all text-sm font-medium flex items-center justify-center gap-2.5 group"
            >
              <div className="w-8 h-8 rounded-xl bg-[#0066FF]/10 group-hover:bg-[#0066FF]/20 flex items-center justify-center transition-colors">
                <HomeIcon />
              </div>
              <span>Add my address</span>
              <PlusIcon />
            </button>
          )}

          {/* Friend form — shown when user clicks "Add friend's address" */}
          {showFriendForm ? (
            <div className="bg-[#F5F7FF] rounded-2xl overflow-hidden">
              {/* Collapsible header */}
              <div
                className="flex items-center justify-between gap-2 px-4 py-3.5 cursor-pointer"
                onClick={() => setFriendFormOpen(!friendFormOpen)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center">
                    <GiftIcon />
                  </div>
                  <p className="font-semibold text-sm text-stone-800">Friend&apos;s address</p>
                </div>
                <div className="flex items-center gap-3">
                  <div onClick={(e) => e.stopPropagation()}>
                    <QtyStepper qty={newFriendQty} onChange={(n) => {
                      if (n === 0) {
                        setShowFriendForm(false);
                        setFriendFormOpen(false);
                        setFriendAddress(emptyAddress);
                        setFriendErrors({});
                        setNewFriendQty(1);
                      } else {
                        setNewFriendQty(n);
                      }
                    }} allowZero />
                  </div>
                  <svg className={`w-4 h-4 text-stone-400 transition-transform duration-200 ${friendFormOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {friendFormOpen && (
                <div className="px-4 pb-4 pt-1">
                  <AddressForm address={friendAddress} onChange={setFriendAddress} errors={friendErrors} />
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowFriendForm(false);
                        setFriendFormOpen(false);
                        setFriendAddress(emptyAddress);
                        setFriendErrors({});
                        setNewFriendQty(1);
                      }}
                    >
                      Remove
                    </Button>
                    <Button variant="secondary" size="sm" fullWidth onClick={addFriend}>
                      Save address
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => { setShowFriendForm(true); setFriendFormOpen(true); }}
              className="w-full py-4 rounded-2xl bg-[#F5F7FF] hover:bg-[#EEF1FF] text-stone-600 hover:text-amber-600 transition-all text-sm font-medium flex items-center justify-center gap-2.5 group"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 group-hover:bg-amber-500/20 flex items-center justify-center transition-colors">
                <svg className="w-4.5 h-4.5 text-amber-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H4.5a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
              </div>
              <span>Add friend&apos;s address</span>
              <PlusIcon />
            </button>
          )}
        </div>

        {/* ── PRICING TIERS ── */}
        {totalQty > 0 && (
          <div className="flex items-center justify-center gap-2 mb-3 text-xs">
            <span className={`px-2.5 py-1 rounded-full transition-colors ${totalQty >= 1 && totalQty < 3 ? 'bg-[#0066FF] text-white font-semibold' : 'bg-stone-100 text-stone-400'}`}>
              1+ $4.99/ea
            </span>
            <span className={`px-2.5 py-1 rounded-full transition-colors ${totalQty >= 3 && totalQty < 5 ? 'bg-[#0066FF] text-white font-semibold' : 'bg-stone-100 text-stone-400'}`}>
              3+ $5.99/ea
            </span>
            <span className={`px-2.5 py-1 rounded-full transition-colors ${totalQty >= 5 ? 'bg-[#0066FF] text-white font-semibold' : 'bg-stone-100 text-stone-400'}`}>
              5+ $4.99/ea
            </span>
          </div>
        )}

        {/* ── PRICE SUMMARY ── */}
        {totalQty > 0 && (
          <div className="bg-[#F5F7FF] rounded-2xl p-4 mb-6">
            <div className="flex justify-between text-sm text-stone-600 mb-1">
              <span>{totalQty} magnet{totalQty !== 1 ? 's' : ''} × ${unitPrice.toFixed(2)}</span>
              <span className="font-medium">${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-stone-600">
              <span>Shipping</span>
              <span className="font-medium text-green-600">Free</span>
            </div>
            <div className="border-t border-stone-200/60 mt-2 pt-2 flex justify-between">
              <span className="font-semibold text-stone-800">Total</span>
              <span className="font-semibold text-stone-800">${total.toFixed(2)}</span>
            </div>
            {savings && (
              <p className="text-xs text-[#0066FF] mt-2 font-medium">{savings}</p>
            )}
          </div>
        )}

        {/* Empty state */}
        {!hasAnyAddress && (
          <p className="text-center text-stone-400 text-sm mb-6">Add at least one address to continue</p>
        )}

        <Button
          variant="primary"
          fullWidth
          size="md"
          onClick={handleContinue}
          disabled={totalQty === 0}
        >
          <span className="text-sm">Continue to Checkout</span>
        </Button>
      </div>
    </div>
  );
}
