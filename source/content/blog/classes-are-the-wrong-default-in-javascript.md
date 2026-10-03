---
title: "Classes are the wrong default in JavaScript"
description: "Prefer pure functions for rules and closures for construction. Classes should solve a concrete problem, not become the default shape of application code."
publishedAt: "2026-10-03T18:05:00+02:00"
topic: "Architecture"
---

In my opinion, adding `class` syntax to JavaScript was one of the worst decisions made for the language. JavaScript already had functions, closures and objects. Those give me the building blocks I want for application code, without making an instance the starting point for every piece of behavior.

Class syntax did not introduce objects or mutation to JavaScript. It builds on the language's [prototype model](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes). My objection is to the class-first way of organizing code: deciding which object should own a rule before asking whether that rule needs an object at all. Familiarity with class-heavy languages is not a sufficient reason to carry that design into JavaScript.

I prefer to start with the data a decision needs, write a function that makes that decision and introduce state or dependencies where the work actually requires them.

The examples use TypeScript to make the contracts explicit, but the design argument applies equally to JavaScript.

## A calculation should not need an object history

Suppose an order ships free when its subtotal after discounts reaches 100 €. Otherwise, shipping costs 5 €. The example assumes validated, non-negative integer amounts in cents:

```typescript
class ShippingQuote {
  #subtotalInCents: number;
  #discountInCents = 0;

  constructor(subtotalInCents: number) {
    this.#subtotalInCents = subtotalInCents;
  }

  setDiscount(discountInCents: number): void {
    this.#discountInCents = discountInCents;
  }

  calculate(): number {
    const discountedSubtotalInCents = Math.max(
      0,
      this.#subtotalInCents - this.#discountInCents
    );

    if (discountedSubtotalInCents >= 10_000) {
      return 0;
    }

    return 500;
  }
}
```

There is no inheritance hierarchy, global dependency or network call here. The class is small and straightforward to test. The issue is what its interface asks the caller to manage:

```typescript
const quote = new ShippingQuote(11_000);

const beforeDiscount = quote.calculate();

quote.setDiscount(2_000);

const afterDiscount = quote.calculate();
```

`beforeDiscount` is `0`; `afterDiscount` is `500`. Both calls use the same object and the same empty argument list. The changed input is stored inside the instance, so understanding the result requires knowing what happened to that instance before the call.

That can be appropriate for an object whose purpose is to manage changing state. Here, however, we only need to calculate a price. The setter introduces an ordering requirement that the calculation itself does not need.

The same rule can live in a `shipping.ts` module:

```typescript
export type OrderPricing = {
  readonly subtotalInCents: number;
  readonly discountInCents: number;
};

export function calculateShippingCost(pricing: OrderPricing): number {
  const { subtotalInCents, discountInCents } = pricing;
  const discountedSubtotalInCents = Math.max(
    0,
    subtotalInCents - discountInCents
  );

  if (discountedSubtotalInCents >= 10_000) {
    return 0;
  }

  return 500;
}
```

Now both inputs arrive together. The function neither stores them for a later call nor changes them. A checkout screen can calculate the current price and preview a proposed discount using separate values, without temporarily changing an object and remembering to restore it.

The type and the rule still live together in the same module. Separating data from behavior does not mean scattering related code across the repository. It means the calculation does not need to belong to a particular mutable instance.

