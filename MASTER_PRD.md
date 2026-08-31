# ICTE HUB & BUDDHA COLLEGE OF NURSING — MASTER PRODUCT REQUIREMENT DOCUMENT (PRD)

**Version:** 3.0 (Master Audit & Production Readiness)
**Last Updated:** August 2026
**Status:** Complete Audit Fixes & hardened RBAC Specs

---

## 1. EXECUTIVE SUMMARY & PLATFORM OVERVIEW

### 1.1 Purpose & Dual Business Model
ICTE Hub / Buddha College of Nursing is a hybrid higher education recruitment and institution administration portal. The platform serves a dual revenue and enrollment model:
1. **Partner University Connection (Commission Model):** Connects prospective students with external online/offline partner colleges (e.g., BCA, BBA, MBA, BCom, B.Sc Nursing). The platform earns commission from partner institutions upon successful enrollment and fee payment.
2. **Internal Institute Degree Programs (Direct Enrollment):** If a student chooses internal programs (e.g., 2-year degree or diploma under Buddha College of Nursing / ICTE Hub), they are enrolled directly in the internal database with direct fee tracking and timeline management.

### 1.2 Core Target Audiences
- **Public Visitors / Prospective Applicants:** Browse partner colleges/courses, check lead application status, request free consultation, or submit direct online admission applications.
- **Telecallers / Counsellors:** Work assigned prospective leads (college leads + institute leads), record structured call logs/outcomes, and transition lead statuses through the counselling pipeline.
- **Students / Admitted Applicants:** Access dedicated student dashboard to view application details, track timeline progression, upload mandatory admission documents, and view/download digital ID cards.
- **Admins / Portal Managers:** Full operational control over leads, institute inquiries, team members (telecallers/staff), partner colleges, commissions, course offerings, visitor analytics ("hot leads"), and partner institution proposals.

---

## 2. SYSTEM ARCHITECTURE & TECH STACK

- **Frontend Framework:** React 18 + Vite (Tailwind CSS v4 using `@tailwindcss/vite`, `react-router-dom` v6, `lucide-react` icons).
- **Backend API:** Node.js + Express REST API hosted on Render.
- **Database Layer:** Supabase PostgreSQL Database (accessed via `@supabase/supabase-js` service client).
- **Authentication:** Custom JWT-based authentication (`jsonwebtoken` + `bcryptjs`).
- **File Storage:** Supabase Storage (Buckets: `college-logos`, `profile-pictures`, `admission-documents`).
- **Environment & Configuration:** Centralized API resolution (`client/src/utils/api.js`) using `import.meta.env.VITE_API_BASE_URL`.

---

## 3. SECURITY & ACCESS CONTROL MATRIX (RBAC)

| Role | Permitted Actions & Scope | API Authorization Rules |
|---|---|---|
| **Public / Guest** | Browse colleges & courses, submit partner inquiry, submit institute lead, submit online admission application, check status by phone+name | No JWT required. Strict rate limits (10-20 requests/15m). Sensitive fields sanitized on responses. |
| **Student** | Access `/student/dashboard` & `/student/profile`. Read own application, upload/view own documents, access digital ID card | `protect` + `authorize('student')`. Server matches `req.user.id` against `admission_applications.student_user_id` or linked `leads.student_user_id`. |
| **Telecaller** | Access `/telecaller`. View & work *assigned* college leads (`/leads/my`) and assigned institute leads (`/institute-leads/my`). Create call logs for assigned leads | `protect` + `authorize('telecaller')`. Strict assignment check (`assigned_telecaller_id === req.user.id`). Forbidden from `/admin/*`. |
| **Admin** | Full system access across all `/admin/*` routes, team user management, fee & commission edits, college management, full lead & document overrides | `protect` + `authorize('admin')`. Full read/write access. Safeguard prevents deleting the last active admin. |

---

## 4. DETAILED SPECIFICATIONS: ADMIN DASHBOARD

### 4.1 Leads & Admissions Management (`/admin` & `/admin/admissions`)
- **Leads Overview:** Filter by status (`new`, `contacted`, `interested`, `not-interested`, `enrolled-college`, `enrolled-institute`), search by student name/phone.
- **Reassignment Engine:** Admins can manually override telecaller assignments for any lead.
- **Relational Application Review:** Inspect full multi-step application details, academic qualifications, payment options, and document verification statuses.
- **Roll Number & Batch Generation:** Assign roll numbers, batches, and academic session tags to confirmed students.

### 4.2 Institute Leads (`/admin/institute-leads`)
- Track inquiries submitted for internal 2-year degree/diploma programs.
- Real-time status update controls (`new` -> `contacted` -> `interested` -> `enrolled`).

### 4.3 Colleges & Courses (`/admin/colleges` & `/admin/institute-courses`)
- Add, edit, or archive partner colleges (mode: Online/Offline, commission percentage, structure, logo upload).
- Manage internal degree programs (duration, fee structures, program descriptions).

### 4.4 Team & Commission Operations (`/admin/team` & `/admin/commissions`)
- **Team Management:** Admin-only account creation for telecallers and staff. Toggle account status (`is_active`). Inspect activity metrics (assigned lead count, total call logs).
- **Commission Tracking:** Automatic pending commission generation when a lead transitions to `enrolled-college`. Admins enter received amount and update payment status (`pending` -> `received`).

### 4.5 Visitor Insights / Hot Leads (`/admin/hot-leads`)
- Analyzes anonymous visitor sessions tracked via `POST /visitors/track`.
- Ranks unconverted sessions by total college card views and mode filter interactions to surface high-intent browsing patterns.

