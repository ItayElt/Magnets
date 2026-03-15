'use client';

import { useEffect, useState } from 'react';

export default function AdminSettingsPage() {
  const [printShopEmail, setPrintShopEmail] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [loading, setLoading] = useState(true);

  // Save states
  const [savingPrint, setSavingPrint] = useState(false);
  const [savingAdmin, setSavingAdmin] = useState(false);
  const [batchLoading, setBatchLoading] = useState(false);

  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/settings');
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        const settings = data.settings ?? {};
        setPrintShopEmail((settings.print_shop_email as string) ?? '');
        setAdminEmail((settings.admin_email as string) ?? '');
      } catch {
        // No settings available — leave defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function saveSetting(key: string, value: string) {
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    });
    if (!res.ok) throw new Error('Failed to save');
  }

  async function handleSavePrintShop() {
    setSavingPrint(true);
    setMessage(null);
    try {
      await saveSetting('print_shop_email', printShopEmail);
      setMessage('Print shop email saved');
    } catch {
      setMessage('Failed to save print shop email');
    } finally {
      setSavingPrint(false);
    }
  }

  async function handleSaveAdmin() {
    setSavingAdmin(true);
    setMessage(null);
    try {
      await saveSetting('admin_email', adminEmail);
      setMessage('Admin email saved');
    } catch {
      setMessage('Failed to save admin email');
    } finally {
      setSavingAdmin(false);
    }
  }

  async function handleBatch() {
    if (!confirm('Are you sure you want to send a batch now?')) return;
    setBatchLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/batch', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setMessage(`Batch sent successfully! ${data.count ?? 0} orders batched.`);
      } else {
        setMessage(data.error ?? 'Batch failed');
      }
    } catch {
      setMessage('Network error');
    } finally {
      setBatchLoading(false);
    }
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-stone-900 font-[family-name:var(--font-playfair)] mb-6">
          Settings
        </h1>
        <div className="space-y-6 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 border border-stone-200"
            >
              <div className="h-5 w-32 bg-stone-200 rounded mb-4" />
              <div className="h-10 w-full max-w-md bg-stone-100 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-900 font-[family-name:var(--font-playfair)] mb-6">
        Settings
      </h1>

      {message && (
        <div className="mb-6 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          {message}
        </div>
      )}

      <div className="space-y-6">
        {/* Print Shop Email */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200">
          <h2 className="font-semibold text-stone-800 mb-1">
            Print Shop Email
          </h2>
          <p className="text-sm text-stone-500 mb-4">
            Email address where print batch orders are sent.
          </p>
          <div className="flex gap-3 max-w-md">
            <input
              type="email"
              value={printShopEmail}
              onChange={(e) => setPrintShopEmail(e.target.value)}
              placeholder="printshop@example.com"
              className="flex-1 px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-800 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              onClick={handleSavePrintShop}
              disabled={savingPrint}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
            >
              {savingPrint ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {/* Admin Email */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200">
          <h2 className="font-semibold text-stone-800 mb-1">Admin Email</h2>
          <p className="text-sm text-stone-500 mb-4">
            Email address for admin notifications.
          </p>
          <div className="flex gap-3 max-w-md">
            <input
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="admin@memora.com"
              className="flex-1 px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-800 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              onClick={handleSaveAdmin}
              disabled={savingAdmin}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
            >
              {savingAdmin ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {/* Batch Schedule */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200">
          <h2 className="font-semibold text-stone-800 mb-1">Batch Schedule</h2>
          <p className="text-sm text-stone-500 mb-4">
            Automatic batch schedule for sending orders to the print shop.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-stone-50 rounded-xl border border-stone-200">
            <span className="text-sm text-stone-800 font-medium">
              Daily at 9:00 AM ET
            </span>
            <span className="text-xs text-stone-400">(automated)</span>
          </div>
        </div>

        {/* Manual Batch */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200">
          <h2 className="font-semibold text-stone-800 mb-1">Manual Batch</h2>
          <p className="text-sm text-stone-500 mb-4">
            Manually trigger a batch to send all unbatched orders to the print
            shop immediately.
          </p>
          <button
            onClick={handleBatch}
            disabled={batchLoading}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
          >
            {batchLoading ? 'Sending...' : 'Send Batch Now'}
          </button>
        </div>
      </div>
    </div>
  );
}
