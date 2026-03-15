import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const orderId = request.nextUrl.searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { error: 'Missing orderId query parameter' },
        { status: 400 }
      );
    }

    // Validate format
    if (!/^MEM-\d{5}$/.test(orderId)) {
      return NextResponse.json(
        { error: 'Invalid order ID format. Expected MEM-XXXXX' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('order_id, status, created_at, quantity, status_updated_at, tracking_number')
      .eq('order_id', orderId)
      .single();

    if (error && error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (error) {
      throw new Error(`Failed to fetch order: ${error.message}`);
    }

    // Return only public-safe fields (no email, addresses, or images)
    return NextResponse.json({
      order_id: data.order_id,
      status: data.status,
      created_at: data.created_at,
      quantity: data.quantity,
      status_updated_at: data.status_updated_at,
      tracking_number: data.tracking_number,
    });
  } catch (error) {
    console.error('[Orders/Track] Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to track order';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
