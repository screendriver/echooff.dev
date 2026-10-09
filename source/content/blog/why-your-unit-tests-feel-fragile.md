---
title: "Why your unit tests feel fragile"
description: "Fragile tests often depend on implementation details. Explicit dependencies and separating decisions from effects help them protect the behavior that matters."
publishedAt: "2026-03-01T09:58:00+01:00"
updatedAt: "2026-10-09T17:09:00+02:00"
topic: "Testing"
---

You change how a piece of code is organized without changing what it does. Several unit tests fail because they depend on an internal helper, an intercepted import or a particular sequence of internal calls.

A useful unit test should fail when the behavior it protects changes. A fragile test also fails when the implementation is reorganized behind the same contract. The problem is not that the test knows anything about the code. Every test depends on some interface. The problem is that the test knows more than a real caller needs to know.

Teams often respond by adding more mocks. That can make the symptoms easier to manage, but it does not fix the design that made the tests depend on those details.

## Hidden dependencies make isolation difficult

Consider a registration use case in `register-user.ts`. The request already contains a validated email address and a user ID. The workflow checks whether the terms were accepted, then saves the user and sends a welcome email:

```typescript
import { userRepository } from "./user-repository.js";
import { welcomeEmailSender } from "./welcome-email-sender.js";

type RegisterUserRequest = {
  email: string;
  hasAcceptedTerms: boolean;
  userId: string;
};

type User = {
  email: string;
  id: string;
};

type RegisterUserResult =
  | { status: "registered"; user: User }
  | { status: "rejected"; reason: "termsNotAccepted" };

export async function registerUser(
  request: RegisterUserRequest
): Promise<RegisterUserResult> {
  const { email, hasAcceptedTerms, userId } = request;

  if (!hasAcceptedTerms) {
    return { status: "rejected", reason: "termsNotAccepted" };
  }

  const user = {
    email,
    id: userId
  };

  await userRepository.save(user);
  await welcomeEmailSender.send(email);

  return { status: "registered", user };
}
```

The signature suggests that this function only depends on the request. In reality, it also depends on a repository and an email sender imported from the surrounding runtime.

To isolate this version from infrastructure, a test may ask the test runner to replace those imported modules. Module mocking makes that possible, but it also makes import paths and module loading part of the test setup. Moving a dependency or changing how it is imported can break the test before any product behavior has changed.

The function has hidden dependencies, so the test has to control how those dependencies are loaded. Making them explicit gives the application and its tests a simpler way to supply them.

## Dependency injection helps, but it is not the whole answer

Keep the request, user and result types above. Remove the concrete repository and email-sender imports, then replace the original function with a factory that receives those dependencies:

```typescript
type UserRepository = {
  save(user: User): Promise<void>;
};

type WelcomeEmailSender = {
  send(email: string): Promise<void>;
};

type RegisterUserDependencies = {
  userRepository: UserRepository;
  welcomeEmailSender: WelcomeEmailSender;
};

export function createRegisterUser(
  dependencies: RegisterUserDependencies
): (request: RegisterUserRequest) => Promise<RegisterUserResult> {
  const { userRepository, welcomeEmailSender } = dependencies;

  return async function registerUser(
    request: RegisterUserRequest
  ): Promise<RegisterUserResult> {
    const { email, hasAcceptedTerms, userId } = request;

    if (!hasAcceptedTerms) {
      return { status: "rejected", reason: "termsNotAccepted" };
    }

    const user = {
      email,
      id: userId
    };

    await userRepository.save(user);
    await welcomeEmailSender.send(email);

    return { status: "registered", user };
  };
}
```

The dependencies are now visible. Tests can supply small controlled implementations without replacing imported modules. Production and tests construct the function through the same interface, as described in [Dependency injection without frameworks in TypeScript](/blog/dependency-injection-without-frameworks-in-typescript).

The function still combines a product decision with the operations that follow it, though. To construct the workflow in a test about accepted terms, we still need to supply a repository and an email sender. Neither helps answer whether the request should be accepted.

A workflow test may correctly assert that rejected requests call neither dependency and accepted requests call both. But making every test of a business rule understand those operations introduces setup that the rule itself does not need. We can separate the decision while preserving the registration behavior.

## Separate decisions from effects

The product decision can be expressed without knowing how a user is stored or how an email is delivered. Keeping the same request and user types, extract it into a function alongside the workflow in `register-user.ts`:

```typescript
type UserRegistrationDecision =
  | { status: "accepted"; user: User }
  | { status: "rejected"; reason: "termsNotAccepted" };

export function decideUserRegistration(
  request: RegisterUserRequest
): UserRegistrationDecision {
  const { email, hasAcceptedTerms, userId } = request;

  if (!hasAcceptedTerms) {
    return { status: "rejected", reason: "termsNotAccepted" };
  }

  return {
    status: "accepted",
    user: {
      email,
      id: userId
    }
  };
}
```

