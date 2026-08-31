-- SQL Migration for Dual Admission Path System (Online / Offline)
ALTER TABLE admission_applications
ADD COLUMN IF NOT EXISTS application_type TEXT DEFAULT 'online'
CHECK (application_type IN ('online', 'offline'));

ALTER TABLE admission_applications
ADD COLUMN IF NOT EXISTS offline_form_url TEXT;

ALTER TABLE admission_applications
ADD COLUMN IF NOT EXISTS marital_status TEXT;

ALTER TABLE admission_applications
ADD COLUMN IF NOT EXISTS identification_mark TEXT;

ALTER TABLE admission_applications
ADD COLUMN IF NOT EXISTS father_contact TEXT;

ALTER TABLE admission_applications
ADD COLUMN IF NOT EXISTS payment_option TEXT;

ALTER TABLE admission_applications
ADD COLUMN IF NOT EXISTS payment_amount TEXT;

ALTER TABLE admission_applications
ADD COLUMN IF NOT EXISTS dd_number TEXT;

ALTER TABLE admission_applications
ADD COLUMN IF NOT EXISTS dd_date TEXT;

ALTER TABLE admission_applications
ADD COLUMN IF NOT EXISTS bank_name TEXT;
