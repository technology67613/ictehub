-- ==============================================================================
-- SUPABASE MIGRATION & SAMPLE STUDENT SEED DATA
-- Run this in your Supabase Project -> SQL Editor
-- ==============================================================================

-- 1. Apply Schema Migrations
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'telecaller', 'student'));

ALTER TABLE leads ADD COLUMN IF NOT EXISTS access_token UUID DEFAULT gen_random_uuid();
ALTER TABLE leads ADD COLUMN IF NOT EXISTS student_user_id UUID REFERENCES users(id) ON DELETE SET NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_access_token ON leads(access_token);

-- 2. Insert / Seed Sample Student Account
-- Login Credentials:
--   Phone:    9876543210
--   Password: 9876543210
DO $$
DECLARE
    v_user_id UUID;
    v_lead_id UUID;
BEGIN
    -- Enable pgcrypto if not enabled
    CREATE EXTENSION IF NOT EXISTS pgcrypto;

    -- Remove previous test record with this phone to avoid duplication
    DELETE FROM leads WHERE phone = '9876543210';
    DELETE FROM users WHERE email = '9876543210@student.ictehub';

    -- Insert student user account (password: 9876543210)
    INSERT INTO users (
        name,
        email,
        password_hash,
        role,
        is_active,
        created_at
    )
    VALUES (
        'Priya Sharma',
        '9876543210@student.ictehub',
        crypt('9876543210', gen_salt('bf', 10)),
        'student',
        true,
        NOW()
    )
    RETURNING id INTO v_user_id;

    -- Insert sample admission lead linked to student
    INSERT INTO leads (
        name,
        phone,
        email,
        interested_college_ids,
        source,
        status,
        student_user_id,
        access_token,
        admission_form_data,
        created_at
    )
    VALUES (
        'Priya Sharma',
        '9876543210',
        'priya.sharma@example.com',
        '{}',
        'admission-portal',
        'contacted', -- Status: 'new', 'contacted', 'interested', 'enrolled-college'
        v_user_id,
        gen_random_uuid(),
        '{
            "program_type": "Nursing",
            "course": "B.Sc Nursing",
            "specialization": "General Nursing",
            "preferred_college_type": "Offline / Regular",
            "academic_session": "2025-26",
            "category": "General",
            "full_name": "Priya Sharma",
            "father_name": "Rajesh Sharma",
            "mother_name": "Sunita Sharma",
            "dob": "2004-06-15",
            "gender": "Female",
            "nationality": "Indian",
            "blood_group": "B+",
            "aadhaar_number": "548912348765",
            "primary_mobile": "9876543210",
            "alternate_mobile": "9876543211",
            "email": "priya.sharma@example.com",
            "guardian_name": "Rajesh Sharma",
            "guardian_relationship": "Father",
            "guardian_mobile": "9876543211",
            "hostel_required": "Yes",
            "hostel_location": "Main Campus Hostel",
            "permanent_address": {
                "address_line_1": "Flat 402, Sunshine Heights, Civil Lines",
                "city": "Nagpur",
                "district": "Nagpur",
                "state": "Maharashtra",
                "pincode": "440001"
            },
            "qualifications": [
                {
                    "id": "q10",
                    "level": "Class 10",
                    "board": "CBSE",
                    "institution": "Kendriya Vidyalaya No. 1",
                    "year": "2020",
                    "percentage": "88.4",
                    "division": "First"
                },
                {
                    "id": "q12",
                    "level": "Class 12",
                    "board": "Maharashtra State Board",
                    "institution": "St. Xavier Junior College",
                    "year": "2022",
                    "percentage": "85.2",
                    "division": "First"
                }
            ]
        }'::jsonb,
        NOW() - INTERVAL '2 days'
    )
    RETURNING id INTO v_lead_id;

    -- Insert sample uploaded admission documents
    INSERT INTO admission_documents (
        lead_id,
        document_type,
        document_name,
        file_url,
        file_size,
        uploaded_at
    )
    VALUES
    (
        v_lead_id,
        'marksheet_10th',
        'Priya_Sharma_10th_Marksheet.pdf',
        'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop&q=80',
        145000,
        NOW() - INTERVAL '2 days'
    ),
    (
        v_lead_id,
        'marksheet_12th',
        'Priya_Sharma_12th_Marksheet.pdf',
        'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop&q=80',
        168000,
        NOW() - INTERVAL '2 days'
    ),
    (
        v_lead_id,
        'id_proof',
        'Aadhaar_Card_Front_Back.pdf',
        'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop&q=80',
        220000,
        NOW() - INTERVAL '2 days'
    );

    -- Insert sample counselor interaction log for timeline
    INSERT INTO call_logs (
        lead_id,
        telecaller_id,
        outcome,
        notes,
        call_date
    )
    VALUES (
        v_lead_id,
        NULL,
        'interested',
        'Verified 10th and 12th marks. Student is interested in B.Sc Nursing and hostel facility.',
        NOW() - INTERVAL '1 day'
    );

    RAISE NOTICE 'Sample student account created successfully! User ID: %, Lead ID: %', v_user_id, v_lead_id;
END $$;
