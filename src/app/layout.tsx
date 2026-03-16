import type { Metadata } from 'next';
import { Playfair_Display, Inter, EB_Garamond, Caveat, Poppins } from 'next/font/google';
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

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins',
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
    <html lang="en" data-scroll-behavior="smooth" className={`${playfair.variable} ${inter.variable} ${poppins.variable} ${ebGaramond.variable} ${caveat.variable}`}>
      <body className="font-[family-name:var(--font-poppins)] min-h-screen">
        <OrderProvider>{children}</OrderProvider>
      </body>
    </html>
  );
}
