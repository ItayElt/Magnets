import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { sendRefundConfirmationEmail } from '@/lib/services/email';

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
    const { data: order, error: orderError } = await supabaseAdmin
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

    const previousStatus = order.status;
    const internalId = order.id; // The actual UUID primary key

    // Update the order status and timestamp in Supabase
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        status: 'refunded',
        status_updated_at: new Date().toISOString(),
      })
      .eq('id', internalId);

    if (updateError) {
      console.error('Failed to update order status after refund:', updateError);
    }

    // Add to status log using the internal UUID (matches order_status_log.order_id FK)
    await supabaseAdmin.from('order_status_log').insert({
      order_id: internalId,
      old_status: previousStatus,
      new_status: 'refunded',
      changed_by: 'admin',
      note: `Full refund of $${Number(order.total_price).toFixed(2)} processed via Stripe (${refund.id})`,
    });

    // Send refund confirmation email to the customer
    try {
      await sendRefundConfirmationEmail(order, order.email, refund.id);
    } catch (emailErr) {
      // Don't fail the refund if email fails — refund already processed
      console.error('Failed to send refund confirmation email:', emailErr);
    }

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
