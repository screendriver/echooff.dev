---
title: "Avoid truthy and falsy checks in TypeScript"
publishedAt: "2026-03-14T07:22:00+01:00"
description: "Truthy and falsy checks in TypeScript hide intent and can introduce bugs. Prefer explicit checks for the values you actually care about."
---

`if (value)` and `if (!value)` are short and familiar.

They are also often less clear than they look.

In TypeScript, a truthy or falsy check does not tell the reader what you actually care about. It does not mean "the value exists". It means "JavaScript considers this value truthy" or "JavaScript considers this value falsy".

That is a much broader rule.

Values like `undefined`, `null`, `false`, `0`, `""`, and `NaN` are all falsy. But in real applications, they usually do not mean the same thing.

- `undefined` may mean a value was not provided
- `null` may mean the absence of a value
- `false` may be a meaningful configuration
- `0` may be a valid number
- `""` may be a valid string

When you write `if (!value)`, all of these cases are treated the same.

Most of the time, that is not what the code actually intends.

## Truthiness is not the same as intent

Consider this function:

```typescript
function applyDiscount(discountPercentage?: number): string {
  if (!discountPercentage) {
    return "No discount";
  }

  return `${discountPercentage}% discount`;
}
```

At first glance, this may look fine.

But `0` is a valid discount. A discount of `0` does not mean the value is missing.

```typescript
applyDiscount(undefined); // "No discount"
applyDiscount(0); // "No discount"
applyDiscount(20); // "20% discount"
```

The bug is not caused by TypeScript.

The bug is caused by using a falsy check where the real question is whether the value is `undefined`.

An explicit check makes the intention clear:

```typescript
function applyDiscount(discountPercentage?: number): string {
  if (discountPercentage === undefined) {
    return "No discount";
  }

  return `${discountPercentage}% discount`;
}
```

Now the function says exactly what it means.

## Empty strings are not always missing values

Strings have the same problem.

```typescript
function formatNickname(nickname?: string): string {
  if (!nickname) {
    return "No nickname";
  }

  return nickname;
}
```

With `strictNullChecks`, `nickname?: string` means `string | undefined`. So the issue here is not `null`. The issue is that a falsy check also treats `""` as missing.

Sometimes that is what you want.

Sometimes it is not.

The problem is that the condition does not make the intention obvious.

If only missing values should fall back to `"No nickname"`, write that:

```typescript
function formatNickname(nickname?: string): string {
  if (nickname === undefined) {
    return "No nickname";
  }

  return nickname;
}
```

If an empty string should also fall back, write that explicitly too:

```typescript
function formatNickname(nickname?: string): string {
  if (nickname === undefined || nickname === "") {
    return "No nickname";
  }

  return nickname;
}
```

A longer condition is not worse when it communicates the rule more clearly.

## Falsy checks break meaningful booleans

Booleans are another common source of bugs.

```typescript
type Config = {
  darkMode?: boolean;
};

function isDarkModeEnabled(config: Config): boolean {
  if (!config.darkMode) {
    return true;
  }

  return config.darkMode;
}
```

This function treats `false` as if the value was missing.

That is wrong.

`false` is a valid configuration. It does not mean "not provided".

The explicit version is correct:

```typescript
function isDarkModeEnabled(config: Config): boolean {
  if (config.darkMode === undefined) {
    return true;
  }

  return config.darkMode;
}
```

Again, the important part is not just correctness.

It is that the condition now expresses the actual rule.

## Truthy and falsy checks hide business meaning

This is the main reason I avoid them in application code.

A condition should tell the reader what the program cares about.

- Is the value missing?
- Is the string empty?
- Is the number zero?
- Is the flag explicitly set to `false`?
- Is the input invalid?

Truthy and falsy checks answer a different question:

- Does JavaScript coerce this value to `true` or `false`?

That is usually an implementation detail, not the business rule.

The reader now has to mentally translate the condition back into intent.

That makes code harder to understand and easier to get wrong.

## Unwanted side effects of truthiness

Using truthy and falsy checks can introduce problems that are easy to miss:

- valid `0` values disappear
- valid empty strings are treated as missing
- explicit `false` is confused with absence
- conditions become ambiguous for readers
- refactoring becomes riskier because behavior depends on coercion rules
- business logic becomes coupled to JavaScript quirks

Readers should not need to think about JavaScript coercion rules just to understand a condition.

## Prefer explicit checks

If you care about `undefined`, check for `undefined`.

```typescript
if (value === undefined) {
}
```

If you care about `null`, check for `null`.

```typescript
if (value === null) {
}
```

If you care about an empty string, check for an empty string.

```typescript
if (value === "") {
}
```

The same applies to `0`, `false`, or any other value with business meaning.

The more precisely a condition matches the rule, the easier the code is to trust.

## For me, truthy and falsy checks are a bad default

JavaScript allows truthy and falsy checks.

That does not mean they are a good choice for application code.

For me, they are not.

They hide intent, collapse different states into the same branch, and make code more dependent on JavaScript coercion rules than on explicit business rules.

Even in cases where a truthy check happens to work, I still prefer the explicit version.

```ts
if (title !== "") {
}
```

is clearer to me than:

```ts
if (title) {
}
```

```ts
if (count > 0) {
}
```

is clearer to me than:

```ts
if (count) {
}
```

My rule is simple:

- if I mean `undefined`, I check for `undefined`
- if I mean `null`, I check for `null`
- if I mean an empty string, I check for `""`
- if I mean zero, I check for `0`

I do not want a reader to mentally expand JavaScript truthiness rules just to understand my intent.

For me, truthy and falsy checks are never clearer than an explicit condition, and they are often worse.

## Final thought

Truthy and falsy checks are convenient.

But convenience is not the same as clarity.

In TypeScript, I want conditions to describe the rule I care about, not rely on JavaScript coercion semantics.

`if (!value)` is short.

`if (value === undefined)` is often better.

Because it says what it means.
