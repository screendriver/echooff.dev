---
title: "Translations belong to the user interface"
description: "Business logic should return application meaning, not localized text or translation keys. The user interface should decide how that meaning becomes words for a person."
publishedAt: "2026-08-01T08:41:00+02:00"
topic: "Architecture"
---

In [Clean Architecture protects the happy zone](/blog/clean-architecture-protects-the-happy-zone), I argued that the center of an application should know the rules while the outside should know the world.

User-facing text follows the same rule.

A use case receives a translation function. A validator returns a translation key for another layer to resolve. A service returns a localized message because its caller needs text anyway.

Each choice can look harmless.

Each one makes presentation part of the business contract.

Business logic should not translate.

It should not return translated strings. It should not receive a translation function. It should not return a translation key for another layer to resolve later.

Translation belongs to the user interface.

Here, translation means localizing the application's own interface text. A product that translates user content has translation as part of its domain. That is a different responsibility.

## A translated string is already presentation

Imagine that an application rejects a workspace name because it is empty or exceeds the maximum allowed length.

The business rule knows what happened. It knows that the name is empty or that its length exceeds a limit. It may also know the maximum permitted length.

It does not know how that result should be explained to a person.

The message may appear below an input, inside a dialog, in a toast or as part of a larger summary. One interface may need a complete sentence. Another may need a short label. The wording may depend on the surrounding screen, the available space, the current locale and the tone of the product.

Turning the result into text already makes those presentation decisions.

That remains true even when the application owns every translation file. Translation belongs in the user interface not because a third-party service controls it or because the strings are untrusted. It belongs there because it decides how application meaning is presented to a person.

The business rule owns the meaning.

The user interface owns the wording.

## Injecting a translator does not fix the boundary

[Dependency injection](/blog/dependency-injection-without-frameworks-in-typescript) makes dependencies visible and allows their implementations to be replaced.

It does not make every dependency appropriate for every layer.

A business function can receive a translator through an explicit parameter and still depend on presentation:

```typescript
type Translate = (
  key: string,
  substitutions?: Record<string, string | number>
) => string;

type ValidateWorkspaceNameOptions = {
  name: string;
  translate: Translate;
};

type ValidateWorkspaceNameResult =
  { status: "valid" } | { status: "invalid"; message: string };

const maximumWorkspaceNameLength = 80;

export function validateWorkspaceName(
  options: ValidateWorkspaceNameOptions
): ValidateWorkspaceNameResult {
  const { name, translate } = options;

  if (name.length === 0) {
    return {
      status: "invalid",
      message: translate("workspace.name.required")
    };
  }

  if (name.length > maximumWorkspaceNameLength) {
    return {
      status: "invalid",
      message: translate("workspace.name.tooLong", {
        maximumLength: maximumWorkspaceNameLength
      })
    };
  }

  return { status: "valid" };
}
```

The concrete translation library is hidden. Tests can provide a fake. The dependency is explicit.

The direction is still wrong.

The validation rule now knows that its outcome becomes localized user-facing text. It chooses translation keys and substitution names. Its tests need a translator even though they are supposed to verify a rule about workspace names.

The vendor is abstracted.

The presentation decision is not.

