CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  interested_college_ids UUID[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'interested', 'not-interested', 'enrolled-college', 'enrolled-institute')),
  assigned_telecaller_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
