-- 1. Add activation status flag to users
ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT true;

-- 2. Modify call_logs foreign key constraint to SET NULL on delete
ALTER TABLE call_logs ALTER COLUMN telecaller_id DROP NOT NULL;
ALTER TABLE call_logs DROP CONSTRAINT IF EXISTS call_logs_telecaller_id_fkey;
ALTER TABLE call_logs ADD CONSTRAINT call_logs_telecaller_id_fkey FOREIGN KEY (telecaller_id) REFERENCES users(id) ON DELETE SET NULL;
