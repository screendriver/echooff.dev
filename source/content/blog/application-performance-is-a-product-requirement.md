---
title: "Application performance is a product requirement"
description: "Application performance is not something engineers can optimize in isolation. It is a product decision, a requirement and a trade-off that has to be made explicit."
publishedAt: "2026-05-10T09:10:00+02:00"
updatedAt: "2026-07-21T20:51:00+02:00"
topic: "Architecture"
---

In [Developer experience is a performance feature](/blog/developer-experience-is-a-performance-feature), I argued that the speed at which engineers can understand, test and safely change a system matters. A fast user interface does not compensate for a codebase in which every improvement is slow and risky.

The opposite is also true. A changeable codebase does not compensate for slow software.

Users experience loading, rendering, responsiveness, network delays and long-running operations directly. They do not care how safely the system can be changed when an important screen freezes or a primary workflow becomes unusable on the devices the product claims to support.

Developer experience and application performance are not opposites. A mature engineering organization has to care about both, but they are not the same kind of decision. Engineering owns the technical consequences; product owns the promise made to users.

**Application performance is a product requirement.**

## Blazing fast is not a requirement

Every product has performance needs, but not every product has the same needs. A drawing tool has different constraints than an admin dashboard. A payment flow has different expectations than a static marketing page. A video editor has to make different trade-offs than a settings screen.

The environment matters as well. Software used on old devices, unreliable networks and accounts containing years of data has different requirements than software demonstrated by three people on new laptops.

This is why "make it fast" is not a useful requirement. "Blazing fast" is not one either. It is a slogan until someone explains what must be fast, under which conditions and how much delay is acceptable.

A useful requirement is concrete enough to guide a decision:

- Loading a report with 10,000 rows must not block basic input.
- Filtering a large table must update the visible results within a defined time budget.
- Saving a form must not freeze the user interface while validation and network requests are running.
- The primary workflow must remain usable on the supported low-end device class.
- Background synchronization, import or export must not block navigation.

These statements still need engineering work before they become measurements, but they identify the behavior that matters. They give the team something to observe, test and discuss.

Without that clarity, performance discussions become taste, fear or folklore. One engineer worries about allocations. Another worries about bundle size. Someone else proposes a worker, a cache or a rewrite. All of them may have valid concerns, but nobody can decide whether the additional cost is justified because the product expectation was never made explicit.

## Product decides what fast enough means

Engineers can explain the consequences of a design. We can identify scaling limits, expose the complexity a choice introduces and show which choices make future optimization easier or harder. We can measure a user journey and explain why it behaves differently with 100 records than it does with 100,000. What we should not do is silently invent the product's performance requirements.

When a product needs to support large datasets, long-running sessions, slow machines or unreliable networks, that should be part of the requirement before the feature is considered complete. It should not arrive three months later as a surprise in a bug report, nor should engineers be expected to infer it from a vague promise of "quality."

That does not mean a product manager must choose a main-thread budget or understand browser scheduling. Product should name the journey, the users and the conditions that matter. Engineering can then translate that expectation into a measurement and explain the available trade-offs.

The work is shared, but the promise belongs to product.

That distinction matters because "fast enough" always has a cost. Reaching a lower latency may require additional implementation work, more infrastructure, less scope or additional complexity. Supporting a larger data set may change the architecture of the feature. Supporting weaker devices may rule out an otherwise attractive interaction. Engineering makes those consequences visible so that product can decide whether the result is worth the cost.

## Performance-aware design is not premature optimization

