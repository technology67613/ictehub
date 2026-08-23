-- Migration: Add Student Role and Lead Accounts
-- Description: Adds 'student' role support to users table, adds access_token and student_user_id to leads table.

-- 1. Add student role support to users table
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'telecaller', 'student'));

-- 2. Add access_token and student_user_id columns to leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS access_token UUID DEFAULT gen_random_uuid();
ALTER TABLE leads ADD COLUMN IF NOT EXISTS student_user_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- 3. Create unique index on leads(access_token)
CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_access_token ON leads(access_token);
