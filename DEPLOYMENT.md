# Rehab CRM — Production Deployment Guide

Two services: **Supabase** (the database that stores your data online) and
**Vercel** (hosts the live website). Do Supabase first, then Vercel.

You do **not** need to touch any code. Everything below is clicking around in
web dashboards, plus copying two values.

> **How the app behaves:** without the two Supabase values it runs fine on the
> device's local storage only. Once you add them, every change is also saved to
> Supabase, and the app fills an empty database with the demo data on first load.

---

## Part 1 — Set up Supabase (the database)

### 1. Create a project
1. Go to **https://supabase.com** and sign in (you can use GitHub).
2. Click **New project**.
3. Pick your organization, give the project a **name** (e.g. `rehab-crm`), and
   set a **database password** (save it somewhere; you won't need it for the app).
4. Choose the **region** closest to you and click **Create new project**.
5. Wait ~2 minutes while it provisions.

### 2. Create the tables (run the SQL)
1. In the left sidebar, open **SQL Editor**.
2. Click **+ New query**.
3. Open the file **`supabase-schema.sql`** from this repository, copy **all** of
   it, and paste it into the editor.
4. Click **Run** (bottom right). You should see "Success. No rows returned."
5. (Optional) In the sidebar, open **Table Editor** — you should now see the
   tables: `app_users`, `contacts`, `renovations`, `notifications`,
   `user_settings`. They'll be empty; the app fills them on first load.

### 3. Copy your two connection values
1. In the sidebar, click **Project Settings** (the gear icon).
2. Click **API**.
3. Copy these two values:
   - **Project URL** → this is your `VITE_SUPABASE_URL`
     (looks like `https://abcdefgh.supabase.co`).
   - **Project API keys → `anon` `public`** → this is your
     `VITE_SUPABASE_ANON_KEY` (a long string). The `anon` key is safe to use in
     a website; do **not** use the `service_role` key here.

Keep these two values handy for Part 2.

### 4. (Optional) Test it locally first
1. In the project folder, copy `.env.example` to a new file named `.env`.
2. Paste your two values in, save.
3. Run `npm run dev` and open the app. Sign in as `admin` / `admin`.
4. Back in Supabase → **Table Editor → renovations**, you should see the demo
   projects appear. That confirms the database connection works.

> **Security note (important):** this setup stores demo passwords in plain text
> and lets anyone with the public key read/write, which is fine for a prototype
> or internal demo. Before storing real, private client data, we should switch
> to Supabase Auth with proper access rules — happy to do that as a follow-up.

---

## Part 2 — Deploy on Vercel (the live website)

### 1. Import the repository
1. Go to **https://vercel.com** and sign in **with GitHub**.
2. Click **Add New… → Project**.
3. Find **`Rehab_CRM_2`** in the list and click **Import**.
   (If you don't see it, click **Adjust GitHub App Permissions** and grant access
   to the repo.)

### 2. Confirm the build settings
Vercel auto-detects Vite. You should see:
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

Leave these as-is.

### 3. Add the environment variables
Before clicking Deploy, expand **Environment Variables** and add the same two
values from Supabase:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | your Project URL |
| `VITE_SUPABASE_ANON_KEY` | your anon public key |

Add each, then make sure they apply to **Production** (the default).

### 4. Deploy
1. Click **Deploy**.
2. Wait ~1 minute. When it finishes you'll get a live URL like
   `https://rehab-crm-2.vercel.app`.
3. Open it and sign in with a demo account (`admin` / `admin`).

### 5. Future updates
Every time we push new code to the `main` branch on GitHub, Vercel rebuilds and
redeploys automatically — nothing to do.

> If you ever change the Supabase values, update them in
> **Vercel → Project → Settings → Environment Variables**, then redeploy from the
> **Deployments** tab (**⋯ → Redeploy**).

---

## Troubleshooting
- **App loads but data doesn't save online:** the env vars are probably missing
  or misspelled. They must start with `VITE_` exactly. Re-check both in Vercel,
  then redeploy.
- **Refreshing a project page shows a 404:** this is already handled by
  `vercel.json` (it routes everything back to the app). If it happens, confirm
  `vercel.json` is present in the repo.
- **Browser console shows `[supabase-sync] ...` messages:** that's the app
  telling you what it's doing (pulled data / bootstrapped / not configured) —
  informational, not errors.