There is an important difference between [premature optimization](https://en.wikipedia.org/wiki/Program_optimization#When_to_optimize) and performance-aware design.

[YAGNI](https://en.wikipedia.org/wiki/You_aren%27t_gonna_need_it) remains useful. We should not build caches, worker abstractions or generalized processing platforms for imaginary workloads. We should not make every feature more complicated because it might need to scale one day.

But YAGNI does not mean ignoring a known requirement. Premature optimization does not mean waiting until users complain before discussing performance.

Premature optimization changes code before we know whether the improvement matters. Performance-aware design avoids choices that make an already known requirement prohibitively expensive or impossible to meet later.

That often has less to do with clever algorithms than with ordinary architecture. Expensive work should be isolated so it can be measured. Dependencies should be explicit so an implementation can be replaced. Side effects should not be hidden throughout the call hierarchy. External APIs and browser behavior should not leak into every part of the application.

This is where application performance connects back to developer experience. A codebase that is easy to change is usually easier to make faster because the team can locate the slow path, reproduce its behavior and replace one decision without disturbing everything around it.

That is also why topics such as [fragile unit tests](/blog/why-your-unit-tests-feel-fragile), [direct browser globals](/blog/avoid-direct-browser-globals) and [Clean Architecture](/blog/clean-architecture-protects-the-happy-zone) are relevant to performance. They are not isolated preferences about code style. They determine whether the team can respond when a real performance requirement becomes visible.

Good developer experience does not make application performance irrelevant. It makes application performance changeable.

## Performance without changeability becomes expensive

Optimization is not free. It introduces assumptions about data size, access patterns, device capabilities, concurrency and the behavior of surrounding systems. Some of those assumptions are necessary. The problem begins when they are hidden inside code that nobody can safely change.

An implementation may reduce allocations and still obscure the business rule. A custom cache may improve one benchmark while making invalidation failures much harder to understand. A tightly coupled rendering optimization may make today's screen faster while turning the next product change into a system-wide negotiation.

The benchmark can be correct and the design can still be too expensive. This is not an argument against sophisticated performance work. Some problems are genuinely difficult and require specialized solutions. But the reason for the complexity, the behavior it protects and the measurement that justified it should remain visible.

This connects to a point I explore in [Boring code is a feature](/blog/boring-code-is-a-feature): complexity is a budget. Performance may be exactly where some of that budget should be spent. Spending it deliberately is different from allowing an optimization to become a private mechanism that only its author understands.

Fast code that cannot adapt has only moved the cost. The current workflow may be quick, but every future change pays for the assumptions that were embedded in it.

The useful question is therefore not whether we should optimize for change or for performance. It is which product behavior must be fast, and how we can meet that requirement without destroying our ability to change the system when the product evolves.

## A performance budget is an agreement

A performance budget is more than a frontend metric. It is an agreement that a particular user journey matters enough for the organization to spend engineering effort, complexity and possibly product scope on it.

Product identifies the journey and the conditions that matter. Engineering decides how to measure them and explains the technical options. Together, product and engineering agree on an acceptable threshold. When meeting that threshold has a meaningful cost, product decides whether that cost is justified.

This is why a performance budget cannot belong to engineering alone. The work competes with feature development, reliability, accessibility, security, refactoring and support for edge cases. Improving one threshold may be valuable, but it is never free of opportunity cost.

Pretending that performance is always the highest priority is not serious engineering. Pretending that it does not matter until users complain is not serious product work.

A shared budget prevents both mistakes. It turns an abstract desire for speed into a visible product decision. It also gives engineering a boundary. Once the agreed behavior is met, further optimization needs new evidence rather than personal preference.

The budget may change as the product changes. Data grows, supported devices change and previously secondary workflows become central. That is normal. A performance requirement is not a permanent truth about the codebase. It is a current promise about the product.

## Engineering must make the trade-off visible

Engineers should not wait silently for a perfect requirement. We should recognize technical consequences early and express them in language that product can act on.

When we know that a design will not scale to the expected data size, we should say it. When a shortcut will hurt responsiveness or make later optimization disproportionately expensive, we should explain that before the decision becomes difficult to reverse.

But we should describe a trade-off, not issue an absolute technical verdict. A useful statement sounds like this:

> This approach is probably fine for small datasets, but it will block the main thread for large datasets. If large datasets are part of the product requirement, we should solve that now. If they are not, we can accept the limitation and make it visible.

That statement does not invent a requirement. It exposes a decision.

It gives product a concrete choice and gives engineering a clear boundary. If the larger workload matters, the team can spend the necessary effort deliberately. If it does not, the team can choose the simpler implementation without pretending that it has no limits.

The responsibility of engineering is not to optimize everything. It is to ensure that important consequences are not hidden.

## Application performance is product quality

Developer experience determines how safely and quickly a product can change. Application performance determines how the product behaves for the people using it now.

A product can fail in both directions. It can be responsive today but too rigid to improve tomorrow, or easy to change while remaining painfully slow for the people using it.

Both application performance and changeability matter. Treating either one as a universal default makes the other an afterthought.

**Application performance is a product decision. It is also a product requirement.**

Product must define the experience it promises. Engineering must make the cost and consequences visible, then build a system capable of meeting that promise.

Changeability is what allows us to meet it repeatedly without turning the codebase into concrete.
