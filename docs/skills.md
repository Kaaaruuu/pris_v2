---
name: pris
description: >
  Load this skill before writing ANY code, query, migration, component, or
  configuration file for Project PRIS (Patient Recording Information System).
  It is the authoritative source of truth for all architectural, compliance,
  database, routing, and security decisions. Every rule here overrides general
  knowledge. When in doubt, stop and re-read the relevant section.
source_prd: PRIS_PRD_v2.1.md
---

# PRIS Agent Knowledge Base
## Patient Recording Information System — v2.1

---

## 0. HOW TO USE THIS SKILL

Read the section that matches your current task before writing a single line.
Never rely on general framework knowledge alone — PRIS has project-specific
decisions that differ from defaults.

| Task                              | Read sections        |
|-----------------------------------|----------------------|
| Any frontend work                 | 1, 2, 3              |
| Any Supabase / database work      | 4, 5, 6              |
| Auth, login, signup, invites      | 2, 3, 6.1            |
| Patient data, forms, fields       | 7, 5                 |
| Clinical timeline / case entries  | 7.2, 5.2, 6.3        |
| Prescriptions                     | 7.3, 4.2             |
| File uploads / documents          | 8                    |
| Search                            | 9                    |
| Billing / subscriptions           | 10                   |
| Notifications / SMS / email       | 11                   |
| Audit logging                     | 12                   |
| Compliance / privacy              | 5                    |
| Security headers, CSP             | 2.6, 13              |
| PWA / service worker              | 2.5, 14              |

---

## 1. PROJECT IDENTITY & NON-NEGOTIABLES

**What PRIS is:** A multi-tenant, cloud-based patient record system for small
private clinics in the Philippines. Delivered 100% through the web browser.

**What PRIS is NOT:**
- NOT a native mobile app (no React Native, no Expo, no Swift, no Kotlin)
- NOT a desktop app (no Electron, no Tauri)
- NOT a single-tenant system (every feature must scope to workspace_id)
- NOT a general-purpose EHR — it is scoped to small PH private clinics

**The golden rule:** Every data access query must be scoped to the active
`workspace_id`. There are no exceptions. If you write a query without a
`workspace_id` filter, it is wrong.

**Compliance is a hard constraint, not a feature.** RA 10173 (Philippine Data
Privacy Act 2012) governs everything that touches patient data. When in doubt,
be more restrictive. See Section 5 for field-level encryption rules.

---

## 2. FRONTEND ARCHITECTURE

### 2.1 Framework & Toolchain

| Concern         | Decision                              | DO NOT substitute    |
|-----------------|---------------------------------------|----------------------|
| Framework       | Next.js (App Router)                  | No Pages Router      |
| UI library      | React                                 |                      |
| Styling         | Tailwind CSS                          | No CSS-in-JS         |
| Global state    | Zustand (workspace-level state)       |                      |
| Local/form state| React Context or useState             |                      |
| Auth client     | @supabase/auth-helpers-nextjs         | No custom JWT decode |
| API/DB client   | supabase-js v2                        | No REST calls direct |
| Hosting         | Vercel (primary) or Netlify           |                      |
| CDN             | Vercel Edge Network                   |                      |

### 2.2 Rendering Strategy — MANDATORY

Every route has a fixed rendering mode. Never change these.

| Route pattern          | Mode      | Reason                              |
|------------------------|-----------|-------------------------------------|
| `/`                    | SSG       | Marketing; CDN-cached; SEO          |
| `/features`            | SSG       | Static content                      |
| `/pricing`             | SSG       | Static content                      |
| `/about`               | SSG       | Static content                      |
| `/privacy`             | SSG       | Static legal text                   |
| `/terms`               | SSG       | Static legal text                   |
| `/blog`                | SSG       | Static content                      |
| `/login`               | SSG+CSR   | Static shell; form is client-side   |
| `/signup`              | SSG+CSR   | Static shell; form is client-side   |
| `/forgot-password`     | SSG+CSR   | Static shell                        |
| `/reset-password`      | SSG+CSR   | Token consumed client-side          |
| `/invite/:token`       | SSR       | Token MUST be validated server-side |
| `/verify-email`        | SSG+CSR   | Static shell                        |
| `/workspaces`          | CSR       | Requires auth                       |
| `/:slug/*`             | CSR (SPA) | Auth-gated; Supabase client auth    |

**SSG pages must have zero authentication-dependent content.**
**`/invite/:token` is the only SSR route — token validation is server-only.**

### 2.3 URL & Routing Structure

