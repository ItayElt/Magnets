import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { getUnitPrice } from '@/lib/constants';

interface CheckoutRequestBody {
  email: string;
  quantity: number;
  photoStyle: string;
  caption: string;
  mode: string;
  selfAddress: Record<string, string> | null;
  recipients: Array<Record<string, unknown>> | null;
  imagePath: string | null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckoutRequestBody;

    const { email, quantity, photoStyle, caption, mode, selfAddress, recipients, imagePath } = body;

    // Validate required fields
    if (!email || !quantity || !photoStyle || !mode) {
      return NextResponse.json(
        { error: 'Missing required fields: email, quantity, photoStyle, mode' },
        { status: 400 }
      );
    }

    if (quantity < 1 || quantity > 100) {
      return NextResponse.json(
        { error: 'Quantity must be between 1 and 100' },
        { status: 400 }
      );
    }

    // Calculate price server-side
    const unitPrice = getUnitPrice(quantity);
    const unitAmount = Math.round(unitPrice * 100); // Stripe uses cents

    const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Build metadata (Stripe max 500 chars per value)
    const metadata: Record<string, string> = {
      email,
      quantity: String(quantity),
      photoStyle,
      caption: caption || '',
      mode,
      imagePath: imagePath || '',
    };

    // Store addresses in metadata if they fit, otherwise truncate
    if (selfAddress) {
      const selfAddrStr = JSON.stringify(selfAddress);
      if (selfAddrStr.length <= 500) {
        metadata.selfAddress = selfAddrStr;
      }
    }

    if (recipients && recipients.length > 0) {
      const recipientsStr = JSON.stringify(recipients);
      if (recipientsStr.length <= 500) {
        metadata.recipients = recipientsStr;
      }
    }

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Custom Photo Magnet',
              description: `${photoStyle} style${caption ? ` - "${caption}"` : ''}`,
            },
            unit_amount: unitAmount,
          },
          quantity,
        },
      ],
      mode: 'payment',
      customer_email: email,
      success_url: `${APP_URL}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/checkout`,
      metadata,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('[Checkout] Error creating session:', error);
    const message = error instanceof Error ? error.message : 'Failed to create checkout session';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
