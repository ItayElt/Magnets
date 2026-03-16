'use client';

import { useEffect } from 'react';
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
}: {
  image: string;
  style: PhotoStyle;
  caption: string;
  size?: 'large' | 'small';
}) {
  const isLarge = size === 'large';

  return (
    <div
      className={`bg-white ${isLarge ? 'p-[8px] pb-[48px]' : 'p-[4px] pb-[22px]'} polaroid-shadow rounded-[2px] inline-block relative`}
    >
      <div className="relative overflow-hidden rounded-[1px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt="Your magnet"
          className={`block ${isLarge ? 'max-h-64 sm:max-h-80' : 'h-20'} w-auto rounded-[1px]`}
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

  useEffect(() => {
    if (!state.croppedImage) {
      router.replace('/upload');
    }
  }, [state.croppedImage, router]);

  if (!state.croppedImage) return null;

  return (
    <div className="min-h-screen bg-white">
      <nav className="flex items-center justify-between px-6 py-4 max-w-3xl mx-auto">
        <button onClick={() => router.push('/crop')} className="text-stone-500 hover:text-stone-700 text-sm font-medium">
          ← Back
        </button>
        <span className="text-2xl font-bold tracking-tight" style={{ color: '#0066FF' }}>
          Memora
        </span>
        <div className="w-12" />
      </nav>

      <StepIndicator currentStep={2} />

      <div className="px-6 pb-12 max-w-xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 text-center tracking-tight mb-1">
          Customize your magnet
        </h1>
        <p
          className="text-center text-[#0066FF] mb-6"
          style={{ fontFamily: 'var(--font-caveat), cursive', fontSize: '1.1rem' }}
        >
          pick a style and add a caption
        </p>

        {/* Live preview in soft card */}
        <div className="bg-[#F5F7FF] rounded-3xl p-5 sm:p-6 mb-6">
          <div className="flex justify-center">
            <div className="transform -rotate-2 hover:rotate-0 transition-transform duration-300">
              <MagnetPreview
                image={state.croppedImage!}
                style={state.selectedFrame}
                caption={state.caption}
                size="large"
              />
            </div>
          </div>
        </div>

        {/* Photo style selector */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-[#0066FF]/10 flex items-center justify-center">
              <PaintbrushIcon />
            </div>
            <label className="text-sm font-semibold text-stone-800">Photo style</label>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {PHOTO_STYLES.map((ps) => {
              const isSelected = state.selectedFrame === ps.id;
              return (
                <button
                  key={ps.id}
                  onClick={() => dispatch({ type: 'SET_FRAME', payload: ps.id })}
                  className={`p-2.5 rounded-2xl transition-all text-center ${
                    isSelected
                      ? 'bg-[#F5F7FF] ring-2 ring-[#0066FF] shadow-sm'
                      : 'bg-[#F5F7FF] hover:bg-[#EEF1FF] ring-1 ring-transparent'
                  }`}
                >
                  <div className="flex justify-center mb-2">
                    <MagnetPreview
                      image={state.croppedImage!}
                      style={ps.id}
                      caption={state.caption || 'Caption'}
                      size="small"
                    />
                  </div>
                  <p className={`text-xs font-semibold ${isSelected ? 'text-[#0066FF]' : 'text-stone-700'}`}>{ps.name}</p>
                  <p className="text-[10px] text-stone-400 leading-tight mt-0.5">{ps.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Caption input */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-[#0066FF]/10 flex items-center justify-center">
              <PenIcon />
            </div>
            <label className="text-sm font-semibold text-stone-800">
              Caption <span className="text-stone-400 font-normal">(optional)</span>
            </label>
          </div>
          <div className="relative">
            <input
              type="text"
              value={state.caption}
              onChange={(e) => {
                if (e.target.value.length <= MAX_CAPTION_LENGTH) {
                  dispatch({ type: 'SET_CAPTION', payload: e.target.value });
                }
              }}
              placeholder="e.g. Summer 2025"
              className="w-full px-4 py-3.5 rounded-2xl bg-[#F5F7FF] text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0066FF] border-none"
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
          <span className="text-sm">Continue</span>
        </Button>
      </div>
    </div>
  );
}
