# Team Task Manager

A full-stack Team Task Management web app built for the coding assignment. Users can sign up, create projects, manage members, assign tasks, update status, and view dashboard progress with project-level role-based access.

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express REST APIs
- Database: PostgreSQL
- ORM: Prisma
- Auth: JWT + bcrypt
- Validation: Zod
- Deployment: Railway

## Core Features

- Signup and login with secure password hashing
- JWT-protected APIs
- Project creation with creator as `ADMIN`
- Project members with `ADMIN` or `MEMBER` role
- Admin can add/remove members, delete projects, and manage tasks
- Member can view projects and update only assigned tasks
- Task assignment validation so every task is assigned to an admin or member
- Dashboard with project, task, member shortcuts, status counts, overdue tasks, and tasks per user
- Light and dark theme support
- Railway-ready environment variable setup

## Project Structure

```txt
backend/
  prisma/
    schema.prisma
    migrations/
    seed.js
  src/
    config/
    middleware/
    modules/
      auth/
      dashboard/
      projects/
      tasks/
    utils/
    app.js
    server.js

frontend/
  src/
    api/
    components/
    context/
    utils/
    App.jsx
    main.jsx
    styles.css

docs/
  design/
    teamtask-refresh-concept.png
```

## Local Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Set `DATABASE_URL` and `JWT_SECRET` in `backend/.env`.

```bash
npm run migrate:deploy
npm run seed
npm run dev
```

Backend runs at:

```txt
http://localhost:5001/api
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs at:

```txt
http://localhost:5173
```

## Demo Accounts After Seed

```txt
Admin: admin@teamtask.dev / password123
Member: member@teamtask.dev / password123
```

## Railway Deployment

Create one Railway project with three services:

1. PostgreSQL database
2. Backend service from the `backend` folder
3. Frontend service from the `frontend` folder

### Backend Railway Variables

```env
DATABASE_URL=<Railway PostgreSQL URL>
JWT_SECRET=<strong random secret>
FRONTEND_URL=<deployed frontend URL>
NODE_ENV=production
```

Backend service settings:

```txt
Root Directory: backend
Build Command: npm install
Start Command: npm run railway:start
```

`railway:start` runs Prisma migrations, seeds the demo admin/member accounts, and then starts the API.

### Frontend Railway Variables

```env
VITE_API_BASE_URL=<deployed backend URL>/api
```

Frontend service settings:

```txt
Root Directory: frontend
Build Command: npm run build
Start Command: npm run start
```

## GitHub Push Steps

```bash
git init
git add .
git commit -m "Build team task manager full stack app"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

Do not push `.env` files. Use `.env.example` files for documentation.

## Interview Explanation

The app uses PostgreSQL because the data is relational: users belong to projects, projects have members, and tasks belong to projects and assignees. `ProjectMember` is the important table because it stores the user's role inside each project. Admin checks are handled in backend route logic before allowing member or task management. Members can only update the status of tasks assigned to them.
