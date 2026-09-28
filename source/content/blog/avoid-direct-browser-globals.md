---
title: "Why you should not access browser globals directly"
description: "Keep browser access at the boundary. Pass values or focused capabilities into application code so its behavior can be understood and tested independently."
publishedAt: "2026-04-18T11:30:00+02:00"
updatedAt: "2026-09-28T09:02:00+02:00"
topic: "Architecture"
---

A function that chooses between light and dark mode needs to know the user's preference and, when they choose to follow the system, the system preference. If it reads `window.matchMedia` internally, a test of that second case also has to arrange the browser API. A small decision now requires environment setup.

I would separate reading the browser preference from deciding which color scheme to use. The browser still has to be accessed somewhere, but that access belongs in the code that connects the application to its environment. It should not be an implicit requirement of every function that uses the value.

## A global read is still a dependency

Consider a theme setting with three choices: light, dark or system. A direct implementation might look like this:

```typescript
type ColorScheme = "light" | "dark";
type ThemePreference = ColorScheme | "system";

export function resolveColorScheme(preference: ThemePreference): ColorScheme {
  if (preference !== "system") {
    return preference;
  }

  const systemPrefersDarkMode = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;

  return systemPrefersDarkMode ? "dark" : "light";
}
```

The explicit preference is an argument. The system preference is another input, but it is obtained inside the function. To test the `"system"` branch we have to make `window.matchMedia` available and control what it returns. The function cannot be understood entirely from the values passed to it.

The same issue appears when code reads `navigator.language`, `document.title` or a value from `localStorage`. These reads do not necessarily change anything, but they depend on state outside the function. That is different from a calculation whose result depends only on its arguments.

The problem is not that those APIs are global identifiers. It is that code making a decision also takes responsibility for obtaining the information from a particular runtime. In the theme example, the precedence rule and the browser query have been combined even though they can be tested and changed separately.

## Pass the value into the rule

The rule needs a boolean describing the system preference. It does not need a `Window`, a `MediaQueryList` or an object with a method that returns the boolean.

In `resolve-color-scheme.ts`, that gives us:

```typescript
export type ColorScheme = "light" | "dark";
export type ThemePreference = ColorScheme | "system";

type ResolveColorSchemeOptions = {
  preference: ThemePreference;
  systemPrefersDarkMode: boolean;
};

export function resolveColorScheme(
  options: ResolveColorSchemeOptions
): ColorScheme {
  const { preference, systemPrefersDarkMode } = options;

  if (preference !== "system") {
    return preference;
  }

  return systemPrefersDarkMode ? "dark" : "light";
}
```

A browser-only module can read the media query, call the rule and set the attribute used by the application's theme styles:

```typescript
import {
  resolveColorScheme,
  type ThemePreference
} from "./resolve-color-scheme.js";

export function applyThemePreference(preference: ThemePreference): void {
  const systemPrefersDarkMode = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;

  const colorScheme = resolveColorScheme({
    preference,
    systemPrefersDarkMode
  });

  document.documentElement.dataset.colorScheme = colorScheme;
}
```

This code intentionally depends on the browser. Its job is to connect the rule to browser state and the rendered page. The rule itself can now run with any supplied preferences, including values from a test.

This applies the preference at the moment the function runs. [`matchMedia`](https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia) also provides change events. To keep following the system the browser code would subscribe to those changes, apply the current preference again and remove the listener when it is no longer needed. The subscription belongs with the browser integration, not in `resolveColorScheme`.

There is no need to add a `ColorSchemeReader` just to forward its return value through another function. Passing the boolean establishes the separation without introducing an additional interface. It is the same principle as keeping the [happy zone independent of external state](/blog/clean-architecture-protects-the-happy-zone).

## Test the decision without arranging the browser

The important behavior is that an explicit preference takes precedence over the system, while `"system"` follows it. Those cases can be tested directly:

