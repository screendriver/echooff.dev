---
title: "Prefer process.exitCode over process.exit() in Node.js"
description: "process.exit() looks explicit, but it can terminate a Node.js process before pending work has finished. Prefer process.exitCode and let Node.js shut down naturally."
publishedAt: "2026-06-04T15:09:00+02:00"
topic: "Node.js"
---

In previous posts I wrote about [avoiding hidden failure paths](/blog/avoid-throwing-for-expected-failures-typescript), [making asynchronous failure explicit](/blog/prefer-task-over-promise-typescript), and [keeping runtime dependencies at the boundary](/blog/avoid-direct-browser-globals).

This post is about the same idea in a smaller place:

How should a Node.js program exit?

This is not about memorizing another Node.js footgun.

It is about where shutdown decisions belong.

Many examples use this:

```typescript
import process from "node:process";

async function main(): Promise<void> {
  const isConfigurationValid = await validateConfiguration();

  if (isConfigurationValid === false) {
    console.error("Invalid configuration.");
    process.exit(1);
  }

  await runApplication();
}

await main();
```

At first glance, this looks reasonable.

The configuration is invalid.

The program should fail.

So we exit with code `1`.

Simple.

But `process.exit()` is not just an exit code.

It is also a shutdown instruction.

That distinction matters.

Because once shutdown is hidden inside ordinary application code, it becomes harder to reason about what still runs and what gets skipped.

## An exit code is not control flow

An exit code describes how a process finished.

`0` usually means success.

A non-zero code usually means failure.

That part is fine.

The problem starts when the exit code becomes the control-flow mechanism.

`process.exit(1)` does two things at once:

It sets the exit status.

And it tells Node.js to terminate the process now.

Those are different responsibilities.

**An exit code should describe the result of the program. It should not be the mechanism that interrupts the program.**

This is the same kind of design problem we see in application code all the time.

A function should decide what happened.

The boundary should decide how that result is represented to the outside world.

For a CLI, the outside world is the shell.

For the shell, the result is an exit code.

## `process.exit()` pulls the plug

