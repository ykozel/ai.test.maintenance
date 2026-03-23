# Suite Maintenance Summary

> Scope: `tests/` folder — all spec files and fixtures  
> Date: 2026-03-23

---

## Files Reviewed

| File | Role | Tests |
|---|---|---|
| `main.navigation.spec.ts` | Original navigation tests (pre-refactor) | 8 |
| `main.navigation.refactored.spec.ts` | Intermediate refactor (data-driven, fixture) | 8 |
| `main.navigation.professional.spec.ts` | Authoritative version (TC IDs, edge cases, anchored URLs) | 10 |
| `playwright-dev.spec.ts` | Homepage title + "Get started" smoke tests | 2 |
| `fixtures.ts` | Shared `playwrightDevPage` fixture | — |

**Total registered tests: 28** (of which 16 are duplicates — see below)

---

## Findings

### F-S01 — `main.navigation.spec.ts` and `main.navigation.refactored.spec.ts` are dead weight 🔴

Both files are superseded by `main.navigation.professional.spec.ts` and run identical scenarios with weaker assertions:

| Issue | `main.navigation.spec.ts` | `main.navigation.refactored.spec.ts` |
|---|---|---|
| Loose URL regex (`/\/docs\/api/`) | ✅ present | ✅ present |
| No post-navigation heading assertion | ✅ present | ✅ present |
| No TC IDs or `@navigation` tag | ✅ present | ✅ present |
| No edge-case tests (TC-NAV-001-E/F) | ✅ present | ✅ present |
| `should display…` uses hardcoded steps (not loop) | ✅ `main.navigation.spec.ts` only | — |

Every scenario in both files is covered — with stronger assertions — by `main.navigation.professional.spec.ts`. Running all three triples execution time and produces 16 redundant results in the HTML report.

**Recommendation:** Delete both files. Keep only `main.navigation.professional.spec.ts`.

---

### F-S02 — `playwright-dev.spec.ts` URL regex is loose 🟡

[playwright-dev.spec.ts, line 9](playwright-dev.spec.ts#L9):
```typescript
await expect(playwrightDevPage.page).toHaveURL(/.*intro/);
```
Matches any URL containing `intro` — including hypothetical `/docs/intro-guide` or `/intro-video`. Should be anchored to `/docs/intro$`.

---

### F-S03 — `playwright-dev.spec.ts` has no TC ID or tag 🟡

The two homepage tests carry no traceability markers. Inconsistent with `main.navigation.professional.spec.ts` which uses `TC-NAV-001-*` and `{ tag: '@navigation' }`.

---

### F-S04 — `main.navigation.spec.ts` visibility test uses hardcoded steps 🟡

[main.navigation.spec.ts, lines 43–47](main.navigation.spec.ts#L43):
```typescript
await test.step('Docs link is visible', () => expect(playwrightDevPage.docsLink).toBeVisible());
await test.step('API link is visible', () => expect(playwrightDevPage.apiLink).toBeVisible());
await test.step('Community link is visible', () => expect(playwrightDevPage.communityLink).toBeVisible());
```
Not data-driven — adding a fourth nav link requires manual addition here. Moot if F-S01 is acted on.

---

### F-S05 — `fixtures.ts` exports `expect` but callers import it directly 🟢

[fixtures.ts, line 16](fixtures.ts#L16): `export { expect };`  
`playwright-dev.spec.ts` imports from `./fixtures` correctly. However, `main.navigation.spec.ts` and `main.navigation.refactored.spec.ts` also import from `./fixtures` — meaning if those files are deleted (F-S01), the re-export remains correct for the surviving files. No action needed beyond F-S01.

---

## Consolidation Plan

| Action | Files affected | Priority |
|---|---|---|
| **Delete** `main.navigation.spec.ts` | — | 🔴 High |
| **Delete** `main.navigation.refactored.spec.ts` | — | 🔴 High |
| **Fix** loose URL regex in `playwright-dev.spec.ts` | line 9 | 🟡 Medium |
| **Add** TC IDs and `@smoke` tag to `playwright-dev.spec.ts` | lines 3, 5, 9 | 🟡 Medium |

After deletions: **12 tests** across 2 spec files — no redundancy.

---

## Diff — `playwright-dev.spec.ts` (representative cleanup)

```diff
--- a/tests/playwright-dev.spec.ts
+++ b/tests/playwright-dev.spec.ts
@@ -1,12 +1,14 @@
 import { test, expect } from './fixtures';
 
-test.describe('playwright.dev homepage', () => {
-  test('has title', async ({ playwrightDevPage }) => {
+// TC-HOME-001 — playwright.dev homepage smoke tests
+test.describe('playwright.dev homepage', { tag: '@smoke' }, () => {
+  // TC-HOME-001-A: Page title must identify the product for browser tab and SEO.
+  test('TC-HOME-001-A: page title contains "Playwright"', async ({ playwrightDevPage }) => {
     await expect(playwrightDevPage.page).toHaveTitle(/Playwright/);
   });
 
-  test('get started link navigates to installation page', async ({ playwrightDevPage }) => {
+  // TC-HOME-001-B: The primary CTA must reach the Installation page.
+  test('TC-HOME-001-B: "Get started" link navigates to the installation page', async ({ playwrightDevPage }) => {
     await playwrightDevPage.navigateToGetStarted();
-    await expect(playwrightDevPage.page).toHaveURL(/.*intro/);
+    await expect(playwrightDevPage.page).toHaveURL(/\/docs\/intro$/);
     await expect(playwrightDevPage.installationHeading).toBeVisible();
   });
 });
```

---

## After Consolidation — Test Inventory

| File | Tests | Tags | TC IDs |
|---|---|---|---|
| `main.navigation.professional.spec.ts` | 10 | `@navigation` | TC-NAV-001-A through F |
| `playwright-dev.spec.ts` | 2 | `@smoke` | TC-HOME-001-A, B |
| **Total** | **12** | | |

Redundant tests eliminated: **16** (from 28 → 12).
