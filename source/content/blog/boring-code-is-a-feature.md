---
title: "Boring code is a feature"
description: "Predictable code makes decisions visible and keeps changes local. Useful abstractions should reduce the work of understanding and maintaining a system."
publishedAt: "2026-07-18T11:07:00+02:00"
updatedAt: "2026-09-26T12:44:00+02:00"
topic: "Architecture"
---

A small change to an authorization rule can require more work than the diff suggests. Before editing the condition, an engineer may need to understand a generic policy engine, find the configuration that selects the rule and check which other features share its assumptions.

I want most production code to be boring. By that I mean that its names and control flow make the decisions clear, its dependencies are visible and its abstractions have an identifiable purpose. The reader should be able to spend their attention on whether the behavior is correct rather than on reconstructing how the implementation works.

## Boring code is predictable

The author of a change has context that the next engineer may not share. They know why a branch exists and which edge cases shaped the implementation. Months later, someone investigating a failure may have to recover that reasoning from the code, tests and history. Assumptions that remain hidden become work for each person who needs to understand the behavior.

Making that context visible does not mean adding a comment beside every branch. A name can express the business decision and a focused test can preserve behavior that would otherwise look unnecessary. Some constraints still need an explanation, but a comment should not compensate for unclear structure, as I discuss in [Comments are not a substitute for design](/blog/comments-are-not-a-substitute-for-design).

A payment workflow or a synchronization algorithm may still be difficult to understand. The goal is to avoid making the reader also account for hidden state or unrelated infrastructure. Boring code leaves room for the complexity the problem actually contains.

That is why I would not judge simplicity by the language features used. A `Result` type can make failure handling easier to follow, just as runtime validation makes assumptions about incoming data explicit. Pure functions and ordinary dependency injection can reduce the context needed to understand a rule. Code written entirely with basic language features can still hide state and obscure its decisions.

The same applies to concision. A transformation expressed with `map` and `filter` may be clearer than a loop. Naming an intermediate value may make a dense expression easier to read. The useful question is how directly the code expresses the decision, not how many lines it occupies.

## Abstractions should be discovered

An abstraction built for requirements that do not exist yet still has to be understood and maintained. That is the concern behind [YAGNI](https://martinfowler.com/bliki/Yagni.html): we pay that cost whether or not the expected features arrive.

Suppose administrators and editors are allowed to publish articles. We could express that rule using generic predicate combinators:

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

For this one rule, though, they introduce a general way to construct policies before the application needs one. I would start with the direct version:

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

Both versions are straightforward to test and both implement the same rule. I prefer the direct version here because the additional concepts in the first version have no demonstrated use yet. If the application already had a useful policy vocabulary, expressing the rule in that vocabulary could be the simpler choice.

When more authorization rules appear, their similarities and differences become visible. An abstraction can then be designed around those requirements. [AHA programming](https://kentcdodds.com/blog/aha-programming), short for "avoid hasty abstractions", describes this approach without prescribing a fixed number of repetitions before extraction.

This does not require waiting for duplication before every abstraction. [Separating a business rule from a network dependency](/blog/clean-architecture-protects-the-happy-zone) can have an immediate purpose even with only one implementation. The question is whether the abstraction solves a problem the application has now.

## Boring code keeps change local

Suppose publishing and deleting articles both initially allow administrators and editors. We could put that check in one `canManageArticles` function and use it for both operations. Later, the requirements change: editors may still publish, but only administrators may delete. Changing the shared condition would now change two permissions when only one should change.

Separate `canPublishArticle` and `canDeleteArticle` functions would let us update the deletion rule without changing publishing behavior. They may start with identical implementations, but they answer different questions. Code that deletes articles should still reuse `canDeleteArticle` so that the deletion rule is applied consistently. The mistake would be treating two different permissions as one rule merely because their current conditions match.

Both functions could still use `hasRole` from the earlier example. Reusing a helper does not require combining the business decisions that use it.

This is what keeping a change local means here: changing the deletion policy does not also require changing how publishing permissions are represented. Reviewers can focus on the deletion behavior and the tests for publishing keep their existing expectations. I would accept a little duplication to preserve that separation.
