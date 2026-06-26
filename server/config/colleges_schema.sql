CREATE TABLE colleges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('Online', 'Offline')),
  location TEXT,
  courses_offered TEXT[] NOT NULL DEFAULT '{}',
  commission_percent NUMERIC NOT NULL DEFAULT 0,
  commission_structure TEXT,
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
