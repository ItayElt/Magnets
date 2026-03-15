import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getOrdersForExport } from '@/lib/services/orders';
import type { OrderItemRow } from '@/lib/services/orders';

async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

function escapeCSVField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const status = request.nextUrl.searchParams.get('status') || undefined;
    const orders = await getOrdersForExport(status);

    const headers = [
      'order_id',
      'date',
      'email',
      'recipient_name',
      'address',
      'city',
      'state',
      'zip',
      'quantity',
      'photo_style',
      'caption',
      'image_url',
      'status',
    ];

    const rows: string[] = [headers.join(',')];

    for (const order of orders) {
      const date = new Date(order.created_at).toISOString().split('T')[0];
      const items: OrderItemRow[] = order.order_items || [];

      if (items.length > 0) {
        for (const item of items) {
          rows.push(
            [
              escapeCSVField(order.order_id),
              escapeCSVField(date),
              escapeCSVField(order.email),
              escapeCSVField(item.recipient_name || ''),
              escapeCSVField(
                `${item.address1 || ''}${item.address2 ? ` ${item.address2}` : ''}`
              ),
              escapeCSVField(item.city || ''),
              escapeCSVField(item.state || ''),
              escapeCSVField(item.zip || ''),
              String(item.quantity),
              escapeCSVField(order.photo_style),
              escapeCSVField(order.caption || ''),
              escapeCSVField(order.image_path || ''),
              escapeCSVField(order.status),
            ].join(',')
          );
        }
      } else {
        // Order without items (fallback)
        rows.push(
          [
            escapeCSVField(order.order_id),
            escapeCSVField(date),
            escapeCSVField(order.email),
            '',
            '',
            '',
            '',
            '',
            String(order.quantity),
            escapeCSVField(order.photo_style),
            escapeCSVField(order.caption || ''),
            escapeCSVField(order.image_path || ''),
            escapeCSVField(order.status),
          ].join(',')
        );
      }
    }

    const csv = rows.join('\n');
    const today = new Date().toISOString().split('T')[0];
    const filename = `memora-orders-${today}${status ? `-${status}` : ''}.csv`;

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('[Admin/Export] Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to export orders';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
