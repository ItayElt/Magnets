import { supabaseAdmin } from '@/lib/supabase/admin';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface OrderFilters {
  status?: string;
  email?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface OrderRow {
  id: string;
  order_id: string;
  created_at: string;
  email: string;
  mode: 'self' | 'friends';
  quantity: number;
  photo_style: string;
  caption: string;
  image_path: string | null;
  unit_price: number;
  total_price: number;
  status: string;
  stripe_payment_intent_id: string | null;
  stripe_session_id: string | null;
  batch_id: string | null;
  status_updated_at: string;
  notes: string;
  tracking_number: string | null;
}

export interface OrderItemRow {
  id: string;
  order_id: string;
  recipient_name: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  quantity: number;
  created_at: string;
}

export interface StatusLogRow {
  id: string;
  order_id: string;
  old_status: string | null;
  new_status: string;
  changed_by: string;
  note: string;
  created_at: string;
}

export interface OrderWithDetails extends OrderRow {
  items: OrderItemRow[];
  status_log: StatusLogRow[];
}

export interface CreateOrderData {
  order_id: string;
  email: string;
  mode: 'self' | 'friends';
  quantity: number;
  photo_style: string;
  caption: string;
  image_path: string | null;
  unit_price: number;
  total_price: number;
  stripe_payment_intent_id?: string;
  stripe_session_id?: string;
  items: Omit<OrderItemRow, 'id' | 'order_id' | 'created_at'>[];
}

export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  countsByStatus: Record<string, number>;
  revenueToday: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
  ordersToday: number;
}

// ---------------------------------------------------------------------------
// getOrders — paginated, filterable list
// ---------------------------------------------------------------------------

export async function getOrders(filters: OrderFilters = {}) {
  const { status, email, dateFrom, dateTo, page = 1, limit = 20 } = filters;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabaseAdmin
    .from('orders')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (status) {
    query = query.eq('status', status);
  }
  if (email) {
    query = query.ilike('email', `%${email}%`);
  }
  if (dateFrom) {
    query = query.gte('created_at', dateFrom);
  }
  if (dateTo) {
    query = query.lte('created_at', dateTo);
  }

  const { data, error, count } = await query;

  if (error) throw new Error(`Failed to fetch orders: ${error.message}`);

  return {
    orders: (data ?? []) as OrderRow[],
    total: count ?? 0,
    page,
    limit,
    totalPages: Math.ceil((count ?? 0) / limit),
  };
}

// ---------------------------------------------------------------------------
// getOrderById — single order with items and status log
// ---------------------------------------------------------------------------

export async function getOrderById(orderId: string): Promise<OrderWithDetails | null> {
  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('order_id', orderId)
    .single();

  if (error || !order) return null;

  const [itemsResult, logResult] = await Promise.all([
    supabaseAdmin
      .from('order_items')
      .select('*')
      .eq('order_id', order.id)
      .order('created_at', { ascending: true }),
    supabaseAdmin
      .from('order_status_log')
      .select('*')
      .eq('order_id', order.id)
      .order('created_at', { ascending: true }),
  ]);

  return {
    ...(order as OrderRow),
    items: (itemsResult.data ?? []) as OrderItemRow[],
    status_log: (logResult.data ?? []) as StatusLogRow[],
  };
}

// ---------------------------------------------------------------------------
// updateOrderStatus — update status + insert log entry
// ---------------------------------------------------------------------------

export async function updateOrderStatus(
  orderId: string,
  newStatus: string,
  note?: string
) {
  // Get current order to capture old status
  const { data: current, error: fetchError } = await supabaseAdmin
    .from('orders')
    .select('id, status')
    .eq('order_id', orderId)
    .single();

  if (fetchError || !current) {
    throw new Error(`Order not found: ${orderId}`);
  }

  const oldStatus = current.status;

  // Update the order
  const { error: updateError } = await supabaseAdmin
    .from('orders')
    .update({
      status: newStatus,
      status_updated_at: new Date().toISOString(),
    })
    .eq('id', current.id);

  if (updateError) throw new Error(`Failed to update status: ${updateError.message}`);

  // Insert status log entry
  const { error: logError } = await supabaseAdmin
    .from('order_status_log')
    .insert({
      order_id: current.id,
      old_status: oldStatus,
      new_status: newStatus,
      changed_by: 'admin',
      note: note ?? '',
    });

  if (logError) {
    console.error('Failed to insert status log:', logError.message);
  }

  return { oldStatus, newStatus };
}

// ---------------------------------------------------------------------------
// getOrderStats — aggregated dashboard stats
// ---------------------------------------------------------------------------

export async function getOrderStats(): Promise<OrderStats> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()).toISOString();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [allOrders, todayOrders, weekOrders, monthOrders] = await Promise.all([
    supabaseAdmin.from('orders').select('status, total_price'),
    supabaseAdmin.from('orders').select('status, total_price').gte('created_at', todayStart),
    supabaseAdmin.from('orders').select('status, total_price').gte('created_at', weekStart),
    supabaseAdmin.from('orders').select('status, total_price').gte('created_at', monthStart),
  ]);

  const orders = allOrders.data ?? [];
  const countsByStatus: Record<string, number> = {};
  let totalRevenue = 0;
  let refundedRevenue = 0;

  for (const order of orders) {
    countsByStatus[order.status] = (countsByStatus[order.status] ?? 0) + 1;
    const price = Number(order.total_price);
    totalRevenue += price;
    if (order.status === 'refunded') {
      refundedRevenue += price;
    }
  }

  // Net revenue = total minus refunded orders
  const netRevenue = totalRevenue - refundedRevenue;

  // Sum prices excluding refunded orders
  const sumPricesNet = (rows: { status: string; total_price: number }[] | null) =>
    (rows ?? [])
      .filter((r) => r.status !== 'refunded')
      .reduce((sum, r) => sum + Number(r.total_price), 0);

  const countNonRefunded = (rows: { status: string }[] | null) =>
    (rows ?? []).filter((r) => r.status !== 'refunded').length;

  return {
    totalOrders: orders.length,
    totalRevenue: netRevenue,
    countsByStatus,
    revenueToday: sumPricesNet(todayOrders.data),
    revenueThisWeek: sumPricesNet(weekOrders.data),
    revenueThisMonth: sumPricesNet(monthOrders.data),
    ordersToday: countNonRefunded(todayOrders.data),
  };
}

