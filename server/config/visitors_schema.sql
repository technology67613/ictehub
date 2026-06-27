CREATE TABLE visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  viewed_colleges JSONB DEFAULT '[]'::jsonb,
  mode_filters_used TEXT[] DEFAULT '{}'::text[],
  first_seen_at TIMESTAMPTZ DEFAULT now(),
  last_seen_at TIMESTAMPTZ DEFAULT now(),
  converted_to_lead_id UUID REFERENCES leads(id) ON DELETE SET NULL
);
