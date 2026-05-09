---
title: "Developer experience is a performance feature"
description: "Optimizing developer experience often has a bigger long-term impact than optimizing rendering benchmarks or bundle size. Faster engineers build better software."
publishedAt: "2026-05-09T07:22:00+02:00"
topic: "Architecture"
---

## Many performance discussions optimize the wrong thing

Teams spend weeks improving rendering performance by a couple of milliseconds while engineers are afraid to touch the codebase.

Engineering discussions often focus heavily on:

- rendering benchmarks
- bundle size
- hydration speed
- unnecessary rerenders
- micro-optimizations

Performance matters.

But many teams optimize the wrong dimension.

A technically faster system does not automatically make the organization faster.

Especially when:

- testing is painful
- debugging is painful
- onboarding takes months
- deployments are stressful
- stack traces are unreadable
- nobody understands the abstractions anymore

In many organizations, the real bottleneck is not application performance.

It is engineering throughput.

## Performance is not only measured in milliseconds

I do not care if a framework rerenders slightly faster when:

- I cannot test it properly
- debugging becomes miserable
- the abstractions become impossible to reason about
- engineers constantly fight the tooling
- the architecture becomes harder to maintain

Testing browser-heavy frontend architectures often requires increasingly complicated environment simulation.

I wrote more about this problem in [Why you should not access browser globals directly](/blog/avoid-direct-browser-globals).

A system that is difficult to work with becomes slower overall.

The CPU might be faster.

The organization often is not.

Modern engineering marketing loves the phrase "blazing fast".

Usually measured in runtime benchmarks.

Rarely measured in debugging experience, maintainability or engineering confidence.

Performance is not only measured in milliseconds.

It is also measured in engineering throughput.

It is measured in:

- how fast engineers can **safely** deliver features
- how quickly bugs can be fixed
- how confidently refactorings can happen
- how easily new engineers can contribute
- how reliable deployments become

Long-term product quality usually reflects the engineering experience behind it.

## Developer experience compounds over time

Good developer experience is not only about "nice tooling".

It directly affects:

- delivery speed
- maintainability
- reliability
- onboarding
- incident response
- refactoring confidence
- engineering satisfaction

And these things compound over time.

A codebase that is easy to understand becomes easier to maintain.

A codebase that is easy to maintain becomes easier to optimize.

A codebase engineers are not afraid to touch evolves faster.

That matters more long-term than winning synthetic rendering benchmarks.

## The real bottleneck is often engineering confidence

I have seen teams spend enormous effort optimizing runtime performance while:

- the continuous integration pipeline took 30 minutes
- End-to-End tests were constantly flaky
- local development environments were unreliable
- deployments felt stressful
- engineers avoided refactoring because they did not trust the system

The rendering performance was not the bottleneck.

Engineering confidence was.

Fear slows everything down:

- feature delivery
- bug fixing
- refactoring
- incident response
- onboarding

Teams rarely optimize systems they are afraid to touch.

I wrote more about this in [Why your unit tests feel fragile](/blog/why-your-unit-tests-feel-fragile).

## Good developer experience often improves performance indirectly

Ironically, good developer experience often improves application performance anyway.

Because engineers are more willing to optimize systems they understand.

Clear architecture.
Deterministic behavior.
Reliable tooling.
Understandable state management.
Good observability.
Fast feedback loops.

All of these improve confidence.

And confidence enables improvement.

A system that is easier to reason about is usually easier to optimize later.

## Complexity has a cost

Many optimizations introduce hidden complexity.

Additional build steps.
Compiler magic.
Aggressive memoization.
Custom caching layers.
Framework-specific behavior.

Sometimes the performance gains are worth it.

Often they are not.

Especially when the tradeoff is:

- worse testability
- worse debugging
- worse maintainability
- higher cognitive load
- lower reliability

A system that is theoretically faster but harder to evolve often becomes slower for the business overall.

## Happy engineers build better software

This sounds simplistic, but in my experience it is true.

Happy engineers usually:

- care more
- experiment more
- improve systems proactively
- fix problems earlier
- collaborate better
- take ownership more naturally

Good developer experience reduces frustration.

And less frustration means more energy for solving actual customer problems instead of fighting the development environment.

Or in simpler words:

> happy engineer = happy customer

At least in my experience.

## Optimize for long-term engineering speed

As engineers, we should absolutely care about performance.

But we should optimize holistically.

Not only for runtime performance.

Also for:

- testability
- maintainability
- reliability
- observability
- clarity
- operational simplicity
- developer happiness

Because the fastest codebase is often the one engineers are not afraid to change.

And fast engineers usually build fast applications anyway.