This is the same problem described in [Don't log at the leaf. Log at the root](/blog/dont-log-at-the-leaf-log-at-the-root). Injecting a logger into a use case does not make logging business logic. Injecting a translator does not make translation business logic either.

## A translation key is still presentation

A common response is to stop translating inside the business function and return the key instead:

```typescript
type ValidateWorkspaceNameResult =
  | { status: "valid" }
  | {
      status: "invalid";
      translationKey: "workspace.name.required";
    }
  | {
      status: "invalid";
      translationKey: "workspace.name.tooLong";
      substitutions: {
        maximumLength: number;
      };
    };
```

This avoids producing the final string too early.

It does not remove presentation from the contract.

A translation key is a reference into a user-interface resource catalog. Its namespace reflects how that catalog is organized. Its substitution fields reflect the needs of one message. Renaming a key, splitting one message into two or reorganizing the interface can now require a change in business logic.

Type-safe translation keys are useful. They can prevent misspelled identifiers and catch missing substitutions during development.

Type safety does not change ownership.

A perfectly typed dependency can still point in the wrong direction.

Returning a translation key also assumes that every interface will present the outcome in the same way. A web form, a command-line interface, a native application and an email may all need different wording for the same result. The business rule should not choose one resource identifier and force every presentation to inherit that choice.

## Return application meaning

The business contract should describe what happened in application terms:

```typescript
export type WorkspaceNameFailure =
  | { type: "empty" }
  | {
      type: "tooLong";
      maximumLength: number;
    };

export type ValidateWorkspaceNameResult =
  | { status: "valid" }
  | {
      status: "invalid";
      failure: WorkspaceNameFailure;
    };

const maximumWorkspaceNameLength = 80;

export function validateWorkspaceName(
  name: string
): ValidateWorkspaceNameResult {
  if (name.length === 0) {
    return {
      status: "invalid",
      failure: {
        type: "empty"
      }
    };
  }

  if (name.length > maximumWorkspaceNameLength) {
    return {
      status: "invalid",
      failure: {
        type: "tooLong",
        maximumLength: maximumWorkspaceNameLength
      }
    };
  }

  return { status: "valid" };
}
```

There is no translator in this contract.

There is no message and no translation key either.

The function returns the meaning of the decision together with the data a caller may need. The numeric limit is part of the rule. Packaging that value as a substitution for one particular sentence is presentation.

This keeps the inner contract useful beyond one screen. A caller can focus the invalid field, prevent submission, expose a machine-readable API result, choose another workflow or present the failure to a person.

The business rule does not have to predict which of those things will happen.

## Application meaning is not a translation key

Both an application reason and a translation key may be represented as strings. That can make the distinction look artificial.

It is not the syntax that matters.

`empty` describes a condition in the application. It remains meaningful without a translation catalog. A caller can react to it without displaying any text at all.

`workspace.name.required` identifies a piece of user-interface copy. Its meaning depends on a resource catalog and the presentation convention that created that namespace.

The first describes what happened.

The second describes where one presentation of what happened can be found.

The same distinction applies across an HTTP boundary. An API may return a stable, machine-readable failure code when clients need to react to a known outcome. That code should describe the application condition. It should not expose the resource identifier used by one client's translation system.

The client can map the semantic result to its own interface and its own wording.

## Translate where meaning becomes interface

A React user interface for example can perform that mapping where the result is rendered:

```tsx
import type { FunctionComponent, ReactElement } from "react";

import type { WorkspaceNameFailure } from "../application/validate-workspace-name.js";
import { useTranslate } from "./use-translate.js";

type Properties = {
  failure: WorkspaceNameFailure;
};

export const WorkspaceNameError: FunctionComponent<Properties> = (
  properties
): ReactElement => {
  const { failure } = properties;
  const translate = useTranslate();

  if (failure.type === "empty") {
    return <p>{translate("workspace.name.required")}</p>;
  }

  return (
    <p>
      {translate("workspace.name.tooLong", {
        maximumLength: failure.maximumLength
      })}
    </p>
  );
};
```

The translation keys now live in the layer that owns them.

That layer knows the current locale. It knows that the result is being rendered below a workspace-name input. It can choose wording appropriate for that context and change it without modifying the validation rule.

Type-safe keys remain valuable here. The point is not to weaken the translation system. It is to keep that system inside the presentation boundary.

Another interface can map the same `WorkspaceNameFailure` differently. A compact mobile screen may use shorter text. A command-line interface may include remediation in the same line. An email renderer may use a complete sentence with more context.

The application meaning remains stable while each interface speaks in its own voice.

## The user interface is a layer, not a framework

Translation does not have to happen literally inside a React component.

A presenter, view-model mapper or React-specific hook can own the translation when it is clearly part of the user-interface layer. Server-rendered HTML, native applications, command-line output, emails and push notifications also have presentation boundaries where application meaning becomes language for a person.

The important distinction is architectural, not physical.

Code does not become user-interface code merely because it runs in a browser or is called after a button click. A use case invoked by React is still a use case. A repository used by a component is still a repository.

The reverse is also true. A non-React module can be presentation code when its responsibility is to render an email or turn a result into command-line output.

Translate at the interface that owns the audience and the context.

Do not pass translation deeper merely because the first caller happens to have access to it.

## Translate as late as possible

Keeping meaning structured until the presentation boundary preserves choices.

The interface can use the current locale when the result is displayed. It can choose different wording for an inline error and a dialog. It can format numbers, dates and other values according to the user's locale. It can decide whether a message needs additional context or should not be shown at all.

Translating earlier removes those choices.

It also risks turning localized text into application state. State should preserve what happened, not one temporary sentence used to describe it.

## Tests become more honest

A business-logic test should verify the business result.

It can pass an empty name and expect an `empty` failure. It can pass a name above the limit and expect `tooLong` with the correct maximum length.

It does not need a translation library, a locale, a provider or a fake translator.

A user-interface test can separately verify that `empty` becomes the correct message in the current context and that `tooLong` supplies the expected value to the translation system.

Those tests protect different contracts.

A copy change should not break a test for the validation rule. A change to the validation rule should not require rewriting translation infrastructure in its unit tests. Replacing the translation library should not modify application decisions.

The architecture makes each test know only what its layer owns.

## Final thought

Translation is presentation.

Business logic should make decisions and return application meaning. It should not decide how those decisions become words for a person.

Not through a translated string.

Not through an injected translator.

Not through a translation key returned for later.

Keep the meaning structured until the audience and context are known.

Then translate it in the user interface.
