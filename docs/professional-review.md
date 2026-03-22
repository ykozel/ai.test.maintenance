# Professional Review — Navigation Spec Comparison

> Baseline: `tests/main.navigation.refactored.spec.ts`  
> Improved: `tests/main.navigation.professional.spec.ts`  
> Date: 2026-03-22

---

## Overview

`main.navigation.professional.spec.ts` applies all high- and medium-priority findings from the earlier audit (F-01 through F-06) to the refactored spec. The structure, POM usage, and fixture pattern are preserved; the changes address assertion quality, traceability, clarity, and coverage gaps.

---

## Change-by-Change Summary

### 1. Anchored URL Patterns (F-01, F-05)

**Baseline (`main.navigation.refactored.spec.ts`):**
```typescript
urlPattern: /\/docs\/api/,       // matches /docs/api-testing, /docs/api-changelog, …
urlPattern: /\/community/,       // matches /community-guidelines, /community-anything
```

**Professional (`main.navigation.professional.spec.ts`):**
```typescript
urlPattern: /\/docs\/api\/class-playwright$/,
urlPattern: /\/community\/welcome$/,
urlPattern: /\/docs\/intro$/,
```

**Why it matters:** Unanchored patterns pass silently if the application redirects to an adjacent route. The `$` anchor ensures the full path suffix is matched, eliminating false positives on sibling URLs.

---

### 2. Post-Navigation Heading Assertion (F-02)

**Baseline:** Click test asserts only `toHaveURL` — confirms a URL change but not that the page rendered.

**Professional:** Adds `heading` field to `NavLink` and asserts `toBeVisible()` on the destination `h1`:
```typescript
// in NAV_LINKS
heading: 'Installation',   // Docs
heading: 'Playwright',     // API
heading: 'Welcome',        // Community

// in TC-NAV-001-D
await expect(playwrightDevPage.page.getByRole('heading', { name: heading, level: 1 })).toBeVisible();
```

**Why it matters:** A URL can update before page content is ready, or a server can return a 200 with an error page at the correct URL. The heading assertion confirms real content loaded.

---

### 3. Traceability — Test IDs and Tag (F-03)

**Baseline:** No IDs, no tags.
```typescript
test.describe('Main page navigation', () => {
  test('navigation landmark should be accessible', ...
  test('should display navigation links: Docs, API, Community', ...
```

**Professional:**
```typescript
test.describe('Main page navigation', { tag: '@navigation' }, () => {
  test('TC-NAV-001-A: navigation landmark has accessible name "Main"', ...
  test('TC-NAV-001-B: all primary nav links are visible on load', ...
  // TC-NAV-001-C / D generated per link
```

**Why it matters:** `{ tag: '@navigation' }` enables `npx playwright test --grep @navigation` for targeted CI runs. `TC-NAV-001-*` IDs tie each test to a known requirement, making failure reports and review comments unambiguous.

---

### 4. `NavLink` Type — `heading` Field Added (F-02)

**Baseline:**
```typescript
type NavLink = {
  name, locator, navigate, href, urlPattern
};
```

**Professional:**
```typescript
type NavLink = {
  name, locator, navigate, href, urlPattern,
  heading: string;   // ← destination page h1, required for TC-NAV-001-D
};
```

Field-level comment added to the type block explaining each property's role, making the data table self-documenting for contributors.

---

### 5. Explanatory Comments (F-04)

**Baseline:** The outer `for` loop that generates tests at collection time has no explanation. Contributors unfamiliar with Playwright's test registration model may misread or incorrectly modify it.

**Professional:** Block comments added before and inside the loop:
```typescript
// TC-NAV-001-C / D: Per-link tests generated from NAV_LINKS at collection time.
// Playwright registers test() calls synchronously before execution begins.
// To add or rename a nav link, update NAV_LINKS only — tests update automatically.
```

---

### 6. Edge Case — `aria-hidden` and `disabled` State (TC-NAV-001-E, F-06)

**Baseline:** No edge-case tests. A link present in the DOM but `aria-hidden="true"` or with `pointer-events:none` would pass all existing assertions.

