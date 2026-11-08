---
title: "Feature flags separate deployment from release"
description: "Use feature flags to deploy incrementally, test with internal users and release gradually while keeping a way to disable new behavior."
publishedAt: "2026-11-08T19:47:00+01:00"
topic: "Architecture"
---

A feature can be safe to deploy before it is ready for everyone to use. It might still need feedback from internal users, or the product team might want to introduce it to a few customers first. If deploying the code immediately enables it for everyone those decisions become tied to the deployment pipeline.

Feature flags, also called [feature toggles](https://martinfowler.com/articles/feature-toggles.html), let the application choose whether a feature is available or which implementation to use. With runtime configuration, that choice can change independently of deploying the code.

My default is to put new user-facing features behind a flag from the first change. I want control over who gets a feature and a way to disable it while we establish that it works in production.

## Separate deployment from release

Deployment puts a version of the application into production. Release makes a feature available to its intended users. These can happen at different times and a release can reach different groups gradually.

In continuous deployment changes move into production automatically after passing the delivery pipeline's checks. That does not require every new capability to become available immediately. A feature flag allows the code to be deployed while the feature remains disabled for most users.

This makes continuous deployment practical when product releases need a different schedule. Engineers can integrate and deploy changes without waiting for launch preparation. The people responsible for the product can choose the initial audience and release timing without requesting another application deployment.

The deployment pipeline should not make those product decisions implicitly. Merging a change should not accidentally determine when customers encounter it.

That still requires collaboration. Engineering needs to establish technical readiness and safe operating limits. Product needs to decide who should receive the feature and what a successful introduction looks like. Both need to understand what happens if the rollout stops. Engineers also need the authority to disable harmful behavior during an incident.

This is consistent with [owning the software we run](https://www.echooff.dev/blog/devops-is-a-skill-not-a-role). Feature flags remove a scheduling dependency while keeping responsibility for the product with the team.

## Build the feature in small steps

A feature that takes several weeks to build should not require several weeks of isolation on a branch. A flag can keep the unfinished behavior unavailable while the implementation is integrated through small changes. Each change can be reviewed and verified alongside the rest of the application.

The application must remain safe to deploy at every step. Disabling a feature does not protect against a broken module import or an incompatible database migration. Changes to shared code can still affect users who never receive the feature.

Flags also do not make a large hidden rewrite incremental. Martin Fowler [recommends splitting work into smaller releases before using release flags to hide unfinished features](https://martinfowler.com/bliki/FeatureFlag.html). I want small releases and control over who receives each new capability. A small feature can benefit from an internal beta and a gradual rollout too.

## Start with a smaller audience

An internal beta lets selected people use a feature in production before it reaches customers. They exercise the deployed application with its real integrations and operating conditions. This is one reason I prefer to maintain a single deployed application environment: production. Feature flags let us introduce new behavior there while controlling who can use it.

Automated tests verify the expected behavior locally and in CI before deployment. Internal users then provide additional feedback on the deployed feature but their accounts and habits may differ considerably from those of customers. A successful internal beta is a reason to widen the audience carefully.

The next step might be an invited customer group or a small percentage of eligible accounts. The relevant unit depends on the feature. For a shared workspace, enabling it for the whole organization may make more sense than giving colleagues different behavior.

That selection should remain consistent across requests. A user should not move between the old and new experience whenever they refresh. Stable targeting also makes problems easier to reproduce because the team can establish which behavior an affected account received.

Before widening the rollout decide what evidence would justify it. For a new reporting feature that could include generation failures, response times and whether users can obtain the reports they need. Those observations need to distinguish the new behavior from the existing one. An application-wide error rate can hide a regression affecting a small group.

Increasing a percentage on a timer provides little confidence on its own. The value comes from learning while the audience is limited and being able to pause when the results are poor or unclear.

## Keep a working way to turn it off

If a feature causes problems, disabling it can restore the previous behavior without rolling back the entire application. Unrelated fixes stay deployed while the team investigates. For a new capability without a predecessor the fallback may be making that capability unavailable temporarily.

That is the practical value of a kill switch but it depends on how the flag works. A value compiled into a build cannot provide an independent runtime control. Changes must reach running instances quickly enough to be useful. A browser that only reads its configuration at startup may keep using the feature until it reloads.

The team needs to know how long a change takes to propagate and what happens when flag evaluation fails. Choose a fallback deliberately and verify it. Keeping cached configuration can preserve availability during an outage but it can also delay an emergency disablement. These choices are part of operating the application.

Turning a flag off also has limits. It does not undo data already written or automatically cancel work already running. If the new implementation writes a format the previous implementation cannot read, selecting the previous implementation may create another failure. Compatibility and data recovery need their own design.

The control must cover the behavior it claims to stop. Hiding a button is insufficient if the corresponding operation remains available through an API. Server-side authorization must also remain effective regardless of any client-side flag value.

Treat flag changes as production changes. The appropriate people need access and the team needs a record of what changed and when. Otherwise a rollout can alter application behavior without leaving enough information to explain a subsequent failure.

## Keep flag decisions contained

Feature flags become expensive when their names and checks spread throughout the application. Business rules start depending on rollout configuration and removing a flag requires finding every place where it changed behavior.

I prefer to evaluate the flag where the application chooses which behavior to use. For example, when replacing a report generator, a request handler can check the flag and call either the existing generator or the new one. Neither generator needs to know about the flag or the rollout rules. Their tests can focus on the reports they produce without configuring a flag service.

[OpenFeature](https://openfeature.dev) provides a standard API and SDKs for evaluating flags through different providers. It can keep application integration independent of a particular flag management product. The underlying provider still supplies the evaluation mechanism; `OpenFeature` does not itself provide a complete management service. Changing providers may also require migrating configuration and checking targeting behavior.

Tests should cover the enabled and disabled behavior, including the fallback we expect to use during an incident. Check that the relevant entry points honor the decision and test interactions between flags where their features actually depend on each other. Keeping the decisions contained makes those tests easier to write without replacing modules or depending on a live flag service.

## Remove temporary flags

A release flag should have an owner and a condition for removal when it is introduced. Once the feature is established and the fallback is no longer needed remove the flag checks and obsolete implementation. Keep tests for the behavior that remains.

Deleting a flag from a dashboard is not enough. Code that still evaluates it may fall back to a default, possibly restoring behavior the team thought it had retired. Remove the dependency from the application code first, then retire the configuration when supported versions no longer need it.

Some operational controls deserve a longer life. A switch that disables an expensive optional operation during an outage can remain useful long after release. Keeping it is a deliberate commitment to maintain and test both behaviors.