This function has no hidden inputs. It does not write to a database or send a message. The user ID remains an input supplied by the caller and the result describes the decision in application language. An accepted request can proceed. It does not mean that a user has already been registered.

The tests can describe those results directly:

```typescript
import assert from "node:assert";
import { test } from "node:test";

import { decideUserRegistration } from "./register-user.js";

test("rejects registration when the terms were not accepted", () => {
  const actualDecision = decideUserRegistration({
    email: "person@example.com",
    hasAcceptedTerms: false,
    userId: "user-42"
  });

  const expectedDecision = {
    status: "rejected",
    reason: "termsNotAccepted"
  };

  assert.deepStrictEqual(actualDecision, expectedDecision);
});

test("accepts registration with the supplied user data", () => {
  const actualDecision = decideUserRegistration({
    email: "person@example.com",
    hasAcceptedTerms: true,
    userId: "user-42"
  });

  const expectedDecision = {
    status: "accepted",
    user: {
      email: "person@example.com",
      id: "user-42"
    }
  };

  assert.deepStrictEqual(actualDecision, expectedDecision);
});
```

These assertions protect the rejection reason and the user data returned for an accepted request. No repository has to be configured and no assertion depends on how many internal functions happened to run. Changing the persistence or email implementation does not require changing these tests.

## Keep effects in the workflow

Separating the decision does not make the side effects disappear. A real registration still has to persist the user and request the welcome email. The factory now calls `decideUserRegistration` and deals with its result:

```typescript
export function createRegisterUser(
  dependencies: RegisterUserDependencies
): (request: RegisterUserRequest) => Promise<RegisterUserResult> {
  const { userRepository, welcomeEmailSender } = dependencies;

  return async function registerUser(
    request: RegisterUserRequest
  ): Promise<RegisterUserResult> {
    const decision = decideUserRegistration(request);

    if (decision.status === "rejected") {
      return decision;
    }

    await userRepository.save(decision.user);
    await welcomeEmailSender.send(decision.user.email);

    return {
      status: "registered",
      user: decision.user
    };
  };
}
```

The behavior is unchanged. Rejected requests still return without performing either effect. Accepted requests are saved and followed by the email request before the workflow reports `registered`. The difference is that tests of the terms rule no longer need to construct this workflow.

For a single condition, I might keep the rule inside a small injected workflow. Extraction earns its place when the decision has enough cases or changes independently of the surrounding operations. It should make the code and its tests easier to work with.

## Test meaningful interactions

The workflow is intentionally effectful. Its responsibility is to coordinate the operations, so a focused test may verify that an accepted registration is persisted and a welcome email is requested.

Interaction testing is useful when the interaction is part of the behavior. A failed save may have to prevent a notification. Saving may have to finish before the email is requested. Those requirements deserve tests. Which private helper performs the call, or which intermediate object it creates, usually does not.

[Test doubles](/blog/not-every-test-double-is-a-mock) are useful for exercising this behavior. A small fake repository can store users in memory and a controlled email sender can record the recipient or simulate a failure. The problem begins when tests duplicate the implementation line by line or enforce call order that has no observable meaning.

Saving the user and sending the email remain separate operations. If the email fails after saving succeeds, the user is already stored and the workflow needs a recovery policy.

## Let the tests reveal design problems

The decision tests and workflow tests now answer different questions. Neither proves that a database query stores the expected data or an email provider accepts a request. The adapters still need integration tests and broader tests can verify that the application connects those parts correctly.

This is the separation described in [Clean Architecture protects the happy zone](/blog/clean-architecture-protects-the-happy-zone). Product decisions can work with ordinary data while infrastructure handles the outside world. A unit does not have to be one function or one file; the useful separation is the one that lets a test exercise the behavior it needs to protect.

Not every failure after a refactoring is evidence of a fragile test. A refactoring can accidentally change behavior and a good test should catch that. The signal becomes suspicious when tests fail because they depended on details the caller never needed to know.

Repeated false alarms consume time and make failures harder to trust. This is part of [developer experience](/blog/developer-experience-is-a-performance-feature): a structural change should not require rewriting expectations that never represented product behavior. High coverage cannot compensate for assertions that mostly preserve the current implementation.

When testing a small rule requires setting up a repository, an email sender and other dependencies, I would first ask why the rule needs them. Making the dependencies explicit shows what the workflow needs. Separating the decision, when that separation is useful, lets its tests concentrate on the rule.
