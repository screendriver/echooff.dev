---
title: "Avoid throwing for expected failures in TypeScript"
description: "Use Result in TypeScript for expected failures, Maybe for absence, and reserve exceptions for truly exceptional situations."
publishedAt: "2026-03-07T08:21:00+01:00"
---

In a [previous article](/blog/avoid-null-typescript) I wrote about avoiding `null` whenever possible and using types like `Maybe` instead.

Avoiding `null` removes ambiguity about **whether a value exists**.

But there is another kind of ambiguity in many codebases: **whether an operation succeeded**.

In TypeScript, the default way to signal errors is by throwing exceptions.

```ts
type User = {
  id: string;
};

function parseUser(json: string): User {
  const data: unknown = JSON.parse(json);

  if (typeof data !== "object" || data === null || !("id" in data)) {
    throw new Error("Missing id");
  }

  if (typeof data.id !== "string") {
    throw new Error("Invalid id");
  }

  return { id: data.id };
}
```

At first glance, this looks reasonable. But this approach has several problems.

First, **the function signature does not communicate that the function can fail**.

Second, **exceptions travel invisibly through the call stack** until something catches them.

Third, **expected failures are treated like exceptional situations**.

But in many applications, failures are completely normal.

Examples include:

- a user does not exist
- input is invalid
- a network request fails

These are not exceptional events.

They are **expected outcomes**.

## Returning failures explicitly

Instead of throwing errors, we can return them.

A common pattern for this is the `Result` type.

A `Result` represents one of two states:

- `Ok(value)`
- `Err(error)`

Libraries like [True Myth](https://true-myth.js.org) implement this pattern for TypeScript.

```ts
import { Result } from "true-myth";

type User = {
  id: string;
};

function parseUser(json: string): Result<User, Error> {
  try {
    const data: unknown = JSON.parse(json);

    if (typeof data !== "object" || data === null || !("id" in data)) {
      return Result.err(new Error("Missing id"));
    }

    if (typeof data.id !== "string") {
      return Result.err(new Error("Invalid id"));
    }

    return Result.ok({ id: data.id });
  } catch (error: unknown) {
    return Result.err(
      error instanceof Error ? error : new Error("Unknown error")
    );
  }
}
```

Now the function communicates something important:

> This function may succeed **or** fail.

The caller must handle both outcomes explicitly.

## Handling results

Consumers now deal with both cases explicitly.

```ts
const result = parseUser(input);

if (result.isErr === true) {
  console.error(result.error);

  return;
}

const user = result.value;
```

There is no hidden control flow.

Everything that can happen is visible at the call site.

## Exceptions introduce implicit control flow

One fundamental problem with exceptions is that they introduce **implicit control flow**.

Consider this function:

```ts
function loadUser(id: string): User {
  const response = fetchUser(id);

  const user = parseUser(response);

  return validateUser(user);
}
```

Looking only at the code, the control flow appears simple:

1. Fetch the user
2. Parse the response
3. Validate the user
4. Return the result

But this is misleading.

If `fetchUser`, `parseUser`, or `validateUser` throws an exception, the function **does not return normally**. Instead, execution jumps to the nearest `catch` block somewhere higher in the call stack.

That means the actual control flow is hidden.

To understand what really happens, a reader must know:

- which functions may throw
- where those exceptions are caught
- which exceptions are handled and which are not

None of this information is visible in the function signature.

Returning a `Result` makes the control flow explicit.

```ts
type User = {
  id: string;
};

function loadUser(id: string): Result<User, Error> {
  return fetchUser(id).andThen(parseUser).andThen(validateUser);
}
```

Now the behavior is clear:

- each step may fail
- failures propagate explicitly
- the caller must handle the result

There is no hidden jump in control flow.

## Composing operations

Another advantage of `Result` is that operations are easy to compose.

Instead of nesting `try/catch` blocks, we can chain operations.

```ts
const result = parseUser(json).andThen(validateUser).andThen(saveUser);
```

If any step returns an error, the chain stops automatically and the error propagates.

This makes the control flow easier to reason about.

## Keep exceptions at the boundaries

This does not mean exceptions never exist.

At the boundaries of an application, they are often unavoidable.

Examples include:

- reading environment variables
- parsing external input
- calling a framework or SDK
- interacting with the file system or network

In these places, exceptions may happen because the application is dealing with the outside world.

But the important part is what happens next.

At the edge of the application, we can catch those exceptions and translate them into explicit return values like `Result`.

That keeps the core application logic predictable and free from hidden control flow.

For example:

```ts
import { Result } from "true-myth";

function readApiKey(): Result<string, Error> {
  try {
    const apiKey = process.env.API_KEY;

    if (apiKey === undefined) {
      return Result.err(new Error("API_KEY must be configured"));
    }

    return Result.ok(apiKey);
  } catch (error: unknown) {
    return Result.err(
      error instanceof Error ? error : new Error("Unknown error")
    );
  }
}
```

Exceptions may still happen at the edges.

But they should not leak through the application unchecked.

Programming errors, invariant violations, and impossible states are different. Those are still valid reasons to fail fast.

## A practical guideline

In practice, I follow a simple rule:

- Use [`Maybe`](/blog/avoid-null-typescript) for absence
- Use `Result` for failures
- Keep exceptions at the boundaries
- Fail fast for programming errors and impossible states

Making success and failure explicit removes hidden control flow.

Code becomes easier to read, easier to reason about, and easier to test.
