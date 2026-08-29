---
title: "Comments are not a substitute for design"
description: "Commented-out code, TODOs and explanatory prose often hide weak design or unowned work. Prefer clear structure, tests, history and tracked decisions."
publishedAt: "2026-08-29T15:13:00+02:00"
topic: "Architecture"
---

Comments can make unfinished or difficult code look responsible.

A `TODO` shows that someone noticed missing work. A `FIXME` admits that something is wrong. Commented-out code appears to preserve an implementation that may become useful again. A paragraph above a complicated function seems to help the next reader understand it.

But noticing a problem is not the same as solving it.

Executable code participates in automated feedback in ways prose usually does not. Compilers, tests and refactoring tools can detect when its structure or behavior changes. A comment can remain valid syntax while no longer describing the code beside it.

That makes comments one of the weakest places to preserve important information.

My default is therefore strict: I do not commit commented-out code, `TODO`, `FIXME` or `HACK` comments, and I avoid comments that merely explain what the implementation is doing.

That is not because every comment is bad. Some constraints cannot be expressed completely through names, types, composition or tests. Those comments can be valuable.

But a comment should have to earn its place.

This is about inline comments in production code. Public API documentation, license notices, generated markers and directives interpreted by tools have different purposes and constraints.

## Commented-out code is dead code

Commented-out code is often kept because deleting it feels irreversible.

```typescript
export function calculateShippingCost(order: Order): number {
  // if (order.customer.kind === "premium") {
  //   return 0;
  // }

  return calculateStandardShippingCost(order);
}
```

The code does not explain why the old branch is still there.

Was free shipping removed intentionally? Is it temporarily disabled? Is the requirement expected to return? Did the implementation cause a bug? Is someone afraid to delete it because they do not understand it?

Every future reader has to ask those questions, even when the commented branch has been irrelevant for years.

The branch also receives none of the protection of real code. The surrounding types can change. Functions can be renamed. The business model can evolve. The commented implementation slowly becomes an alternative version of a system that no longer exists.

Version control is the right place for deleted implementation. A useful Git history preserves when code was removed and, with a [good commit message](/blog/write-good-git-commit-messages), why it was removed. The source file should describe the system that exists now.

Git history is not a replacement for documentation. It is a better home for implementation that is no longer part of the product.

