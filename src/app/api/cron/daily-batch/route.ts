import { NextRequest, NextResponse } from 'next/server';
import { getUnbatchedOrders, setBatchId, getSettings } from '@/lib/services/orders';
import { sendPrintShopBatchEmail } from '@/lib/services/email';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error('[Cron] CRON_SECRET not configured');
      return NextResponse.json({ error: 'Cron secret not configured' }, { status: 500 });
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get unbatched orders
    const orders = await getUnbatchedOrders();

    if (orders.length === 0) {
      console.log('[Cron] No unbatched orders found');
      return NextResponse.json({
        message: 'No orders to process',
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
      console.error('[Cron] No print shop email configured');
      return NextResponse.json(
        { error: 'Print shop email not configured' },
        { status: 500 }
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

    // Update all orders with batch ID and new status
    const orderIds = orders.map((o) => o.id);
    await setBatchId(orderIds, batchId);

    console.log(`[Cron] Batch ${batchId} created with ${orders.length} orders`);

    return NextResponse.json({
      message: `Batch ${batchId} processed successfully`,
      batchId,
      orderCount: orders.length,
    });
  } catch (error) {
    console.error('[Cron] Daily batch error:', error);
    const message = error instanceof Error ? error.message : 'Cron job failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