```
PUBLIC (no auth):
  /                     Landing page
  /features             Features
  /pricing              Pricing
  /about                About
  /privacy              Privacy Notice
  /terms                Terms of Service
  /blog                 Blog (optional)
  /signup               New clinic owner registration
  /login                Email + password login
  /forgot-password      Password reset request
  /reset-password       Reset token handler
  /invite/:token        Staff/doctor invitation acceptance
  /verify-email         Email verification landing

AUTHENTICATED (JWT required → redirect to /login?next=<path> if missing):
  /workspaces                    Workspace picker (multi-workspace users)
  /:slug/dashboard               Home / activity summary
  /:slug/patients                Patient list + search
  /:slug/patients/new            New patient enrollment
  /:slug/patients/:id            Patient profile
  /:slug/cases/:id               Case folder + clinical timeline
  /:slug/settings                Workspace settings (owner only)
  /:slug/settings/team           Team management + invitations (owner only)
  /:slug/settings/billing        Subscription + payment (owner only)
  /:slug/audit-log               Audit log viewer (owner only)
```

**`?next=` redirect rule:** When middleware redirects an unauthenticated user
to `/login`, it MUST append `?next=<original-path>`. After successful login,
redirect to `next` value. Never drop the destination.

### 2.4 Navigation Behavior

**Unauthenticated (public nav):**
- Top bar shows: logo | Features | Pricing | About | **Sign In** | **Get Started**
- Footer shows: Features | Pricing | About | Blog | Privacy | Terms | Sign In | Get Started

**Authenticated (workspace nav):**
- Top bar shows: logo | workspace switcher | user avatar dropdown
- "Sign In" and "Get Started" are GONE — replaced by avatar + dropdown
- Avatar dropdown contains: workspace list, settings link, sign out

**Workspace switcher logic:**
- 1 workspace → redirect directly to `/:slug/dashboard` after login
- 2+ workspaces → redirect to `/workspaces` (picker screen)
- Switcher is also reachable from avatar dropdown at any time

### 2.5 Responsive Layout Breakpoints

| Breakpoint     | Layout                                          |
|----------------|-------------------------------------------------|
| ≥ 1024px (lg)  | Full sidebar navigation + main content area     |
| ≥ 768px (md)   | Collapsible sidebar + full content              |
| < 768px (sm)   | Bottom navigation bar + full-screen panels      |

- Minimum supported viewport: **375px** (iPhone SE)
- All touch targets: minimum **44×44px** (WCAG 2.1 AA)
- Patient search and case entry form MUST work fully at 375px

### 2.6 Security Headers

These headers MUST be served on EVERY route (public and authenticated).
Configure in `next.config.js` headers or Vercel project settings — NOT in
application code so they apply to SSG pages too.

```
Content-Security-Policy    → strict; no inline scripts
X-Frame-Options            → DENY
X-Content-Type-Options     → nosniff
Referrer-Policy            → strict-origin-when-cross-origin
Permissions-Policy         → camera=(), microphone=(), geolocation=()
Strict-Transport-Security  → max-age=31536000; includeSubDomains
```

### 2.7 SEO Rules

- All public pages: full `<meta>` tags (title, description, og:title, og:description, og:image)
- `/sitemap.xml`: auto-generated, public routes ONLY — never include `/:slug/*`
- `robots.txt`: `Disallow: /` for all `/:slug/*` routes
- Landing page `/`: Schema.org `SoftwareApplication` structured data
- OpenGraph tags optimized for Facebook and LinkedIn (PH clinic community)

---

## 3. AUTHENTICATION & ONBOARDING

### 3.1 Auth Provider

**Supabase Auth only.** No custom JWT implementation, no NextAuth, no Clerk.

- Client: `supabase.auth.signUp()`, `supabase.auth.signInWithPassword()`
- Session handled by `@supabase/auth-helpers-nextjs` middleware
- Passwords: minimum 8 characters with complexity (Supabase enforces bcrypt)
- JWTs: expire after **1 hour**; refresh tokens after **30 days**
- Email verification: required before workspace is active

### 3.2 Signup Flow (Atomic — No Partial State)

The entire signup is one atomic operation. If any step fails, nothing persists.

```
Step 1: User fills /signup form
        Fields: Full Name, Email, Password, Clinic Name
        Validation:
          - email: valid format
          - password: min 8 chars, complexity enforced
          - clinic_name: 3–80 characters

Step 2: Frontend calls supabase.auth.signUp()
        clinic_name embedded in raw_user_meta_data

Step 3: DB trigger fires on auth.users INSERT:
        a) slug = clinic_name → lowercase, spaces→hyphens, strip special chars
        b) INSERT into workspaces (owner_id, slug, trial_ends_at = NOW()+7d)
        c) INSERT into profiles (id = auth.users.id, full_name)
        d) INSERT into workspace_members (workspace_id, user_id, role='owner')

Step 4: Post-signup redirect → /:slug/dashboard
        Show onboarding checklist
        Dispatch welcome email
```

