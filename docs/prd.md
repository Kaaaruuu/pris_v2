================================================================================
PRODUCT REQUIREMENT DOCUMENT
Project PRIS: Patient Recording Information System
Version: 2.1 (Web-First Architecture Revision)
===

Target Market         : Small Private Clinics in the Philippines
Architecture          : Fully Web-Based, Multi-Tenant Workspace Model (Slack-style)
Frontend Hosting      : Vercel or Netlify (SSR/SSG capable)
Backend \& DB Platform : Supabase (Postgres, Auth, Storage, Edge Functions)
Compliance Standard   : Republic Act No. 10173 (Data Privacy Act of 2012)
Document Status       : Draft for Engineering Review
Last Updated          : 2025
Change Summary (v2.1) : Section 2 fully rewritten — desktop app replaced with
a web-first architecture featuring a public marketing
landing page and an in-browser SPA workspace, mirroring
the slack.com access model. All other sections preserved
and updated for consistency.



================================================================================
TABLE OF CONTENTS
===

1. Executive Summary \& Core Purpose
2. Web Application Architecture (Revised)
3. Multi-Tenant Workspace \& Registration Architecture
4. Role-Based Access Control (RBAC)
5. Compliance \& Data Privacy (RA 10173)
6. Subscription \& Billing Lifecycle
7. System Data Schema
8. File \& Document Storage
9. Search Architecture
10. Notification Service
11. Audit Log Design
12. Data Subject Rights Workflow
13. Patient Consent Management
14. Target Database Schema
15. Row Level Security (RLS) Policies
16. Implementation Phases
17. Non-Functional Requirements
18. Glossary



================================================================================

1. EXECUTIVE SUMMARY \& CORE PURPOSE
================================================================================

PRIS (Patient Recording Information System) is a secure, cloud-based digital
health record platform built specifically for small, private clinical practices
in the Philippines. The system replaces paper charts with a multi-tenant
workspace architecture delivered entirely through the web browser — no
installation required.

It enables clinic owners to:

* Discover and sign up for PRIS via a public marketing landing page
* Spin up dedicated, isolated workspaces for their practice
* Manage clinical teams with granular role-based permissions
* Process and store patient records in compliance with RA 10173
* Generate prescriptions, track clinical timelines, and manage cases
* Invite and manage staff and physicians under their workspace

The system is designed to be affordable, mobile-first, and operable with
minimal technical training — reflecting the operational reality of small
private clinics in Metro Manila, provincial cities, and rural areas across
the Philippines.

The web-first delivery model eliminates installation barriers, ensures all
users are always on the latest version, and makes the product accessible
from any modern browser on any device.



================================================================================
2. WEB APPLICATION ARCHITECTURE (REVISED)
===

## 2.1 Overview \& Guiding Model

PRIS is delivered as a single cohesive web application living under one
domain. The architecture mirrors Slack's web presence model:

https://pris.app/          → Public marketing landing page
https://pris.app/signup    → Clinic registration flow
https://pris.app/login     → Authentication entry point
https://pris.app/<slug>/   → Authenticated workspace (SPA)

Visitors, prospective customers, and authenticated staff all enter through
the same domain. The landing page serves marketing purposes while also
providing direct access to login and signup — exactly as slack.com does.

There is NO separate desktop app, native mobile app, or downloadable client
for v1.0. The web browser is the only required runtime.

## 2.2 URL \& Routing Structure

The application uses a path-based routing model:

PUBLIC ROUTES (no authentication required):
/                        Landing page (marketing)
/features                Feature breakdown page
/pricing                 Subscription plan comparison
/about                   Company and compliance information
/privacy                 Privacy Notice (RA 10173 compliant)
/terms                   Terms of Service
/blog                    Optional content marketing blog
/signup                  New clinic owner registration
/login                   Authentication page (email + password)
/forgot-password         Password reset request
/reset-password          Password reset token handler
/invite/:token           Invitation acceptance for staff/doctors
/verify-email            Email verification landing page

AUTHENTICATED ROUTES (JWT required; redirect to /login if absent):
/workspaces              Workspace switcher (multi-workspace users)
/:slug/dashboard         Workspace home / activity summary
/:slug/patients          Patient list and search
/:slug/patients/new      New patient enrollment form
/:slug/patients/:id      Patient profile view
/:slug/cases/:id         Clinical case folder and timeline
/:slug/settings          Workspace settings (owner only)
/:slug/settings/team     Team management and invitations
/:slug/settings/billing  Subscription and payment management
/:slug/audit-log         Audit log viewer (owner only)

## 2.3 Landing Page Specification

The landing page (/) is the primary marketing and conversion surface.
It must be fast, mobile-responsive, and speak directly to clinic operators
in the Philippine healthcare context. It follows the same structural
pattern as slack.com's homepage.

HERO SECTION

* Headline: Clear value proposition for Filipino clinic owners
Example: "Your Clinic's Records, Secure and Paperless"
* Sub-headline: Brief explanation of PRIS and RA 10173 compliance angle
* Primary CTA button: "Start Free Trial" → links to /signup
* Secondary CTA link: "Sign in to your workspace" → links to /login
* Hero illustration or screenshot of the workspace dashboard
* No-credit-card-required callout near primary CTA

SOCIAL PROOF SECTION (Post-launch)

* Clinic logos or testimonial cards
* Metrics: "X clinics trust PRIS" / "Y patient records secured"

FEATURE HIGHLIGHTS SECTION

* Three to four feature cards with icons:
Patient Records    — Secure digital charts, RA 10173 compliant
Clinical Timeline  — SOAP notes, vitals, prescriptions
Team Management    — Role-based access for doctors and staff
Philippine-First   — GCash, Maya, PhilHealth PIN support
* Each card links to /features for detail

PRICING TEASER SECTION

* Three-column plan overview (Starter / Clinic / Enterprise)
* "See full pricing" link to /pricing
* "Start free 7-day trial" CTA on each plan card

COMPLIANCE \& TRUST SECTION

* RA 10173 / Data Privacy Act 2012 badge
* AES-256 encryption callout
* NPC-aligned audit trail mention
* "Read our Privacy Notice" link

FOOTER

