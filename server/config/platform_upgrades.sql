-- 1. Create partner_inquiries table
CREATE TABLE IF NOT EXISTS partner_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Add source column to leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'direct';