```typescript
import assert from "node:assert";
import test from "node:test";

import { resolveColorScheme } from "./resolve-color-scheme.js";

test("uses light when selected, even if the system prefers dark", () => {
  const result = resolveColorScheme({
    preference: "light",
    systemPrefersDarkMode: true
  });

  assert.strictEqual(result, "light");
});

test("uses dark when selected, even if the system prefers light", () => {
  const result = resolveColorScheme({
    preference: "dark",
    systemPrefersDarkMode: false
  });

  assert.strictEqual(result, "dark");
});

test("follows a dark system preference when system is selected", () => {
  const result = resolveColorScheme({
    preference: "system",
    systemPrefersDarkMode: true
  });

  assert.strictEqual(result, "dark");
});

test("follows a light system preference when system is selected", () => {
  const result = resolveColorScheme({
    preference: "system",
    systemPrefersDarkMode: false
  });

  assert.strictEqual(result, "light");
});
```

These tests need no `window` or media-query implementation. They also remain useful if the browser integration changes how it obtains or displays the preference. Their assertions describe the decision rather than the mechanism used to read its inputs.

They do not prove that the media query is correct or that the page's styles respond to the attribute. Those are separate integration concerns. Keeping them out of the rule's tests makes it clear what each test establishes.

## Pass an operation when a value is not enough

A snapshot is sufficient for choosing a color scheme. Other code needs to perform an operation or read a value later rather than when the caller first supplies its inputs. In those cases a function can be the appropriate dependency.

For example a workflow that copies generated text can accept a function with the signature `(text: string) => Promise<void>`. The browser implementation calls `navigator.clipboard.writeText(text)`. A test can supply an implementation that records the text or rejects, depending on the behavior being checked. The workflow does not need the entire `Navigator` object.

That operation still interacts with the outside world. Injecting it makes the dependency explicit and replaceable; it does not make the workflow pure. The [clipboard API's restrictions](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText) still apply and the caller must handle a rejected write rather than reporting success before it finishes.

The distinction is whether the code needs information or the ability to do something. Prefer the value when it already has everything needed for the decision. Pass a focused function when the operation itself belongs to the workflow. Neither requires a container or a service registry, as I explain in [Dependency injection without frameworks](/blog/dependency-injection-without-frameworks-in-typescript).

## `globalThis` does not remove the dependency

Replacing `window.document` with `globalThis.document` does not separate a function from the document. [`globalThis`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/globalThis) provides a standard way to access the global `this` value across environments. It does not make the same APIs available in each one.

The relevant question is still whether the function needs to read a document at all. If it only needs a title, the caller can supply the title. If it is responsible for updating the document, that implementation belongs in a dedicated browser-access module.

Moving a global read to the top of a module does not help either. A module-level `window.matchMedia` call reads the browser during import, before any exported function is called. A module intended to be imported outside a browser should not perform that read merely because it was loaded.

Keeping the access inside the browser integration makes that requirement explicit. It does not mean inventing a fallback browser for every other environment. Server-rendered code still needs a deliberate choice about which preferences are available there.

## Browser code still needs browser tests

A dedicated browser-access module that manages focus or updates DOM elements is intentionally browser-dependent. A DOM test environment can be appropriate for that code. Tools such as [jsdom](https://github.com/jsdom/jsdom) implement browser APIs for testing but their presence alone does not determine whether a test is useful or how much code it exercises.

I would question the setup when a test needs those tools only to evaluate a rule such as preference precedence. Before adding a simulated browser or patching a global, check whether the value could have been supplied directly. A missing browser API in a test may be exposing an unnecessary dependency in the implementation.

The browser integration still needs verification of its own. For the theme example, a browser test can check that selecting a preference changes the rendered theme and that following the system responds to changes. It does not need to repeat every case already covered by the rule's tests.

Small wrappers do not automatically need separate unit tests but neither are they automatically correct. Selecting the wrong media query, forgetting to remove a listener or handling a rejected operation incorrectly are application mistakes. Test those responsibilities where their behavior is observable rather than treating the wrapper as trustworthy merely because it is short.

Direct access to browser globals belongs in dedicated browser-access modules. Pure rules receive values from their callers; workflows that need to perform browser operations receive explicit functions. In the theme example, `applyThemePreference` owns the browser access and passes a boolean into `resolveColorScheme`. The rule's tests check which preference wins, while browser tests check that the page applies the result correctly.