**Slug uniqueness:** On collision, the DB transaction fails. The UI MUST show:
`"This workspace name is already taken. Please try another."`
Never auto-append suffixes or random strings. Never silently fallback.

### 3.3 Invitation Flow

- Route: `/invite/:token` — **SSR only** (token validated server-side)
- Token: secure random, single-use, 72-hour expiry
- Stored in `invitations` table (see Section 6)
- Accepted: sets `invitations.accepted_at`, inserts `workspace_members` row
- Role options for invitations: `doctor` or `staff` only (never `owner`)
- Invitation email contains direct link: `https://pris.app/invite/<token>`

---

## 4. MULTI-TENANCY RULES

**These rules are absolute. Violating them is a security bug.**

1. Every table that holds clinic data has a `workspace_id` column.
2. Every query MUST filter by `workspace_id`. This is also enforced by RLS
   (see Section 6.3) but the application layer must also set it explicitly.
3. The active `workspace_id` is stored in Zustand state after login/workspace
   selection. It is never derived from the URL alone.
4. A user leaving a workspace gets their `workspace_members` row soft-deleted.
   Their `profiles` row and `auth.users` row are untouched.
5. Cross-workspace data access is IMPOSSIBLE by design — RLS blocks it even if
   application code is buggy.

---

## 5. COMPLIANCE — RA 10173 (Philippine Data Privacy Act 2012)

**Read this section before touching any patient data field.**

### 5.1 Data Classification & Encryption

| Class | Fields                                                    | Storage          |
|-------|-----------------------------------------------------------|------------------|
| A     | clinical_notes, allergies, current_medications,           | BYTEA, encrypted |
|       | past_medical_history, family_medical_history,             | AES-256-GCM      |
|       | social_history, philhealth_pin, discount_id_number        | via pgsodium     |
| B     | home_address, mobile_number, email (patient),             | BYTEA, encrypted |
|       | date_of_birth, emergency_contact details                  | AES-256-GCM      |
| C     | surname, first_name, workspace metadata, roles,           | Standard Postgres |
|       | timestamps                                                | (no encryption)  |

**Encryption standard:** AES-256-GCM via Supabase `pgsodium` extension.
Functions: `crypto_aead_det_encrypt` / `crypto_aead_det_decrypt`.

**Key management:**
- One key per workspace, stored in **Supabase Vault**
- Keys are NEVER in application code, `.env` files, or logs
- Key rotation procedure must exist before Phase 9 launch

### 5.2 Immutability of Clinical Records

`case_entries` rows are **permanently immutable** after INSERT.

- No UPDATE permitted on `case_entries` — enforced at DB layer (RLS + no UPDATE policy)
- No DELETE permitted on `case_entries` — same enforcement
- Corrections create a NEW `case_entries` row with `parent_entry_id` set to the original
- The new row has `is_amendment = true`
- UI shows "Amended" badge on corrected entries
- Original entries remain visible with strikethrough annotation
- **This rule cannot be overridden by any role, including Owner**

### 5.3 Patient Data Rules

- Patient records use **soft delete only** (`deleted_at` timestamp). Hard DELETE is blocked.
- No patient data in URL parameters, logs, or error messages — ever.
- Erasure requests do NOT physically delete records. PII fields are set to NULL /
  replaced with `[Removed]`. Clinical records are retained for medico-legal purposes.
- Clinical records of deceased patients: retained minimum **10 years** (DOH guideline).
- Expired workspace data: retained **90 days** after LOCKED state, then hard purge.

### 5.4 Consent Requirement

A patient **cannot be enrolled** without a `patient_consents` row of type
`data_collection`. The UI must block the patient save button until consent is recorded.
Consent withdrawal is recorded via `withdrawn_at` — never by deleting the row.

### 5.5 Audit Log Rules

- Every access or modification to patient data writes an `audit_logs` row.
- Application roles have **INSERT only** on `audit_logs`. UPDATE and DELETE are revoked.
- Audit writes are **synchronous** — if the audit write fails, the originating
  transaction rolls back.
- Audit logs retained minimum **5 years**.
- Never purge audit logs during an active compliance investigation.

### 5.6 Data Breach Protocol

- NPC notification within **72 hours** of confirmed breach
- Affected workspace owners notified within **24 hours**
- Audit logs preserved and not purged during investigation

---

## 6. DATABASE — CANONICAL SCHEMA

**Source of truth. Do not deviate from column names, types, or constraints.**

