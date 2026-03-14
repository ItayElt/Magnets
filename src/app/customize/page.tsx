'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOrder } from '@/lib/context/OrderContext';
import { FRAMES, MAX_CAPTION_LENGTH } from '@/lib/constants';
import { FrameStyle } from '@/lib/types';
import StepIndicator from '@/components/ui/StepIndicator';
import Button from '@/components/ui/Button';

/**
 * FramePreview renders the user's photo inside the selected frame style.
 *
 * "minimal-polaroid" (Vintage Polaroid) applies a vintage FILM look to the
 * actual photo — sepia tint, faded blacks, warm color shift, grain. The photo
 * itself looks like it came out of an old instant camera.
 */
function FramePreview({
  image,
  frame,
  caption,
  size = 'large',
}: {
  image: string;
  frame: FrameStyle;
  caption: string;
  size?: 'large' | 'small';
}) {
  const isLarge = size === 'large';

  const frameOuter: Record<FrameStyle, string> = {
    'minimal-polaroid': `bg-[#f5f1ea] ${isLarge ? 'p-[8px] pb-[48px]' : 'p-[4px] pb-[22px]'} polaroid-shadow`,
    'vintage-border': `bg-white ${isLarge ? 'p-[5px]' : 'p-[3px]'} polaroid-shadow`,
    'caption-frame': `bg-white ${isLarge ? 'p-[7px] pb-[44px]' : 'p-[4px] pb-[22px]'} polaroid-shadow`,
  };

  return (
    <div className={`${frameOuter[frame]} rounded-[2px] inline-block relative`}>
      <div className="relative overflow-hidden rounded-[1px]">
        <img
          src={image}
          alt="Your magnet"
          className={`block ${isLarge ? 'max-h-64 sm:max-h-80' : 'h-20'} w-auto rounded-[1px]`}
          style={{
            aspectRatio: '4/3',
            objectFit: 'cover',
            filter: frame === 'minimal-polaroid'
              ? 'saturate(0.7) contrast(0.9) brightness(1.06) sepia(0.18)'
              : 'none',
          }}
        />
        {/* Vintage Polaroid: film overlays */}
        {frame === 'minimal-polaroid' && (
          <>
            <div className="absolute inset-0 bg-amber-800/[0.1] mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-br from-amber-100/20 via-transparent to-orange-100/15 mix-blend-screen" />
            <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-transparent to-orange-200/25 mix-blend-screen" />
            <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 40px rgba(0,0,0,0.12)' }} />
            <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}
            />
          </>
        )}
      </div>

      {/* Polaroid caption in EB Garamond italic */}
      {frame === 'minimal-polaroid' && (
        <p
          className={`absolute ${isLarge ? 'bottom-3' : 'bottom-1.5'} left-0 right-0 text-center ${
            isLarge ? 'text-[14px]' : 'text-[8px]'
          } text-stone-500 italic`}
          style={{ fontFamily: 'var(--font-garamond), Georgia, serif' }}
        >
          {caption || ''}
        </p>
      )}
      {frame === 'caption-frame' && caption && (
        <p
          className={`absolute ${isLarge ? 'bottom-3 text-sm' : 'bottom-1.5 text-[8px]'} left-0 right-0 text-center text-stone-600 font-medium truncate px-2`}
        >
          {caption}
        </p>
      )}
    </div>
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
    <div className="min-h-screen">
      <nav className="flex items-center justify-between px-6 py-4 max-w-2xl mx-auto">
        <button onClick={() => router.back()} className="text-stone-500 hover:text-stone-700 text-sm font-medium">
          ← Back
        </button>
        <span className="font-[family-name:var(--font-playfair)] text-xl font-bold text-stone-800">
          Memora
        </span>
        <div className="w-12" />
      </nav>

      <StepIndicator currentStep={2} />

      <div className="px-6 pb-12 max-w-lg mx-auto">
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-stone-900 text-center mb-1">
          Choose your style
        </h1>
        <p
          className="text-center text-[var(--color-brand)] mb-8"
          style={{ fontFamily: 'var(--font-caveat), cursive', fontSize: '1.1rem' }}
        >
          each one makes your photo look different
        </p>

        {/* Live preview */}
        <div className="flex justify-center mb-8">
          <div className="transform -rotate-2 hover:rotate-0 transition-transform duration-300">
            <FramePreview
              image={state.croppedImage!}
              frame={state.selectedFrame}
              caption={state.caption}
              size="large"
            />
          </div>
        </div>

        {/* Frame selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-stone-700 mb-3">Frame style</label>
          <div className="grid grid-cols-3 gap-3">
            {FRAMES.map((frame) => (
              <button
                key={frame.id}
                onClick={() => dispatch({ type: 'SET_FRAME', payload: frame.id })}
                className={`p-3 rounded-xl border-2 transition-all text-center ${
                  state.selectedFrame === frame.id
                    ? 'border-[var(--color-brand)] bg-purple-50'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <div className="flex justify-center mb-2">
                  <FramePreview
                    image={state.croppedImage!}
                    frame={frame.id}
                    caption={frame.id === 'caption-frame' ? state.caption || 'Caption' : ''}
                    size="small"
                  />
                </div>
                <p className="text-xs font-medium text-stone-700">{frame.name}</p>
                <p className="text-[10px] text-stone-400">{frame.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Caption input */}
        {state.selectedFrame === 'caption-frame' && (
          <div className="mb-8">
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Caption <span className="text-stone-400 font-normal">(optional)</span>
            </label>
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
                className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                maxLength={MAX_CAPTION_LENGTH}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">
                {state.caption.length}/{MAX_CAPTION_LENGTH}
              </span>
            </div>
          </div>
        )}

        <Button
          variant="primary"
          fullWidth
          size="lg"
          onClick={() => router.push('/recipients')}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
