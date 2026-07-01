# ICTEHUB — PROJECT BRIEF (UPDATED)
# Paste this entire document at the start of every AI chat session.
# Last updated: June 2026

---

## What this project is

A full-stack MERN-style web platform that connects students with universities/colleges, run by a small team (ICTE Hub) that earns commission from partner colleges when a student enrolls and pays. If a student doesn't want a partner college, they are enrolled in ICTE Hub's own 2-year online degree programs (no commission, internal enrollment). Telecallers call students who show interest and move them through the enrollment process. The platform also tracks anonymous visitor behavior to detect "hot leads" — visitors who browse heavily but haven't submitted an inquiry yet.

---

## Tech Stack (IMPORTANT — do not change these)

- **Frontend**: React + Vite + Tailwind CSS v4 (using @tailwindcss/vite plugin, NOT postcss config), react-router-dom for routing, lucide-react for all icons
- **Backend**: Node.js + Express
- **Database**: Supabase (PostgreSQL) — NOT MongoDB. All data goes through the Supabase JS client.
- **Auth**: JWT (jsonwebtoken + bcryptjs) — custom implementation, NOT Supabase Auth
- **File uploads**: multer + Supabase Storage (two public buckets: college-logos, profile-pictures)
- **Security**: helmet, express-rate-limit
- **Frontend hosting**: Vercel (ictehub.vercel.app) — auto-deploys from GitHub main branch
- **Backend hosting**: Render (ictehub.onrender.com) — auto-deploys from GitHub main branch
- **GitHub repo**: https://github.com/technology67613/ictehub

---

## Design System (follow exactly, do not invent new tokens)

