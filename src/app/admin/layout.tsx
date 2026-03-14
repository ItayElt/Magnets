'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const links = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/orders', label: 'Orders' },
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      <nav className="bg-stone-900 text-white px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-[family-name:var(--font-playfair)] text-lg font-bold">
              Memora Admin
            </span>
            <div className="flex gap-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? 'bg-white/10 text-white'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <Link href="/" className="text-sm text-stone-400 hover:text-white transition-colors">
            ← Back to site
          </Link>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
