import { NextRequest, NextResponse } from 'next/server';
import { getOrderByStripeSession } from '@/lib/services/orders';

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing session_id query parameter' },
        { status: 400 }
      );
    }

    const order = await getOrderByStripeSession(sessionId);

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found for this session' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      order_id: order.order_id,
      email: order.email,
      quantity: order.quantity,
      unit_price: order.unit_price,
      total: order.total_price,
      photo_style: order.photo_style,
      caption: order.caption,
      mode: order.mode,
      image_path: order.image_path,
      status: order.status,
      created_at: order.created_at,
    });
  } catch (error) {
    console.error('[Orders/BySession] Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch order';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
