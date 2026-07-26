---
title: "Don't log at the leaf. Log at the root"
description: "When every layer logs the same failure, observability turns into noise. Let inner code return meaning and let the operation boundary report the outcome once."
publishedAt: "2026-07-26T09:19:00+02:00"
topic: "Architecture"
---

In [Clean Architecture protects the happy zone](/blog/clean-architecture-protects-the-happy-zone), I argued that the center of an application should know the rules while the outside should know the world.

Logging belongs to that outside world.

Yet many applications pass a logger into every function, module, service, repository and component and call that decoupling.

It is not.

The logger may be hidden behind an interface. It may be injected instead of imported. Tests may replace it with a fake.

But the inner code still decides that something should become a log. It still chooses the severity, the message and the context. It still knows that application meaning will be translated into an operational signal.

The dependency is visible.

The direction is still wrong.

A component deep in a call hierarchy should usually describe what happened and return that meaning to its caller. The boundary that owns the complete operation should decide whether the outcome needs to be logged.

The leaf knows what happened locally.

The root knows what happened to the operation.

## A failed step is not necessarily a failed operation

Imagine a low-level component that receives a `404` response.

That component knows the mechanism. A requested resource was not found.

It does not necessarily know the meaning.

The missing resource may be optional. The caller may have a fallback. The user may already have cancelled the operation. A retry may succeed a moment later. The absence may even be the expected result of the request.

Logging an error at that point turns incomplete information into an operational conclusion.

The same applies to timeouts, rejected promises, invalid external data and storage failures. A leaf can observe that one step did not complete as expected. It often cannot decide whether the application operation ultimately failed.

Severity depends on context.

A failed retry attempt is different from an exhausted retry policy. A rejected permission check is different from an unexpected authorization failure. Invalid user input is different from corrupted application state.

The leaf rarely owns enough context to make that distinction.

The operation root does.

## Logging and rethrowing is not handling

One of the most common logging patterns looks responsible:

```typescript
type Account = {
  id: string;
};

type Logger = {
  error: (message: string, error: unknown) => void;
};

type AccountRepository = {
  loadAccount: (accountId: string) => Promise<Account>;
};

type LoadAccountOptions = {
  accountId: string;
  accountRepository: AccountRepository;
  logger: Logger;
};

async function loadAccount(options: LoadAccountOptions): Promise<Account> {
  const { accountId, accountRepository, logger } = options;

  try {
    return await accountRepository.loadAccount(accountId);
  } catch (error: unknown) {
    logger.error("Failed to load account", error);

    throw error;
  }
}
```

The function catches the failure, logs it and throws it again.

Nothing was handled.

The next layer may catch the same error, log that opening the account settings failed and throw again. The user-action boundary may log that the action failed. A global error handler may report the unhandled exception one final time.

One failure has now produced several error records.

They may contain the same stack trace with slightly different messages. They may use different severities. Monitoring may count them as separate failures even though they all describe one operation.

The logs look detailed.

The system is harder to understand.

An exception travelling through the call stack should not leave a log line at every layer it passes. A layer that propagates a failure has not yet observed the final outcome. It has only forwarded it.

Logging should normally happen where propagation stops and ownership begins.

## Injecting a logger does not fix the boundary

[Dependency injection](/blog/dependency-injection-without-frameworks-in-typescript) is useful because it makes dependencies visible and keeps construction separate from behavior.

It does not make every dependency appropriate.

Injecting a logger into application logic may hide the concrete logging provider, but it does not remove the observability decision from that logic.

The use case still decides whether an outcome is an `info`, `warn` or `error`. It still writes the operational message. It still chooses which application data is attached. It may still expose sensitive information accidentally. Its tests now need a logger even when they are only verifying a business decision.

The vendor is abstracted.

The policy is not.

This is the same mistake as injecting a translation function into a use case. The dependency is explicit, but the use case still knows about presentation.

A logger is operational presentation.

The application can know that account synchronization failed because remote data was invalid. It should not necessarily know that this becomes an error-level log with a particular message and a provider-specific context object.

The inner layer should return meaning.

The outer layer should decide how that meaning becomes observable.

## Return meaning to the boundary

Expected failures should be part of the contract.

As described in [Avoid throwing for expected failures](/blog/avoid-throwing-for-expected-failures-typescript), a result can communicate that an operation may succeed or fail without hiding that control flow behind an exception.

The exact representation is not important here. It may be a discriminated union, a `Result` type or another explicit application type.

