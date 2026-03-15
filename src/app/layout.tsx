import type { Metadata } from 'next';
import { Playfair_Display, Inter, EB_Garamond, Caveat } from 'next/font/google';
import { OrderProvider } from '@/lib/context/OrderContext';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  variable: '--font-garamond',
  display: 'swap',
});

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-caveat',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Memora – Bring Your Memories to Life',
  description: 'Turn your favorite photo into a magnet and send it to friends in seconds.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} ${ebGaramond.variable} ${caveat.variable}`}>
      <body className="font-[family-name:var(--font-inter)] min-h-screen">
        <OrderProvider>{children}</OrderProvider>
      </body>
    </html>
  );
}
