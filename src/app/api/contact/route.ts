import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { sendContactFormEmail } from '@/lib/services/email';

interface ContactRequestBody {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ContactRequestBody;

    const { name, email, subject, message } = body;

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    if (!email || !email.trim()) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Insert into contact_submissions table
    const { error: dbError } = await supabaseAdmin
      .from('contact_submissions')
      .insert({
        name: name.trim(),
        email: email.trim(),
        subject: subject?.trim() || null,
        message: message.trim(),
        created_at: new Date().toISOString(),
      });

    if (dbError) {
      console.error('[Contact] Database insert error:', dbError);
      throw new Error(`Failed to save submission: ${dbError.message}`);
    }

    // Send notification email to admin
    await sendContactFormEmail({
      name: name.trim(),
      email: email.trim(),
      subject: subject?.trim() || '',
      message: message.trim(),
    });

    return NextResponse.json({
      success: true,
      message: 'Your message has been sent. We will get back to you soon!',
    });
  } catch (error) {
    console.error('[Contact] Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to submit contact form';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