* Navigation links: Features, Pricing, About, Blog, Privacy, Terms
* "Sign In" and "Get Started" links (persistent, like Slack's footer)
* Contact email / support link
* Copyright and NPC compliance statement

PERFORMANCE REQUIREMENTS FOR LANDING PAGE

* Largest Contentful Paint (LCP): < 2.5 seconds on 4G (Philippines average)
* Cumulative Layout Shift (CLS): < 0.1
* Static or SSG-rendered for maximum CDN cacheability
* No authentication-dependent content on this route

## 2.4 Authentication Entry Points

The landing page and persistent navigation expose two entry points that
mirror Slack's header behavior:

"Sign In"      — Opens /login; users enter email + password
"Get Started"  — Opens /signup; new clinic owner registration

These links are present in:

* The landing page hero section
* The top navigation bar on all public pages
* The site footer

Once authenticated, the top navigation replaces "Sign In / Get Started"
with the user's avatar and workspace switcher, again mirroring Slack's
behavior.

## 2.5 Frontend Technology Stack

Framework      : React (with Next.js for SSR/SSG on public pages)
Styling        : Tailwind CSS
State          : React Context + Zustand for workspace state
Auth Client    : @supabase/auth-helpers-nextjs
API Client     : Supabase JS client (supabase-js v2)
Routing        : Next.js App Router
Hosting        : Vercel (recommended) or Netlify
CDN            : Vercel Edge Network (global, fast in SEA)

Key Decisions:
- Next.js is chosen to enable SSG for the landing page and public
routes (critical for SEO and LCP performance), while the workspace
SPA runs as a client-side application with Supabase real-time.
- Public pages (/,  /pricing, /features, /privacy, /terms) are
statically generated at build time. No server round-trip on load.
- Authenticated workspace pages (/:slug/\*) are client-side rendered
with Supabase JWT auth handled by the Next.js middleware layer.

## 2.6 Page Rendering Strategy

|Route pattern|Rendering mode|Rationale|
|-|-|-|
|/|SSG|Marketing; max CDN cache|
|/features, /pricing|SSG|Static content; SEO important|
|/privacy, /terms|SSG|Static legal content|
|/login, /signup|SSG + CSR|Static shell; form is client-side|
|/invite/:token|SSR|Token validated server-side|
|/:slug/\*|CSR (SPA)|Auth-gated; Supabase client auth|
|/workspaces|CSR|Requires auth; workspace list|

## 2.7 Navigation \& Workspace Switcher

After login, users with access to a single workspace are redirected
directly to /:slug/dashboard. Users with multiple workspace memberships
land on /workspaces, which presents a switcher card list — identical in
concept to Slack's workspace picker screen.

The workspace switcher is also accessible at any time from a persistent
element in the authenticated top navigation bar (avatar dropdown), allowing
a doctor who consults at two clinics to switch context without logging out.

## 2.8 Mobile Web Behavior

PRIS v1.0 targets the mobile browser as a first-class experience — not a
native app. The responsive layout adapts as follows:

Desktop (≥ 1024px)  : Full sidebar navigation + main content area
Tablet  (≥ 768px)   : Collapsible sidebar + full content
Mobile  (< 768px)   : Bottom navigation bar + full-screen content panels

All touch targets meet WCAG 2.1 minimum size (44x44px). The patient search
flow and case entry form must be fully operable on a 375px viewport
(iPhone SE minimum).

## 2.9 Progressive Web App (PWA) — Phase 2

In Phase 2, the web app will be enhanced with PWA capabilities:

* Web App Manifest for "Add to Home Screen" on iOS and Android
* Service Worker for offline read cache of recently viewed patient records
* Push notification support via Web Push API
* No App Store submission required — distributed via URL only

This allows clinic staff to bookmark and launch PRIS from their phone's
home screen, approximating a native app experience without the overhead
of a native build pipeline.

## 2.10 SEO \& Discoverability

* All public pages have proper meta tags (title, description, og:\*)
* /sitemap.xml auto-generated by Next.js for public routes only
(authenticated workspace routes are excluded from sitemap)
* robots.txt disallows indexing of all /:slug/\* routes
* Schema.org structured data (SoftwareApplication) on landing page
* OpenGraph tags for sharing on Facebook and LinkedIn
(relevant for Philippine clinic community groups)

## 2.11 Security Headers on All Pages

All routes — public and authenticated — must serve:
Content-Security-Policy    (strict; inline scripts disallowed)
X-Frame-Options            DENY
X-Content-Type-Options     nosniff
Referrer-Policy            strict-origin-when-cross-origin
Permissions-Policy         camera=(), microphone=(), geolocation=()
Strict-Transport-Security  max-age=31536000; includeSubDomains

Configured at the CDN/hosting layer (Vercel headers config or
Next.js middleware), not in application code, so they apply to
SSG-rendered pages as well.



================================================================================
3. MULTI-TENANT WORKSPACE \& REGISTRATION ARCHITECTURE
===

## 3.1 Workspace Provisioning (Slack-style Model)

Each clinic operates inside a secure, isolated database silo represented by
a unique workspace slug.

Example URL: https://pris.app/manila-dental-care

The Slug Concept:

* Slugs are globally unique, URL-safe, lowercase identifiers
* Derived automatically from the clinic name during onboarding
* Example transformation: "Manila Dental Care" -> "manila-dental-care"
* Slugs are permanent once set and cannot be reassigned

Trial Period:

* Newly created workspaces receive a 7-day free trial
* trial\_ends\_at is calculated as: CURRENT\_TIMESTAMP + INTERVAL '7 days'
* No credit card is required to start the trial
* All features are available during the trial period
* The owner receives email reminders at: 3 days before, 1 day before,
and at expiry

Workspace Uniqueness Enforcement:

* Clinic names and slugs must be globally unique in the database
* On collision, the database transaction fails gracefully
* The UI catches the unique constraint violation and displays:
"This workspace name is already taken. Please try another."
* No automatic suffixes or random strings are appended
* No silent fallbacks are permitted

## 3.2 Onboarding Transaction Flow

New clinic owner registration runs as an atomic operation to guarantee
data consistency. No partial state is permitted.

Step 1 — Landing Page CTA
The owner clicks "Start Free Trial" or "Get Started" on the landing page.
They are taken to /signup.

Step 2 — Frontend Form Collection
Fields collected: Full Name, Email, Password, Clinic Name
Validation: email format, password minimum 8 characters with complexity,
clinic name 3–80 characters

Step 3 — Supabase Auth Creation

* Frontend calls supabase.auth.signUp()
* clinic\_name is embedded in raw\_user\_meta\_data
* Password is hashed by Supabase Auth (bcrypt)
* Email verification is sent before workspace activation

Step 4 — Database Trigger Execution
A PostgreSQL trigger on auth.users INSERT fires automatically and:
a) Generates a URL-safe slug from clinic\_name
(lowercase, spaces to hyphens, special characters stripped)
b) Inserts a new record into the workspaces table
(sets owner\_id, trial\_ends\_at, slug)
c) Inserts a record into profiles (personal identity)
d) Inserts a record into workspace\_members
(links user to workspace with role = 'owner')

Step 5 — Post-Registration

* Owner is redirected to /:slug/dashboard in the browser
* Onboarding checklist is shown (invite staff, add first patient, etc.)
* Welcome email is dispatched via notification service
* Browser URL reflects the workspace slug — bookmarkable from day one

## 3.3 Multi-Workspace User Support

A single user (e.g., a doctor consulting at two clinics) may belong to
multiple workspaces. This is handled via the workspace\_members junction
table, not by creating duplicate auth accounts.

* Each workspace\_members row carries its own role for that workspace
* After login, the UI detects multiple memberships and routes to /workspaces
(the workspace picker screen described in Section 2.7)
* All data access is always scoped to the active workspace\_id
* Leaving a workspace soft-deletes the workspace\_members row
(data is retained; the user loses access)

## 3.4 Direct Workspace URL Access

Users may bookmark https://pris.app/<slug>/dashboard and navigate directly.
The Next.js middleware checks for a valid Supabase session:

