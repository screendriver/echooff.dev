---
title: "Time is an external dependency"
description: "Reading the current time looks harmless, but it hides infrastructure inside application logic. Making time explicit keeps behavior deterministic and tests simple."
publishedAt: "2026-07-11T08:39:00+02:00"
topic: "Architecture"
---

In [Clean Architecture protects the happy zone](/blog/clean-architecture-protects-the-happy-zone), I described the outside world as everything an application does not fully control. Time belongs to that outside world.

That can sound overly formal. Reading the current time does not require an HTTP client, credentials or a network connection. Browsers and Node.js already provide `Date.now()`, `new Date()`, `setTimeout()` and `setInterval()`, so using them directly feels like ordinary application code.

But the application does not control what those APIs return or when scheduled work runs. Time changes independently of the function that reads it. A function can receive the same visible arguments twice and still produce a different result because it was called a millisecond later. That makes time an external dependency, even when the API is provided by the environment.

The consequences usually appear gradually. Session expiration reads `Date.now()`. A reconnect loop calls `setTimeout()`. A cache checks its age against the system clock. Tests start patching globals, enabling fake timers or waiting for real time to pass. When a production issue depends on an exact sequence of timestamps, reproducing it becomes much harder than it should be.

The problem is not that JavaScript has a clock. It is letting application logic depend on that clock without saying so.

## `now` is an input

Consider a function that decides whether a session has expired:

```typescript
type Session = {
  readonly expiresAtTimestampInMilliseconds: number;
};

export function isSessionExpired(session: Session): boolean {
  return Date.now() >= session.expiresAtTimestampInMilliseconds;
}
```

The code is short and easy to read, but its signature is incomplete. It claims that the result depends only on the session. In reality, it also depends on the current time.

That hidden input is what makes the behavior non-deterministic. The caller cannot choose the moment at which the decision is evaluated, and a test has to manipulate the environment before it can verify a simple comparison.

A more honest version receives the current timestamp explicitly:

```typescript
type Session = {
  readonly expiresAtTimestampInMilliseconds: number;
};

type IsSessionExpiredOptions = {
  readonly currentTimestampInMilliseconds: number;
  readonly session: Session;
};

export function isSessionExpired(options: IsSessionExpiredOptions): boolean {
  const { currentTimestampInMilliseconds, session } = options;

  return (
    currentTimestampInMilliseconds >= session.expiresAtTimestampInMilliseconds
  );
}
```

The function now describes the complete decision. It needs a session and a timestamp. Nothing else can influence the result.

The test becomes ordinary:

```typescript
import assert from "node:assert";
import test from "node:test";

import { isSessionExpired } from "./is-session-expired.js";

test("returns true when the current time reaches the expiration time", function () {
  const result = isSessionExpired({
    currentTimestampInMilliseconds: 1_704_067_200_000,
    session: {
      expiresAtTimestampInMilliseconds: 1_704_067_200_000
    }
  });

  assert.strictEqual(result, true);
});
```

There is no fake clock because this function does not need a clock. It needs one value, and that distinction matters.

## Pass values into decisions

Making time explicit does not mean passing a large clock abstraction into every function that compares two timestamps. Most application decisions do not need the capability to ask for the current time. They need a snapshot of what the current time was when the operation started.

Passing that value directly keeps the contract narrow and gives the whole decision one consistent view of `now`. This is especially useful when several rules belong to the same operation. If each rule calls `Date.now()` independently, an expiration boundary can be crossed halfway through the operation and two rules can disagree about the state of the same session.

Reading the time once and passing the resulting timestamp through the decision avoids that ambiguity. The application boundary observes the outside world; the inner code works with plain data.

This is the smallest useful form of dependency injection. It does not require a framework or even an interface. It only requires the caller to provide the information the function actually needs.

A clock becomes useful when code needs more than one value. An application service may need to observe time repeatedly, create values stamped with the current date, or schedule work for later. In that case, time is no longer just data passed into a decision. It is a capability used by orchestration code.

## Use a wall clock for time-based orchestration

A wall clock is the boundary through which application code observes the current time and schedules time-based work. Instead of allowing orchestration code to call `Date.now()`, `new Date()`, `setTimeout()` or `setInterval()` directly, it receives a small capability that exposes those operations explicitly.

The clock does not own the application rules. It does not decide when a session expires or when a refresh should happen. It only provides controlled access to time. The application still owns every decision made with it.

