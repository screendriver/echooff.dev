---
title: 'The Billion-Dollar Mistake: Avoid "null" in TypeScript'
description: "Why null still causes bugs in TypeScript - and how Maybe types make absence explicit."
publishedAt: "2026-03-04T08:04:00+01:00"
---

If you have written JavaScript long enough, you have probably seen this error:

```
TypeError: Cannot read properties of undefined
```

Or its close relative:

```
TypeError: Cannot read properties of null
```

In 2009 Tony Hoare, the inventor of the null reference, called it his **"billion-dollar mistake."**

The idea behind `null` was simple: introduce a value that represents _nothing_.

Unfortunately, this convenience came with a massive cost. For decades, software systems have been plagued by runtime errors caused by missing values.

JavaScript made the situation even worse by introducing **two ways to represent absence**: `null` and `undefined`.

In modern TypeScript codebases, the simplest rule is:

**Do not introduce `null`.**

In this post we will look at:

- why `null` is problematic
- why `undefined` is usually the better choice
- why optional chaining does not actually solve the problem
- how **Maybe types** - using the [True Myth](https://true-myth.js.org) library - can eliminate an entire class of runtime errors

---

## TL;DR

Inside application code:

- avoid introducing `null`
- prefer `undefined` for simple absence
- use `Maybe<T>` (for example from [True Myth](https://true-myth.js.org)) when absence is part of the domain

This makes missing values explicit and prevents an entire class of runtime errors.

---

## Why JavaScript Has `null` _and_ `undefined`

Most programming languages have **only one concept for absence**.

JavaScript ended up with two.

`null` was inherited from earlier languages like Java and was intended to represent an intentional absence of value.

`undefined`, however, emerged from JavaScript's dynamic nature. It appears naturally when:

- a variable is declared but not assigned
- an object property does not exist
- a function does not return anything
- a function is called without providing a value for a parameter

```ts
let value;

console.log(value); // undefined
```

Because of this, JavaScript developers constantly deal with two similar but slightly different concepts of "nothing".

This ambiguity is a frequent source of confusion.

---

## The Problem With `null`

`null` is an explicit value representing "nothing".

```ts
let user = null;
```

That might look harmless, but the problem appears as soon as code evolves.

Consider this example:

```ts
function getUserName(user: User | null): string {
  return user.name;
}
```

This compiles in JavaScript but crashes at runtime:

```
TypeError: Cannot read properties of null
```

In TypeScript, [strictNullChecks](https://www.typescriptlang.org/tsconfig/#strictNullChecks) helps, but the underlying issue remains:

**Every consumer must remember to handle `null`.**

```ts
if (user !== null) {
  console.log(user.name);
}
```

The absence of a value becomes a **cross-cutting concern** throughout the codebase.

---

## Prefer `undefined`

JavaScript already has a natural way to represent missing values: `undefined`.

```ts
const user = {};

console.log(user.name); // undefined
```

Because `undefined` already appears naturally in many places, many modern JavaScript projects follow a simple guideline:

> Avoid `null` entirely and standardize on `undefined`.

Using a single concept for absence reduces cognitive overhead and simplifies APIs.

### `null` makes types more verbose

Introducing `null` into TypeScript types often leads to unnecessarily complex unions.

For example:

```ts
type User = {
  name?: string | null;
};
```

versus:

```ts
type User = {
  name?: string;
};
```

Once `null` is introduced, it tends to spread through the codebase and types quickly become:

```
string | null | undefined
```

Avoiding `null` keeps types simpler and easier to reason about.

### Default parameters only work with `undefined`

Another reason to prefer `undefined` is that JavaScript language features treat it as the default "missing value".

For example, default function parameters only apply when the value is `undefined`:

```ts
function greet(name = "Anonymous") {
  console.log(name);
}

greet(undefined); // "Anonymous"
greet(null); // null
```

Using `undefined` therefore integrates more naturally with the language.

---

## Optional Chaining Does Not Solve the Problem

Modern JavaScript introduced optional chaining:

```ts
const street = user?.address?.street;
```

Instead of throwing an error like

```
TypeError: Cannot read properties of undefined
```

the expression simply evaluates to `undefined`.

This is convenient.

But optional chaining does **not actually solve the underlying problem**.

It only makes failures quieter.

Consider this example:

```ts
const street = user?.address?.street;

sendLetter(street);
```

If any property in the chain is missing, `street` becomes `undefined`.

The program continues running, but the bug still exists - it has simply moved somewhere else.

Optional chaining improves ergonomics, but it does **not model absence**.

---

## A React Example

React applications often receive incomplete data from APIs.

```ts
type Properties = {
  user?: User;
};

const UserProfile: FunctionComponent<Properties> = (properties) => {
  const { user } = properties;

  return (
    <div>
      <h2>{user?.name}</h2>
      <p>{user?.address?.street}</p>
    </div>
  );
};
```

Optional chaining prevents crashes, but it also hides the underlying problem.

- Is the user missing?
- Is the address missing?
- Did the API return partial data?

All of these cases become:

```
undefined
```

The component silently renders incomplete UI.

---

## Enter the Maybe Type

Functional programming languages solved this problem decades ago with a concept called **Maybe** (or `Option`).

A `Maybe<T>` represents one of two states:

- **Just<T>** → a value exists
- **Nothing** → a value does not exist

Instead of returning:

```ts
User | null | undefined;
```

we return:

```ts
Maybe<User>;
```

Now absence becomes **explicit in the type system**.

---

## Example With `true-myth`

One JavaScript library implementing this pattern is [True Myth](https://true-myth.js.org).

```ts
import { Maybe } from "true-myth";
```

Now our example becomes:

```ts
function findUser(id: string): Maybe<User> {
  const user = database.get(id);

  if (user === undefined) {
    return Maybe.nothing();
  }

  return Maybe.just(user);
}
```

Consumers can no longer accidentally ignore the absence.

They must handle it.

```ts
const street = findUser("42")
  .map((user) => {
    return user.address;
  })
  .map((address) => {
    return address.street;
  })
  .unwrapOr("Unknown street");
```

---

## Converting Nullable API Values

Real applications often receive data that might be `null` or `undefined`, especially from APIs.

Instead of propagating these values throughout the system, convert them immediately.

With **true-myth** this is done using `Maybe.of()`.

```ts
const street = Maybe.of(apiResponse.address)
  .map((address) => {
    return address.street;
  })
  .unwrapOr("Unknown street");
```

Outside the system we may receive `null` or `undefined`.

Inside the system we work with **explicit Maybe values**.

---

## Practical Guidelines

Inside application code:

- never introduce `null`
- prefer `undefined` for simple absence
- use `Maybe<T>` when absence is meaningful

For example:

Good:

```ts
function findUser(id: string): User | undefined;
```

Better:

```ts
function findUser(id: string): Maybe<User>;
```

Avoid:

```ts
function findUser(id: string): User | null;
```

---

## Conclusion

`null` was meant to represent “no value”.

Instead it became one of the most common sources of runtime errors in software systems.

JavaScript made things worse by introducing **two absence values**: `null` and `undefined`.

Optional chaining makes failures quieter, but it does not remove the underlying problem.

A simple improvement is to **avoid `null` entirely and standardize on `undefined`**.

An even better improvement is to **model absence explicitly** using Maybe types.

Once absence becomes part of the type system, defensive checks disappear - and an entire category of bugs disappears with them.

Tony Hoare regretted introducing `null`.

More than 50 years later, many bugs are still caused by the same idea: representing absence with a special value.

**Stop introducing `null` into new code.**