* If authenticated and a member of <slug>: render the dashboard
* If authenticated but not a member of <slug>: show 403 workspace error
* If not authenticated: redirect to /login?next=/<slug>/dashboard
(the ?next parameter preserves the intended destination post-login)



================================================================================
4. ROLE-BASED ACCESS CONTROL (RBAC)
===

PRIS enforces a strict four-level role hierarchy. Permissions are enforced
at both the database layer (via Supabase RLS) and the frontend UI layer.
The frontend enforcement is a UX convenience only; the database layer is
the authoritative security boundary.

## 4.1 Role Definitions

OWNER

* Full administrative control over the workspace
* Invite and remove users; configure workspace settings
* View subscription and billing details
* Read-only view of all clinical timelines (cannot write clinical notes)
* Cannot be removed from workspace by any other role
* Can transfer ownership to a Doctor-role user

DOCTOR

* Full access to patient profiles (create, read, update)
* Create and manage case folders
* Create, append, and amend case entries (progress notes, vitals)
* Generate and print prescriptions
* Cannot access billing or workspace settings
* Cannot invite other users unless granted by Owner

STAFF (Nurse / Admin / Receptionist)

* Create and update patient demographic and contact data
* View patient profiles (demographics only)
* Cannot view clinical timelines, case notes, or prescriptions
* Cannot create or read diagnostic entries
* Can be granted optional patient invitation privilege by Owner

PATIENT (Future Phase — Read-Only Portal)

* View own records, lab results, and prescriptions
* Cannot view other patients
* Cannot write any data
* Access granted by Owner or Staff; separate auth flow

## 4.2 Permission Matrix

|Action|Owner|Doctor|Staff|Patient|
|-|-|-|-|-|
|Create workspace|YES|--|--|--|
|Invite users|YES|OPT\*|--|--|
|Configure workspace settings|YES|--|--|--|
|View billing / subscription|YES|--|--|--|
|Create patient profile|YES|YES|YES|--|
|Edit patient demographics|YES|YES|YES|--|
|View patient demographics|YES|YES|YES|SELF|
|Create case folder|--|YES|--|--|
|View clinical timeline|RO|YES|--|SELF|
|Create case entry / progress|--|YES|--|--|
|Amend case entry|--|YES|--|--|
|Issue prescription|--|YES|--|--|
|Upload patient documents|YES|YES|YES|--|
|View audit logs|YES|--|--|--|
|Submit data subject request|YES|--|--|SELF|

* OPT = optional privilege grantable by Owner
* RO  = read-only



================================================================================
5. COMPLIANCE \& DATA PRIVACY (RA 10173)
===

PRIS stores Sensitive Personal Information (SPI) as defined under the
Philippine Data Privacy Act of 2012. All engineering decisions must treat
compliance as a hard constraint, not a feature.

## 5.1 Data Classification

Class A — Strictly Sensitive (encrypted at rest, field-level):

* Clinical notes, diagnoses, prescriptions
* Allergies, medications, medical history
* Social history (smoking, alcohol, lifestyle)
* PhilHealth PIN, PWD/SC ID numbers

Class B — Personal (encrypted at rest, column-level):

* Home address, mobile number, email
* Emergency contact details
* Date of birth

Class C — Administrative (standard DB security):

* Surname, first name
* Workspace metadata, roles
* Timestamps

## 5.2 Field-Level Encryption

Encryption standard: AES-256-GCM via Supabase pgsodium extension
(crypto\_aead\_det\_encrypt / crypto\_aead\_det\_decrypt)

Key management:

* One encryption key per workspace, stored in Supabase Vault
* Keys are never stored in application code or environment variables
* Key rotation procedure must be documented before launch
* If a workspace is deleted, key is destroyed after 90-day grace period

Encrypted columns (minimum):

* patients.home\_address
* patients.mobile\_number
* patients.email
* patients.philhealth\_pin
* patients.discount\_id\_number
* patients.allergies
* patients.current\_medications
* patients.past\_medical\_history
* patients.family\_medical\_history
* patients.social\_history
* case\_entries.clinical\_notes

## 5.3 Access Tracking (Audit Logs)

Full specification in Section 11.

## 5.4 Immutable Case Records

* Clinical case entries, once created, cannot be modified or deleted
* Corrections are saved as new amendment entries linked via
parent\_entry\_id foreign key
* The UI shows an "Amended" badge on corrected entries
* Original entries remain visible in the timeline with a strikethrough
annotation
* This behavior cannot be overridden by any role, including Owner

## 5.5 Data Retention

* Active workspaces: data retained indefinitely
* Expired subscriptions (after grace period): workspace enters
read-only lockout; data retained for 90 days before deletion
* Deletion is soft-delete first (deleted\_at timestamp), followed by
hard purge after 90 days with written confirmation from Owner
* Clinical records of deceased patients are retained for a minimum of
10 years as per DOH guidelines for medico-legal purposes

## 5.6 Data Breach Protocol

* PRIS must have an incident response runbook before launch
* NPC notification is required within 72 hours of a confirmed breach
* Affected workspace owners must be notified within 24 hours
* Audit logs must be preserved and not purged during investigation



================================================================================
6. SUBSCRIPTION \& BILLING LIFECYCLE
===

## 6.1 Plan Tiers (Proposed)

STARTER (Post-trial default)
- Up to 2 user seats (Owner + 1)
- Up to 500 patient records
- 2 GB document storage
- Price: PHP 499/month

CLINIC (Most common tier)
- Up to 10 user seats
- Unlimited patient records
- 20 GB document storage
- Price: PHP 1,299/month

ENTERPRISE (Multi-branch)
- Unlimited seats
- Unlimited records and storage
- Priority support + SLA
- Custom pricing

## 6.2 Payment Methods (Philippines-first)

* GCash (primary — highest adoption)
* Maya (PayMaya)
* Credit/debit card (Visa, Mastercard)
* Bank transfer (for Enterprise annual plans)
* Payment processor: PayMongo (PH-native, handles GCash + Maya + cards)

## 6.3 Subscription State Machine

States:
TRIAL        -> Active with full features; expires at trial\_ends\_at
ACTIVE       -> Paid, full features
PAST\_DUE     -> Payment failed; grace period of 7 days; full access
LOCKED       -> Grace period expired; read-only access; no new records
CANCELLED    -> Owner-initiated; read-only until period end, then LOCKED
DELETED      -> 90 days after LOCKED; data purge scheduled

Transitions:
TRIAL     -> ACTIVE       (Owner subscribes before expiry)
TRIAL     -> LOCKED       (trial\_ends\_at passed, no subscription)
ACTIVE    -> PAST\_DUE     (payment fails at renewal)
PAST\_DUE  -> ACTIVE       (payment retried and succeeds)
PAST\_DUE  -> LOCKED       (7-day grace period expired)
LOCKED    -> ACTIVE       (Owner pays outstanding balance)
ACTIVE    -> CANCELLED    (Owner cancels subscription)
LOCKED    -> DELETED      (90 days elapsed)

## 6.4 Workspace Lockout Behavior

When workspace is in LOCKED state:
- All users can log in and view existing records (read-only)
- No new patients can be enrolled
- No new case entries can be created
- No new prescriptions can be issued
- Document uploads are disabled
- A persistent banner is shown to all users with payment CTA
- Owner receives daily email reminders

