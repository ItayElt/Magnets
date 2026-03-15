import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUnbatchedOrders, setBatchId, getSettings } from '@/lib/services/orders';
import { sendPrintShopBatchEmail } from '@/lib/services/email';
import { supabaseAdmin } from '@/lib/supabase/admin';

async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function POST() {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orders = await getUnbatchedOrders();

    if (orders.length === 0) {
      return NextResponse.json({
        message: 'No unprocessed orders to batch',
        batchId: null,
        orderCount: 0,
      });
    }

    const today = new Date().toISOString().split('T')[0];
    const batchId = `BATCH-${today}`;

    // Get print shop email from settings
    const settings = await getSettings();
    const printShopEmail =
      (settings.print_shop_email as string) || process.env.PRINT_SHOP_EMAIL;

    if (!printShopEmail) {
      return NextResponse.json(
        { error: 'Print shop email not configured. Set it in admin settings.' },
        { status: 400 }
      );
    }

    // Fetch order items for each order
    const batchOrders = await Promise.all(
      orders.map(async (o) => {
        const { data: items } = await supabaseAdmin
          .from('order_items')
          .select('*')
          .eq('order_id', o.id);

        return { ...o, items: items ?? [] };
      })
    );

    await sendPrintShopBatchEmail(batchOrders, printShopEmail);

    const orderIds = orders.map((o) => o.id);
    await setBatchId(orderIds, batchId);

    return NextResponse.json({
      message: `Batch ${batchId} created and sent`,
      batchId,
      orderCount: orders.length,
    });
  } catch (error) {
    console.error('[Admin/Batch] Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to process batch';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
