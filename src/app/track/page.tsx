'use client';

import { useState } from 'react';
import Link from 'next/link';
import { OrderStatus } from '@/lib/types';

// ---------------------------------------------------------------------------
// Status pipeline for the stepper
// ---------------------------------------------------------------------------

const STAGES: { key: OrderStatus; label: string }[] = [
  { key: 'paid', label: 'Order Placed' },
  { key: 'processing', label: 'Processing' },
  { key: 'sent_to_print', label: 'Sent to Print' },
  { key: 'printed', label: 'Printed' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
];

function getStageIndex(status: string): number {
  const idx = STAGES.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : -1;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TrackResult {
  order_id: string;
  status: string;
  created_at: string;
  quantity: number;
  tracking_number: string | null;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function TrackPage() {
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = orderId.trim().toUpperCase();
    if (!trimmed) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch(
        `/api/orders/track?orderId=${encodeURIComponent(trimmed)}`
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Order not found');
      } else {
        setResult(data);
      }
    } catch {
      setError('Unable to track order. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const currentStageIdx = result ? getStageIndex(result.status) : -1;

  return (
    <div className="min-h-screen bg-[var(--color-warm-50,#faf9f7)]">
      {/* Nav */}
      <nav className="bg-white border-b border-stone-200 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="font-[family-name:var(--font-playfair)] text-xl font-bold"
            style={{ color: '#0066FF' }}
          >
            Memora
          </Link>
          <Link
            href="/"
            className="text-sm text-stone-500 hover:text-stone-700 transition-colors"
          >
            &larr; Back to home
          </Link>
        </div>
      </nav>

      <main className="max-w-xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-stone-900 font-[family-name:var(--font-playfair)] mb-2">
            Track Your Order
          </h1>
          <p className="text-stone-500">
            Enter your order ID to see the current status.
          </p>
        </div>

        {/* Search form */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-8">
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="MEM-12345"
            className="flex-1 px-4 py-3 rounded-xl border border-stone-300 bg-white text-stone-900 placeholder:text-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent font-mono"
          />
          <button
            type="submit"
            disabled={loading || !orderId.trim()}
            className="px-6 py-3 bg-[#0066FF] hover:bg-[#0052CC] text-white font-medium rounded-xl transition-colors disabled:opacity-50 cursor-pointer text-sm"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <p className="text-red-700 font-medium mb-1">Order Not Found</p>
            <p className="text-red-500 text-sm">
              {error}. Please check your order ID and try again.
            </p>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            {/* Order summary */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-stone-900 font-mono">
                  {result.order_id}
                </h2>
                <span className="text-sm text-stone-500">
                  {new Date(result.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex gap-6 text-sm text-stone-600">
                <span>
                  Quantity: <strong className="text-stone-800">{result.quantity}</strong>
                </span>
                {result.tracking_number && (
                  <span>
                    Tracking:{' '}
                    <strong className="text-stone-800 font-mono">
                      {result.tracking_number}
                    </strong>
                  </span>
                )}
              </div>
            </div>

            {/* Status stepper */}
            <div className="space-y-0">
              {STAGES.map((stage, i) => {
                const isCompleted = i <= currentStageIdx;
                const isCurrent = i === currentStageIdx;

                return (
                  <div key={stage.key} className="flex gap-4">
                    {/* Vertical line + dot */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isCompleted
                            ? 'bg-green-500'
                            : 'bg-stone-200'
                        } ${isCurrent ? 'ring-2 ring-green-200' : ''}`}
                      >
                        {isCompleted ? (
                          <svg
                            className="w-3.5 h-3.5 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-stone-400" />
                        )}
                      </div>
                      {i < STAGES.length - 1 && (
                        <div
                          className={`w-px h-8 ${
                            i < currentStageIdx
                              ? 'bg-green-400'
                              : 'bg-stone-200'
                          }`}
                        />
                      )}
                    </div>

                    {/* Label */}
                    <div className="pb-4">
                      <p
                        className={`text-sm font-medium ${
                          isCompleted
                            ? 'text-stone-900'
                            : 'text-stone-400'
                        } ${isCurrent ? 'text-green-700' : ''}`}
                      >
                        {stage.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Estimated delivery */}
            <div className="mt-6 pt-4 border-t border-stone-100">
              <p className="text-sm text-stone-500">
                Estimated delivery:{' '}
                <strong className="text-stone-700">3-7 business days</strong>{' '}
                from shipment
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