### 6.1 Required Extensions

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";   -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";    -- Crypto utilities
CREATE EXTENSION IF NOT EXISTS "pgsodium";    -- AES-256-GCM field encryption
CREATE EXTENSION IF NOT EXISTS "pg_trgm";     -- Trigram patient search
CREATE EXTENSION IF NOT EXISTS "pg_cron";     -- Scheduled jobs (notification queue)
```

### 6.2 Table: `workspaces`

```sql
CREATE TABLE workspaces (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           TEXT NOT NULL UNIQUE,
  slug           TEXT NOT NULL UNIQUE,
  owner_id       UUID NOT NULL,          -- References auth.users.id
  trial_ends_at  TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

Rules:
- `slug` is permanent — never allow updates after creation
- `trial_ends_at = NOW() + 7 days` is set by the DB trigger at INSERT time
- `name` and `slug` are both UNIQUE — collision = graceful error to UI

### 6.3 Table: `subscriptions`

```sql
CREATE TABLE subscriptions (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id             UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  plan                     TEXT CHECK (plan IN ('starter','clinic','enterprise')),
  status                   TEXT CHECK (status IN (
                             'trial','active','past_due','locked',
                             'cancelled','deleted'
                           )) DEFAULT 'trial',
  paymongo_subscription_id TEXT UNIQUE,
  current_period_start     TIMESTAMP WITH TIME ZONE,
  current_period_end       TIMESTAMP WITH TIME ZONE,
  cancelled_at             TIMESTAMP WITH TIME ZONE,
  created_at               TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Subscription state machine transitions (only valid transitions):**
```
TRIAL     → ACTIVE      (owner subscribes before expiry)
TRIAL     → LOCKED      (trial_ends_at passed, no subscription)
ACTIVE    → PAST_DUE    (payment fails at renewal)
PAST_DUE  → ACTIVE      (payment retried successfully)
PAST_DUE  → LOCKED      (7-day grace period expired)
LOCKED    → ACTIVE      (owner pays outstanding balance)
ACTIVE    → CANCELLED   (owner cancels)
LOCKED    → DELETED     (90 days elapsed)
```

**LOCKED state behavior (enforced in application AND RLS):**
- All users: read-only access to existing records
- No new patients, no new case entries, no new prescriptions, no file uploads
- Persistent banner shown to all users with payment CTA
- Owner receives daily email reminders

### 6.4 Table: `profiles`

```sql
CREATE TABLE profiles (
  id          UUID PRIMARY KEY,   -- Must equal auth.users.id
  full_name   TEXT NOT NULL,
  avatar_url  TEXT,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 6.5 Table: `workspace_members`

```sql
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
```

Rules:
- One row per user per workspace — the UNIQUE constraint enforces this
- A user can belong to multiple workspaces (multiple rows, different workspace_id)
- Leaving = soft delete (set `deleted_at` or remove row — implementation TBD per phase)
- `role` never includes `patient` in this table (patient is a separate future phase)

### 6.6 Table: `invitations`

```sql
CREATE TABLE invitations (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  invited_by   UUID REFERENCES profiles(id),
  email        TEXT NOT NULL,
  role         TEXT CHECK (role IN ('doctor','staff')) NOT NULL,
  token        TEXT UNIQUE NOT NULL,   -- secure random, single-use
  expires_at   TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '72 hours'),
  accepted_at  TIMESTAMP WITH TIME ZONE,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 6.7 Table: `workspace_settings`

```sql
CREATE TABLE workspace_settings (
  workspace_id                UUID PRIMARY KEY REFERENCES workspaces(id) ON DELETE CASCADE,
  clinic_logo_url             TEXT,
  clinic_address              TEXT,
  clinic_contact_number       TEXT,
  philhealth_accreditation_no TEXT,
  tin                         TEXT,
  prescription_footer_text    TEXT,
  default_consultation_fee    NUMERIC(10,2),
  timezone                    TEXT DEFAULT 'Asia/Manila',
  updated_at                  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 6.8 Table: `patients`

```sql
CREATE TABLE patients (
  id                             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id                   UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  -- Class C (unencrypted)
  surname                        TEXT NOT NULL,
  first_name                     TEXT NOT NULL,
  middle_name                    TEXT,
  suffix                         TEXT,
  date_of_birth                  DATE NOT NULL,
  sex                            TEXT NOT NULL,   -- 'Male','Female','Intersex'
  gender_identity                TEXT,
  civil_status                   TEXT,            -- 'Single','Married','Legally Separated','Widowed'
  nationality                    TEXT DEFAULT 'Filipino',
  occupation                     TEXT,
  emergency_contact_name         TEXT,
  emergency_contact_relationship TEXT,
  emergency_contact_mobile       TEXT,
  hmo_details                    JSONB,           -- { provider, plan_type, member_id }
  -- Class B (BYTEA — encrypted via pgsodium)
  home_address                   BYTEA,
  mobile_number                  BYTEA,
  email                          BYTEA,
  -- Class A (BYTEA — encrypted via pgsodium)
  philhealth_pin                 BYTEA,           -- 12-digit
  discount_id_number             BYTEA,           -- SC or PWD ID
  allergies                      BYTEA,
  current_medications            BYTEA,
  past_medical_history           BYTEA,
  family_medical_history         BYTEA,
  social_history                 BYTEA,
  -- Metadata
  created_at                     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at                     TIMESTAMP WITH TIME ZONE  -- soft delete only
);

CREATE INDEX idx_patients_workspace ON patients(workspace_id);
CREATE INDEX idx_patients_search ON patients
  USING GIN (
    to_tsvector('simple',
      coalesce(surname,'') || ' ' || coalesce(first_name,'')
    )
  );
```

**Critical patient field rules:**
- Age is NEVER stored — always computed from `date_of_birth` at query/display time
- BMI is NEVER stored — always computed from `weight_kg` and `height_cm` in vitals
- All Class A and B fields are stored as BYTEA (encrypted). Never store as TEXT.
- Date format displayed in UI: `MM/DD/YYYY` (Philippine standard)
- Mobile number format: `+63` prefix with 10-digit local number
- PhilHealth PIN: 12-digit, encrypted

### 6.9 Table: `patient_consents`

```sql
CREATE TABLE patient_consents (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id             UUID REFERENCES patients(id) ON DELETE CASCADE,
  workspace_id           UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  collected_by           UUID REFERENCES profiles(id),
  consent_type           TEXT CHECK (consent_type IN (
                           'data_collection','clinical_processing',
                           'third_party_sharing','marketing_comms'
                         )),
  privacy_notice_version TEXT NOT NULL,
  collection_channel     TEXT CHECK (collection_channel IN (
                           'in_clinic_paper','in_clinic_digital',
                           'online_form','verbal_recorded'
                         )),
  consented              BOOLEAN NOT NULL,
  consented_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  withdrawn_at           TIMESTAMP WITH TIME ZONE,
  notes                  TEXT
);
```

### 6.10 Table: `cases`

```sql
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
```

### 6.11 Table: `case_entries` — IMMUTABLE

```sql
CREATE TABLE case_entries (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id         UUID REFERENCES cases(id) ON DELETE CASCADE,
  workspace_id    UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  author_id       UUID REFERENCES profiles(id),
  parent_entry_id UUID REFERENCES case_entries(id),  -- NULL unless amendment
  is_amendment    BOOLEAN DEFAULT false,
  vitals          JSONB,
  clinical_notes  BYTEA NOT NULL,  -- Always encrypted, Class A
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  -- NO updated_at — this table is append-only by design
);
```

**Vitals JSONB schema:**
```json
{
  "bp_systolic":       number,
  "bp_diastolic":      number,
  "heart_rate":        number,
  "temp_c":            number,
  "respiratory_rate":  number,
  "oxygen_saturation": number,
  "weight_kg":         number,
  "height_cm":         number
}
```
*(bmi is always computed on read, never stored)*

### 6.12 Table: `prescriptions` — IMMUTABLE

```sql
CREATE TABLE prescriptions (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_entry_id  UUID REFERENCES case_entries(id),
  patient_id     UUID REFERENCES patients(id),
  workspace_id   UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  authored_by    UUID REFERENCES profiles(id),
  medications    JSONB NOT NULL,
  diagnosis_note TEXT,
  is_printed     BOOLEAN DEFAULT false,
  printed_at     TIMESTAMP WITH TIME ZONE,
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Medications JSONB array item schema:**
```json
{
  "name":                  "string",
  "generic_name":          "string",
  "dosage":                "string",
  "route":                 "string",
  "frequency":             "string",
  "duration":              "string",
  "quantity":              "string",
  "instructions":          "string",
  "is_controlled_substance": boolean
}
```

### 6.13 Table: `patient_documents`

```sql
CREATE TABLE patient_documents (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id      UUID REFERENCES patients(id) ON DELETE CASCADE,
  workspace_id    UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  uploaded_by     UUID REFERENCES profiles(id),
  file_name       TEXT NOT NULL,
  file_type       TEXT NOT NULL,     -- MIME type
  file_size_bytes BIGINT,
  storage_path    TEXT NOT NULL,     -- Supabase Storage bucket path
  document_type   TEXT CHECK (document_type IN (
                    'lab_result','imaging','referral',
                    'consent_form','insurance','other'
                  )),
  description     TEXT,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 6.14 Table: `data_requests`

```sql
CREATE TABLE data_requests (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id    UUID REFERENCES workspaces(id),
  patient_id      UUID REFERENCES patients(id),
  request_type    TEXT CHECK (request_type IN (
                    'access','correction','erasure','portability','objection'
                  )),
  description     TEXT,
  status          TEXT DEFAULT 'pending' CHECK (status IN (
                    'pending','in_review','completed','rejected'
                  )),
  requested_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at     TIMESTAMP WITH TIME ZONE,
  resolved_by     UUID REFERENCES profiles(id),
  resolution_note TEXT
);
```

### 6.15 Table: `notifications`

```sql
CREATE TABLE notifications (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id   UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  recipient_id   UUID,
  recipient_type TEXT,         -- 'user' or 'patient'
  channel        TEXT CHECK (channel IN ('email','sms','in_app')),
  type           TEXT NOT NULL,
  payload        JSONB NOT NULL,
  status         TEXT DEFAULT 'pending'
                   CHECK (status IN ('pending','sent','failed','cancelled')),
  scheduled_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at        TIMESTAMP WITH TIME ZONE,
  error_message  TEXT,
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 6.16 Table: `audit_logs` — APPEND-ONLY

```sql
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

-- CRITICAL: These revocations are mandatory
REVOKE UPDATE, DELETE, TRUNCATE ON audit_logs FROM authenticated;
REVOKE UPDATE, DELETE, TRUNCATE ON audit_logs FROM anon;
```

---

## 6.3 Row Level Security (RLS) — Summary

**All tables must have RLS enabled.** The complete SQL lives in
`/supabase/migrations`. This is the policy summary — never shortcut it.

| Table              | SELECT                              | INSERT                           | UPDATE          | DELETE          |
|--------------------|-------------------------------------|----------------------------------|-----------------|-----------------|
| workspaces         | workspace members only              | any authenticated                | owner only      | BLOCKED         |
| workspace_members  | same workspace members              | owner only / invite acceptance   | owner only      | owner or self   |
| patients           | any workspace member (scoped)       | owner, doctor, staff             | owner, doctor, staff | BLOCKED (soft delete) |
| patient_consents   | same workspace member               | owner, doctor, staff             | owner, doctor   | BLOCKED         |
| cases              | same workspace member               | doctor only                      | doctor only     | BLOCKED         |
| case_entries       | same workspace member               | doctor only                      | BLOCKED         | BLOCKED         |
| prescriptions      | same workspace member               | doctor only                      | BLOCKED         | BLOCKED         |
| patient_documents  | same workspace member               | owner, doctor, staff             | BLOCKED         | BLOCKED         |
| data_requests      | same workspace member               | owner, doctor, staff             | owner only      | BLOCKED         |
| notifications      | same workspace member               | application / trigger            | application     | BLOCKED         |
| audit_logs         | owner only                          | all members (SECURITY DEFINER)   | BLOCKED         | BLOCKED         |

---

## 7. RBAC — ROLE PERMISSIONS

Four roles exist. The database is the authoritative enforcement layer.
Frontend role checks are UX-only and not trusted for security.

| Action                         | owner | doctor | staff | patient |
|--------------------------------|-------|--------|-------|---------|
| Create workspace               | YES   | —      | —     | —       |
| Invite users                   | YES   | OPT*   | —     | —       |
| Configure workspace settings   | YES   | —      | —     | —       |
| View billing / subscription    | YES   | —      | —     | —       |
| Create patient profile         | YES   | YES    | YES   | —       |
| Edit patient demographics      | YES   | YES    | YES   | —       |
| View patient demographics      | YES   | YES    | YES   | SELF    |
| Create case folder             | —     | YES    | —     | —       |
| View clinical timeline         | RO    | YES    | —     | SELF    |
| Create case entry / progress   | —     | YES    | —     | —       |
| Amend case entry               | —     | YES    | —     | —       |
| Issue prescription             | —     | YES    | —     | —       |
| Upload patient documents       | YES   | YES    | YES   | —       |
| View audit logs                | YES   | —      | —     | —       |
| Submit data subject request    | YES   | —      | —     | SELF    |

*OPT = optional privilege grantable by Owner
RO = read-only

**Owner cannot write clinical notes.** Owner's clinical timeline access is read-only.
**Staff cannot view clinical timelines, case notes, or prescriptions.**
**Staff can only see patient demographics.**

---

## 8. FILE STORAGE

**Platform:** Supabase Storage (S3-compatible)

**Buckets:**
- `patient-documents` — private, per-workspace RLS
- `clinic-assets` — private (logos, letterheads)
- `workspace-exports` — private, temporary; auto-purged after 24 hours

**Access pattern:**
- Application NEVER serves files directly
- All access via short-lived signed URLs generated by a Supabase Edge Function
- Edge Function verifies `workspace_id` and `role` before issuing URL
- Signed URL TTL: 60 minutes (viewing), 5 minutes (download)
- No permanent public URLs — ever

**Upload validation (server-side in Edge Function — security boundary):**
- Allowed MIME types: `application/pdf`, `image/jpeg`, `image/png`, `application/dicom`
- Max file size: **25 MB**
- MIME type must match file extension (no extension spoofing)
- Malicious file scan via ClamAV or VirusTotal API on upload

**Client-side validation is UX only — not a security control.**

---

## 9. SEARCH

### Patient Search

- Minimum 2 characters before search fires
- Debounce: **300ms** on keystroke
- Maximum **20** results per query
- Backed by GIN index on `tsvector` combining `surname` + `first_name`
- Uses `websearch_to_tsquery` for flexible query parsing
- Results always scoped to active `workspace_id` via RLS
- Returns: full name, date of birth (MM/DD/YYYY), mobile number, patient ID

**Never use `ILIKE` on large tables. Use the GIN index.**

```sql
-- Correct search query pattern
SELECT id, surname, first_name, date_of_birth
FROM patients
WHERE workspace_id = $1
  AND to_tsvector('simple', coalesce(surname,'') || ' ' || coalesce(first_name,''))
      @@ websearch_to_tsquery('simple', $2)
  AND deleted_at IS NULL
LIMIT 20;
```

### Clinical Note Search

Because `clinical_notes` is encrypted (BYTEA), full-text DB search is NOT
possible on that column. Two options (decision deferred to Phase 5):
1. Client-side search over decrypted notes (acceptable for < 500 entries per patient)
2. Non-encrypted `tags` / `summary` field alongside encrypted notes

**Never attempt to index or search the BYTEA `clinical_notes` column directly.**

---

## 10. BILLING & SUBSCRIPTIONS

**Payment processor: PayMongo** (Philippine-native)
**Supported methods:** GCash (primary), Maya, Visa/Mastercard, bank transfer (Enterprise annual)

**Plan limits:**

| Plan       | Seats  | Patients   | Storage | Price          |
|------------|--------|------------|---------|----------------|
| STARTER    | 2      | 500        | 2 GB    | PHP 499/month  |
| CLINIC     | 10     | Unlimited  | 20 GB   | PHP 1,299/month|
| ENTERPRISE | ∞      | Unlimited  | ∞       | Custom         |

**Trial:** 7 days, no credit card required. Email reminders: 3 days before, 1 day before, at expiry.

**LOCKED state is enforced in TWO places:**
1. RLS policies block write operations
2. Application middleware checks subscription status and shows lockout banner

Do not rely on only one layer.

---

## 11. NOTIFICATIONS

**Channels:**
- Email: Resend or Postmark (transactional)
- SMS: Semaphore (primary PH provider) or Vonage
- In-app: `notifications` table polled by frontend
- Push: Web Push API (Phase 8 PWA only)

**Processing:** Supabase Edge Function triggered via `pg_notify` or `pg_cron` (every 60 seconds).
**Retry:** Exponential backoff, max 3 attempts.

**Clinical notifications (SMS/email) require patient consent** (`clinical_processing` consent type).
System/account notifications do not require patient consent.

---

## 12. AUDIT LOGGING

**Every** read or write to patient data must produce an `audit_logs` INSERT.
The insert happens via a **SECURITY DEFINER trigger** — the application cannot
bypass it, and the application service account cannot write to audit_logs directly
outside of this trigger path.

**action_type values (use exact strings):**
`READ`, `CREATE`, `UPDATE`, `EXPORT`, `PRINT`, `DELETE_REQUEST`, `LOGIN`,
`PERMISSION_CHANGE`, `CONSENT_RECORD`, `ANONYMIZE`

**If the audit INSERT fails → the entire transaction rolls back.**
This is intentional. Audit integrity > operation success.

---

## 13. SECURITY CHECKLIST

Before marking any feature complete, verify:

- [ ] All DB queries filter by `workspace_id`
- [ ] No patient data appears in URL params, server logs, or error messages
- [ ] All Class A and B fields stored as BYTEA (never TEXT)
- [ ] File access uses Edge Function signed URLs (no direct storage links)
- [ ] RLS is enabled on the affected table
- [ ] Audit log is written for the operation
- [ ] Patient cannot be saved without `data_collection` consent
- [ ] `case_entries` UPDATE and DELETE are blocked (RLS policy exists)
- [ ] Security headers present on the affected routes
- [ ] `/invite/:token` route is SSR (not CSR/SSG)
- [ ] Subscription status checked before any write operation (LOCKED enforcement)

---

## 14. PWA (Phase 8)

PWA enhancement is **Phase 8** — do not implement before Phase 7 is complete.

Requirements:
- Web App Manifest: `name`, `short_name`, `icons`, `theme_color`, `display: standalone`
- Service Worker: read-cache strategy for recently viewed patient records only
- "Add to Home Screen" prompt: handle `beforeinstallprompt` for Android; iOS relies on
  Safari's "Share → Add to Home Screen" (no prompt API available)
- Offline fallback: static page shown for uncached routes
- Push: Web Push API (NOT Firebase Cloud Messaging — no native app)
- No App Store submission — distributed via URL only

---

## 15. LOCALIZATION RULES

These apply to all UI code and display logic:

| Concern         | Rule                                                           |
|-----------------|----------------------------------------------------------------|
| Date display    | Always `MM/DD/YYYY` — never `YYYY-MM-DD` or `DD/MM/YYYY`      |
| Date storage    | Always `DATE` or `TIMESTAMP WITH TIME ZONE` in the DB          |
| Timezone        | Default `Asia/Manila` (workspace setting). Always store UTC.   |
| Currency        | PHP (Philippine Peso). Symbol: `₱`. Format: `₱1,299.00`       |
| Phone numbers   | `+63` prefix, 10-digit local number. Validate this format.     |
| Language        | Filipino English (en-PH). No Tagalog translation in v1.0.      |
| i18n            | Architecture must support i18n even though v1.0 is en-PH only. |

---

## 16. WHAT NOT TO DO — COMMON MISTAKES

| ❌ Wrong                                      | ✅ Correct                                         |
|----------------------------------------------|----------------------------------------------------|
| Query patients without workspace_id filter   | Always filter by workspace_id                      |
| Store age in the DB                          | Compute from date_of_birth at display time         |
| Store BMI in the DB                          | Compute from vitals JSONB at display time          |
| Store encrypted fields as TEXT               | Store as BYTEA using pgsodium                      |
| Serve files via permanent public URL         | Issue signed URL via Edge Function (TTL 60 min)    |
| UPDATE or DELETE a case_entry                | Create a new row with is_amendment=true            |
| DELETE a patient record                      | Soft delete via deleted_at                         |
| Render /:slug/* as SSG or SSR                | Render as CSR (client-side SPA)                    |
| Render /invite/:token as SSG or CSR          | Render as SSR (server validates token)             |
| Auto-append suffix on slug collision         | Show error: "This workspace name is already taken" |
| Use ILIKE for patient search                 | Use GIN index with websearch_to_tsquery            |
| Put patient data in URL params               | Never — use state or POST body                     |
| Write audit log from application code        | Audit log written by SECURITY DEFINER trigger only |
| Skip consent before patient enrollment       | Block save until data_collection consent exists    |
| Allow DELETE on audit_logs                   | REVOKE DELETE from all roles — enforced at DB level|
| Use Firebase for push notifications          | Use Web Push API (PWA, Phase 8)                   |
| Build native app in v1.0                     | Web browser only — PWA in Phase 8                  |

---

## 17. IMPLEMENTATION PHASE REFERENCE

| Phase | Name                              | Duration |
|-------|-----------------------------------|----------|
| 0     | Infrastructure & Security         | 2 weeks  |
| 1     | Landing Page & Public Web         | 1 week   |
| 2     | Multi-Tenant Onboarding           | 2 weeks  |
| 3     | RBAC & Team Management            | 1 week   |
| 4     | Patient Enrollment                | 2 weeks  |
| 5     | Medical Case Timeline             | 3 weeks  |
| 6     | Billing & Subscription            | 2 weeks  |
| 7     | Notifications & Compliance        | 2 weeks  |
| 8     | PWA Enhancement                   | 1 week   |
| 9     | QA, Pentest & Launch              | 2 weeks  |

Do not implement features from a later phase before the earlier phase is
complete and tested. PWA (Phase 8) requires Phase 7 to be done.

---

## 18. PERFORMANCE TARGETS (Non-Functional Requirements)

| Metric                                  | Target                   |
|-----------------------------------------|--------------------------|
| Landing page LCP                        | < 2.5s on 4G (PH avg)   |
| Landing page CLS                        | < 0.1                    |
| Landing page Lighthouse Performance     | ≥ 90                     |
| Dashboard SPA hydration                 | < 1.5s on 4G             |
| Patient search response (p95)           | < 200ms                  |
| Clinical timeline (100 entries)         | < 800ms                  |
| API rate limit per workspace            | 1,000 req/min            |
| Uptime SLA                              | 99.5% (Supabase + Vercel)|

---

*This skill file is the authoritative ground truth for all PRIS development.*
*Source PRD: PRIS_PRD_v2.1.md. Update this file when the PRD changes.*
*Never infer decisions not listed here — ask the product owner instead.*
