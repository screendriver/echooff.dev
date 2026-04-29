---
title: "Why Testing Library is not unit testing"
description: "Testing Library is useful, but rendering components and testing them through the DOM is integration testing, not unit testing."
publishedAt: "2026-04-05T16:32:00+02:00"
topic: "Testing"
---

A lot of frontend teams talk about "unit tests" when they really mean something else.

They render a React component, include providers, maybe routing, maybe asynchronous behavior, interact with the UI through the DOM, and then call the result a unit test.

That is not unit testing.

That is integration testing.

This is not a criticism of [Testing Library](https://testing-library.com).
It can be a useful tool.
The problem is the label.

Calling these tests "unit tests" blurs an important distinction.
Unit tests and integration tests are both valuable, but they solve different problems and come with different trade-offs.

This article is also a follow-up to my previous post about test IDs in production: [Why you should not ship test IDs to production](/blog/why-you-should-not-ship-test-ids-to-production-react-testing-library).

## The problem is not the tool

Testing Library encourages tests that interact with the UI in a way that is closer to how users use the application.

That is a reasonable goal.

But once you render a component and assert on what appears in the DOM, you are no longer testing a small isolated unit in the strict sense.

You are testing the integration between several parts:

- the component itself
- its child components
- React rendering
- event handling
- state updates
- context or providers
- browser-like DOM behavior

Even if the test file is small, the scope of the test is not.

That matters because the name shapes expectations.
If the scope is integration, calling it a unit test creates false expectations about speed, isolation, and how easy failures are to diagnose.

## What unit testing actually means

A unit test focuses on a small piece of behavior in isolation.

Usually that means testing logic without rendering a UI and without pulling in framework machinery unless that machinery is the unit itself.

A real unit test tries to answer a narrow question:

Does this piece of logic behave correctly for a given input?

Implementation:

```typescript
type Price = {
  amount: number;
  currency: "EUR" | "USD";
};

export function applyDiscount(price: Price, discountPercentage: number): Price {
  return {
    ...price,
    amount: price.amount - price.amount * (discountPercentage / 100)
  };
}
```

A unit test for this function is simple, direct, and isolated:

```typescript
import assert from "node:assert/strict";
import test from "node:test";
import { applyDiscount } from "./apply-discount.js";

test("applies the discount percentage to the price", () => {
  const result = applyDiscount(
    {
      amount: 100,
      currency: "EUR"
    },
    20
  );

  assert.deepEqual(result, {
    amount: 80,
    currency: "EUR"
  });
});
```

This test does not need React.
It does not need a DOM.
It does not need providers, rendering queries, or simulated browser interactions.

It exercises one unit of behavior directly.

That is the point of a unit test.

## What Testing Library usually gives you instead

Now compare that to a typical Testing Library test:

```typescript
import assert from "node:assert/strict";
import test from "node:test";
import type { FunctionComponent } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

type SaveButtonProps = {
  onSave: () => void;
};

const SaveButton: FunctionComponent<SaveButtonProps> = ({ onSave }) => {
  return <button onClick={onSave}>Save</button>;
};

test("calls onSave when the user clicks the button", async () => {
  let saved = false;

  render(
    <SaveButton
      onSave={() => {
        saved = true;
      }}
    />,
  );

  await userEvent.click(screen.getByRole("button", { name: "Save" }));

  assert.equal(saved, true);
});
```

This is a good test for a user interaction.

But it is not a unit test.

It depends on React rendering the component.
It depends on a DOM environment.
It depends on event dispatching and browser-like behavior.
It depends on Testing Library finding the element through the rendered output.
It depends on `userEvent` simulating the interaction correctly.

That is already an integration of multiple parts.

Again, there is nothing wrong with that.
It is only a problem when teams blur the distinction and then wonder why their so-called unit tests are broader, slower, and harder to debug than expected.

## Shallow rendering made this distinction clearer

In the past, React had a testing style that made this distinction easier to see.

Shallow rendering let you render a component one level deep without rendering its child components and without requiring a DOM.
That was much closer to what many frontend teams meant when they talked about unit testing a component.

It was still React-specific, but the scope stayed smaller.

You could verify what a component returned at its own boundary without immediately pulling a whole subtree into the test.
That made it easier to stay closer to isolated component-level testing instead of automatically testing several layers together.

That path has largely faded away.

[`react-test-renderer`](https://www.npmjs.com/package/react-test-renderer) is now deprecated, and shallow rendering is part of the same story.
So today many teams jump directly from pure logic tests to DOM-based component tests.

That is one reason the terminology gets blurry.
What used to be a smaller and more isolated style of component testing is no longer part of the modern default recommendation, so many people call Testing Library tests "unit tests" even though they are testing the integration of React, the DOM, events, accessibility queries, and often multiple components at once.

The tool changed.
The category of the test did not.

## Testing through the UI is valuable, but it is still integration testing

Testing Library became popular for a reason.

> The more your tests resemble the way your software is used, the more confidence they can give you.

There is truth in that.

Tests that go through the UI can give strong confidence that multiple parts work together correctly from the outside.

But that still does not make them unit tests.
It makes them valuable integration tests.

## Why the distinction matters

Some people treat this as only a naming discussion.
I do not think it is.

Once you confuse unit tests with integration tests, failure diagnosis gets harder.

If a unit test fails, the failing behavior is usually close to the cause.
If a DOM-based component test fails, the reason could be rendering, composition, markup, accessibility, state flow, asynchronous timing or the behavior itself.

Test suites also become slower than they need to be.

Pure logic tests are usually fast and cheap.
UI integration tests are heavier.
That is normal.
But it becomes a problem when teams write most of their tests at the integration level while still believing they are writing unit tests.

Architecture often stays too implicit as well.

When logic is buried inside components, teams are forced to test through rendering because there is no smaller boundary available.
That is often a design smell.

The test strategy exposes the design.

If the only practical way to verify behavior is to mount a component tree, there may not be a clean separation between behavior and framework code.

## Testing through the UI is not automatically better

A common reaction is: "But this is how the user uses the app."

That is true.

And that is exactly why these tests are integration tests.

They are valuable because they verify that multiple parts work together from the outside.
But they are not a replacement for smaller tests at the logic level.

Not every piece of behavior should be verified by clicking buttons in a rendered component.

When business logic, decision logic and transformation logic are extracted into plain functions, those parts can be tested directly and precisely.
That usually leads to tests that are easier to understand and easier to maintain.

Then UI-level tests can focus on what actually needs integration coverage:

- wiring
- rendering
- accessibility
- user interaction
- framework integration

That is a much better balance.

## A component test can still be useful

To be clear, I am not arguing against Testing Library.

I am arguing against inaccurate terminology and the confusion that follows from it.

A Testing Library test can be a very good integration test.
Sometimes it is exactly the right choice.

For example, if you want to verify that:

- a button is accessible by role and name
- an input updates state correctly
- submitting a form shows the expected validation message
- multiple components work together correctly

then rendering the component and testing it through the DOM is a strong approach.

But that still does not make it unit testing.

A useful integration test is still an integration test.

## The naming affects how teams think

When teams call everything a unit test, they often end up with a distorted testing pyramid.

They believe they have lots of unit coverage, but in reality they have a large number of medium-sized integration tests.
Those tests are broader, more expensive and more sensitive to unrelated changes.

Then people conclude that testing is slow, brittle or difficult.

Often the real issue is not testing itself.
It is that the suite is built at the wrong level for too many cases.

Precise language helps here.

If a test renders a component and verifies behavior through the DOM, call it what it is: an integration test.

If a test exercises a small isolated piece of logic directly, call it a unit test.

That distinction makes trade-offs visible.

## Better boundaries lead to better tests

This is also one of the reasons I care so much about explicit boundaries in frontend code.

When logic is separated from rendering, unit testing becomes straightforward.
When behavior is tightly coupled to framework code, teams are pushed toward broader tests.

That does not mean every line of code must be tested in isolation.
It means the architecture should make isolation possible where it is useful.

The cleaner the boundaries, the more intentional the test strategy can become.

And once that happens, Testing Library fits into a healthier role:
not as the default answer for every kind of test, but as a tool for integration tests around UI behavior.

## Final thought

Testing Library is not unit testing.

It is usually integration testing around the UI.

That is not a weakness.
It is simply a different kind of test with different strengths, different costs, and different purposes.

The important part is to stop pretending these categories are the same.

When the terminology becomes more precise, the architecture often improves with it.
And when the architecture improves, the test strategy usually becomes clearer, faster and [less fragile](/blog/why-your-unit-tests-feel-fragile).
