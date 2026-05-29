# PRIS: UI/UX Design Specification
**Version:** 1.0
**Target Frameworks:** React, Next.js, Tailwind CSS, Framer Motion, Radix UI primitives.
**Aesthetic Profile:** "Clinical Craft" (Inspired by Emil Kowalski's design philosophy: sub-pixel perfection, fluid interactions, absolute accessibility, and quiet elegance).

## 1. Design Philosophy & Principles
* **Quiet Competence:** The UI must step back. Clinical data is the hero. Use muted backgrounds, delicate borders, and high-contrast typography to reduce cognitive load during 12-hour shifts.
* **Fluidity as Trust:** State changes must be animated using spring physics. Snappy, interruptible animations communicate stability and modern engineering.
* **Density with Clarity:** Medical records require high information density. Achieve this through typographic hierarchy (weight and color) rather than excessive spacing. 
* **Slack-Model Navigation:** Context switching between clinics (workspaces) and patients must be instant. Utilize a global Command Palette (`Cmd+K`) for patient search.

## 2. Design Tokens (Tailwind Configuration)

### 2.1 Color Palette
Avoid sterile, aggressive "hospital blue." Utilize a grounded, warm slate paired with a calming botanical accent.

* **Backgrounds:**
  * `bg-background`: `#FAFAFA` (Main app background, slightly warm to reduce eye strain).
  * `bg-surface`: `#FFFFFF` (Cards, sidebars, elevated elements).
  * `bg-surface-muted`: `#F4F4F5` (Zinc-100, for secondary panels).
* **Accents (Clinical Sage):**
  * `accent-50`: `#F0FDF4` (Success backgrounds).
  * `accent-500`: `#22C55E` (Primary buttons, active states).
  * `accent-600`: `#16A34A` (Hover states).
* **Typography (Slate):**
  * `text-primary`: `#18181B` (Zinc-900, headers, patient names).
  * `text-secondary`: `#52525B` (Zinc-500, metadata, timestamps).
  * `text-tertiary`: `#A1A1AA` (Zinc-400, disabled states, placeholders).
* **Status Indicators:**
  * `status-critical`: `#EF4444` (Red-500, Allergies, Overdue payments).
  * `status-warning`: `#F59E0B` (Amber-500, Missing consents, Locked states).
  * `status-info`: `#3B82F6` (Blue-500, Active treatments).

### 2.2 Typography
**Primary Typeface:** *Inter* or *Geist Sans*. 
Enable standard ligatures, contextual alternates, and tabular numbers for clinical metrics (BP, HR).

* **Display (Landing Page):** `text-5xl` tracking-tight, font-semibold.
* **H1 (Dashboard/Patient Name):** `text-2xl` tracking-tight, font-medium, text-zinc-900.
* **H2 (Section Headers):** `text-sm` uppercase, tracking-wider, font-semibold, text-zinc-500.
* **Body:** `text-sm` leading-relaxed, text-zinc-700.
* **Micro (Metadata):** `text-xs` text-zinc-500. tabular-nums.

### 2.3 Shadows & Depth (Sub-pixel perfection)
Drop harsh drop shadows. Use layered, diffused shadows to simulate physical depth.

* **Ring Borders:** Use `ring-1 ring-zinc-900/5` instead of `border` for crisper rendering.
* **Shadow-sm (Buttons/Inputs):** `shadow-[0_1px_2px_rgba(0,0,0,0.04)]`.
* **Shadow-md (Dropdowns):** `shadow-[0_4px_12px_-2px_rgba(0,0,0,0.05),0_0_0_1px_rgba(0,0,0,0.02)]`.
* **Shadow-lg (Modals):** `shadow-[0_24px_48px_-12px_rgba(0,0,0,0.18)]`.

## 3. Core Component Architecture

### 3.1 Buttons
Built with `framer-motion` for `whileTap` scaling.
* **Primary:** `bg-zinc-900 text-white hover:bg-zinc-800 ring-1 ring-inset ring-white/10 shadow-sm`. (High contrast, authoritative).
* **Secondary:** `bg-white text-zinc-900 ring-1 ring-zinc-200 hover:bg-zinc-50`.
* **Interaction:** `transition-all duration-200 ease-out`. `whileTap={{ scale: 0.98 }}`.

### 3.2 Inputs & Forms
* **Container:** `bg-white ring-1 ring-zinc-200 rounded-md shadow-sm`.
* **Focus State:** No thick blue rings. Use `focus-within:ring-2 focus-within:ring-zinc-900 focus-within:ring-offset-1`.
* **Labels:** Placed above inputs, `text-sm font-medium text-zinc-700`.
* **Validation:** Inline error messages with `motion.div` height animations to prevent layout snapping.

### 3.3 The Command Palette (Omnibar)
* **Trigger:** `Cmd + K` (Mac) or `Ctrl + K` (Win).
* **Visuals:** Centered screen overlay, frosted glass backdrop (`backdrop-blur-sm bg-zinc-900/20`).
* **Functionality:** Powered by `cmdk`. Instantly search patients (utilizing Postgres `pg_trgm` index), jump to settings, or create a new case entry.

## 4. Layout Patterns & Responsiveness

### 4.1 Desktop (≥ 1024px)
* **Sidebar:** Fixed width (240px), `bg-zinc-50 border-r border-zinc-200`. Contains Workspace Switcher, Main Nav, and active patient queue.
* **Main Content:** `bg-white`. Max-width constrained to `max-w-5xl` for optimal reading line length of clinical notes.
* **Workspace Switcher:** A popover mirroring Slack's top-left corner. Displays the clinic logo, active plan (e.g., "Clinic Tier"), and role.

### 4.2 Tablet (≥ 768px)
* **Sidebar:** Collapses to 64px (Icon only). Expands on hover or tap.
* **Main Content:** Fluid width, adapting to the available viewport.

### 4.3 Mobile (< 768px)
* **Navigation:** Sidebar disappears. Replaced by an iOS-style bottom navigation bar with frosted glass effect (`backdrop-blur-md bg-white/80`). 
* **Patient Search:** Moves to a prominent floating action button (FAB) or sticky top header.
* **Forms:** Full-screen sheets (Radix Dialog) rather than center-aligned modals.

## 5. Key Screen Blueprints

### 5.1 Landing Page (`/`)
* **Hero:** Generous whitespace. Headline set in `Geist Sans`, tight tracking. Primary CTA ("Start Free Trial") pulses subtly using Framer Motion. 
* **App Preview:** A high-resolution, slightly skewed mock-up of the dashboard with a soft glowing background radial gradient. 
* **Performance:** SSG rendered. CSS grid used for feature bento-box layouts.

### 5.2 Patient Profile & Clinical Timeline (`/:slug/cases/:id`)
* **Header Structure:** Sticky header. Patient name, Age, Sex, and highly visible, red `ring-1` badges for Allergies.
* **Timeline (The Core UX):**
  * Displayed as a vertical chronological feed, anchored by a 2px `bg-zinc-200` line on the left.
  * **Entries:** Rendered as white cards with `ring-1 ring-zinc-200`. 
  * **Vitals Banner:** A horizontal strip at the top of an entry displaying BP, HR, Temp. Tabular numbers.
  * **Immutable Data Visualization (Amendments):** Original entries that have been amended are shown with `opacity-50`, a `line-through` on the clinical text, and a linked child card connected by a curved SVG line indicating the correction.
  * **Typography:** `SOAP` note headers are small, uppercase, bold. Content is regular weight.

## 6. Motion & Interaction (Framer Motion)

* **Spring Physics:** Use springs over standard CSS easings for layout changes.
  * *Standard Transition:* `type: "spring", stiffness: 400, damping: 30`.
* **Page Transitions:** Fade and slight slide-up. `initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}`.
* **Shared Element Layout:** Use `layoutId` when moving a patient from the "Search Results" list into the full "Patient Profile" header for a seamless context shift.

## 7. Accessibility (WCAG 2.1 AA)

* **Contrast:** All text against background must exceed 4.5:1 ratio. Muted text (`zinc-500`) on white passes this.
* **Keyboard Navigation:** Every interactive element must be reachable via `Tab`. Focus states must be explicitly styled (using `focus-visible:ring-2`).
* **Screen Readers:** Use Radix UI primitives which handle `aria-expanded`, `aria-hidden`, and `role` attributes automatically for complex components like dropdowns and dialogs.
* **Color Independence:** Statuses (Active, Locked, Past Due) must use an icon in addition to color (e.g., an Alert Triangle next to the red "Locked" text).
