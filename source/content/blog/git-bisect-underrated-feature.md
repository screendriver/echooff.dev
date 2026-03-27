---
title: "Why git bisect is one of Git's most underrated features"
description: "git bisect helps you find the commit that introduced a regression, but large squash merges remove the history that makes it truly effective."
publishedAt: "2026-03-27T16:46:00+01:00"
---

Most teams know `git bisect` exists.
Very few teams use it often.
And even fewer teams protect the kind of history that makes it truly effective.

That is a mistake.

For me, `git bisect` is one of the most underrated features in Git.
Not because it is obscure.
And not because it is complicated.

It is underrated because it solves a very expensive problem with a surprisingly simple idea:
when something broke, find the exact change that introduced it.

That matters much more than many teams seem to realize.

## Most regressions are history problems

A production issue appears.
A test that used to pass now fails.
A user flow became slower.
Something that worked last week is now broken.

At that point, many teams start debugging from the current state only.
They inspect the code as it exists today, guess where the problem might be, and work backwards through pull requests, Slack messages, dashboards, and assumptions.

That is often much slower than it should be.

A regression is usually not just a code problem.
It is a history problem.
Something changed between a known good state and a known bad state.
`git bisect` turns that into a search problem.

Instead of asking, "Where should I start looking?"
you ask, "Which change introduced the behavior?"

That is a much better question.

## What git bisect is good for

`git bisect` is useful whenever you can identify two points in history:

- one revision where the system was still good
- one revision where the system is definitely bad

That is enough.

From there Git performs a binary search through the commit history.
It checks out a commit in the middle.
You test it.
Then you mark it as good or bad.
Git repeats that process until it isolates the first bad commit.

That makes `git bisect` especially useful for:

- functional regressions
- failing tests that used to pass
- performance degradations
- broken build behavior
- subtle behavior changes that are hard to spot in a large diff

The important part is not only speed.
It is precision.

Without `git bisect`, you often end up reviewing a large range of commits and trying to build a narrative in your head.
With `git bisect`, Git narrows the search space for you.
After that, your job is no longer to find the needle in the haystack.
Your job is to understand why that specific needle exists.

## Why it stays underrated

I think `git bisect` is underrated because many engineers see Git mainly as a version control system.
They use it to branch, commit, rebase, merge, and push.

That is of course correct.
But it is incomplete.

Git is also an engineering database.
It stores decisions, sequencing, and causality.
And `git bisect` is one of the strongest tools for extracting value from that history.

The teams that benefit most from it usually have a few characteristics:

- they commit in small, coherent steps
- they keep the build and tests runnable
- they can identify a meaningful good and bad state
- they treat history as an operational asset, not just an audit trail

That is one reason I care so much about atomic commits and small pull requests.
They do not only help review.
They also improve your ability to debug reality later.

## A debugging tool is only as good as the history behind it

This is where many teams unintentionally destroy much of the value of `git bisect`.

They take a large pull request with many meaningful intermediate commits and squash the entire thing into one giant merge commit.

After that, the original sequence is gone.
The history no longer says:

- first we changed the state model
- then we moved data loading
- then we rewired caching
- then we adjusted retries
- then we fixed one edge case but introduced another

Instead, history says:

- "Implement new sync architecture"

That may look tidy in the log.
But for debugging, it is far worse.

Technically, `git bisect` still works after a squash merge.
But its resolution is now much worse.
Instead of identifying the exact logical step that introduced the regression, it often lands on one giant squashed commit containing all of them at once.

At that point, the binary search succeeded, but the engineering value collapsed.
You did not isolate the real change.
You isolated a large bag of changes.

That is why I think squash merging big pull requests destroys the purpose of `git bisect` in practice.
The whole point is to narrow down history efficiently until the answer becomes obvious or at least manageable.
If your merge strategy compresses many important steps into one opaque checkpoint, you remove that precision again.

You keep the mechanism.
You lose the payoff.

## Small squash merges are not the real problem

I am not arguing that every squash merge is always wrong.

If a pull request is tiny, self-contained, and effectively represents one logical change anyway, the damage is limited.
The problem is large squash merges.
Especially the ones that collapse days of work, many design decisions, and multiple behavioral changes into one commit.

That kind of history optimizes for a visually clean log at the expense of future operability.

I would not call that a good trade-off.

## Why this matters beyond the immediate fix

Good engineering is not only about fixing the immediate issue.
It is also about improving the system that allowed the issue to be expensive in the first place.

That includes source control practices.

When a team cannot efficiently answer, "Which change introduced this behavior?" the problem is not only in the codebase.
It is also in the way change moves through the system.

`git bisect` is one of those tools that exposes whether a team's delivery practices are helping or hurting them.

A history made of small, meaningful, reviewable changes supports:

- faster incident analysis
- more confident rollbacks
- clearer postmortems
- lower cognitive load during debugging

A history made of large squashed blobs works against all of that.

## A simple workflow

The basic workflow is small enough that every engineer on the team should know it.

```bash
git bisect start
git bisect bad
git bisect good <known-good-commit>
```

Git then checks out a midpoint commit.
You test it.

If that revision is good:

```bash
git bisect good
```

If it is bad:

```bash
git bisect bad
```

Repeat until Git identifies the first bad commit.
Then reset the repository state:

```bash
git bisect reset
```

This becomes even better when you can automate the check:

```bash
git bisect start
git bisect bad
git bisect good <known-good-commit>
git bisect run npm test
```

Or with a smaller and more targeted command:

```bash
git bisect run npm run test:login
```

The exact command does not matter.
What matters is having a fast and trustworthy signal.

That is another reason built-in quality matters so much.
Good tests do not only catch regressions earlier.
They also make tools like `git bisect` dramatically more effective.

## Clean history is not the same as useful history

Some teams value a very polished Git log.
I understand the motivation.
Nobody wants unreadable noise.

But a clean-looking history and a useful history are not always the same thing.

A useful history preserves causality.
It lets you understand how the system changed.
It helps you debug.
It helps you revert.
It helps you learn.

That usually comes from small commits with meaningful intent, not from compressing everything into the illusion of simplicity.

The best Git history is not the one that looks nicest in a screenshot.
It is the one that still helps when production is on fire.
