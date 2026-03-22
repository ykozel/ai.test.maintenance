# Refactoring Summary — Main Navigation Tests

> Scope: `pages/playwright-dev-page.ts`, `tests/main.navigation.spec.ts`, `tests/playwright-dev.spec.ts`  
> Refactored output: `tests/main.navigation.refactored.spec.ts`, `tests/fixtures.ts`  
> Date: 2026-03-22

---

## Overview

The original test suite had 11 identified issues across selector quality, synchronization, accessibility, coverage, readability/reuse, and duplication. This document summarises every improvement applied and the rationale behind each.

---

## 1. Shared Fixture (`tests/fixtures.ts`)

**Problem (#11):** Every spec file repeated the same boilerplate — constructing `PlaywrightDevPage` and calling `goto()` inline in each test or `beforeEach`.

**Fix:** Introduced a `test.extend` fixture (`playwrightDevPage`) that constructs the page object and navigates to `/` once per test. Both spec files import `test` from `./fixtures` instead of `@playwright/test`.

**Benefit:** Zero setup duplication across spec files. Adding a new spec requires no boilerplate — just import and use the fixture.

---

## 2. Selector Hardening

**Problem (#1, #2):**
- `pageTitle` used a raw `h1` CSS tag selector — fragile under structural DOM changes.
- `getStartedLink` was unscoped (`page.getByRole('link', { name: 'Get started' })`), matching two elements on the page. A brittle `.first()` call compensated for the ambiguity.
- Nav link locators lacked `exact: true`, risking partial-name false matches.

**Fix:**
- `pageTitle` removed entirely (also dead code — see #9).
- `getStartedLink` scoped to `page.getByRole('banner')`, which uniquely contains the hero CTA. `.first()` removed.
- `exact: true` added to all three nav link locators (`docsLink`, `apiLink`, `communityLink`).

**Benefit:** Locators are unambiguous and resilient to page structure changes.

---

## 3. Dead Code Removal (`pageTitle`)

**Problem (#9):** `pageTitle` was declared as a class property but never referenced in any test or method.

**Fix:** Property removed from `PlaywrightDevPage`.

**Benefit:** Reduced cognitive noise; contributors no longer wonder whether `pageTitle` is intended for future use.

---

## 4. Assertion Removed from POM Action Method

**Problem (#3):** `navigateToGetStarted()` called `expect(this.installationHeading).toBeVisible()` internally, embedding an assertion inside a POM method. This violated the POM-as-action-driver principle: callers could not opt out, and a heading change would break every caller.

**Fix:** Assertion moved to the test in `playwright-dev.spec.ts`. `navigateToGetStarted()` now only performs the click.

**Benefit:** POM methods are pure actions. Assertions live where they belong — in tests — making each method reusable across different assertion contexts.

---

## 5. Coverage Expansion — API and Community Navigation

**Problem (#5):** Only the `Docs` link had a click + URL assertion test. `API` and `Community` were verified for visibility only.

**Fix:** Click + `toHaveURL` tests added for all three links, driven by the `NAV_LINKS` data table. Corresponding `navigateToApi()` and `navigateToCommunity()` methods added to the POM.

**Benefit:** Full behavioural coverage of all three navigation links against the original test case requirement.

---

## 6. Tautological Assertion Removed

**Problem (#7):** `expect(playwrightDev.mainNav).toHaveRole('navigation')` was asserted on a locator built with `getByRole('navigation', ...)`. The assertion could never fail independently of the locator itself, providing false confidence.

**Fix:** Assertion removed. The remaining `toHaveAccessibleName('Main')` is the meaningful check.

**Benefit:** Assertions now carry real signal; no test passes trivially by construction.

---

## 7. Standardised POM Instantiation Pattern

**Problem (#8):** `playwright-dev.spec.ts` used inline `const playwrightDev = new PlaywrightDevPage(page)` per test, while `main.navigation.spec.ts` used `let` + `beforeEach`. The `let` pattern assigned the instance in a closure, requiring tests to redeclare `{ page }` as a fixture parameter for URL assertions.

**Fix:** Both files now use the shared fixture. Each test receives `playwrightDevPage` as a typed parameter — self-contained, consistent, and framework-idiomatic.

**Benefit:** One instantiation pattern across the entire suite; no closure bugs or mixed fixture declarations.

---

## 8. Data-Driven Navigation Tests

**Problem (#10):** Role, accessible name, href, and URL assertions for each of the three links were expressed as separate, structurally identical test blocks — nine assertions repeated across three tests with only the link name changing.

**Fix:** A `NAV_LINKS` constant array holds all per-link metadata (locator getter, navigate action, href, URL pattern). A `for` loop generates two parametrised tests per entry.

**Benefit:** Adding or renaming a nav link requires exactly one change in one place. Tests are guaranteed to be consistent across all links.

---

## 9. `test.step` Labels for Multi-Assertion Tests

**Problem:** Multi-assertion tests produced undifferentiated failure messages — impossible to tell from the report which specific link or property failed.

**Fix:** Each assertion inside multi-step tests is wrapped in a named `test.step()` call.

**Benefit:** The HTML report and trace viewer show exactly which step failed (e.g. `"Docs link is visible"` or `href is "/docs/intro"`), cutting investigation time.

---

## Before / After Metrics

| Metric | Before | After |
|---|---|---|
| Spec files using shared fixture | 0 | 2 |
| Brittle selectors | 2 (`h1`, unscoped `getStartedLink`) | 0 |
| Assertions inside POM methods | 1 | 0 |
| Nav links with full click + URL coverage | 1 (Docs only) | 3 (Docs, API, Community) |
| Tautological assertions | 1 | 0 |
| Duplicated test blocks for nav links | 3 separate blocks | 1 data-driven loop |
| Dead locators | 1 (`pageTitle`) | 0 |
| Tests with named steps | 0 | 4 |
| Total tests passing | 9 | 10 |
