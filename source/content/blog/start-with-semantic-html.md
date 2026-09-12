---
title: "Start with semantic HTML"
description: "Semantic HTML makes structure and behavior explicit, supports accessibility and avoids rebuilding features the browser already provides."
publishedAt: "2026-09-12T10:09:00+02:00"
topic: "Architecture"
---

Starting every component with a `<div>` is convenient when we are thinking only about layout. It is a poor default for describing a user interface.

The first question should be what the content or control means. How it looks comes after that. When HTML already has an element for that meaning, choosing a generic container leaves information out of the document and can turn existing browser behavior into application code.

That is why semantic HTML matters beyond markup preferences. It affects whether people can understand and operate the interface, and how much behavior a team has to implement and maintain.

## A div is the fallback

`<div>` is short for "division." It is a generic container with no particular meaning of its own. The [HTML standard](https://html.spec.whatwg.org/multipage/grouping-content.html#the-div-element) explicitly encourages authors to treat it as a last resort when no other element is suitable.

That does not make it useless. A wrapper that exists only to constrain width or arrange several elements may genuinely have no additional meaning. A `<div>` is appropriate there. Last resort describes the order in which we consider elements, not a target number of containers per page.

Replacing every `<div>` with `<section>` would miss the point. A [`<section>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/section) represents a thematic grouping, typically with a heading. An `<article>` represents self-contained content. Neither means "a box with some padding."

Choose the element that describes the content, then use CSS for its presentation. A list remains a list when its items are arranged horizontally. A heading's level should describe its place in the document, not the font size requested by a design.

The goal is accurate meaning, not a wider variety of tag names.

## Accessibility depends on structure and behavior

A visual layout communicates relationships through position, size and spacing. Those relationships also need a representation that does not depend on seeing the page.

[Page structure](https://www.w3.org/WAI/tutorials/page-structure/) gives screen reader users ways to navigate rather than listen to everything in sequence. Headings expose the document's hierarchy. Landmarks such as `<main>` and `<nav>` identify major regions. A large, bold `<div>` does not become a heading because it resembles one.

The same principle applies inside a form. A caption placed beside an input does not establish which control it describes. An [explicit label association](https://www.w3.org/WAI/tutorials/forms/labels/) does:

```html
<label for="display-name">Display name</label>
<input id="display-name" name="displayName" autocomplete="nickname" />
```

The browser can use that relationship to name the control for assistive technology. Clicking the label also focuses the input. There is no need to recreate either relationship with application code.

Interactive elements carry behavior as well as meaning. A native [`<button>`](https://www.w3.org/WAI/ARIA/apg/patterns/button/) provides keyboard activation and button semantics. An [`<a href="…">`](https://www.w3.org/WAI/ARIA/apg/patterns/link/) provides a link with a destination and browser actions such as opening it in another tab. A click handler on a generic element does not provide an equivalent interface.

Adding `role="button"` describes the element as a button, but does not implement button behavior. Adding `tabindex="0"` makes it reachable through sequential keyboard navigation, but still does not implement activation with Enter and Space. The [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/practices/read-me-first/) are explicit about this distinction: assigning a role leaves the author responsible for the behavior that role implies.

ARIA remains necessary when native semantics do not express everything a control needs. It should supplement the appropriate element rather than routinely compensate for choosing the wrong one.

Starting with native elements avoids that unnecessary repair work. It does not remove our responsibility to provide meaningful names, preserve visible focus and handle the rest of the interaction correctly.

## Use the behavior HTML already provides

A disclosure is a useful example because it is easy to turn into a component with state, an event handler and conditional rendering before considering whether any of that is needed.

For a simple expandable explanation, [`<details>` and `<summary>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/details) already express the interaction:

```html
<details>
  <summary>What does the weekly summary include?</summary>
  <p>Unread updates from the projects you follow.</p>
</details>
```

The browser manages the open state and the interaction with the summary. The application does not need its own boolean, a keyboard handler or a separately maintained `aria-expanded` value for this disclosure.

This also works without JavaScript. When the markup is in the initial HTML response, the interaction is available without waiting for application code to load. A component rendered entirely by JavaScript still needs that code to create the markup; native behavior does not change how the document arrives.

The [Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API) provides another declarative interaction:

```html
<button type="button" popovertarget="account-navigation">Account pages</button>

<nav id="account-navigation" popover="auto" aria-label="Account">
  <ul>
    <li><a href="/account/profile">Profile</a></li>
    <li><a href="/account/notifications">Notifications</a></li>
  </ul>
</nav>
```

The button toggles the popover without an application event handler. With `popover="auto"`, the browser also handles dismissal through an outside click or Escape. The links remain ordinary links, and `<nav>` describes the content as navigation. The popover attribute supplies behavior without replacing that meaning.

These features are specific building blocks. `<details>` is a disclosure, not a substitute for tabs. A popover does not automatically become an application menu with arrow-key navigation. The [`<menu>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/menu) is not a ready-made dropdown either; it represents an unordered list of commands.

The decision still starts with the interaction the product needs. Native behavior must match that requirement and work in the supported browsers and assistive technologies. When it does, rebuilding it creates additional code and additional ways for the implementation to become inconsistent.

That is the same preference behind [boring code](/blog/boring-code-is-a-feature): spend implementation effort on the behavior that is specific to the product, rather than recreating an existing mechanism without a reason.

## Machine readability needs explicit meaning

Assistive technology is not the only consumer of a document. Search engines also benefit from markup that makes its structure clear. Headings provide information about content organization, while links expose destinations instead of hiding navigation behind application behavior.

For SEO, that is useful, but it should not become a promise about rankings. [Google describes semantic HTML as helpful context](https://developers.google.com/search/help/office-hours/2023/september), not a shortcut to the top of search results. Replacing a wrapper with `<article>` does not establish the quality or relevance of its content.

This shares an aim with the [Semantic Web](https://www.w3.org/2001/sw/): making meaning available to software rather than leaving it implicit in human presentation. The terms are not interchangeable, though. The Semantic Web is a broader effort around machine-readable data and relationships, including RDF. Semantic HTML describes the structure and meaning of a document through HTML's vocabulary.

[Structured data for search](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data) is another related layer. Schema.org data expressed through JSON-LD can describe entities such as a product or recipe. An `<article>` element does not supply that information automatically, and structured data does not repair an inaccessible interface.

I would not make search visibility the main justification for semantic HTML. An account settings page behind authentication deserves the same care even when no search engine will index it.

## Preserve semantics through components

A component abstraction is useful only if it preserves the interface people need. Naming a React component `Button` does not make its output a button. Its rendered HTML still determines what the browser receives.

Design systems should make the correct choice straightforward. A navigation link and an action button can share visual styling without pretending to be the same control. A heading component should allow the document hierarchy to determine its level instead of fixing semantics to a typography variant.

This also affects tests. In [Why you should not ship test IDs to production](/blog/why-you-should-not-ship-test-ids-to-production-react-testing-library), I argued for locating controls through their roles and accessible names where appropriate. A test that looks for a button called "Save preferences" checks more of the intended interface than one that only finds an arbitrary identifier.

But a successful role query is not proof of accessibility. A `<div role="button">` can satisfy that query while remaining impossible to activate from the keyboard. Tests need to exercise the behavior we depend on, and [accessibility evaluation still needs human judgment](https://www.w3.org/WAI/test-evaluate/). Check keyboard operation and focus, and verify important flows with assistive technology. Native elements do not fix poor contrast, missing error explanations or confusing interaction design.

During review, I would therefore look past the component names and inspect the resulting document. Does its structure match the content? Do controls behave as their roles suggest? Is custom JavaScript adding product behavior or rebuilding something we discarded by starting with a generic container?

A `<div>` remains available when no meaningful element fits. It should be the result of that decision, not a way to avoid making it.
