---
title: "Write good Git commit messages"
description: "Good Git commit messages are not bureaucracy. They make history easier to read, debug, review and revert. Write them in the imperative mood."
publishedAt: "2026-05-16T09:16:00+02:00"
topic: "Git"
---

## Git history is part of the system

Most teams treat commit messages as a small detail.

Something you write quickly before pushing.
Something you clean up before a pull request.
Something that mostly exists because Git requires a message.

I think that is the wrong way to look at it.

A commit message is not only a label for a diff. It is part of the engineering history of the system.

It explains what changed. Ideally, it also hints at why the change exists.

That matters later.

Not during the happy path where everyone remembers the context. It matters when something breaks, when a release has to be reverted, when a regression appears, or when someone tries to understand why a strange edge case exists.

At that point, the commit message is no longer decoration.

It is debugging infrastructure.

## Good commit messages support future debugging

I already wrote about why [`git bisect` is one of Git's most underrated features](/blog/git-bisect-underrated-feature).

`git bisect` helps you find the exact change that introduced a behavior.

But finding the commit is only half of the story.

After Git tells you which commit introduced the regression, you still need to understand what that commit was supposed to do.

A message like this does not help much:

```text
fix stuff
```

Neither does this:

```text
changes
```

Or this:

```text
WIP
```

Those messages may have felt harmless when they were written. But later, during debugging, they are useless.

They force the next person to reconstruct intent from the diff alone.

Sometimes that next person is another engineer.
Sometimes it is you, three months later, with no memory of the original context.

That is why commit messages matter.

They reduce archaeology.

## Use the imperative mood

A good default is to write the commit subject in the imperative mood.

That means the message reads like an instruction:

```text
Add retry handling for failed uploads
```

Not:

```text
Added retry handling for failed uploads
```

And not:

```text
Adds retry handling for failed uploads
```

The common heuristic is simple:

```text
If applied, this commit will ...
```

So this works:

```text
If applied, this commit will add retry handling for failed uploads
```

This does not:

```text
If applied, this commit will added retry handling for failed uploads
```

And this also does not:

```text
If applied, this commit will adds retry handling for failed uploads
```

That may sound like grammar nitpicking.

It is not.

The imperative mood frames each commit as an operation on the codebase. It describes what applying the commit does.

That is exactly how Git history behaves.

A commit is not a diary entry. It is not primarily about what the author did yesterday.

It is a change that can be applied, reverted, cherry-picked, inspected and bisected.

The message should fit that model.

## The subject should say what changes

A commit subject should be specific enough to be useful in a log.

This is weak:

```text
Fix bug
```

This is better:

```text
Fix missing reconnect after token refresh
```

This is weak:

```text
Refactor code
```

This is better:

```text
Extract message retry state machine
```

This is weak:

```text
Update tests
```

This is better:

```text
Add regression test for reconnect timeout
```

The better versions are not much longer. But they carry much more information.

They tell the reader what area changed. They give the log a shape. They make scanning history easier.

That is the point.

A good commit message does not need to explain every line of the diff. The diff already shows that.

The subject should summarize the meaningful change.

## The body should explain why when the why matters

Not every commit needs a long body.

Some changes are obvious enough:

```text
Fix typo in settings label
```

There is no need to write a novel for that.

But some changes do need context.

Especially when the diff does not explain the decision by itself.

For example:

```text
Disable optimistic reconnect after auth failure

The reconnect loop kept retrying with an invalid token after the
session had already expired. That made the client appear connected for
a short time while every request failed.

Force the auth flow to refresh the session before reconnecting again.
```

That body is useful because it explains intent.

It says what problem existed. It says why the new behavior is safer. It gives future readers a starting point.

This becomes valuable when someone later asks:

Why do we do it this way?
Why did we not simply retry again?
Can this be reverted?
Is this related to the incident from last month?

A good commit body can answer those questions without searching Slack, Jira, pull request comments or someone's memory.

## Do not make the message repeat the diff

A bad commit message often describes the mechanics only:

```text
Change timeout from 5000 to 10000
```

That may be technically true. But it does not explain much.

The diff already shows that a number changed.

The more useful message is about intent:

```text
Increase reconnect timeout for slow mobile networks
```

Now the reader knows why the number changed.

That difference matters.

Code shows what changed. Commit messages should explain the meaningful change. Sometimes they should explain why the change exists.

They should not merely narrate the diff line by line.

## Good messages make reviews easier too

Commit messages are not only useful after merge.

They also improve review.

A pull request made of small commits with clear messages is easier to review than one large diff with vague history.

The reviewer can follow the sequence:

```text
Extract upload retry policy
Add retry limit for transient upload failures
Persist failed uploads before reconnect
Add regression test for duplicated upload retry
```

That tells a story.

First the structure changes. Then behavior changes. Then persistence changes. Then the regression is covered.

The reviewer still needs to read the code. But the commits provide orientation.

That orientation reduces cognitive load.

Without it, the reviewer has to build the story from scratch.

That is slower. It is also more error-prone.

## Conventional Commits optimize the wrong thing

I do not like [Conventional Commits](https://www.conventionalcommits.org/).

More directly: I think they usually bring no value to the part of Git history I care about.

They add a category.
They do not add intent.

And intent is the hard part.

This looks structured:

```text
fix: fix reconnect issue
```

But it is still a bad commit message.

The prefix did not explain which reconnect issue was fixed. It did not explain the behavior that changed. It did not help someone understand the commit during a regression investigation.

It only made a vague message look more official.

That is my main problem with Conventional Commits.

They make weak history look disciplined.

This is much better:

```text
Preserve draft message after reconnect
```

No prefix.
No taxonomy.
No artificial category.

Just a clear sentence that says what applying the commit does.

That is the information I care about when I read history.

A prefix can tell me that someone classified a change as a fix, a feature, a chore or a refactor.

But that is rarely the interesting part.

The interesting part is the intent:

Why does this change exist?
Which behavior changed?
Which assumption was wrong?
Which edge case is now handled?
What will break again if we revert this?

Conventional Commits do not answer those questions.

A good commit message can.

And if the subject is already good, the prefix is usually redundant.

```text
fix: Preserve draft message after reconnect
```

The useful part is still this:

```text
Preserve draft message after reconnect
```

The `fix:` prefix does not make it clearer.

It only adds noise before the part that matters.

In many codebases, the situation gets worse because teams start optimizing for the prefix instead of the message:

```text
chore: cleanup
```

```text
fix: bugfix
```

```text
refactor: refactor upload logic
```

That is not useful history.

That is vague history with a badge in front of it.

I would rather read one precise imperative sentence than a hundred correctly prefixed but meaningless commit subjects.

## Commits are not changelogs

The most common defense of Conventional Commits is changelog generation.

I think that is exactly where the abstraction goes wrong.

A changelog is product communication.

It should explain what changed from a user, business or domain perspective.

A commit is implementation history.

It explains one technical step in the journey towards that change.

Those are not the same thing.

The pull request title and description should explain the business and domain intent.

The reason this change matters outside of the local diff.

The commits should describe the technical path towards that result.

A pull request might say:

```text
Allow users to recover draft messages after reconnect
```

The commits might say:

```text
Extract draft persistence from composer state
Persist unsent draft before reconnect
Restore draft after session refresh
Add regression test for reconnect draft recovery
```

That is a useful separation.

The pull request explains what changed and why it matters.

The commits explain how the implementation moved towards that result.

Generating changelogs from commit prefixes mixes those layers.

It turns implementation steps into product communication.

That is how you end up with changelogs full of entries like this:

```text
fix: reconnect
refactor: composer state
chore: update tests
chore(deps): bump @types/node from 20.11.0 to 20.11.1
```

That may be easy to generate.

It is still bad communication.

A user does not care that we had a `refactor:` commit.

A product manager does not care that something was labeled `chore:`.

A support engineer does not need a taxonomy of internal implementation steps.

They need to know what changed, why it matters and whether it affects them.

That information usually belongs at pull request, release note or issue level.

Not in a commit prefix.

The commits should still be good.

But they should be good as commits.

They should preserve technical intent.

They should not pretend to be changelog entries.

## Small commits make good messages easier

Bad commit messages are often a symptom of bad commit shape.

When a commit changes twenty unrelated things, it becomes almost impossible to name well.

That is when messages become vague:

```text
Update app behavior
```

Or:

```text
Fix review comments
```

Or:

```text
Cleanup
```

The message is vague because the commit is vague.

Small, coherent commits are easier to name because they have one clear purpose.

If you cannot write a clear commit message, that is often a signal.

Maybe the commit does too much.
Maybe it mixes refactoring with behavior changes.
Maybe it combines formatting, tests, bug fixes and feature work in one step.

That does not only hurt the log.

It hurts review, rollback, cherry-picking, bisecting and debugging.

Again, this is not about Git aesthetics.

It is about operability.

This is also why atomic commits matter: not because small is automatically better, but because one clear change is easier to review, revert, bisect and explain.

## Avoid messages that only describe your workflow

Some commit messages describe the author's workflow instead of the change:

```text
Address PR feedback
```

```text
Fix tests
```

```text
Try again
```

```text
Final cleanup
```

Those messages may make sense in the moment. They rarely make sense later.

A future reader usually does not care that feedback was addressed. They care what changed because of that feedback.

So instead of this:

```text
Address PR feedback
```

Write this:

```text
Validate upload size before starting transfer
```

Instead of this:

```text
Fix tests
```

Write this:

```text
Update reconnect test for expired session state
```

Instead of this:

```text
Cleanup
```

Write this:

```text
Remove unused upload queue fallback
```

The commit message should describe the change in the product or codebase, not the temporary workflow around producing it.

## A simple checklist

Before committing, I like to ask a few questions.

Does the subject complete this sentence?

```text
If applied, this commit will ...
```

Does the subject describe the meaningful change?

Would the message still make sense in six months?

Would it help during `git bisect`?

Does the commit have one clear purpose?

Is there important context that belongs in the body?

That checklist is small. But it catches most weak messages.

It also forces a useful pause before adding another vague checkpoint to history.

## The goal is useful history

Good commit messages are not about sounding professional.

They are not about pleasing Git purists.

They are not about turning every commit into documentation theater.

They are about preserving intent at the moment where intent is cheapest to write down.

Later, that intent becomes expensive to recover.

A good Git history helps you review. It helps you debug. It helps you revert. It helps you understand why the system changed the way it did.

That is why the imperative mood is a good default.

It keeps the message focused on what the commit does to the codebase.

Not what the author did.
Not what Jira said.
Not what happened during the review.

What the commit does.

That is the information future readers need.

And future readers include you.
