# Auth-Login Specification

## Purpose

Define the visual, responsive, and aesthetic behavior of the login and registration UI for LUCA Health OS. This spec ensures the login experience is viewport-safe on common laptop resolutions (1280×800, 1366×768), uses a Notion-esque shadow-free aesthetic, and preserves all brand colors and form functionality.

## Requirements

### Requirement: Viewport-Safe Height at 768px

The login page right panel MUST not overflow the viewport on screens with ≤768px height at desktop breakpoints. When register content exceeds available vertical space, it MUST scroll within the right panel — not at the body level.

#### Scenario: Register tab fits within 1280×800 viewport

- GIVEN the user is on a 1280×800 viewport at the `lg:` breakpoint or larger
- WHEN the user selects the register ("Crear Cuenta") tab
- THEN all register content is visible without body-level scrolling
- AND if content exceeds the right panel height, a scrollbar appears only within the right panel

#### Scenario: Register tab fits within 1366×768 viewport

- GIVEN the user is on a 1366×768 viewport at the `lg:` breakpoint or larger
- WHEN the user selects the register tab with any profile type (Patient, Medical, Institution)
- THEN no content is clipped below the visible fold
- AND the left panel (PharmiWorkspace) and right panel share the same `h-screen` height

#### Scenario: Mobile viewport uses dynamic height

- GIVEN the user is on a mobile viewport (< `lg:` breakpoint)
- WHEN the login page renders
- THEN the auth container uses `min-h-[100dvh]` to respect the mobile browser's dynamic viewport height
- AND no horizontal overflow occurs

### Requirement: Internal Scroll for Overflow Content

The AuthContainer and its right panel wrapper MUST support internal vertical scrolling when form content exceeds the container height.

#### Scenario: Scroll activates only when needed

- GIVEN the right panel wrapper has `lg:h-screen overflow-y-auto`
- WHEN register content height exceeds the right panel's computed height
- THEN `overflow-y-auto` produces a scrollbar within the right panel only
- AND the page body does NOT scroll

#### Scenario: No unnecessary scrollbar

- GIVEN the login tab (shorter content) is selected
- WHEN the page renders at 1280×800 or larger
- THEN no scrollbar is visible because content fits within the panel

### Requirement: Zero Shadow Classes in Login Components

All login-related components MUST NOT use any `shadow-*` Tailwind utility classes. Visual depth MUST be achieved through borders, spacing, and surface contrast only.

#### Scenario: Grep verification passes

- GIVEN a search for `shadow-` across `src/components/pharmako-login/`, `src/components/TypeProfile.tsx`, and `src/app/login/`
- WHEN the search completes
- THEN zero matches are returned for `shadow-*` class usages

#### Scenario: Active tab indicator uses border, not shadow

- GIVEN the user views the login/register tab switcher
- WHEN a tab is active
- THEN the active tab has `border-b-2 border-pharmako-primary`
- AND no `shadow-sm` or equivalent is applied

#### Scenario: Profile cards use border-only selection

- GIVEN the user views the profile type selector in the register flow
- WHEN a profile card is selected
- THEN it displays `border-2 border-pharmako-primary`
- AND no shadow is present on default, hover, or selected states

### Requirement: Border-Only Focus States

All interactive form inputs MUST use border color changes for focus indication. Focus states MUST NOT use ring shadows or box shadows.

#### Scenario: Input focus shows brand border

- GIVEN a login or register form input is focused
- WHEN the input receives focus
- THEN the input border changes to `border-2 border-pharmako-primary`
- AND no `ring-*` shadow or `shadow-[...]` custom shadow is visible

#### Scenario: Profile card hover uses subtle border

- GIVEN a profile type card is hovered
- WHEN the pointer enters the card
- THEN the border changes from `border-slate-200` to `border-slate-300`
- AND no shadow is added on hover

### Requirement: Brand Color Preservation

All existing brand colors MUST be preserved without modification. The primary blue (`#0057FF` / `pharmako-primary`), teal, emerald, and amber tokens MUST remain unchanged.

#### Scenario: Primary blue unchanged

- GIVEN any login component referencing `pharmako-primary`
- WHEN the component renders
- THEN the computed color resolves to `#0057FF`

#### Scenario: Secondary brand colors unchanged

- GIVEN components using teal, emerald, or amber tokens
- WHEN the page renders
- THEN all secondary brand colors render at their original token values

### Requirement: Notion-Esque Aesthetic Consistency

All login components MUST share a unified visual language: clean surfaces, subtle borders, no shadows, and compact but breathable spacing.

#### Scenario: Surface colors are consistent

- GIVEN the login page renders
- WHEN inspecting all card and panel backgrounds
- THEN surfaces use `bg-white` on a `bg-slate-50` app background
- AND borders use `#E2E8F0` (equivalent to `border-slate-200`)

#### Scenario: Spacing is compact but not cramped

- GIVEN the register form with its longest variant (Institution, 7 fields)
- WHEN the form renders
- THEN vertical section spacing is `space-y-5` (reduced from `space-y-6`)
- AND form field gaps are `gap-3` (reduced from `gap-4`)
- AND the header text size is `text-2xl` (reduced from `text-3xl`)

### Requirement: No Functional Regression

The login page MUST maintain identical form logic, validation, data fetching, and submission behavior. Only CSS classes are modified.

#### Scenario: Login flow unchanged

- GIVEN a user enters valid credentials on the login tab
- WHEN the user submits the form
- THEN authentication proceeds exactly as before the change

#### Scenario: Registration flow unchanged

- GIVEN a user fills out any registration form (Patient, Medical, or Institution)
- WHEN the user submits the form
- THEN validation, submission, and any post-submit behavior are identical to pre-change behavior

#### Scenario: Only CSS classes changed

- GIVEN a diff of all affected files
- WHEN reviewing the changes
- THEN no TypeScript logic, component structure, event handlers, or data-fetching code is modified
- AND only Tailwind class strings and CSS-related attributes are changed

### Requirement: Affected File Boundaries

Changes MUST be limited to the files identified in the proposal. No structural refactoring, file additions, or file deletions are permitted.

#### Scenario: Exactly 9 files modified

- GIVEN the PR for this change
- WHEN counting modified files
- THEN exactly these files are changed:
  1. `src/app/login/page.tsx`
  2. `src/components/pharmako-login/AuthContainer.tsx`
  3. `src/components/pharmako-login/AuthTabs.tsx`
  4. `src/components/pharmako-login/PharmakoInput.tsx`
  5. `src/components/TypeProfile.tsx`
  6. `src/components/pharmako-login/AuthRegisterContent.tsx`
  7. `src/components/FormRegisterPatient.tsx`
  8. `src/components/FormRegisterMedical.tsx`
  9. `src/components/FormRegisterInstitution.tsx`