If behavior must be switchable, model that decision explicitly. If it may be needed someday, delete it. [YAGNI](https://en.wikipedia.org/wiki/You_aren%27t_gonna_need_it) applies to preserved alternatives too.

Commented-out code is not a safety net.

It is uncertainty transferred to every reader.

## A TODO comment is not a plan

A `TODO` comment by itself creates the appearance of future work without creating any of the conditions that make work happen.

```typescript
// TODO: handle refresh failures
```

There is no owner. No priority. No acceptance criterion. No explanation of which failures matter. No indication of what happens today. No way to distinguish an idea from a known defect.

`FIXME` is more urgent in tone, but not more actionable. `HACK` is more honest about the implementation, but it still does not provide an exit plan.

Tooling can index, search or lint `TODO` comments, but searchability is not ownership. An issue can be discussed, assigned, prioritized, closed and connected to product work. A marker in source still has no owner, acceptance criterion or place in planning unless another system provides one.

If the missing behavior is required for the current change, implement it before merging. If released behavior is already broken, treat it as a bug rather than hiding it in source code. As I argued in [Bugs are not backlog items](/blog/bugs-are-not-backlog-items), known brokenness should not be given a comfortable place to wait.

If the work is a possible future improvement, put it where future work is evaluated. If it is a known limitation, make that limitation explicit in the product, contract or documentation where the affected people can actually see it.

Even a ticket reference does not automatically justify a `TODO`:

```typescript
// TODO(PROJECT-1234): remove this workaround
```

That still tells the reader almost nothing about why the workaround exists or what must become true before it can be removed. The issue may eventually provide that context, but the comment itself is only a duplicated reminder that can drift away from it.

There are rare cases where a temporary external constraint must remain visible at an exact line. In that case, describe the constraint that is true now and its removal condition. Do not leave an instruction for an unspecified future engineer.

A comment can explain why current code must look unusual.

It should not become the team's smallest and least visible backlog.

## Most explanatory comments are design feedback

Many comments do not describe external constraints. They narrate code that should have explained itself.

```typescript
// Check whether the deleted account is still inside the restoration window
if (
  account.deletedAtTimestampInMilliseconds !== undefined &&
  currentTimestampInMilliseconds < account.purgeAtTimestampInMilliseconds
) {
  restoreAccount(account);
}
```

The comment contains useful domain language: restoration window.

That language belongs in the code.

```typescript
type Account = {
  deletedAtTimestampInMilliseconds?: number;
  purgeAtTimestampInMilliseconds: number;
};

type IsAccountWithinRestorationWindowOptions = {
  account: Account;
  currentTimestampInMilliseconds: number;
};

function isAccountWithinRestorationWindow(
  options: IsAccountWithinRestorationWindowOptions
): boolean {
  const { account, currentTimestampInMilliseconds } = options;

  return (
    account.deletedAtTimestampInMilliseconds !== undefined &&
    currentTimestampInMilliseconds < account.purgeAtTimestampInMilliseconds
  );
}

if (
  isAccountWithinRestorationWindow({ account, currentTimestampInMilliseconds })
) {
  restoreAccount(account);
}
```

The extracted function is not better merely because it removes a comment. It is better because it gives the decision a name, creates a small boundary around the rule and makes the rule independently testable.

The comment was feedback that a concept was missing from the design.

The same signal appears when a long function is divided by comments such as _"validate input"_, _"save data"_ and _"send notification"_. Those comments may be pointing at responsibilities that should be composed from separate functions. A comment above a boolean expression may reveal missing domain vocabulary. A paragraph explaining hidden state may reveal a dependency that should be explicit.

This is not a mechanical rule that every comment requires another function. Extraction can also make code noisier, and some local expressions are already obvious enough.

The useful habit is to treat the desire to comment as a design question before treating it as a writing task.

Can the name say it? Can the type express it? Can a decision be separated from an effect? Can a smaller function make the rule visible? Can the dependency become explicit?

[Boring code](/blog/boring-code-is-a-feature) does not require a paragraph beside every branch. Its structure and vocabulary let a reader follow the decisions directly.

Comments should not compensate for code that has not yet found that shape.

## Tests preserve behavior better than comments

Sometimes the strange code is not ours to improve.

A third-party API may have inconsistent semantics. A library may contain a known defect. A protocol may require behavior that looks unnecessary when viewed without its external context.

That is where comments often multiply:

```typescript
// The API treats an empty labels array as "match nothing",
// so do not send labels when no filter is selected.
```

The explanation may be correct. But the comment does not protect the behavior it describes.

A small request builder and a regression test do:

```typescript
type BuildExternalSearchRequestOptions = {
  readonly labels: readonly string[];
};

type ExternalSearchRequest = {
  readonly labels?: readonly string[];
};

export function buildExternalSearchRequest(
  options: BuildExternalSearchRequestOptions
): ExternalSearchRequest {
  const { labels } = options;

  if (labels.length === 0) {
    return {};
  }

  return { labels };
}
```

```typescript
import assert from "node:assert";
import test from "node:test";
import { buildExternalSearchRequest } from "./build-external-search-request.js";

test("omits an empty label filter because the external API treats it as matching nothing", () => {
  const request = buildExternalSearchRequest({ labels: [] });

  assert.deepStrictEqual(request, {});
});
```

The function isolates the external inconsistency at a boundary. The test describes the surprising behavior and fails when someone later "simplifies" the request to always include `labels`.

A comment could remain unchanged while the implementation stops honoring it. The test participates in the feedback loop.

Tests are not infallible. They can encode the wrong expectation and the external system can change after deployment. But a test is executable evidence of the behavior our code intends to preserve. A comment is only an assertion that someone once believed the explanation was accurate.

This is another example of testability acting as design feedback. In [Why your unit tests feel fragile](/blog/why-your-unit-tests-feel-fragile), I argued that difficult tests often reveal blurred responsibilities and hidden dependencies. A well-isolated workaround produces the opposite result: a small boundary, an explicit rule and a focused test.

The test should usually be the primary protection. A concise comment can still be justified when important provenance exists outside the repository, such as a vendor issue, a protocol section or a minimum supported version. That comment should add information the test cannot express, not repeat the behavior the test already proves.

## Some comments are necessary

Code can express behavior. It cannot always express the full reason a constraint exists.

A security-sensitive branch may look redundant without knowledge of a previous vulnerability. A compatibility workaround may be required until a specific external version is no longer supported. A protocol implementation may follow a non-obvious requirement from a specification. A performance optimization may deliberately choose a less direct implementation because measurements showed that the simpler version violated a real product requirement.

Removing that context can make the code easier to read and easier to break.

Those are good reasons for a comment.

A useful comment explains why the obvious implementation is wrong. It names the external constraint precisely. It links to a durable source when one exists. If the code is temporary, it states the condition under which it can be removed.

It does not narrate the syntax below it. It does not preserve an old implementation. It does not assign work to nobody. It does not apologize for a function that should be redesigned.

The distinction is not "comments are bad" versus "comments are good".

The distinction is whether the comment carries information that has no stronger and more reliable home.

## Make comments earn their place

When I feel the need to add a comment, I first ask what kind of information I am trying to preserve.

Deleted implementation belongs in Git history. Future work belongs in a planning system. Current product defects belong to the team that owns them. Business meaning belongs in names, types and composition. Observable behavior belongs in tests. Non-obvious constraints or rationale that names, types, tests and history cannot express clearly may belong in a comment.

That order matters.

It keeps comments exceptional enough that readers pay attention when they encounter one. It also prevents prose from becoming a parallel architecture that has to be maintained beside the real one.

I would reject commented-out code, vague `TODO` markers and comments that merely translate implementation into English during review. Not because review should enforce aesthetic purity, but because each one is evidence that important information may be stored in the wrong place.

Sometimes the answer will still be a comment.

But it should be the answer after the design has been questioned, not before.

Delete dead code, track real work, name the decision, test the workaround and comment only what remains.