## 6.5 Billing Records

A subscriptions table tracks all billing state:
- workspace\_id, plan, status, current\_period\_start/end
- paymongo\_subscription\_id (external reference)
- cancelled\_at, trial\_ends\_at
An invoices table stores all payment history for BIR and owner records.



================================================================================
7. SYSTEM DATA SCHEMA
===

## 7.1 Patient Information Schema

All fields are mapped to administrative, billing, and clinical needs
within the Philippine healthcare ecosystem.

Patient Profile (Root Node)
|
+-- 1. Demographics \& Identification
|    +-- Surname, First Name, Middle Name, Suffix (Jr., III, etc.)
|    +-- Date of Birth (stored as DATE; UI format MM/DD/YYYY)
|    +-- Auto-Calculated Age (computed from date\_of\_birth, not stored)
|    +-- Sex Assigned at Birth (Male / Female / Intersex)
|    +-- Gender Identity (free text, optional)
|    +-- Civil Status (Single / Married / Legally Separated / Widowed)
|    +-- Nationality (default: Filipino)
|    +-- Occupation
|
+-- 2. Contact Information
|    +-- Permanent Home Address (encrypted)
|    +-- Mobile Number (primary; encrypted; used for OTP/SMS)
|    +-- Email Address (encrypted; for lab results, e-prescriptions)
|    +-- Emergency Contact: Full Name, Relationship, Mobile Number
|
+-- 3. Administrative \& Financial Data
|    +-- PhilHealth Identification Number (PIN) — 12-digit (encrypted)
|    +-- Senior Citizen / PWD ID Number (encrypted; for discounts)
|    +-- HMO / Private Insurance (JSONB: provider, plan type, member ID)
|
+-- 4. Clinical Baseline (all fields encrypted)
+-- Allergies (food, environmental, medication)
+-- Current Medications (name, dosage, frequency, duration)
+-- Past Medical History (prior surgeries, chronic illnesses)
+-- Family Medical History (hereditary conditions)
+-- Social History (smoking, alcohol, lifestyle factors)

## 7.2 Case Folder \& Progress Timeline Schema

Clinical records are organized in a parent-child hierarchy:
Patient -> Cases -> Case Entries -> Amendments (if corrected)

Case Folder Entity:
Represents an ongoing clinical episode.
Examples: "Hypertension Management", "Dental Restoration Episode",
"Maternity Monitoring — 2025", "Annual Physical Exam"

Fields:
- id, patient\_id, workspace\_id
- title (the episode name)
- status: 'active' or 'closed'
- created\_at

Case Entry Entity (Timeline Node):
An individual clinical encounter linked to a case folder.

Vitals sub-document (JSONB):
- temperature\_c     (degrees Celsius)
- bp\_systolic       (mmHg)
- bp\_diastolic      (mmHg)
- heart\_rate        (bpm)
- respiratory\_rate  (bpm)
- oxygen\_saturation (SpO2 %)
- weight\_kg
- height\_cm
- bmi              (auto-calculated, not stored)

Clinical Notes (encrypted TEXT):
- Subjective: chief complaint, patient-reported symptoms
- Objective: physical examination findings
- Assessment: working diagnosis, differential diagnoses
- Plan: prescriptions, lab orders, referrals, follow-up schedule

Immutability:
- created\_at is set once and never updated
- No UPDATE or DELETE is permitted on this table (enforced by RLS)
- Corrections create a new entry with parent\_entry\_id set to original

## 7.3 Prescription Entity

Fields:
- id, case\_entry\_id, patient\_id, workspace\_id, authored\_by
- medications: JSONB array of:
{ name, generic\_name, dosage, route, frequency, duration,
quantity, instructions, is\_controlled\_substance }
- diagnosis\_note: TEXT (printed on prescription)
- is\_printed: BOOLEAN
- printed\_at: TIMESTAMP
- created\_at: TIMESTAMP

Business rules:
- Only Doctor role can create prescriptions
- Prescriptions are immutable once created
- Printed prescriptions include clinic letterhead from workspace\_settings
- Controlled substances are flagged and logged separately

## 7.4 Patient Documents Entity

Fields:
- id, patient\_id, workspace\_id
- uploaded\_by (profiles.id)
- file\_name, file\_type (MIME type), file\_size\_bytes
- storage\_path (Supabase Storage bucket path)
- document\_type: ENUM ('lab\_result', 'imaging', 'referral',
'consent\_form', 'insurance', 'other')
- description: TEXT (optional)
- created\_at: TIMESTAMP

Security:
- Files stored in private Supabase Storage bucket
- Access via short-lived signed URLs (TTL: 60 minutes)
- No permanent public URLs permitted
- File type validation on upload (whitelist: PDF, JPG, PNG, DICOM)
- Maximum file size: 25 MB per file

## 7.5 Workspace Settings Entity

Separate from the workspaces table to keep core identity lean.

Fields:
- workspace\_id (PK, FK to workspaces)
- clinic\_logo\_url (Supabase Storage path)
- clinic\_address (printed on prescriptions/letterheads)
- clinic\_contact\_number
- philhealth\_accreditation\_no
- tin (Tax Identification Number, for billing/BIR)
- prescription\_footer\_text (custom legal disclaimer)
- default\_consultation\_fee (NUMERIC)
- timezone (default: 'Asia/Manila')
- updated\_at: TIMESTAMP



================================================================================
8. FILE \& DOCUMENT STORAGE
===

## 8.1 Storage Architecture

Platform: Supabase Storage (S3-compatible)

Buckets:
- patient-documents (private, per-workspace RLS)
- clinic-assets (private, logos and letterheads)
- workspace-exports (private, temporary; auto-purged after 24 hours)

## 8.2 Access Pattern

* Application never serves files directly
* All file access goes through a signed URL generated by a Supabase
Edge Function that verifies the requesting user's workspace\_id
and role before issuing the URL
* Signed URL TTL: 60 minutes for viewing, 5 minutes for download
* URLs are single-use where Supabase Storage supports it

## 8.3 Upload Validation

Server-side (Edge Function):
- MIME type must match file extension (no extension spoofing)
- File size limit: 25 MB
- Allowed types: application/pdf, image/jpeg, image/png,
application/dicom
- Malicious file scan: ClamAV via self-hosted scanner or
third-party API (e.g., VirusTotal) on upload

Client-side (UX only, not a security control):
- File picker restricted to accepted extensions
- Progress indicator on upload
- Immediate feedback on rejection



================================================================================
9. SEARCH ARCHITECTURE
===

## 9.1 Patient Search

Patient search must be fast, typo-tolerant, and scoped strictly to
the active workspace. ILIKE queries on large tables are not acceptable.

Strategy:
- Enable pg\_trgm extension in Postgres
- Create a GIN index on a generated tsvector column combining
surname, first\_name, middle\_name, and mobile\_number
- Use websearch\_to\_tsquery for flexible query parsing
- Results always filtered by workspace\_id (enforced by RLS)

Index definition:
CREATE INDEX idx\_patients\_search ON patients
USING GIN (
to\_tsvector('simple',
coalesce(surname,'') || ' ' ||
coalesce(first\_name,'') || ' ' ||
coalesce(middle\_name,'')
)
);