**Professional — new test:**
```typescript
test('TC-NAV-001-E: nav links are enabled and not aria-hidden', async ({ playwrightDevPage }) => {
  for (const { name, locator } of NAV_LINKS) {
    await expect(link).not.toHaveAttribute('aria-hidden', 'true');
    await expect(link).toBeEnabled();
  }
});
```

**Why it matters:** A visually styled link can be invisible to assistive technologies if `aria-hidden` is applied. Dynamic frameworks can accidentally set this during re-renders. `toBeEnabled()` guards against pointer/keyboard blocking via a disabled state.

---

### 7. Edge Case — Same-Tab Navigation and Origin Check (TC-NAV-001-F, F-06)

**Baseline:** No test verifies the link's `target` attribute or that navigation stays within the same origin.

**Professional — new test:**
```typescript
test('TC-NAV-001-F: nav links navigate in the same tab and stay on the same origin', async ({ playwrightDevPage }) => {
  const origin = new URL(playwrightDevPage.page.url()).origin;
  for (const { name, locator, navigate } of NAV_LINKS) {
    await playwrightDevPage.goto();                              // clean state per iteration
    await expect(link).not.toHaveAttribute('target', '_blank'); // WCAG 3.2.2
    await navigate(playwrightDevPage);
    expect(new URL(playwrightDevPage.page.url()).origin).toBe(origin);
  }
});
```

**Why it matters:** `target="_blank"` on an internal link breaks back-navigation and violates WCAG 3.2.2 (On Input). An unintended external redirect (e.g. from a misconfigured `href`) would pass a URL regex check but fail an origin comparison.

---

## Test Count Comparison

| File | Tests |
|---|---|
| `main.navigation.refactored.spec.ts` | 8 |
| `main.navigation.professional.spec.ts` | 10 |

The 2 additional tests are TC-NAV-001-E and TC-NAV-001-F.

---
// SDET detected improvement
## Post-Review Improvement — TC-NAV-001-F Loop Readability

After the professional spec was written, the `for` loop inside TC-NAV-001-F was simplified following a readability review.

**Before:**
```typescript
for (let i = 0; i < NAV_LINKS.length; i++) {
  const { name, locator, navigate } = NAV_LINKS[i];

  // The fixture already navigates to home before the test; only restore
  // after the first iteration when navigate() has moved to another page.
  if (i > 0) await playwrightDevPage.goto();

  const link = locator(playwrightDevPage);
  // ...
}
```

**After:**
```typescript
for (const { name, locator, navigate } of NAV_LINKS) {
  // Return to home before each link so each iteration starts from a clean state.
  // The fixture's initial goto() covers the first iteration at negligible cost.
  await playwrightDevPage.goto();

  const link = locator(playwrightDevPage);
  // ...
}
```

**Why:** The index-based loop introduced a conditional (`if (i > 0)`) to skip the first `goto()` as a micro-optimisation. This made the intent harder to read and inconsistent with the `for...of` pattern used in every other loop in the file. Replacing it with an unconditional `goto()` at the top of each iteration:

- Keeps the loop idiomatic and consistent with the rest of the spec
- Makes the "clean state before each link" intent explicit without conditional logic
- Trades one redundant navigation (fast, same-page reload) for readability — an acceptable cost in a test suite

---

## Findings Addressed

| Finding | Refactored | Professional |
|---|---|---|
| F-01 — Loose API URL regex | ❌ | ✅ Anchored with `$` |
| F-02 — No post-nav content assertion | ❌ | ✅ `h1` heading verified |
| F-03 — No traceability / tags | ❌ | ✅ TC IDs + `@navigation` tag |
| F-04 — Unexplained loop pattern | ❌ | ✅ Block comment added |
| F-05 — Loose Community URL regex | ❌ | ✅ Anchored with `$` |
| F-06 — No edge-case tests | ❌ | ✅ TC-NAV-001-E + TC-NAV-001-F |
| Loop readability (TC-NAV-001-F) | ❌ index-based | ✅ `for...of` + unconditional `goto()` |
| F-07 — No keyboard nav test | ❌ | ❌ Out of scope for this file |
| F-08 — No mobile viewport project | ❌ | ❌ Config-level change, separate task |
| F-09 — No focus-visibility check | ❌ | ❌ Requires CSS evaluation |
| F-10 — No axe scan | ❌ | ❌ Requires `@axe-core/playwright` install |
