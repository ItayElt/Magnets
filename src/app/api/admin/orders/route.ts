import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getOrders } from '@/lib/services/orders';

async function requireAuth() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = request.nextUrl.searchParams;

    const result = await getOrders({
      status: params.get('status') || undefined,
      email: params.get('email') || undefined,
      dateFrom: params.get('dateFrom') || undefined,
      dateTo: params.get('dateTo') || undefined,
      page: params.get('page') ? parseInt(params.get('page')!, 10) : 1,
      limit: params.get('limit') ? parseInt(params.get('limit')!, 10) : 20,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[Admin/Orders] Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch orders';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
