---
title: "Boring code is a feature"
description: "Clever code may impress in a pull request. Boring code keeps a system understandable, changeable and useful for years."
publishedAt: "2026-07-18T11:07:00+02:00"
topic: "Architecture"
---

Most production code should be boring.

That can sound like an argument against ambition, modern language features or sophisticated engineering. It is not.

Boring code is code that behaves the way a reader expects. Its dependencies are visible. Its control flow is unsurprising. Its names explain the decisions being made. Its abstractions correspond to concepts the system actually has.

It does not ask every future reader to rediscover the trick that made the original author feel clever.

Engineering culture often rewards visible sophistication. A generic abstraction can look more senior than a direct function. A dense expression can look more elegant than a few named steps. A new library can look more modern than ordinary language features.

Sometimes those choices are correct.

Too often, they optimize for how the code looks when it is written instead of how the system behaves when it has to change.

Fancy code can be satisfying for one afternoon.

Boring code keeps paying back for years.

## Boring code is predictable

Code is written once, but it is reviewed, debugged, extended and explained many times.

The author has the entire problem cached in their head. They know why an abstraction exists, which edge cases matter and which apparently strange branch protects an important behavior. The next engineer only has the code.

Every assumption that remains hidden transfers work from the author to every future reader.

That cost is easy to ignore while a pull request is small, the code compiles and the tests pass. It becomes visible later, when a requirement changes or a production issue must be understood by someone unfamiliar with the area.

Boring code reduces the amount of context that must be reconstructed before useful work can begin. It makes the obvious path the correct path.

This does not mean that every problem is simple.

Distributed state, authorization, synchronization, payments and time-dependent behavior contain real complexity. Boring code does not deny that complexity. It prevents accidental complexity from competing with it.

A pure function can be boring. A `Result` type can be boring. Runtime validation can be boring. Dependency injection can be boring. A well-named transformation pipeline can be boring.

The opposite is also true. Code can use only basic language features and still be a puzzle.

The distinction is not imperative versus functional. It is not loops versus `map` and `filter`. It is not long code versus short code.

The right representation is the one that makes the actual decision obvious without requiring hidden knowledge.

Concision is useful.

Concision is not the same as simplicity.

## Abstractions should be discovered

One of the easiest ways to make code unnecessarily fancy is to build an abstraction for a future that has not happened yet. This violates [YAGNI](https://en.wikipedia.org/wiki/You_aren%27t_gonna_need_it): you are paying today's complexity cost for requirements that may never exist.

Imagine that the first authorization rule in a feature is whether a user may publish an article. It would be possible to begin with generic predicate combinators:

```typescript
type UserRole = "administrator" | "editor" | "reader";

type User = {
  roles: UserRole[];
};

type Predicate<Value> = (value: Value) => boolean;

function anyOf<Value>(predicates: Predicate<Value>[]): Predicate<Value> {
  return (value) => {
    return predicates.some((predicate) => {
      return predicate(value);
    });
  };
}

function hasRole(role: UserRole): Predicate<User> {
  return (user) => {
    return user.roles.includes(role);
  };
}

export const canPublishArticle = anyOf([
  hasRole("administrator"),
  hasRole("editor")
]);
```

There is nothing inherently wrong with this code. In a system with many composable policies, `Predicate`, `anyOf` and `hasRole` may become useful vocabulary.

But if this is the only rule, the abstraction does not simplify the system yet. It introduces a generic mechanism before the application has demonstrated that it needs one.

The direct version describes the current domain without predicting the next one:

```typescript
type UserRole = "administrator" | "editor" | "reader";

type User = {
  roles: UserRole[];
};

export function canPublishArticle(user: User): boolean {
  const isAdministrator = user.roles.includes("administrator");
  const isEditor = user.roles.includes("editor");

  return isAdministrator || isEditor;
}
```

This version is not better because fewer concepts are always better. It is better while the additional concepts have no proven purpose.

When more authorization rules appear, their similarities and differences become visible. An abstraction can then be designed from evidence instead of imagination.

This is the idea behind [AHA programming](https://kentcdodds.com/blog/aha-programming): avoid hasty abstractions.

Some duplication can be fine in the beginning when it is deliberate. Two pieces of code may look similar today and still represent different concepts. Keeping them separate gives both implementations room to change independently.

This is not an excuse to ignore duplication forever. It is a decision to postpone coupling until the code has taught us what actually belongs together.

A little intentional duplication is often cheaper than the wrong abstraction.

A good abstraction does not merely remove repeated lines.

It removes a repeated concept.

## Boring code keeps change local

Fancy abstractions often promise future speed. The next feature will only need another configuration object. The next integration will only need another adapter. The next rule will only need another strategy.

That promise is valuable when the future matches the model.

When it does not, the abstraction turns one local change into a system-wide negotiation. A new requirement touches the generic type, the factory, the shared configuration, several tests and every consumer that depends on the old assumptions.

The code is reusable, but the change is not local.

Good architecture is not the maximum amount of reuse. It is the ability to change one decision without accidentally changing unrelated decisions.

The [happy zone in Clean Architecture](/blog/clean-architecture-protects-the-happy-zone) should be especially boring. It should contain domain decisions expressed with ordinary data and explicit dependencies. Infrastructure may be complicated. Frameworks may be complicated. The code that explains what the application means should not be.

This is how boring code creates velocity.

Engineering speed is not measured by how quickly code reaches a pull request. It is measured by how quickly a useful change reaches production safely and how little damage it creates for the next change.

A direct implementation can be refactored once the right shape becomes visible. A speculative framework is harder to remove because the application has already been bent around it.

Boring code also improves shared ownership. Reviewers can focus on behavior instead of decoding the implementation. Engineers can change unfamiliar areas without waiting for the one person who understands a private mechanism.

A codebase should accumulate better defaults, not more personal signatures.

## Final thought

Boring code is not unambitious code.

It is code that spends complexity where the product actually needs it. It makes important decisions visible, lets abstractions emerge from evidence and uses shared vocabulary instead of private tricks.

Complexity is a budget.

Spend it on the problem, not on proving that the implementation can be sophisticated.

Fancy code may make an author feel clever today.

Boring code lets everyone remain effective tomorrow.

The best compliment for production code is not that it is ingenious.

It is that someone changed it, and nothing surprised them.
