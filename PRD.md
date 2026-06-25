# PROJECT BRIEF — Paste this entire document at the start of every AI chat session

## What this project is

A MERN (MongoDB, Express, React, Node) web platform that connects students with universities/colleges, run by a small team that earns commission from colleges when a student enrolls and pays. If a student doesn't want to enroll in a partner college, they are instead enrolled in the team's own 2-year online degree program (no commission, internal enrollment). Telecallers call students who show interest and move them through the enrollment process. The platform also tracks anonymous visitor behavior (which colleges/modes they browse) so telecallers can prioritize "hot" leads.

## User journey (the whole app in one flow)

1. Visitor lands on the site (not logged in)
2. Visitor browses colleges, can filter by mode (Online/Offline) — this browsing is tracked anonymously
3. Visitor gets interested, fills an inquiry form → becomes a **Lead**, linked to their browsing history
4. Telecaller is assigned the Lead, calls them, logs the outcome
5. Lead is either: (a) enrolled in a partner College → Commission record created, OR (b) enrolled in the team's own InstituteCourse → no commission
6. Admin manages colleges, telecallers, and tracks overall commission/enrollment status manually (no separate college-partner login in v1)

## User roles (v1 — only two logins exist)

- **Admin** — full access: manage Colleges, InstituteCourse, Users (telecallers), view all Leads, view analytics dashboard, manage Commission records
- **Telecaller** — sees only Leads assigned to them, can update Lead status, add CallLog entries
- Students/Visitors do NOT log in. They only interact via the public browsing pages and the inquiry form.
- College partners do NOT log in in v1. Admin handles college communication manually outside the app.

## Data model (MongoDB collections)

### College
| Field | Type | Notes |
|---|---|---|
| name | String | required |
| mode | String enum: "Online" \| "Offline" | required |
| location | String | required if mode is Offline (city, state) |
| coursesOffered | [String] | list of course names |
| commissionPercent | Number | e.g. 15 |
| commissionStructure | String enum: "one-time" \| "installments" | |
| contactPerson | { name: String, phone: String, email: String } | |
| createdAt | Date | auto |

### InstituteCourse
| Field | Type | Notes |
|---|---|---|
| name | String | e.g. "BCA" |
| mode | String | always "Online" — can hardcode, no need for admin to edit this field |
| duration | String | e.g. "2 years" |
| fees | Number | |

### Visitor (anonymous tracking)
| Field | Type | Notes |
|---|---|---|
| sessionId | String | generated client-side (e.g. UUID stored in localStorage/cookie), required, indexed |
| viewedColleges | [{ collegeId: ObjectId, timestamp: Date, count: Number }] | append/increment on each view |
| modeFilterUsed | [String] | track which filters ("Online"/"Offline") they clicked |
| firstSeenAt | Date | |
| lastSeenAt | Date | |
| convertedToLeadId | ObjectId, ref Lead, nullable | filled in once they submit the inquiry form |

### Lead
| Field | Type | Notes |
|---|---|---|
| name | String | required |
| phone | String | required |
| email | String | optional |
| interestedColleges | [ObjectId], ref College | |
| status | String enum: "new" \| "contacted" \| "interested" \| "not-interested" \| "enrolled-college" \| "enrolled-institute" | default "new" |
| assignedTelecaller | ObjectId, ref User, nullable | |
| sessionId | String | links back to the Visitor doc that created this lead |
| createdAt | Date | auto |

### CallLog
| Field | Type | Notes |
|---|---|---|
| leadId | ObjectId, ref Lead | required |
| telecallerId | ObjectId, ref User | required |
| outcome | String enum: "interested" \| "not-interested" \| "call-back-later" \| "no-answer" | |
| notes | String | |
| callDate | Date | default now |

### Commission
| Field | Type | Notes |
|---|---|---|
| leadId | ObjectId, ref Lead | required |
| collegeId | ObjectId, ref College | required |
| amount | Number | |
| status | String enum: "pending" \| "received" | default "pending" |
| createdAt | Date | auto |

### User (login — Admin & Telecaller only)
| Field | Type | Notes |
|---|---|---|
| name | String | |
| email | String | unique, required |
| passwordHash | String | bcrypt — never store plain text |
| role | String enum: "admin" \| "telecaller" | |
| createdAt | Date | auto |

## Build order (do NOT build out of order — finish and test each step before the next)

1. **Project setup & deploy skeleton** — empty React app on Vercel, empty Express app on Render, MongoDB Atlas connected, confirm frontend can call a `/health` backend route successfully
2. **Auth** — User model, login/signup, JWT, role-based route protection (admin vs telecaller)
3. **College + InstituteCourse CRUD** — Admin can add/edit/delete; public browsing page with Online/Offline filter
4. **Lead system** — public inquiry form (creates Lead) + Admin view of all Leads + assign to Telecaller
5. **Telecaller dashboard** — view assigned Leads, update status, add CallLog entries
6. **Commission logic** — when Lead status becomes "enrolled-college", create Commission record; if "enrolled-institute", skip commission
7. **Visitor tracking + analytics dashboard** — anonymous session tracking on public pages, link session to Lead on form submit, Admin dashboard showing visitor activity per college/mode, flag "hot" leads (high view count before converting)

## Hosting plan

- Frontend (React): **Vercel**
- Backend (Express/Node): **Render**
- Database: **MongoDB Atlas** (free tier)

## Rules for whoever (whichever AI) is building this

- Do not invent new fields or collections without updating this document first
- Passwords must be hashed (bcrypt), never stored in plain text
- JWT secret must come from an environment variable, never hardcoded in code
- Build and fully test ONE step from "Build order" before starting the next
- If resuming after a break/account switch: re-read this entire document first, then ask what was last completed before writing new code
