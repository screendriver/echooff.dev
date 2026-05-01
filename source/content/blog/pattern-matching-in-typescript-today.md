---
title: "Pattern matching in TypeScript today"
description: "JavaScript does not have pattern matching yet, but TypeScript developers can model states clearly and use ts-pattern for exhaustive pattern matching today."
publishedAt: "2026-05-01T09:09:00+02:00"
topic: "TypeScript"
---

## JavaScript does not have pattern matching yet

Pattern matching is one of those features that makes code feel boring in a good way.

You describe the shape of the data. You handle the cases that can happen. And when a new case appears, the compiler should tell you what you forgot.

That sounds nice.

It also sounds like something JavaScript does not really have today.

There is a [TC39 proposal for pattern matching](https://github.com/tc39/proposal-pattern-matching), but it is still listed as a [Stage 1 proposal](https://github.com/tc39/proposals/blob/main/stage-1-proposals.md). That means the idea is being explored, but the syntax and semantics are not something we should build production code around yet.

So this post is not about waiting for future JavaScript syntax.

It is about using the idea today in TypeScript.

And it starts with something TypeScript already supports surprisingly well: exhaustive `switch` statements.

## The real problem is not syntax

Most branching code starts harmlessly.

One `if`.

Then another `else if`.

Then a `switch`.

Then a nested condition inside one of the cases.

Then someone adds another state six months later, forgets one branch, and the bug escapes into production wearing a tiny fake moustache.

The problem is rarely that the syntax is ugly.

The problem is that the important question is not visible enough:

> Did we handle every possible case?

That is the real value of pattern matching.

Not cleverness.

Not functional programming decoration.

Not making code look like Rust, F#, Scala, Elixir, or Haskell because we saw a cool conference talk once.

I have a soft spot for Elm here.

Elm made me appreciate this style of code.

You model the possible states.

Then you handle them explicitly.

No hidden branch.

No silent fallthrough.

No pretending that impossible states are fine.

That is the part I want more of in TypeScript.

Not the syntax.

The discipline.

The value is exhaustiveness.

## Model the state first

Pattern matching only becomes useful when the data is modeled clearly.

If your state looks like this, TypeScript has very little to help you with:

```typescript
export type PaymentState = {
  isLoading: boolean;
  transactionId?: string;
  errorMessage?: string;
};
```

This type allows strange combinations.

A payment can be loading and still have a transaction id. It can have an error and a transaction id at the same time. It can have neither. Maybe that is valid. Maybe it is not.

The type does not say.

A better model is a discriminated union:

```typescript
export type PaymentState =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "success"; transactionId: string }
  | { type: "failed"; reason: string };
```

Now each state is explicit.

There is no optional soup. There are no magic combinations. The `type` property tells us which shape we are dealing with.

This is where TypeScript starts to become useful.

## A switch statement can already be exhaustive

Before reaching for a library, it is worth saying this clearly:

TypeScript can already make a `switch` statement exhaustive.

The current TypeScript Handbook shows this with the `never` type in its section about [exhaustiveness checking](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking).

```typescript
function assertNever(value: never): never {
  throw new Error(`Unhandled value: ${JSON.stringify(value)}`);
}

export function getPaymentLabel(state: PaymentState): string {
  switch (state.type) {
    case "idle":
      return "Waiting for payment";

    case "loading":
      return "Processing payment";

    case "success":
      return `Payment completed: ${state.transactionId}`;

    case "failed":
      return `Payment failed: ${state.reason}`;

    default:
      return assertNever(state);
  }
}
```

The `default` branch still exists.

For valid `PaymentState` values, it should never run.

That is the point.

After all known cases have been handled, `state` should be `never`.

If we add another variant to `PaymentState` and forget to handle it, TypeScript complains.

At runtime, the branch can still run if invalid data reaches this function.

Maybe from an API response.

Maybe from local storage.

Maybe from a force-cast.

Maybe from JavaScript code calling TypeScript code.

That is fine.

The branch is not there because we expect it to run in normal core code.

It is there to make missing cases visible.

This is the pure TypeScript baseline.

It is useful to know.

But it is not where I want to stop.

A `switch` can be exhaustive.

That does not make it proper pattern matching.

It still describes control flow.

When I can describe the shape of the data directly, I usually prefer that.

## So why use ts-pattern?

Because real branching logic is not always a simple `switch` over one property.

Sometimes we want to match nested data.

Sometimes we want to match multiple fields at once.

Sometimes a branch is only valid when a value has a specific shape.

Sometimes the `switch` starts to grow little `if` statements inside the cases, and then those `if` statements grow more `if` statements, and suddenly we have built a small conditional forest.

This is where [`ts-pattern`](https://github.com/gvergnaud/ts-pattern) becomes interesting.

`ts-pattern` is a TypeScript library for exhaustive pattern matching with type inference. It can match nested objects, arrays, tuples, primitive values, predicates, unions, intersections, and selected properties.

More importantly, it has `.exhaustive()`.

That is the feature I care about.

## The same example with ts-pattern

Here is the previous example with `ts-pattern`:

```typescript
import { match } from "ts-pattern";

export function getPaymentLabel(state: PaymentState): string {
  return match(state)
    .returnType<string>()
    .with({ type: "idle" }, () => {
      return "Waiting for payment";
    })
    .with({ type: "loading" }, () => {
      return "Processing payment";
    })
    .with({ type: "success" }, (state) => {
      return `Payment completed: ${state.transactionId}`;
    })
    .with({ type: "failed" }, (state) => {
      return `Payment failed: ${state.reason}`;
    })
    .exhaustive();
}
```

This is closer to what I want to write.

The branches describe the possible shapes of `PaymentState`.

There is no `default` branch.

There is no manual `assertNever` helper.

There is still exhaustiveness.

If we add a new state and forget to handle it, TypeScript complains.

That is the important part.

The exported function still has an explicit return type.

The match expression uses `.returnType<string>()`.

I do not want `(): string` on every single branch.

That is noise.

I am not interested in pattern matching because it looks more functional.

I am interested in it because it lets the code say what it means:

> Match this value by its shape. Handle every shape. Forget nothing.

## Where ts-pattern becomes more useful

The previous example was intentionally simple.

Now let us make the state more realistic.

A successful payment can produce different receipt types:

```typescript
export type PaymentState =
  | { type: "idle" }
  | { type: "loading" }
  | {
      type: "success";
      receipt:
        | { delivery: "email"; recipient: string }
        | { delivery: "download"; url: string };
    }
  | { type: "failed"; reason: string };
```

With a `switch`, we would probably switch on `state.type` first and then add another branch inside the success case.

That is fine.

But it is also the point where pattern matching starts to feel useful:

```typescript
import { match, P } from "ts-pattern";

export function getPaymentMessage(state: PaymentState): string {
  return match(state)
    .returnType<string>()
    .with({ type: "idle" }, () => {
      return "Waiting for payment";
    })
    .with({ type: "loading" }, () => {
      return "Processing payment";
    })
    .with(
      {
        type: "success",
        receipt: { delivery: "email", recipient: P.select() }
      },
      (recipient) => {
        return `Payment completed. The receipt was sent to ${recipient}.`;
      }
    )
    .with(
      { type: "success", receipt: { delivery: "download", url: P.select() } },
      (url) => {
        return `Payment completed. Download the receipt here: ${url}.`;
      }
    )
    .with({ type: "failed" }, (state) => {
      return `Payment failed: ${state.reason}`;
    })
    .exhaustive();
}
```

Now the branches describe the shape of the data directly.

We are not just saying:

> If this is a successful payment, go inside and check the receipt type.

We are saying:

> Match a successful payment with an email receipt.

And then:

> Match a successful payment with a downloadable receipt.

That is the difference.

The condition becomes structural.

## Pattern matching works well with Result-style code

Pattern matching also fits nicely with code that treats expected failures as values.

I wrote about this in [Avoid throwing for expected failures in TypeScript](/blog/avoid-throwing-for-expected-failures-typescript).

Once failures are values, we need to handle them somewhere.

For example:

```typescript
export type Result<TValue, TError> =
  | { type: "success"; value: TValue }
  | { type: "failure"; error: TError };
```

A `switch` works:

```typescript
type CreateUserError =
  | { type: "emailAlreadyUsed" }
  | { type: "invalidEmail"; email: string }
  | { type: "networkError"; message: string };

type CreateUserResult = Result<{ userId: string }, CreateUserError>;

export function getCreateUserMessage(result: CreateUserResult): string {
  switch (result.type) {
    case "success":
      return `User created: ${result.value.userId}`;

    case "failure":
      switch (result.error.type) {
        case "emailAlreadyUsed":
          return "This email address is already used.";

        case "invalidEmail":
          return `This email address is invalid: ${result.error.email}`;

        case "networkError":
          return result.error.message;

        default:
          return assertNever(result.error);
      }

    default:
      return assertNever(result);
  }
}
```

This is type-safe, but it is also a little noisy.

With `ts-pattern`, the branches can describe the complete shape:

```typescript
import { match } from "ts-pattern";

export function getCreateUserMessage(result: CreateUserResult): string {
  return match(result)
    .returnType<string>()
    .with({ type: "success" }, (result) => {
      return `User created: ${result.value.userId}`;
    })
    .with({ type: "failure", error: { type: "emailAlreadyUsed" } }, () => {
      return "This email address is already used.";
    })
    .with({ type: "failure", error: { type: "invalidEmail" } }, (result) => {
      return `This email address is invalid: ${result.error.email}`;
    })
    .with({ type: "failure", error: { type: "networkError" } }, (result) => {
      return result.error.message;
    })
    .exhaustive();
}
```

This is the kind of example where `ts-pattern` earns its place.

The code is still explicit. But the nesting disappears.

## Pattern matching is not validation

One thing I would be careful about: pattern matching is not a replacement for proper runtime validation at the boundaries of your application.

If data comes from an API, local storage, the URL, `postMessage`, or any other external source, TypeScript does not magically make that data safe.

TypeScript only checks what your code claims is true.

So I would still validate unknown external data at the edge of the system. After that, pattern matching becomes useful for working with trusted domain values inside the application.

In other words:

Validate at the boundary.

Pattern match in the core.

## Where I would use it

I would consider `ts-pattern` for:

- discriminated unions with several cases
- nested result values
- async UI states
- state machine-like transitions
- API result handling after validation
- domain logic where all cases must be visible

The main signal is not the number of lines.

The main signal is whether forgetting a case would be dangerous.

## Where I would not use it

I would not use pattern matching for everything.

I would not use it for a simple boolean.

I would not use it for a two-line `if` statement.

I would not use it to make ordinary code look more advanced.

And I would not introduce it into a team without explaining the underlying idea first.

Pattern matching is useful when the team understands discriminated unions, narrowing, and exhaustiveness. Without that foundation, it can look like another clever abstraction that makes code harder to approach.

That is not the goal.

The goal is boring safety.

## Prefer the shape over the control flow

My rule of thumb would be:

Use a normal `if` when the condition is simple.

Use an exhaustive `switch` when you want to stay in plain TypeScript or when the team is not ready for another abstraction yet.

Use proper pattern matching when the domain is modeled as a union and the branches are easier to read as shapes.

That is the direction I prefer.

Not because `switch` is unusable.

It is usable.

But pattern matching usually describes the intent better.

`ts-pattern` is not better because it is more functional.

It is better when it makes impossible states harder to miss.

## Conclusion

JavaScript does not have native pattern matching yet.

The proposal is still early, and the final syntax may change.

But TypeScript developers do not need to wait to benefit from the idea.

A discriminated union plus an exhaustive `switch` already proves the important idea:

The compiler can force us to handle every case.

But when proper pattern matching is available, I prefer it.

It keeps the branches close to the data shapes.

It removes the manual `default` branch.

It makes the intent more direct.

The important lesson is still not the library.

The important lesson is this:

Model your states clearly. Handle every case explicitly. Make the compiler complain when you forgot one.

That is pattern matching in spirit.

And we can use that today.