Search behavior:
- Minimum 2 characters before search fires
- Returns: full name, date of birth, mobile number, patient ID
- Debounce: 300ms on keystroke
- Maximum 20 results per query

## 9.2 Case \& Clinical Search

Doctors can search within a patient's case history by keyword.
Because clinical\_notes is encrypted, full-text search on that column
is not available at the database layer.

Options (in order of preference):
a) Client-side search over decrypted notes (acceptable for small
record sets per patient — typically < 500 entries)
b) Store a non-encrypted summary/tags field alongside encrypted notes
for indexing (requires careful UX to avoid leaking SPI)

This decision is deferred to Phase 4 engineering design.



================================================================================
10. NOTIFICATION SERVICE
===

## 10.1 Channels

SMS  : Semaphore (primary PH provider) or Vonage
Email: Resend or Postmark (transactional)
Push : Web Push API via Service Worker (Phase 2 PWA)
In-app: notifications table polled by frontend

## 10.2 Notification Types

SYSTEM / ACCOUNT:
- Email verification on signup
- Trial expiry reminders (3 days, 1 day before)
- Payment failure alert
- Workspace lockout notice
- New user invitation (email + SMS)

CLINICAL (requires patient consent for SMS/email):
- Appointment reminders (24h and 2h before)
- Lab result availability notification
- Prescription ready for pickup
- Follow-up due reminder

## 10.3 Notification Queue Schema

CREATE TABLE notifications (
id            UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),
workspace\_id  UUID REFERENCES workspaces(id) ON DELETE CASCADE,
recipient\_id  UUID,             -- profiles.id or patient identifier
recipient\_type TEXT,            -- 'user' or 'patient'
channel       TEXT,             -- 'email', 'sms', 'in\_app'
type          TEXT NOT NULL,    -- notification type key
payload       JSONB NOT NULL,   -- message content / template vars
status        TEXT DEFAULT 'pending', -- pending/sent/failed/cancelled
scheduled\_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
sent\_at       TIMESTAMP WITH TIME ZONE,
error\_message TEXT,
created\_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

Processing: Supabase Edge Function triggered on pg\_notify or cron
(pg\_cron extension, runs every 60 seconds)
Retry logic: exponential backoff, max 3 attempts



================================================================================
11. AUDIT LOG DESIGN
===

## 11.1 Audit Log Table

The audit\_logs table must be owned by a restricted database role.
Application users have INSERT only. UPDATE and DELETE are never granted
to any application role. The table is the system of record for all
NPC compliance reporting.

CREATE TABLE audit\_logs (
id                  UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),
workspace\_id        UUID NOT NULL,
operator\_profile\_id UUID NOT NULL,   -- who performed the action
patient\_id          UUID,            -- which patient record (if applicable)
resource\_type       TEXT NOT NULL,   -- 'patient', 'case\_entry', 'prescription', etc.
resource\_id         UUID NOT NULL,   -- the specific record accessed/modified
action\_type         TEXT NOT NULL,   -- 'READ', 'CREATE', 'UPDATE', 'EXPORT',
-- 'PRINT', 'DELETE\_REQUEST', 'LOGIN',
-- 'PERMISSION\_CHANGE'
old\_value           JSONB,           -- state before change (for UPDATE actions)
new\_value           JSONB,           -- state after change (for UPDATE actions)
ip\_address          INET,
user\_agent          TEXT,
session\_id          TEXT,
timestamp           TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

## 11.2 Enforcement Mechanism

* A SECURITY DEFINER trigger fires on every INSERT, UPDATE (blocked),
and relevant SELECT on protected tables
* The trigger function writes to audit\_logs as a privileged role
* The application service account cannot bypass this trigger
* Audit log writes are synchronous; if the audit write fails,
the originating transaction is rolled back

## 11.3 Log Retention

* Audit logs are retained for a minimum of 5 years (RA 10173 guidance)
* Logs are never purged during an active compliance investigation
* Monthly log exports to cold storage (Supabase Storage or S3)
should be implemented for long-term archival



================================================================================
12. DATA SUBJECT RIGHTS WORKFLOW
===

Under RA 10173 Section 16, patients have the right to:

* Access a copy of their personal data
* Correct inaccurate personal data
* Request erasure or blocking of data
* Object to processing

## 12.1 Data Requests Table

CREATE TABLE data\_requests (
id              UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),
workspace\_id    UUID REFERENCES workspaces(id),
patient\_id      UUID REFERENCES patients(id),
request\_type    TEXT CHECK (request\_type IN (
'access', 'correction', 'erasure', 'portability',
'objection'
)),
description     TEXT,
status          TEXT DEFAULT 'pending' CHECK (status IN (
'pending', 'in\_review', 'completed', 'rejected'
)),
requested\_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
resolved\_at     TIMESTAMP WITH TIME ZONE,
resolved\_by     UUID REFERENCES profiles(id),
resolution\_note TEXT
);

## 12.2 Erasure Request Behavior

IMPORTANT: Erasure requests do NOT physically delete records.

On approved erasure:
- PII fields in patients are set to NULL
(name fields replaced with "\[Removed]", contact fields NULLed)
- The patient record remains to preserve clinical record integrity
- Case entries and clinical data are retained for medico-legal purposes
- A data\_requests record marks the erasure as completed
- An audit\_log entry records the anonymization event

The clinic owner is responsible for reviewing and actioning requests
within 15 working days as required by the DPA.



================================================================================
13. PATIENT CONSENT MANAGEMENT
===

Under RA 10173, processing of Sensitive Personal Information requires
explicit, documented, and informed consent from the data subject.

## 13.1 Consent Table

CREATE TABLE patient\_consents (
id                    UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),
patient\_id            UUID REFERENCES patients(id) ON DELETE CASCADE,
workspace\_id          UUID REFERENCES workspaces(id) ON DELETE CASCADE,
collected\_by          UUID REFERENCES profiles(id),
consent\_type          TEXT CHECK (consent\_type IN (
'data\_collection', 'clinical\_processing',
'third\_party\_sharing', 'marketing\_comms'
)),
privacy\_notice\_version TEXT NOT NULL, -- version of the privacy notice shown
collection\_channel    TEXT CHECK (collection\_channel IN (
'in\_clinic\_paper', 'in\_clinic\_digital',
'online\_form', 'verbal\_recorded'
)),
consented             BOOLEAN NOT NULL,
consented\_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
withdrawn\_at          TIMESTAMP WITH TIME ZONE,
notes                 TEXT
);

## 13.2 Consent Workflow

* A patient cannot be enrolled without recording data\_collection consent
* The UI blocks patient save until at least one consent record exists
* The privacy notice version is stored so future changes are traceable
* Consent withdrawal is recorded (not deleted) via withdrawn\_at
* Withdrawn consent triggers a data\_requests review workflow



================================================================================
14. TARGET DATABASE SCHEMA
===

\-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pgsodium";
CREATE EXTENSION IF NOT EXISTS "pg\_trgm";
CREATE EXTENSION IF NOT EXISTS "pg\_cron";

