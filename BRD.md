# Business Requirements Document: Issue Tracker

| Item     | Detail |
|----------|--------|
| Project  | Issue Tracker System |
| Version  | 1.0 |
| Date     | 10 October 2026 |
| Live URL | `<ADD YOUR VERCEL URL HERE>` |
| Code     | `<ADD YOUR GITHUB REPO URL HERE>` |

## 1. Purpose

Teams need one shared place to report problems, decide who works on them, and see their progress. This application lets users raise issues, lets an admin assign them, lets the assigned person close them, and shows overall numbers on a dashboard.

## 2. Scope

**In scope:** user registration and login, issue create/edit/delete, assignment by admin, status tracking, comments, global dashboard.

**Out of scope:** email notifications, file attachments, password reset, issue priorities and labels, multiple projects or teams.

## 3. Users and roles

| Role  | Description |
|-------|-------------|
| Admin | Manages work. Can assign issues, and can edit, delete or close any issue |
| User  | Raises issues. Can edit and delete their own issues, comment on any issue, and close issues assigned to them |

There are only two roles. "The person who raises an issue" and "the person who solves it" are both normal users. What they can do depends on the issue (who created it, who it is assigned to), not on a separate role.

Public registration always creates a normal user. Admin accounts come from the default (seeded) accounts.

## 4. Functional requirements

| ID   | Requirement |
|------|-------------|
| FR-1 | A person can register with name, email and password, and log in with email and password |
| FR-2 | Any logged-in user can create an issue with a title and description. A new issue starts as **Open** and unassigned |
| FR-3 | All logged-in users can see all issues |
| FR-4 | Only the creator of an issue, or an admin, can edit or delete it |
| FR-5 | Only an admin can assign an issue to a user. Assigning changes the status to **In Progress** |
| FR-6 | Only the assigned user, or an admin, can mark an issue **Closed** |
| FR-7 | Any logged-in user can add comments to an issue. Each comment shows the author, text and time |
| FR-8 | A dashboard shows global counts: total, open, in progress and closed issues |
| FR-9 | The issue list can be filtered by status |

### Status flow

```
Open  -> (admin assigns) -> In Progress -> (assigned user closes) -> Closed
```

## 5. Non-functional requirements

- Passwords are stored hashed, never in plain text
- Login uses a signed token in an httpOnly cookie
- All permission checks are enforced on the server, not only in the UI
- Works on desktop and mobile screens
- Runs on free hosting tiers

## 6. Solution overview

- **Frontend and API:** Next.js 16 (one project, pages plus REST API routes)
- **Database:** PostgreSQL on Neon
- **Auth:** JWT in cookie, bcrypt password hashing
- **Hosting:** Vercel

Data model: `users`, `issues` (created_by and assigned_to point to users), `comments` (point to an issue and a user). Details and the full API list are in [README.md](./README.md).

## 7. Deployment

### 7.1 Where it is hosted

| Part        | Service | Plan |
|-------------|---------|------|
| Application (pages and API) | Vercel | Hobby (free) |
| Database    | Neon PostgreSQL | Free |
| Source code | GitHub | Free |

Live URL: `<ADD YOUR VERCEL URL HERE>`

### 7.2 Deployment approach

The code lives in a GitHub repository connected to Vercel. Every push to the `main` branch triggers an automatic build and deployment (continuous deployment). The API routes run as Vercel serverless functions, and they connect to the Neon database over the internet using `DATABASE_URL`. There is no separate backend server to manage.

The application creates its tables and default users automatically on the first request, so there is no migration or seed step to run by hand.

### 7.3 Required services and configuration

- A GitHub account and repository
- A Vercel account (sign in with GitHub)
- A Neon account with one Postgres database
- Environment variables set in Vercel (**Project Settings > Environment Variables**):

| Name           | Value |
|----------------|-------|
| `DATABASE_URL` | Neon connection string (ends with `?sslmode=require`) |
| `JWT_SECRET`   | A long random string |

### 7.4 Steps to deploy

1. **Create the database.** In Neon, create a project and copy the connection string.
2. **Push the code.** Create a GitHub repository and push the project to it:
   ```bash
   git init
   git add .
   git commit -m "Issue tracker"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```
3. **Import into Vercel.** In Vercel choose **Add New > Project**, select the repository. The framework is detected as Next.js, so the default build settings are fine.
4. **Add environment variables.** Add `DATABASE_URL` and `JWT_SECRET` before the first deploy.
5. **Deploy.** Click **Deploy**. When it finishes, open the Vercel URL.
6. **Check it works.** Log in as `admin@example.com` / `admin123`. The first request creates the tables and default users.
7. **Add the live URL** to the top of `README.md` and this document, then commit and push.

### 7.5 Steps to update the application

1. Make the change locally and test with `npm run dev` (and `npm run build` before pushing).
2. Commit and push to `main`. Vercel builds and deploys automatically.
3. If an environment variable changes, update it in Vercel and redeploy (**Deployments > Redeploy**).

Database tables are only created if missing. If a future change alters a table, apply that change to the Neon database manually (SQL editor in the Neon dashboard) before deploying.

### 7.6 Notes

- On the free tier, Neon may pause the database when idle, so the first request after a quiet period can take a few seconds.
- Change `JWT_SECRET` and the default passwords if the app is ever used beyond a demo.

## 8. Assumptions

- The default accounts exist to make testing easy
- A single global list of issues is enough, with no per-team separation
- Any user may comment on any issue
