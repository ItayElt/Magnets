'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

/* ─── Smart Sticky Header ──────────────────────────────────── */
function useSmartHeader() {
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function onScroll() {
      const currentY = window.scrollY;
      if (currentY < 80) {
        setVisible(true);
      } else if (currentY > lastScrollY.current + 5) {
        setVisible(false);
      } else if (currentY < lastScrollY.current - 5) {
        setVisible(true);
      }
      lastScrollY.current = currentY;

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setVisible(true), 300);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return visible;
}

/* ─── Trust Icon SVGs ──────────────────────────────────────── */
function LockIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0066FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0066FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

function TrackIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0066FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function VisaIcon() {
  return (
    <svg width="48" height="32" viewBox="0 0 48 32" fill="none">
      <rect width="48" height="32" rx="4" fill="#1A1F71" />
      <path d="M19.5 21h-3l1.9-11.5h3L19.5 21zm-5.3-11.5l-2.8 7.9-.3-1.6-1-5.1s-.1-1.2-1.4-1.2H5.1l-.1.3s1.5.3 3.2 1.3l2.7 10.4h3.1l4.7-12h-3.1l-1.4-.1zm24.2 11.5h2.7l-2.4-11.5h-2.4c-1.1 0-1.4.8-1.4.8l-4.4 10.7h3.1l.6-1.7h3.8l.4 1.7zm-3.3-4l1.6-4.3.9 4.3h-2.5zm-5.3-5.2l.4-2.5s-1.3-.5-2.7-.5c-1.5 0-5 .7-5 3.5 0 2.6 3.6 2.7 3.6 4 0 1.4-3.2 1.1-4.3.3l-.4 2.6s1.4.6 3.4.6c2.1 0 5.2-1.1 5.2-3.7 0-2.6-3.7-2.9-3.7-4 0-1.1 2.5-1 3.5-.3z" fill="white" />
    </svg>
  );
}

function MastercardIcon() {
  return (
    <svg width="48" height="32" viewBox="0 0 48 32" fill="none">
      <rect width="48" height="32" rx="4" fill="#252525" />
      <circle cx="19" cy="16" r="8" fill="#EB001B" />
      <circle cx="29" cy="16" r="8" fill="#F79E1B" />
      <path d="M24 10.3a8 8 0 010 11.4 8 8 0 000-11.4z" fill="#FF5F00" />
    </svg>
  );
}

function PaypalIcon() {
  return (
    <svg width="48" height="32" viewBox="0 0 48 32" fill="none">
      <rect width="48" height="32" rx="4" fill="#F5F7FA" />
      <path d="M18.5 25.5h-3l.2-1.2 2-12.3h4.3c2.8 0 4 1.5 3.7 3.7-.4 3-2.8 4.5-5.5 4.5h-2l-.7 5.3zm2.8-7.5h1.5c1.3 0 2.3-.7 2.5-2.1.1-1-.5-1.5-1.7-1.5h-1.5l-.8 3.6z" fill="#003087" />
      <path d="M30.5 14c-.1.6-.3 1.2-.5 1.7-1.1 2.5-3.3 3.5-5.8 3.5h-.5l-.8 5h-2.5l.1-.5 1.2-7.2h2.5c3.5 0 6-1.5 6.3-4.5v2z" fill="#0070E0" />
    </svg>
  );
}