What matters is that it contains application meaning rather than a prepared log message.

```typescript
type SynchronizeAccountFailure =
  "invalidRemoteData" | "remoteAccountUnavailable";

type SynchronizeAccountResult =
  | { status: "synchronized" }
  | { status: "failed"; reason: SynchronizeAccountFailure };

type SynchronizeAccount = (
  accountId: string
) => Promise<SynchronizeAccountResult>;
```

There is no logger in this contract.

The operation returns application meaning. Its caller can retry, recover, present the failure or report the final outcome without the leaf predicting that policy.

Unexpected failures are different, but the same ownership rule applies. They may propagate as exceptions or be preserved as causes inside an explicit failure. A layer may add semantic context when it genuinely knows more than the layer below.

It should not emit another copy of the same failure merely because it caught it.

## Report outcomes, not log messages

The outer boundary should not receive strings prepared by the application either.

A better observability boundary describes the event being reported.

It may receive the final operation outcome, its duration, the number of attempts and a deliberately limited set of safe identifiers. An infrastructure adapter can turn that report into a structured log, a metric, a trace event or several of those signals.

It may also decide that no signal is necessary.

The application says:

> Account synchronization finished with invalid remote data.

The observability adapter decides:

> Record a structured warning, increment a failure counter and attach the result to the current trace.

This is still dependency injection, but the dependency is semantic. The application reports an application event instead of controlling an infrastructure tool.

That also makes observability easier to evolve. An operation may begin as a log, later gain a metric and eventually become part of a trace. Inner code does not need to change each time its operational representation changes.

This does not mean every function needs its own observability interface.

Most functions should need none.

Meaningful reports belong at meaningful operation boundaries, not beside every branch that can return an error.

## The root is an ownership boundary

The word root can be misleading.

It does not necessarily mean the composition root of the whole application. The rule is not to move every log into `main.ts`.

A root is the boundary that owns one complete unit of work.

It may be a user-action handler, an HTTP request handler, a scheduled job, a message consumer or a state-machine actor. It may live deep inside the wider application while still being the root of the operation it starts.

The important question is not how close the code is to the top of the source tree.

The important question is whether it owns the terminal outcome.

That boundary knows whether the operation ultimately succeeded, whether a failure was expected, whether recovery worked and which safe context makes the outcome useful to operators.

Logging there produces one coherent observation instead of several incomplete ones.

## Detached work still needs an owner

Detached asynchronous work has no natural caller waiting for its result.

That does not make leaf logging the right answer.

It means the application needs an explicit execution boundary that starts the work and owns its terminal failure. Call sites submit work through that boundary instead of attaching their own repeated catch-and-log handlers.

The boundary becomes the root of the detached operation.

Fire-and-forget should mean that the caller does not wait for completion.

It should not mean that nobody owns failure.

The mechanics of such an execution boundary deserve a separate discussion. The architectural rule remains the same: establish ownership first, then report the final outcome at that boundary.

## This is not a ban on local instrumentation

Not every diagnostic signal is a terminal application log.

A low-level infrastructure component may add technical information to a span it owns. A cache may count hits and misses. A network adapter may measure request duration. Those signals describe behavior the component actually owns.

Audit events are different again. When the product must record that a business action happened, that record is application data with reliability and retention requirements. It should be modelled explicitly rather than hidden behind `logger.info()`.

The problem is not that deep components can never produce any observation.

The problem is that a leaf declares an entire operation failed when it only knows that one step failed.

Logs that describe final outcomes should be written by the boundary that owns those outcomes.

A global unhandled-error handler is still useful as a final safety net. It catches failures that escaped every intended boundary.

It should be the last line of defence.

It should not be the normal architecture.

## One failure should tell one story

At small scale, duplicated logs are annoying.

At system scale, they distort error rates, trigger duplicate alerts, increase ingestion costs and make incidents harder to reconstruct.

The problem is not one `logger.error()` call. It is thousands of local observability decisions without a common owner.

Centralizing ownership produces one coherent observation: what operation ran, how it ended, which recovery was attempted and whether the result mattered.

The goal is not fewer logs at any price.

The goal is fewer accidental logs and more intentional observations.

## Final thought

Logging is a side effect.

Like time, translation and browser APIs, it belongs at a boundary where the outside world is expected.

Inner code should make decisions and return meaning. It should not also decide how operators observe those decisions.

A leaf may know which request failed.

A root knows whether the operation failed.

Do not log the journey of an error through every layer of the call stack.

Log the owned outcome once.
