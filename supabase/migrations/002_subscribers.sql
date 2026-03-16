-- Newsletter subscribers
CREATE TABLE subscribers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_subscribers_email ON subscribers(email);

ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe (public insert)
CREATE POLICY "Public can subscribe" ON subscribers FOR INSERT WITH CHECK (true);

-- Admin can read/manage all subscribers
CREATE POLICY "Admin full access to subscribers" ON subscribers FOR ALL USING (auth.role() = 'authenticated');
