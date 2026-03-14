'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getOrders } from '@/lib/mock-data';
import { CompletedOrder } from '@/lib/types';
import { generateOrderCSV, downloadCSV } from '@/lib/utils/csv';
import Button from '@/components/ui/Button';

const statusColors: Record<string, string> = {
  processing: 'bg-yellow-100 text-yellow-800',
  printed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<CompletedOrder[]>([]);

  useEffect(() => {
    setOrders(getOrders());
  }, []);

  const handleExportCSV = () => {
    const csv = generateOrderCSV(orders);
    const date = new Date().toISOString().split('T')[0];
    downloadCSV(csv, `memora-orders-${date}.csv`);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Orders</h1>
        <Button variant="secondary" size="sm" onClick={handleExportCSV}>
          Export CSV
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50">
                <th className="text-left px-4 py-3 font-medium text-stone-600">Order ID</th>
                <th className="text-left px-4 py-3 font-medium text-stone-600">Date</th>
                <th className="text-left px-4 py-3 font-medium text-stone-600">Email</th>
                <th className="text-left px-4 py-3 font-medium text-stone-600">Qty</th>
                <th className="text-left px-4 py-3 font-medium text-stone-600">Total</th>
                <th className="text-left px-4 py-3 font-medium text-stone-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.orderId} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${order.orderId}`}
                      className="font-mono text-amber-700 hover:text-amber-800 font-medium"
                    >
                      {order.orderId}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-stone-600">
                    {new Date(order.orderDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-stone-600">{order.email}</td>
                  <td className="px-4 py-3 text-stone-600">{order.quantity}</td>
                  <td className="px-4 py-3 text-stone-800 font-medium">
                    ${order.totalPrice.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                        statusColors[order.status] || 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
          <div className="text-center py-12 text-stone-500">No orders yet</div>
        )}
      </div>
    </div>
  );
}
