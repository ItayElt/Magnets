'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getOrders as getMockOrders } from '@/lib/mock-data';
import { CompletedOrder, OrderStatus } from '@/lib/types';
import { generateOrderCSV, downloadCSV } from '@/lib/utils/csv';
import Button from '@/components/ui/Button';

// ---------------------------------------------------------------------------
// Status config
// ---------------------------------------------------------------------------

const ALL_STATUSES: { key: OrderStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'paid', label: 'Paid' },
  { key: 'processing', label: 'Processing' },
  { key: 'sent_to_print', label: 'Sent to Print' },
  { key: 'printed', label: 'Printed' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
];

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
// Types
// ---------------------------------------------------------------------------

interface OrderRow {
  order_id: string;
  created_at: string;
  email: string;
  quantity: number;
  total_price: number;
  status: string;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function OrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [useMock, setUseMock] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [emailSearch, setEmailSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Mock data fallback state
  const [mockOrders, setMockOrders] = useState<CompletedOrder[]>([]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (emailSearch) params.set('email', emailSearch);
      params.set('page', page.toString());
      params.set('limit', '20');

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();

      setOrders(
        (data.orders ?? []).map((o: Record<string, unknown>) => ({
          order_id: o.order_id,
          created_at: o.created_at,
          email: o.email,
          quantity: o.quantity,
          total_price: o.total_price,
          status: o.status,
        }))
      );
      setTotalPages(data.totalPages ?? 1);
      setTotal(data.total ?? 0);
      setUseMock(false);
    } catch {
      // Fallback to mock data
      const mock = getMockOrders();
      setMockOrders(mock);
      setUseMock(true);

      let filtered = mock;
      if (statusFilter !== 'all') {
        filtered = filtered.filter((o) => o.status === statusFilter);
      }
      if (emailSearch) {
        const q = emailSearch.toLowerCase();
        filtered = filtered.filter((o) => o.email.toLowerCase().includes(q));
      }

      const perPage = 20;
      const totalP = Math.ceil(filtered.length / perPage);
      const pageSlice = filtered.slice((page - 1) * perPage, page * perPage);

      setOrders(
        pageSlice.map((o) => ({
          order_id: o.orderId,
          created_at: o.orderDate,
          email: o.email,
          quantity: o.quantity,
          total_price: o.totalPrice,
          status: o.status,
        }))
      );
      setTotalPages(totalP || 1);
      setTotal(filtered.length);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, emailSearch, page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  function handleStatusChange(s: string) {
    setStatusFilter(s);
    setPage(1);
  }

  function handleExportCSV() {
    if (useMock) {
      const csv = generateOrderCSV(mockOrders);
      const date = new Date().toISOString().split('T')[0];
      downloadCSV(csv, `memora-orders-${date}.csv`);
    } else {
      // Use API export endpoint
      window.open('/api/admin/export', '_blank');
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-stone-900 font-[family-name:var(--font-playfair)]">
          Orders
        </h1>
        <Button variant="secondary" size="sm" onClick={handleExportCSV}>
          Export CSV
        </Button>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-1 mb-4">
        {ALL_STATUSES.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handleStatusChange(key)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
              statusFilter === key
                ? 'bg-stone-900 text-white'
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Email search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by email..."
          value={emailSearch}
          onChange={(e) => {
            setEmailSearch(e.target.value);
            setPage(1);
          }}
          className="w-full max-w-sm px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
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
                  Qty
                </th>
                <th className="text-left px-4 py-3 font-medium text-stone-600">
                  Total
                </th>
                <th className="text-left px-4 py-3 font-medium text-stone-600">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-stone-50 animate-pulse">
                    <td className="px-4 py-3">
                      <div className="h-4 w-20 bg-stone-100 rounded" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-24 bg-stone-100 rounded" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-40 bg-stone-100 rounded" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-8 bg-stone-100 rounded" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-16 bg-stone-100 rounded" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-20 bg-stone-100 rounded" />
                    </td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-stone-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order.order_id}
                    className="border-b border-stone-50 hover:bg-stone-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${order.order_id}`}
                        className="font-mono text-amber-700 hover:text-amber-800 font-medium"
                      >
                        {order.order_id}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-stone-600">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-stone-600">{order.email}</td>
                    <td className="px-4 py-3 text-stone-600">
                      {order.quantity}
                    </td>
                    <td className="px-4 py-3 text-stone-800 font-medium">
                      ${order.total_price.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          statusBadge[order.status] ??
                          'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {formatStatus(order.status)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-stone-500">
            {total} order{total !== 1 ? 's' : ''} total
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 text-sm font-medium rounded-lg bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-stone-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 text-sm font-medium rounded-lg bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
