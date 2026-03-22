# Legacy Test Analysis — Prioritized Problem Checklist

> Scope: `pages/playwright-dev-page.ts`, `tests/main.navigation.spec.ts`, `tests/playwright-dev.spec.ts`  
> Date: 2026-03-21

---

## 🔴 High Priority — Fix First (Correctness & Flakiness)

- [ ] **#3 — Assertion embedded in POM action method** (`navigateToGetStarted` calls `expect` internally)
  - **Fix category:** Refactor — move assertions out of POM into tests; keep POMs as pure action drivers

- [ ] **#2 — Ambiguous `getStartedLink` locator** (not scoped to nav, compensated by `.first()`)
  - **Fix category:** Selector hardening — scope to the correct container (e.g. `banner` or hero region)

- [ ] **#5 — Missing navigation tests for `API` and `Community`** (only `Docs` click + URL is covered)
  - **Fix category:** Coverage expansion — add click + `toHaveURL` tests for the remaining two links

---

## 🟡 Medium Priority — Fix Next (Maintenance Cost)

- [ ] **#1 — Raw `h1` tag selector for `pageTitle`** (fragile structural selector)
  - **Fix category:** Selector hardening — replace with `getByRole('heading', { level: 1 })` or remove if unused

- [ ] **#9 — `pageTitle` locator is declared but never used**
  - **Fix category:** Dead code removal — delete the property to reduce cognitive noise

- [ ] **#8 — Inconsistent POM instantiation pattern across spec files** (`let`+`beforeEach` vs inline `const`)
  - **Fix category:** Standardization — pick one pattern and apply it consistently across all specs

- [ ] **#10 — `href` strings duplicated across locator definitions and assertions**
  - **Fix category:** Extract constants — define nav paths once (e.g. `NAV_URLS` object) and reference everywhere

- [ ] **#11 — `goto()` + POM construction repeated in every spec file**
  - **Fix category:** Shared fixture — introduce a `test.extend` fixture that provides a ready `PlaywrightDevPage` instance

---

## 🟢 Low Priority — Cleanup (Polish & Resilience)

- [ ] **#4 — `navigateToDocs()` has no post-navigation guard**
  - **Fix category:** Defensive method design — add an optional `waitFor` parameter or return the page URL assertion

- [ ] **#7 — `toHaveRole('navigation')` assertion on `mainNav` is a tautology**
  - **Fix category:** Assertion pruning — remove the redundant assertion; keep only `toHaveAccessibleName`

- [ ] **#6 — No mobile/collapsed viewport tests for navigation**
  - **Fix category:** Coverage expansion — add a project or test variant with a mobile device profile to verify nav behavior across viewports

---

## Fix Category Summary

| Category | Issues Addressed |
|---|---|
| Selector hardening | #1, #2 |
| Refactor POM — remove embedded assertions | #3 |
| Coverage expansion | #5, #6 |
| Dead code removal | #9 |
| Standardization | #8 |
| Extract constants | #10 |
| Shared fixture | #11 |
| Assertion pruning | #7 |
| Defensive method design | #4 |

No code changes applied in Chapter 2.