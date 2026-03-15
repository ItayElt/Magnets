'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getOrders as getMockOrders } from '@/lib/mock-data';
import { CompletedOrder, OrderStatus } from '@/lib/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Stats {
  ordersToday: number;
  totalOrders: number;
  revenueToday: number;
  totalRevenue: number;
  avgOrderValue: number;
  totalMagnets: number;
  countsByStatus: Record<string, number>;
  recentOrders: {
    order_id: string;
    created_at: string;
    email: string;
    status: string;
  }[];
  revenueByDay: { date: string; revenue: number }[];
}

// ---------------------------------------------------------------------------
// Status config
// ---------------------------------------------------------------------------

const STATUS_PIPELINE: { key: OrderStatus; label: string; color: string; bg: string }[] = [
  { key: 'paid', label: 'Paid', color: 'bg-yellow-400', bg: 'bg-yellow-50 text-yellow-800' },
  { key: 'processing', label: 'Processing', color: 'bg-orange-400', bg: 'bg-orange-50 text-orange-800' },
  { key: 'sent_to_print', label: 'Sent to Print', color: 'bg-blue-400', bg: 'bg-blue-50 text-blue-800' },
  { key: 'printed', label: 'Printed', color: 'bg-indigo-400', bg: 'bg-indigo-50 text-indigo-800' },
  { key: 'shipped', label: 'Shipped', color: 'bg-purple-400', bg: 'bg-purple-50 text-purple-800' },
  { key: 'delivered', label: 'Delivered', color: 'bg-green-400', bg: 'bg-green-50 text-green-800' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildStatsFromMock(orders: CompletedOrder[]): Stats {
  const today = new Date().toDateString();
  const ordersToday = orders.filter(
    (o) => new Date(o.orderDate).toDateString() === today
  );
  const totalRevenue = orders.reduce((s, o) => s + o.totalPrice, 0);
  const revenueToday = ordersToday.reduce((s, o) => s + o.totalPrice, 0);
  const totalMagnets = orders.reduce((s, o) => s + o.quantity, 0);

  const countsByStatus: Record<string, number> = {};
  for (const o of orders) {
    countsByStatus[o.status] = (countsByStatus[o.status] ?? 0) + 1;
  }

  // Revenue last 14 days
  const dayMap: Record<string, number> = {};
  const now = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    dayMap[key] = 0;
  }
  for (const o of orders) {
    const key = new Date(o.orderDate).toISOString().slice(0, 10);
    if (key in dayMap) dayMap[key] += o.totalPrice;
  }
  const revenueByDay = Object.entries(dayMap).map(([date, revenue]) => ({
    date,
    revenue: +revenue.toFixed(2),
  }));

  return {
    ordersToday: ordersToday.length,
    totalOrders: orders.length,
    revenueToday,
    totalRevenue,
    avgOrderValue: orders.length ? totalRevenue / orders.length : 0,
    totalMagnets,
    countsByStatus,
    recentOrders: orders.slice(0, 5).map((o) => ({
      order_id: o.orderId,
      created_at: o.orderDate,
      email: o.email,
      status: o.status,
    })),
    revenueByDay,
  };
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-stone-200">
      <p className="text-sm text-stone-500 mb-1">{label}</p>
      <p className="text-3xl font-bold text-stone-900">{value}</p>
      {sub && <p className="text-sm text-stone-400 mt-1">{sub}</p>}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-stone-200 animate-pulse">
      <div className="h-4 w-24 bg-stone-200 rounded mb-3" />
      <div className="h-8 w-20 bg-stone-200 rounded" />
    </div>
  );
}

function SkeletonBar() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-stone-200 animate-pulse">
      <div className="h-5 w-40 bg-stone-200 rounded mb-4" />
      <div className="h-6 w-full bg-stone-100 rounded-full" />
      <div className="flex gap-4 mt-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-4 w-16 bg-stone-100 rounded" />
        ))}
      </div>
    </div>
  );
}

