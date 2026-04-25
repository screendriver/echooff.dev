---
title: Stop using barrel exports in JavaScript
description: Barrel exports in JavaScript reduce tree shaking effectiveness, hide dependencies and make code harder to maintain. Learn why you should avoid them.
publishedAt: "2026-04-25T09:32:00+02:00"
---

## What are barrel exports?

Barrel exports are files that re-export multiple modules from a single place.

```typescript
// date/index.js
export * from "./formatDate.js";
export * from "./parseDate.js";
export * from "./isWeekend.js";
```

Instead of importing directly:

```typescript
import { formatDate } from "./date/formatDate.js";
```

You write:

```typescript
import { formatDate } from "./date/index.js";
```

Looks cleaner. Feels nicer.

But it comes at a cost.

## The tree shaking problem

Barrel exports make tree shaking less reliable.

Tree shaking relies on static analysis. The bundler needs to understand exactly what is used and what is not.

When you write this:

```typescript
export * from "./formatDate.js";
export * from "./parseDate.js";
export * from "./isWeekend.js";
```

you are effectively saying:

> "Re-export everything from these modules."

That "everything" is the problem.

While modern bundlers sometimes handle `export *` correctly, this depends on heuristics, configuration and the absence of side effects.

In practice, you are no longer in control of what gets included in your bundle.

A common real-world scenario:

```typescript
// formatDate.js
console.log("formatDate loaded");

export function formatDate() {}

// parseDate.js
console.log("parseDate loaded");

export function parseDate() {}
```

```typescript
// index.js
export * from "./formatDate.js";
export * from "./parseDate.js";
```

```typescript
import { formatDate } from "./index.js";
```

Depending on your bundler setup, both modules may be included—even though you only use one.

Not because you asked for it.

But because the barrel made it harder to eliminate safely.

Direct imports leave less ambiguity because the dependency is visible at the import site.

## Hidden dependencies

Barrel exports hide where things actually come from.

```typescript
import { formatDate } from "./date/index.js";
```

Where is `formatDate` defined?

You don’t know without navigating.

Now imagine this across a large codebase:

- Multiple barrels
- Nested barrels
- Re-exports of re-exports

You end up with a graph that is difficult to reason about.

This is the same category of problem as discussed in [Why your unit tests feel fragile](/blog/why-your-unit-tests-feel-fragile).

Barrels add another layer of indirection. That indirection hides structure and makes systems harder to understand and harder to test.

## Accidental coupling

Barrels encourage grouping things that don’t belong together.

```typescript
// date/index.js
export * from "./formatDate.js";
export * from "./parseDate.js";

// math/index.js
export * from "./sum.js";
export * from "./average.js";
```

Consumers start depending on the barrel instead of specific modules.

This creates:

- Unclear boundaries
- Harder refactoring
- Larger dependency surfaces

If you later split modules or reorganize, you risk breaking everything that depends on the barrel.

## Worse developer experience over time

Barrels feel great at the beginning.

But over time:

- Auto-imports pick the barrel instead of the real module
- Imports become less intentional
- Code navigation becomes slower
- Refactoring becomes risky

You trade short-term convenience for long-term complexity.

## "But it's just a convenience layer"

Yes - and that's exactly the problem.

It’s a convenience layer that:

- Adds indirection
- Reduces clarity
- Interferes with tooling
- Encourages bad dependency habits

All without providing real architectural value.

## A better approach

Import from the actual module.

```typescript
import { formatDate } from "./formatDate.js";
```

It is not about saving a few characters.

It is about making dependencies explicit.

That gives you:

- Clear dependencies
- More reliable tree shaking
- Easier navigation
- A more maintainable structure

If something is truly a public API, expose it explicitly at the boundary - not through a blanket `export *`.

```typescript
// explicit public API
export { formatDate } from "./formatDate.js";
export { parseDate } from "./parseDate.js";
```

Even here, prefer explicitness over wildcards.

## Final thought

Barrel exports optimize for typing less.

Good code optimizes for clarity, explicit dependencies and predictable behavior.

Those goals are incompatible.
