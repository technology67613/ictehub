# ICTE Hub — University Connection Platform

ICTE Hub is a high-performance web platform designed to connect students with universities and colleges. It is managed by an administrative team that matches student inquiries (leads) with partner institutions and processes admissions. The platform tracks anonymous visitor browsing behaviors to prioritize high-intent leads and supports direct enrollment in internal degree programs when a partner university mismatch occurs.

---

## 🌟 Key Features

1. **Dynamic College Directory & Search**: Browse, filter (online/offline), and search universities.
2. **Public Inquiry Tracker ("Check Status")**: Students can enter their phone numbers to see real-time, counselor-translated updates on their inquiries without logging in.
3. **Admin Dashboard**:
   - **Lead Management**: View, filter, assign telecallers, and view call histories.
   - **College Management**: Add, edit, upload logo images, and configure commission rates.
   - **Commissions Tracker**: Update commission records and log invoices.
   - **Team Management**: Create, pause/soft-block, and delete counselor accounts.
   - **Partner Inquiries Log**: View partnership proposals submitted by colleges.
   - **CSV Export**: Client-side one-click CSV generation for leads and commissions.
4. **Telecaller Workspace**: View assigned student queues, log call outcomes, and update profile pictures.
5. **Security & Performance**:
   - Hardcoded public signups to restrict accounts to telecallers only.
   - Rate limiters implemented on public actions (`POST /leads`, `POST /auth/signup`, `GET /leads/check`, `POST /visitors/track`).
   - UTM Lead source tracking (`?source=instagram`).

---

## 📂 Project Architecture

```
ictehub/
├── client/                 # React Frontend (Vite)
│   ├── public/             # Static public assets (Favicon, Logo image)
│   ├── src/
│   │   ├── components/     # UI Pages & Modules (Admin views, Forms, Footers)
│   │   └── utils/          # Client utilities (Session tracker, source parse)
│   └── vercel.json         # SPA router rewrite rules for Vercel
│
└── server/                 # Express Node Backend
    ├── config/             # Supabase credentials & SQL schema migrations
    ├── middleware/         # JWT Verification & role authorization checks
    └── routes/             # API Endpoints (Auth, Leads, Colleges, Users, etc.)
```

---

## ⚙️ Backend Setup & Configuration

### 1. Prerequisites
- Node.js (v18+)
- Supabase Account & Database

### 2. Environment Variables (`server/.env`)
Create a `.env` file in the `server` directory:
```env
PORT=5000
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_signing_secret
```

### 3. Database Schema Setup (SQL Migrations)
Execute the SQL files inside `server/config/` in your Supabase SQL editor:
1. `leads_schema.sql` (Creates leads table)
2. `call_logs_schema.sql` (Creates call logs table)
3. `update_user_deletion_and_activity.sql` (Alters constraints to support cascades)
4. `platform_upgrades.sql` (Creates partner inquiries table & adds source tracking)

### 4. Running Backend Locally
```bash
cd server
npm install
npm run dev
```

---

## 💻 Frontend Setup & Configuration

### 1. Configure API URL
Open `client/src` components and confirm the `API` endpoint constant matches your backend server URL (e.g., `https://ictehub.onrender.com` or `http://localhost:5000`).

### 2. Running Frontend Locally
```bash
cd client
npm install
npm run dev
```
The application will start locally on `http://localhost:5173`.

---

## 🚀 Deployment Instructions

### 1. Frontend (Vite + React) on Vercel
- Import the `client` folder.
- Set the framework preset to **Vite**.
- Output Directory: `dist`
- The `vercel.json` file is pre-configured to handle SPA redirects, avoiding 404 errors on refresh.

### 2. Backend (Node.js) on Render / Railway
- Deploy the `server` folder.
- Set Build Command: `npm install`
- Set Start Command: `npm start`
- Configure Environment Variables (`SUPABASE_URL`, `SUPABASE_KEY`, `JWT_SECRET`) in the hosting provider dashboard.
