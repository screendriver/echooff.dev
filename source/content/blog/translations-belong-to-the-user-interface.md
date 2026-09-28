---
title: "Translations belong to the user interface"
description: "Business logic should return application meaning, not localized text or translation keys. The user interface should decide how that meaning becomes words for a person."
publishedAt: "2026-08-01T08:41:00+02:00"
updatedAt: "2026-09-28T10:04:00+02:00"
topic: "Architecture"
---

A workspace-name validator can reject an empty name without knowing how the form explains the problem. When that validator calls a translation function, it also chooses a message from the user interface's catalog. A test of the rule then needs a translator even though the decision is only about the name.

I would keep those responsibilities separate. The validator returns a reason such as `empty` or `tooLong`, including the length limit where relevant. The user interface decides how to explain that result. Changing the wording or reorganizing translation keys should not require editing the validation rule.

Here, translation means localizing the application's own interface text. A product that translates user content has translation as part of its domain. That is a different responsibility.

## An injected translator still introduces presentation

Suppose a workspace name must be nonempty and its length must not exceed 80. A validator that receives a translator might look like this:

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

The concrete translation library is replaceable and a test can supply a [stub](/blog/not-every-test-double-is-a-mock#a-stub-controls-an-indirect-input). But the validator still chooses catalog keys and prepares substitutions for a particular message. [Dependency injection](/blog/dependency-injection-without-frameworks-in-typescript) makes that dependency explicit without changing which responsibility it belongs to.

This is not about whether a third party owns the translation library or whether the application trusts its strings. Even with translation files maintained in the same repository, choosing how to explain a validation failure is presentation work. The naming rule does not need that decision in order to reject the input.

## Returning a key keeps the same dependency

Moving the call to `translate` out of the validator is not enough if the result still tells the caller which catalog entry to use:

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

The caller now produces the final text but the validator still selects the message. Renaming `workspace.name.required` to `workspace.validation.nameMissing` requires changing this application contract even though the rules for workspace names have not changed.

The substitution object creates the same dependency on a message's expected inputs. The maximum length is useful application data but packaging it as substitutions for one catalog entry assumes how the interface will use it.

Type-safe keys are useful within the user interface. They can help check that a message identifier and its substitutions agree with the catalog. That does not give the catalog a reason to appear in the validator's return type.

## Return the reason and the relevant data

The application can describe the failure without referring to a message. In `application/validate-workspace-name.ts` the same rule becomes:

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

The validation conditions have not changed. The result now describes the rejected input and, for `tooLong`, the constraint it exceeded. The limit remains a number supplied by the rule. The user interface can use it in a message without having to duplicate the constant.

Both `empty` and a translation key are strings but they refer to different things. `empty` describes a condition that remains meaningful without any text: a caller can prevent submission or mark the field as invalid. `workspace.name.required` refers to an entry in a particular user interface catalog. The distinction is what the identifier means and who owns it, not whether its name contains dots.

An HTTP handler could also map this failure to a machine-readable API response. Clients that need to react to the failure should receive an application code not a resource identifier from one client's translation system.

## Translate in the user-interface layer

A React component can map the failure to a message where it is rendered. Here `useTranslate` is the application's UI hook for its configured translation system:

```tsx
import type { FunctionComponent } from "react";

import type { WorkspaceNameFailure } from "../application/validate-workspace-name.js";
import { useTranslate } from "./use-translate.js";

type Properties = {
  failure: WorkspaceNameFailure;
};

export const WorkspaceNameError: FunctionComponent<Properties> = (
  properties
) => {
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

The component imports the application's failure type. The validation module has no dependency on this component, its hook or the translation catalog. This is the dependency direction described in [Clean Architecture protects the happy zone](/blog/clean-architecture-protects-the-happy-zone).

The mapping lets the form change its message without changing the validator. Another screen can choose different wording for the same failure. A UI-specific formatter can share the mapping when several screens genuinely need the same presentation but the validator does not need to own it to avoid duplication.

Translation does not have to happen literally inside a React component. A presenter, a UI-specific hook or an ordinary formatting function can own it when that module belongs to the presentation layer. An email renderer or command-line interface has the same responsibility even when it runs on a server.

Conversely, a business function does not become presentation code merely because a React component calls it. Translation keys and translation calls belong in the modules responsible for user-facing output. Application rules return the structured results those modules need.

## Test the rule independently of the wording

The validator’s tests can check an empty name, a name exactly at the limit and one just beyond it. They should expect `empty`, a valid result and `tooLong` with `maximumLength: 80`, respectively. None of those tests needs a locale or a translator.

The user interface has a different contract to test: whether it displays the appropriate message and includes the limit supplied by the rule. Those tests may need the translation setup and a wording change may legitimately change their expectations. It should not require updating the validator’s tests.
