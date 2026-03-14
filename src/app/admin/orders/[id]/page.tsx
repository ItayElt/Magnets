'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getOrders } from '@/lib/mock-data';
import { CompletedOrder } from '@/lib/types';

const statusColors: Record<string, string> = {
  processing: 'bg-yellow-100 text-yellow-800',
  printed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<CompletedOrder | null>(null);

  useEffect(() => {
    const orders = getOrders();
    const found = orders.find((o) => o.orderId === params.id);
    if (found) setOrder(found);
  }, [params.id]);

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-stone-500">Order not found</p>
        <Link href="/admin/orders" className="text-amber-700 hover:text-amber-800 text-sm mt-2 inline-block">
          ← Back to orders
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/orders" className="text-sm text-stone-500 hover:text-stone-700">
          ← Back to orders
        </Link>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-2xl font-bold text-stone-900 font-mono">{order.orderId}</h1>
        <span
          className={`inline-block px-3 py-1 rounded-full text-sm font-medium capitalize ${
            statusColors[order.status] || 'bg-stone-100 text-stone-600'
          }`}
        >
          {order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order info */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200">
          <h2 className="font-semibold text-stone-800 mb-4">Order Details</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-stone-500">Date</span>
              <span className="text-stone-800">
                {new Date(order.orderDate).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Email</span>
              <span className="text-stone-800">{order.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Frame</span>
              <span className="text-stone-800 capitalize">
                {order.selectedFrame.replace('-', ' ')}
              </span>
            </div>
            {order.caption && (
              <div className="flex justify-between">
                <span className="text-stone-500">Caption</span>
                <span className="text-stone-800">&ldquo;{order.caption}&rdquo;</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-stone-500">Quantity</span>
              <span className="text-stone-800">{order.quantity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Unit price</span>
              <span className="text-stone-800">${order.unitPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-stone-100 pt-3">
              <span className="font-medium text-stone-800">Total</span>
              <span className="font-medium text-stone-800">${order.totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Magnet preview */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200">
          <h2 className="font-semibold text-stone-800 mb-4">Magnet Preview</h2>
          {order.croppedImage ? (
            <div className="flex justify-center">
              <div className="bg-white p-2 pb-6 shadow-md rounded-sm">
                <img
                  src={order.croppedImage}
                  alt="Magnet design"
                  className="w-48 rounded-sm"
                  style={{ aspectRatio: '4/3', objectFit: 'cover' }}
                />
                {order.caption && (
                  <p className="text-center text-xs text-stone-500 mt-1">{order.caption}</p>
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

        {/* Shipping addresses */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 lg:col-span-2">
          <h2 className="font-semibold text-stone-800 mb-4">Shipping Addresses</h2>
          {order.mode === 'self' && order.selfAddress ? (
            <div className="text-sm text-stone-600">
              <p className="font-medium text-stone-800">{order.selfAddress.fullName}</p>
              <p>{order.selfAddress.address1}</p>
              {order.selfAddress.address2 && <p>{order.selfAddress.address2}</p>}
              <p>
                {order.selfAddress.city}, {order.selfAddress.state} {order.selfAddress.zip}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {order.recipients.map((r, i) => (
                <div key={r.id} className="text-sm text-stone-600 bg-stone-50 rounded-xl p-3">
                  <p className="text-xs text-stone-400 mb-1">Recipient {i + 1}</p>
                  <p className="font-medium text-stone-800">{r.address.fullName}</p>
                  <p>{r.address.address1}</p>
                  {r.address.address2 && <p>{r.address.address2}</p>}
                  <p>
                    {r.address.city}, {r.address.state} {r.address.zip}
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
