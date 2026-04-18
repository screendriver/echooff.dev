---
title: "Why you should not access browser globals directly"
description: "Direct access to window, document, navigator and globalThis couples your code to the runtime, makes side effects harder to isolate, and leads to brittle tests."
publishedAt: "2026-04-18T11:30:00+02:00"
---

Browser globals like `window`, `document`, `navigator`, `location`, `history`, `localStorage` or even `globalThis` often look harmless.

They are available anyway.
So why not just use them?

Because direct access to globals couples your code to a specific runtime, hides side effects behind seemingly simple function calls and makes isolation much harder than it needs to be.

That is already a design problem in production code.

But it becomes even more obvious once you try to write unit tests.

## Browser globals are infrastructure

`window`, `document`, and `navigator` are not just values.
They are part of the environment your code happens to run in.

That makes them infrastructure.

Infrastructure is not the same thing as behavior.

When your domain logic, application logic or user interface logic reaches into global browser state directly, it stops being a self-contained unit.
It now depends on a runtime environment that exists outside the function.

That has a few consequences:

- the function is harder to understand in isolation
- the code is harder to reuse in other environments
- the side effects are less explicit
- the tests now depend on runtime setup instead of just inputs and outputs

This is the same mistake as reading from a database, the current date or time, or `process.env` directly in business logic.

The browser environment is just another dependency boundary.

## Direct global access hides dependencies

Consider this example:

```typescript
export function getLanguage(): string {
  return navigator.language;
}
```

At first glance, this looks small and simple.

But the function is not pure.
It reads external state.
Its behavior depends on the environment.
And the dependency is hidden.

The function signature says: no input.
Reality says: depends on `navigator`.

That mismatch matters.

A function should communicate what it needs.
If it depends on a language provider, that dependency should be explicit.

For example:

```typescript
type LanguageProvider = {
  getLanguage: () => string;
};

type GetLanguageOptions = {
  languageProvider: LanguageProvider;
};

export function getLanguage(options: GetLanguageOptions): string {
  const { languageProvider } = options;

  return languageProvider.getLanguage();
}
```

Now the dependency is visible.
The function can run anywhere.
And the test does not need a fake browser.

This is not about adding a dependency injection framework.
It is the same idea I described in [Dependency injection without frameworks](/blog/dependency-injection-without-frameworks-in-typescript): make dependencies visible, pass them explicitly and keep infrastructure at the edge.

## `globalThis` is not a magic solution

Some developers replace `window` with `globalThis` and think the problem is solved.

It is not.

`globalThis` gives you a standardized way to refer to the global object of the current environment.
That does not mean the available APIs are the same across environments.

A browser global object is not the same as a Node.js global object.

Node.js does not suddenly provide a real `document` just because `globalThis` exists.
And even where names overlap, behavior can still differ depending on the runtime.

So this is not much better:

```typescript
export function getTitle(): string {
  return globalThis.document.title;
}
```

The coupling is still there.
The side effect is still hidden.
The runtime dependency is still implicit.

You did not remove the problem.
You only changed the spelling.

## Unit tests should not need a fake browser

This usually becomes visible in tests.

Many teams run unit tests in Node.js.
That is a good default.
It is fast, simple and close to what unit tests actually need: executing JavaScript and checking behavior.

But Node.js does not provide a real browser environment.

