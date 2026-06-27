CREATE TABLE call_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  telecaller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  outcome TEXT NOT NULL CHECK (outcome IN ('interested', 'not-interested', 'call-back-later', 'no-answer')),
  notes TEXT,
  call_date TIMESTAMPTZ NOT NULL DEFAULT now()
);
