---
title: "DevOps is a skill, not a role"
description: "DevOps should not be a ticket queue between product teams and production. It should be a skill every engineering team has enough of to own its product."
publishedAt: "2026-06-13T06:47:00+02:00"
updatedAt: "2026-09-18T22:43:00+02:00"
topic: "Architecture"
---

When a product team has to open a ticket for another department to deploy a routine change, a small release becomes a coordination task. The same dependency can appear when the team needs to change configuration, adjust an alert or investigate a failure.

DevOps was intended to [remove silos between development and operations](https://martinfowler.com/bliki/DevOpsCulture.html). Turning it into a separate team that receives finished code and takes over operations preserves that separation under a different name.

Product teams need enough operational knowledge to run what they build, with help from specialists where they need it. That is what I mean by DevOps as a skill: the team can deploy its software, understand how it behaves in production and respond when something goes wrong. It does not need to hand those responsibilities to another department.

## Ownership does not stop at merge

A feature is not done when the pull request is merged or the build turns green. The team still needs to deliver it, understand whether it behaves as expected in production and restore safe behavior when it does not.

That makes deployment configuration, monitoring, migrations and recovery paths part of engineering the product. A broken deployment can prevent a correct implementation from reaching users. Missing logs can leave the team unable to explain a failure. The instructions for recovering a service need to be available before an incident.

A product team does not need every engineer to be equally strong in operations. It does need enough shared knowledge to run its part of the system.

The team should understand how its product is deployed, which configuration matters, which metrics indicate user-facing problems and which alerts are worth waking people up for. It should be able to investigate an issue through its logs and dashboards, understand its recovery options and improve a deployment pipeline that makes delivery unnecessarily difficult.

Keeping deployments predictable and removing alerts that are not actionable are part of maintaining the product. They should not become someone else's problem simply because they involve different tools.

## What teams lose through handoffs

A dedicated DevOps team can begin as a practical response to real needs. Someone has to maintain the infrastructure and make deployments secure and repeatable. The difficulty starts when that team becomes responsible for running other teams applications as well.

The product team knows the application but may know little about how it runs. The operations team knows the runtime but may lack the context to decide whether the application's behavior is correct. To diagnose a failure, the two teams first have to combine what each knows. That takes time while users are already affected.

This is not about either team being careless. The work has been divided so that neither team has enough information to act alone.

There is also a cost to what engineers learn. A team that only requests deployments gets little practice diagnosing a failed release. A team that never investigates production problems has fewer opportunities to connect its code to the failures users experience.

When engineers deal with deployment failures and noisy alerts themselves, they can use what they learn to improve the application. A release that is difficult to diagnose gives them a reason to make smaller changes. An error message that explains nothing becomes something to fix. Planning a migration includes thinking about what a recovery action might do to stored data.

## Platform teams are still valuable

None of this requires every product team to build its own deployment platform, secret management, logging infrastructure and alerting system. Building those systems separately would duplicate maintenance and make consistent security harder.

A platform team should own the shared infrastructure and its reliability. It should provide secure defaults, reusable deployment mechanisms and operational tools that product teams can use without understanding every implementation detail underneath them. Infrastructure specialists, security engineers and site reliability engineers remain valuable partners in that work.

A shared monitoring service can collect metrics but the product team still needs to decide which ones describe meaningful failures. A deployment platform can run health checks but the product team needs to define what healthy means for its application.

These tools should let product teams carry out routine work themselves. A platform engineer should not have to edit application-specific configuration for every release or alert change. Specialists can still help with difficult problems and improve the shared tools.

## Deployment is part of the design

A system can have well-separated modules while every production change still depends on several teams coordinating a handoff. The code may be easy to change but the way teams divide the work makes it difficult to release. Choosing containers or a different continuous integration tool will not resolve that division of responsibility.

This is why architecture also needs to consider who can deploy a change, diagnose a failure and recover the application. As I argued in [Application performance is a product requirement](/blog/application-performance-is-a-product-requirement), technical decisions affect the product people actually use. Deployment and recovery do too: users wait longer for fixes when the team cannot release them or needs another department to restore the service.

## Ownership needs support

"You build it, you run it" should not mean that every engineer is left alone with production or that every team must invent its own operating model.

It requires reasonable on-call rotations, clear escalation paths, specialist support and incident processes that help people recover the system. It does not justify making exhaustion part of the job.

Ownership means accountability with the authority to improve the system. A team expected to respond to failures also needs the access, support and time to address their causes. Holding it responsible while every improvement waits in another department's queue leaves the original handoff in place.

A product team should be able to deploy its application, investigate failures and improve how it runs. Specialists can help it do that without taking those responsibilities away.
