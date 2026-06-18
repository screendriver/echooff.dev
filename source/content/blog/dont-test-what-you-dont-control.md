---
title: "Don't test what you don't control"
description: "Integration and end-to-end tests become noisy when they depend on systems a team cannot make deterministic or act on. Test feature changes at owned boundaries, and treat live dependencies as system, vendor or monitoring signals."
publishedAt: "2026-06-19T18:55:00+02:00"
topic: "Testing"
---

Automated tests are supposed to create trust.

A red test should be actionable. It should tell a team that a change broke behavior the team cares about and can fix.

That signal only works when the test environment is controlled enough to make the failure meaningful. The moment a required test depends on a service the team cannot make deterministic, cannot observe properly, cannot reset, cannot configure and cannot act on, the signal becomes ambiguous.

Maybe our code is broken. But maybe another team redeployed a service, shared staging changed underneath us, a test account expired, a feature flag drifted, or some shared data was modified by a different test suite.

The test is red, but the team cannot fix the reason. That is not a good quality gate. It is organizational noise with a test runner around it.

This is not an argument against integration tests. It is not an argument against end-to-end tests either.

It is an argument against testing systems you do not control as if you control them.

And the important word here is **control**.

Control does not mean that your team wrote every line of code. No team controls the browser, the operating system, the cloud provider, the network or every library it uses.

Control means something more practical: can the team make the dependency predictable enough for this test, and can the team act when it fails?

## The problem is not integration testing

Integration tests are useful. End-to-end tests are useful. Testing real behavior across real boundaries is useful.

The problem starts when teams call something an integration test, but the test actually depends on half of the company being healthy at the same time. That may still be a valuable test, but it is a different kind of test. It should not have the same responsibility, cadence or ownership as a feature team's pull request checks.

A pull request test should answer a specific question: did this change break the behavior this team owns?

A company-level system test answers a different question: does this whole system landscape still work together right now?

A vendor integration test answers yet another question: does the real third-party service still behave in the way our product depends on?

Those questions are related, but they are not the same. When we confuse them, we create fragile pipelines, noisy teams and quality gates that people slowly stop trusting.

## Internal does not mean controlled

Inside a company, it is easy to assume that another service is under control because it is an internal service.

Often it is not.

If another team owns the service, deploys it independently, changes its test data, controls its feature flags and handles its incidents, then your team does not control that service in the context of a pull request check. The fact that both teams are on the same payroll does not make the dependency deterministic.

This is the organizational problem many teams run into. They are told to own features end to end, but the implementation depends on internal services, shared environments and cross-team state that they cannot operate independently.

The feature team becomes responsible for the red test, but not responsible for the thing that made it red.

That is the part I want to push against.

## Third-party does not automatically mean uncontrolled

The reverse is also true: a real third-party service can sometimes be more controlled than an internal service.

That sounds backwards, but it is common.

Imagine a team integrates with a managed OAuth provider. The provider is not built by the team. The team does not deploy it. The team cannot patch its production systems.

But the team may still own the provider decision, the tenant configuration, the test tenant, the contract, the escalation path, the SLA, the monitoring and the replacement decision. If that provider is flaky, the team has something to act on. It can change configuration, raise an incident with the vendor, use SLA data, negotiate, or eventually replace the provider.

In that situation, a real integration test against the provider can be useful. It may even become part of the product's monitoring strategy.

That is different from a feature team's pull request test depending on another internal team's unstable staging service without a clear ownership model. In that case the failure often creates no direct action. The team can ask in Slack, wait, retry, or temporarily ignore the failure.

That is not control. That is hope.

So the boundary is not internal versus external. It is not built by us versus built by someone else. The boundary is whether the dependency is deliberately owned, observable and actionable for the signal the test is supposed to produce.

## End-to-end ownership has borders

I have written before that [DevOps is a skill, not a role](/blog/devops-is-a-skill-not-a-role). I still believe that.

Teams should understand deployment, operations, monitoring, incident behavior and production impact. They should not throw code over a wall and pretend production is someone else's problem.

But end-to-end ownership does not mean unlimited ownership. A product team does not automatically own every service, every provider, every shared environment and every dependency in the company. A team owns what it can change, configure, deploy, observe, escalate or replace.

That is the border.

Tests should respect that border. The moment a required test crosses into a system the team cannot control for the purpose of that test, the test has changed category. It is no longer only a feature team test. It is a system test, vendor test, deployment check or monitoring signal.

That does not make it bad. It makes it different.

## Test behavior, not dependency availability

If your code talks to another service, you still need confidence. But confidence does not require every pull request to call the deployed service.

