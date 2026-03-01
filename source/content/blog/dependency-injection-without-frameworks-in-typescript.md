---
title: "Dependency injection without frameworks in TypeScript"
description: "Explicit dependencies improve clarity and testability. You do not need a framework to achieve that."
publishedAt: "2026-03-01T13:13:00+01:00"
---

In the previous post, we explored [why unit tests feel fragile](/blog/why-your-unit-tests-feel-fragile).

The core issue was not the test runner.

It was design.

Hidden dependencies blur boundaries.  
Blurred boundaries make change risky.  
Risky change makes tests fragile.

Making dependencies explicit improves clarity.

But that leads to a deeper question:

How should we structure explicit dependencies in a growing system?

## Dependency injection is about construction

A common first step is passing dependencies as parameters.

```ts
type Database = {
  save: (user: { email: string }) => Promise<void>;
};

type Mailer = {
  sendWelcomeEmail: (email: string) => Promise<void>;
};

type Logger = {
  info: (message: string) => void;
};

async function registerUser(
  email: string,
  database: Database,
  mailer: Mailer,
  logger: Logger
): Promise<void> {
  await database.save({ email });

  await mailer.sendWelcomeEmail(email);

  logger.info("User registered");
}
```

This is already better than importing modules directly.

The function reveals what it depends on.  
Tests can supply fakes without rewriting modules.

But this pattern does not scale.

- Parameter lists grow.
- Parameter order becomes fragile.
- Every call site must know every dependency.
- Adding a new dependency touches every invocation.

The function is explicit, but the construction is scattered.

Dependency injection is not about passing objects around.  
It is about separating construction from behavior.

It is also not primarily about testability.  
It is about defining where construction ends and behavior begins.

When those boundaries are explicit, the system becomes easier to evolve.  
Improved testability is a consequence of that separation.

## Stabilizing the boundary

Instead of passing each dependency individually, group them.

```ts
type Dependencies = {
  database: Database;
  mailer: Mailer;
  logger: Logger;
};

async function registerUser(
  email: string,
  dependencies: Dependencies
): Promise<void> {
  const { database, mailer, logger } = dependencies;

  await database.save({ email });

  await mailer.sendWelcomeEmail(email);

  logger.info("User registered");
}
```

Now the function signature is stable.

Dependencies are named instead of positional.  
Adding a dependency does not break parameter order.  
The infrastructure boundary becomes visible.

But we can go one step further.

## Composition at the edge

Instead of passing dependencies on every call, construct the function once.

```ts
function createRegisterUser(
  dependencies: Dependencies
): (email: string) => Promise<void> {
  const { database, mailer, logger } = dependencies;

  return async function registerUser(email: string): Promise<void> {
    await database.save({ email });

    await mailer.sendWelcomeEmail(email);

    logger.info("User registered");
  };
}
```

Then assemble the system at the boundary of the application.

```ts
const registerUser = createRegisterUser({
  database,
  mailer,
  logger
});
```

This is the composition root.

Infrastructure is assembled once.  
Business behavior does not construct its own dependencies.  
Logic does not depend on wiring.

There is no container.  
No decorators.  
No runtime magic.

Just explicit composition.

## Tests mirror production

Because construction is explicit, tests follow the same structure.

```ts
import assert from "node:assert/strict";
import test from "node:test";

test("registers a user and sends a welcome email", async function () {
  let emailSentTo: string | undefined;

  const registerUser = createRegisterUser({
    database: {
      async save(): Promise<void> {}
    },
    mailer: {
      async sendWelcomeEmail(email: string): Promise<void> {
        emailSentTo = email;
      }
    },
    logger: {
      info(): void {}
    }
  });

  await registerUser("test@example.com");

  assert.equal(emailSentTo, "test@example.com");
});
```

No module mocking.  
No altered module semantics.  
No global interception.

Tests construct the system the same way production does.

That symmetry reduces fragility.

## Why this scales

As systems grow, two forces increase:

- The number of dependencies.
- The frequency of change.

When construction is explicit and centralized:

- Adding a dependency changes the factory, not every call site.
- Infrastructure configuration remains at the boundary.
- Business logic remains independent.

Implementation evolves continuously.

Behavior should change deliberately.

Stable boundaries allow both.

## A note on trade-offs

You do not need this pattern everywhere.

For small scripts or isolated utilities, direct imports are often sufficient.

The value appears when responsibilities multiply and the system evolves.

Dependency injection is not a framework feature.

It is a boundary decision.

## Final thought

In the previous post, we saw that fragile tests often signal blurred design.

Explicit composition clarifies that design.

When construction happens at the boundary and behavior remains independent, change becomes less risky and tests become more stable.

Good tests reflect good boundaries.  
Good boundaries make change safe.
