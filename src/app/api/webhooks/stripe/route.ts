import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { createOrder } from '@/lib/services/orders';
import { getUnitPrice } from '@/lib/constants';
import type Stripe from 'stripe';

export const runtime = 'nodejs';

function generateOrderId(): string {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `MEM-${num}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('[Webhook] STRIPE_WEBHOOK_SECRET not configured');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signature verification failed';
      console.error('[Webhook] Signature verification failed:', message);
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${message}` },
        { status: 400 }
      );
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const meta = session.metadata || {};

      const email = meta.email || session.customer_email || '';
      const quantity = parseInt(meta.quantity || '1', 10);
      const photoStyle = meta.photoStyle || 'normal';
      const caption = meta.caption || '';
      const mode = (meta.mode || 'self') as 'self' | 'friends';
      const imagePath = meta.imagePath || '';

      // Parse address data from metadata
      let selfAddress: Record<string, string> | null = null;
      let recipients: Array<Record<string, unknown>> | null = null;

      try {
        if (meta.selfAddress) selfAddress = JSON.parse(meta.selfAddress);
      } catch {
        console.warn('[Webhook] Failed to parse selfAddress metadata');
      }

      try {
        if (meta.recipients) recipients = JSON.parse(meta.recipients);
      } catch {
        console.warn('[Webhook] Failed to parse recipients metadata');
      }

      const unitPrice = getUnitPrice(quantity);
      const totalPrice = +(unitPrice * quantity).toFixed(2);
      const orderId = generateOrderId();

      // Build order items from addresses
      const items: Array<{
        recipient_name: string;
        address1: string;
        address2: string;
        city: string;
        state: string;
        zip: string;
        quantity: number;
      }> = [];

      if (mode === 'self' && selfAddress) {
        items.push({
          recipient_name: selfAddress.fullName || '',
          address1: selfAddress.address1 || '',
          address2: selfAddress.address2 || '',
          city: selfAddress.city || '',
          state: selfAddress.state || '',
          zip: selfAddress.zip || '',
          quantity,
        });
      } else if (recipients && recipients.length > 0) {
        for (const r of recipients) {
          const addr = (r.address || r) as Record<string, string>;
          items.push({
            recipient_name: addr.fullName || '',
            address1: addr.address1 || '',
            address2: addr.address2 || '',
            city: addr.city || '',
            state: addr.state || '',
            zip: addr.zip || '',
            quantity: 1,
          });
        }
      }

      await createOrder({
        order_id: orderId,
        email,
        mode,
        quantity,
        photo_style: photoStyle,
        caption,
        image_path: imagePath || null,
        unit_price: unitPrice,
        total_price: totalPrice,
        stripe_session_id: session.id,
        stripe_payment_intent_id:
          typeof session.payment_intent === 'string' ? session.payment_intent : undefined,
        items,
      });

      console.log(`[Webhook] Order created: ${orderId} for session ${session.id}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Webhook] Unhandled error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