Imagine a team owns a web application and one backend service. A pull request changes the validation rules for a profile form. The end-to-end test opens the application, signs in through an internal identity service owned by another team, writes data through the team's service, calls another team's notification service and waits for a shared email provider.

The test fails.

Maybe the identity service is slow. Maybe the notification service was redeployed. Maybe the email provider accepted the request but delayed delivery. Maybe staging contains broken shared data.

None of that proves that the profile form change is wrong. The failure may describe a real problem in the overall system, but it is the wrong kind of red for that pull request.

At the boundary, test the behavior you own. Test the request you create, the response you accept, the error cases you handle, and the way your product behaves when the dependency says no, responds late or returns invalid data.

Those are your responsibilities. The live availability of another deployed service is usually not the right pull request signal.

That does not mean pretending the dependency does not exist. It means treating it as a boundary. Use a controlled replacement in feature tests. Make it return success, failure, timeout, invalid data and permission errors on purpose.

That is not fake confidence. That is testing the behavior your team owns.

This is the same reason [unit tests feel fragile](/blog/why-your-unit-tests-feel-fragile) when code mixes business logic and side effects. Unclear boundaries make tests weaker. Clear boundaries make failures useful.

## Put each signal at the right level

The solution is not to remove every test that touches another system. The solution is to put each test at the right level.

For pull requests, use controlled dependencies. Your application can still exercise the real code paths, but the systems behind the boundary should be deterministic. This is where you test success, failure, timeouts, invalid data, permission problems and fallback behavior.

For contracts, test the agreement. The consumer should prove which requests it sends and which responses it can handle. The provider should prove that it still supports that agreement. This catches integration drift without making every feature branch depend on a deployed shared environment.

For real third-party integrations, decide what signal you want. A scheduled test against a real vendor tenant can be valuable when the team owns the integration and has an SLA, escalation path and replacement option. In that case, the test is not only a correctness check. It is also evidence about vendor reliability.

But then treat it like that. Give it an owner. Alert the right people. Store enough information to make incidents and SLA conversations useful. Do not let it randomly block unrelated pull requests unless the failure really means the change under review is wrong.

For deployments, test the real wiring. A smoke test after deployment can call the real identity service, the real backend, the real queue and the real provider. If that fails, the failure is allowed to mean configuration, availability or wiring, because that is the signal the test was designed to produce.

For production, monitor the journey. Synthetic checks and alerts can tell the company whether important user flows still work in the real system. That is valuable, but it is operations feedback. It is not proof that one feature branch is correct.

This split keeps the signal honest. A feature test gives feedback to the feature team. A contract test protects an agreement. A vendor test checks a real external dependency. A deployment check verifies wiring. A production monitor watches the system as users experience it.

Those are all useful. They should not all block the same thing.

## Shared staging and retries are not a strategy

Many teams treat staging as if it automatically makes tests more realistic. Sometimes it does. Often it only makes them less deterministic.

Shared staging is mutable. Other teams deploy to it, test data changes, feature flags drift, background jobs run, accounts expire and queues contain old messages. A test running against shared staging does not only test your code. It tests staging.

That may be useful for exploration, release validation and smoke checks. But a shared environment is not automatically a good pull request gate. It is a much bigger and much noisier target than the change a reviewer is trying to validate.

This is why an internal staging service can be worse than a real third-party test tenant. The third-party tenant may have clear SLAs, stable configuration and an escalation path. The internal staging service may only have goodwill and a chat channel.

Do not confuse proximity with control.

Retries have the same problem. They can be useful when the issue is a temporary race, an asynchronous browser update or a small timing problem. They cannot turn an uncontrolled dependency into a deterministic test dependency.

When a test is flaky because it crosses too many ownership boundaries, retries usually hide the problem for a while. They do not solve it.

The better fix is to move the test boundary. Control the dependency in the feature test, move the real integration check to the right layer and make the signal explicit.

## Final thought

Do not test what you do not control as if you control it.

External systems matter. Internal services matter. Real integrations matter. Whole-company workflows matter. But they are not all the same kind of test.

A feature delivery team should test up to the boundary where it owns the behavior, the state and the failure modes. Beyond that boundary, the organization may still need tests, but they are system tests, contract tests, vendor tests, deployment checks or production monitors. They need their own ownership model and their own signal semantics.

Control is not about writing every dependency yourself. It is about making the signal actionable.

A red test should create clarity. When it only tells you that some other part of the company might be unhealthy, it is not a precise quality gate anymore.

It is a weather report.

Weather reports are useful. They should not block every code change.
