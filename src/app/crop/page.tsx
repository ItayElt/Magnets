'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { useOrder } from '@/lib/context/OrderContext';
import { cropImage, checkResolution } from '@/lib/utils/image';
import StepIndicator from '@/components/ui/StepIndicator';
import Button from '@/components/ui/Button';

export default function CropPage() {
  const router = useRouter();
  const { state, dispatch } = useOrder();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!state.originalImage) {
      router.replace('/upload');
    }
  }, [state.originalImage, router]);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleContinue = async () => {
    if (!state.originalImage || !croppedAreaPixels) return;
    setProcessing(true);
    try {
      const croppedDataUrl = await cropImage(state.originalImage, croppedAreaPixels);
      const lowRes = !checkResolution(croppedAreaPixels.width, croppedAreaPixels.height);
      dispatch({
        type: 'SET_CROPPED_IMAGE',
        payload: {
          image: croppedDataUrl,
          cropArea: croppedAreaPixels,
          lowResolution: lowRes,
        },
      });
      router.push('/customize');
    } catch {
      setProcessing(false);
    }
  };

  if (!state.originalImage) return null;

  const showResWarning = croppedAreaPixels && !checkResolution(croppedAreaPixels.width, croppedAreaPixels.height);

  return (
    <div className="min-h-screen">
      <nav className="flex items-center justify-between px-6 py-4 max-w-3xl mx-auto">
        <button onClick={() => router.push('/upload')} className="text-stone-500 hover:text-stone-700">
          ← Back
        </button>
        <span className="text-2xl font-bold tracking-tight" style={{ color: '#0066FF' }}>
          Memora
        </span>
        <div className="w-12" />
      </nav>

      <StepIndicator currentStep={1} />

      <div className="px-6 pb-12 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold text-stone-900 text-center tracking-tight mb-2">
          Crop your photo
        </h1>
        <p className="text-center text-stone-500 mb-6">Adjust to fit your 4&quot; × 3&quot; magnet</p>

        <div className="crop-container mb-4">
          <Cropper
            image={state.originalImage}
            crop={crop}
            zoom={zoom}
            aspect={4 / 3}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        {/* Zoom slider */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-sm text-stone-500">Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-[#0066FF]"
          />
        </div>

        {showResWarning && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-sm text-amber-700">
            Your photo may print at lower quality. For best results, use an image at least 1000px wide.
          </div>
        )}

        <Button
          variant="primary"
          fullWidth
          size="md"
          onClick={handleContinue}
          disabled={processing}
        >
          <span className="text-sm">{processing ? 'Processing...' : 'Continue'}</span>
        </Button>
      </div>
    </div>
  );
}
