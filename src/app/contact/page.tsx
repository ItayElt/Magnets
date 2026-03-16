'use client';

import { useState } from 'react';
import Link from 'next/link';

const FAQ = [
  {
    q: 'How long does shipping take?',
    a: "All orders ship within 3\u20137 business days via USPS or UPS. You'll receive a tracking number by email once your order ships.",
  },
  {
    q: 'Can I cancel my order?',
    a: "You can cancel within 24 hours for a full refund. After that, production may have started and cancellation isn't guaranteed. Contact us as soon as possible.",
  },
  {
    q: 'What size are the magnets?',
    a: 'Our magnets are 4\u2033 \u00d7 3\u2033 premium photo magnets with a high-quality matte finish. Strong enough to hold papers on any fridge or magnetic surface.',
  },
  {
    q: 'What if my magnet arrives damaged?',
    a: "We stand behind our products. If your magnet arrives damaged or defective, contact us within 14 days and we'll send a free replacement.",
  },
  {
    q: 'Do you ship internationally?',
    a: "We currently ship within the United States only. We're working on expanding to more countries in the future.",
  },
  {
    q: 'How do I track my order?',
    a: "Once your order ships, you'll receive a tracking number via email. You can use it to track your package on the carrier's website.",
  },
];

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong');
      } else {
        setSubmitted(true);
      }
    } catch {
      setError('Unable to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-10 py-4 max-w-7xl mx-auto">
        <Link
          href="/"
          className="font-[family-name:var(--font-playfair)] text-2xl font-bold tracking-tight"
          style={{ color: '#0066FF' }}
        >
          Memora
        </Link>
        <Link
          href="/"
          className="text-sm text-stone-500 hover:text-stone-900 transition-colors"
        >
          &larr; Back to home
        </Link>
      </nav>

      {/* Hero */}
      <div className="bg-gradient-to-b from-stone-50 to-white border-b border-stone-100">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20 text-center">
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold text-stone-900 mb-4">
            How can we help?
          </h1>
          <p className="text-lg text-stone-500 max-w-xl mx-auto">
            Find answers to common questions or get in touch with our team.
          </p>
        </div>
      </div>

      {/* Support Options Cards */}
      <div className="max-w-5xl mx-auto px-6 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Email Card */}
          <a
            href="mailto:support@memoramagnet.shop"
            className="group bg-white rounded-2xl border border-stone-200 p-6 hover:border-blue-300 hover:shadow-lg transition-all"
          >
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
              <svg className="w-6 h-6 text-[#0066FF]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <h3 className="font-semibold text-stone-900 mb-1">Email Us</h3>
            <p className="text-sm text-stone-500 mb-3">We typically respond within 24 hours.</p>
            <span className="text-sm font-medium text-[#0066FF]">
              support@memoramagnet.shop &rarr;
            </span>
          </a>

          {/* Shipping Card */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <div className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-stone-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
              </svg>
            </div>
            <h3 className="font-semibold text-stone-900 mb-1">Shipping</h3>
            <p className="text-sm text-stone-500 mb-3">Orders ship in 3–7 business days within the USA.</p>
            <span className="text-sm text-stone-400">USPS &amp; UPS</span>
          </div>

          {/* Returns Card */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <div className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-stone-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <h3 className="font-semibold text-stone-900 mb-1">Quality Guarantee</h3>
            <p className="text-sm text-stone-500 mb-3">Damaged or defective? Free replacement within 14 days.</p>
            <span className="text-sm text-stone-400">No questions asked</span>
          </div>
        </div>
      </div>

      {/* Main Content: Contact Form + FAQ side by side */}
      <main className="max-w-5xl mx-auto px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left — Contact Form */}
          <div>
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-stone-900 mb-2">
              Send us a message
            </h2>
            <p className="text-stone-500 text-sm mb-6">
              Fill out the form below and we&apos;ll get back to you as soon as possible.
            </p>

            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-green-800 mb-1">Message Sent!</h3>
                <p className="text-green-600 text-sm">
                  Thank you for reaching out. We&apos;ll get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 placeholder:text-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent focus:bg-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 placeholder:text-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">
                    Subject <span className="text-stone-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="What is this about?"
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 placeholder:text-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Message</label>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us how we can help..."
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 placeholder:text-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent focus:bg-white resize-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-[#0066FF] hover:bg-[#0052CC] text-white font-semibold rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>

          {/* Right — FAQ Accordion */}
          <div>
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-stone-900 mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-stone-500 text-sm mb-6">
              Quick answers to the most common questions.
            </p>

            <div className="space-y-3">
              {FAQ.map((item, i) => (
                <div
                  key={i}
                  className="border border-stone-200 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-stone-50 transition-colors cursor-pointer"
                  >
                    <span className="font-medium text-stone-800 text-sm pr-4">{item.q}</span>
                    <svg
                      className={`w-5 h-5 text-stone-400 shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-200 ${
                      openFaq === i ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <p className="px-5 pb-4 text-sm text-stone-500 leading-relaxed">
                      {item.a}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-10 border-t border-stone-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center gap-4">
            <span className="font-[family-name:var(--font-playfair)] text-lg font-bold" style={{ color: '#0066FF' }}>
              Memora
            </span>
            <div className="flex items-center gap-6 text-sm text-stone-400">
              <Link href="/contact" className="hover:text-stone-600 transition-colors">Support</Link>
              <a href="mailto:support@memoramagnet.shop" className="hover:text-stone-600 transition-colors">Contact</a>
            </div>
            <p className="text-xs text-stone-400">
              &copy; {new Date().getFullYear()} Memora &middot; USA shipping only
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
