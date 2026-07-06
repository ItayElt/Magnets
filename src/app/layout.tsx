import type { Metadata, Viewport } from 'next';
import { Playfair_Display, EB_Garamond, Caveat, Poppins } from 'next/font/google';
import { OrderProvider } from '@/lib/context/OrderContext';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
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

export const viewport: Viewport = {
  themeColor: '#0066FF',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://memoramagnet.shop'),
  title: {
    default: 'Memora – Custom Photo Magnets, Made in the USA',
    template: '%s | Memora',
  },
  description:
    'Turn your favorite photos into premium fridge magnets in under a minute. Classic, vintage, or black & white styles. Free US shipping, delivered in 3–7 days, from $4.99.',
  keywords: [
    'photo magnets',
    'custom magnets',
    'fridge magnets',
    'personalized photo gifts',
    'photo magnet printing',
    'custom fridge magnets',
    'photo gifts USA',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: 'https://memoramagnet.shop',
    siteName: 'Memora',
    title: 'Memora – Custom Photo Magnets, Made in the USA',
    description:
      'Turn your favorite photos into premium fridge magnets in under a minute. Free US shipping, from $4.99.',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Memora – Custom Photo Magnets',
    description:
      'Turn your favorite photos into premium fridge magnets in under a minute. Free US shipping, from $4.99.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${playfair.variable} ${poppins.variable} ${ebGaramond.variable} ${caveat.variable}`}>
      <body className="font-[family-name:var(--font-poppins)] min-h-screen">
        <OrderProvider>{children}</OrderProvider>
      </body>
    </html>
  );
}
