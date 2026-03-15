import { NextRequest, NextResponse } from 'next/server';
import { getOrderByStripeSession, createOrder } from '@/lib/services/orders';
import { sendOrderConfirmationEmail } from '@/lib/services/email';
import { stripe } from '@/lib/stripe/server';
import { getUnitPrice } from '@/lib/constants';

function generateOrderId(): string {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `MEM-${num}`;
}

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing session_id query parameter' },
        { status: 400 }
      );
    }

    // First, try to find the order in the database (created by webhook)
    let order = await getOrderByStripeSession(sessionId);

    // If not found, the webhook hasn't fired yet (common in local dev).
    // Fetch the session from Stripe and create the order directly.
    if (!order) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status !== 'paid') {
        return NextResponse.json(
          { error: 'Payment not completed' },
          { status: 402 }
        );
      }

      const meta = session.metadata || {};
      const email = meta.email || session.customer_email || '';
      const quantity = parseInt(meta.quantity || '1', 10);
      const photoStyle = meta.photoStyle || 'normal';
      const caption = meta.caption || '';
      const mode = (meta.mode || 'self') as 'self' | 'friends';
      const imagePath = meta.imagePath || '';

      let selfAddress: Record<string, string> | null = null;
      let recipients: Array<Record<string, unknown>> | null = null;

      try {
        if (meta.selfAddress) selfAddress = JSON.parse(meta.selfAddress);
      } catch {
        console.warn('[BySession] Failed to parse selfAddress metadata');
      }

      try {
        if (meta.recipients) recipients = JSON.parse(meta.recipients);
      } catch {
        console.warn('[BySession] Failed to parse recipients metadata');
      }

      const unitPrice = getUnitPrice(quantity);
      const totalPrice = +(unitPrice * quantity).toFixed(2);
      const orderId = generateOrderId();

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

      order = await createOrder({
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

      console.log(`[BySession] Order created from Stripe session: ${orderId}`);

      // Send confirmation email
      try {
        await sendOrderConfirmationEmail(order, order.email);
        console.log(`[BySession] Confirmation email sent to ${order.email}`);
      } catch (emailErr) {
        console.error('[BySession] Failed to send confirmation email:', emailErr);
      }
    }

    return NextResponse.json({
      orderId: order.order_id,
      orderDate: order.created_at,
      email: order.email,
      quantity: order.quantity,
      totalPrice: order.total_price,
      mode: order.mode,
      caption: order.caption,
      selectedFrame: order.photo_style,
      selfAddress: null,
      recipients: [],
    });
  } catch (error) {
    console.error('[Orders/BySession] Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch order';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
