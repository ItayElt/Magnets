import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSettings, updateSetting } from '@/lib/services/orders';

async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function GET() {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await getSettings();

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('[Admin/Settings] GET Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch settings';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

interface PutBody {
  key: string;
  value: unknown;
}

export async function PUT(request: Request) {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as PutBody;

    if (!body.key || body.value === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: key, value' },
        { status: 400 }
      );
    }

    await updateSetting(body.key, body.value);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Admin/Settings] PUT Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update setting';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
