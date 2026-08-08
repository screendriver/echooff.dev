---
title: "Fire and forget still needs an owner"
description: "Choosing not to await a Promise does not remove responsibility for its failure. A fire-and-forget invoker gives detached work an explicit owner."
publishedAt: "2026-08-08T08:29:00+02:00"
topic: "Architecture"
---

In [Don't log at the leaf. Log at the root](/blog/dont-log-at-the-leaf-log-at-the-root), I argued that the boundary owning an operation should report its final outcome.

That rule becomes easy to lose when nobody awaits a Promise.

JavaScript makes it easy to start an asynchronous operation and continue immediately. An application can preload data, send telemetry, warm a cache or trigger best-effort cleanup without making the current operation wait for completion.

Sometimes that is exactly what the product needs.

But choosing not to wait does not make the operation disappear. It can still reject. It can still fail after its original caller has moved on. Someone still has to own that outcome.

Fire and forget describes the caller's relationship to the result.

It should not describe the application's relationship to failure.

## `void` does not handle a Promise

A common way to mark intentionally detached work is the `void` operator:

```typescript
function openAccountPage(accountId: string): void {
  void preloadAccount(accountId);
}
```

This can make the intention visible to TypeScript and to linting rules that reject floating Promises.

It does not change what happens at runtime.

The operation still runs. The Promise can still reject. No rejection handler appears merely because its result was passed to `void`.

`void` says only that the result of the expression is deliberately discarded.

It does not say who owns failure.

That distinction matters. A Promise can be intentionally detached and still be incorrectly handled.

In Node.js, that can become more than an observability problem. Under the [default `--unhandled-rejections=throw` mode](https://nodejs.org/api/cli.html#--unhandled-rejectionsmode), an unhandled rejection is raised as an uncaught exception when no `unhandledRejection` listener is installed. Without an `uncaughtException` handler overriding the default behavior, Node.js prints the stack trace to `stderr` and **exits** with code 1.

A floating Promise can therefore terminate a server process, worker, command-line tool or build script.

## A local `catch` scatters ownership

The obvious improvement is to attach a rejection handler:

```typescript
function openAccountPage(accountId: string): void {
  preloadAccount(accountId).catch((error: unknown) => {
    logger.error("Failed to preload account", error);
  });
}
```

The rejection is now observed.

But every call site that starts detached work also becomes responsible for observability. It must remember to add a `catch`, choose a message, select a severity and decide which context is safe to report.

One call site logs an error. Another reports a warning. A third silently ignores the rejection because the operation looked unimportant at the time. A future tracing or error-reporting migration has to find and change all of them.

The Promise is handled locally.

The policy is scattered across the application.

This is the same problem as logging inside lower-level code. The side effect starts owning decisions about how operators should observe it, while callers repeat slightly different versions of the same failure policy.

Detached work does not need a local catch-and-log convention.

It needs a root.

## Give detached work an explicit root

A fire-and-forget invoker creates that root.

The caller submits an operation and continues immediately. The invoker starts the operation, observes its terminal rejection and forwards that failure to one reporting boundary.

The essential implementation can stay small:

```typescript
type FireAndForgetOperation = () => Promise<unknown>;

type FireAndForgetInvoker = {
  fireAndForget: (operation: FireAndForgetOperation) => void;
};

type CreateFireAndForgetInvokerOptions = {
  reportFailure: (error: unknown) => void;
};

export function createFireAndForgetInvoker(
  options: CreateFireAndForgetInvokerOptions
): FireAndForgetInvoker {
  const { reportFailure } = options;

  function fireAndForget(operation: FireAndForgetOperation): void {
    try {
      const promise = operation();

      promise.catch((error: unknown) => {
        reportFailure(error);
      });
    } catch (error: unknown) {
      reportFailure(error);
    }
  }

  return { fireAndForget };
}
```

The call site now expresses one architectural decision:

```typescript
fireAndForgetInvoker.fireAndForget(() => {
  return preloadAccount(accountId);
});
```

The resolved value is deliberately ignored. A synchronous failure while starting the operation and an asynchronous rejection after it started both reach the same boundary.

The invoker accepts a function rather than an already running Promise for the same reason. Calling `fireAndForget(preloadAccount(accountId))` would start the operation before the invoker receives it. A synchronous failure during that call would happen outside the boundary.

Passing an operation lets the invoker own execution from the beginning.

The example assumes that `reportFailure` is a final, synchronous and non-throwing sink. A production implementation must protect this last boundary as well. An error reporter that creates another unobserved failure only moves the original problem one step further away.

The exact implementation can evolve.

The ownership should not.

## The invoker owns observability

The operation should perform its work and communicate failure through its normal Promise contract.

It should not log itself merely because nobody awaits it.

The invoker becomes the root of that detached operation. At the composition root, its `reportFailure` dependency can be connected to structured logging, tracing, error reporting or a combination of those signals.

This does not require losing context.

An invocation can include an operation name or a deliberately limited set of safe metadata when that information is useful. What remains centralized is the policy: call sites do not choose providers, severities or reporting formats independently.

That follows the dependency direction described in [Clean Architecture protects the happy zone](/blog/clean-architecture-protects-the-happy-zone). Inner code performs the work. An outer boundary knows how the runtime observes it.

It is the same broader rule behind [Translations belong to the user interface](/blog/translations-belong-to-the-user-interface). Application meaning stays independent from the way a particular audience sees it. A translation boundary turns meaning into words. An observability boundary turns an owned outcome into an operational signal.

The operation does not need to know either representation.

## Detached work should still be testable

The caller does not wait for detached work.

A test still needs to know when that work has settled.

Without an explicit boundary, tests often compensate with repeated `Promise.resolve()` calls, arbitrary delays or special test doubles that behave differently from production. Those techniques do not describe the real contract. They guess when the runtime has finished.

A production invoker can track active Promises and expose a method such as `waitUntilAllSettled()`.

Application code still calls `fireAndForget()` and continues immediately. A test triggers the same production behavior and then awaits the invoker before asserting the final state.

That does not turn the operation into awaited application behavior. It gives tests and controlled shutdown paths an explicit join point for work that otherwise has no caller waiting for it.

Once detached work has an owner, the application can observe when currently active operations have settled.

Tests no longer have to guess.

## The result must truly be forgettable

A fire-and-forget invoker observes thrown errors and rejected Promises.

It does not interpret resolved values.

That matters when an operation uses a `Result` for an expected failure, as described in [Avoid throwing for expected failures](/blog/avoid-throwing-for-expected-failures-typescript). A Promise resolving to an error result is still a resolved Promise. The invoker has no reason to report it.

It should not inspect arbitrary values and guess which ones represent failure.

If the semantic result matters to the current workflow, the caller cannot truthfully forget it. The operation should be awaited and its result should become part of the application's control flow.

A stricter invoker may accept only operations returning `Promise<void>` to make that intention visible. The detached operation then owns any expected outcomes inside its own boundary and rejects only when unexpected execution fails.

The invoker owns execution failure.

It does not invent business meaning.

## Fire and forget does not guarantee completion

Observing rejection is not the same as guaranteeing that an operation finishes.

A browser tab can close. A process can terminate. A device can lose its connection. The runtime may disappear immediately after the operation starts.

The invoker does not persist work, retry it after a restart, guarantee ordering or provide delivery semantics. It is not a queue, a job system or a durable worker.

Whether that is acceptable is a product decision.

Preloading data may be safely best effort. Telemetry may be allowed to disappear. A draft save may be optional in one product and critical in another. The category of the operation does not decide this on its own. The guarantees promised to the user do.

Use fire and forget only when the caller may continue immediately and losing the work with the current runtime is acceptable.

When the current workflow must react to the outcome, await it.

When the work must survive the current runtime, persist it and give it to a durable execution mechanism.

A fire-and-forget invoker is an ownership boundary.

It is not a reliability guarantee.

## The abstraction documents intent

Without an invoker, `void performOperation()` may represent a deliberate decision or a missing `await`. The author may even believe that `void` handles rejection. A reviewer has to reconstruct the intention from surrounding code.

An explicit `fireAndForgetInvoker.fireAndForget()` call removes that ambiguity.

It says that the operation is intentionally detached.

It also says that failure has an owner.

That is valuable even before the application adds structured logs, tracing or error reporting. Architecture is partly about giving important decisions a name so that they can be recognized, reviewed and changed consistently.

Fire and forget is one of those decisions.

It should not be encoded only as the absence of `await`.

## Final thought

Fire and forget is not the absence of responsibility.

It is a decision that the caller may continue without the result.

The operation still runs inside the application. Its failure still matters operationally. Tests still need a deterministic way to observe it. The product still needs to decide whether losing it is acceptable.

A small invoker gives that work a root.

It starts the operation, observes its rejection and routes the failure through one central policy. The side effect does not log itself. The call site does not repeat a local catch. The global unhandled-rejection handler remains a final safety net instead of becoming the normal execution model.

Ignore the result when the product allows it.

Do not ignore ownership.
