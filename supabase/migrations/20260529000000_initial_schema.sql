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
