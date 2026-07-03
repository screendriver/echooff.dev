---
title: "Bugs are not backlog items"
description: "A zero bug policy is not about perfect software. It is about refusing to normalize known broken product behavior."
publishedAt: "2026-07-03T16:48:00+02:00"
topic: "Architecture"
---

Every product team says it cares about users.

Then a user reports that the product is broken.

The report becomes a ticket. The ticket gets a label. The label gets a priority. Someone asks whether it is really critical. Someone else asks whether it can be downgraded.

Eventually the conversation is no longer about the user who is affected by the defect.

It is about the ticket.

That is not user-centric development.

That is process around brokenness.

A bug backlog can look responsible from the outside. It gives the organization a place to collect defects. It creates visibility. It creates numbers. It gives people something to sort, filter, triage and report on.

But it also creates a comfortable place for known broken product behavior to live.

That is the part we should be more honest about.

## Zero bug policy is not about perfection

A zero bug policy sounds unrealistic.

It sounds like pretending that software can be perfect.

It sounds like a slogan that survives exactly until the first real production issue.

That is not what I mean.

Bugs happen. They happen because software is complex, requirements are incomplete, users do surprising things, integrations fail in creative ways and production is always more interesting than a local development environment.

A zero bug policy does not mean that bugs never exist.

It means that known user-impacting bugs are not normalized.

When released software is broken for users, fixing that broken behavior becomes the work. Not eventually. Not after it has aged in a backlog for three quarters. Not when someone finds time between roadmap items.

**Now.**

That does not mean panic. It does not mean every engineer drops everything in the same second. It means the organization treats a known bug as product work that has already failed the user, not as an optional improvement competing politely with new features.

A zero bug policy is not a promise that the product will never break.

It is a promise that the team will not build a culture where known brokenness is accepted as normal.

## A bug is not a priority class

A bug definition should not contain priority.

A bug definition should not contain severity.

A bug is not critical, major, minor or low priority. A bug is released behavior that harms users because the product does not do what it should do.

That is enough.

Severity can still be useful for incident response. It can help with escalation, communication, support expectations and operational urgency. If users cannot log in, if data is lost, if payments fail or if a whole product area is unavailable, we need a fast and visible response.

But severity does not define whether something is a bug.

The first question should be much simpler:

Did the product break its promise to users?

If yes, it is a bug.

If no, we should stop calling it a bug.

Maybe it is a missing feature. Maybe it is a known limitation. Maybe it is a product decision. Maybe it is internal technical debt. Maybe it is something that would make the product nicer, but the product never promised to do it.

Those things can still be important.

But they are not bugs.

This is not wordplay. Language changes how an organization behaves.

When we call something a low priority bug, we usually mean one of two things.

Either it is not really a bug.

Or it is a bug, and we are okay with users living with broken behavior.

Both cases deserve more honest words.

The same applies to the phrase "critical bug". It often mixes two different conversations. One conversation is about correctness. Does the product behave as expected for users? The other conversation is about urgency. How quickly do we need to respond operationally?

Those conversations are related, but they are not the same.

A broken checkout flow is urgent because users cannot buy. A data-loss issue is urgent because users lose trust. An outage is urgent because the product is not available.

Those cases need escalation and communication, but they are not important because a ticket says critical.

They are important because users are harmed right now.

The label should not be the reason we care.

The user impact should be the reason we care.

## A bug backlog hides ownership

There should not be one large bug backlog.

A single bug backlog looks organized, but often it creates the opposite of ownership. The bug exists. Someone reported it. Someone triaged it. Someone added labels. Someone moved it to the backlog.

And now nobody owns it.

The owning team should own the bug.

If a team owns a feature, it owns the defects in that feature. If a team owns a service, it owns the defects in that service. If a team owns a user journey, it owns the defects in that journey.

There can still be intake. There can still be support triage. There can still be a short-lived queue for incoming reports that need clarification. Not every report is immediately actionable, and not every report is even correct.

But there should not be a comfortable long-term home for known user-impacting defects.

A bug backlog should feel like a fire alarm that did not stop ringing.

Not like a normal part of product planning.

Once a bug is understood, it should move to the team that owns the affected area. From there, the decision should be explicit: fix it, or decide that it is not a bug.

Leaving it in a generic backlog is the worst of both worlds. The organization keeps the emotional benefit of saying "we know about it", but the user still lives with the broken product.

## The hard part is the definition

A zero bug policy only works when the definition is strict.

Otherwise everything becomes a bug.

And when everything is a bug, nothing is a bug.

A missing feature is not automatically a bug. If the product never promised to export data in a certain format, the absence of that export is not broken behavior. It may be valuable. It may even be the next most important thing to build. But it is not a defect.

A known limitation is not automatically a bug. If the product clearly supports files up to a certain size, larger files failing is not the product breaking its promise. It may still be frustrating. It may still be worth improving. But it is not the same as released behavior failing unexpectedly.

Technical debt is not automatically a bug either. Messy code, bad boundaries, weak tests and poor observability can slow down a team dramatically. They can also create future bugs. But if users are not directly affected yet, the conversation should be about maintainability, risk and product debt, not about a user-facing bug.

That does not make those things unimportant.

It makes the conversation more precise.

