# Weekly Report Generator & Team Dashboard

Full-stack role-based weekly reporting app for team members and managers.

## Stack

- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT, Google Gemini API
- **Frontend**: React, Vite, React Router, Recharts, React Datepicker

---

## Features Implemented

- **Tabbed Side Navigation Shell**: High-end sidebar with tabbed section navigation. Restructured layouts so that users view individual panel contents sequentially, eliminating vertical scroll clutter.
- **Persistent AI Chatbot Assistant**: A floating chat widget ball (`🤖` toggler) fixed at the bottom-right corner of any page. Opens a sliding glassmorphic pop-up window where managers can query Google Gemini (`gemini-2.5-flash`) about active team members, blockers, project workloads, or report summaries.
- **Dynamic Analytics & Charts**:
  - Re-designed completed task trends showing chronological weekly progressions.
  - Workload by project rendering custom linear gradients and rounded corners.
  - Submission rate donut metrics and sleek dark tooltip designs.
  - Recent activity feeds styled with compact initial avatars.
- **Decoupled Search Queries**: Filters applied inside the *Report Queries* search page only narrow down the search results table, leaving the main dashboard metrics stable and correct.
- **Realistic Sri Lankan Seed Data**: Dynamic seeder script populating database records under localized projects (LankaQR, Dialog SMS, Seylan IPG, Koombiyo Tracker) and software engineering profiles (Kasun, Nimal, Ruwan, Dilini) across a 5-week history.
- **Full Breakpoint Responsiveness**: Optimized top-level shells and components to adjust across desktop, tablet, and mobile views.

---

## Setup

### 1. Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Backend environment variables

Create a `.env` file inside `backend/`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

# First manager account seeding credentials
MANAGER_NAME="Admin Manager"
MANAGER_EMAIL=admin@example.com
MANAGER_PASSWORD=Password123!

# Google Gemini API key to enable AI Status Assistant chatbot
GEMINI_API_KEY=your_google_gemini_api_key_here
```

### 3. Database Seeding

To clear the collections (users, projects, reports) and populate the system with a complete set of localized Sri Lankan dummy team data:

```bash
cd backend
npm run seed
```

*Note: If you only want to seed the basic Manager account without the mock team reports, run `npm run seed:manager` instead.*

### 4. Run the backend

```bash
cd backend
npm run dev
```

### 5. Run the frontend

```bash
cd frontend
npm run dev
```

Log in with `admin@example.com` / `Password123!` to view the Manager Dashboard.

---

## API Overview

- `POST /api/auth/register` - Register a Team Member
- `POST /api/auth/login` - Authenticate users
- `POST /api/auth/register-admin` - Create a Manager (Manager authentication required)
- `GET /api/reports/mine` - Retrieve own reports (Team Member)
- `POST /api/reports/create` - Create draft report
- `PUT /api/reports/:id` - Update report details
- `POST /api/reports/:id/submit` - Mark report status as submitted
- `GET /api/reports/all` - Filter and retrieve all team reports (Manager only)
- `GET /api/reports/summary/dashboard` - Global weekly overview summary data (Manager only)
- `POST /api/reports/chat` - AI status assistant chatbot endpoint (Manager only)
- `GET /api/projects` - View all active projects
- `POST /api/projects` - Add new project
- `PUT /api/projects/:id` - Edit project details
- `DELETE /api/projects/:id` - Delete project
