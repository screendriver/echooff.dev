---
title: "Make resource lifetime explicit with using"
description: "JavaScript's using and await using declarations make deterministic cleanup and resource ownership part of lexical scope instead of a repeated try/finally convention."
publishedAt: "2026-09-06T09:35:00+02:00"
topic: "Node.js"
---

JavaScript has garbage collection, but not every resource is memory. A file handle must be closed, a timer may need to be cancelled, a server may need to stop accepting connections and a temporary directory may need to be removed.

Those resources have a meaningful lifetime. Waiting until an object becomes unreachable is neither precise enough nor, in many cases, connected to the cleanup operation at all. Correctness depends on releasing the resource at a predictable point in the control flow.

JavaScript has always been able to express that with `try` and `finally`. What it lacked was a shared protocol and a declaration that tied cleanup to the scope that owns the resource. `using` and `await using` add exactly that.

## Before `using`, cleanup belonged in `finally`

A straightforward file operation can easily cover only the successful path:

```typescript
import { open } from "node:fs/promises";

export async function readConfiguration(path: string): Promise<string> {
  const file = await open(path, "r");
  const configuration = await file.readFile({ encoding: "utf8" });

  await file.close();

  return configuration;
}
```

The file is closed when `readFile()` succeeds. It remains open when that operation throws, and a later refactoring can introduce the same problem with an early return before `close()`.

The reliable implementation uses `finally`:

```typescript
import { open } from "node:fs/promises";

export async function readConfiguration(path: string): Promise<string> {
  const file = await open(path, "r");

  try {
    const configuration = await file.readFile({ encoding: "utf8" });
    return configuration;
  } finally {
    await file.close();
  }
}
```

This is correct and remains a useful pattern. `finally` runs after a successful return and after an exception, so the file is closed on every ordinary exit path.

The weakness is not the control structure. It is the convention each caller has to rebuild around it. Acquisition appears before the `try`, while the cleanup responsibility appears later. The caller must know which method releases the resource, whether it is asynchronous and in which order several resources must be released. It must also preserve earlier failures when cleanup itself fails.

`using` gives that recurring shape a language-level representation.

## `using` binds cleanup to scope

A `FileHandle` implements Node.js's asynchronous disposal protocol, so the same operation can be written as:

```typescript
import { open } from "node:fs/promises";

export async function readConfiguration(path: string): Promise<string> {
  await using file = await open(path, "r");

  const configuration = await file.readFile({ encoding: "utf8" });
  return configuration;
}
```

The declaration registers the file for disposal in the current lexical scope. When execution leaves the function, JavaScript calls `file[Symbol.asyncDispose]()` and waits for it to finish. Node.js implements that method by closing the handle. The same cleanup runs after a normal return, an early return or a thrown error.

Ordinary `using` is the synchronous form and looks for `[Symbol.dispose]()`. `await using` prefers `[Symbol.asyncDispose]()` and can also use a synchronous disposal method. In either case, the declaration describes the end of the resource lifetime as well as its beginning. The first `await` in `await using` belongs to that cleanup contract; it is separate from the second `await` that resolves the initializer.