- **Font**: Inter only (no serif fonts)
- **Primary blue**: `#1E40FF` (referred to as `academic-gold` in Tailwind theme — yes, the name is misleading, don't change it)
- **Light blue bg**: `#EEF2FF` (referred to as `section-light`)
- **Headline/text**: `#1A1A1A` (referred to as `academic-navy`)
- **Orange tag accent**: `#FFA94D` (referred to as `tag-accent`)
- **Page background**: `#FFFFFF`
- **Icons**: lucide-react only — always double-check imports before using any icon
- **Tailwind theme** defined in `client/src/index.css` under `@theme` block

---

## Project Structure

```
ictehub/
├── client/                  (React/Vite frontend)
│   ├── src/
│   │   ├── components/
│   │   │   ├── HomePage.jsx
│   │   │   ├── CollegeBrowse.jsx
│   │   │   ├── CollegeCard.jsx
│   │   │   ├── AuthPage.jsx          (login only — NO signup)
│   │   │   ├── InquiryForm.jsx       (partner college inquiry modal)
│   │   │   ├── InstituteInquiryForm.jsx (institute programs inquiry modal)
│   │   │   ├── CheckStatus.jsx       (public phone+name lead lookup)
│   │   │   ├── ProfilePage.jsx       (any logged-in user)
│   │   │   ├── Footer.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── AdminLayout.jsx       (sidebar layout for all /admin/* routes)
│   │   │   ├── AdminLeads.jsx
│   │   │   ├── AdminInstituteLeads.jsx
│   │   │   ├── AdminColleges.jsx
│   │   │   ├── AdminInstituteCourses.jsx
│   │   │   ├── AdminCommissions.jsx
│   │   │   ├── AdminUsers.jsx
│   │   │   ├── AdminHotLeads.jsx
│   │   │   ├── AdminPartnerInquiries.jsx
│   │   │   └── TelecallerDashboard.jsx
│   │   ├── utils/
│   │   │   └── tracking.js           (visitor session tracking helpers)
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css                 (Tailwind v4 + theme tokens)
│   ├── public/
│   ├── index.html                    (has page title, meta description, favicon)
│   └── vercel.json                   (SPA rewrite rules)
├── server/
│   ├── routes/
│   │   ├── auth.js                   (POST /auth/login ONLY — no signup)
│   │   ├── colleges.js
│   │   ├── leads.js
│   │   ├── institute-leads.js
│   │   ├── institute-courses.js
│   │   ├── commissions.js
│   │   ├── call_logs.js
│   │   ├── users.js
│   │   ├── visitors.js
│   │   └── upload.js
│   ├── middleware/
│   │   └── auth.js                   (JWT protect + authorize middleware)
│   ├── utils/
│   │   ├── autoAssignTelecaller.js   (weighted workload auto-assignment)
│   │   └── verifyRecaptcha.js        (unused — recaptcha was removed)
│   ├── config/                       (SQL schema files for reference only)
│   └── server.js
└── PRD.md                            (this file)
```

---

## URL Routes (react-router-dom)

### Public routes
- `/` → HomePage
- `/colleges` → CollegeBrowse
- `/check-status` → CheckStatus (hidden from nav when logged in)
- `/login` → AuthPage (standalone page, no site header/footer)

### Protected routes
- `/profile` → ProfilePage (any logged-in user)
- `/telecaller` → TelecallerDashboard (telecaller role only)
- `/admin` → AdminLeads (admin role only, uses AdminLayout sidebar)
- `/admin/institute-leads` → AdminInstituteLeads
- `/admin/colleges` → AdminColleges
- `/admin/institute-courses` → AdminInstituteCourses
- `/admin/commissions` → AdminCommissions
- `/admin/team` → AdminUsers
- `/admin/hot-leads` → AdminHotLeads
- `/admin/partner-inquiries` → AdminPartnerInquiries

---

## Database Schema (Supabase/PostgreSQL)

### users
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK, gen_random_uuid() |
| name | text | |
| email | text | unique, required |
| password_hash | text | bcrypt, required |
| role | text | enum: admin, telecaller |
| is_active | boolean | default true — false = login blocked |
| profile_picture_url | text | nullable, Supabase Storage URL |
| created_at | timestamptz | default now() |

### colleges
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| name | text | required |
| mode | text | enum: Online, Offline |
| location | text | nullable, required if Offline |
| courses_offered | text[] | array |
| commission_percent | numeric | |
| commission_structure | text | one-time or installments |
| contact_name | text | |
| contact_phone | text | |
| contact_email | text | |
| logo_url | text | nullable, Supabase Storage URL |
| created_at | timestamptz | |

### institute_courses
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| name | text | required |
| duration | text | default '2 years' |
| fees | numeric | |
| created_at | timestamptz | |

### leads
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| name | text | required |
| phone | text | required |
| email | text | nullable |
| interested_college_ids | uuid[] | array of college IDs |
| status | text | enum: new, contacted, interested, not-interested, enrolled-college, enrolled-institute |
| assigned_telecaller_id | uuid | nullable, references users |
| auto_assigned | boolean | default false — true if assigned by autoAssignTelecaller |
| enrolled_institute_course_id | uuid | nullable, references institute_courses |
| session_id | text | nullable, links to visitors table |
| source | text | default 'direct' — tracks UTM source |
| created_at | timestamptz | |

### institute_leads
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| name | text | required |
| phone | text | required |
| email | text | nullable |
| interested_course_id | uuid | references institute_courses |
| message | text | nullable |
| status | text | enum: new, contacted, interested, not-interested, enrolled |
| session_id | text | nullable |
| created_at | timestamptz | |

### commissions
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| lead_id | uuid | references leads |
| college_id | uuid | references colleges |
| amount | numeric | nullable — admin fills in later |
| status | text | enum: pending, received |
| created_at | timestamptz | |

### call_logs
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| lead_id | uuid | references leads, required |
| telecaller_id | uuid | references users, nullable (ON DELETE SET NULL) |
| outcome | text | enum: interested, not-interested, call-back-later, no-answer |
| notes | text | nullable |
| call_date | timestamptz | default now() |

### visitors
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| session_id | text | unique, required |
| viewed_colleges | jsonb | array of {college_id, college_name, count, last_viewed} |
| mode_filters_used | text[] | |
| first_seen_at | timestamptz | |
| last_seen_at | timestamptz | |
| converted_to_lead_id | uuid | nullable, references leads |

### partner_inquiries
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| college_name | text | required |
| contact_person | text | |
| phone | text | |
| email | text | |
| message | text | |
| created_at | timestamptz | |

---

## API Routes

### Auth (no signup — admin creates accounts via POST /users)
- `POST /auth/login` — public, rate limited (10/15min per IP)

### Colleges
- `GET /colleges` — public, supports ?mode=Online|Offline filter
- `POST /colleges` — admin only
- `PUT /colleges/:id` — admin only
- `DELETE /colleges/:id` — admin only

### Institute Courses
- `GET /institute-courses` — public
- `POST /institute-courses` — admin only
- `PUT /institute-courses/:id` — admin only
- `DELETE /institute-courses/:id` — admin only

### Leads
- `POST /leads` — public, rate limited (20/15min), auto-assigns telecaller via autoAssignTelecaller.js
- `GET /leads` — admin only
- `GET /leads/my` — telecaller only (own assigned leads)
- `GET /leads/check` — public, requires ?phone= and ?name= (exact 10-digit phone, case-insensitive name match)
- `PUT /leads/:id` — admin or assigned telecaller

### Institute Leads
- `POST /institute-leads` — public, auto-assigns telecaller
- `GET /institute-leads` — admin only
- `PUT /institute-leads/:id` — admin or assigned telecaller

### Commissions
- `GET /commissions` — admin only
- `PUT /commissions/:id` — admin only (update amount + status)

### Call Logs
- `POST /call-logs` — telecaller only (must be assigned to the lead)
- `GET /call-logs/:leadId` — admin or assigned telecaller

### Users
- `GET /users` — admin only (all users, includes profile_picture_url)
- `GET /users?role=telecaller` — admin only (filter by role)
- `POST /users` — admin only (create new account, bcrypt password)
- `PUT /users/me` — any logged-in user (update own name/profile_picture_url)
- `PUT /users/:id/toggle-active` — admin only (pause/unpause)
- `DELETE /users/:id` — admin only (safeguard: cannot delete last active admin)
- `GET /users/:id/activity` — admin only (assigned leads + call logs)

### Visitors
- `POST /visitors/track` — public (session tracking, fire-and-forget)
- `PUT /visitors/link-lead` — public (link session to lead after form submit)
- `GET /visitors/hot-leads` — admin only (unconverted sessions, sorted by view count)

### Upload
- `POST /upload` — any logged-in user, accepts type: college-logo or profile-picture, max 2MB, JPEG/PNG/WebP only

### Partner Inquiries
- `POST /partner-inquiries` — public
- `GET /partner-inquiries` — admin only

---

## User Roles

| Role | Access |
|---|---|
| Admin | Full access to all admin routes and pages. Can create/pause/delete users. |
| Telecaller | Only sees own assigned leads (/telecaller dashboard). Cannot access /admin/*. |
| Public/Guest | Can browse colleges, submit inquiry forms, check lead status by phone+name. Cannot log in (no signup — admin creates accounts). |

---

## Key Business Logic

### Auto-assignment (autoAssignTelecaller.js)
When a lead is created (POST /leads or POST /institute-leads):
1. Fetch all active telecallers (role=telecaller, is_active=true)
2. Calculate weighted workload score per telecaller: new=1, contacted=2, interested=3, not-interested/enrolled=0
3. Assign to lowest score; random pick if tied
4. If no active telecallers exist, leave unassigned (no error)
5. Set auto_assigned=true on the lead

### Commission auto-creation
When a lead's status is updated to 'enrolled-college' via PUT /leads/:id:
- Automatically create a record in commissions table (linked to lead + college, amount=null, status=pending)
- If status is 'enrolled-institute', no commission is created

### Visitor tracking
- Client generates a UUID session_id stored in localStorage (tracking.js)
- Every college card click fires POST /visitors/track (fire-and-forget, never blocks UI)
- Mode filter changes fire POST /visitors/track with mode_filter
- On inquiry form submission, fires PUT /visitors/link-lead to connect session to new lead
- GET /visitors/hot-leads shows admin unconverted sessions (converted_to_lead_id IS NULL) sorted by total views

### Check Status security
- Requires BOTH phone (exact 10 digits) AND name (case-insensitive match)
- Returns only safe fields (name, status, colleges, created_at)
- Generic empty response if no match (doesn't reveal which field was wrong)

---

## Security Measures In Place
- helmet middleware (security headers)
- Rate limiting: login (10/15min), POST /leads (20/15min), POST /visitors/track (applied)
- No public signup — all accounts created by admin only
- File uploads: 2MB max, JPEG/PNG/WebP only
- JWT secret stored in Render environment variable only (never in code)
- Supabase key stored in Render environment variable only
- Cannot delete last active admin account
- Call logs ownership verified before access
- Paused users (is_active=false) cannot log in

---

## Environment Variables (Render backend)
- `SUPABASE_URL` — Supabase project URL
- `SUPABASE_KEY` — Supabase service role secret key
- `JWT_SECRET` — long random hex string (rotated)
- `PORT` — set by Render automatically

## Environment Variables (Vercel frontend)
- None currently — API URL is hardcoded as `https://ictehub.onrender.com` in components

---

## Rules for any AI working on this project
1. This is an EXISTING project — do not rebuild or restructure things that already work
2. Always check which files already exist before creating new ones
3. Never use MongoDB, Mongoose, or any non-Supabase database client
4. Never add a public signup route — accounts are admin-only
3. Always double-check lucide-react icon imports — unused/wrong icon names crash the app
4. Keep all existing API endpoint paths exactly as documented above
5. Test code mentally for undefined variables and missing imports before responding
6. When resuming after a break: re-read this entire document first, confirm what was last completed, then proceed
