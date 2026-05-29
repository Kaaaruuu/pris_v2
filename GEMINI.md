# Project PRIS (Patient Recording Information System)

This project follows the strict architectural, security, and design guidelines defined in the `docs/` folder.

## Authoritative Documentation
The following files are the **cornerstone** of this project. Every decision, query, and component MUST align with them:
- `docs/skills.md`: Architectural rules, security non-negotiables, and database schema.
- `docs/prd.md`: Product requirements and implementation phases.
- `docs/design.md`: UI/UX design specification ("Clinical Craft" aesthetic).

## Non-Negotiable Rules (The Golden Rules)
1. **Multi-Tenancy:** EVERY database query and data access MUST be scoped to the active `workspace_id`.
2. **Compliance (RA 10173):** Patient data (Class A and B) MUST be encrypted using AES-256-GCM via `pgsodium`. Store as `BYTEA`.
3. **Immutability:** `case_entries` and `prescriptions` are PERMANENTLY IMMUTABLE. Corrections must use the amendment pattern (new row + `parent_entry_id`).
4. **Technology Stack:** Next.js (App Router), Tailwind CSS, Supabase (Auth, DB, Storage, Edge Functions).
5. **Rendering:** Landing page and public routes are SSG. Workspace routes (`/:slug/*`) are CSR (SPA). `/invite/:token` is SSR.
6. **Design Aesthetic:** "Clinical Craft". Use Inter/Geist Sans, Zinc-based palette, and spring animations (Framer Motion).

## Task Protocol
Before starting any task, refer to the "HOW TO USE THIS SKILL" table in `docs/skills.md` to identify relevant sections.
- **Frontend:** Check `docs/design.md` for styling and `docs/skills.md` Section 2.
- **Database:** Check `docs/skills.md` Sections 4, 5, and 6.
- **Compliance:** Check `docs/skills.md` Section 5.

*Note: This file is a system instruction for the AI agent. Do not modify the core rules without explicit user consent.*
