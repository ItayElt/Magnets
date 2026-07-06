import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Your Photo Magnet',
  description:
    'Upload a photo and turn it into a custom fridge magnet in under a minute. Classic, vintage, or black & white styles. Free US shipping from $4.99.',
  alternates: { canonical: '/upload' },
};

export default function UploadLayout({ children }: { children: React.ReactNode }) {
  return children;
}