The [Node.js documentation](https://nodejs.org/api/process.html) is very direct about this.

Calling `process.exit()` terminates the process synchronously.

It can force the process to exit even when asynchronous work is still pending, including writes to `process.stdout` and `process.stderr`.

That means this can lose output:

```typescript
import process from "node:process";

async function main(): Promise<void> {
  const isValid = await validateInput();

  if (isValid === false) {
    console.error(createLongErrorMessage());
    process.exit(1);
  }

  await writeReport();
}

await main();
```

Maybe it works on your machine.

Maybe it works when output goes to a terminal.

Maybe it fails when output is piped in CI, sent through a socket, or collected by some logging infrastructure.

The exact behavior depends on what the stream is connected to and on the platform.

That makes it worse, not better.

That is the annoying part.

The bug is not obvious.

The program looks correct.

But the process may be killed before Node.js has finished flushing what you wanted to print.

This is especially frustrating in command-line tools.

The exact moment where you need a useful error message is the same moment where `process.exit()` can make that message incomplete.

## Prefer setting `process.exitCode`

A better default is to set `process.exitCode` and then return normally.

```typescript
import process from "node:process";

async function main(): Promise<void> {
  const isValid = await validateInput();

  if (isValid === false) {
    console.error(createLongErrorMessage());
    process.exitCode = 1;
    return;
  }

  await writeReport();
}

await main();
```

This tells Node.js which status code to use when the process exits.

But it does not force the process to terminate immediately.

Node.js can finish the work that is already pending.

The event loop can drain.

Output can be flushed.

Cleanup that was explicitly awaited can finish.

To be precise: `process.exitCode` does not magically await work you forgot to await.

Cleanup that matters should still be explicit.

It should still be awaited.

That is the important difference.

`process.exitCode = 1` records the outcome.

`return` controls the program flow.

Those responsibilities stay separate.

## The `return` is not noise

This is the part some people dislike.

With `process.exit()`, the program stops immediately.

With `process.exitCode`, you still need to return from the current flow.

That is not a downside.

That is the point.

The control flow becomes visible.

```typescript
if (isConfigurationValid === false) {
  console.error("Invalid configuration.");
  process.exitCode = 1;
  return;
}
```

This code says exactly what happens:

The program prints an error.

It marks the process as failed.

It stops executing the current path.

There is no hidden global escape hatch.

There is no invisible jump out of the program.

There is just normal control flow.

And normal control flow is easier to read, easier to test, and easier to reason about.

## Keep `process` at the application boundary

In larger programs, I would go one step further.

Most code should not know about `process` at all.

`process` is runtime infrastructure.

It belongs at the boundary.

Especially libraries should almost never call `process.exit()`.

A library does not own the process.

The application does.

The inner application should receive the dependencies it needs and return a result.

The entry point should provide those dependencies, then translate the result into console output and an exit code.

```typescript
import { isUndefined } from "@sindresorhus/is";

type Configuration = {
  filePath: string;
};

type CliResult =
  { type: "success" } | { type: "failure"; message: string; exitCode: 1 };

type RunDependencies = {
  readConfiguration: () => Promise<Configuration | undefined>;
  execute: (configuration: Configuration) => Promise<void>;
};

async function run(dependencies: RunDependencies): Promise<CliResult> {
  const { readConfiguration, execute } = dependencies;

  const configuration = await readConfiguration();

  if (isUndefined(configuration)) {
    return {
      type: "failure",
      message: "Missing configuration.",
      exitCode: 1
    };
  }

  await execute(configuration);

  return { type: "success" };
}
```

Then the entry point becomes the only place that talks to the process:

```typescript
import process from "node:process";

async function main(): Promise<void> {
  const result = await run({
    readConfiguration,
    execute
  });

  if (result.type === "failure") {
    console.error(result.message);
    process.exitCode = result.exitCode;
    return;
  }
}

await main();
```

That design is not about making the code look clever.

It is about making the boundary explicit.

The application decides whether it succeeded or failed.

The entry point decides how that result is exposed to the operating system.

That is a clean separation.

## Tests become simpler too

When `process.exit()` is buried inside application logic, testing becomes awkward.

You either avoid the path, mock the process, or run the code in a child process.

None of that should be necessary for ordinary logic.

If `run()` receives its dependencies and returns a result, the test can assert the behavior directly.

```typescript
import assert from "node:assert";
import test from "node:test";

test("returns a failure when configuration is missing", async () => {
  const result = await run({
    async readConfiguration() {
      return undefined;
    },
    async execute() {
      assert.fail("execute should not be called.");
    }
  });

  assert.deepStrictEqual(result, {
    type: "failure",
    message: "Missing configuration.",
    exitCode: 1
  });
});
```

No process mocking.

No global shutdown interception.

No special test runner magic.

The program outcome is just data.

That is usually the easiest thing to test.

## What about fatal errors?

This does not mean `process.exit()` must never exist.

There are situations where terminating immediately is intentional.

For example, a process may be in a corrupt state, a parent supervisor may be expected to restart it, or you may be writing very small glue code where there is no meaningful cleanup path.

But that should be a deliberate decision.

It should not be the default way to return a failure from normal application flow.

Expected failures should be handled explicitly.

Invalid input is expected.

Missing configuration is expected.

A failed HTTP request is expected.

A command-line argument error is expected.

Those cases do not need a forced process termination.

They need a clear result, a useful message, and the right exit code.

## A practical rule

My default rule is simple:

Use `process.exitCode` for normal failure paths.

Return from the current function to stop the current flow.

Keep `process` access at the entry point.

Reserve `process.exit()` for cases where immediate termination is really the behavior you want.

Most of the time, it is not.

Most of the time, you want the program to finish deliberately.

Not abruptly.

## Final thought

`process.exit()` feels explicit because it is visible.

But visibility is not the same as clarity.

It hides a shutdown decision inside ordinary application flow.

It can cut off pending work.

It makes tests more awkward.

And it mixes two separate concerns: deciding the result and terminating the runtime.

`process.exitCode` is less dramatic.

That is exactly why it is usually better.

Set the result.

Return normally.

Let Node.js finish what is already in progress.

Good shutdown behavior should be boring.
