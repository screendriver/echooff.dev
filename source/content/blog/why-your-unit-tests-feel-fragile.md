---
title: Why your unit tests feel fragile
description: Unit tests do not feel fragile because testing is hard. They feel fragile because our design mixes business logic and side effects.
publishedAt: "2026-03-01T09:58:00+01:00"
---

You change one line of code.

Five unit tests fail.

None of them should have.

If that feels familiar, the problem is probably not your test runner or
testing framework.

It is design.

## What fragile tests feel like

Fragile tests usually share a pattern:

- You replace half of the system with test doubles.
- Refactoring internal details breaks unrelated tests.
- Tests assert that specific functions were called.
- Renaming a helper function causes failing tests.
- Tests fail even though observable behavior has not changed.

Over time, something subtle happens.

You stop trusting the tests.\
Or worse: you stop refactoring.

That is expensive.

---

## Step 1: hidden dependencies

Consider a simple registration flow.

```ts
import { database } from "./database";
import { mailer } from "./mailer";
import { logger } from "./logger";

async function registerUser(email: string) {
  const user = await database.save({ email });

  await mailer.sendWelcomeEmail(email);

  logger.info("User registered");

  return user;
}
```

To test this, many teams reach for module mocking:

```ts
jest.mock("./mailer");
vi.mock("./database"); // if you are using Vitest
```

Now:

- The function does not reveal what it depends on.
- Tests replace modules through global interception.

This is not just an architectural concern. It is also a runtime concern.

With native ECMAScript modules, imports are static and read-only.\
Module mocking only works because test runners rewrite or intercept
modules at load time.

Your tests no longer execute the same module system as your production
code.

As a result:

- Refactoring file structure breaks tests.
- Import paths become part of your test contract.

If changing an import statement breaks your unit tests, your tests are
not describing behavior.

They are describing module structure.

That is fragile by design.

---

## Step 2: explicit dependencies, but mixed responsibilities

A common improvement is to inject dependencies explicitly.

```ts
type Database = {
  save: (user: { email: string }) => Promise<{ id: string; email: string }>;
};

type Mailer = {
  sendWelcomeEmail: (email: string) => Promise<void>;
};

type Logger = {
  info: (message: string) => void;
};

async function registerUser(email: string, database: Database, mailer: Mailer, logger: Logger) {
  const user = await database.save({ email });

  await mailer.sendWelcomeEmail(email);

  logger.info("User registered");

  return user;
}
```

This removes the need for module mocking.

Dependencies are visible.

That is better.

But the function still mixes business decisions and side effects.

If the internal structure changes but the observable behavior stays the
same, the test fails.

That is fragility.

---

## Step 3: separating decisions from effects

Instead of performing side effects directly, separate the decision from
the execution.

```ts
type DomainEvent = { type: "UserRegistered"; email: string };

function decideUserRegistration(email: string): DomainEvent[] {
  return [
    {
      type: "UserRegistered",
      email
    }
  ];
}
```

This function:

- Has no side effects.
- Is deterministic.
- Encodes business intent.

The test becomes simple.

```ts
import assert from "node:assert/strict";
import test from "node:test";

test("emits a UserRegistered event", function () {
  const events = decideUserRegistration("test@example.com");

  assert.deepEqual(events, [{ type: "UserRegistered", email: "test@example.com" }]);
});
```

No fakes.\
No interception.\
No infrastructure.

Now we are testing behavior.

---

## Executing side effects at the boundary

Side effects still exist.

They just move to the boundary.

```ts
async function handleUserRegistered(
  event: { type: "UserRegistered"; email: string },
  dependencies: {
    database: Database;
    mailer: Mailer;
    logger: Logger;
  }
) {
  const user = await dependencies.database.save({
    email: event.email
  });

  await dependencies.mailer.sendWelcomeEmail(event.email);

  dependencies.logger.info("User registered");

  return user;
}
```

The business decision does not depend on how data is stored, how emails
are sent, or how logs are written.

And those infrastructure concerns do not contain business rules.

That separation allows each to change without breaking the other.

---

## Why this reduces fragility

Refactoring decision logic does not break infrastructure tests.\
Changing infrastructure does not break business tests.

Behavior changes less often than implementation.

Stable tests reflect stable behavior.

---

## Why this matters beyond tests

Fragile tests do not just slow down test suites. They slow down
systems.\
When refactoring becomes risky, teams avoid structural improvements.\
Avoided improvements turn into accumulated complexity.\
Over time, the architecture stops evolving because the safety net cannot
be trusted.

Unit tests are not only a verification tool. They are a feedback
mechanism for design quality.

---

## A note on trade-offs

Not every function needs to be pure.\
Not every module needs strict separation of concerns.

In small systems, combining decisions and side effects can be perfectly
reasonable.

As complexity increases, mixing decisions with infrastructure makes
change more expensive and tests more fragile.

This is not about architectural purity.

It is about making responsibilities explicit.

---

## Final thought

When tests feel fragile, responsibilities are blurred.

When decisions and side effects live together, tests must understand
infrastructure.

Infrastructure changes more often than behavior.

If heavy interaction testing or module mocking is required, the
architecture is likely the problem.

Design determines testability.

Clear boundaries produce stable tests.
