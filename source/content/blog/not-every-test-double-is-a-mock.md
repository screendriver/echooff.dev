---
title: "Not every test double is a mock"
description: "Stubs control answers. Fakes provide working alternatives. Spies record interactions. Mocks carry expectations. The differences reveal how a test is coupled. Calling them all mocks hides important differences in test design."
publishedAt: "2026-08-15T16:53:00+02:00"
topic: "Testing"
---

In engineering conversations, `mock` often means any dependency that is not the production implementation.

A function that returns a predefined value is called a mock. An in-memory repository is called a mock. A callback that records its arguments is called a mock. A test that declares an expected call is also called a mock.

Those are different roles.

Using one word for all of them may sound harmless. Everyone roughly understands that the test replaced something. But the distinction tells us what the test controls, what it observes and how tightly it is coupled to the implementation.

When a team says, _"We have to mock this"_, the important question is still unanswered.

Does the test need a predefined answer? A working substitute? A record of an interaction? Or an expectation that must be satisfied?

Precise terminology does not make a test better by itself.

It makes the design discussion possible.

## Mock is not the umbrella term

The umbrella term is **test double**.

A test double is any test-specific replacement for a dependency the code under test interacts with. Testing literature often calls such a dependency a collaborator. The name follows the same idea as a stunt double in a film: it stands in where using the real thing would be inconvenient, slow, non-deterministic or unsafe.