// ---------------------------------------------------------------------------
// getOrderByStripeSession — lookup by stripe checkout session ID
// ---------------------------------------------------------------------------

export async function getOrderByStripeSession(sessionId: string): Promise<OrderRow | null> {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('stripe_session_id', sessionId)
    .single();

  if (error || !data) return null;
  return data as OrderRow;
}

// ---------------------------------------------------------------------------
// createOrder — insert order + items in a single transaction
// ---------------------------------------------------------------------------

export async function createOrder(data: CreateOrderData): Promise<OrderRow> {
  const { items, ...orderData } = data;

  // Insert the order
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert(orderData)
    .select()
    .single();

  if (orderError || !order) {
    throw new Error(`Failed to create order: ${orderError?.message}`);
  }

  // Insert order items
  if (items.length > 0) {
    const itemRows = items.map((item) => ({
      ...item,
      order_id: order.id,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(itemRows);

    if (itemsError) {
      throw new Error(`Failed to create order items: ${itemsError.message}`);
    }
  }

  // Insert initial status log
  await supabaseAdmin.from('order_status_log').insert({
    order_id: order.id,
    old_status: null,
    new_status: 'paid',
    changed_by: 'system',
    note: 'Order created via Stripe checkout',
  });

  return order as OrderRow;
}

// ---------------------------------------------------------------------------
// Settings helpers
// ---------------------------------------------------------------------------

export async function getSettings(): Promise<Record<string, unknown>> {
  const { data, error } = await supabaseAdmin
    .from('settings')
    .select('key, value');

  if (error) throw new Error(`Failed to fetch settings: ${error.message}`);

  const settings: Record<string, unknown> = {};
  for (const row of data ?? []) {
    settings[row.key] = row.value;
  }
  return settings;
}

export async function updateSetting(key: string, value: unknown): Promise<void> {
  const { error } = await supabaseAdmin
    .from('settings')
    .upsert(
      { key, value: JSON.parse(JSON.stringify(value)), updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    );

  if (error) throw new Error(`Failed to update setting "${key}": ${error.message}`);
}

// ---------------------------------------------------------------------------
// getUnbatchedOrders — orders not yet assigned to a print batch
// ---------------------------------------------------------------------------

export async function getUnbatchedOrders(): Promise<OrderRow[]> {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .is('batch_id', null)
    .in('status', ['paid', 'processing'])
    .order('created_at', { ascending: true });

  if (error) throw new Error(`Failed to fetch unbatched orders: ${error.message}`);
  return (data ?? []) as OrderRow[];
}

// ---------------------------------------------------------------------------
// setBatchId — assign batch to orders and update status
// ---------------------------------------------------------------------------

export async function setBatchId(orderIds: string[], batchId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('orders')
    .update({
      batch_id: batchId,
      status: 'sent_to_print',
      status_updated_at: new Date().toISOString(),
    })
    .in('id', orderIds);

  if (error) throw new Error(`Failed to set batch ID: ${error.message}`);

  const logs = orderIds.map((id) => ({
    order_id: id,
    old_status: null,
    new_status: 'sent_to_print',
    changed_by: 'system',
    note: `Batch: ${batchId}`,
  }));

  await supabaseAdmin.from('order_status_log').insert(logs);
}

// ---------------------------------------------------------------------------
// getOrdersForExport — all orders, optionally filtered by status
// ---------------------------------------------------------------------------

export async function getOrdersForExport(status?: string) {
  let query = supabaseAdmin
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);

  const { data, error } = await query;

  if (error) throw new Error(`Failed to fetch orders for export: ${error.message}`);
  return (data ?? []) as (OrderRow & { order_items: OrderItemRow[] })[];
}

// ---------------------------------------------------------------------------
// updateOrderFields — update arbitrary order fields (notes, tracking, status)
// ---------------------------------------------------------------------------

export async function updateOrderFields(
  orderId: string,
  updates: { status?: string; notes?: string; tracking_number?: string }
): Promise<OrderRow> {
  const updateData: Record<string, unknown> = {};

  if (updates.notes !== undefined) updateData.notes = updates.notes;
  if (updates.tracking_number !== undefined) updateData.tracking_number = updates.tracking_number;
  if (updates.status) {
    updateData.status = updates.status;
    updateData.status_updated_at = new Date().toISOString();
  }

  const { data, error } = await supabaseAdmin
    .from('orders')
    .update(updateData)
    .eq('order_id', orderId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update order: ${error.message}`);

  // Log status change if applicable
  if (updates.status) {
    await supabaseAdmin.from('order_status_log').insert({
      order_id: data.id,
      old_status: null,
      new_status: updates.status,
      changed_by: 'admin',
      note: updates.notes ?? '',
    });
  }

  return data as OrderRow;
}
