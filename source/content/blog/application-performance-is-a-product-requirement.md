---
title: "Application performance is a product requirement"
description: "Application performance is not something engineers can optimize in isolation. It is a product decision, a requirement and a trade-off that has to be made explicit."
publishedAt: "2026-05-10T09:10:00+02:00"
topic: "Architecture"
---

## This is a follow-up

In my previous post, [Developer experience is a performance feature](/blog/developer-experience-is-a-performance-feature), I argued that optimizing for change often matters more than optimizing rendering benchmarks, bundle size or another few milliseconds in isolation.

This post looks at the other side of that argument.

Application performance matters.

Developer experience matters. But it does not make slow software acceptable.

Rendering performance, network performance, responsiveness and bundle size still matter.

Developer experience and application performance are not opposites.

You can care about both.

You have to care about both.

But they are not the same kind of decision.

Developer experience is mostly an engineering responsibility.

Application performance is also an engineering responsibility, but it is not only an engineering responsibility.

**Application performance is a product decision.**

Without any doubt.

It is a requirement.

It is a trade-off that has to be named before engineers can optimize for it in a meaningful way.

## Blazing fast is not a requirement

Every product has performance needs.

But not every product has the same performance needs.

A drawing tool has different performance requirements than an admin dashboard.

A payment flow has different performance requirements than a static marketing page.

A video editor has different performance requirements than a settings screen.

A product used on slow devices, bad networks and large accounts has different performance requirements than a product used by three people in a demo environment on brand new laptops.

This is why "make it fast" is not a requirement.

"Blazing fast" is not a requirement either.

It is a slogan.

A requirement is more concrete:

- Loading a report with 10,000 rows must not block basic input.
- Filtering a large table must return useful feedback within a defined time budget.
- Saving a form must not freeze the user interface while validation and server requests are running.
- The primary workflow must stay usable on the supported low-end device class.
- Background synchronization, import or export must not block navigation.

Now engineering can work with it.

Now we can measure it.

Now we can test it.

Now we can decide whether a solution is good enough or not.

Without that, performance discussions easily become taste, fear or folklore.

## Product decides what fast enough means

Engineers can explain consequences.

Engineers can explain implementation cost.

Engineers can explain risk.

Engineers can explain which design choices make future optimization easier or harder.

But engineers should not silently invent the product's performance requirements.

If a product needs to support large datasets, long-running sessions, slow machines or unreliable networks, that needs to be a product requirement.

Not a surprise discovered after the feature is already shipped.

Not something hidden in a bug report three months later.

Not something engineers are expected to magically infer from the word "quality".

Performance is part of the product experience.

Bad performance is not only a technical problem.

It is a product problem.

That means product needs to decide what level of performance matters for which user journey.

Engineering then needs to make the cost visible.

## Optimizing early and designing for performance are different things

There is a difference between [premature optimization](https://en.wikipedia.org/wiki/Program_optimization#When_to_optimize) and performance-aware design.

[YAGNI](https://en.wikipedia.org/wiki/You_aren%27t_gonna_need_it) is still a useful principle.

Do not build for imaginary performance needs.

Do not turn every feature into a platform before there is a real requirement.

But YAGNI does not mean "ignore known requirements".

And premature optimization does not mean "never talk about performance until users complain".

Premature optimization is when we optimize code before we know whether it matters.

Performance-aware design is when we avoid choices that make necessary performance impossible later.

Those are not the same thing.

A codebase that is easy to change can often become faster later.

A codebase that is tangled, implicit and full of hidden side effects is hard to optimize because nobody knows where the cost actually comes from.

That is the connection to developer experience.

Good developer experience does not mean we ignore application performance.

Good developer experience means we can improve application performance without being terrified of the codebase.

It means we can isolate slow paths.

It means we can measure real user journeys.

It means we can refactor safely.

It means we can replace one implementation with another because dependencies are explicit and behavior is testable.

This is also why I keep writing about topics like [fragile unit tests](/blog/why-your-unit-tests-feel-fragile) and [avoiding direct browser globals](/blog/avoid-direct-browser-globals).

These are not isolated opinions about code style.

They are about changeability.

And changeability is what gives us the ability to respond when product performance requirements become clear.

## Performance without changeability gets expensive

Highly optimized code can be great.

It can also become a trap.

If a piece of code is fast but nobody can change it safely, the team has only moved the cost somewhere else.

Maybe the current feature is fast.

But the next feature becomes risky.

Maybe the current path avoids allocations.

But the next engineer cannot understand the assumptions.

Maybe a clever optimization wins a benchmark.

But the product requirement changes and now the code is too rigid to adapt.

Performance is valuable when it supports the product.

It is less valuable when it makes the product harder to evolve.

This is why the useful question is not:

Should we optimize for change or performance?

The useful question is:

What product behavior must be fast, and how do we design the system so that this performance can be achieved without destroying our ability to change it?

## Performance budgets should belong to product and engineering

A performance budget is not only a frontend metric.

It is an agreement.

It says: this user journey matters enough that we are willing to spend engineering effort, complexity budget and product scope on it.

That agreement should be shared between product and engineering.

For example:

- Product defines the user journey that matters.
- Engineering defines what needs to be measured.
- Product and engineering agree on the acceptable threshold.
- Engineering explains the trade-offs.
- Product decides whether the cost is worth it.

That last part matters.

Because performance work always competes with something else.

It competes with features.

It competes with reliability work.

It competes with accessibility.

It competes with security.

It competes with refactoring.

It competes with support for edge cases.

Pretending that performance is always the highest priority is not serious engineering.

Pretending that performance does not matter until users complain is not serious product work.

## Engineers should not hide the trade-off

Engineering still has responsibility here.

We should not wait until product writes a perfect requirement before we say anything.

If we know that a design will not scale to the expected data size, we should say it.

If we know that a feature will hurt responsiveness, we should say it.

If we know that a shortcut will make later optimization painful, we should say it.

But we should say it as a trade-off.

Not as an absolute rule.

Not as "this is bad engineering".

Not as "we need to rewrite everything".

A useful engineering statement sounds more like this:

"This approach is probably fine for small datasets, but it will block the main thread for large datasets. If large datasets are part of the product requirement, we should solve that now. If not, we can accept the limitation and make it visible."

That is a much better discussion.

It turns performance from an opinion into a decision.

## Application performance is part of product quality

Developer experience is a performance feature because slow teams produce slow product learning.

If every change is risky, the product gets slower to evolve.

If every test is fragile, the product gets slower to improve.

If every local feedback loop is painful, the product gets slower to fix.

But application performance is also product quality.

Users do not care that the codebase is beautifully changeable if the product freezes every time they open an important screen.

They also do not care that a microbenchmark looks great if the product never improves because every change takes forever.

Both things matter.

The mistake is treating one as a universal default and the other as an afterthought.

## The better framing

So yes, optimize for change.

But do not use that as an excuse to ignore application performance.

And yes, optimize application performance.

But do not use that as an excuse to make the system impossible to change.

The better framing is this:

**Application performance is a product decision.**

It is also a product requirement.

Changeability is what allows engineering to meet that requirement repeatedly without turning the codebase into concrete.
