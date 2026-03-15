import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getOrderStats } from '@/lib/services/orders';

async function requireAuth() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function GET() {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stats = await getOrderStats();

    return NextResponse.json(stats);
  } catch (error) {
    console.error('[Admin/Stats] Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch stats';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