`using` is part of [ECMAScript's explicit resource management](https://tc39.es/ecma262/multipage/control-abstraction-objects.html#sec-resource-management), rather than a TypeScript-only extension. TypeScript has supported the syntax since [TypeScript 5.2](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-2.html). Node.js gained native syntax support in [version 24](https://nodejs.org/en/blog/release/v24.0.0), and its disposal APIs graduated from experimental status in [version 24.2](https://nodejs.org/en/blog/release/v24.2.0).

Node.js implements the protocol for resources including file and directory handles, timers, child processes and network servers. Each API still defines what disposal means. A file handle is closed, a timer is cancelled, a child process receives `SIGTERM`, and asynchronous server disposal waits until the server has closed.

## Disposal is a protocol

A synchronously disposable value has a method identified by a well-known symbol:

```typescript
type DisposableResource = {
  [Symbol.dispose](): void;
};
```

The asynchronous equivalent returns an awaitable result:

```typescript
type AsyncDisposableResource = {
  [Symbol.asyncDispose](): PromiseLike<void>;
};
```

The language does not need to know whether the value represents a file, lock, subscription, temporary directory or connection lease. It only needs the relevant disposal method. The resource abstraction remains responsible for deciding what cleanup means.

That protocol does not require a class. A factory function can return an ordinary object with a `[Symbol.dispose]()` or `[Symbol.asyncDispose]()` method. There is no need for inheritance, framework lifecycle hooks or a container that intercepts resource creation. The value exposes how it is released, while the caller declares which scope owns that responsibility.

This separation also makes adapters possible for APIs that still expose only `close()`, `destroy()` or `unsubscribe()`. JavaScript deliberately does not guess that one of those method names means disposal. Their semantics differ too much: some operations are asynchronous, some cancel rather than close, and some objects are shared rather than owned by every caller that receives them.

## `using` declares ownership

A function can use a resource without owning it. Receiving an already open file handle, a shared database pool or a process-wide server does not give the function the right to close it.

A `using` declaration makes a stronger statement: this scope is responsible for ending this value's lifetime. That distinction should influence where the declaration is placed.

```typescript
import { open, type FileHandle } from "node:fs/promises";

async function readConfigurationFromFile(file: FileHandle): Promise<string> {
  const configuration = await file.readFile({ encoding: "utf8" });
  return configuration;
}

export async function readConfiguration(path: string): Promise<string> {
  await using file = await open(path, "r");

  const configuration = await readConfigurationFromFile(file);
  return configuration;
}
```

`readConfiguration()` acquires the file and owns its cleanup. `readConfigurationFromFile()` only borrows the handle supplied by its caller, so closing it there would violate the caller's ownership.

The same distinction matters with longer-lived infrastructure. An application may own a database pool for its entire lifetime, while a request owns a much shorter connection lease acquired from that pool. The request should dispose the lease, not the pool.

The syntax cannot choose those boundaries. It makes the chosen boundary visible. Resource acquisition should still remain at an appropriate infrastructure boundary rather than moving into business logic merely because cleanup became more convenient.

## The scope must match the lifetime

A resource declared with `using` is disposed when execution leaves its immediately containing block, function or module. That is useful only when the lexical scope matches the intended lifetime.

Consider a long-running server wrapper:

```typescript
async function runApplication(): Promise<void> {
  await using server = await createApplicationServer();
  await server.start();

  await waitForShutdownSignal();
}
```

The server remains owned by `runApplication()` until a shutdown signal allows the function to complete. Removing the final `await` would start the server and then immediately dispose it when the function returned. The language would be doing exactly what the declaration requested; the ownership scope would simply be wrong.

Several resources in the same scope are disposed in reverse declaration order. That matches the common case where later resources depend on earlier ones:

```typescript
await using connection = await database.connect();
await using transaction = await connection.beginTransaction();

await importRecords(transaction);
```

The transaction is disposed before the connection. JavaScript also continues disposing the remaining resources when one disposal fails. When application code and cleanup both throw, `SuppressedError` keeps both failures available instead of allowing the cleanup failure to silently replace the earlier one.

A careful set of nested `finally` blocks can implement the same behavior. The advantage of explicit resource management is that reverse-order cleanup and failure preservation are the default semantics rather than another detail every call site must reproduce correctly.

## What `using` does not solve

An object must implement the disposal protocol before it can be declared with `using`. Existing APIs without the relevant symbol still need an adapter, a `DisposableStack` for callback-based cleanup, or an ordinary `try` and `finally` block. Conditional cleanup and operation-specific sequencing may also be clearer in `finally` than behind a disposable wrapper.

The feature does not provide lifetime types either. A disposable value can still escape its scope. Returning a value declared with `using` gives the caller an object that has already been disposed, while capturing it in work that outlives the scope creates the same use-after-disposal problem. `await using` waits for disposal; it cannot discover and await every operation that still depends on the resource.

Scope exit is also different from process shutdown. Disposal runs as part of ordinary JavaScript control flow. A forced operating-system termination, runtime crash or call to `process.exit()` can bypass that control flow, so scope-bound cleanup may never run. As described in [Prefer process.exitCode over process.exit() in Node.js](/blog/prefer-process-exitcode-over-process-exit-in-nodejs), normal application failures should usually set the exit code and return through ordinary control flow so that owned scopes can finish.

`using` is therefore not a reason to hide every cleanup callback behind a new abstraction or to stop using `finally`. It is the better representation when one lexical scope genuinely owns a resource with a well-defined disposal protocol.

The improvement is structural rather than syntactic: acquisition and cleanup no longer have to be reconstructed from separate parts of a function. The declaration says where ownership begins, and lexical scope says where it ends.
