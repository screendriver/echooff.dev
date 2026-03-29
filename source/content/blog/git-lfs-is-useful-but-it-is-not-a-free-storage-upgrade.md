---
title: "Git LFS is useful, but it is not a free storage upgrade"
description: "Git LFS solves a real problem for large binary files, but it also adds workflow and operational complexity that teams should adopt intentionally."
publishedAt: "2026-03-29T12:38:00+02:00"
---

Git is excellent at tracking text.

It is much less impressive once a repository starts collecting large binary files that change over time.

Images, videos, archives, design files, machine learning models and other binary artifacts can make a repository slower to clone, heavier to fetch, and harder to work with.
And unlike source code, Git cannot efficiently represent changes inside most binary files.
A small visual change in a large asset often looks like an entirely new file.

This is the problem [Git LFS](https://git-lfs.com) was built to solve.

It is a good tool.
But it becomes expensive when teams treat it as a default instead of a deliberate decision.

## What Git LFS actually does

Git LFS stands for Git Large File Storage.

Instead of storing the full binary content directly inside normal Git objects, Git stores a small pointer file.
The real content is stored separately in LFS storage and downloaded when needed.

That helps keep the repository itself healthier and makes common operations more predictable.

Git is optimized for source code.
Not for large binary assets that change over time.

## Where Git LFS helps

Git LFS is useful when a file really does belong to the repository, but plain Git is the wrong storage mechanism for its contents.

That usually means the file is:

- large
- binary
- changed over time
- part of the product source of truth
- needed alongside the codebase

That can be a valid setup.
A game repository may need textures or audio files.
A mobile application may carry bundled media.
A machine learning project may need model files during development.

In those cases, Git LFS is often much better than pretending plain Git will handle it gracefully.

## What Git LFS does not magically solve

This is the part teams often underestimate.

Git LFS solves a storage problem, but it also introduces workflow and operational complexity.

The moment you adopt it, your repository is no longer just Git.
It becomes Git plus LFS support everywhere.

That means every developer machine, Continuous Integration job, build agent and automation that clones the repository needs to handle it correctly.
When that setup is incomplete, the failure mode is often confusing: the file appears to be there, but only the pointer is available.

That does not make Git LFS bad.
It just means Git LFS is not free.

## The biggest mistake

The wrong mental model is this:

"Git is getting too big, so let us move big files to LFS."

The better question is:

"Should these files be versioned in Git at all?"

That distinction matters.

Generated build output, release artifacts, logs, caches, database dumps, and temporary exports are usually not source code and not source of truth.
Putting them into Git LFS may reduce one problem while preserving the bigger architectural mistake.

Git LFS is not a substitute for artifact storage, package registries, or object storage.

A good rule is this:

If the file can be reproduced, published elsewhere, or treated as a deployment artifact, it probably does not belong in Git LFS.

## Git LFS works best with clear boundaries

The teams that use Git LFS well usually make the boundary explicit.

That means:

- a small set of file types tracked through LFS
- a `.gitattributes` file that makes those rules explicit
- documented setup steps for developers and Continuous Integration
- agreement that generated output does not go into the repository
- automated checks to prevent large non-LFS files from slipping into Git

Without that boundary, Git LFS slowly turns into a junk drawer.
And once that happens, the repository becomes harder to reason about.

## Binary files are different from code

One reason teams get into trouble here is that they treat binary assets as if they behaved like source code.
They do not.

Text can be diffed, merged, and reviewed well.
Binary files are often opaque, harder to merge and more expensive to keep around over time.

Git LFS helps with storage pressure, but it does not make binary collaboration behave like code collaboration.
That is why file locking can matter in some teams.

## My rule of thumb

Use Git LFS when large binary files are truly part of the product source of truth and need to evolve with the codebase.

Do not use Git LFS as a reflex.
And do not use it to avoid making a better storage decision elsewhere.

### Good candidates for Git LFS

- binary assets required during normal development
- large non-text files that belong to the product itself
- files the team must version together with the code

### Bad candidates for Git LFS

- build output
- release artifacts
- caches
- temporary exports
- logs
- anything reproducible from source

## Git LFS is a good tool when used on purpose

I like Git LFS when it is introduced intentionally.
It acknowledges Git's strengths instead of fighting them.
It helps teams that genuinely need versioned binary assets.

But I do not see it as a free improvement you switch on and forget.

It adds operational surface area.
It changes developer setup.
It affects Continuous Integration.
And it still does not answer the more important question of whether a file belongs in version control in the first place.

Use it when the problem is real.
Use it with explicit rules.
And do not confuse "Git can store this" with "Git should store this".