\-- ============================================================
-- WORKSPACES
-- ============================================================
CREATE TABLE workspaces (
id             UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),
name           TEXT NOT NULL UNIQUE,
slug           TEXT NOT NULL UNIQUE,
owner\_id       UUID NOT NULL,                -- References auth.users
trial\_ends\_at  TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
created\_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

\-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
CREATE TABLE subscriptions (
id                       UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),
workspace\_id             UUID REFERENCES workspaces(id) ON DELETE CASCADE,
plan                     TEXT CHECK (plan IN ('starter','clinic','enterprise')),
status                   TEXT CHECK (status IN (
'trial','active','past\_due','locked',
'cancelled','deleted'
)) DEFAULT 'trial',
paymongo\_subscription\_id TEXT UNIQUE,
current\_period\_start     TIMESTAMP WITH TIME ZONE,
current\_period\_end       TIMESTAMP WITH TIME ZONE,
cancelled\_at             TIMESTAMP WITH TIME ZONE,
created\_at               TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

\-- ============================================================
-- PROFILES (Personal Identity — separate from workspace membership)
-- ============================================================
CREATE TABLE profiles (
id          UUID PRIMARY KEY,              -- Maps to auth.users.id
full\_name   TEXT NOT NULL,
avatar\_url  TEXT,
created\_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

\-- ============================================================
-- WORKSPACE MEMBERS (Junction table — supports multi-workspace)
-- ============================================================
CREATE TABLE workspace\_members (
id           UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),
workspace\_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
user\_id      UUID REFERENCES profiles(id)  ON DELETE CASCADE,
role         TEXT CHECK (role IN ('owner','doctor','staff')) NOT NULL,
invited\_by   UUID REFERENCES profiles(id),
invited\_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
accepted\_at  TIMESTAMP WITH TIME ZONE,
UNIQUE (workspace\_id, user\_id)
);

\-- ============================================================
-- INVITATIONS
-- ============================================================
CREATE TABLE invitations (
id           UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),
workspace\_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
invited\_by   UUID REFERENCES profiles(id),
email        TEXT NOT NULL,
role         TEXT CHECK (role IN ('doctor','staff')) NOT NULL,
token        TEXT UNIQUE NOT NULL,           -- secure random, single-use
expires\_at   TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '72 hours'),
accepted\_at  TIMESTAMP WITH TIME ZONE,
created\_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

\-- ============================================================
-- WORKSPACE SETTINGS
-- ============================================================
CREATE TABLE workspace\_settings (
workspace\_id                  UUID PRIMARY KEY REFERENCES workspaces(id)
ON DELETE CASCADE,
clinic\_logo\_url               TEXT,
clinic\_address                TEXT,
clinic\_contact\_number         TEXT,
philhealth\_accreditation\_no   TEXT,
tin                           TEXT,
prescription\_footer\_text      TEXT,
default\_consultation\_fee      NUMERIC(10,2),
timezone                      TEXT DEFAULT 'Asia/Manila',
updated\_at                    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

\-- ============================================================
-- PATIENTS
-- ============================================================
CREATE TABLE patients (
id                             UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),
workspace\_id                   UUID REFERENCES workspaces(id) ON DELETE CASCADE,
-- Demographics
surname                        TEXT NOT NULL,
first\_name                     TEXT NOT NULL,
middle\_name                    TEXT,
suffix                         TEXT,
date\_of\_birth                  DATE NOT NULL,
sex                            TEXT NOT NULL,
gender\_identity                TEXT,
civil\_status                   TEXT,
nationality                    TEXT DEFAULT 'Filipino',
occupation                     TEXT,
-- Contact (encrypted)
home\_address                   BYTEA,           -- encrypted
mobile\_number                  BYTEA,           -- encrypted
email                          BYTEA,           -- encrypted
emergency\_contact\_name         TEXT,
emergency\_contact\_relationship TEXT,
emergency\_contact\_mobile       TEXT,
-- Administrative (encrypted)
philhealth\_pin                 BYTEA,           -- encrypted, 12-digit
discount\_id\_number             BYTEA,           -- encrypted, SC or PWD ID
hmo\_details                    JSONB,
-- Clinical Baseline (encrypted)
allergies                      BYTEA,           -- encrypted
current\_medications            BYTEA,           -- encrypted
past\_medical\_history           BYTEA,           -- encrypted
family\_medical\_history         BYTEA,           -- encrypted
social\_history                 BYTEA,           -- encrypted
-- Metadata
created\_at                     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
deleted\_at                     TIMESTAMP WITH TIME ZONE   -- soft delete
);

CREATE INDEX idx\_patients\_workspace ON patients(workspace\_id);
CREATE INDEX idx\_patients\_search ON patients
USING GIN (
to\_tsvector('simple',
coalesce(surname,'') || ' ' || coalesce(first\_name,'')
)
);

\-- ============================================================
-- PATIENT CONSENTS
-- ============================================================
CREATE TABLE patient\_consents (
id                     UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),
patient\_id             UUID REFERENCES patients(id) ON DELETE CASCADE,
workspace\_id           UUID REFERENCES workspaces(id) ON DELETE CASCADE,
collected\_by           UUID REFERENCES profiles(id),
consent\_type           TEXT CHECK (consent\_type IN (
'data\_collection','clinical\_processing',
'third\_party\_sharing','marketing\_comms'
)),
privacy\_notice\_version TEXT NOT NULL,
collection\_channel     TEXT CHECK (collection\_channel IN (
'in\_clinic\_paper','in\_clinic\_digital',
'online\_form','verbal\_recorded'
)),
consented              BOOLEAN NOT NULL,
consented\_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
withdrawn\_at           TIMESTAMP WITH TIME ZONE,
notes                  TEXT
);

\-- ============================================================
-- CASES
-- ============================================================
CREATE TABLE cases (
id           UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),
patient\_id   UUID REFERENCES patients(id)   ON DELETE CASCADE,
workspace\_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
title        TEXT NOT NULL,
status       TEXT CHECK (status IN ('active','closed')) DEFAULT 'active',
created\_by   UUID REFERENCES profiles(id),
created\_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
closed\_at    TIMESTAMP WITH TIME ZONE
);

\-- ============================================================
-- CASE ENTRIES (immutable clinical timeline)
-- ============================================================
CREATE TABLE case\_entries (
id              UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),
case\_id         UUID REFERENCES cases(id) ON DELETE CASCADE,
workspace\_id    UUID REFERENCES workspaces(id) ON DELETE CASCADE,
author\_id       UUID REFERENCES profiles(id),
parent\_entry\_id UUID REFERENCES case\_entries(id), -- set if this is an amendment
is\_amendment    BOOLEAN DEFAULT false,
vitals          JSONB,
-- vitals schema: { bp\_systolic, bp\_diastolic, heart\_rate, temp\_c,
--                  respiratory\_rate, oxygen\_saturation, weight\_kg, height\_cm }
clinical\_notes  BYTEA NOT NULL,                   -- encrypted
created\_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- NOTE: No updated\_at. This record is immutable by design.
);