### 4.6 Partner Inquiries (`/admin/partner-inquiries`)
- Displays institutional partnership proposals submitted via `/partner-with-us`.
- Modal detail view with full contact breakdown, date timestamp, and message content.

---

## 5. DETAILED SPECIFICATIONS: STUDENT DASHBOARD

### 5.1 Onboarding & Default Credentials
- Student accounts are created upon lead enrollment or admission submission.
- **Default Student Login:** Email: `[phone]@student.ictehub` | Password: Date of Birth (`DDMMYYYY`).

### 5.2 Application Status & Timeline Workflow
Interactive visual progress bar with status checkpoints:
1. `Submitted` (Form received)
2. `Under Review` (Documents & qualifications checked)
3. `Approved / Admitted` (Seats confirmed)
4. `Enrolled` (Batch & Roll Number assigned)

### 5.3 Document Vault & Verification Status
- Upload interface for mandatory documents (`passport_photo`, `marksheet_10th`, `marksheet_12th`, `id_proof`).
- Verification badge indicator (`Pending Verification`, `Verified`, `Action Required / Rejected`) with reviewer notes.

### 5.4 Digital Student ID Card (`/student/dashboard` & `/student/profile`)
- Dynamic rendering of official Buddha College of Nursing ID card.
- Displays student photograph, roll number, course, batch, academic session, emergency contacts, and official college seal.

---

## 6. DETAILED SPECIFICATIONS: TELECALLER CONNECTIONS & LOGICS

### 6.1 Weighted Workload Auto-Assignment Engine (`server/utils/autoAssignTelecaller.js`)
When a new lead (college or institute) is submitted publicly:
1. Query all active telecallers (`role = 'telecaller'` AND `is_active = true`).
2. Calculate current workload weight score per telecaller:
   - `new` = 1 point
   - `contacted` = 2 points
   - `interested` = 3 points
   - `not-interested` / `enrolled` = 0 points
3. Auto-assign lead to telecaller with the lowest total workload score (random tie-breaker).
4. Mark `auto_assigned = true` on the lead record.

### 6.2 Telecaller Workstation (`/telecaller`)
- **Dual Queue Support:** Separate tabs for **College Leads** (`GET /leads/my`) and **Institute Leads** (`GET /institute-leads/my`).
- **Quick Actions:** One-click WhatsApp message trigger (`wa.me/[phone]`), direct call trigger (`tel:[phone]`), and email draft launcher.
- **Activity Logging:** Record call outcomes (`interested`, `not-interested`, `call-back-later`, `no-answer`) with timestamped notes (`POST /call-logs`).
- **Lead Status Transition:** Update lead status directly from drawer. Transitioning to `enrolled-college` triggers automatic commission entry creation; transitioning to `enrolled-institute` prompts internal course selection.

---

## 7. DATABASE SCHEMA REFERENCE (Supabase PostgreSQL)

```sql
-- users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin', 'telecaller', 'student')) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  profile_picture_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- leads table
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  interested_college_ids UUID[],
  status TEXT CHECK (status IN ('new', 'contacted', 'interested', 'not-interested', 'enrolled-college', 'enrolled-institute')) DEFAULT 'new',
  assigned_telecaller_id UUID REFERENCES users(id) ON DELETE SET NULL,
  auto_assigned BOOLEAN DEFAULT false,
  enrolled_institute_course_id UUID,
  student_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- institute_leads table
CREATE TABLE institute_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  interested_course_id UUID,
  message TEXT,
  status TEXT CHECK (status IN ('new', 'contacted', 'interested', 'not-interested', 'enrolled')) DEFAULT 'new',
  assigned_telecaller_id UUID REFERENCES users(id) ON DELETE SET NULL,
  auto_assigned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- admission_applications table
CREATE TABLE admission_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  student_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  primary_mobile TEXT NOT NULL,
  course TEXT,
  status TEXT DEFAULT 'submitted',
  application_status TEXT,
  batch TEXT,
  roll_number TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- call_logs table
CREATE TABLE call_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  telecaller_id UUID REFERENCES users(id) ON DELETE SET NULL,
  outcome TEXT CHECK (outcome IN ('interested', 'not-interested', 'call-back-later', 'no-answer')) NOT NULL,
  notes TEXT,
  call_date TIMESTAMPTZ DEFAULT now()
);
```

---

## 8. AUDIT REMEDIATION SUMMARY & VERIFICATION

1. **Unimported Component Fixed:** Imported `X` from `lucide-react` in `AdminPartnerInquiries.jsx` preventing modal close crashes.
2. **Directory Retry Handler Repaired:** Extracted `loadAllColleges` in `CollegeBrowse.jsx` to ensure retry button correctly refetches college catalog.
3. **API Base URL Centralized:** Created `client/src/utils/api.js` using `import.meta.env.VITE_API_BASE_URL` and updated all 20+ client components.
4. **Backend Authorization Hardened:** Enforced strict ownership/assigned telecaller checks on `PUT /admission-applications/:id`, `GET /admission-applications/:id`, `GET /admission-applications/qualifications/:id`, and `PUT /admission-documents/:id`.
5. **Upload Authentication Secured:** Restricted `POST /upload` by enforcing valid JWT authentication for admission documents and profile pictures, and admin role for college logos.
6. **Telecaller Institute Queue Connected:** Added `GET /institute-leads/my` and integrated institute lead management directly into `TelecallerDashboard.jsx`.
