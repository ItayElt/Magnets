'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

interface Subscriber {
  id: string;
  email: string;
  created_at: string;
}

function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const supabase = getSupabase();
        const { data, error, count } = await supabase
          .from('subscribers')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .limit(200);

        if (error) throw error;
        setSubscribers(data ?? []);
        setTotal(count ?? data?.length ?? 0);
      } catch (err) {
        console.error('Failed to load subscribers:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = search
    ? subscribers.filter((s) =>
        s.email.toLowerCase().includes(search.toLowerCase())
      )
    : subscribers;

  function exportCSV() {
    const rows = [
      ['Email', 'Subscribed At'],
      ...filtered.map((s) => [
        s.email,
        new Date(s.created_at).toISOString(),
      ]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `memora-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-stone-900 font-[family-name:var(--font-playfair)] mb-6">
          Subscribers
        </h1>
        <div className="bg-white rounded-2xl p-6 border border-stone-200 animate-pulse">
          <div className="h-8 w-32 bg-stone-200 rounded mb-4" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4 mb-3">
              <div className="h-4 w-48 bg-stone-100 rounded" />
              <div className="h-4 w-32 bg-stone-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-900 font-[family-name:var(--font-playfair)] mb-6">
        Subscribers
      </h1>

      {/* Stat Card */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 mb-6">
        <p className="text-sm text-stone-500 mb-1">Total Subscribers</p>
        <p className="text-3xl font-bold text-stone-900">{total}</p>
      </div>

      {/* Search + Export */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
        />
        <button
          onClick={exportCSV}
          className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-full transition-colors text-sm cursor-pointer whitespace-nowrap"
        >
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50">
                <th className="text-left px-4 py-3 font-medium text-stone-600">
                  Email
                </th>
                <th className="text-left px-4 py-3 font-medium text-stone-600">
                  Subscribed
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-stone-50 hover:bg-stone-50 transition-colors"
                >
                  <td className="px-4 py-3 text-stone-800 font-medium">
                    {s.email}
                  </td>
                  <td className="px-4 py-3 text-stone-500">
                    {new Date(s.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={2}
                    className="px-4 py-8 text-center text-stone-400"
                  >
                    {search
                      ? 'No subscribers match your search'
                      : 'No subscribers yet'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {search && (
        <p className="text-xs text-stone-400 mt-2">
          Showing {filtered.length} of {total} subscribers
        </p>
      )}
    </div>
  );
}
