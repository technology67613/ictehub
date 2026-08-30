# ICTEHub --- Project Context & Status

## 🌐 Live URLs

-   **Frontend**: https://ictehub.vercel.app
-   **Backend**: https://ictehub.onrender.com
-   **GitHub**: https://github.com/technology67613/ictehub
-   **Supabase**: https://tswpsdsordafsmasnfuf.supabase.co

------------------------------------------------------------------------

## ✅ Fully Built & Working

### Infrastructure

-   React + Vite + Tailwind v4 frontend on Vercel
-   Node/Express backend on Render (free tier)
-   Supabase PostgreSQL database
-   GitHub auto-deploy to both Vercel and Render

### Auth & Users

-   JWT login (email + password)
-   3 roles: Admin, Telecaller, Student
-   Admin creates accounts (no public signup)
-   Pause/unpause accounts, delete with `"TYPE DELETE"` confirmation
-   Profile pictures via Supabase Storage

### Public Pages

-   Homepage with hero, featured colleges, course browser, programs
    section, CTA
-   College browsing with Online/Offline filter + search
-   Inquiry form (partner colleges) → creates Lead
-   Institute Inquiry form (own programs) → creates Institute Lead
-   Check Status page (phone + name lookup, no login needed)
-   Partner With Us form
-   Footer with legal pages (Privacy, Terms, Disclaimer)
-   Mobile hamburger sidebar nav

### Admission System

-   Full 6-step admission form at `/apply`
-   Document uploads (passport photo, marksheets, ID proof etc.) to
    Supabase Storage bucket `admission-documents`
-   Auto-creates student account on submission (DOB as default password
    in DDMMYYYY format)
-   `admission_applications` + `admission_qualifications` relational
    tables
-   `admission_documents` table with proper indexes

### Student Portal

-   Student login via phone number + DOB password
-   Student dashboard at `/student/dashboard` showing:
    -   Application status
    -   Course details
    -   Personal info
    -   Qualifications
    -   Documents
    -   Timeline
-   ID card generator (html2canvas + jsPDF) --- currently being rebuilt
    to match exact official design
-   Change password feature
-   Upload missing documents directly from dashboard

### Admin Panel

Sidebar layout at `/admin/*`

-   Leads (assign telecallers, view call history, drawer detail)
-   Institute Leads
-   Admissions (full application detail view with documents)
-   Colleges (add/edit/delete, logo upload)
-   Institute Courses (add/edit/delete)
-   Commissions (inline amount editing, mark received, CSV export)
-   Team (add users, pause/delete, view activity/call logs)
-   Hot Leads (anonymous visitor analytics)
-   Partner Inquiries

### Telecaller Dashboard

At `/telecaller`

-   Table + drawer layout
-   View assigned leads, update status
-   Log calls with outcome + notes
-   Call history per lead

### Tracking & Analytics

-   Anonymous visitor session tracking
-   College view counts per session
-   Mode filter tracking
-   Session linked to lead on form submit
-   Hot leads dashboard

### Security

-   Helmet middleware
-   Rate limiting (login, lead submission, visitor tracking)
-   File upload validation (2MB, JPEG/PNG/WebP only)
-   Cannot delete last active admin
-   Phone + name required for Check Status (prevents enumeration)
-   JWT secret rotated

------------------------------------------------------------------------

## ⚠️ Pending / In Progress

1.  **ID Card rebuild** --- currently sending Antigravity the exact
    official design (Buddha College of Nursing format) to rebuild
    `IDCard.jsx` pixel-perfect.
2.  **Student login test** --- test account `9876543210@student.ictehub`
    created via SQL but login untested yet.
3.  **UptimeRobot** --- never actually set up (prevents Render cold
    starts --- free, 3 minutes).
4.  **Domain** --- no custom domain yet (using `ictehub.vercel.app` /
    `ictehub.onrender.com`).

------------------------------------------------------------------------

## 📊 Database Tables (Supabase)

  Table                        Status
  ---------------------------- --------
  `users`                      ✅
  `colleges`                   ✅
  `institute_courses`          ✅
  `leads`                      ✅
  `institute_leads`            ✅
  `commissions`                ✅
  `call_logs`                  ✅
  `visitors`                   ✅
  `partner_inquiries`          ✅
  `admission_documents`        ✅
  `admission_applications`     ✅
  `admission_qualifications`   ✅

------------------------------------------------------------------------

## 🔑 Test Credentials

  Role                    Email/Phone                    Password
  ----------------------- ------------------------------ ----------------------
  Admin                   Check Supabase `users` table   Your chosen password
  Telecaller              `test@example.com`             `password123`
  Student (SQL-created)   `9876543210` (phone)           `password`

------------------------------------------------------------------------

## 🎯 Immediate Priority

### 1. Finish the ID Card rebuild

The current priority is to rebuild `IDCard.jsx` so the generated student
ID card matches the supplied official **Buddha College of Nursing**
reference as closely as technically possible.

Requirements:

-   Preserve the exact official layout.
-   Keep the 1536 × 1024 reference aspect ratio.
-   Match borders, spacing, typography, field positions, photo box,
    title bar, footer, and signatures.
-   Do not redesign or modernize the card.
-   Keep it responsive by scaling the complete card proportionally
    rather than rearranging fields.
-   Keep the card data-driven so student information, photo, candidate
    signature, and principal signature can be populated dynamically.
-   Preserve print/PDF generation through the existing `html2canvas` +
    `jsPDF` workflow.
-   Avoid changing unrelated parts of the application.

### Reference

The official reference is the uploaded Buddha College of Nursing ID card
image/SVG supplied in the project conversation.
