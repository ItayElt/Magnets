import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Track Your Order',
  description: 'Check the status of your Memora photo magnet order with your order number and email.',
  alternates: { canonical: '/track' },
};

export default function TrackLayout({ children }: { children: React.ReactNode }) {
  return children;
}
