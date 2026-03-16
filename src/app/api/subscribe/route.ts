import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.trim()) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const { error: dbError } = await supabaseAdmin
      .from('subscribers')
      .insert({
        email: email.trim().toLowerCase(),
        created_at: new Date().toISOString(),
      });

    if (dbError) {
      // Unique constraint violation = already subscribed
      if (dbError.code === '23505') {
        return NextResponse.json({
          success: true,
          message: "You're already subscribed!",
        });
      }
      console.error('[Subscribe] Database error:', dbError);
      throw new Error(`Failed to save subscriber: ${dbError.message}`);
    }

    return NextResponse.json({
      success: true,
      message: "You're in! We'll keep you posted.",
    });
  } catch (error) {
    console.error('[Subscribe] Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to subscribe';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