function SkeletonTable() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-stone-200 animate-pulse">
      <div className="h-5 w-32 bg-stone-200 rounded mb-4" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-4 mb-3">
          <div className="h-4 w-20 bg-stone-100 rounded" />
          <div className="h-4 w-24 bg-stone-100 rounded" />
          <div className="h-4 w-40 bg-stone-100 rounded" />
          <div className="h-4 w-16 bg-stone-100 rounded" />
        </div>
      ))}
    </div>
  );
}

const statusBadge: Record<string, string> = {
  paid: 'bg-amber-100 text-amber-800',
  processing: 'bg-orange-100 text-orange-800',
  sent_to_print: 'bg-blue-100 text-blue-800',
  printed: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
};

function formatStatus(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchResult, setBatchResult] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/stats');
        if (!res.ok) throw new Error('API error');
        const apiStats = await res.json();

        // API returns OrderStats shape — transform for dashboard
        const mockOrders = getMockOrders();
        const recentRes = await fetch('/api/admin/orders?limit=5').catch(() => null);
        let recentOrders: Stats['recentOrders'] = [];
        if (recentRes?.ok) {
          const recentData = await recentRes.json();
          recentOrders = (recentData.orders ?? []).slice(0, 5).map((o: Record<string, unknown>) => ({
            order_id: o.order_id,
            created_at: o.created_at,
            email: o.email,
            status: o.status,
          }));
        }

        // Build revenue chart — not available from stats API, fallback to mock
        const dayMap: Record<string, number> = {};
        const now = new Date();
        for (let i = 13; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          dayMap[d.toISOString().slice(0, 10)] = 0;
        }
        for (const o of mockOrders) {
          const key = new Date(o.orderDate).toISOString().slice(0, 10);
          if (key in dayMap) dayMap[key] += o.totalPrice;
        }
        const revenueByDay = Object.entries(dayMap).map(([date, revenue]) => ({
          date,
          revenue: +revenue.toFixed(2),
        }));

        setStats({
          ordersToday: apiStats.ordersToday ?? 0,
          totalOrders: apiStats.totalOrders ?? 0,
          revenueToday: apiStats.revenueToday ?? 0,
          totalRevenue: apiStats.totalRevenue ?? 0,
          avgOrderValue:
            apiStats.totalOrders > 0
              ? apiStats.totalRevenue / apiStats.totalOrders
              : 0,
          totalMagnets: 0, // not provided by API — will show from mock if needed
          countsByStatus: apiStats.countsByStatus ?? {},
          recentOrders,
          revenueByDay,
        });
      } catch {
        // Fallback to mock data
        const orders = getMockOrders();
        setStats(buildStatsFromMock(orders));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleBatch() {
    setBatchLoading(true);
    setBatchResult(null);
    try {
      const res = await fetch('/api/admin/batch', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setBatchResult(`Batch sent! ${data.count ?? 0} orders batched.`);
      } else {
        setBatchResult(data.error ?? 'Batch failed');
      }
    } catch {
      setBatchResult('Network error');
    } finally {
      setBatchLoading(false);
    }
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-stone-900 font-[family-name:var(--font-playfair)] mb-6">
          Dashboard
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <SkeletonBar />
        <div className="mt-6">
          <SkeletonTable />
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const totalPipeline = Object.values(stats.countsByStatus).reduce(
    (s, v) => s + v,
    0
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-900 font-[family-name:var(--font-playfair)] mb-6">
        Dashboard
      </h1>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard label="Orders Today" value={stats.ordersToday.toString()} />
        <StatCard label="Total Orders" value={stats.totalOrders.toString()} />
        <StatCard
          label="Revenue Today"
          value={`$${stats.revenueToday.toFixed(2)}`}
        />
        <StatCard
          label="Total Revenue"
          value={`$${stats.totalRevenue.toFixed(2)}`}
        />
        <StatCard
          label="Avg Order Value"
          value={`$${stats.avgOrderValue.toFixed(2)}`}
        />
        <StatCard
          label="Total Magnets"
          value={stats.totalMagnets.toString()}
        />
      </div>

      {/* ── Fulfillment Pipeline ── */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 mb-8">
        <h2 className="text-lg font-semibold text-stone-800 font-[family-name:var(--font-playfair)] mb-4">
          Fulfillment Pipeline
        </h2>

        {totalPipeline > 0 ? (
          <>
            <div className="flex h-8 rounded-full overflow-hidden bg-stone-100">
              {STATUS_PIPELINE.map(({ key, color }) => {
                const count = stats.countsByStatus[key] ?? 0;
                if (count === 0) return null;
                const pct = (count / totalPipeline) * 100;
                return (
                  <div
                    key={key}
                    className={`${color} transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                    title={`${formatStatus(key)}: ${count}`}
                  />
                );
              })}
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4">
              {STATUS_PIPELINE.map(({ key, label, bg }) => {
                const count = stats.countsByStatus[key] ?? 0;
                return (
                  <div key={key} className="flex items-center gap-2 text-sm">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${bg}`}
                    >
                      {count}
                    </span>
                    <span className="text-stone-600">{label}</span>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <p className="text-stone-400 text-sm">No orders in pipeline yet.</p>
        )}
      </div>

      {/* ── Revenue Chart ── */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 mb-8">
        <h2 className="text-lg font-semibold text-stone-800 font-[family-name:var(--font-playfair)] mb-4">
          Revenue — Last 14 Days
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.revenueByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis
                dataKey="date"
                tickFormatter={(v: string) => {
                  const d = new Date(v + 'T00:00:00');
                  return `${d.getMonth() + 1}/${d.getDate()}`;
                }}
                tick={{ fill: '#78716c', fontSize: 12 }}
              />
              <YAxis
                tickFormatter={(v: number) => `$${v}`}
                tick={{ fill: '#78716c', fontSize: 12 }}
              />
              <Tooltip
                formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Revenue']}
                labelFormatter={(label) => {
                  const d = new Date(String(label) + 'T00:00:00');
                  return d.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  });
                }}
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid #e7e5e4',
                  fontSize: '14px',
                }}
              />
              <Bar dataKey="revenue" fill="#d97706" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="flex flex-wrap gap-4 mb-8">
        <button
          onClick={handleBatch}
          disabled={batchLoading}
          className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-full transition-colors disabled:opacity-50 cursor-pointer"
        >
          {batchLoading ? 'Sending...' : 'Send Batch Now'}
        </button>
        <Link
          href="/admin/orders?status=paid"
          className="px-5 py-2.5 bg-white hover:bg-stone-50 text-stone-800 font-medium rounded-full border border-stone-300 transition-colors"
        >
          View Pending
        </Link>
        {batchResult && (
          <span className="self-center text-sm text-stone-600">{batchResult}</span>
        )}
      </div>

      {/* ── Recent Orders ── */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100">
          <h2 className="text-lg font-semibold text-stone-800 font-[family-name:var(--font-playfair)]">
            Recent Orders
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50">
                <th className="text-left px-4 py-3 font-medium text-stone-600">
                  Order ID
                </th>
                <th className="text-left px-4 py-3 font-medium text-stone-600">
                  Date
                </th>
                <th className="text-left px-4 py-3 font-medium text-stone-600">
                  Email
                </th>
                <th className="text-left px-4 py-3 font-medium text-stone-600">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((o) => (
                <tr
                  key={o.order_id}
                  className="border-b border-stone-50 hover:bg-stone-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${o.order_id}`}
                      className="font-mono text-amber-700 hover:text-amber-800 font-medium"
                    >
                      {o.order_id}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-stone-600">
                    {new Date(o.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-stone-600">{o.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        statusBadge[o.status] ?? 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {formatStatus(o.status)}
                    </span>
                  </td>
                </tr>
              ))}
              {stats.recentOrders.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-stone-400">
                    No orders yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