The vocabulary comes from Gerard Meszaros's [xUnit Test Patterns](https://martinfowler.com/books/meszaros.html) and is summarized by Martin Fowler in [Test Double](https://martinfowler.com/bliki/TestDouble.html) and [Mocks Aren't Stubs](https://martinfowler.com/articles/mocksArentStubs.html). It separates test doubles by the role they play.

A stub provides controlled answers. A fake provides a working but simplified implementation. A spy records interactions for later inspection. A mock is configured with expectations about how it must be used. A dummy is passed only because a parameter is required and is not relevant to the exercised behavior.

These names describe why the double exists in a particular test.

They do not necessarily describe how it was created.

That distinction matters because one library function can provide several capabilities at once. It may return configured values, record every call and support assertions about those calls. The test still decides which role matters.

## Consider one application service

In [Dependency injection without frameworks in TypeScript](/blog/dependency-injection-without-frameworks-in-typescript), I argued that tests should construct software through the same explicit boundaries as production instead of intercepting modules globally.

Consider a small application service that subscribes an email address to a newsletter. Its responsibility is to coordinate that use case. It does not know how subscribers are stored or how emails are delivered. Those responsibilities remain behind explicit boundaries:

```typescript
export type Subscriber = {
  email: string;
};

export type FindSubscriberByEmail = (
  email: string
) => Promise<Subscriber | undefined>;

export type SaveSubscriber = (subscriber: Subscriber) => Promise<void>;

export type SendConfirmationEmail = (email: string) => Promise<void>;

type SubscribeToNewsletterDependencies = {
  findSubscriberByEmail: FindSubscriberByEmail;
  saveSubscriber: SaveSubscriber;
  sendConfirmationEmail: SendConfirmationEmail;
};

type SubscribeToNewsletterResult =
  { status: "subscribed" } | { status: "alreadySubscribed" };

type SubscribeToNewsletter = (
  email: string
) => Promise<SubscribeToNewsletterResult>;

export function createSubscribeToNewsletter(
  dependencies: SubscribeToNewsletterDependencies
): SubscribeToNewsletter {
  const { findSubscriberByEmail, saveSubscriber, sendConfirmationEmail } =
    dependencies;

  return async function subscribeToNewsletter(
    email: string
  ): Promise<SubscribeToNewsletterResult> {
    const existingSubscriber = await findSubscriberByEmail(email);

    if (existingSubscriber !== undefined) {
      return { status: "alreadySubscribed" };
    }

    await saveSubscriber({ email });
    await sendConfirmationEmail(email);

    return { status: "subscribed" };
  };
}
```

Composition has to happen somewhere. The application service does not implement subscriber lookup, persistence or email delivery. It only defines how those independent responsibilities participate in one subscription workflow.

That is appropriate while the rule remains this small. If the subscription policy grew more complex, I would separate the decision from the effects rather than continue adding branches to the application service.

The service receives three dependencies as injected functions. A test can replace them in several ways, but those replacements do not all become mocks merely because they were supplied by a test.

## A stub controls an indirect input

A stub gives the system under test a predefined answer.

For the existing-subscriber path, the test needs `findSubscriberByEmail` to return a subscriber. That answer drives the application service into the branch the test wants to exercise:

```typescript
import assert from "node:assert";
import test from "node:test";

import {
  createSubscribeToNewsletter,
  type Subscriber
} from "./subscribe-to-newsletter.js";

test("reports that an existing email address is already subscribed", async () => {
  async function findSubscriberByEmail(
    email: string
  ): Promise<Subscriber | undefined> {
    return { email };
  }

  async function saveSubscriber(): Promise<void> {}

  async function sendConfirmationEmail(): Promise<void> {}

  const subscribeToNewsletter = createSubscribeToNewsletter({
    findSubscriberByEmail,
    saveSubscriber,
    sendConfirmationEmail
  });

  const result = await subscribeToNewsletter("reader@example.com");

  assert.deepStrictEqual(result, { status: "alreadySubscribed" });
});
```

`findSubscriberByEmail` is a stub. It controls an indirect input by returning the value required for this scenario.

The test does not assert how often that function was called. It does not ask the function to verify itself. The assertion remains on the result of the application service.

The two no-op functions are dummies in this test. They complete the dependency set, but the behavior under test does not need anything from them.

Calling all three functions mocks would hide what each one contributes to the test.

A stub can return a value, reject a Promise or throw an error. What makes it a stub is not that the answer is successful. What makes it a stub is that the test uses the answer to control the path through the system.

## A fake is a working alternative

A fake contains real behavior.

It implements the same contract as the production implementation, but takes shortcuts that make it unsuitable for production use. An in-memory repository is the common example. It can store and retrieve data correctly for the application contract without providing persistence, transactions, concurrency control or operational durability.

The newsletter example can use an in-memory subscriber store:

```typescript
type InMemorySubscriberStore = {
  findSubscriberByEmail: FindSubscriberByEmail;
  saveSubscriber: SaveSubscriber;
};

function createInMemorySubscriberStore(
  initialSubscribers: Subscriber[] = []
): InMemorySubscriberStore {
  const subscribersByEmail = new Map<string, Subscriber>();

  for (const subscriber of initialSubscribers) {
    subscribersByEmail.set(subscriber.email, subscriber);
  }

  async function findSubscriberByEmail(
    email: string
  ): Promise<Subscriber | undefined> {
    return subscribersByEmail.get(email);
  }

  async function saveSubscriber(subscriber: Subscriber): Promise<void> {
    subscribersByEmail.set(subscriber.email, subscriber);
  }

  return {
    findSubscriberByEmail,
    saveSubscriber
  };
}
```

Unlike the stub, this store does not provide one canned answer for one call. Its answer depends on previous operations. Saving a subscriber changes what a later lookup returns.

A test can use that behavior and verify the resulting state:

```typescript
test("stores a new subscriber", async () => {
  const subscriberStore = createInMemorySubscriberStore();

  async function sendConfirmationEmail(): Promise<void> {}

  const subscribeToNewsletter = createSubscribeToNewsletter({
    findSubscriberByEmail: subscriberStore.findSubscriberByEmail,
    saveSubscriber: subscriberStore.saveSubscriber,
    sendConfirmationEmail
  });

  const result = await subscribeToNewsletter("reader@example.com");
  const storedSubscriber =
    await subscriberStore.findSubscriberByEmail("reader@example.com");

  assert.deepStrictEqual(result, { status: "subscribed" });
  assert.deepStrictEqual(storedSubscriber, {
    email: "reader@example.com"
  });
});
```

This is state verification. The test observes what became true after the operation.

The deterministic wall clock from [Time is an external dependency](/blog/time-is-an-external-dependency) is another fake. It implements the clock contract and models the passage of time, but lets a test advance that time deliberately instead of waiting for the runtime.

A fake is more capable than a stub, but that does not make it automatically better. It is another implementation of a contract, and another implementation can drift.

An in-memory repository cannot prove that a database adapter uses the correct transaction, constraint or query. A deterministic clock cannot prove that a runtime timer integrates correctly with the browser or Node.js event loop. Fakes let tests verify application behavior against a controlled implementation. Adapter integration tests still have to verify the production boundary.

## A spy records an indirect output

Sometimes the result we care about is an interaction rather than a returned value.

Sending a confirmation email does not change the return value of `subscribeToNewsletter`. The observable behavior is the call to `sendConfirmationEmail`.

A spy records that interaction so the test can inspect it afterwards:

```typescript
type ConfirmationEmailSpy = {
  emailAddresses: string[];
  sendConfirmationEmail: SendConfirmationEmail;
};

function createConfirmationEmailSpy(): ConfirmationEmailSpy {
  const emailAddresses: string[] = [];

  async function sendConfirmationEmail(email: string): Promise<void> {
    emailAddresses.push(email);
  }

  return {
    emailAddresses,
    sendConfirmationEmail
  };
}
```

The test performs the operation first and then verifies what the spy observed:

```typescript
test("sends a confirmation email to a new subscriber", async () => {
  const subscriberStore = createInMemorySubscriberStore();
  const confirmationEmailSpy = createConfirmationEmailSpy();
  const subscribeToNewsletter = createSubscribeToNewsletter({
    findSubscriberByEmail: subscriberStore.findSubscriberByEmail,
    saveSubscriber: subscriberStore.saveSubscriber,
    sendConfirmationEmail: confirmationEmailSpy.sendConfirmationEmail
  });

  await subscribeToNewsletter("reader@example.com");

  assert.deepStrictEqual(confirmationEmailSpy.emailAddresses, [
    "reader@example.com"
  ]);
});
```

The spy did not decide beforehand what must happen. It recorded what did happen. The test owns the assertion.

This is the role that is most often called a mock in JavaScript codebases. A `jest.fn()`, `vi.fn()` or call-recording Sinon function is commonly described as a mock function even when the test only inspects its calls afterwards.

That terminology is widespread. In the Meszaros and Fowler vocabulary used here, the more precise role is spy.

The missing word in many discussions about mocks is not stub or fake.

It is spy.

## A mock carries an expectation

A mock makes an expected interaction part of its setup.

Instead of recording calls neutrally and letting the test decide what to inspect later, the mock is configured with rules about how it must be used. Verification checks whether those rules were satisfied.

A small handwritten mock for the confirmation email could look like this:

```typescript
type ConfirmationEmailMock = {
  sendConfirmationEmail: SendConfirmationEmail;
  verify: () => void;
};

function createConfirmationEmailMock(
  expectedEmailAddress: string
): ConfirmationEmailMock {
  let callCount = 0;

  async function sendConfirmationEmail(emailAddress: string): Promise<void> {
    assert.strictEqual(emailAddress, expectedEmailAddress);
    callCount += 1;
  }

  function verify(): void {
    assert.strictEqual(callCount, 1);
  }

  return {
    sendConfirmationEmail,
    verify
  };
}
```

The expectation exists before the application service runs:

```typescript
test("sends one confirmation email to the new subscriber", async () => {
  const subscriberStore = createInMemorySubscriberStore();
  const confirmationEmailMock =
    createConfirmationEmailMock("reader@example.com");
  const subscribeToNewsletter = createSubscribeToNewsletter({
    findSubscriberByEmail: subscriberStore.findSubscriberByEmail,
    saveSubscriber: subscriberStore.saveSubscriber,
    sendConfirmationEmail: confirmationEmailMock.sendConfirmationEmail
  });

  await subscribeToNewsletter("reader@example.com");

  confirmationEmailMock.verify();
});
```

The mock specifies that one call with one particular argument is required. A missing call, an additional call or a different argument violates the expectation.

This is behavior verification. The test succeeds because the system made the call required by the predefined expectation.

A mock may also provide stubbed return values because the dependency may still need to return an answer. That does not remove the distinction. The defining role is the expectation about the interaction.

## Tool names do not define the role

Testing libraries make this vocabulary harder because their APIs do not all follow the same taxonomy. The taxonomy is a useful model, not a language specification, and different testing communities draw some boundaries differently.

[Sinon's documentation](https://sinonjs.org/concepts/mocks/) distinguishes spies, stubs and mocks clearly. It describes stubs as functions with pre-programmed behavior and mocks as functions with pre-programmed expectations. It also warns that mocks enforce implementation details and should be used deliberately.

Its current [`sinon.fake()` documentation](https://sinonjs.org/concepts/fakes/) uses `fake` for an immutable function that can replace behavior and record calls. That is useful, but it is not the same meaning as the classic fake object represented by the in-memory store above.

This is not a problem unique to Sinon, and it is not a reason to avoid the library.

It is a reminder that an API name and a conceptual role are different things.

A `sinon.fake.returns(value)` can play the role of a stub when the test only needs the returned value. The same function can play the role of a spy when the test inspects its recorded calls. If a test wraps those capabilities in predefined expectations, it is using mock-style verification.

The factory that created the function does not decide which role it plays.

The test does.

## Interaction verification has a cost

Assertions made through spies and expectations carried by mocks make interactions between components part of the test contract.

Sometimes that is exactly right. A payment must be submitted once with the accepted amount. An audit event must be written. A message must be published only after data has been stored. In those cases, the outward interaction is observable application behavior.

But many interactions are only implementation details.

A test that expects one internal helper to call another helper twice in a particular order does not protect user-visible behavior. It protects the current decomposition of the code. A refactoring can preserve every meaningful outcome and still break the test.

That is one reason [unit tests feel fragile](/blog/why-your-unit-tests-feel-fragile). The more internal conversations a test verifies, the more of the implementation becomes frozen into expectations.

Interaction verification is not bad.

It is expensive.

They should be used where the interaction itself is important enough to justify that coupling.

A stub controls the answer returned by a dependency without requiring the test to verify how that answer was requested. A fake often lets the test verify resulting state through the same public contract as the production implementation. A spy or mock moves the focus to the interaction between components.

Those are different tests with different maintenance costs.

Calling every double a mock hides that choice.

## Prefer the smallest role that explains the test

Before creating any test double, first ask whether the real dependency is already deterministic, fast and easy to construct.

Pure functions, value objects and ordinary data transformations usually do not need substitutes. Using the real code gives the test more confidence and less setup.

When a dependency must be replaced, the replacement should do only what the scenario needs.

When the test needs a controlled answer, a stub is enough. When several operations need coherent stateful behavior, a fake may express the contract more naturally. When the test needs to inspect an interaction afterwards, use a spy. When a required interaction is itself the specification, use a mock and accept the additional coupling deliberately.

This is not about enforcing vocabulary in every casual sentence.

It is about being able to ask better questions in design reviews, pull requests and testing discussions.

"Can we mock the repository?" is vague.

"Can we inject a stub that returns the existing subscriber?" describes the scenario.

"Can we use an in-memory fake because this test needs several reads and writes?" describes the required behavior.

"Do we really want a mock here, or are we turning an internal call into a contract?" exposes the trade-off.

Shared language makes shared reasoning possible.

## Final thought

A test double is the umbrella term.

A stub answers.

A fake behaves.

A spy remembers.

A mock expects.

The distinctions are not academic. They reveal what a test controls, what it verifies and what kind of change will break it.

Do not call every replacement a mock and assume the design has been explained.

Say what role the double plays.

Then decide whether that is the role the test actually needs.
