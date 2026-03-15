import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getOrderById, updateOrderFields, updateOrderStatus } from '@/lib/services/orders';

async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const order = await getOrderById(id);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('[Admin/Orders/ID] GET Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch order';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

interface PatchBody {
  status?: string;
  notes?: string;
  trackingNumber?: string;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: orderId } = await params;
    const body = (await request.json()) as PatchBody;

    // Verify order exists
    const existing = await getOrderById(orderId);
    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Validate status if provided
    if (body.status) {
      const validStatuses = [
        'paid',
        'processing',
        'sent_to_print',
        'printed',
        'shipped',
        'delivered',
        'cancelled',
      ];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        );
      }
    }

    const hasUpdates =
      body.status !== undefined ||
      body.notes !== undefined ||
      body.trackingNumber !== undefined;

    if (!hasUpdates) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    // If status changed, use updateOrderStatus for proper logging
    if (body.status) {
      await updateOrderStatus(orderId, body.status, body.notes);
    }

    // Update other fields (notes, tracking) via updateOrderFields
    const updates: { status?: string; notes?: string; tracking_number?: string } = {};
    if (body.status) updates.status = body.status;
    if (body.notes !== undefined) updates.notes = body.notes;
    if (body.trackingNumber !== undefined) updates.tracking_number = body.trackingNumber;

    const updated = await updateOrderFields(orderId, updates);

    return NextResponse.json({ order: updated });
  } catch (error) {
    console.error('[Admin/Orders/ID] PATCH Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update order';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