I created [`@enormora/wall-clock`](https://github.com/enormora/wall-clock) because I kept needing this boundary in different places. The package provides a deliberately small `WallClock` contract, a real implementation backed by the runtime and a deterministic implementation for tests. It is not a date library, a calendar library or a dependency injection framework. Its only purpose is to stop time from becoming a hidden global dependency.

Imagine an application service that schedules a session refresh at an absolute timestamp. It needs to know the current time so it can calculate the delay, and it needs a timer so it can run the refresh later.

Calling `Date.now()` and `setTimeout()` directly would hide both dependencies. The wall clock makes them visible:

```typescript
import type { WallClock } from "@enormora/wall-clock/wall-clock";

type ScheduleSessionRefreshDependencies = {
  readonly wallClock: WallClock;
};

type ScheduleSessionRefreshOptions = {
  readonly refreshAtTimestampInMilliseconds: number;
  readonly refreshSession: () => void;
};

type ScheduleSessionRefresh = (
  options: ScheduleSessionRefreshOptions
) => ReturnType<WallClock["setTimeout"]>;

export function createScheduleSessionRefresh(
  dependencies: ScheduleSessionRefreshDependencies
): ScheduleSessionRefresh {
  const { wallClock } = dependencies;

  return function scheduleSessionRefresh(
    options: ScheduleSessionRefreshOptions
  ): ReturnType<WallClock["setTimeout"]> {
    const { refreshAtTimestampInMilliseconds, refreshSession } = options;
    const delayInMilliseconds = Math.max(
      0,
      refreshAtTimestampInMilliseconds -
        wallClock.currentTimestampInMilliseconds
    );

    return wallClock.setTimeout(refreshSession, delayInMilliseconds);
  };
}
```

The application still decides when the refresh should happen. The clock only provides access to the current timestamp and the runtime scheduler.

That direction is important. The application defines the capability it needs, while the outer layer provides the real implementation. This is the same dependency rule described in the Clean Architecture article, applied to something as small as `Date.now()`.

The real clock is created at the composition root:

```typescript
import { createWallClock } from "@enormora/wall-clock/wall-clock";

import { createScheduleSessionRefresh } from "./schedule-session-refresh.js";

const scheduleSessionRefresh = createScheduleSessionRefresh({
  wallClock: createWallClock()
});
```

Only this outermost wiring knows that production time comes from the runtime. The service depends on the `WallClock` contract, not on global APIs. Tests can provide another implementation through the same boundary without changing the service or intercepting the environment.

## Tests should move time, not wait for it

Once the clock is explicit, testing time-based orchestration no longer requires changing the global runtime. The test creates the same application service as production, but supplies a deterministic wall clock:

```typescript
import assert from "node:assert";
import test from "node:test";

import { createDeterministicWallClock } from "@enormora/wall-clock/deterministic-wall-clock";

import { createScheduleSessionRefresh } from "./schedule-session-refresh.js";

test("refreshes the session at the scheduled time", function () {
  const wallClock = createDeterministicWallClock({
    initialCurrentTimestampInMilliseconds: 1_704_067_200_000
  });
  const scheduleSessionRefresh = createScheduleSessionRefresh({ wallClock });
  let refreshCount = 0;

  scheduleSessionRefresh({
    refreshAtTimestampInMilliseconds: 1_704_067_205_000,
    refreshSession() {
      refreshCount += 1;
    }
  });

  wallClock.advanceByMilliseconds(4_999);

  assert.strictEqual(refreshCount, 0);

  wallClock.advanceByMilliseconds(1);

  assert.strictEqual(refreshCount, 1);
});
```

The test does not wait five seconds. It advances the clock by five seconds and verifies the behavior at the exact boundary.

That difference is larger than it first appears. Waiting makes tests slow and lets the runtime scheduler influence the result. Moving a deterministic clock makes the transition immediate and reproducible. A test can cover hours, days or weeks of application time without waiting for that duration in real time.

It also becomes straightforward to test the uncomfortable boundaries where time-dependent bugs tend to live: one millisecond before expiration, exactly at expiration, immediately after a timeout, several elapsed intervals or a retry that has already been cancelled. The test owns the timeline instead of hoping that the environment happens to produce the right one.

This is not merely a convenient testing API. It is the result of an architectural boundary. Tests are simple because production code no longer hides where time comes from.

## Fake timers replace the environment, not the dependency

Fake timers can be useful. They are sometimes the practical choice for integration tests, framework code or third-party code that directly uses global timers and cannot be changed.

But they solve a different problem. [Jest timer mocks](https://jestjs.io/docs/timer-mocks) replace the native timer functions through APIs such as `jest.useFakeTimers()` and advance them through `jest.advanceTimersByTime()`. [Vitest timer mocks](https://vitest.dev/guide/mocking/timers) provide the same capability through `vi.useFakeTimers()` and `vi.advanceTimersByTime()`. In both cases, the production code continues to call global time APIs directly. The test runner changes what those globals mean while the test is running.

That creates two forms of coupling. Time remains a hidden dependency in the production code, and the test now knows how a particular runner replaces and advances global time. Moving from Jest to Vitest, `node:test` or another runner like [Mocha](https://mochajs.org) means changing how the test controls the timeline even though the application behavior itself has not changed.

A deterministic wall clock moves that control behind an explicit dependency. The test advances application time through `wallClock.advanceByMilliseconds()` regardless of which runner executes it. The runner may still define how a test is discovered, executed and reported, but it no longer defines how time passes inside the application.

The replacement also stays local. Only code that receives the deterministic clock observes the controlled timeline. Unrelated code in the same process does not suddenly run against a modified global scheduler, and the test constructs the application through the same boundary used in production.

This does not make the whole program independent of every environment. The real clock still delegates to browser or Node.js APIs at the composition root. It makes the application behavior and its tests independent of the machine's real clock, the global scheduler and a particular test runner's fake-timer implementation.

This follows the same principle as [dependency injection without frameworks](/blog/dependency-injection-without-frameworks-in-typescript). Testability is a valuable consequence, but the primary benefit is that construction and behavior are separated. The application says what it needs. The environment decides how to provide it.

## Controlled time improves production reasoning

Time becomes more important as a system grows. Authentication tokens expire. Caches become stale. Connections reconnect with backoff. Notifications are delayed. Presence information ages. User interfaces show relative timestamps. Background work is cancelled or rescheduled.

If every feature reads the system clock and schedules timers directly, time-dependent behavior becomes scattered infrastructure. There is no clear place to control it, no consistent way to reproduce it and no simple way to run the same behavior against a recorded or simulated timeline.

An explicit clock changes that. When a production issue depends on a particular timestamp, that part of the behavior can be recreated with the same timestamp. A retry sequence can be advanced one step at a time. A day-long timeout can be tested without waiting a day. The same application service can run against real time in production and deterministic time in a test or simulation.

At system scale, the important work is often making whole classes of behavior easier to understand, not only making one function easier to test. Time is one of those cross-cutting concerns that looks local until dozens of unrelated modules have each created their own hidden relationship with the runtime.

A small boundary prevents that relationship from spreading. It gives the system one explicit vocabulary for current timestamps, current dates and timers while still allowing inner decision-making code to work with plain values wherever possible.

## Not every use of `Date` is a hidden dependency

The goal is not to ban the `Date` class or pretend that every date-related operation needs an abstraction. Creating a `Date` from an explicit timestamp is deterministic. Comparing two timestamps is deterministic. Parsing external date input belongs at a validation boundary, and formatting dates belongs near the user interface where locale and time-zone decisions are known.

The hidden dependency appears when code asks the environment what time it is or asks the runtime to execute something later. `Date.now()`, `new Date()` used to obtain the current moment, and global timer functions cross that boundary. They are perfectly valid at the edge of the application. They become a design problem when they are scattered through code that makes application decisions.

Wall-clock time is also not the correct tool for every measurement. Code that measures elapsed duration or performance usually needs a monotonic clock that cannot jump backwards when the system time changes. Making time explicit allows that distinction to exist. Hidden global access silently chooses an implementation before the application has even described what kind of time it needs.

The point is not abstraction for its own sake. The point is control.

## This is Clean Architecture in small

Treating time as an external dependency is a small architectural decision, but it demonstrates the larger idea clearly.

The inner code receives timestamps and makes decisions. Application services declare when they need access to a clock. The composition root provides the real runtime implementation. Tests provide a deterministic implementation through the same contract.

Nothing needs to patch the application from the outside. Nothing needs to pretend that a hidden input does not exist. The dependency direction remains visible in ordinary TypeScript.

Time will always be part of the outside world. The application still has to read it, display it and react to it. Clean Architecture does not remove those interactions. It keeps them at a boundary where they can be controlled.

So read the current time at the edge. Pass a timestamp when a decision needs a value. Pass a clock when orchestration needs the capability to observe or schedule time. In tests, advance that clock deliberately instead of waiting for the machine.

The happy zone should not ask the runtime what time it is.

It should be told.
