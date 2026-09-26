---
title: "Prefer explicit returns in TypeScript"
description: "Make function contracts visible. Implicit returns can expose implementation details and make nested functions and later changes harder to review."
publishedAt: "2026-09-26T11:55:00+02:00"
topic: "TypeScript"
---

A function that calls another function does not necessarily need to return its result. Expression-bodied arrow functions make that distinction easy to miss:

```typescript
const notify = (message: string) => sendNotification(message);

const createGreeting = () => ({ message: "Hello" });
```

Both functions return the result of their expression. The second deliberately creates an object. The first forwards whatever `sendNotification()` returns, whether that result belongs in the calling code or not. These are [expression-bodied arrow functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions#function_body), commonly described as using implicit returns.

A function should expose a result because that result belongs to its contract, not merely because its implementation happens to be a single expression. An explicit `return` gives that decision a place in the code where it can be reviewed.

## Calling is not the same as returning

Consider a function that adds a notification to a supplied queue:

```typescript
const notify = (notifications: string[], message: string) =>
  notifications.push(message);
```

[`push()` returns the new array length](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/push). Consequently, `notify()` returns a number, even though its name describes an action rather than a query about the queue.

Nothing necessarily breaks when callers ignore that number. But the function now exposes an implementation detail as its return value. Code can start depending on it and replacing the array with a different queue implementation can change the function's inferred contract.

When the operation should not expose a result, write that directly:

```typescript
function notify(notifications: string[], message: string): void {
  notifications.push(message);
}
```

The queue still receives the message. Its length does not become the function's output. The implementation can change without automatically forwarding a different result to callers.

## TypeScript's `void` does not remove a return value

Annotating a variable with a function type does not necessarily prevent the original problem:

```typescript
const notify: (notifications: string[], message: string) => void = (
  notifications,
  message
) => notifications.push(message);
```

This compiles, including with `strict` enabled. Here, `void` means that callers cannot use the result as a meaningful value. It does not remove the number at runtime. The TypeScript handbook explains this under [assignability of functions](https://www.typescriptlang.org/docs/handbook/2/functions.html#assignability-of-functions).

An explicit return type on the implementation is different:

```typescript
const notify = (notifications: string[], message: string): void =>
  notifications.push(message);
```

Now TypeScript reports that `number` is not assignable to `void`. The annotation constrains the function being written, rather than merely describing how a caller may use it.

The earlier function declaration combines that check with a body that does not forward the queue's result. Braces and return types serve different purposes. Together, they make the intended contract easier to preserve.

## Keep function boundaries visible

The object in `() => ({ message: "Hello" })` is plainly the intended output. The readability problem becomes more substantial when that shorthand surrounds other expression-bodied functions.

Consider a small wrapper around an injected in-memory user index:

```typescript
type User = {
  readonly id: string;
  readonly active: boolean;
};

const createUserIndex = (
  users: Map<string, User>
): {
  findActive: () => readonly User[];
  remove: (userId: string) => void;
} => ({
  findActive: () => [...users.values()].filter((user) => user.active),
  remove: (userId) => users.delete(userId)
});
```

The factory returns an object. Its `findActive()` operation returns an array and the filter callback returns a boolean. Meanwhile, `remove()` forwards the boolean from [`Map.delete()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/delete), despite its public `void` signature. Those are separate contracts, but the expression nesting gives them little visual separation.

The factory and its explicit dependency are not the problem. We can keep both while naming the returned contract and giving the operations ordinary method bodies:

```typescript
type UserIndex = {
  findActive: () => readonly User[];
  remove: (userId: string) => void;
};

function createUserIndex(users: Map<string, User>): UserIndex {
  return {
    findActive() {
      return [...users.values()].filter((user): boolean => {
        return user.active;
      });
    },

    remove(userId: string): void {
      users.delete(userId);
    }
  };
}
```

The rewritten version keeps the implementations directly inside the returned object. `UserIndex` defines the public contract; the method bodies show which results are returned. `findActive()` returns the matching users, while `remove()` performs an operation without forwarding its result. Those decisions remain visible without extracting the methods into separate functions.

`remove()` deliberately discards the deletion result: its runtime return value changes from a boolean to `undefined`. If callers need to know whether an entry existed, that result should be part of the public contract instead. Its explicit `: void` annotation is still useful: the public `void` signature alone would allow an implementation that returns the boolean.

Naming `UserIndex` improves the signature independently of the return syntax.

## Small edits should not require changing the return structure

Suppose `findActive()` later needs an intermediate collection before applying its filter. Adding a local variable to the expression-bodied version requires converting it to a block and adding a `return` for the previously implicit result. That is an extra behavioral detail to preserve during an otherwise ordinary edit.

In the block-bodied version, the return is already a statement. The intermediate calculation has a place before it. The function's structure does not depend on whether its implementation currently fits into one expression.

The factory's declared `UserIndex` return type provides another check. TypeScript [checks the returned object against that contract](https://www.typescriptlang.org/docs/handbook/type-inference.html#contextual-typing), so removing the return from `findActive()` is an error even without an annotation on the method itself. Without a declared contract, an unannotated wrapper can instead acquire a `void` return type.

Arrow functions remain useful for callbacks and for their lexical `this` behavior. The filter callback above is still an arrow, with a block body and an explicit return. Arrows should not be mechanically replaced with function declarations where their `this` semantics matter.

## An unintended return can change a workflow

A returned value can do more than expose an implementation detail. Consider saving a document and recording optional telemetry about the attempt:

```typescript
function save(
  saveDocument: () => Promise<string>,
  recordSaveAttempt: () => Promise<void>
): Promise<string> {
  return saveDocument().finally(() => recordSaveAttempt());
}
```

The callback in `finally()` returns the telemetry Promise, so [`finally()` makes the returned chain wait for it](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/finally). If both operations succeed, `save()` still fulfills with the document identifier, not `undefined`. But if telemetry rejects, `save()` rejects with that error even when the document was saved successfully. Optional telemetry has become part of deciding whether the save appears to have succeeded.

That relationship can change without editing the callback. If `recordSaveAttempt()` previously returned nothing and later starts returning a Promise, the expression body forwards it automatically.

Writing `return recordSaveAttempt()` would not fix that behavior. But it would make the return decision visible. An explicit `(): void` on the expression-bodied callback would reject the Promise return. Simply dropping the return is not a complete fix either: the Promise still needs handling, as discussed in [Fire and forget still needs an owner](/blog/fire-and-forget-still-needs-an-owner).

## Make explicit returns the default

For standalone named functions I use function declarations. For callbacks I use a block body and write `return` when the callback should produce a value. That gives code review a consistent question: does this operation need to expose this result?

ESLint's [`arrow-body-style`](https://eslint.org/docs/latest/rules/arrow-body-style) rule can enforce block bodies:

```json
{
  "rules": {
    "arrow-body-style": ["error", "always"]
  }
}
```

When replacing an expression body with a block, keep returning the same value. For example `() => doSomething()` becomes `() => { return doSomething(); }`. Leaving out `return` can change what the caller receives, so it should be a deliberate change rather than part of reformatting the code.
TypeScript can check whether the returned value matches the declared type. A lint rule can require a block body. But neither can decide whether the caller should receive that value in the first place.

This is the same reason [boring code is a feature](/blog/boring-code-is-a-feature). Clean code makes the relevant decisions easy to find. The plain `function` and `return` keywords are useful because they show where an operation begins and which value it sends back to its caller.
