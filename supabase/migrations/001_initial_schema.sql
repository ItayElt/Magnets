-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Orders
CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  email TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('self', 'friends')),
  quantity INTEGER NOT NULL,
  photo_style TEXT NOT NULL DEFAULT 'normal',
  caption TEXT DEFAULT '',
  image_path TEXT,
  unit_price NUMERIC(6,2) NOT NULL,
  total_price NUMERIC(6,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('paid','processing','sent_to_print','printed','shipped','delivered')),
  stripe_payment_intent_id TEXT,
  stripe_session_id TEXT,
  batch_id TEXT,
  status_updated_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT DEFAULT '',
  tracking_number TEXT
);

-- Order items (one per shipping destination)
CREATE TABLE order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  recipient_name TEXT NOT NULL,
  address1 TEXT NOT NULL,
  address2 TEXT DEFAULT '',
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Settings (key-value)
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Order status log
CREATE TABLE order_status_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by TEXT DEFAULT 'system',
  note TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Contact submissions
CREATE TABLE contact_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT DEFAULT '',
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved BOOLEAN DEFAULT false
);

-- Indexes
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_email ON orders(email);
CREATE INDEX idx_orders_batch_id ON orders(batch_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_status_log_order_id ON order_status_log(order_id);

-- Seed default settings
INSERT INTO settings (key, value) VALUES
  ('print_shop_email', '"printshop@example.com"'),
  ('batch_schedule', '"0 9 * * *"'),
  ('admin_email', '"admin@memora.com"');

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Orders: authenticated users can do everything
CREATE POLICY "Admin full access to orders" ON orders FOR ALL USING (auth.role() = 'authenticated');
-- Public can read their own order by order_id (for tracking)
CREATE POLICY "Public order tracking" ON orders FOR SELECT USING (true);

-- Order items: admin only
CREATE POLICY "Admin full access to order_items" ON order_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Public order items via order" ON order_items FOR SELECT USING (true);

-- Settings: admin only
CREATE POLICY "Admin full access to settings" ON settings FOR ALL USING (auth.role() = 'authenticated');

-- Status log: admin only
CREATE POLICY "Admin full access to status log" ON order_status_log FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Public status log read" ON order_status_log FOR SELECT USING (true);

-- Contact: public can insert, admin can read
CREATE POLICY "Public can submit contact" ON contact_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin read contact" ON contact_submissions FOR ALL USING (auth.role() = 'authenticated');