The `readonly` properties describe the intended usage to TypeScript, but they [do not freeze the object at runtime](https://www.typescriptlang.org/docs/handbook/2/objects.html#readonly-properties). The calculation is pure because of what its implementation does, not because of a type annotation.

## Test the rule, not the setup sequence

A test for the discounted price can use ordinary data:

```typescript
import assert from "node:assert";
import { test } from "node:test";

import { calculateShippingCost } from "./shipping.js";

test("checks the free-shipping threshold after applying the discount", () => {
  const pricing = {
    subtotalInCents: 11_000,
    discountInCents: 2_000
  };

  assert.strictEqual(calculateShippingCost(pricing), 500);
});

test("ships free when the discounted subtotal reaches the threshold", () => {
  const pricing = {
    subtotalInCents: 12_000,
    discountInCents: 2_000
  };

  assert.strictEqual(calculateShippingCost(pricing), 0);
});
```

These tests supply the complete calculation inputs directly. They do not construct a quote and then move it into the state the test needs.

The original class does not need [test doubles](/blog/not-every-test-double-is-a-mock) either. Removing `class` has not magically made an untestable example testable. The useful change is that the rule no longer depends on mutable instance state.

When several methods share mutable state, a new operation can change what existing methods must handle. For the quote a test could apply a discount that removes free shipping, then remove it and check that free shipping returns. Testing a discounted quote and a separately created undiscounted quote does not exercise that sequence. The setter here only replaces one number, so the interaction is simple. The testing burden grows when operations also update cached results or change which operations are allowed next.

A new method can therefore create test cases for existing methods, not only for itself. That does not mean testing every possible ordering. Some states are unreachable, some sequences are equivalent and not all methods interact. The relevant combinations depend on the contract, not just the number of methods.

Pure functions still need tests for relevant input combinations. What disappears is the need to reach those inputs by calling other operations on the same object. Stateful workflows elsewhere in the application still need their own tests.

Unrelated dependencies add another kind of test setup. If testing a price calculation requires constructing an order service with a repository and an event publisher, the calculation has acquired dependencies it does not use. Injecting those dependencies is better than hiding them, but it does not explain why this particular rule needs them present at all.

A class can avoid that problem. It can hold immutable values, receive narrow dependencies and expose methods that calculate without changing anything. I would still ask what the instance contributes compared with a function, but I would not call it difficult to test merely because it is a class.

This is the same concern behind [why unit tests feel fragile](/blog/why-your-unit-tests-feel-fragile): investigate the design before compensating for it in the test setup. For a calculation an explicit input and a returned value are usually where I would start.

## Factories handle construction without classes

An application still has to load the pricing data. That is a different responsibility from calculating the shipping cost and a factory can connect the two without putting both into one stateful object.

In `shipping-quotes.ts`:

```typescript
import { calculateShippingCost, type OrderPricing } from "./shipping.js";

type ShippingQuotes = {
  forOrder: (orderId: string) => Promise<number>;
};

type CreateShippingQuotesOptions = {
  loadOrderPricing: (orderId: string) => Promise<OrderPricing>;
};

export function createShippingQuotes(
  options: CreateShippingQuotesOptions
): ShippingQuotes {
  const { loadOrderPricing } = options;

  return {
    async forOrder(orderId: string): Promise<number> {
      const pricing = await loadOrderPricing(orderId);

      return calculateShippingCost(pricing);
    }
  };
}
```

The factory receives the dependency once. Its returned operation keeps access to that dependency through a [closure](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures). Callers can ask for a quote without supplying the loader each time, while tests can supply a small implementation directly.

This is [dependency injection without a framework](/blog/dependency-injection-without-frameworks-in-typescript). Construction is explicit, the public contract is named and the operation stays directly inside the returned object.

`forOrder()` is not pure. It calls an injected operation that may read from a database or a remote service. Passing that operation as an argument makes the dependency controllable; it does not remove the effect. The shipping calculation remains separate and can be tested without the loader.

That separation is the point of [protecting the happy zone](/blog/clean-architecture-protects-the-happy-zone). Loading data belongs outside the calculation, regardless of whether the surrounding integration uses functions or classes.

The returned method also does not use `this`. It can be passed around without losing access to its loader. A class method that reads instance fields needs its receiver preserved, for example through binding or an arrow-function field. The [TypeScript handbook explains those trade-offs](https://www.typescriptlang.org/docs/handbook/2/classes.html#this-at-runtime-in-classes). Ordinary object methods can depend on `this` too; using a closure here deliberately avoids that dependency.

## Encapsulation does not require a class

Private class fields can protect internal state, but they are not the only way to keep implementation details out of a public interface. A factory can retain local variables and expose only the operations callers need. A module can keep helpers private by not exporting them.

There are good reasons to keep state behind a small interface. A cache needs to retain entries. A connection has a lifecycle. I would rather put that state behind a deliberate boundary than let unrelated code mutate it freely. None of that requires every business rule to become a method on a stateful object.

Closures are not an automatic improvement, though. Replacing `this.discount` with a captured `let discount` preserves the same call-order dependency. Returning getters and setters from `createShippingQuote()` would mostly rename the original design. A closure-based object can still be object-oriented; the absence of `class` says nothing by itself about purity.

For the same reason, replacing inheritance with a large factory full of flags would not be progress. When quoting and submitting an order share a calculation, both can call `calculateShippingCost()`. They do not need a common base class and they do not need a generic factory that predicts every future variation.

The question is which behavior and state genuinely belong together. I do not want the available syntax to answer that question for me.

## A class should have a concrete reason to exist

There are practical reasons to write classes. [Extending `Error`](https://tc39.es/ecma262/multipage/fundamental-objects.html#sec-error-constructor) can be useful when calling code needs to distinguish a particular kind of exception. A library may also require a subclass. I would keep those classes focused rather than invent a workaround just to avoid the keyword. This does not change my preference for [returning expected failures explicitly](/blog/avoid-throwing-for-expected-failures-typescript) instead of throwing them.

There are allocation differences to consider as well. Ordinary class methods [are shared through a prototype](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes#methods), whereas methods created inside a factory are new function objects on each factory call. That can matter when creating many instances. It is a reason to measure the relevant design, not a reason to wrap every rule in a class. The standalone `calculateShippingCost()` function is shared without allocating a closure for each order.

Those are concrete constraints. A familiar-looking `Service`, `Manager` or `Helper` class is not one. Even the TypeScript handbook points out that [static-only classes are unnecessary](https://www.typescriptlang.org/docs/handbook/2/classes.html#why-no-static-classes): ordinary functions and objects already do that job.

A working class is not automatically a design I want to keep. I would replace it when functions and composition make the code more direct or more consistent with the surrounding codebase. The refactoring still has to justify its cost and preserve the behavior callers rely on.

For new application code, I start with functions. I use closures when construction or a controlled lifetime requires them. A class needs to solve a problem those choices do not already solve well; it does not get introduced just because a feature needs somewhere to live.