/* ─── Landing Page ──────────────────────────────────────────── */
export default function LandingPage() {
  const headerVisible = useSmartHeader();
  const heroRef = useRef<HTMLDivElement>(null);

  // Scroll-driven blob expansion — starts expanding immediately on scroll
  const { scrollY } = useScroll();
  const blobScale = useTransform(scrollY, [0, 800], [0.6, 14], { clamp: true });
  const blobOpacity = useTransform(scrollY, [600, 800], [1, 0], { clamp: true });
  // Fade hero content out as blob expands
  const heroContentOpacity = useTransform(scrollY, [0, 400], [1, 0], { clamp: true });
  const heroContentY = useTransform(scrollY, [0, 400], [0, -60], { clamp: true });

  return (
    <div className="min-h-screen bg-white overflow-x-hidden" style={{ color: '#262836' }}>

      {/* ════════════ SMART STICKY HEADER ════════════ */}
      <nav
        className={`fixed top-0 left-0 right-0 z-[60] bg-white/95 backdrop-blur-md border-b border-stone-100 transition-transform duration-300 ${
          headerVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 md:px-10 py-3 max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-bold tracking-tight" style={{ color: '#0066FF' }}>
              Memora
            </Link>
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600">
              <a href="#magnets" className="hover:text-[#0066FF] transition-colors">Our Magnets</a>
              <a href="#how-it-works" className="hover:text-[#0066FF] transition-colors">How It Works</a>
              <a href="#pricing" className="hover:text-[#0066FF] transition-colors">Pricing</a>
              <Link href="/contact" className="hover:text-[#0066FF] transition-colors">Support</Link>
            </div>
          </div>
          <Link
            href="/upload"
            className="px-5 py-2.5 text-sm font-semibold text-white rounded-full transition-all duration-200 shadow-sm hover:shadow-lg hover:brightness-110"
            style={{ background: '#0066FF' }}
          >
            Create a Magnet
          </Link>
        </div>
      </nav>

      {/* Spacer for fixed header */}
      <div className="h-[56px]" />

      {/* ════════════ HERO — Blue blob + expanding pink transition ════════════ */}
      <section ref={heroRef} className="relative pb-8 md:min-h-[85vh] bg-white overflow-visible">

        {/* Static blue blob in the hero — the main background shape */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <svg
            className="absolute w-[130%] sm:w-[110%] lg:w-[75%] h-auto"
            style={{ top: '-10%', left: '-15%' }}
            viewBox="0 0 800 700"
            fill="none"
            preserveAspectRatio="xMidYMid slice"
          >
            <path
              d="M120 0 Q650 0 720 80 Q800 170 750 340 Q700 510 760 620 Q780 680 680 700 L0 700 L0 0 Z"
              fill="#0066FF"
            />
          </svg>
        </div>

        {/* Animated expanding blob (pink — transitions into next section) */}
        <motion.div
          className="fixed pointer-events-none z-[1]"
          style={{
            top: '65%',
            left: '60%',
            x: '-50%',
            y: '-50%',
            scale: blobScale,
            opacity: blobOpacity,
            willChange: 'transform',
          }}
        >
          <svg height="220" width="260" viewBox="0 0 410 340">
            <path
              d="M74.9914 313.754C90.6733 323.471 115.211 332.732 129.518 335.58C143.826 338.285 158.438 339.088 183.229 333.723C254.888 318.216 330.23 248.762 373.147 191.349C409.027 143.349 418.015 106.354 403.664 63.0821C394.135 34.3265 366.695 14.0256 337.746 5.84298C308.825 -2.33007 278.374 -0.238835 248.878 3.23897C203.545 8.57847 156.545 10.8865 112.855 24.1062C-22.921 65.4353 -35.7829 245.178 74.9914 313.754Z"
              fill="rgba(255, 240, 247, 1)"
            />
          </svg>
        </motion.div>

        {/* Hero content */}
        <motion.div
          className="relative z-10 px-6 md:px-10 pt-12 sm:pt-20 pb-16 max-w-7xl mx-auto"
          style={{ opacity: heroContentOpacity, y: heroContentY }}
        >
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 lg:gap-6 items-center">

            {/* Left — Copy */}
            <div className="max-w-lg animate-fade-up order-1">
              <h1 className="text-3xl sm:text-5xl lg:text-[3.75rem] font-extrabold text-white leading-[1.1] tracking-tight">
                Turn your memories into unique prints 📸
              </h1>
              <p className="mt-4 text-base sm:text-lg text-blue-100 leading-relaxed">
                Matte, glossy, retro… choose your style!
              </p>
              <div className="mt-6 sm:mt-8">
                <Link
                  href="/upload"
                  className="inline-flex items-center justify-center px-7 py-3.5 sm:px-8 sm:py-4 text-sm sm:text-base font-semibold bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 group"
                  style={{ color: '#0066FF' }}
                >
                  Get started
                  <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Right — Magnets fanned out like polaroids */}
            {/* Mobile/tablet: flexbox row. Desktop: absolute positioned scatter */}
            <div className="animate-fade-up-delay-1 order-2 flex justify-center items-end gap-3 sm:gap-4 -mx-4 sm:mx-0 lg:relative lg:mx-auto lg:w-[480px] lg:h-[380px] lg:block">

              {/* Magnet 1 — Left, tilted */}
              <div
                className="animate-float-1 transition-transform duration-500 hover:!-translate-y-2 hover:z-40 shrink-0 lg:!absolute lg:!left-0 lg:!top-[40px]"
                style={{
                  transform: 'rotate(-8deg) translateY(8px)',
                  zIndex: 10,
                }}
              >
                <div className="bg-white p-1.5 pb-4 sm:p-2 sm:pb-5 rounded-lg magnet-shadow w-[105px] sm:w-[135px] lg:w-[190px]">
                  <div className="rounded-md overflow-hidden aspect-[4/3] relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/examples/taj-mahal.jpg" alt="India" className="w-full h-full object-cover" style={{ filter: 'saturate(0.55) contrast(0.85) brightness(1.08) sepia(0.35)' }} />
                    <div className="absolute inset-0 bg-amber-900/[0.14] mix-blend-multiply" />
                  </div>
                  <p className="text-center text-[9px] sm:text-xs text-stone-400 italic mt-1" style={{ fontFamily: 'var(--font-garamond), serif' }}>India &apos;26</p>
                </div>
              </div>

              {/* Magnet 2 — Center front, the hero card */}
              <div
                className="animate-float-3 transition-transform duration-500 hover:!-translate-y-2 shrink-0 lg:!absolute lg:!left-1/2 lg:!top-0 lg:!-translate-x-1/2"
                style={{
                  transform: 'rotate(2deg) translateY(-4px)',
                  zIndex: 20,
                }}
              >
                <div className="bg-white p-1.5 pb-4 sm:p-2 sm:pb-5 rounded-lg magnet-shadow w-[115px] sm:w-[150px] lg:w-[200px]">
                  <div className="rounded-md overflow-hidden aspect-[4/3] relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/examples/group-party.jpg" alt="Halloween" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/8 via-transparent to-amber-50/15 mix-blend-multiply" />
                  </div>
                  <p className="text-center text-[9px] sm:text-xs text-stone-400 italic mt-1" style={{ fontFamily: 'var(--font-garamond), serif' }}>Halloween &apos;25</p>
                </div>
              </div>

              {/* Magnet 3 — Right, tilted the other way */}
              <div
                className="animate-float-2 transition-transform duration-500 hover:!-translate-y-2 hover:z-40 shrink-0 lg:!absolute lg:!ml-0 lg:!right-0 lg:!top-[30px]"
                style={{
                  transform: 'rotate(6deg) translateY(12px)',
                  zIndex: 15,
                }}
              >
                <div className="bg-white p-1.5 pb-4 sm:p-2 sm:pb-5 rounded-lg magnet-shadow w-[105px] sm:w-[135px] lg:w-[190px]">
                  <div className="rounded-md overflow-hidden aspect-[4/3] relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/examples/formal-night.jpg" alt="Gala" className="w-full h-full object-cover" style={{ filter: 'grayscale(1) contrast(1.1) brightness(1.02)' }} />
                    <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 30px rgba(0,0,0,0.08)' }} />
                  </div>
                  <p className="text-center text-[9px] sm:text-xs text-stone-400 italic mt-1" style={{ fontFamily: 'var(--font-garamond), serif' }}>HBS Gala &apos;25</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ════════════ PRODUCT SCROLL — "Find the magnet that…" ════════════ */}
      <section id="magnets" className="relative z-[2] py-16 md:py-24" style={{ background: 'rgba(255, 240, 247, 1)' }}>
        <div className="max-w-7xl mx-auto px-5 md:px-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center tracking-tight mb-3">
            Find the magnet that…
          </h2>
          <p className="text-center text-stone-500 mb-10 md:mb-14 text-base md:text-lg">
            Three styles. One photo. Infinite memories.
          </p>

          {/* Horizontal scroll on mobile, grid on desktop */}
          <div className="flex md:grid md:grid-cols-3 gap-5 md:gap-8 overflow-x-auto no-scrollbar pb-4 snap-x snap-mandatory -mx-5 px-5 md:mx-0 md:px-0">
            {[
              { img: '/examples/group-party.jpg', filter: 'none', caption: "Halloween '25", bg: '#FFE4E1', title: 'Classic Magnets', desc: 'Your photos, bright and bold — printed on premium glossy stock with vivid color.' },
              { img: '/examples/taj-mahal.jpg', filter: 'saturate(0.55) contrast(0.85) brightness(1.08) sepia(0.35)', caption: "India '26", bg: '#FFF3CD', title: 'Vintage Magnets', desc: 'Warm, sun-kissed tones for a treasured memory feel.' },
              { img: '/examples/formal-night.jpg', filter: 'grayscale(1) contrast(1.1) brightness(1.02)', caption: "HBS Gala '25", bg: '#E8E0F0', title: 'B&W Magnets', desc: 'Timeless black & white — elegant and perfect for special moments.' },
            ].map((card) => (
              <div key={card.title} className="snap-center flex-shrink-0 w-[260px] sm:w-[280px] md:w-auto bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group">
                <div className="relative overflow-hidden" style={{ background: card.bg }}>
                  <div className="aspect-[4/3] flex items-center justify-center p-6 md:p-8">
                    <div className="bg-white p-1.5 pb-5 sm:p-2 sm:pb-6 rounded-lg magnet-shadow transform -rotate-2 group-hover:rotate-0 transition-transform duration-500">
                      <div className="w-36 sm:w-44 md:w-48 aspect-[4/3] rounded-md overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={card.img} alt={card.title} className="w-full h-full object-cover" style={{ filter: card.filter }} />
                      </div>
                      <p className="text-center text-[10px] sm:text-xs text-stone-400 italic mt-1" style={{ fontFamily: 'var(--font-garamond), serif' }}>{card.caption}</p>
                    </div>
                  </div>
                </div>
                <div className="p-5 md:p-6">
                  <h3 className="text-base md:text-lg font-bold mb-1">{card.title}</h3>
                  <p className="text-sm text-stone-500 leading-relaxed mb-3">{card.desc}</p>
                  <Link href="/upload" className="inline-flex items-center text-sm font-semibold gap-1 transition-colors" style={{ color: '#0066FF' }}>
                    Create now
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ FRIDGE SHOWCASE ════════════ */}
      <section className="relative z-[2] py-16 md:py-24 bg-white overflow-hidden">
        <div className="max-w-5xl mx-auto px-5 md:px-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center tracking-tight mb-3">
            Your fridge, but <span style={{ color: '#0066FF' }}>cooler</span> ❄️
          </h2>
          <p className="text-center text-stone-500 mb-10 md:mb-14 text-base md:text-lg max-w-lg mx-auto">
            Every photo tells a story. Imagine yours right here — front and center, every single day.
          </p>

          {/* Fridge image with subtle shadow & rounded corners */}
          <div className="relative mx-auto max-w-2xl">
            <div className="rounded-3xl overflow-hidden shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/examples/fridge-magnets.png"
                alt="Photo magnets displayed on a retro fridge"
                className="w-full h-auto"
              />
            </div>

            {/* Floating CTA badge */}
            <div className="mt-8 text-center">
              <Link
                href="/upload"
                className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.03]"
                style={{ background: '#0066FF' }}
              >
                Make your fridge jealous
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════ HOW IT WORKS ════════════ */}
      <section id="how-it-works" className="relative z-[2] py-16 md:py-24" style={{ background: '#faf8f6' }}>
        <div className="max-w-5xl mx-auto px-5 md:px-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center tracking-tight mb-3">
            How it works
          </h2>
          <p className="text-center text-stone-500 mb-10 md:mb-14 text-base md:text-lg">
            From photo to doorstep in under 2 minutes
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-8">
            {[
              { step: '01', title: 'Upload a photo', desc: 'Snap a new photo or pick one from your library. JPG, PNG, or HEIC.', color: '#0066FF', icon: <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" /></svg> },
              { step: '02', title: 'Pick your style', desc: 'Choose Classic, Vintage, or B&W. Crop, add a caption, and preview.', color: '#FF6B6B', icon: <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" /></svg> },
              { step: '03', title: 'Ship it', desc: 'Send to yourself or up to 10 friends. We print and deliver in 3–7 days.', color: '#FFB347', icon: <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg> },
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-3xl p-6 md:p-8 border border-stone-100 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mb-4 md:mb-5" style={{ background: `${item.color}15`, color: item.color }}>{item.icon}</div>
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: item.color }}>Step {item.step}</p>
                <h3 className="text-lg md:text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-stone-500 leading-relaxed text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ PRICING ════════════ */}
      <section id="pricing" className="relative z-[2] py-16 md:py-24 px-5 md:px-10 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center tracking-tight mb-3">
            Send more, save more
          </h2>
          <p className="text-center text-stone-500 mb-10 md:mb-14 text-base md:text-lg">
            Free shipping on every order. Fair and simple pricing.
          </p>

          <div className="grid grid-cols-3 gap-3 sm:gap-6 max-w-3xl mx-auto">
            {[
              { qty: '1', label: 'magnet', price: '5.99', tagline: 'Just for you', best: false },
              { qty: '3', label: 'magnets', price: '4.99', tagline: 'Most popular', best: true },
              { qty: '5+', label: 'magnets', price: '4.49', tagline: 'Best value', best: false },
            ].map((tier) => (
              <div key={tier.qty} className={`relative rounded-2xl sm:rounded-3xl p-4 sm:p-7 text-center transition-all duration-300 hover:scale-105 ${tier.best ? 'text-white shadow-2xl' : 'bg-white border border-stone-200 hover:shadow-lg'}`} style={tier.best ? { background: '#0066FF' } : {}}>
                {tier.best && <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 sm:px-4 sm:py-1 bg-white text-[10px] sm:text-xs font-bold rounded-full shadow-lg" style={{ color: '#0066FF' }}>POPULAR</div>}
                <p className="text-2xl sm:text-4xl font-extrabold mt-1">{tier.qty}</p>
                <p className={`text-xs sm:text-sm ${tier.best ? 'text-blue-200' : 'text-stone-400'}`}>{tier.label}</p>
                <div className={`my-3 sm:my-4 border-t ${tier.best ? 'border-white/20' : 'border-stone-100'}`} />
                <p className="text-xl sm:text-3xl font-bold">${tier.price}<span className={`text-[10px] sm:text-sm font-normal ml-0.5 sm:ml-1 ${tier.best ? 'text-blue-200' : 'text-stone-400'}`}>each</span></p>
                <p className={`text-[10px] sm:text-sm mt-1 sm:mt-2 ${tier.best ? 'text-blue-200' : 'text-stone-400'}`}>{tier.tagline}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8 md:mt-10">
            <Link href="/upload" className="inline-flex items-center justify-center px-8 py-3.5 sm:px-10 sm:py-4 text-sm sm:text-base font-semibold text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200" style={{ background: '#0066FF' }}>
              Start Creating
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════ TRUST BAR ════════════ */}
      <section className="relative z-[2] border-y border-stone-100 py-10 md:py-12 px-5 md:px-10 bg-white">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10 text-center">
          <div className="flex flex-col items-center">
            <LockIcon />
            <h3 className="text-sm sm:text-base font-bold mt-3 mb-2">Secure payment</h3>
            <div className="flex items-center gap-2"><VisaIcon /><MastercardIcon /><PaypalIcon /></div>
          </div>
          <div className="flex flex-col items-center">
            <TruckIcon />
            <h3 className="text-sm sm:text-base font-bold mt-3 mb-1">Free delivery</h3>
            <p className="text-sm text-stone-500">Free shipping on all orders, always.</p>
          </div>
          <div className="flex flex-col items-center">
            <TrackIcon />
            <h3 className="text-sm sm:text-base font-bold mt-3 mb-1">Track your delivery</h3>
            <p className="text-sm text-stone-500">Real-time tracking on every order.</p>
          </div>
        </div>
      </section>

      {/* ════════════ NEWSLETTER / STAY TUNED ════════════ */}
      <section className="relative z-[2] py-12 md:py-16 px-5 md:px-10" style={{ background: '#002B71' }}>
        <div className="max-w-5xl mx-auto rounded-3xl p-6 md:p-12 flex flex-col md:flex-row items-center gap-6 md:gap-8" style={{ background: '#001A4A' }}>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl md:text-3xl font-bold text-white mb-2">Stay tuned!</h3>
            <p className="text-blue-200 text-sm leading-relaxed">Get exclusive offers and discover new styles before everyone else!</p>
          </div>
          <div className="flex-1 w-full">
            <div className="flex gap-2 sm:gap-3">
              <input type="email" placeholder="Your email" className="flex-1 px-4 sm:px-5 py-3 sm:py-3.5 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-blue-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              <button className="px-5 sm:px-6 py-3 sm:py-3.5 bg-white rounded-full text-sm font-semibold transition-all hover:shadow-lg cursor-pointer whitespace-nowrap" style={{ color: '#002B71' }}>Subscribe</button>
            </div>
            <p className="text-xs text-blue-300 mt-3">View our <Link href="/privacy" className="underline hover:text-white transition-colors">privacy policy</Link></p>
          </div>
        </div>
      </section>

      {/* ════════════ FOOTER ════════════ */}
      <footer className="relative z-[2] py-10 md:py-14 px-5 md:px-10 text-white" style={{ background: '#0066FF' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 mb-10 md:mb-12">
            <div>
              <h4 className="font-bold text-sm mb-3 md:mb-4">Our magnets</h4>
              <ul className="space-y-2 text-sm text-blue-100">
                <li><Link href="/upload" className="hover:text-white transition-colors">Classic Magnets</Link></li>
                <li><Link href="/upload" className="hover:text-white transition-colors">Vintage Magnets</Link></li>
                <li><Link href="/upload" className="hover:text-white transition-colors">B&W Magnets</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-3 md:mb-4">About us</h4>
              <ul className="space-y-2 text-sm text-blue-100">
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms &amp; conditions</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy policy</Link></li>
                <li><Link href="/refund-policy" className="hover:text-white transition-colors">Refund policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-3 md:mb-4">Help</h4>
              <ul className="space-y-2 text-sm text-blue-100">
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact us</Link></li>
                <li><Link href="/shipping" className="hover:text-white transition-colors">Shipping info</Link></li>
                <li><Link href="/track" className="hover:text-white transition-colors">Track order</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-xl md:text-2xl mb-2">Memora</h4>
              <p className="text-sm text-blue-100 leading-relaxed">Turn your photos into real magnets. Made with love in the USA.</p>
            </div>
          </div>
          <div className="border-t border-white/20 pt-5 md:pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-blue-100">&copy; {new Date().getFullYear()} Memora &middot; USA shipping only</p>
            <a href="mailto:support@memoramagnet.shop" className="text-xs sm:text-sm text-blue-100 hover:text-white transition-colors">support@memoramagnet.shop</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
