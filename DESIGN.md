---
name: Jeremy London
description: Personal technical site for AI systems, security, reliability, and engineering leadership.
colors:
  ink: "#030712"
  paper: "#ffffff"
  dark-paper: "#030712"
  dark-surface: "#111827"
  surface: "#f9fafb"
  rule: "#e5e7eb"
  dark-rule: "#1f2937"
  muted: "#4b5563"
  dark-muted: "#d1d5db"
  accent-blue: "#3b82f6"
  accent-blue-strong: "#2563eb"
  accent-orange: "#f97316"
  accent-orange-soft: "#fb923c"
  profile-sky-start: "#a1deff"
  profile-sky-end: "#5ea3db"
  profile-amber-start: "#ffcf70"
  profile-amber-end: "#ffae3d"
  error: "#ef4444"
  success: "#22c55e"
typography:
  display:
    fontFamily: "InterVariable, Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "3rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "0"
  headline:
    fontFamily: "InterVariable, Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "0"
  title:
    fontFamily: "InterVariable, Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "0"
  body:
    fontFamily: "InterVariable, Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.75
    letterSpacing: "0"
  label:
    fontFamily: "InterVariable, Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.08em"
  meta:
    fontFamily: "SFMono-Regular, ui-monospace, Cascadia Code, Cascadia Mono, Segoe UI Mono, Roboto Mono, Menlo, Consolas, monospace"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "12px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  "2xl": "32px"
  "3xl": "48px"
  "4xl": "64px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.sm}"
    padding: "10px 20px"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "10px 20px"
  nav-link:
    textColor: "{colors.muted}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "8px 0"
  card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "20px"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
  chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: "6px 12px"
  metadata:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.muted}"
    typography: "{typography.meta}"
    rounded: "{rounded.sm}"
    padding: "0px"
---

Design System: Jeremy London

## 1. Overview

Creative North Star: "The Field Notebook"

The redesign should feel like a technical field notebook that has been cleaned up for publication: more spacious, more legible, and a little more modern without losing the directness. It is still a writing-first site, but the layout now uses the available width more confidently, so pages feel like a deliberate system instead of a narrow stack floating in the middle of the screen.

The personality stays calm and specific. Inter handles the main reading experience, while monospace shows up where the content is code-shaped or system-shaped: datelines, separators, location strings, tags, and small technical signatures. Blue drives light-mode action; orange drives dark-mode action. Brighter orbit colors remain a personal signature behind the portrait, not a generic decoration pattern.

This system explicitly rejects the usual 2026 AI-site reflexes: promotional thought-leader copy, generic SaaS landing-page composition, decorative glass panels, gradient text, over-carded grids, and narrow center-column layouts that ignore the viewport. The site should feel lived-in, technical, and readable on first pass.

**Key Characteristics:**

- Writing-first, but no longer cramped.
- Wider responsive containers that scale with the screen.
- Mono used intentionally for metadata and system-shaped details.
- Flat surfaces, compact corners, and restrained borders.
- Light and dark modes treated as equal reading environments.
- Motion and color used for feedback, not spectacle.

## 2. Colors

The palette is a restrained neutral base with one main accent per theme and a small set of brighter signature colors for the homepage orbit treatment.

### Primary

- **Field Ink** (`#030712`): Primary text in light mode, dark mode background, and the strongest CTA surface.
- **Clear Paper** (`#ffffff`): Light-mode page background and surface base.
- **Night Paper** (`#030712`): Dark-mode page background and the anchor for the reading experience.

### Secondary

- **Signal Blue** (`#3b82f6`): Light-mode interactive accent for links, focus, category emphasis, and hover states.
- **Signal Blue Strong** (`#2563eb`): Stronger blue used when the lighter accent needs more weight against prose and metadata.
- **Workbench Orange** (`#f97316`): Dark-mode interactive accent and the dark-theme counterpart to Signal Blue.
- **Workbench Orange Soft** (`#fb923c`): Softer orange used in hover, focus, and signature surfaces that should stay bright.

### Tertiary

- **Failure Red** (`#ef4444`): Validation and error feedback only.
- **Receipt Green** (`#22c55e`): Success feedback only.
- **Profile Sky Start** (`#a1deff`) and **Profile Sky End** (`#5ea3db`): Signature-only orbit colors behind the portrait.
- **Profile Amber Start** (`#ffcf70`) and **Profile Amber End** (`#ffae3d`): Signature-only orbit colors behind the portrait.

### Neutral

- **Soft Surface** (`#f9fafb`): Light-mode panel fill and low-emphasis containers.
- **Dark Surface** (`#111827`): Dark-mode panel fill and control background.
- **Hairline Rule** (`#e5e7eb`): Light-mode borders and dividers.
- **Night Rule** (`#1f2937`): Dark-mode borders and dividers.
- **Muted Graphite** (`#4b5563`): Secondary text, metadata, and supporting labels in light mode.
- **Muted Silver** (`#d1d5db`): Secondary text and supporting labels in dark mode.

### Named Rules

**The One Accent Rule.** A surface should read as blue in light mode or orange in dark mode, not both at once. The exception is the homepage portrait orbit, which is a personal signature and not a general-purpose treatment.

**The Gray Has a Job Rule.** Gray is for hierarchy, rules, metadata, and low-emphasis text. If a line matters, keep it dark enough to read cleanly.

## 3. Typography

**Display Font:** InterVariable / Inter (with system sans fallback)  
**Body Font:** InterVariable / Inter (with system sans fallback)  
**Label Font:** InterVariable / Inter (with system sans fallback)  
**Meta Font:** SFMono-Regular / ui-monospace stack

