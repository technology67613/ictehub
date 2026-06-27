CREATE TABLE institute_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  duration TEXT DEFAULT '2 years',
  fees NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);
