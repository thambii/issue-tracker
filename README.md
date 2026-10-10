# Issue Tracker

A simple full-stack issue tracker. Users register or log in, raise issues, and an admin assigns them to users who then close them. A global dashboard shows how many issues are open, in progress and closed.

- *Vercel url*: `issue-tracker-rmz3z7shv-luffy-784b.vercel.app`

 @Test accounts

| Role  | Email               | Password  |
|-------|---------------------|-----------|
| Admin | admin@example.com   | admin123  |
| User  | alice@example.com   | user123   |
| User  | bob@example.com     | user123   |

These are created automatically the first time the app talks to the database. Anyone can also register a new account (always created as a normal `user`).

## Features

- Registration and login (password hashing, cookie-based session)
- Two roles: **admin** and **user**
- Create, edit and delete issues. Everyone can see all issues, but only the creator (or an admin) can edit or delete an issue
- Admin assigns an issue to a user, which moves it to **In Progress**
- The assigned user (or an admin) marks it **Closed**
- Comments on every issue
- Global dashboard: Total, Open, In Progress, Closed
- Filter the issue list by status



# Who can do what

| Action                  | Any user | Issue creator | Assigned user | Admin |
|-------------------------|:--------:|:-------------:|:-------------:|:-----:|
| View issues, dashboard  | yes      |               |               | yes   |
| Create an issue         | yes      |               |               | yes   |
| Edit / delete an issue  |          | yes           |               | yes   |
| Assign an issue         |          |               |               | yes   |
| Close an issue          |          |               | yes           | yes   |
| Comment on an issue     | yes      |               |               | yes   |

## Tech stack

- **Framework:** Next.js 16 (App Router), React 19.
- **Database:** PostgreSQL - Neon free tier
- **DB driver:** `pg`
- **Auth:** JWT (`jose`) stored in an httpOnly cookie, passwords hashed with `bcryptjs`
- **Hosting:** Vercel

## Architecture

```
Browser (React pages)
   |  fetch() with session cookie
   v
Next.js API routes  (app/api/*)       <- Vercel serverless functions
   |  lib/auth.js  (JWT cookie)
   |  lib/api.js   (error handling, shared queries)
   v
PostgreSQL on Neon  (lib/db.js)
```

```
app/
  page.js                  Dashboard + issue list + create form
  login/page.js            Login / register
  issues/[id]/page.js      Issue detail, edit, assign, close, comments
  api/                     REST API (see below)
components/                Nav, StatusBadge
lib/
  db.js                    DB connection, creates tables + default users on first run
  auth.js                  Sign / verify the login cookie
  api.js                   Route wrapper, permission errors, shared issue queries
  client.js                Browser-side fetch helper and login check
```

### Database tables

- **users**: id, name, email (unique), password_hash, role (`admin` | `user`), created_at
- **issues**: id, title, description, status (`Open` | `In Progress` | `Closed`), created_by, assigned_to, created_at, updated_at
- **comments**: id, issue_id, user_id, text, created_at

Tables are created automatically (`CREATE TABLE IF NOT EXISTS`), so no migration step is needed.

## Environment variables

| Name           | Required | Description |
|----------------|----------|-------------|
| `DATABASE_URL` | yes      | PostgreSQL connection string, e.g. `postgresql://user:pass@host/db?sslmode=require` |
| `JWT_SECRET`   | yes      | Long random string used to sign login tokens. Change it in production |

Copy `.env.example` to `.env.local` for local development. Never commit real values.

## Run locally

Requirements: Node.js 18+ and a PostgreSQL database (a free Neon database works, or a local Postgres).

```bash
npm install
cp .env.example .env.local     # then edit DATABASE_URL and JWT_SECRET
npm run dev
```

Open http://localhost:3000 and log in with a demo account.

Production build check: `npm run build && npm start`.

## API reference

All endpoints return JSON. Errors look like `{ "error": "message" }`. Every endpoint except register and login needs a logged-in session cookie (set by login/register), otherwise it returns `401`.

### Auth

| Method | Endpoint             | Body                          | Description |
|--------|----------------------|-------------------------------|-------------|
| POST   | `/api/auth/register` | `{ name, email, password }`   | Create a normal user and log in (password min 6 chars) |
| POST   | `/api/auth/login`    | `{ email, password }`         | Log in |
| POST   | `/api/auth/logout`   |                               | Log out |
| GET    | `/api/auth/me`       |                               | Current user |


### Comments

| Method | Endpoint                     | Body       | Who | Description |
|--------|------------------------------|------------|-----|-------------|
| GET    | `/api/issues/:id/comments`   |            | any user | List comments (oldest first) |
| POST   | `/api/issues/:id/comments`   | `{ text }` | any user | Add a comment |


Status codes used: `200/201` success, `400` bad input, `401` not logged in, `403` not allowed, `404` not found, `409` email already registered.

