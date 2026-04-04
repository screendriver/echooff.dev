---
title: "High coverage is not enough: mutation testing in TypeScript with Stryker"
description: "Code coverage shows what your tests execute. Mutation testing shows whether your tests fail when the code is wrong, and where Stryker fits."
publishedAt: "2026-03-19T09:03:00+01:00"
---

Many teams track test coverage.

That is reasonable.

Coverage can show whether important parts of a codebase are exercised at all. It can reveal obvious gaps. It can help prevent entire modules from going completely untested.

But coverage is a weak proxy for confidence.

Once a codebase has a decent test suite, the important question changes.

The question is no longer whether tests execute the code.

The question is whether the tests would fail if the code were wrong.

Or put differently: _how do you test your tests?_

That is where mutation testing becomes interesting.

## Coverage measures execution, not protection

Coverage tells us which lines, branches, or functions were executed while the tests ran.

That is useful.

But execution is not the same as protection.

A test can execute a line of code without asserting the behavior that matters. A branch can be covered while the assertion is too weak to catch a real defect. A function can be called while the test only checks that "something" was returned.

That is how teams end up with reassuring coverage numbers and a misleading sense of safety.

The code was touched.

But the behavior was not specified precisely enough.

That is the gap mutation testing helps expose.

## What mutation testing actually tells you

[Mutation testing](https://en.wikipedia.org/wiki/Mutation_testing) introduces small changes into production code and runs the tests against those changes.

Those changes are called mutants.

For example, a mutation testing tool might:

- change `>` to `>=`
- change `===` to `!==`
- replace `+` with `-`
- return `false` instead of `true`
- remove part of an expression

If the tests fail, the mutant is killed.

If the tests still pass, the mutant survives.

A surviving mutant is a strong signal that the test suite did not detect a meaningful behavioral change.

That does not always mean the tests are bad.

Sometimes the mutated code is unreachable. Sometimes the mutation is equivalent and does not change behavior in practice. But very often a surviving mutant reveals something useful: a missing edge case, a weak assertion, or a test that exercises code without really protecting it.

That is why mutation testing is valuable.

It does not ask whether your code was executed.

It asks whether your tests would notice if the code became wrong.

## A small TypeScript example

Imagine this function:

```typescript
export function isDiscountEligible(total: number): boolean {
  return total > 100;
}
```

And imagine tests like this:

```typescript
import test from "node:test";
import assert from "node:assert/strict";

import { isDiscountEligible } from "./is-discount-eligible.js";

test("returns a boolean", () => {
  assert.equal(typeof isDiscountEligible(120), "boolean");
});

test("returns true for a large order", () => {
  assert.equal(isDiscountEligible(120), true);
});
```

The tests pass.

The function is covered.

That still does not mean the behavior is well specified.

Now imagine a mutant changes the implementation to this:

```typescript
export function isDiscountEligible(total: number): boolean {
  return total >= 100;
}
```

Would the tests fail?

No.

The mutant survives.

That surviving mutant tells us something important: the test suite never specified the boundary clearly. The implementation may currently be correct, but the tests do not prove it strongly enough.

A better test suite would make the business rule explicit:

```typescript
import test from "node:test";
import assert from "node:assert/strict";

import { isDiscountEligible } from "./isDiscountEligible";

test("returns false below the threshold", () => {
  assert.equal(isDiscountEligible(99), false);
});

test("returns false at the threshold", () => {
  assert.equal(isDiscountEligible(100), false);
});

test("returns true above the threshold", () => {
  assert.equal(isDiscountEligible(101), true);
});
```

Now the same mutation would be killed.

That is the kind of improvement mutation testing drives.

It pushes tests away from vague confirmation and toward precise behavioral specification.

## Why this matters in real codebases

This is not really about a single mutated operator.

It is about how teams think about automated tests.

In many codebases, test suites grow over time without a consistent standard for what makes a test strong. Some tests are excellent. Others mostly assert implementation details, broad shapes, or happy-path output.

The result is often a suite that looks healthy from a distance:

- many tests
- high coverage
- green pipelines

And yet the actual confidence is uneven.

Mutation testing is useful because it makes that visible.

It highlights places where the suite looks stronger than it really is.

That is especially valuable in mature codebases. Once basic testing discipline exists, the next problem is usually not the complete absence of tests. The next problem is that some tests are far less effective than the team assumes.

## Where Stryker fits in

[Stryker](https://stryker-mutator.io) is a practical way to bring mutation testing into a TypeScript codebase.

It automates the work that nobody is going to do manually at scale: creating mutants, running the test suite against them, and reporting which mutants survived.

That makes Stryker useful as a diagnostic tool.

That wording matters.

I would not frame Stryker as something every project must run everywhere all the time. I would frame it as a way to evaluate the strength of a test suite in places where correctness matters.

That is a much more pragmatic position.

Used that way, Stryker helps answer questions like these:

- Which parts of the codebase are covered but still weakly protected?
- Where are assertions too vague?
- Which edge cases were never properly specified?
- Which tests execute code without proving much?

That is a better conversation than simply asking for a higher coverage percentage.

## What surviving mutants usually reveal

In practice, surviving mutants often point to one of a few recurring problems.

### Weak assertions

Tests sometimes verify that a value exists, that an array has an item, or that a function returned "something correct-looking" without checking the exact behavior that matters.

Those tests often survive meaningful mutations.

### Missing edge cases

Boundary conditions are a classic source of surviving mutants.

A suite may verify the obvious happy path while never specifying what should happen exactly at the threshold, on empty input, or for unusual combinations of values.

### Indirect tests

Some tests pass only because they exercise a wider flow that happens to include the code under test. They may fail to protect the specific behavior in a precise way.

Mutation testing often exposes that weakness.

### Unnecessary code

Sometimes a surviving mutant points at code that may not need to exist at all.

A defensive branch, fallback path, or extra condition might survive because nothing in the system truly depends on it. That can be a testing problem, but sometimes it is a design signal.

Mutation testing can improve production code by revealing logic that is unclear, redundant, or not meaningfully exercised.

## Mutation testing raises the bar for what a good test looks like

One of the most useful things about mutation testing is that it changes the standard.

A good test is not merely a test that passes.

A good test is one that fails for the right reason when the behavior changes incorrectly.

That leads to better habits:

- stronger assertions
- better boundary coverage
- more precise specification of business rules
- less reliance on vague happy-path tests
- less temptation to treat coverage as a goal in itself

That is why mutation testing fits especially well with teams that already take testing seriously.

It is not a substitute for basic testing discipline.

It is a way to sharpen it.

## Be deliberate

Mutation testing has a real cost.

It is slower than a normal test run because the suite has to run many times against many small changes. On large applications, running it indiscriminately can become expensive and noisy.

So the answer is not to mutate everything blindly.

The better approach is to start where confidence matters most:

- domain logic
- business rules
- critical calculations
- shared libraries
- code with important edge cases

That is usually a better starting point than trying to mutate an entire application on day one.

## Coverage is still useful, but it is not enough

Coverage still has value.

It helps teams find obvious gaps. It can highlight completely untested code. It can be a helpful guardrail.

But it should not be mistaken for proof that the tests are strong.

That is the key point.

Coverage can tell you that code ran.

Mutation testing can tell you whether the tests would fail if the code were wrong.

That is why mutation testing matters.

And that is why a tool like Stryker is useful.

It helps teams move from counting executed lines to asking a more important question:

Do these tests really protect the behavior we care about?
