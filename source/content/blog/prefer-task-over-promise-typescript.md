---
title: "Prefer Task over Promise in TypeScript"
description: "Promises hide failure in an untyped rejection path. Task from true-myth makes asynchronous success and failure explicit in TypeScript."
publishedAt: "2026-03-07T10:12:00+01:00"
topic: "TypeScript"
---

In previous posts I wrote about [avoiding `null`](/blog/avoid-null-typescript) and about [using `Result`](/blog/avoid-throwing-for-expected-failures-typescript).

Avoiding `null` makes absence explicit.

Using `Result` makes success and failure explicit.

For asynchronous work, I want that same clarity.

That is why I prefer `Task` over `Promise` in TypeScript application code.

I want the type signature to tell me not only what I get back, but also how failure is represented.

If you have seen similar abstractions in other languages before, you may also know them under names like `Future`.

I will stick to `Task` here because that is the name used by [True Myth](https://true-myth.js.org).

## A `Promise` tells me too little

Consider a function like this:

```ts
async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }

  return response.json();
}
```

At first glance, this looks fine.

It is asynchronous.
It returns a user.
It may throw when something goes wrong.

But the signature does not tell me enough.

```ts
(id: string) => Promise<User>;
```

That says nothing about the failure type.

It does not tell me whether the request failed because of the network, because the JSON was invalid, or because the user was not found.

It also pushes me back into JavaScript's exception model for the unhappy path.

So the success case is typed.
The failure case is not.

That is exactly the kind of ambiguity I want to remove.

## `Task` makes failure part of the type

With `Task` from [True Myth](https://true-myth.js.org), I can model the same operation like this:

```ts
import { Task } from "true-myth";

type FetchUserError =
  | { type: "network-error" }
  | { type: "invalid-response" }
  | { type: "not-found" };

function parseUser(response: Response): Task<User, FetchUserError> {
  return Task.fromPromise(response.json()).mapRejected(() => {
    return { type: "invalid-response" };
  });
}

function fetchUser(id: string): Task<User, FetchUserError> {
  return Task.fromPromise(fetch(`/api/users/${id}`))
    .mapRejected(() => {
      return { type: "network-error" };
    })
    .andThen((response) => {
      if (response.status === 404) {
        return Task.reject({ type: "not-found" } as const);
      }

      if (!response.ok) {
        return Task.reject({ type: "network-error" } as const);
      }

      return parseUser(response);
    });
}
```

Now the function signature carries useful information:

```ts
(id: string) => Task<User, FetchUserError>;
```

That tells me three things immediately:

- this operation is asynchronous
- it can succeed with `User`
- it can fail with `FetchUserError`

That is a much better contract than `Promise<User>`.

I convert the unsafe outside world into an explicit error type as early as possible.

That is the real point.

## `Task` is basically a safer `Promise`

The mental model is simple.

You can think of a `Task<T, E>` as something very close to a `Promise<Result<T, E>>`.

That is a very practical idea.

Instead of hoping everyone remembers to `.catch()` correctly, the API itself carries both outcomes.

`true-myth` also makes an important guarantee here: a `Task` does not reject at all.
When you `await` a `Task`, you get a `Result<T, E>` back.

That means success and failure stay in one explicit model.

## Composing async code gets clearer

One thing I like a lot is that `Task` distinguishes between `map` and `andThen` clearly.

That matters because these are not the same operation.

Use `map` when you already have a value and want to transform it.

```ts
const uppercasedName = fetchUser("user-123").map((user) => {
  return user.name.toUpperCase();
});
```

Use `andThen` when the next step is itself another async computation returning a `Task`.

```ts
type FetchAvatarError = { type: "avatar-not-found" };

function fetchAvatar(user: User): Task<string, FetchAvatarError> {
  return Task.fromPromise(fetch(`/api/avatars/${user.id}`))
    .mapRejected(() => {
      return { type: "avatar-not-found" };
    })
    .andThen((response) => {
      if (!response.ok) {
        return Task.reject({ type: "avatar-not-found" } as const);
      }

      return Task.fromPromise(response.text()).mapRejected(() => {
        return { type: "avatar-not-found" };
      });
    });
}

const avatarUrl = fetchUser("user-123").andThen((user) => {
  return fetchAvatar(user);
});
```

With `Promise`, it is easy to blur these steps together and leave error handling vague.

With `Task`, composition stays explicit.

## Awaiting a `Task` gives me a `Result`

At some point, of course, I need to run the operation.

That is where the boundary comes in.

```ts
const result = await fetchUser("user-123");

result.match({
  Ok(user) {
    console.log(user.name);
  },

  Err(error) {
    switch (error.type) {
      case "network-error":
        console.error("Could not reach the server.");
        return;
      case "invalid-response":
        console.error("The server returned invalid JSON.");
        return;
      case "not-found":
        console.error("The user does not exist.");
        return;
    }
  }
});
```

This is the part I like most.

I am not catching some vague thrown value.
I am handling an explicit `Result`.

That fits much better with how I want to structure applications.

The outside world can be messy.
The boundary can deal with that.
But inside the application, I want success and failure to be modeled deliberately.

## Keep `Promise` at the edge, prefer `Task` inside

I do not think `Promise` is bad.

It is the native JavaScript abstraction.
It is the interoperability layer.
You will always need it at the edges.

But inside an application, `Promise` often leaves too much unsaid.

`Task` gives me:

- explicit async success and failure types
- better composition with `map` and `andThen`
- a `Result` at the boundary instead of an untyped rejection path

That is a better fit for application code.

## Final thought

`null` hides absence.

`Result` makes success and failure explicit.

`Task` does the same for asynchronous work.

When I read `Promise<User>`, I still have to ask what can go wrong.

When I read `Task<User, FetchUserError>`, I already know how failure is supposed to look.
