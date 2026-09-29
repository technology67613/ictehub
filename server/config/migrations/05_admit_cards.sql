CREATE TABLE IF NOT EXISTS admit_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  application_id UUID REFERENCES admission_applications(id) ON DELETE SET NULL,
  academic_session TEXT,
  exam_name TEXT,
  exam_date DATE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admit_cards_student_user_id ON admit_cards(student_user_id);