**Character:** The typography is plainspoken and controlled. Inter carries the reading experience, and monospace appears where the content is doing system work. That gives the site a clearer technical identity without turning the whole interface into costume mono.

### Hierarchy

- **Display** (700, `3rem`, 1.1): Homepage name, page titles, and the largest first-screen statements.
- **Headline** (600, `1.5rem`, 1.25): Section headings and page-level group titles.
- **Title** (600, `1.125rem`, 1.35): Post titles, work-area titles, and short component headings.
- **Body** (400, `1rem`, 1.75): Long-form prose and descriptive copy. Keep lines around 65-75 characters when possible.
- **Label** (600, `0.75rem`, `0.08em`): Category labels and short taxonomic labels.
- **Meta** (500, `0.875rem`, 1.4): Datelines, reading time, separators like `//`, location strings, and blog metadata.

### Named Rules

**The Writing Leads Rule.** If a typographic move makes an article, about section, or form harder to parse, remove it.

**The Metadata Mono Rule.** Dates, month/year links, separators, and code-shaped fragments should look deliberate in mono, not accidental in sans.

## 4. Elevation

The system stays flat at rest. Depth comes from borders, spacing, tonal contrast, and a small set of shadows used only when they explain interaction or separate floating UI from content. The look should feel crisp rather than heavy.

### Shadow Vocabulary

- **Subtle Image Lift** (`0 4px 6px rgba(0, 0, 0, 0.1)`): Low elevation for imagery that needs separation from the page.
- **Action Hover Lift** (`0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)`): Hover treatment for primary actions and selected controls.
- **Profile Orbit Glow** (`0 0 30px rgba(10, 12, 15, 0.27)`): Signature-only treatment for the homepage portrait.
- **Control Shadow**: Small, bounded elevation for theme controls, dropdowns, and popovers when needed.

### Named Rules

**The Flat-Until-Acted-On Rule.** A surface should not float just because it can. Shadow appears in response to state, or for a real overlay.

## 5. Components

Buttons, filters, and content surfaces are compact and direct. The redesign favors full-width use of space where it helps readability, but it avoids oversized card scaffolding.

### Buttons

- **Shape:** Compact rounded rectangles, usually `4px` radius for CTAs and `12px` for icon buttons.
- **Primary:** Field Ink in light mode or Workbench Orange in dark mode, with clear paper text. Padding stays tight: `10px 20px` for standard actions.
- **Hover / Focus:** Small lift, stronger contrast, and a visible focus ring. Motion should stay short and confident.
- **Secondary / Ghost:** Outline or text buttons for lower-emphasis actions. They should read as actionable without stealing the fold.

### Chips and Filters

- **Style:** Small rounded pills with a clear border and readable text. They should feel like filters, not decorative tags.
- **State:** Selected chips stay visibly active; inactive chips stay quiet. The archive filters use search-first interaction with full-width search and popovers that avoid clipping.

### Cards / Containers

- **Corner Style:** `6px` radius for most cards and containers.
- **Background:** White or Soft Surface in light mode, Night Paper or Dark Surface in dark mode.
- **Shadow Strategy:** Prefer border and spacing first; shadow is reserved for overlays and imagery.
- **Internal Padding:** `20px` for standard cards, with more breathing room only when the content demands it.

### Inputs / Fields

- **Style:** `6px` radius, `2px` border, strong contrast, and clear placeholder treatment.
- **Focus:** Border shift plus a visible ring. Focus states should be obvious without shouting.
- **Error / Disabled:** Errors use red and appear only when the form has actually been submitted or made dirty in the expected flow.

### Navigation

- **Style:** Centered and quiet on desktop, compact and practical on mobile.
- **States:** Underlines and color shifts signal active or hover states; icon-only controls require labels.
- **Mobile:** Key pages stay available in the small-screen nav while secondary items move under the menu button.

### Signature Components

- **Profile Offset:** Two bright solid orbit layers behind the homepage portrait. This is a signature, not a general card style.
- **Blog Explorer:** Search-first archive controls with same-width comboboxes, conditional clear state, and popovers that render above content instead of getting clipped.
- **Blog Metadata Row:** Month and year are clickable, reading time is compact, separators use `//`, and the metadata line is intentionally mono.
- **Reading Progress Rail:** A left-edge vertical bar on article pages that appears after scrolling, tracks progress from top to bottom, and fades away after completion.

## 6. Do's and Don'ts

### Do

- **Do** keep pages wide where it helps reading: use the full container width rather than pretending everything belongs in a narrow center column.
- **Do** use Inter for the main reading experience and mono for datelines, tags, separators, and other code-shaped metadata.
- **Do** keep the visual system quiet enough for long-form reading but sharp enough that it never feels generic.
- **Do** use borders, spacing, and hierarchy before shadow.
- **Do** preserve the brighter profile orbit colors as a signature-only treatment.
- **Do** keep motion short, purposeful, and easy to ignore.

### Don't

- **Don't** turn the site into a promotional thought-leader page.
- **Don't** use generic SaaS landing-page patterns: hero metrics, repeated icon-card grids, or decorative floating cards.
- **Don't** use hype-heavy AI treatments: neon gradients, glassmorphism, gradient text, or faux-futurist glow everywhere.
- **Don't** bring back narrow content columns on blog and about pages when the layout can responsibly use more width.
- **Don't** use colored side-stripe borders wider than `1px` as a decorative accent.
- **Don't** stack duplicate dividers or separators around the same content block.
- **Don't** let gray-on-tint text get soft enough to hurt readability.
