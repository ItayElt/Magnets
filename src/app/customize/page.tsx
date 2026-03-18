'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrder } from '@/lib/context/OrderContext';
import { PHOTO_STYLES, MAX_CAPTION_LENGTH } from '@/lib/constants';
import { PhotoStyle } from '@/lib/types';
import StepIndicator from '@/components/ui/StepIndicator';
import Button from '@/components/ui/Button';

/**
 * Returns CSS filter string for each photo style.
 */
function getPhotoFilter(style: PhotoStyle): string {
  switch (style) {
    case 'vintage':
      return 'saturate(0.55) contrast(0.85) brightness(1.08) sepia(0.35)';
    case 'bw-vintage':
      return 'grayscale(1) contrast(1.1) brightness(1.02)';
    default:
      return 'none';
  }
}

/**
 * MagnetPreview renders the user's photo inside a consistent polaroid frame
 * with the selected photo style (filter) applied.
 */
function MagnetPreview({
  image,
  style,
  caption,
  size = 'large',
  onTapCaption,
}: {
  image: string;
  style: PhotoStyle;
  caption: string;
  size?: 'large' | 'small';
  onTapCaption?: () => void;
}) {
  const isLarge = size === 'large';
  const [showHint, setShowHint] = useState(isLarge && !!onTapCaption);

  useEffect(() => {
    if (showHint) {
      const t = setTimeout(() => setShowHint(false), 2500);
      return () => clearTimeout(t);
    }
  }, [showHint]);

  return (
    <div
      className={`bg-white ${isLarge ? 'p-[6px] pb-[38px] sm:p-[8px] sm:pb-[48px]' : 'p-[4px] pb-[22px]'} polaroid-shadow rounded-[2px] inline-block relative ${isLarge && onTapCaption ? 'cursor-pointer' : ''}`}
      onClick={isLarge && onTapCaption ? onTapCaption : undefined}
    >
      <div className="relative overflow-hidden rounded-[1px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt="Your magnet"
          className={`block ${isLarge ? 'max-h-32 sm:max-h-44 md:max-h-80' : 'h-20'} w-auto rounded-[1px]`}
          style={{
            aspectRatio: '4/3',
            objectFit: 'cover',
            filter: getPhotoFilter(style),
          }}
        />

        {/* Vintage style overlays — warm, faded, nostalgic film look */}
        {style === 'vintage' && (
          <>
            <div className="absolute inset-0 bg-amber-900/[0.14] mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-br from-amber-200/30 via-transparent to-orange-200/20 mix-blend-screen" />
            <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-transparent to-orange-300/30 mix-blend-screen" />
            <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 50px rgba(0,0,0,0.15)' }} />
            <div
              className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              }}
            />
          </>
        )}

        {/* B&W vintage subtle overlay */}
        {style === 'bw-vintage' && (
          <>
            <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 30px rgba(0,0,0,0.08)' }} />
            <div
              className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              }}
            />
          </>
        )}
      </div>

      {/* Caption — always visible */}
      <p
        className={`absolute ${isLarge ? 'bottom-3' : 'bottom-1.5'} left-0 right-0 text-center ${
          isLarge ? 'text-[14px]' : 'text-[8px]'
        } text-stone-500 italic truncate px-2`}
        style={{ fontFamily: 'var(--font-garamond), Georgia, serif' }}
      >
        {caption || (isLarge ? '' : 'Caption')}
      </p>

      {/* Tap-to-edit hint — fades after 2.5s */}
      {isLarge && onTapCaption && (
        <div
          className={`absolute bottom-1 right-1 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 shadow-sm transition-opacity duration-700 ${
            showHint ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <svg className="w-3 h-3 text-[#0066FF]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
          </svg>
          <span className="text-[10px] text-[#0066FF] font-medium">Tap to edit</span>
        </div>
      )}
    </div>
  );
}

/* Style icon SVGs */
function PaintbrushIcon() {
  return (
    <svg className="w-4 h-4 text-[#0066FF]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
    </svg>
  );
}

function PenIcon() {
  return (
    <svg className="w-4 h-4 text-[#0066FF]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
    </svg>
  );
}

export default function CustomizePage() {
  const router = useRouter();
  const { state, dispatch } = useOrder();
  const captionInputRef = useRef<HTMLInputElement>(null);

  const handleTapCaption = () => {
    captionInputRef.current?.focus({ preventScroll: true });
  };

  useEffect(() => {
    if (!state.croppedImage) {
      router.replace('/upload');
    }
  }, [state.croppedImage, router]);

  if (!state.croppedImage) return null;

  return (
    <div className="h-screen flex flex-col overflow-hidden md:min-h-screen md:h-auto md:block md:overflow-visible bg-white">
      <nav className="flex items-center justify-between px-6 py-4 max-w-3xl md:max-w-4xl mx-auto">
        <button onClick={() => router.push('/crop')} className="text-stone-500 hover:text-stone-700 text-sm font-medium">
          ← Back
        </button>
        <span className="text-2xl font-bold tracking-tight" style={{ color: '#0066FF' }}>
          Memora
        </span>
        <div className="w-12" />
      </nav>

      <StepIndicator currentStep={2} />

      <div className="px-6 pb-4 md:pb-10 max-w-xl md:max-w-4xl mx-auto flex-1 flex flex-col min-h-0 md:block">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-stone-900 text-center tracking-tight mb-0.5">
          Customize your magnet
        </h1>
        <p
          className="text-center text-[#0066FF] mb-2 md:mb-8"
          style={{ fontFamily: 'var(--font-caveat), cursive', fontSize: '1.1rem' }}
        >
          pick a style and add a caption
        </p>

        {/* Desktop: side-by-side, Mobile: stacked */}
        <div className="md:flex md:gap-10 md:items-start">
          {/* Live preview */}
          <div className="bg-[#F5F7FF] rounded-3xl p-3 sm:p-4 md:p-8 mb-3 md:mb-0 md:flex-1 md:sticky md:top-24">
            <div className="flex justify-center">
              <div className="transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                <MagnetPreview
                  image={state.croppedImage!}
                  style={state.selectedFrame}
                  caption={state.caption}
                  size="large"
                  onTapCaption={handleTapCaption}
                />
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="md:flex-1 md:max-w-sm">
            {/* Photo style — pick one */}
            <div className="mb-3 md:mb-5">
              <label className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-2 block">Choose a style</label>
              <div className="flex gap-2">
                {PHOTO_STYLES.map((ps) => {
                  const isSelected = state.selectedFrame === ps.id;
                  return (
                    <button
                      key={ps.id}
                      onClick={() => dispatch({ type: 'SET_FRAME', payload: ps.id })}
                      className={`flex-1 py-2.5 px-2 rounded-xl transition-all text-center border-2 ${
                        isSelected
                          ? 'border-[#0066FF] bg-[#F0F4FF] shadow-sm'
                          : 'border-transparent bg-[#F5F7FF] hover:bg-[#EEF1FF]'
                      }`}
                    >
                      <p className={`text-sm font-semibold ${isSelected ? 'text-[#0066FF]' : 'text-stone-600'}`}>{ps.name}</p>
                      <p className={`text-xs leading-tight mt-0.5 ${isSelected ? 'text-[#0066FF]/60' : 'text-stone-400'}`}>{ps.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Caption input */}
            <div className="mb-4 md:mb-6">
              <label className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-1.5 block">
                Caption <span className="normal-case font-normal">(optional)</span>
              </label>
              <div className="relative">
                <input
                  ref={captionInputRef}
                  type="text"
                  value={state.caption}
                  onChange={(e) => {
                    if (e.target.value.length <= MAX_CAPTION_LENGTH) {
                      dispatch({ type: 'SET_CAPTION', payload: e.target.value });
                    }
                  }}
                  placeholder="e.g. Summer 2025"
                  className="w-full px-4 py-3 rounded-xl bg-[#F5F7FF] text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0066FF] border-none text-base"
                  style={{ fontFamily: 'var(--font-garamond), Georgia, serif', fontStyle: 'italic' }}
                  maxLength={MAX_CAPTION_LENGTH}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">
                  {state.caption.length}/{MAX_CAPTION_LENGTH}
                </span>
              </div>
            </div>

            <Button
              variant="primary"
              fullWidth
              size="md"
              onClick={() => router.push('/recipients')}
            >
              <span className="text-base">Continue</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
