---
title: "Why I do not use enums in TypeScript"
description: "Enums add runtime behavior, work against modern TypeScript workflows, and have simpler alternatives like string literal unions and const objects."
publishedAt: "2026-03-22T17:49:00+01:00"
---

TypeScript has a feature that still looks attractive in many codebases: [enum](https://www.typescriptlang.org/docs/handbook/enums.html)

I do not use it.

Not because it only became a problem once `erasableSyntaxOnly` arrived.
And not because there are no cases where it can work.

I avoid it because I do not think `enum` was ever the right default in TypeScript.

In my opinion, it has always solved a mostly type-level problem with a TypeScript-specific runtime construct.
String literal unions and `as const` patterns have been the better direction for a long time because they stay closer to JavaScript, keep runtime behavior obvious, and express intent more directly.

What changed recently is not that `enum` suddenly became wrong.
What changed is that modern TypeScript and Node.js workflows make the downside even harder to ignore.

## `enum` comes from an older TypeScript style

`enum` is an early TypeScript feature. It was already part of [TypeScript 0.9 in 2013](https://devblogs.microsoft.com/typescript/announcing-typescript-0-9/), from a time when the language was more willing to add non-JavaScript constructs.

That design direction is much less compelling today.

Modern TypeScript is often at its best when it stays close to JavaScript, adds types without changing runtime behavior, and avoids compiler-driven magic unless it is truly necessary.

`enum` goes in the opposite direction.

## `enum` solves the problem at the wrong level

Most of the time, we want to describe a closed set of valid values.
That is a type-level problem.

This is what many enums in application code really mean:

```typescript
// What are the valid values here?
type Status = "pending" | "approved" | "rejected";
```

That is simple, explicit, and precise.
It has no runtime cost because it disappears after type-checking.

By contrast, `enum` solves the same problem by introducing a special runtime construct:

```typescript
enum Status {
  Pending = "pending",
  Approved = "approved",
  Rejected = "rejected"
}
```

That is the key reason I dislike it.

I do not want a special TypeScript runtime feature when plain JavaScript values plus a type can model the same domain more directly.

## `enum` is not just type information

This is where `enum` differs from many other TypeScript features.

A type alias disappears.
An interface disappears.
A type annotation disappears.

`enum` does not.

The [TypeScript handbook](https://www.typescriptlang.org/docs/handbook/enums.html#enums-at-runtime) is very explicit here: enums are real objects that exist at runtime.
For numeric enums, the handbook also shows the generated reverse mapping and even recommends considering [objects with `as const` instead of enums](https://www.typescriptlang.org/docs/handbook/enums.html#objects-vs-enums).

That matters.

Numeric enums also come with a runtime shape that many people find confusing.
They support both `Enum.A` and `Enum[0]`, which means you can go from name to value and from value back to name.
I do not see that as a benefit.
I see it as another sign that `enum` does more at runtime than most code actually needs.

Code that looks like a lightweight type declaration is actually emitted as JavaScript.
So the abstraction is heavier than it first appears.

## This was already a weak abstraction before `erasableSyntaxOnly`

I want to be very clear about that.

I do not think `enum` only became a bad idea once recent Node.js and TypeScript changes arrived.
In my opinion, it was already the weaker abstraction before that.

Even in older projects with a normal build step, I would still rather use:

- string literal unions when I only need the type
- a `const` object when I also need runtime values

Those patterns are easier to understand, easier to debug, and much closer to ordinary JavaScript.

## Modern TypeScript makes the downside more obvious

This is where `enum` looks worse than ever.

Node.js can now execute TypeScript files directly when the code only uses erasable TypeScript syntax. The [Node.js v23.6.0 release notes](https://nodejs.org/en/blog/release/v23.6.0) describe that Node enabled type stripping by default, so code like this can run directly:

```sh
node file.ts
```

The current [Node.js TypeScript documentation](https://nodejs.org/api/typescript.html) explains the model in more detail:

- Node.js strips erasable TypeScript syntax by default
- Node.js recommends TypeScript 5.8+ with `erasableSyntaxOnly: true`
- `enum` declarations require JavaScript code generation and therefore are not part of the lightweight path

TypeScript 5.8 added [erasableSyntaxOnly](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-8.html#the---erasablesyntaxonly-option) for exactly this direction. The release notes explicitly list `enum` declarations among the constructs that are not supported when that flag is enabled.

So `erasableSyntaxOnly` did not create my argument.
It reinforced it.

It made something visible that was already true: `enum` does not fit a TypeScript style that prefers erasable syntax, plain JavaScript runtime shapes, and fewer special compiler transforms.

Yes, Node.js can also transform non-erasable TypeScript syntax with `--experimental-transform-types`.
But to me that only highlights the same point: `enum` needs special treatment that simpler alternatives do not.

## What I use instead

### Use a string literal union when you only need the type

```typescript
type Role = "admin" | "member" | "guest";

function canDeleteUser(role: Role): boolean {
  return role === "admin";
}
```

This gives you the important part: a closed set of valid values.
No runtime object is needed.

### Use a `const` object when you also need runtime values

```typescript
export const Status = {
  Pending: "pending",
  Approved: "approved",
  Rejected: "rejected"
} as const;

export type Status = (typeof Status)[keyof typeof Status];
```

Now you have both:

- runtime values such as `Status.Pending`
- a type of `"pending" | "approved" | "rejected"`

And the runtime shape is just an object.
Every JavaScript developer understands what that is immediately.

### Use an `as const` Array when the list matters

```typescript
export const themes = ["light", "dark"] as const;

export type Theme = (typeof themes)[number];
```

This works especially well for iteration, validation, and user interface options.

## Not even `const enum`

`const enum` is often presented as the exception.
I still do not use it.

It may reduce emitted JavaScript in some build setups, but it still depends on TypeScript-specific transformation.
That is not the direction I want.

The TypeScript handbook also documents several [`const enum` pitfalls](https://www.typescriptlang.org/docs/handbook/enums.html#const-enum-pitfalls), especially around sharing them across project boundaries.

Again, my default rule is simple:
prefer plain JavaScript values and type-level modeling over compiler magic.

## Final thought

My issue with `enum` is not that it never works.
My issue is that it solves the wrong problem in the wrong way.

Most of the time, we want to describe valid values.
That is a type-level problem.

`enum` answers that with a TypeScript-specific runtime construct.
String literal unions and `as const` patterns answer it more directly.

That was already true before `erasableSyntaxOnly`.
But today, with Node.js able to run TypeScript files directly and TypeScript offering a flag that rejects non-erasable syntax, the mismatch is harder to defend than ever.

So my rule stays simple:

Do not use `enum` in TypeScript.
Use string literal unions.
Use `const` objects when you need runtime values.
And keep your code as close to JavaScript as possible.
