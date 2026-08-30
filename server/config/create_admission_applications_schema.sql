-- ==============================================================================
-- Schema Migration: Relational Schema for Admission Applications & Qualifications
-- ==============================================================================

-- 1. Main admission application table
CREATE TABLE IF NOT EXISTS admission_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  student_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  application_ref TEXT GENERATED ALWAYS AS ('BCN-' || UPPER(SUBSTRING(id::text, 1, 8))) STORED,
  
  -- Course Details (Step 1)
  program_type TEXT,
  course TEXT,
  specialization TEXT,
  preferred_college_type TEXT,
  academic_session TEXT,
  category TEXT,
  
  -- Personal Details (Step 2)
  full_name TEXT,
  father_name TEXT,
  mother_name TEXT,
  dob DATE,
  gender TEXT,
  nationality TEXT DEFAULT 'Indian',
  blood_group TEXT,
  aadhaar_number TEXT,
  photo_url TEXT,
  
  -- Contact & Address (Step 3)
  primary_mobile TEXT,
  alternate_mobile TEXT,
  email TEXT,
  perm_address_line1 TEXT,
  perm_address_line2 TEXT,
  perm_city TEXT,
  perm_district TEXT,
  perm_state TEXT,
  perm_pin TEXT,
  corr_same_as_perm BOOLEAN DEFAULT true,
  corr_address_line1 TEXT,
  corr_address_line2 TEXT,
  corr_city TEXT,
  corr_district TEXT,
  corr_state TEXT,
  corr_pin TEXT,
  
  -- Additional Info (Step 5)
  guardian_name TEXT,
  guardian_relationship TEXT,
  guardian_mobile TEXT,
  hostel_required BOOLEAN DEFAULT false,
  hostel_location TEXT,
  scholarship_required BOOLEAN DEFAULT false,
  heard_about_us TEXT,
  
  -- Status & Tracking
  status TEXT DEFAULT 'submitted',
  source TEXT DEFAULT 'direct',
  submitted_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Academic qualifications (one row per qualification)
CREATE TABLE IF NOT EXISTS admission_qualifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES admission_applications(id) ON DELETE CASCADE,
  examination TEXT,
  board_institution TEXT,
  year_of_passing TEXT,
  stream_subjects TEXT,
  percentage_cgpa TEXT,
  division TEXT,
  sort_order INTEGER DEFAULT 0
);

-- 3. Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_admission_applications_lead_id ON admission_applications(lead_id);
CREATE INDEX IF NOT EXISTS idx_admission_applications_student_user_id ON admission_applications(student_user_id);
CREATE INDEX IF NOT EXISTS idx_admission_applications_mobile ON admission_applications(primary_mobile);
CREATE INDEX IF NOT EXISTS idx_admission_qualifications_application_id ON admission_qualifications(application_id);
