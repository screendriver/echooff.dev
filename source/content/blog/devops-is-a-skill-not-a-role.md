---
title: "DevOps is a skill, not a role"
description: "DevOps should not be a ticket queue between product teams and production. It should be a skill every engineering team has enough of to own its product."
publishedAt: "2026-06-13T06:47:00+02:00"
topic: "Architecture"
---

DevOps is one of those words that sounded useful, became popular, and then lost most of its meaning.

It was supposed to [remove silos between development and operations](https://martinfowler.com/bliki/DevOpsCulture.html).

In too many companies, it became another silo instead.

First, it became a job title.

Then it became a team.

Then it became a department.

Then it became the place where product teams send tickets when they want something deployed, configured, monitored or fixed in production.

That is not DevOps.

That is a handoff with better branding.

This is not an argument against platform engineers, infrastructure engineers or SREs.

Those skills matter.

It is an argument against turning DevOps into a handoff between the people who write the software and the people who operate it.

DevOps is not a role that sits between software engineering and production. DevOps is a skill that should exist inside every software engineering team that owns a product, a service, or a vertical slice of a system.

Not because every engineer needs to be an infrastructure expert.

Not because every team should reinvent deployment platforms.

But because a team cannot fully own software if it cannot deploy it, observe it, alert on it and recover it.

## Ownership does not stop at merge

A feature is not done when the pull request is merged.

It is not even done when the build is green.

It is done when it is running in production, behaves as expected, can be observed, and can be recovered when it does not.

That changes the responsibility of a software engineering team.

The team does not only own the code.

The team owns the behavior of the system.

And the behavior of the system includes deployment, configuration, metrics, logs, alerts, migrations, recovery paths and operational documentation.

If another team has to deploy it for you, you have a dependency.

If another team has to add the alert for you, you have a dependency.

If another team has to explain why your service is broken in production, you have a bigger problem.

## The problem with DevOps as a handoff

A dedicated DevOps team often starts with good intentions.

Someone needs to understand infrastructure.

Someone needs to keep the deployment platform alive.

Someone needs to make systems secure, repeatable and observable.

That is real work.

The problem starts when this team becomes the operational owner of other teams' products.

Then the product team writes code, but does not fully own deployment.

The DevOps team deploys code, but does not fully understand the product.

The product team receives bugs, but does not fully understand the runtime.

The DevOps team receives alerts, but does not fully understand whether the behavior is expected.

Nobody has the full picture.

Everybody has an excuse.

And the system gets slower.

Not because people are lazy.

Because the organization created a bottleneck and called it a process.

## DevOps as a team skill

A product team does not need every engineer to be equally strong in operations.

That is not realistic.

It is also not necessary.

But the team needs enough operational skill to own its slice end to end.

The team should understand how its product is deployed, which configuration matters, which metrics indicate user-facing problems, and which alerts are worth waking people up for.

It should be able to read its logs, investigate production issues, improve the deployment pipeline when the pipeline hurts delivery, and restore safe production behavior when something goes wrong.

It should keep deployment boring, own its dashboards, define meaningful alerts, and remove alerts that are not actionable.

The exact mechanism matters less than the ownership.

That is DevOps.

Not a person.

A capability.

## Platform teams are still valuable

This does not mean every product team should build its own Kubernetes setup, CI system, secret management, ingress configuration, logging stack and alerting infrastructure.

That would be wasteful.

It would also be dangerous.

There is still a clear place for platform engineering, infrastructure engineering, security engineering and site reliability engineering.

But the boundary matters.

A platform team should provide a paved road.

A product team should walk that road itself.

The platform team should own the shared platform, the primitives, the guardrails, the templates, the golden paths and the reliability of the underlying infrastructure.

The product team should own how its own product uses that platform.

That includes deployment configuration, health checks, dashboards, alerts, operational runbooks and production behavior.

The platform team should not become the team that turns product-team intent into YAML.

That is not leverage.

That is a translation layer.

The best platform teams reduce duplication, provide secure defaults, hide accidental complexity and increase autonomy.

They do not collect dependencies.

## The ticket queue is the smell

The smell is easy to recognize.

A product team wants to release something, change configuration, add an alert, or understand why production is broken, but needs to wait for another team.

At that point, the team does not own its software.

It owns a repository.

That is a much smaller thing.

Repositories are not products.

Running systems are products.

The more operational work is hidden behind ticket queues, the more teams lose feedback.

And feedback is the whole point.

When the same team that writes the code also sees the deployment pain, the alert noise and the production failures, the team starts making different technical decisions.

It deploys smaller changes.

It adds better validation.

It improves error messages.

It makes migrations safer.

It removes noisy alerts.

It stops treating production as somebody else's problem.

## This is an architecture topic

It is tempting to treat DevOps as tooling.

CI pipelines.

Containers.

Infrastructure as code.

Dashboards.

Cloud accounts.

Those things matter.

But the deeper topic is architecture.

Architecture is not only about modules, folders and dependency direction inside a repository.

Architecture is also about ownership boundaries.

Who can change something?

Who can deploy something?

Who knows when it is broken?

Who is responsible for recovery?

Who has the feedback loop?

A clean internal architecture helps a team change software safely.

A clean operational architecture helps a team run software safely.

Both matter.

This is close to the same idea I wrote about in [Application performance is a product requirement](/blog/application-performance-is-a-product-requirement): some topics look technical, but they directly shape the product experience.

Deployment and operations are the same.

Users do not care which team owns your pipeline.

They care whether the product works.

## The wrong split creates weak teams

When deployment, monitoring and alerting live outside the product team, the product team gets weaker over time.

It learns to optimize for the handoff.

It learns which tickets to create.

It learns which team to ask.

It learns how to wait.

That is not the same as learning how to own the system.

A strong engineering team should be able to reason from code to production.

From a user-facing bug to the service that caused it.

From an alert to the likely failure mode.

From a deployment to the risk it introduces.

From a recovery action to the data it may leave behind.

This does not happen when operational knowledge is somewhere else.

It happens when operational knowledge is part of normal engineering work.

## You build it, you run it needs nuance

`You build it, you run it` is a good principle.

But it is easy to apply badly.

It should not mean every developer is alone with production.

It should not mean every team invents its own operational model.

It should not mean people are burned out by bad on-call practices.

It should mean that product ownership includes operational ownership.

The team that creates the production behavior should be part of understanding and improving that behavior.

That can still happen with sane rotations, escalation paths, platform support and clear incident processes.

Ownership does not mean isolation.

Ownership means accountability with the authority to improve the system.

Without authority, accountability is just blame.

## DevOps is not about YAML

The hard part is not writing another pipeline file.

The hard part is closing the loop between change and consequence.

What happens after we merge?

What happens after we deploy?

How do we know it works?

How do we know it is broken?

Who reacts?

Who can fix it?

Who improves the system so the same problem becomes less likely next time?

Those questions cannot be outsourced to a role without losing important context.

They belong to the team that owns the product.

## Final thought

DevOps is a skill, not a role.

A company may still have platform engineers.

It may still have infrastructure specialists.

It may still have SREs.

That is fine.

But a product team should not need a separate DevOps department to deploy, monitor, alert on and recover its own software.

A team that cannot operate its product does not fully own its product.

It only owns the code before the handoff.

And handoffs are where speed, context and accountability go to die.
