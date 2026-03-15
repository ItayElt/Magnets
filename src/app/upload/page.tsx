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
    <div className="min-h-screen">
      <nav className="flex items-center justify-between px-6 py-4 max-w-3xl mx-auto">
        <button onClick={() => router.push('/')} className="text-stone-500 hover:text-stone-700 text-sm font-medium">
          ← Back
        </button>
        <span className="font-[family-name:var(--font-playfair)] text-xl font-bold text-stone-800">
          Memora
        </span>
        <div className="w-12" />
      </nav>

      <StepIndicator currentStep={0} />

      <div className="px-6 pb-12 max-w-xl mx-auto">
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-stone-900 text-center mb-2">
          Upload your photo
        </h1>
        <p className="text-center text-stone-500 mb-8">JPG, PNG, or HEIC</p>

        {!preview ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors cursor-pointer ${
              dragActive
                ? 'border-purple-400 bg-purple-50'
                : 'border-stone-300 hover:border-purple-300 bg-white'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="text-5xl mb-4">📷</div>
            <p className="text-stone-700 font-medium mb-1">
              Drop your photo here
            </p>
            <p className="text-sm text-stone-400 mb-6">or click to browse</p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="primary"
                size="md"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                Choose Photo
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={(e) => {
                  e.stopPropagation();
                  cameraInputRef.current?.click();
                }}
              >
                Take Photo
              </Button>
            </div>

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
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <img
                src={preview}
                alt="Preview"
                className="w-full rounded-lg object-contain max-h-80"
              />
              <p className="mt-3 text-sm text-stone-500 text-center truncate">
                {fileName}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => {
                  setPreview(null);
                  setFileName('');
                }}
              >
                Choose Different
              </Button>
              <Button
                variant="primary"
                fullWidth
                onClick={() => router.push('/crop')}
              >
                Continue
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