\-- ============================================================
-- PRESCRIPTIONS
-- ============================================================
CREATE TABLE prescriptions (
id             UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),
case\_entry\_id  UUID REFERENCES case\_entries(id),
patient\_id     UUID REFERENCES patients(id),
workspace\_id   UUID REFERENCES workspaces(id) ON DELETE CASCADE,
authored\_by    UUID REFERENCES profiles(id),
medications    JSONB NOT NULL,
-- medications schema: \[{ name, generic\_name, dosage, route, frequency,
--                         duration, quantity, instructions,
--                         is\_controlled\_substance }]
diagnosis\_note TEXT,
is\_printed     BOOLEAN DEFAULT false,
printed\_at     TIMESTAMP WITH TIME ZONE,
created\_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

\-- ============================================================
-- PATIENT DOCUMENTS
-- ============================================================
CREATE TABLE patient\_documents (
id            UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),
patient\_id    UUID REFERENCES patients(id) ON DELETE CASCADE,
workspace\_id  UUID REFERENCES workspaces(id) ON DELETE CASCADE,
uploaded\_by   UUID REFERENCES profiles(id),
file\_name     TEXT NOT NULL,
file\_type     TEXT NOT NULL,
file\_size\_bytes BIGINT,
storage\_path  TEXT NOT NULL,
document\_type TEXT CHECK (document\_type IN (
'lab\_result','imaging','referral',
'consent\_form','insurance','other'
)),
description   TEXT,
created\_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

\-- ============================================================
-- DATA REQUESTS (RA 10173 — Data Subject Rights)
-- ============================================================
CREATE TABLE data\_requests (
id              UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),
workspace\_id    UUID REFERENCES workspaces(id),
patient\_id      UUID REFERENCES patients(id),
request\_type    TEXT CHECK (request\_type IN (
'access','correction','erasure',
'portability','objection'
)),
description     TEXT,
status          TEXT DEFAULT 'pending' CHECK (status IN (
'pending','in\_review','completed','rejected'
)),
requested\_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
resolved\_at     TIMESTAMP WITH TIME ZONE,
resolved\_by     UUID REFERENCES profiles(id),
resolution\_note TEXT
);

\-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
id              UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),
workspace\_id    UUID REFERENCES workspaces(id) ON DELETE CASCADE,
recipient\_id    UUID,
recipient\_type  TEXT,
channel         TEXT CHECK (channel IN ('email','sms','in\_app')),
type            TEXT NOT NULL,
payload         JSONB NOT NULL,
status          TEXT DEFAULT 'pending'
CHECK (status IN ('pending','sent','failed','cancelled')),
scheduled\_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
sent\_at         TIMESTAMP WITH TIME ZONE,
error\_message   TEXT,
created\_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

\-- ============================================================
-- AUDIT LOGS (append-only — application role has INSERT only)
-- ============================================================
CREATE TABLE audit\_logs (
id                   UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),
workspace\_id         UUID NOT NULL,
operator\_profile\_id  UUID NOT NULL,
patient\_id           UUID,
resource\_type        TEXT NOT NULL,
resource\_id          UUID NOT NULL,
action\_type          TEXT NOT NULL CHECK (action\_type IN (
'READ','CREATE','UPDATE','EXPORT','PRINT',
'DELETE\_REQUEST','LOGIN','PERMISSION\_CHANGE',
'CONSENT\_RECORD','ANONYMIZE'
)),
old\_value            JSONB,
new\_value            JSONB,
ip\_address           INET,
user\_agent           TEXT,
session\_id           TEXT,
timestamp            TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

\-- Audit logs: revoke DELETE and UPDATE from all application roles
-- (enforced at DB role level, not just RLS)
REVOKE UPDATE, DELETE, TRUNCATE ON audit\_logs FROM authenticated;
REVOKE UPDATE, DELETE, TRUNCATE ON audit\_logs FROM anon;



================================================================================
15. ROW LEVEL SECURITY (RLS) POLICIES
===

All tables must have RLS enabled. The following summarizes core policies.
Complete policy SQL is maintained in the /supabase/migrations directory.

## 15.1 Core Principle

Every query is automatically filtered by workspace\_id, scoped to the
authenticated user's active workspace membership. Users outside a workspace
cannot read, write, or even confirm the existence of records in it.

## 15.2 Policy Summary

WORKSPACES
SELECT: User must be a member of the workspace
INSERT: Anyone authenticated (triggers workspace creation flow)
UPDATE: Owner only
DELETE: Blocked for all roles (use subscription state machine)

WORKSPACE\_MEMBERS
SELECT: Members of the same workspace
INSERT: Owner only (or invitation acceptance function)
UPDATE: Owner only (role changes)
DELETE: Owner only, or self (leaving workspace)

PATIENTS
SELECT: workspace\_members with any role, scoped to workspace\_id
INSERT: workspace\_members with role IN ('owner','doctor','staff')
UPDATE: workspace\_members with role IN ('owner','doctor','staff')
DELETE: Blocked — use soft delete via deleted\_at

CASE\_ENTRIES
SELECT: workspace\_members, scoped by workspace\_id
INSERT: workspace\_members with role = 'doctor'
UPDATE: BLOCKED for all roles (immutability enforced at DB layer)
DELETE: BLOCKED for all roles

PRESCRIPTIONS
SELECT: workspace\_members, scoped by workspace\_id
INSERT: workspace\_members with role = 'doctor'
UPDATE: BLOCKED
DELETE: BLOCKED

AUDIT\_LOGS
SELECT: workspace\_members with role = 'owner'
INSERT: All authenticated workspace members (via SECURITY DEFINER trigger)
UPDATE: BLOCKED
DELETE: BLOCKED



================================================================================
16. IMPLEMENTATION PHASES
===

## PHASE 0 — Infrastructure \& Security Foundation (2 weeks)

* Supabase project setup (prod + staging environments)
* Enable all required extensions (uuid-ossp, pgsodium, pg\_trgm, pg\_cron)
* Configure Supabase Vault for workspace encryption keys
* Create all tables and indexes per Section 14
* Implement audit\_log table with role-level restrictions
* Write and test the workspace creation DB trigger
* Implement base RLS policies for all tables
* Configure Supabase Auth (email templates, OTP settings)
* Set up CI/CD pipeline with migration runner
* Document encryption key rotation procedure
* Initialize Next.js project with Vercel deployment pipeline
* Configure security headers (CSP, HSTS, X-Frame-Options) in
next.config.js and Vercel headers
* Set up robots.txt and sitemap.xml configuration

## PHASE 1 — Landing Page \& Public Web Presence (1 week)

* Build and deploy the marketing landing page (/)
* Hero section with "Start Free Trial" and "Sign In" CTAs
* Features section (/features), Pricing page (/pricing)
* Privacy Notice (/privacy) and Terms of Service (/terms)
* Static SEO meta tags and OpenGraph data
* Mobile-responsive layout (375px minimum viewport)
* All public pages SSG-rendered and cached at CDN edge

## PHASE 2 — Multi-Tenant Onboarding (2 weeks)

* Owner signup form at /signup (name, email, password, clinic name)
* Workspace creation trigger testing (slug generation, uniqueness)
* Post-signup redirect to /:slug/dashboard
* /login page with email + password authentication
* ?next= redirect parameter support on /login
* Invitation flow via /invite/:token (email + SSR token validation)
* /workspaces workspace picker for multi-workspace users
* Workspace switcher in authenticated top navigation bar
* Basic workspace settings page (name, logo, contact)
* Trial period enforcement (lockout after 7 days without subscription)

