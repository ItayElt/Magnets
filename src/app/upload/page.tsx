'use client';

import { useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useOrder } from '@/lib/context/OrderContext';
import StepIndicator from '@/components/ui/StepIndicator';

export default function UploadPage() {
  const router = useRouter();
  const { dispatch } = useOrder();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [reading, setReading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = useCallback(
    (file: File) => {
      setError('');
      const validTypes = ['image/jpeg', 'image/png', 'image/heic', 'image/heif'];
      if (!validTypes.includes(file.type) && !file.name.match(/\.(heic|heif)$/i)) {
        setError('Please upload a JPG, PNG, or HEIC image.');
        return;
      }

      setReading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          dispatch({
            type: 'SET_ORIGINAL_IMAGE',
            payload: {
              image: dataUrl,
              dimensions: { w: img.naturalWidth, h: img.naturalHeight },
            },
          });
          router.push('/crop');
        };
        img.onerror = () => {
          setReading(false);
          setError("We couldn't read that photo. Try a JPG or PNG instead.");
        };
        img.src = dataUrl;
      };
      reader.onerror = () => {
        setReading(false);
        setError("We couldn't read that file. Please try another photo.");
      };
      reader.readAsDataURL(file);
    },
    [dispatch, router]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="min-h-screen bg-white">
      <nav className="flex items-center justify-between px-6 py-4 max-w-3xl md:max-w-6xl mx-auto">
        <button onClick={() => router.push('/')} className="text-stone-500 hover:text-stone-700 text-sm font-medium">
          ← Back
        </button>
        <span className="text-2xl font-bold tracking-tight" style={{ color: '#0066FF' }}>
          Memora
        </span>
        <div className="w-12" />
      </nav>

      <StepIndicator currentStep={0} />

      <div className="px-6 pb-12 max-w-xl md:max-w-3xl mx-auto">
        <div className="flex flex-col items-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-stone-900 text-center tracking-tight mb-2 md:mb-3">
            Upload your photo
          </h1>
          <p className="text-stone-400 text-sm md:text-base text-center mb-8 md:mb-10">
            Pick a memory you love — you&apos;ll crop it next
          </p>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => !reading && fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !reading) { e.preventDefault(); fileInputRef.current?.click(); } }}
            aria-label="Choose a photo to upload"
            className={`w-full rounded-3xl p-10 sm:p-14 md:p-20 text-center transition-all duration-300 cursor-pointer ${
              dragActive
                ? 'bg-blue-50 border-2 border-[#0066FF] shadow-lg'
                : 'bg-[#F5F7FF] hover:bg-[#EEF1FF] border-2 border-transparent'
            } ${reading ? 'pointer-events-none opacity-80' : ''}`}
          >
            {/* Upload icon / spinner */}
            <div className="mx-auto mb-5 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center" style={{ background: '#0066FF' }}>
              {reading ? (
                <svg className="animate-spin w-8 h-8 sm:w-10 sm:h-10 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.338-2.32 3 3 0 013.8 3.8A3.75 3.75 0 0118 19.5H6.75z" />
                </svg>
              )}
            </div>

            <p className="text-stone-700 font-semibold text-base sm:text-lg md:text-xl mb-1">
              {reading ? (
                'Getting your photo ready…'
              ) : (
                <>
                  <span className="md:hidden">Tap to choose a photo</span>
                  <span className="hidden md:inline">Click to choose a photo</span>
                </>
              )}
            </p>
            {!reading && (
              <p className="text-stone-400 text-sm md:text-base">
                or drag and drop here
              </p>
            )}
          </div>

          {/* Camera option — subtle pill */}
          <button
            onClick={() => cameraInputRef.current?.click()}
            disabled={reading}
            className="mt-5 md:mt-7 flex items-center gap-2.5 px-6 py-3 md:py-3.5 rounded-full text-sm md:text-base font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 hover:text-stone-800 transition-all cursor-pointer disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
            </svg>
            Take a photo instead
          </button>

          {/* Hidden file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/heic,image/heif"
            onChange={handleInputChange}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleInputChange}
            className="hidden"
          />
        </div>

        {error && (
          <p className="mt-4 text-sm text-amber-600 text-center" role="alert">{error}</p>
        )}
      </div>
    </div>
  );
}