A bug is when the released product breaks its promise to users.

That definition is narrow on purpose.

It protects the zero bug policy from becoming a vague "everything is urgent" policy. It also protects engineering work from being hidden behind fake bug language. If something is technical debt, call it technical debt. If something is a missing feature, call it a missing feature. If something is an accepted product limitation, say so.

And if something is a bug, fix it.

## The home version

At home this is obvious.

I have something that you could call a small zero bug policy at home. Not because nothing ever breaks. Things break all the time. The house is not perfect, the garden is not perfect and my own todo list is definitely not perfect.

But when the front door does not close, I do not create a household backlog and prioritize it behind buying a nicer lamp.

When the dishwasher leaks, I do not label it as a minor household bug and revisit it next quarter.

When the internet connection is broken, it becomes the work.

Not because those things are fun.

Because broken things make every other thing worse.

Software should not get a special exception just because Jira, Linear or GitHub Issues make it easy to hide brokenness in a list.

A broken thing that affects daily use should not become part of the furniture.

## User-centric development starts with the current product

User-centric development does not start with the roadmap.

It starts with the current product.

Before we ask what new thing we can build, we should ask whether the existing thing works. Not only in the happy path demo. Not only on the developer machine. Not only for the newest customer with the cleanest setup.

For real users in production.

A product that keeps adding features while known defects stay open is not moving fast for users. It is moving fast around users.

There is a difference.

Users do not experience your roadmap. They experience your product. If the product is broken, the next feature does not magically make it less broken. It only adds more surface area on top of behavior that already cannot be trusted.

That is why zero bug policy is not anti-product.

It is product work.

It protects the promise the product already made.

I wrote before that [application performance is a product requirement](/blog/application-performance-is-a-product-requirement). Bugs are the same kind of decision. Engineering can explain the cause, the risk, the effort and the possible fixes. But deciding whether the product is allowed to stay broken is a product-quality decision.

And in a healthy product culture, the default answer should be no.

## It increases velocity and protects maintainability

Many teams think that fixing bugs immediately slows them down.

Sometimes it does in the very short term.

A team may need to pause feature work. A planned change may need to wait. Someone may need to investigate something uncomfortable instead of continuing with planned work.

But the alternative is usually more expensive.

A bug backlog creates drag. Every planning meeting has to look at it. Every support escalation needs context. Every new feature needs to avoid, tolerate or work around old broken behavior. Every engineer needs to remember which broken parts are expected and which broken parts are new.

The product becomes harder to reason about.

The codebase becomes harder to change.

The team loses confidence.

Releases become more stressful.

At some point, the team spends more time managing the consequences of known bugs than it would have spent fixing them when they were small.

That is not velocity.

That is delayed cost.

Known bugs also have a habit of turning into technical debt. A workaround gets added. Then another one. Then a test gets adjusted to match the broken behavior. Then a support article explains the limitation. Then a new feature accidentally depends on the defect.

After a while, fixing the original bug is no longer a small correction. It is a migration.

The system learned to live with the bug.

This is why fixing bugs quickly is also a maintainability practice. It prevents accidental architecture. It prevents defensive workarounds. It prevents teams from building new product behavior on top of broken assumptions.

A known bug is not just a ticket.

It is a distortion field around the product.

## What this requires

A zero bug policy is easy to write down and hard to practice.

It requires ownership first. The team that ships the product owns the quality of the product. Not QA. Not support. Not a central triage group. Those groups can help, but they cannot own quality for a team that does not own it itself.

This is the same reason [DevOps is a skill, not a role](/blog/devops-is-a-skill-not-a-role). If a team owns a product, it also owns what happens after the product reaches users. Production defects are not someone else's queue. They are part of product ownership.

A zero bug policy also requires small changes. Large releases create large unknowns. Small changes make defects easier to understand, easier to isolate and easier to fix with confidence. Clear commits help here too, not because Git history is beautiful by itself, but because one clear change is easier to review, bisect and explain. That is the same idea behind [good Git commit messages](/blog/write-good-git-commit-messages).

Observability matters for the same reason. A bug report should not be the first time a team learns how the product behaves in production. Logs, metrics, traces, errors, support reports and user feedback are all part of the same feedback loop. The faster the team can understand what happened, the faster it can restore the product promise.

Feature flags matter too. Sometimes the first correction is not the final code fix. It is disabling the broken path, reducing the blast radius or shipping the next small corrective change. In continuous delivery, recovery should feel like moving forward with control, not freezing the system until everyone feels safe again.

And finally, it requires product discipline.

The organization has to be willing to say one of two things.

This is a bug, and we fix it.

Or this is not a bug, and we intentionally accept the behavior.

Both answers can be valid.

The invalid state is calling something a bug and then letting it live forever.

## Final thought

A bug backlog is not a sign of mature planning.

It is often a list of known ways the product is broken.

That does not mean every complaint is a bug. It does not mean every improvement request is urgent. It does not mean software can be perfect.

It means we should be honest.

If released behavior harms users because the product does not do what it should do, it is a bug.

And if it is a bug, it should not compete with roadmap work like a normal backlog item.

It should be fixed.

Because users do not care whether broken behavior was critical, major, minor or low priority.

They only know that the product did not work.
