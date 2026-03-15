import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminClient } from '@/lib/supabase/admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2025-04-30.basil' as Stripe.LatestApiVersion,
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: orderId } = await params;

  try {
    // Get the order from Supabase
    const { data: order, error: orderError } = await adminClient
      .from('orders')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status === 'refunded') {
      return NextResponse.json({ error: 'Order already refunded' }, { status: 400 });
    }

    if (!order.stripe_payment_intent_id) {
      return NextResponse.json(
        { error: 'No payment intent found for this order. Cannot process refund.' },
        { status: 400 }
      );
    }

    // Process the refund via Stripe
    const refund = await stripe.refunds.create({
      payment_intent: order.stripe_payment_intent_id,
    });

    if (refund.status !== 'succeeded' && refund.status !== 'pending') {
      return NextResponse.json(
        { error: `Refund failed with status: ${refund.status}` },
        { status: 500 }
      );
    }

    // Update the order status in Supabase
    const { error: updateError } = await adminClient
      .from('orders')
      .update({ status: 'refunded' })
      .eq('order_id', orderId);

    if (updateError) {
      console.error('Failed to update order status after refund:', updateError);
    }

    // Add to status log
    await adminClient.from('order_status_log').insert({
      order_id: orderId,
      old_status: order.status,
      new_status: 'refunded',
      changed_by: 'admin',
      note: `Refund processed via Stripe (${refund.id})`,
    });

    return NextResponse.json({
      success: true,
      refundId: refund.id,
      status: refund.status,
    });
  } catch (err: unknown) {
    console.error('Refund error:', err);
    const message = err instanceof Error ? err.message : 'Failed to process refund';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
