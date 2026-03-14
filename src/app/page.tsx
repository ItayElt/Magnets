import Link from 'next/link';

/* ─── Polaroid Magnet Component ─────────────────────────────── */
function Polaroid({
  caption,
  from,
  via,
  to,
  size = 'md',
}: {
  caption: string;
  from: string;
  via: string;
  to: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const dims = {
    sm: { img: 'w-36', pad: 'p-[6px] pb-[36px]', text: 'text-[11px]', bottom: 'bottom-2.5' },
    md: { img: 'w-48', pad: 'p-[8px] pb-[48px]', text: 'text-[14px]', bottom: 'bottom-3.5' },
    lg: { img: 'w-64', pad: 'p-[10px] pb-[56px]', text: 'text-[16px]', bottom: 'bottom-4' },
  }[size];

  return (
    <div className={`${dims.pad} bg-white polaroid-shadow relative`} style={{ borderRadius: '3px' }}>
      {/* Photo area */}
      <div className={`${dims.img} aspect-[4/3] rounded-[1px] overflow-hidden relative bg-gradient-to-br ${from} ${via} ${to}`}>
        {/* Vintage photo overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/8 via-transparent to-amber-50/15 mix-blend-multiply" />
        <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-amber-100 to-transparent mix-blend-soft-light" />
      </div>
      {/* Handwritten caption in EB Garamond */}
      <p
        className={`absolute ${dims.bottom} left-0 right-0 text-center ${dims.text} text-stone-500 italic`}
        style={{ fontFamily: 'var(--font-garamond), Georgia, serif' }}
      >
        {caption}
      </p>
    </div>
  );
}

/* ─── Feature Card ──────────────────────────────────────────── */
function FeatureCard({
  icon,
  title,
  desc,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-stone-100 hover:border-stone-200 hover:shadow-lg transition-all duration-300 group">
      <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-lg font-bold text-stone-900">{title}</h3>
      <p className="mt-2 text-stone-500 leading-relaxed text-sm">{desc}</p>
    </div>
  );
}

/* ─── Landing Page ──────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white overflow-hidden">

      {/* ════════════ NAVBAR ════════════ */}
      <nav className="flex items-center justify-between px-6 md:px-10 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-8">
          <span className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-stone-900 tracking-tight">
            Memora
          </span>
          <div className="hidden sm:flex items-center gap-6 text-sm text-stone-500">
            <a href="#styles" className="hover:text-stone-900 transition-colors">Styles</a>
            <a href="#how-it-works" className="hover:text-stone-900 transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-stone-900 transition-colors">Pricing</a>
          </div>
        </div>
        <Link
          href="/upload"
          className="px-6 py-2.5 text-sm font-semibold bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] text-white rounded-full transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-purple-200"
        >
          Create a Magnet
        </Link>
      </nav>

      {/* ════════════ HERO ════════════ */}
      <section className="relative px-6 md:px-10 pt-16 sm:pt-24 pb-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-10 items-center">

          {/* Left — Copy */}
          <div className="max-w-xl animate-fade-up">
            <h1 className="font-[family-name:var(--font-playfair)] text-5xl sm:text-6xl lg:text-[4.25rem] font-bold text-stone-900 leading-[1.08] tracking-tight">
              Turn your photos into real magnets
            </h1>

            <p
              className="mt-5 text-xl sm:text-2xl text-[var(--color-brand)] leading-relaxed"
              style={{ fontFamily: 'var(--font-caveat), cursive' }}
            >
              ...and send them to the people you love
            </p>

            <p className="mt-5 text-base sm:text-lg text-stone-500 leading-relaxed max-w-md">
              Upload a photo, pick a vintage frame, and we&apos;ll print &amp; ship beautiful custom magnets. Takes under 2 minutes.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link
                href="/upload"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] text-white rounded-full shadow-lg shadow-purple-200/50 hover:shadow-xl hover:shadow-purple-300/50 transition-all duration-200 group"
              >
                Start creating
                <svg className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <span className="text-sm text-stone-400">Free shipping &middot; No account needed</span>
            </div>

            {/* Trust badges */}
            <div className="mt-10 flex items-center gap-5 text-sm text-stone-400">
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                Ships in 3–7 days
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                From $4.49/ea
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                USA made
              </div>
            </div>
          </div>

          {/* Right — Floating polaroids */}
          <div className="relative h-[400px] sm:h-[460px] lg:h-[500px] animate-fade-up-delay-1">
            {/* Decorative blobs */}
            <div className="absolute top-10 right-10 w-72 h-72 bg-purple-100/30 rounded-full blur-3xl" />
            <div className="absolute bottom-10 left-0 w-56 h-56 bg-amber-100/30 rounded-full blur-3xl" />

            {/* Polaroid 1 — top-left, large */}
            <div className="absolute top-0 left-2 sm:left-6 animate-float-1 z-20">
              <Polaroid
                caption="Snow Hike, Dec '25"
                from="from-slate-300"
                via="via-blue-200"
                to="to-sky-300"
                size="lg"
              />
            </div>

            {/* Polaroid 2 — right, medium */}
            <div className="absolute top-24 right-0 sm:right-4 animate-float-2 z-10">
              <Polaroid
                caption="Mom &amp; Dad"
                from="from-sky-200"
                via="via-teal-200"
                to="to-emerald-300"
                size="md"
              />
            </div>

            {/* Polaroid 3 — bottom-left, medium */}
            <div className="absolute bottom-0 left-14 sm:left-20 animate-float-3 z-30">
              <Polaroid
                caption="Moab 2025"
                from="from-orange-200"
                via="via-amber-200"
                to="to-rose-300"
                size="md"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ════════════ COLORFUL GRADIENT DIVIDER (Canva vibe) ════════════ */}
      <div className="h-1.5 bg-gradient-to-r from-purple-500 via-pink-400 via-50% to-amber-400" />

      {/* ════════════ FRAME STYLES ════════════ */}
      <section id="styles" className="px-6 md:px-10 py-24 bg-[#faf9f7] relative grain-overlay">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <p
              className="text-lg text-[var(--color-brand)] mb-2"
              style={{ fontFamily: 'var(--font-caveat), cursive' }}
            >
              pick your favorite
            </p>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
              Three timeless frame styles
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-8 max-w-4xl mx-auto">
            {/* Style 1 — Vintage Polaroid */}
            <div className="flex flex-col items-center group cursor-pointer">
              <div className="transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-2">
                <Polaroid
                  caption="Summer 2025"
                  from="from-amber-300"
                  via="via-orange-200"
                  to="to-rose-300"
                  size="md"
                />
              </div>
              <h3 className="mt-6 text-lg font-bold text-stone-800">Vintage Polaroid</h3>
              <p className="mt-1 text-sm text-stone-500 text-center">Classic instant film — thick bottom lip, aged feel</p>
              <span
                className="mt-2 text-[var(--color-brand)] text-sm"
                style={{ fontFamily: 'var(--font-caveat), cursive' }}
              >
                most popular!
              </span>
            </div>

            {/* Style 2 — Minimal Clean */}
            <div className="flex flex-col items-center group cursor-pointer">
              <div className="transition-transform duration-300 group-hover:scale-105 group-hover:rotate-1">
                <div className="w-48 bg-white p-[5px] polaroid-shadow rounded-sm">
                  <div className="aspect-[4/3] rounded-[1px] bg-gradient-to-br from-violet-300 via-purple-200 to-pink-300 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-white/10" />
                  </div>
                </div>
              </div>
              <h3 className="mt-6 text-lg font-bold text-stone-800">Minimal Clean</h3>
              <p className="mt-1 text-sm text-stone-500 text-center">Sleek thin border — all about your photo</p>
            </div>

            {/* Style 3 — Caption Frame */}
            <div className="flex flex-col items-center group cursor-pointer">
              <div className="transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-1">
                <div className="w-48 bg-[#faf6ef] p-[7px] pb-[44px] polaroid-shadow relative" style={{ borderRadius: '3px', boxShadow: 'inset 0 0 0 1px rgba(180,160,130,0.15), 0 1px 3px rgba(0,0,0,0.08), 0 6px 24px rgba(0,0,0,0.10)' }}>
                  <div className="aspect-[4/3] rounded-[1px] bg-gradient-to-br from-emerald-300 via-teal-200 to-cyan-300 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-100/20 via-transparent to-orange-50/10" />
                  </div>
                  <p
                    className="absolute bottom-3 left-0 right-0 text-center text-[13px] text-warm-600 italic"
                    style={{ fontFamily: 'var(--font-garamond), Georgia, serif' }}
                  >
                    Family Reunion
                  </p>
                </div>
              </div>
              <h3 className="mt-6 text-lg font-bold text-stone-800">Caption Frame</h3>
              <p className="mt-1 text-sm text-stone-500 text-center">Warm vintage border with your own text</p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════ HOW IT WORKS ════════════ */}
      <section id="how-it-works" className="px-6 md:px-10 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p
              className="text-lg text-[var(--color-brand)] mb-2"
              style={{ fontFamily: 'var(--font-caveat), cursive' }}
            >
              so easy it&apos;s ridiculous
            </p>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
              From photo to doorstep
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <FeatureCard
              color="bg-purple-100 text-purple-600"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                </svg>
              }
              title="Upload a photo"
              desc="Snap a new photo or choose one from your library. We accept JPG, PNG, and HEIC."
            />
            <FeatureCard
              color="bg-pink-100 text-pink-600"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
                </svg>
              }
              title="Pick a style"
              desc="Crop your photo, choose one of three vintage-inspired frames, and add a caption."
            />
            <FeatureCard
              color="bg-amber-100 text-amber-600"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              }
              title="Ship it"
              desc="Send magnets to yourself or up to 10 friends. We print and deliver in 3–7 days."
            />
          </div>
        </div>
      </section>

      {/* ════════════ PRICING ════════════ */}
      <section id="pricing" className="px-6 md:px-10 py-24 bg-gradient-to-br from-[var(--color-brand)] via-purple-600 to-purple-800 text-white relative overflow-hidden">
        {/* Background decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-14">
            <p
              className="text-lg text-purple-200 mb-2"
              style={{ fontFamily: 'var(--font-caveat), cursive' }}
            >
              fair and simple
            </p>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-bold tracking-tight">
              Send more, save more
            </h2>
            <p className="mt-3 text-purple-200 text-base">Free shipping on every order.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { qty: '1', label: 'magnet', price: '5.99', tagline: 'Just for you' },
              { qty: '3', label: 'magnets', price: '4.99', tagline: 'Most popular', best: true },
              { qty: '5+', label: 'magnets', price: '4.49', tagline: 'Best value' },
            ].map((tier) => (
              <div
                key={tier.qty}
                className={`relative rounded-2xl p-7 text-center transition-all duration-300 hover:scale-105 ${
                  tier.best
                    ? 'bg-white text-stone-900 shadow-2xl shadow-black/20 ring-2 ring-white/50'
                    : 'bg-white/10 backdrop-blur-sm hover:bg-white/15 ring-1 ring-white/10'
                }`}
              >
                {tier.best && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[var(--color-brand)] text-white text-xs font-bold rounded-full shadow-lg">
                    POPULAR
                  </div>
                )}
                <p className={`text-4xl font-bold mt-1 ${tier.best ? 'text-stone-900' : ''}`}>{tier.qty}</p>
                <p className={`text-sm ${tier.best ? 'text-stone-500' : 'text-white/60'}`}>{tier.label}</p>
                <div className={`my-4 border-t ${tier.best ? 'border-stone-200' : 'border-white/10'}`} />
                <p className="text-3xl font-bold">
                  ${tier.price}
                  <span className={`text-sm font-normal ml-1 ${tier.best ? 'text-stone-400' : 'text-white/50'}`}>each</span>
                </p>
                <p className={`text-sm mt-2 ${tier.best ? 'text-stone-500' : 'text-white/50'}`}>{tier.tagline}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ FINAL CTA ════════════ */}
      <section className="px-6 md:px-10 py-28 text-center">
        <div className="max-w-2xl mx-auto">
          <p
            className="text-xl text-[var(--color-brand)] mb-3"
            style={{ fontFamily: 'var(--font-caveat), cursive' }}
          >
            what are you waiting for?
          </p>
          <h2 className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl font-bold text-stone-900 leading-tight tracking-tight">
            Make a memory you can hold
          </h2>
          <p className="mt-4 text-lg text-stone-500">
            No account needed. Takes less than 2 minutes.
          </p>
          <div className="mt-8">
            <Link
              href="/upload"
              className="inline-flex items-center justify-center px-10 py-4 text-lg font-semibold bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] text-white rounded-full shadow-xl shadow-purple-200/40 hover:shadow-2xl hover:shadow-purple-300/40 transition-all duration-200"
            >
              Create Your Magnet
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════ FOOTER ════════════ */}
      <footer className="px-6 py-8 border-t border-stone-100">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-[family-name:var(--font-playfair)] text-lg font-bold text-stone-800">
            Memora
          </span>
          <p className="text-sm text-stone-400">
            &copy; {new Date().getFullYear()} Memora &middot; USA shipping only
          </p>
          <Link href="/admin" className="text-sm text-stone-400 hover:text-stone-600 transition-colors">
            Admin
          </Link>
        </div>
      </footer>
    </div>
  );
}
