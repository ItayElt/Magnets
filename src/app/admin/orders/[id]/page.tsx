'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getOrders as getMockOrders } from '@/lib/mock-data';
import { CompletedOrder, OrderStatus } from '@/lib/types';

// ---------------------------------------------------------------------------
// Status config
// ---------------------------------------------------------------------------

const ALL_STATUSES: (OrderStatus | 'refunded')[] = [
  'paid',
  'processing',
  'sent_to_print',
  'printed',
  'shipped',
  'delivered',
  'refunded',
];

const statusBadge: Record<string, string> = {
  paid: 'bg-amber-100 text-amber-800',
  processing: 'bg-orange-100 text-orange-800',
  sent_to_print: 'bg-blue-100 text-blue-800',
  printed: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  refunded: 'bg-red-100 text-red-800',
};

function formatStatus(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// ---------------------------------------------------------------------------
// Types for the API response
// ---------------------------------------------------------------------------

interface OrderDetail {
  order_id: string;
  created_at: string;
  email: string;
  mode: 'self' | 'friends';
  quantity: number;
  photo_style: string;
  caption: string;
  image_path: string | null;
  unit_price: number;
  total_price: number;
  status: string;
  notes: string;
  tracking_number: string | null;
  items: {
    id: string;
    recipient_name: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    zip: string;
    quantity: number;
  }[];
  status_log: {
    id: string;
    old_status: string | null;
    new_status: string;
    changed_by: string;
    note: string;
    created_at: string;
  }[];
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Editable fields
  const [selectedStatus, setSelectedStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  // Action state
  const [updating, setUpdating] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [savingTracking, setSavingTracking] = useState(false);
  const [refunding, setRefunding] = useState(false);
  const [showRefundConfirm, setShowRefundConfirm] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Mock fallback
  const [mockOrder, setMockOrder] = useState<CompletedOrder | null>(null);
  const [useMock, setUseMock] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/orders/${orderId}`);
        if (res.status === 404) {
          throw new Error('not_found');
        }
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        const o = data.order;

        const detail: OrderDetail = {
          order_id: o.order_id,
          created_at: o.created_at,
          email: o.email,
          mode: o.mode,
          quantity: o.quantity,
          photo_style: o.photo_style,
          caption: o.caption,
          image_path: o.image_path,
          unit_price: o.unit_price,
          total_price: o.total_price,
          status: o.status,
          notes: o.notes ?? '',
          tracking_number: o.tracking_number ?? '',
          items: o.items ?? [],
          status_log: o.status_log ?? [],
        };

        setOrder(detail);
        setSelectedStatus(detail.status);
        setNotes(detail.notes);
        setTrackingNumber(detail.tracking_number ?? '');
        setUseMock(false);
      } catch (err) {
        // Try mock fallback
        const orders = getMockOrders();
        const found = orders.find((o) => o.orderId === orderId);
        if (found) {
          setMockOrder(found);
          setUseMock(true);
          setSelectedStatus(found.status);
          setNotes('');
          setTrackingNumber('');
        } else {
          setNotFound(true);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [orderId]);

  async function handleStatusUpdate() {
    if (useMock) {
      setMessage('Status updated (mock mode)');
      return;
    }
    setUpdating(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: selectedStatus }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      if (data.order) {
        setOrder((prev) =>
          prev ? { ...prev, status: data.order.status } : prev
        );
      }
      setMessage('Status updated successfully');
    } catch {
      setMessage('Failed to update status');
    } finally {
      setUpdating(false);
    }
  }

  async function handleSaveNotes() {
    if (useMock) {
      setMessage('Notes saved (mock mode)');
      return;
    }
    setSavingNotes(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      if (!res.ok) throw new Error('Failed');
      setMessage('Notes saved');
    } catch {
      setMessage('Failed to save notes');
    } finally {
      setSavingNotes(false);
    }
  }

  async function handleSaveTracking() {
    if (useMock) {
      setMessage('Tracking number saved (mock mode)');
      return;
    }
    setSavingTracking(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingNumber }),
      });
      if (!res.ok) throw new Error('Failed');
      setMessage('Tracking number saved');
    } catch {
      setMessage('Failed to save tracking number');
    } finally {
      setSavingTracking(false);
    }
  }

  async function handleRefund() {
    setRefunding(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/refund`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Refund failed');
      setOrder((prev) => prev ? { ...prev, status: 'refunded' } : prev);
      setSelectedStatus('refunded');
      setMessage(`Refund processed successfully (${data.refundId})`);
      setShowRefundConfirm(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to process refund';
      setMessage(msg);
    } finally {
      setRefunding(false);
    }
  }

  // ── Loading state ──
  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <Link
            href="/admin/orders"
            className="text-sm text-stone-500 hover:text-stone-700"
          >
            &larr; Back to orders
          </Link>
        </div>
        <div className="animate-pulse space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-8 w-32 bg-stone-200 rounded" />
            <div className="h-6 w-20 bg-stone-200 rounded-full" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-stone-200 h-64" />
            <div className="bg-white rounded-2xl p-6 border border-stone-200 h-64" />
          </div>
        </div>
      </div>
    );
  }

  // ── Not found ──
  if (notFound) {
    return (
      <div className="text-center py-12">
        <p className="text-stone-500">Order not found</p>
        <Link
          href="/admin/orders"
          className="text-amber-700 hover:text-amber-800 text-sm mt-2 inline-block"
        >
          &larr; Back to orders
        </Link>
      </div>
    );
  }

  // ── Build unified view data ──
  const viewData = useMock && mockOrder
    ? {
        order_id: mockOrder.orderId,
        created_at: mockOrder.orderDate,
        email: mockOrder.email,
        mode: mockOrder.mode,
        quantity: mockOrder.quantity,
        photo_style: mockOrder.selectedFrame,
        caption: mockOrder.caption,
        image_url: mockOrder.croppedImage || null,
        unit_price: mockOrder.unitPrice,
        total_price: mockOrder.totalPrice,
        status: mockOrder.status,
        items: mockOrder.mode === 'self' && mockOrder.selfAddress
          ? [
              {
                id: 'self',
                recipient_name: mockOrder.selfAddress.fullName,
                address1: mockOrder.selfAddress.address1,
                address2: mockOrder.selfAddress.address2,
                city: mockOrder.selfAddress.city,
                state: mockOrder.selfAddress.state,
                zip: mockOrder.selfAddress.zip,
                quantity: mockOrder.quantity,
              },
            ]
          : mockOrder.recipients.map((r) => ({
              id: r.id,
              recipient_name: r.address.fullName,
              address1: r.address.address1,
              address2: r.address.address2,
              city: r.address.city,
              state: r.address.state,
              zip: r.address.zip,
              quantity: 1,
            })),
        status_log: [] as OrderDetail['status_log'],
      }
    : order
    ? {
        order_id: order.order_id,
        created_at: order.created_at,
        email: order.email,
        mode: order.mode,
        quantity: order.quantity,
        photo_style: order.photo_style,
        caption: order.caption,
        image_url: order.image_path
          ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/magnet-images/${order.image_path}`
          : null,
        unit_price: order.unit_price,
        total_price: order.total_price,
        status: order.status,
        items: order.items,
        status_log: order.status_log,
      }
    : null;

  if (!viewData) return null;

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/orders"
          className="text-sm text-stone-500 hover:text-stone-700"
        >
          &larr; Back to orders
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-2xl font-bold text-stone-900 font-mono">
          {viewData.order_id}
        </h1>
        <span
          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
            statusBadge[viewData.status] ?? 'bg-stone-100 text-stone-600'
          }`}
        >
          {formatStatus(viewData.status)}
        </span>
      </div>

      {/* Message */}
      {message && (
        <div className="mb-4 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Order Info ── */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200">
          <h2 className="font-semibold text-stone-800 mb-4">Order Details</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-stone-500">Date</span>
              <span className="text-stone-800">
                {new Date(viewData.created_at).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Email</span>
              <span className="text-stone-800">{viewData.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Photo Style</span>
              <span className="text-stone-800 capitalize">
                {viewData.photo_style.replace(/-/g, ' ')}
              </span>
            </div>
            {viewData.caption && (
              <div className="flex justify-between">
                <span className="text-stone-500">Caption</span>
                <span className="text-stone-800">
                  &ldquo;{viewData.caption}&rdquo;
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-stone-500">Quantity</span>
              <span className="text-stone-800">{viewData.quantity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Unit Price</span>
              <span className="text-stone-800">
                ${viewData.unit_price.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between border-t border-stone-100 pt-3">
              <span className="font-medium text-stone-800">Total</span>
              <span className="font-medium text-stone-800">
                ${viewData.total_price.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* ── Magnet Preview ── */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200">
          <h2 className="font-semibold text-stone-800 mb-4">Magnet Preview</h2>
          {viewData.image_url ? (
            <div className="flex justify-center">
              <div className="bg-white p-2 pb-6 shadow-md rounded-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={viewData.image_url}
                  alt="Magnet design"
                  className="w-48 rounded-sm"
                  style={{ aspectRatio: '4/3', objectFit: 'cover' }}
                />
                {viewData.caption && (
                  <p className="text-center text-xs text-stone-500 mt-1">
                    {viewData.caption}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-48 aspect-[4/3] bg-stone-100 rounded flex items-center justify-center text-stone-400 text-sm">
                No preview
              </div>
            </div>
          )}
        </div>

        {/* ── Status Update ── */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200">
          <h2 className="font-semibold text-stone-800 mb-4">Update Status</h2>
          <div className="flex gap-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {formatStatus(s)}
                </option>
              ))}
            </select>
            <button
              onClick={handleStatusUpdate}
              disabled={updating || selectedStatus === viewData.status}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
            >
              {updating ? 'Updating...' : 'Update'}
            </button>
          </div>
        </div>

        {/* ── Notes ── */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200">
          <h2 className="font-semibold text-stone-800 mb-4">Notes</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Internal notes..."
            className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-800 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
          />
          <button
            onClick={handleSaveNotes}
            disabled={savingNotes}
            className="mt-3 px-5 py-2 bg-stone-800 hover:bg-stone-900 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
          >
            {savingNotes ? 'Saving...' : 'Save Notes'}
          </button>
        </div>

        {/* ── Tracking Number ── */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200">
          <h2 className="font-semibold text-stone-800 mb-4">
            Tracking Number
          </h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Enter tracking number..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-800 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              onClick={handleSaveTracking}
              disabled={savingTracking}
              className="px-5 py-2.5 bg-stone-800 hover:bg-stone-900 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
            >
              {savingTracking ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {/* ── Refund ── */}
        {viewData.status !== 'refunded' && (
          <div className="bg-white rounded-2xl p-6 border border-stone-200">
            <h2 className="font-semibold text-stone-800 mb-4">Refund Order</h2>
            {showRefundConfirm ? (
              <div>
                <p className="text-sm text-stone-600 mb-4">
                  Are you sure you want to refund <strong>${viewData.total_price.toFixed(2)}</strong> to the customer? This cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowRefundConfirm(false)}
                    className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-medium rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRefund}
                    disabled={refunding}
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {refunding ? 'Processing...' : 'Confirm Refund'}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowRefundConfirm(true)}
                className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium rounded-xl border border-red-200 transition-colors cursor-pointer"
              >
                Issue Full Refund
              </button>
            )}
          </div>
        )}

        {viewData.status === 'refunded' && (
          <div className="bg-red-50 rounded-2xl p-6 border border-red-200">
            <h2 className="font-semibold text-red-800 mb-2">Order Refunded</h2>
            <p className="text-sm text-red-600">This order has been fully refunded.</p>
          </div>
        )}

        {/* ── Status History ── */}
        {viewData.status_log.length > 0 && (
          <div className="bg-white rounded-2xl p-6 border border-stone-200">
            <h2 className="font-semibold text-stone-800 mb-4">
              Status History
            </h2>
            <div className="space-y-4">
              {viewData.status_log.map((log, i) => (
                <div key={log.id || i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1.5" />
                    {i < viewData.status_log.length - 1 && (
                      <div className="w-px flex-1 bg-stone-200 mt-1" />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm text-stone-800 font-medium">
                      {log.old_status ? (
                        <>
                          {formatStatus(log.old_status)} &rarr;{' '}
                          {formatStatus(log.new_status)}
                        </>
                      ) : (
                        formatStatus(log.new_status)
                      )}
                    </p>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {new Date(log.created_at).toLocaleString()} &middot;{' '}
                      {log.changed_by}
                    </p>
                    {log.note && (
                      <p className="text-xs text-stone-400 mt-0.5">
                        {log.note}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Shipping Addresses ── */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 lg:col-span-2">
          <h2 className="font-semibold text-stone-800 mb-4">
            Shipping Addresses
          </h2>
          {viewData.items.length === 0 ? (
            <p className="text-sm text-stone-400">No shipping addresses</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {viewData.items.map((item, i) => (
                <div
                  key={item.id}
                  className="text-sm text-stone-600 bg-stone-50 rounded-xl p-3"
                >
                  <p className="text-xs text-stone-400 mb-1">
                    Recipient {i + 1}
                  </p>
                  <p className="font-medium text-stone-800">
                    {item.recipient_name}
                  </p>
                  <p>{item.address1}</p>
                  {item.address2 && <p>{item.address2}</p>}
                  <p>
                    {item.city}, {item.state} {item.zip}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
