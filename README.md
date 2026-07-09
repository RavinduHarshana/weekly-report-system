# Sisenco Weekly Report Generator & Team Dashboard

A premium, role-based weekly reporting and team management system built for developers and engineering managers. This application has been refactored and enhanced with high-fidelity visualization, tabbed UX containment, Sri Lankan localization contexts, and a persistent AI Status Assistant powered by the Google Gemini API.

---

## 🌟 Key Highlights & Enhancements (Evaluator Guide)

### 1. Persistent AI Status Assistant (Gemini 2.5)
- **Persistent Overlay Widget**: An assistant ball (`🤖`) is persistently anchored at the bottom-right corner of the manager portal on any view. Toggling it opens a glassmorphic sidebar/drawer widget that slides up from the bottom-right.
- **Team Context Prompt Injection**: The backend queries the database for active team members, assigned project descriptions, and their 5-week history of weekly reports (completed tasks, plans, and blocker descriptions). It maps this into a structured system prompt context passed directly to `gemini-2.5-flash` so that the AI can accurately answer detailed queries like *"Summarize Ruwan's progress"* or *"Who is facing blockers?"* in real time.
- **Fail-safe Configuration**: If the `GEMINI_API_KEY` is missing in the backend `.env` file, the chatbot gracefully displays an interactive setup warning card with clear configuration instructions instead of breaking the server.

### 2. Modern Tabbed UI/UX Shell (No Scroll Clutter)
- SWapped out long scrolling list pages for a crisp, sequential sidebar tab containment model (`#overview`, `#queries`, `#projects`). Managers view only one context panel at a time, drastically reducing cognitive load.
- Re-designed Sidebar Footer: The user logout action button is programmatically pinned to the absolute bottom of the side nav drawer utilizing Flexbox expansion rules.

### 3. High-Fidelity Data Visualizations
- **Completed Tasks Chronology**: Refactored chart endpoints to map report trends chronologically using the report's `endDate` rather than database insertion timestamps. Dates are grouped into clean, readable labels (e.g., `12 Jun 2026`, `19 Jun 2026`).
- **Harmonious Palettes**: Recharts graphs are formatted with linear gradients (emerald and tangerine accents), rounded bar corners, donut charts (`innerRadius`), and a fully overridden custom dark theme tooltip container for premium aesthetics.
- **Critical Blockers Alert Feed**: Added a dedicated warning panel on the dashboard overview highlighting active blockers directly to the manager.
- **Team Member Status Board**: A mini dashboard table showing each member's status (Submitted, Late, or Pending) with status-specific colored pills.

### 4. Decoupled Query Architecture
- Decoupled filter searches inside the *Report Queries* search page so that queries do not affect or distort the main dashboard metrics and analytics overview charts.

### 5. Localized Sri Lankan Seed Script
- Populates the database with real-world developer profiles:
  - **Kasun Perera** (`kasun@example.com`)
  - **Nimal Silva** (`nimal@example.com`)
  - **Ruwan Fernando** (`ruwan@example.com`)
  - **Dilini Wijesinghe** (`dilini@example.com`)
- Under local project scenarios:
  - *LankaQR Sync Platform*
  - *Seylan Bank Pay Gateway*
  - *Dialog SMS Portal Core*
  - *Koombiyo Delivery Tracker*
- Seeds 20 highly detailed weekly reports spanning 5 weeks to ensure analytical charts look comprehensive from the start.

---

## 🛠️ Technology Stack

- **Backend**: Node.js, Express, MongoDB (Mongoose ODM), JWT, Google Gemini API
- **Frontend**: React (Vite bundler), React Router DOM, Recharts, React Datepicker
- **Styling**: Modern Vanilla CSS (featuring glassmorphism, linear gradients, flex grids, and smooth CSS transforms)

---

## 📦 Setup & Installation

### 1. Clone & Install Dependencies
Install packages in both backend and frontend directories:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

# First manager account seeding credentials
MANAGER_NAME="Admin Manager"
MANAGER_EMAIL=admin@example.com
MANAGER_PASSWORD=Password123!

# Google Gemini API key to enable AI Assistant
GEMINI_API_KEY=your_google_gemini_api_key
```

### 3. Populate Database (Seed Script)
Populate MongoDB with the full localized Sri Lankan test workspace records:
```bash
cd backend
npm run seed
```
*Note: To seed only the Manager login credentials without mock reports, run `npm run seed:manager`.*

### 4. Start the Application
Open two terminals to run both processes:

**Terminal 1 (Backend API):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend UI):**
```bash
cd frontend
npm run dev
```

Log in as Manager using:
- **Email**: `admin@example.com`
- **Password**: `Password123!`

Log in as Team Member (e.g. Kasun) using:
- **Email**: `kasun@example.com`
- **Password**: `Password123!`

---

## 🔗 API Overview Reference

| Method | Endpoint | Access Role | Description |
|---|---|---|---|
| **POST** | `/api/auth/register` | Public | Register a new Team Member account |
| **POST** | `/api/auth/login` | Public | Authenticate user & return JWT token |
| **POST** | `/api/auth/register-admin` | Manager | Register another Manager account |
| **GET** | `/api/auth/me` | Logged In | Retrieve active user session context |
| **GET** | `/api/reports/mine` | Team Member | Retrieve logged-in member's reports |
| **POST** | `/api/reports/create` | Team Member | Create a new weekly report draft |
| **PUT** | `/api/reports/:id` | Owner | Edit draft weekly report details |
| **POST** | `/api/reports/:id/submit` | Owner | Finalize and submit report |
| **GET** | `/api/reports/all` | Manager | Filter and retrieve all team reports |
| **GET** | `/api/reports/summary/dashboard` | Manager | Retrieve global metrics, trends, and workloads |
| **POST** | `/api/reports/chat` | Manager | Process manager questions using Gemini AI API |
| **GET** | `/api/projects` | Logged In | List active projects |
| **POST** | `/api/projects` | Manager | Create a project |
| **PUT** | `/api/projects/:id` | Manager | Update project info |
| **DELETE** | `/api/projects/:id` | Manager | Remove project |
