import { Resend } from 'resend';
import type { OrderRow, OrderItemRow } from './orders';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? '');
}

const FROM_EMAIL = 'Memora <onboarding@resend.dev>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PrintBatchOrder extends OrderRow {
  items: OrderItemRow[];
}

interface ContactSubmission {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// ---------------------------------------------------------------------------
// Helper — status display label
// ---------------------------------------------------------------------------

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    paid: 'Paid',
    processing: 'Processing',
    sent_to_print: 'Sent to Print',
    printed: 'Printed',
    shipped: 'Shipped',
    delivered: 'Delivered',
    refunded: 'Refunded',
  };
  return labels[status] ?? status;
}

// ---------------------------------------------------------------------------
// sendPrintShopBatchEmail — HTML table of orders for print shop
// ---------------------------------------------------------------------------

export async function sendPrintShopBatchEmail(
  orders: PrintBatchOrder[],
  printShopEmail: string
) {
  const rows = orders
    .map(
      (order) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${order.order_id}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${order.quantity}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${order.photo_style}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${order.caption || '—'}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">
          ${
            order.image_path
              ? `<a href="${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/magnet-images/${order.image_path}">View Image</a>`
              : '—'
          }
        </td>
        <td style="padding: 8px; border: 1px solid #ddd;">
          ${order.items
            .map(
              (item) =>
                `${item.recipient_name}<br/>${item.address1}${item.address2 ? ', ' + item.address2 : ''}<br/>${item.city}, ${item.state} ${item.zip}`
            )
            .join('<hr style="margin: 4px 0;"/>')}
        </td>
      </tr>`
    )
    .join('');

  const html = `
    <h2>Memora Print Batch — ${new Date().toLocaleDateString()}</h2>
    <p>Batch contains <strong>${orders.length}</strong> order(s), <strong>${orders.reduce((sum, o) => sum + o.quantity, 0)}</strong> total magnets.</p>
    <table style="border-collapse: collapse; width: 100%; font-family: sans-serif; font-size: 14px;">
      <thead>
        <tr style="background: #f5f0eb;">
          <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Order ID</th>
          <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Qty</th>
          <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Style</th>
          <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Caption</th>
          <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Image</th>
          <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Ship To</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
    <p style="margin-top: 16px; color: #666;">
      Manage orders: <a href="${APP_URL}/admin/orders">${APP_URL}/admin/orders</a>
    </p>
  `;

  const { error } = await getResend().emails.send({
    from: FROM_EMAIL,
    to: printShopEmail,
    subject: `Memora Print Batch — ${orders.length} order(s) — ${new Date().toLocaleDateString()}`,
    html,
  });

  if (error) throw new Error(`Failed to send print shop email: ${error.message}`);
}

// ---------------------------------------------------------------------------
// sendOrderConfirmationEmail — confirmation to customer
// ---------------------------------------------------------------------------

export async function sendOrderConfirmationEmail(
  order: OrderRow,
  customerEmail: string
) {
  const html = `
    <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
      <h1 style="color: #78350f;">Thank you for your order!</h1>
      <p>Your custom magnets are on the way. Here are your order details:</p>
      <table style="width: 100%; margin: 16px 0; font-size: 14px;">
        <tr><td style="padding: 4px 0; color: #666;">Order ID</td><td style="padding: 4px 0; font-weight: 600;">${order.order_id}</td></tr>
        <tr><td style="padding: 4px 0; color: #666;">Quantity</td><td style="padding: 4px 0;">${order.quantity} magnet(s)</td></tr>
        <tr><td style="padding: 4px 0; color: #666;">Photo Style</td><td style="padding: 4px 0;">${order.photo_style}</td></tr>
        <tr><td style="padding: 4px 0; color: #666;">Total</td><td style="padding: 4px 0; font-weight: 600;">$${Number(order.total_price).toFixed(2)}</td></tr>
      </table>
      <div style="margin-top: 24px; background: #f5f0eb; padding: 16px 20px; border-radius: 8px;">
        <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #44403c;">Need help?</p>
        <p style="margin: 0; font-size: 13px; color: #78716c;">
          If you have any questions about your order, contact us at
          <a href="mailto:support@memoramagnet.shop" style="color: #78350f; text-decoration: none; font-weight: 500;">support@memoramagnet.shop</a>
          and we'll get back to you within 24 hours.
        </p>
      </div>
      <p style="margin-top: 24px; font-size: 13px; color: #999; text-align: center;">
        <a href="${APP_URL}" style="color: #78350f; text-decoration: none;">memoramagnet.shop</a>
      </p>
    </div>
  `;

  const { error } = await getResend().emails.send({
    from: FROM_EMAIL,
    to: customerEmail,
    subject: `Memora — Order Confirmed (${order.order_id})`,
    html,
  });

  if (error) throw new Error(`Failed to send confirmation email: ${error.message}`);
}

// ---------------------------------------------------------------------------
// sendStatusUpdateEmail — status change notification to customer
// ---------------------------------------------------------------------------

export async function sendStatusUpdateEmail(
  order: OrderRow,
  customerEmail: string,
  newStatus: string
) {
  const trackingSection = order.tracking_number
    ? `<p><strong>Tracking Number:</strong> ${order.tracking_number}</p>`
    : '';

  const html = `
    <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
      <h1 style="color: #78350f;">Order Update</h1>
      <p>Your order <strong>${order.order_id}</strong> has been updated:</p>
      <div style="background: #f5f0eb; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p style="margin: 0; font-size: 18px; font-weight: 600;">
          Status: ${statusLabel(newStatus)}
        </p>
        ${trackingSection}
      </div>
      <div style="margin-top: 16px; background: #f5f0eb; padding: 16px 20px; border-radius: 8px;">
        <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #44403c;">Need help?</p>
        <p style="margin: 0; font-size: 13px; color: #78716c;">
          Contact us at
          <a href="mailto:support@memoramagnet.shop" style="color: #78350f; text-decoration: none; font-weight: 500;">support@memoramagnet.shop</a>
        </p>
      </div>
    </div>
  `;

  const { error } = await getResend().emails.send({
    from: FROM_EMAIL,
    to: customerEmail,
    subject: `Memora — Order ${statusLabel(newStatus)} (${order.order_id})`,
    html,
  });

  if (error) throw new Error(`Failed to send status update email: ${error.message}`);
}

// ---------------------------------------------------------------------------
// sendRefundConfirmationEmail — refund notification to customer
// ---------------------------------------------------------------------------

export async function sendRefundConfirmationEmail(
  order: OrderRow,
  customerEmail: string,
  refundId: string
) {
  const html = `
    <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
      <h1 style="color: #78350f;">Your Refund Has Been Processed</h1>
      <p>We've processed a full refund for your order. Here are the details:</p>
      <table style="width: 100%; margin: 16px 0; font-size: 14px;">
        <tr><td style="padding: 4px 0; color: #666;">Order ID</td><td style="padding: 4px 0; font-weight: 600;">${order.order_id}</td></tr>
        <tr><td style="padding: 4px 0; color: #666;">Refund Amount</td><td style="padding: 4px 0; font-weight: 600;">$${Number(order.total_price).toFixed(2)}</td></tr>
        <tr><td style="padding: 4px 0; color: #666;">Refund ID</td><td style="padding: 4px 0; font-family: monospace; font-size: 12px;">${refundId}</td></tr>
      </table>
      <div style="background: #fef2f2; padding: 16px 20px; border-radius: 8px; margin: 16px 0; border: 1px solid #fecaca;">
        <p style="margin: 0; font-size: 14px; color: #991b1b;">
          The refund will appear on your original payment method within 5\u201310 business days, depending on your bank.
        </p>
      </div>
      <div style="margin-top: 24px; background: #f5f0eb; padding: 16px 20px; border-radius: 8px;">
        <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #44403c;">Questions?</p>
        <p style="margin: 0; font-size: 13px; color: #78716c;">
          If you have any questions about your refund, contact us at
          <a href="mailto:support@memoramagnet.shop" style="color: #78350f; text-decoration: none; font-weight: 500;">support@memoramagnet.shop</a>
        </p>
      </div>
      <p style="margin-top: 24px; font-size: 13px; color: #999; text-align: center;">
        <a href="${APP_URL}" style="color: #78350f; text-decoration: none;">memoramagnet.shop</a>
      </p>
    </div>
  `;

  const { error } = await getResend().emails.send({
    from: FROM_EMAIL,
    to: customerEmail,
    subject: `Memora — Refund Processed (${order.order_id})`,
    html,
  });

  if (error) throw new Error(`Failed to send refund email: ${error.message}`);
}

// ---------------------------------------------------------------------------
// sendContactFormEmail — forward contact submission to admin
// ---------------------------------------------------------------------------

export async function sendContactFormEmail(submission: ContactSubmission) {
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@memora.com';

  const html = `
    <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
      <h2 style="color: #78350f;">New Contact Form Submission</h2>
      <table style="width: 100%; font-size: 14px;">
        <tr><td style="padding: 4px 0; color: #666; width: 80px;">Name</td><td style="padding: 4px 0;">${submission.name}</td></tr>
        <tr><td style="padding: 4px 0; color: #666;">Email</td><td style="padding: 4px 0;"><a href="mailto:${submission.email}">${submission.email}</a></td></tr>
        <tr><td style="padding: 4px 0; color: #666;">Subject</td><td style="padding: 4px 0;">${submission.subject || '—'}</td></tr>
      </table>
      <div style="background: #f5f0eb; padding: 16px; border-radius: 8px; margin-top: 16px;">
        <p style="margin: 0; white-space: pre-wrap;">${submission.message}</p>
      </div>
      <p style="margin-top: 16px; font-size: 13px; color: #999;">
        Reply directly to <a href="mailto:${submission.email}">${submission.email}</a> to respond.
      </p>
    </div>
  `;

  const { error } = await getResend().emails.send({
    from: FROM_EMAIL,
    to: adminEmail,
    replyTo: submission.email,
    subject: `Memora Contact: ${submission.subject || 'New message'} — from ${submission.name}`,
    html,
  });

  if (error) throw new Error(`Failed to send contact form email: ${error.message}`);
}
