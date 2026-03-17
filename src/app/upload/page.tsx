'use client';

import { useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useOrder } from '@/lib/context/OrderContext';
import StepIndicator from '@/components/ui/StepIndicator';
import Button from '@/components/ui/Button';

export default function UploadPage() {
  const router = useRouter();
  const { dispatch } = useOrder();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  const handleFile = useCallback(
    (file: File) => {
      setError('');
      const validTypes = ['image/jpeg', 'image/png', 'image/heic', 'image/heif'];
      if (!validTypes.includes(file.type) && !file.name.match(/\.(heic|heif)$/i)) {
        setError('Please upload a JPG, PNG, or HEIC image.');
        return;
      }

      if (file.name.match(/\.(heic|heif)$/i)) {
        setError('HEIC files will be converted automatically. For best results in this demo, use JPG or PNG.');
      }

      setFileName(file.name);
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
          setPreview(dataUrl);
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    },
    [dispatch]
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
      <nav className="flex items-center justify-between px-6 py-4 max-w-3xl mx-auto">
        <button onClick={() => router.push('/')} className="text-stone-500 hover:text-stone-700 text-sm font-medium">
          ← Back
        </button>
        <span className="text-2xl font-bold tracking-tight" style={{ color: '#0066FF' }}>
          Memora
        </span>
        <div className="w-12" />
      </nav>

      <StepIndicator currentStep={0} />

      <div className="px-6 pb-12 max-w-xl md:max-w-2xl mx-auto">

        {!preview ? (
          <div className="flex flex-col items-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 text-center tracking-tight mb-2">
              Upload your photo
            </h1>
            <p className="text-stone-400 text-sm text-center mb-8">
              Pick a memory you love
            </p>

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full rounded-3xl p-10 sm:p-14 md:p-20 text-center transition-all duration-300 cursor-pointer ${
                dragActive
                  ? 'bg-blue-50 border-2 border-[#0066FF] shadow-lg'
                  : 'bg-[#F5F7FF] hover:bg-[#EEF1FF] border-2 border-transparent'
              }`}
            >
              {/* Upload icon */}
              <div className="mx-auto mb-5 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center" style={{ background: '#0066FF' }}>
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.338-2.32 3 3 0 013.8 3.8A3.75 3.75 0 0118 19.5H6.75z" />
                </svg>
              </div>

              <p className="text-stone-700 font-semibold text-base sm:text-lg mb-1">
                <span className="md:hidden">Tap to choose a photo</span>
                <span className="hidden md:inline">Click to choose a photo</span>
              </p>
              <p className="text-stone-400 text-sm">
                or drag and drop here
              </p>
            </div>

            {/* Camera option — subtle pill */}
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="mt-5 flex items-center gap-2.5 px-6 py-3 rounded-full text-sm font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 hover:text-stone-800 transition-all cursor-pointer"
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
        ) : (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-stone-900 text-center tracking-tight mb-2">
              Looking good!
            </h1>

            <div className="bg-[#F5F7FF] rounded-3xl p-4 sm:p-5">
              <img
                src={preview}
                alt="Preview"
                className="w-full rounded-2xl object-contain max-h-80"
              />
              <p className="mt-3 text-xs text-stone-400 text-center truncate">
                {fileName}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                fullWidth
                size="md"
                onClick={() => {
                  setPreview(null);
                  setFileName('');
                }}
              >
                <span className="text-sm">Change</span>
              </Button>
              <Button
                variant="primary"
                fullWidth
                size="md"
                onClick={() => router.push('/crop')}
              >
                <span className="text-sm">Continue</span>
              </Button>
            </div>
          </div>
        )}

        {error && (
          <p className="mt-4 text-sm text-amber-600 text-center">{error}</p>
        )}
      </div>
    </div>
  );
}
