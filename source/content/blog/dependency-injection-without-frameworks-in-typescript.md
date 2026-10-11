---
title: "Dependency injection without frameworks in TypeScript"
description: "Explicit dependencies improve clarity and testability. You do not need a framework to achieve that."
publishedAt: "2026-03-01T13:13:00+01:00"
updatedAt: "2026-10-11T10:53:00+02:00"
topic: "Architecture"
---

A registration function needs to save a user and send a welcome email. It does not need to choose a database driver or configure the mail transport. Those choices can be made by the code that assembles the application.

[Dependency injection](https://martinfowler.com/articles/injection.html) means supplying the dependencies a function needs rather than having it choose or construct their implementations. In TypeScript, ordinary parameters are enough. A factory becomes useful when several callers should use the same configured operations without supplying them on every call.

## Start with the operations the function needs

The application can describe its dependencies as functions. This example shows the save-and-notify step of registration, starting with an email address that has already been validated:

```typescript
export type User = {
  email: string;
};

type RegisterUserDependencies = {
  saveUser: (user: User) => Promise<void>;
  sendWelcomeEmail: (email: string) => Promise<void>;
};

export async function registerUser(
  email: string,
  dependencies: RegisterUserDependencies
): Promise<void> {
  const { saveUser, sendWelcomeEmail } = dependencies;

  await saveUser({ email });
  await sendWelcomeEmail(email);
}
```

The registration module defines the two operations `registerUser` needs: `saveUser` and `sendWelcomeEmail`. Infrastructure modules provide their implementations, keeping the database connection and email provider's API outside the registration function.

This is already dependency injection. Passing the two operations as separate parameters would also be valid. Grouping them gives the caller named properties instead of positional arguments; it does not remove the need to supply them.

With this version each call to `registerUser` needs both the email address and the dependencies object. That is reasonable when the dependencies vary between calls. When several callers reuse the same operations we can separate their setup from the registration data.

## Bind dependencies when constructing the function

Keeping the types above, replace the standalone function with a factory in `register-user.ts`:

```typescript
export type RegisterUser = (email: string) => Promise<void>;

export function createRegisterUser(
  dependencies: RegisterUserDependencies
): RegisterUser {
  const { saveUser, sendWelcomeEmail } = dependencies;

  return async function registerUser(email: string): Promise<void> {
    await saveUser({ email });
    await sendWelcomeEmail(email);
  };
}
```

Application setup passes the `saveUser` and `sendWelcomeEmail` implementations to `createRegisterUser`. The factory returns a `registerUser` function that keeps access to them through a closure. The `RegisterUserDependencies` type describes what the factory needs.

A request handler can then receive `registerUser` and call it with an email address. The handler does not need the database connection or email configuration.

The factory is useful when separating setup from invocation makes the callers simpler. Where that separation adds little, ordinary parameter injection may be clearer. Both approaches keep database and email provider details outside `registerUser`.

## Assemble implementations at the application boundary

Infrastructure modules create the database-backed `saveUser` operation and the configured `sendWelcomeEmail` operation. Once those functions are available application setup connects them:

```typescript
const registerUser = createRegisterUser({
  saveUser,
  sendWelcomeEmail
});
```

The code that assembles these dependencies is the composition root, placed close to the application's entry point. It passes `registerUser` to the request handler or other code that needs it. The registration module does not import this setup code or look up dependencies in a global registry.

Adding a required dependency still means changing the factory and the places that construct it, including test setup. The callers that only invoke `registerUser(email)` can stay unchanged as long as that operation's contract stays the same. The factory concentrates configuration in the construction code; it does not make configuration changes disappear.

The lifetime of the returned function must also fit the dependencies it captures. If `saveUser` uses a shared database pool the returned function may be reused for the lifetime of the application. If `saveUser` uses a transaction created for one request, `registerUser` must only be called while that transaction is active. Constructing a function once does not mean making it a global singleton.

## Keep dependencies narrow

Keep that definition narrow. Registration needs a way to save a user and send a welcome email, not access to every service in the application. If `registerUser` starts needing dependencies for unrelated tasks I would first check whether it is doing too much.

Pure helpers and application types can still be imported directly. Code that accesses the database, browser or other runtime facilities belongs in dedicated infrastructure modules. The application passes the required operations to functions such as `registerUser`. That does not make `registerUser` pure: it still saves a user and sends an email. The rules it calls can remain pure functions that receive values, as described in [Clean Architecture protects the happy zone](/blog/clean-architecture-protects-the-happy-zone).

## Test through the same factory

Tests can supply local [test doubles](/blog/not-every-test-double-is-a-mock) through `createRegisterUser`. They use the same factory as application setup without replacing imported modules:

```typescript
import assert from "node:assert";
import { test } from "node:test";

import { createRegisterUser } from "./register-user.js";
import type { User } from "./register-user.js";

test("saves the user and sends a welcome email", async () => {
  const savedUsers: User[] = [];
  const welcomeEmailRecipients: string[] = [];

  const registerUser = createRegisterUser({
    async saveUser(user: User) {
      savedUsers.push(user);
    },
    async sendWelcomeEmail(email: string) {
      welcomeEmailRecipients.push(email);
    }
  });

  await registerUser("reader@example.com");

  assert.deepStrictEqual(savedUsers, [{ email: "reader@example.com" }]);
  assert.deepStrictEqual(welcomeEmailRecipients, ["reader@example.com"]);
});

test("does not send a welcome email when saving fails", async () => {
  const saveFailure = new Error("Saving failed");
  const welcomeEmailRecipients: string[] = [];

  const registerUser = createRegisterUser({
    async saveUser() {
      throw saveFailure;
    },
    async sendWelcomeEmail(email: string) {
      welcomeEmailRecipients.push(email);
    }
  });

  await assert.rejects(registerUser("reader@example.com"), saveFailure);

  assert.deepStrictEqual(welcomeEmailRecipients, []);
});
```

The first test checks both the saved user and the requested email. The second checks that a failed save prevents the email operation. Each test owns its dependencies and recorded data, so neither needs to reset shared infrastructure between runs.

The sequence still has a partial-failure case: if sending the email fails after saving succeeds, the user has already been saved. A complete registration flow needs an explicit recovery policy for that situation. Dependency injection makes such outcomes possible to test in isolation. It does not make the two operations atomic or make retrying `registerUser` safe.

This addresses one of the design problems behind [fragile unit tests](/blog/why-your-unit-tests-feel-fragile). Each test passes its own `saveUser` and `sendWelcomeEmail` implementations to `createRegisterUser`. The test can control those operations without replacing imported modules with `jest.mock()`.

The database and email adapters still need integration tests. The tests for `registerUser` do not prove that a SQL statement is correct or that an email provider accepts a request. If a replacement adapter preserves the operations contract the registration tests can keep checking the same behavior while the integration tests verify the new implementation.
