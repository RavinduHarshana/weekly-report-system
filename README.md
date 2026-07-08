# Weekly Report Generator & Team Dashboard

Full-stack role-based weekly reporting app for team members and managers.

## Stack

- Backend: Node.js, Express, MongoDB, Mongoose, JWT
- Frontend: React, Vite, React Router, Recharts

## Features Implemented

- Public register and login
- Team Member and Manager roles
- JWT-based protected routes
- Personal weekly report creation, editing, submission, and history
- Manager report dashboard with filters and summary metrics
- Project/category CRUD
- Role-based access control on protected endpoints

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
```

### 3. Run the backend

```bash
cd backend
npm run dev
```

### 4. Run the frontend

```bash
cd frontend
npm run dev
```

### 5. Create the first manager account

Add these variables to `backend/.env`:

```env
MANAGER_NAME=Admin Name
MANAGER_EMAIL=admin@example.com
MANAGER_PASSWORD=StrongPassword123
```

Then run:

```bash
cd backend
npm run seed:manager
```

After that, log in with the manager email and password.

## Important Notes

- Public registration creates a `Team Member` account.
- Manager accounts should be created by an authenticated Manager through `POST /api/auth/register-admin`.
- The backend exposes `/api/reports` and `/api/projects` for the dashboard and reporting flows.
- The first Manager can be seeded with `npm run seed:manager` using env credentials.
- The frontend is route-based: `/login`, `/register`, `/member`, and `/manager` are separated into dedicated page files.
- The frontend bootstraps the current user from `GET /api/auth/me` so the active role comes from the backend session, not from cached client role data.

## API Overview

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/register-admin`
- `GET /api/reports/mine`
- `POST /api/reports/create`
- `PUT /api/reports/:id`
- `POST /api/reports/:id/submit`
- `GET /api/reports/all`
- `GET /api/reports/summary/dashboard`
- `GET /api/projects`
- `POST /api/projects`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`