There is no real `document`.
No real `window`.
No real [DOM](https://en.wikipedia.org/wiki/Document_Object_Model).

So once production code reads browser globals directly, teams often react by adding `jsdom` or `happy-dom` to make the tests pass.

That may make the error disappear.
But it does not improve the design.

Now the unit test only works because the test runner simulates a browser-like environment.
That means the test is no longer exercising an isolated unit.
It is exercising code plus a runtime simulation.

That is already closer to integration testing than unit testing.

A simulated DOM can be useful in the right place.
But it is still an approximation.
It should support intentional integration-style tests, component tests or browser-focused test scenarios.

It should not be the foundation for ordinary unit tests.

If your unit test only works once a fake browser has been installed, the design is usually telling you something.

## The problem is architectural

It is tempting to treat this as a test setup issue.

It is not.

Code that reads from globals directly is harder to compose and harder to move.

Maybe today it runs in the browser.
Tomorrow part of it runs during server-side rendering.
Or in a worker.
Or in Node.js during pre-rendering.
Or in a CLI script.
Or in a test without DOM access.

Direct global access makes that transition harder because environment assumptions are spread everywhere.

Once browser access is pushed behind an explicit boundary, the rest of the code becomes easier to reuse.

That is a design win even before the first test is written.

## Isolate browser access at the edge

The better approach is simple:

Keep browser-specific code at the edge of the system.
Pass the values or capabilities inward.

For example, instead of this:

```typescript
export function shouldUseDarkMode(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}
```

write this:

```typescript
type ColorSchemeReader = {
  prefersDarkMode: () => boolean;
};

type ShouldUseDarkModeOptions = {
  colorSchemeReader: ColorSchemeReader;
};

export function shouldUseDarkMode(options: ShouldUseDarkModeOptions): boolean {
  const { colorSchemeReader } = options;

  return colorSchemeReader.prefersDarkMode();
}
```

And then provide the browser implementation at the edge:

```typescript
type ColorSchemeReader = {
  prefersDarkMode: () => boolean;
};

export function createBrowserColorSchemeReader(): ColorSchemeReader {
  return {
    prefersDarkMode() {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
  };
}
```

Now the browser dependency is isolated in one place.

Your application logic stays portable.
Your unit tests stay simple.
And the side effect is explicit.

## Pass values when you do not need capabilities

In many cases, you do not even need to inject an object.
You can pass the value directly.

Instead of this:

```typescript
export function createGreeting(): string {
  return document.title === "Admin" ? "Welcome back" : "Hello";
}
```

prefer this:

```typescript
type CreateGreetingOptions = {
  pageTitle: string;
};

export function createGreeting(options: CreateGreetingOptions): string {
  const { pageTitle } = options;

  return pageTitle === "Admin" ? "Welcome back" : "Hello";
}
```

Then the composition root can read from the browser:

```typescript
const greeting = createGreeting({
  pageTitle: document.title
});
```

This keeps the dependency where it belongs.

Read from the outside world once.
Then pass plain data into the code that makes decisions.

That is usually the simplest form of dependency injection.

## Tests become smaller and more honest

Once globals are removed from the unit, tests stop needing environment tricks.

```typescript
import assert from "node:assert/strict";
import test from "node:test";

import { createGreeting } from "./create-greeting.js";

test("returns a welcome message for the admin page", () => {
  const result = createGreeting({
    pageTitle: "Admin"
  });

  assert.equal(result, "Welcome back");
});

test("returns a generic greeting for other pages", () => {
  const result = createGreeting({
    pageTitle: "Home"
  });

  assert.equal(result, "Hello");
});
```

This test runs in plain Node.js.
No `jsdom`.
No `happy-dom`.
No fake DOM bootstrapping.
No hidden browser contract.

Just inputs and outputs.

That is what unit testing should feel like.

## Browser wrappers should be boring

Another good side effect of this approach is that browser-specific code becomes small and boring.

That is a good thing.

You usually do not need to unit test a one-line wrapper around `document.title` or `window.matchMedia`.
The interesting behavior is not the wrapper.
The interesting behavior is what your application does with the value.

So keep browser access tiny.
Keep it explicit.
And spend your testing effort on the behavior that actually matters.

## Treat browser APIs like any other side effect

The browser is an external system.

It is available more often than a database or a network call, so people forget that.
But architecturally, it is still external.

Reading from `window`, mutating `document`, inspecting `navigator`, calling `localStorage` or reaching into `globalThis` are all interactions with the environment.

That means they should be treated like side effects:

- isolate them
- make dependencies explicit
- keep them at the boundary
- test the behavior separately from the environment

A test environment that compensates for hidden dependencies is not proof of good design.
It is often proof that the code and the environment have been coupled too early.

Once you isolate browser APIs properly, your code becomes easier to reason about and easier to test.

And you no longer need a fake browser just to verify a simple function.

## Closing thoughts

Direct access to browser globals is convenient in the same way many bad architectural decisions are convenient: it saves a few seconds now and creates confusion later.

The browser environment is infrastructure.
Infrastructure belongs at the edge.

Your units should not need `window`.
They should not need `document`.
They should not need `navigator`.
And replacing them with `globalThis` does not change the underlying problem.

Make the dependency explicit instead.

That gives you clearer boundaries, more honest tests and code that is much easier to move, reuse, and trust.
