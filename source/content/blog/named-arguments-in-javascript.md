---
title: "Named arguments in JavaScript"
description: "Use object parameters to make function calls easier to read, distinguish values of the same type and expose boolean flags that deserve a better design."
publishedAt: "2026-11-04T08:13:00+01:00"
topic: "TypeScript"
---

A function call can contain all the required values while leaving their meaning unclear:

```typescript
await sendEmail("alex@example.com", "sam@example.com", "Deployment completed");
```

Does Alex send the email or receive it? Both conventions would be possible. The function declaration can answer that question, but the call itself does not. If both parameters accept a `string`, TypeScript also accepts the addresses in the wrong order.

JavaScript has no native syntax for named arguments. My usual approach is to accept an object and give each value a property name. That keeps the meaning visible where the function is called, including when someone reads the code without an editor showing the parameter names.

## Put the names at the call site

The same operation becomes easier to review when its inputs are named:

```typescript
await sendEmail({
  sender: "alex@example.com",
  recipient: "sam@example.com",
  subject: "Deployment completed"
});
```

The reader can see who sends the email and who receives it. They can check whether those choices are correct without first finding the function declaration.

This still passes one object as a positional argument. JavaScript's [argument list semantics](https://tc39.es/ecma262/multipage/ecmascript-language-expressions.html#sec-argument-lists) have not changed. The function reads properties by name so their position in the object literal does not decide which value becomes the recipient. An object gives us much of the readability of named arguments using ordinary JavaScript.

Descriptive variable names help too but they do not establish the receiving function's contract. `sendEmail(senderEmail, recipientEmail, subject)` tells us what those local variables mean. We still need to know whether the function expects the sender first. With `sender: senderEmail` that relationship is explicit.

Editor hints are useful while writing code. I also want the source to remain understandable in a diff or a pasted example. Comments such as `/* recipient */` can supply a missing label but an object makes that label part of the interface. This is a concrete example of why [comments are not a substitute for design](/blog/comments-are-not-a-substitute-for-design).

## Keep the implementation ordinary

In TypeScript the input can have a small, named type:

```typescript
type SendEmailOptions = {
  sender: string;
  recipient: string;
  subject: string;
};

type SendEmail = (options: SendEmailOptions) => Promise<void>;
```

Calling the type `Options` does not make its properties optional. All three are required here.

Inside the implementation the function can read `options.recipient` directly or use [object destructuring](https://www.typescriptlang.org/docs/handbook/2/functions.html#parameter-destructuring):

```typescript
const { sender, recipient, subject } = options;
```

I prefer to destructure inside the function body and keep the parameter declaration short. Destructuring is a convenience for the implementation; accepting the object is what gives callers the named interface. The same pattern works in JavaScript without the type declarations.

There is still a limit to what the names guarantee:

```typescript
await sendEmail({
  sender: recipientEmail,
  recipient: senderEmail,
  subject
});
```

If both address variables are strings, TypeScript accepts this too. The object makes the crossed assignments easier to notice but it does not prove that the values are correct. Its immediate benefit is a clearer relationship between each input and its role.

## Name boolean flags, then question them

Boolean arguments make the problem particularly visible:

```typescript
await saveDocument(document, true);
```

The literal says nothing about what it enables. Publishing? Overwriting an existing version? Sending a notification?

An object removes that uncertainty:

```typescript
await saveDocument({ document, publish: true });
```

Now the choice is visible but the design still deserves a closer look. If the flag selects between saving a draft and publishing a document, the function exposes two different intentions through one name. I generally avoid boolean parameters that select a function's behavior this way.

Those intentions can have their own entry points:

```typescript
await saveDraft(document);
await publishDocument(document);
```

Each call describes the requested operation. The implementations can still share the code that stores the document. Giving the operations separate names does not require duplicating their common steps.

A string literal such as `mode: "publish"` would name the selected behavior but it would leave the same question about responsibilities. An object should help us see that question rather than make every flag look acceptable because it now has a name.

A boolean representing a setting is different. `updatePreferences({ emailNotificationsEnabled: false })` supplies a value the application needs to retain. There is no reason to invent a more elaborate representation for it. Likewise, some options legitimately configure one coherent operation. The useful distinction is whether the value describes an input to that operation or makes the function switch between separate operations.

## Optional inputs no longer need empty positions

Positional APIs become more awkward when callers need a later optional parameter while accepting the defaults for earlier ones:

```typescript
searchDocuments(query, undefined, undefined, 50);
```

The caller has to preserve positions for values it does not want to choose. The reader has to look up both the empty positions and the meaning of `50`.

With an object, the call can state the relevant choice directly:

```typescript
searchDocuments({ query, limit: 50 });
```

The function can use [optional properties and defaults](https://www.typescriptlang.org/docs/handbook/2/objects.html#optional-properties) for the remaining inputs. For example, `const { limit = 20 } = options` supplies a default when `limit` is missing or `undefined`. Required inputs can remain required; accepting an object does not mean accepting an empty one.

This also makes some changes easier. An additional optional property does not require callers to count another position. Existing calls can remain unchanged when omitting that property preserves their behavior. A new required property still requires callers to supply it.

The names themselves now belong to the public interface. Renaming a local positional parameter usually leaves callers alone. Renaming `recipient` to `destination` changes what callers must provide. Choose those names with the same care as the function name.

## An object still needs a focused contract

Putting twelve inputs into one object gives a function one parameter syntactically. It still requires twelve inputs. The object has not reduced the function's responsibilities or the amount of information needed to call it.

If the options keep growing, especially with flags that affect unrelated parts of the implementation, I would reconsider the operation itself. Passing an entire configuration object or user record because it is convenient can also hide which values the function actually needs. An input object should make that dependency clear.

There are calls where additional labels contribute little. `normalizeEmail(email)` is already understandable. A function with one obvious primary input and a few settings can also reasonably use `searchDocuments(query, { limit: 50 })`. The query has a clear role. The object names the choices around it.

Once a function takes three arguments I usually consider whether an object would make its calls clearer. Two arguments can already justify one when their roles are easy to confuse, as with the sender and recipient addresses. I look at the call and ask whether the reader can tell what each value is for.

When that meaning depends on remembering a parameter order I prefer to put the names in the code. The extra syntax is a small cost for making the call easier to read and review every time it changes.
