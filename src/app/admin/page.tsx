'use client';

import { useEffect, useState } from 'react';
import { getOrders } from '@/lib/mock-data';
import { CompletedOrder } from '@/lib/types';

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-stone-200">
      <p className="text-sm text-stone-500 mb-1">{label}</p>
      <p className="text-3xl font-bold text-stone-900">{value}</p>
      {sub && <p className="text-sm text-stone-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<CompletedOrder[]>([]);

  useEffect(() => {
    setOrders(getOrders());
  }, []);

  const today = new Date().toDateString();
  const ordersToday = orders.filter(
    (o) => new Date(o.orderDate).toDateString() === today
  );
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);
  const revenueToday = ordersToday.reduce((sum, o) => sum + o.totalPrice, 0);
  const totalMagnets = orders.reduce((sum, o) => sum + o.quantity, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Orders Today" value={ordersToday.length.toString()} />
        <StatCard label="Total Orders" value={orders.length.toString()} />
        <StatCard
          label="Revenue Today"
          value={`$${revenueToday.toFixed(2)}`}
        />
        <StatCard
          label="Total Revenue"
          value={`$${totalRevenue.toFixed(2)}`}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          label="Total Magnets Ordered"
          value={totalMagnets.toString()}
        />
        <StatCard
          label="Average Order Value"
          value={`$${orders.length ? (totalRevenue / orders.length).toFixed(2) : '0.00'}`}
        />
      </div>
    </div>
  );
}
