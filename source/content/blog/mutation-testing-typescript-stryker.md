---
title: "High coverage is not enough: mutation testing in TypeScript with Stryker"
description: "Code coverage shows what your tests execute. Mutation testing shows whether your tests fail when the code is wrong, and where Stryker fits."
publishedAt: "2026-03-19T09:03:00+01:00"
updatedAt: "2026-09-01T16:54:00+02:00"
topic: "Testing"
---

Test coverage is useful, but it is often expected to answer a question it cannot answer. It can show which lines, branches and functions ran during the test suite. It cannot show whether the assertions would detect incorrect behavior.

Once a codebase has a reasonable test suite, that distinction matters more than another percentage point of coverage. The interesting question is no longer whether the tests execute the code. It is whether they would fail if the code were wrong. Put differently: _how do you test your tests?_

Mutation testing is one practical answer.

## Coverage measures execution, not protection

A test can execute a line without asserting the behavior that matters. It can cover a branch while checking the result too loosely to detect a defect. It can call a function and verify only that something was returned.

This is how a test suite can report reassuring coverage while providing much less protection than the number suggests. The code was exercised, but its behavior was not specified precisely enough. Mutation testing helps make that gap visible.

## What mutation testing actually tells you

Mutation testing makes small changes to production code and runs the tests against each changed version. Those changes are called mutants. A mutation testing tool might change `>` to `>=`, replace `===` with `!==`, replace `+` with `-`, return `false` instead of `true` or remove part of an expression.

When the tests fail, the mutant is killed. When they continue to pass, the mutant survives. A surviving mutant means the suite did not distinguish the changed implementation from the original.

That result still requires judgment. The mutation may be equivalent to the original implementation, which means no useful test could kill it. More often, however, a surviving mutant exposes a missing edge case, a weak assertion, or a test that executes code without protecting its behavior. Stryker reports mutants that were not executed separately as having no coverage. Coverage tells us that the code ran; mutation testing asks whether the tests would notice when it became wrong.

## A small TypeScript example

Consider this function:

```typescript
export function isDiscountEligible(total: number): boolean {
  return total > 100;
}
```

Its tests might look like this:

```typescript
import assert from "node:assert";
import { test } from "node:test";

import { isDiscountEligible } from "./isDiscountEligible.js";

test("returns false below the threshold", () => {
  assert.strictEqual(isDiscountEligible(80), false);
});

test("returns true above the threshold", () => {
  assert.strictEqual(isDiscountEligible(120), true);
});
```

Both tests pass, cover both outcomes and make the suite look reasonable. They still do not specify the boundary of the business rule.

A mutation testing tool could change the implementation to this:

```typescript
export function isDiscountEligible(total: number): boolean {
  return total >= 100;
}
```

Both existing tests would continue to pass, so the mutant would survive. They prove what happens below and above the threshold, but say nothing about what should happen at exactly `100`.

The missing specification is the boundary itself. Adding this test kills the mutation:

```typescript
test("returns false at the threshold", () => {
  assert.strictEqual(isDiscountEligible(100), false);
});
```

The improvement is not the additional test count. The suite now describes the rule precisely enough to distinguish the intended implementation from a plausible defect.

## Why this matters in real codebases

A mature test suite is rarely uniformly strong. Some tests specify behavior precisely. Others assert implementation details, broad object shapes or little more than the happy path. From a distance, the suite can still look healthy: it contains many tests, reports high coverage and keeps the pipeline green. The confidence it provides is much less consistent.

Mutation testing exposes that inconsistency. This becomes especially useful after a team has established basic testing discipline. At that point, the main problem is usually not that no tests exist. It is that some tests protect far less than the team assumes.

## Where Stryker fits in

[Stryker](https://stryker-mutator.io) automates the repetitive work involved in mutation testing. It creates mutants, runs the relevant tests against them and reports which changes survived. Doing that manually can help explain the technique, but it does not scale beyond a small example.

I see Stryker as a diagnostic tool rather than something every project should run across its entire codebase on every change. Used deliberately, it shows which covered areas remain weakly protected, where assertions are vague, which edge cases have not been specified and where tests execute code without proving much about its behavior. Those findings are more useful than simply demanding a higher coverage percentage.

## What surviving mutants usually reveal

Weak assertions are a common cause. A test may verify that a value exists, that an array contains an item or that a function returned something that looks broadly correct without checking the exact result that matters. Such a test can exercise the implementation and still survive a meaningful mutation.

Missing edge cases are another common source. Happy-path tests often leave thresholds, empty input, and unusual combinations of values unspecified. Mutations around those boundaries expose the omission quickly.

Surviving mutants can also reveal overly indirect tests. A wider test may happen to execute the code as part of a larger flow without protecting its specific behavior. The test passes, the line is covered but a local defect remains invisible.

Sometimes the production code is the problem. A defensive branch, fallback path, or extra condition may survive because nothing in the system depends on it. That may call for another test but it may instead be evidence that the code is redundant or that its purpose is unclear. Mutation testing can therefore reveal design problems as well as weaknesses in a test suite.

## Mutation testing raises the bar for a good test

A passing test is not necessarily a useful test. A useful test fails for the right reason when behavior changes incorrectly. Mutation testing makes that standard concrete and tends to produce stronger assertions, better coverage of boundaries, and more precise descriptions of business rules. It also makes vague happy-path tests and coverage targets harder to mistake for confidence.

Mutation testing pays off once basic testing discipline already exists. It does not replace that discipline; it gives the team a way to examine how effective it has been.

## Be deliberate

Mutation testing is slower than a normal test run because the suite must run repeatedly against many modified versions of the code. Applying it indiscriminately to a large application can be expensive and noisy.

Start where additional confidence has clear value: domain logic, business rules, critical calculations, shared libraries and code with difficult edge cases. These areas usually provide a better return than treating the mutation score of an entire system as another quality target.

## High coverage should not end the conversation

Coverage remains useful for finding untouched modules, untested branches, and other obvious gaps. The problem begins when it is treated as evidence that the tests are strong.

In a mature TypeScript codebase, a high coverage number should lead to a more useful question: do these tests protect the behavior we care about?

Mutation testing provides concrete evidence. Stryker makes the technique practical by exposing places where confidence looks stronger in the coverage report than it is in the tests themselves. That feedback is more valuable than another percentage point of coverage.