## PHASE 3 — Role-Based Access \& Team Management (1 week)

* RBAC enforcement testing across all roles
* Team management UI at /:slug/settings/team
(view members, change roles, remove members)
* Pending invitations UI
* Role-based navigation (staff cannot see clinical menu items)

## PHASE 4 — Patient Enrollment Matrix (2 weeks)

* Patient creation form with all fields from Section 7.1
* Client-side field validation (PhilHealth PIN format, mobile format)
* Encryption integration for Class A and B fields
* Patient list view with search (pg\_trgm backed)
* Patient profile view page
* Consent capture UI (required before profile save)
* Document upload (lab results, ID copies)

## PHASE 5 — Medical Case Timeline (3 weeks)

* Case folder creation and management
* Case entry form (vitals + SOAP notes)
* Clinical timeline view (chronological, most recent first)
* Amendment workflow (new entry linked to parent)
* Prescription creation and print layout
* Case status management (active / closed)
* Staff access restrictions (timeline hidden from staff role)

## PHASE 6 — Billing \& Subscription Lifecycle (2 weeks)

* PayMongo integration (GCash, Maya, card)
* Subscription state machine implementation
* Workspace lockout enforcement on LOCKED state
* Trial expiry email reminders (via notification service)
* Payment history and invoice view for Owner at /:slug/settings/billing
* Billing management page (upgrade, cancel, update payment method)

## PHASE 7 — Notifications \& Compliance Features (2 weeks)

* Notification queue and Edge Function processor
* SMS integration via Semaphore
* Audit log viewer UI at /:slug/audit-log for Owner
* Data subject rights request form and workflow
* Data export (patient record PDF export for portability requests)

## PHASE 8 — PWA Enhancement (1 week)

* Web App Manifest (name, icons, theme\_color, display: standalone)
* Service Worker registration with read-cache strategy for
recently viewed patient records
* "Add to Home Screen" prompt handling (iOS and Android)
* Offline fallback page for uncached routes

## PHASE 9 — Quality, Performance \& Launch (2 weeks)

* End-to-end penetration testing
* RLS policy audit (verify no cross-workspace data leakage)
* Load testing (target: 200 concurrent users, p95 < 500ms)
* Lighthouse audit on landing page (target: Performance ≥ 90)
* NPC compliance self-audit against RA 10173 checklist
* Privacy Notice and Terms of Service (reviewed by PH data privacy counsel)
* Data Processing Agreement (DPA) template for clinic-patient relationship
* Soft launch to 5 pilot clinics



================================================================================
17. NON-FUNCTIONAL REQUIREMENTS
===

## 17.1 Performance

* Landing page LCP: < 2.5 seconds on 4G (Philippines average)
* Patient search response: < 200ms (p95)
* Dashboard page load (SPA hydration): < 1.5 seconds on 4G
* Clinical timeline load (100 entries): < 800ms
* File upload feedback: immediate progress indication
* API rate limit: 1,000 requests/minute per workspace

## 17.2 Availability

* Target SLA: 99.5% uptime (Supabase managed + Vercel edge)
* Planned maintenance windows communicated 48 hours in advance
* Read-only fallback mode during Supabase outages where feasible

## 17.3 Security

* All traffic over HTTPS/TLS 1.3 minimum (enforced by Vercel)
* JWTs expire after 1 hour; refresh tokens after 30 days
* Passwords minimum 8 characters; bcrypt hashing (handled by Supabase)
* No patient data in URL parameters, logs, or error messages
* Content Security Policy headers on all pages (see Section 2.11)
* OWASP Top 10 review before Phase 9 launch
* robots.txt excludes all /:slug/\* routes from indexing

## 17.4 Browser \& Device Support

* Web: Chrome 100+, Firefox 100+, Safari 15+, Edge 100+
* Mobile web: iOS Safari 15+, Android Chrome 100+
* Minimum viewport: 375px (iPhone SE)
* Offline capability: Phase 8 (Service Worker read cache)

## 17.5 Localization

* Language: Filipino English (en-PH) — no Tagalog translation required
for v1.0 but architecture must support i18n
* Date format: MM/DD/YYYY (standard PH clinical practice)
* Currency: PHP (Philippine Peso)
* Phone number format: +63 prefix with local 10-digit format



================================================================================
18. GLOSSARY
===

Amendment      : A new case\_entry created to correct a prior entry,
linked via parent\_entry\_id. The original is retained.

Audit Log      : An append-only record of all access and modification
events on patient data. Required by RA 10173.

Case Folder    : A clinical episode grouping related visits. Example:
"Hypertension Management 2025".

Case Entry     : A single clinical encounter record within a case folder,
containing vitals and SOAP notes. Immutable once created.

CSR            : Client-Side Rendering — page rendered in the browser
after JavaScript executes. Used for authenticated
workspace routes.

DPA            : Data Privacy Act of 2012 (Republic Act No. 10173) — the
Philippine law governing personal data protection.

Encryption Key : A workspace-scoped AES-256 key stored in Supabase Vault,
used to encrypt and decrypt Class A and B patient fields.

HMO            : Health Maintenance Organization — a private health
insurance provider common in the Philippines.

NPC            : National Privacy Commission — the Philippine government
body that enforces the DPA.

PhilHealth     : Philippine Health Insurance Corporation — the national
health insurance program. Accession number (PIN) is a
key patient identifier.

PWA            : Progressive Web App — a web application enhanced with
a Service Worker and Web App Manifest to support offline
use and home screen installation.

PWD            : Person with Disability — entitled to statutory discounts
under Philippine law.

RLS            : Row Level Security — a Postgres feature that filters
query results based on the authenticated user's identity.

SC             : Senior Citizen — entitled to statutory discounts under
the Expanded Senior Citizens Act.

Slug           : A URL-safe, lowercase, hyphenated identifier derived from
the clinic name. Example: "manila-dental-care".

SOAP Notes     : Subjective, Objective, Assessment, Plan — the standard
clinical documentation format.

SPI            : Sensitive Personal Information — a class of personal data
under RA 10173 that requires stricter protection. Includes
health, financial, and government ID data.

SSG            : Static Site Generation — page HTML generated at build
time and served from CDN. Used for all public marketing
pages.

SSR            : Server-Side Rendering — page HTML generated per-request
on the server. Used for invitation token validation.

Workspace      : An isolated data silo representing a single clinic's
environment within the PRIS platform, accessible at
https://pris.app/<slug>/.

Workspace Member: A junction record linking a user profile to a workspace
with a specific role.

Workspace Switcher: The UI element (screen at /workspaces or dropdown in
the navigation bar) that lets users with multiple
workspace memberships switch between clinics.



================================================================================
END OF DOCUMENT
===

PRIS PRD v2.1 — Confidential \& Proprietary
For internal engineering and product use only.
Change from v2.0: Architecture revised to fully web-based model.
Section 2 rewritten. Section numbering updated. Phase 1 (Landing Page)
and Phase 8 (PWA) added. No database schema or compliance logic changed.
===

