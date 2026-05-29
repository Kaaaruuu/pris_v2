# Phase 0: Infrastructure & Security Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the foundational database schema, security policies, and Next.js project structure for Project PRIS.

**Architecture:** Multi-tenant workspace model with RLS and field-level encryption (pgsodium). Next.js App Router for frontend delivery.

**Tech Stack:** Supabase (Postgres, Auth, pgsodium), Next.js, Tailwind CSS, TypeScript.

---

### Task 1: Initial Database Schema & Extensions

**Files:**
- Create: `supabase/migrations/20260529000000_initial_schema.sql`

- [ ] **Step 1: Create initial migration with extensions and core tables**

```sql
-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";   -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";    -- Crypto utilities
CREATE EXTENSION IF NOT EXISTS "pgsodium";    -- AES-256-GCM field encryption
CREATE EXTENSION IF NOT EXISTS "pg_trgm";     -- Trigram patient search
CREATE EXTENSION IF NOT EXISTS "pg_cron";     -- Scheduled jobs

-- 2. WORKSPACES
CREATE TABLE workspaces (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           TEXT NOT NULL UNIQUE,
  slug           TEXT NOT NULL UNIQUE,
  owner_id       UUID NOT NULL,          -- References auth.users.id
  trial_ends_at  TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. PROFILES
CREATE TABLE profiles (
  id          UUID PRIMARY KEY,   -- Must equal auth.users.id
  full_name   TEXT NOT NULL,
  avatar_url  TEXT,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. WORKSPACE_MEMBERS
CREATE TABLE workspace_members (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id      UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role         TEXT CHECK (role IN ('owner','doctor','staff')) NOT NULL,
  invited_by   UUID REFERENCES profiles(id),
  invited_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at  TIMESTAMP WITH TIME ZONE,
  UNIQUE (workspace_id, user_id)
);

-- 5. AUDIT LOGS (Append-only)
CREATE TABLE audit_logs (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id        UUID NOT NULL,
  operator_profile_id UUID NOT NULL,
  patient_id          UUID,
  resource_type       TEXT NOT NULL,
  resource_id         UUID NOT NULL,
  action_type         TEXT NOT NULL CHECK (action_type IN (
                        'READ','CREATE','UPDATE','EXPORT','PRINT',
                        'DELETE_REQUEST','LOGIN','PERMISSION_CHANGE',
                        'CONSENT_RECORD','ANONYMIZE'
                      )),
  old_value           JSONB,
  new_value           JSONB,
  ip_address          INET,
  user_agent          TEXT,
  session_id          TEXT,
  timestamp           TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Revoke dangerous permissions on audit_logs
REVOKE UPDATE, DELETE, TRUNCATE ON audit_logs FROM authenticated;
REVOKE UPDATE, DELETE, TRUNCATE ON audit_logs FROM anon;
```

- [ ] **Step 2: Commit initial schema**

```bash
git add supabase/migrations/20260529000000_initial_schema.sql
git commit -m "feat: initialize core database schema and extensions"
```

---

### Task 2: Patient and Clinical Data Schema (Encrypted)

**Files:**
- Create: `supabase/migrations/20260529000001_patient_schema.sql`

- [ ] **Step 1: Create patient and case-related tables**

```sql
-- 1. PATIENTS (with Class A/B encrypted fields as BYTEA)
CREATE TABLE patients (
  id                             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id                   UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  -- Class C (unencrypted)
  surname                        TEXT NOT NULL,
  first_name                     TEXT NOT NULL,
  middle_name                    TEXT,
  suffix                         TEXT,
  date_of_birth                  DATE NOT NULL,
  sex                            TEXT NOT NULL,
  gender_identity                TEXT,
  civil_status                   TEXT,
  nationality                    TEXT DEFAULT 'Filipino',
  occupation                     TEXT,
  emergency_contact_name         TEXT,
  emergency_contact_relationship TEXT,
  emergency_contact_mobile       TEXT,
  hmo_details                    JSONB,
  -- Class B (BYTEA — encrypted)
  home_address                   BYTEA,
  mobile_number                  BYTEA,
  email                          BYTEA,
  -- Class A (BYTEA — encrypted)
  philhealth_pin                 BYTEA,
  discount_id_number             BYTEA,
  allergies                      BYTEA,
  current_medications            BYTEA,
  past_medical_history           BYTEA,
  family_medical_history         BYTEA,
  social_history                 BYTEA,
  -- Metadata
  created_at                     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at                     TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_patients_workspace ON patients(workspace_id);
CREATE INDEX idx_patients_search ON patients
  USING GIN (
    to_tsvector('simple',
      coalesce(surname,'') || ' ' || coalesce(first_name,'')
    )
  );

-- 2. CASES
CREATE TABLE cases (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id   UUID REFERENCES patients(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  status       TEXT CHECK (status IN ('active','closed')) DEFAULT 'active',
  created_by   UUID REFERENCES profiles(id),
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  closed_at    TIMESTAMP WITH TIME ZONE
);

-- 3. CASE_ENTRIES (Immutable)
CREATE TABLE case_entries (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id         UUID REFERENCES cases(id) ON DELETE CASCADE,
  workspace_id    UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  author_id       UUID REFERENCES profiles(id),
  parent_entry_id UUID REFERENCES case_entries(id),
  is_amendment    BOOLEAN DEFAULT false,
  vitals          JSONB,
  clinical_notes  BYTEA NOT NULL,  -- Encrypted
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

- [ ] **Step 2: Commit patient schema**

```bash
git add supabase/migrations/20260529000001_patient_schema.sql
git commit -m "feat: add patient and case entry tables with encryption support"
```

---

### Task 3: Security & RLS Policies

**Files:**
- Create: `supabase/migrations/20260529000002_security_policies.sql`

- [ ] **Step 1: Enable RLS and define base policies**

```sql
-- Enable RLS on all tables
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Base Policy: Workspace membership isolation
-- (Note: Simplified for initial setup, will be refined with roles)
CREATE POLICY "Users can see their own workspaces"
  ON workspaces FOR SELECT
  USING (auth.uid() IN (
    SELECT user_id FROM workspace_members WHERE workspace_id = id
  ));

CREATE POLICY "Workspace members can see patient data"
  ON patients FOR SELECT
  USING (workspace_id IN (
    SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
  ));
```

- [ ] **Step 2: Commit security policies**

```bash
git add supabase/migrations/20260529000002_security_policies.sql
git commit -m "security: enable RLS and add foundational workspace policies"
```

---

### Task 4: Next.js Project Initialization

**Files:**
- Create: root files

- [ ] **Step 1: Initialize Next.js with required flags**

Run: `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-git`
(Using `--no-git` because we already have a git repo)

- [ ] **Step 2: Configure security headers in next.config.js**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; frame-ancestors 'none'; upgrade-insecure-requests;" },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' }
        ],
      },
    ]
  },
}

module.exports = nextConfig
```

- [ ] **Step 3: Commit project initialization**

```bash
git add .
git commit -m "chore: initialize Next.js project with security headers"
```

---

### Task 5: Verification & Baseline

- [ ] **Step 1: Run build to verify setup**

Run: `npm run build`
Expected: SUCCESS

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: PASS
