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
