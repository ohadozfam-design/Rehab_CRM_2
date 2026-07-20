-- ============================================================================
-- Rehab CRM — Supabase schema
-- Run this once in your Supabase project's SQL Editor (see the setup guide).
-- Mirrors src/types.ts. Nested collections (SOW items, financial entries, etc.)
-- are stored as JSONB on the renovation row, matching the app's aggregate model.
--
-- ⚠️ SECURITY NOTE: This is a prototype schema. It stores demo passwords in
--    plain text and opens the tables to the public "anon" key so the current
--    front end works without a login backend. Before real production use, move
--    authentication to Supabase Auth and replace the permissive policies below
--    with per-user row-level-security rules.
-- ============================================================================

-- ---- Users ------------------------------------------------------------------
create table if not exists public.app_users (
  id                    text primary key,
  username              text unique not null,
  password              text not null,           -- demo only; use Supabase Auth in prod
  name                  text not null,
  email                 text,
  phone                 text,
  role                  text not null,           -- admin | manager | contractor | viewer
  responsibilities      jsonb default '[]'::jsonb,
  assigned_project_ids  jsonb default '[]'::jsonb,
  contractor_company    text,
  created_at            timestamptz not null default now()
);

-- ---- Contacts (address book) ------------------------------------------------
create table if not exists public.contacts (
  id         text primary key,
  name       text not null,
  role       text not null,
  company    text,
  email      text,
  phone      text,
  created_at timestamptz not null default now()
);

-- ---- Renovations (aggregate root) -------------------------------------------
-- Scalar fields are real columns; nested arrays/objects are JSONB.
create table if not exists public.renovations (
  id                  text primary key,
  name                text not null,
  address             text,
  city                text,
  state               text,
  size                numeric,
  start_date          date,
  deadline            date,
  status              text not null,             -- active | in-progress | completed
  total_budget        numeric not null default 0,
  summary             text default '',
  contractor          jsonb,                     -- Contractor
  manager             jsonb,                     -- ProjectManager
  loan                jsonb,                     -- LoanInfo
  phases              jsonb default '[]'::jsonb, -- Phase[]
  sow_items           jsonb default '[]'::jsonb, -- SOWItem[]
  payment_milestones  jsonb default '[]'::jsonb, -- PaymentMilestone[]
  financial_entries   jsonb default '[]'::jsonb, -- FinancialEntry[]
  receipts            jsonb default '[]'::jsonb, -- Receipt[]
  updates             jsonb default '[]'::jsonb, -- ProjectUpdate[]
  drive_folders       jsonb default '{}'::jsonb, -- { phaseId: url }
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ---- Notifications ----------------------------------------------------------
create table if not exists public.notifications (
  id              text primary key,
  user_id         text not null,
  kind            text not null,                 -- item-proof-needed | lien-waiver-needed | ...
  severity        text not null,                 -- info | warning | critical
  title           text not null,
  message         text not null,
  renovation_id   text,
  related_item_id text,
  created_at      timestamptz not null default now(),
  last_fired_at   timestamptz,
  read_at         timestamptz,
  dismissed_at    timestamptz,
  resolved        boolean default false
);

-- ---- Per-user settings ------------------------------------------------------
create table if not exists public.user_settings (
  user_id                   text primary key,
  morning_snapshot_enabled  boolean not null default true,
  morning_snapshot_time     text not null default '08:00',
  last_snapshot_shown_date  date
);

-- ---- Helpful indexes --------------------------------------------------------
create index if not exists idx_notifications_user   on public.notifications (user_id);
create index if not exists idx_notifications_reno    on public.notifications (renovation_id);
create index if not exists idx_renovations_status    on public.renovations (status);

-- ============================================================================
-- Row Level Security
-- Prototype posture: enable RLS but allow the public anon key full access so the
-- current front end (which has no auth backend) can read and write. Replace with
-- proper per-user policies once you adopt Supabase Auth.
-- ============================================================================
alter table public.app_users     enable row level security;
alter table public.contacts      enable row level security;
alter table public.renovations   enable row level security;
alter table public.notifications enable row level security;
alter table public.user_settings enable row level security;

do $$
declare t text;
begin
  foreach t in array array[
    'app_users','contacts','renovations','notifications','user_settings'
  ]
  loop
    execute format(
      'drop policy if exists "prototype_public_access" on public.%I;', t
    );
    execute format(
      'create policy "prototype_public_access" on public.%I
         for all to anon, authenticated using (true) with check (true);', t
    );
  end loop;
end $$;
