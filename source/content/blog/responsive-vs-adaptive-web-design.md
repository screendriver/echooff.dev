---
title: "Responsive vs. adaptive web design"
description: "How fluid layouts differ from predefined layout sizes, why both can use breakpoints and what that means for implementation and testing."
publishedAt: "2026-10-11T20:48:00+02:00"
topic: "Architecture"
---

Responsive web design starts with layouts that can grow and shrink with the space available. In the usual [comparison with adaptive layouts](https://web.dev/learn/design/intro), adaptive design selects from a set of predefined layouts, typically at fixed widths.

Both can use breakpoints and change their arrangement on narrow screens. Seeing a sidebar move above the main content does not tell us which sizing strategy the page uses. The useful distinction is what happens between those changes.

There is a terminology problem worth resolving before going further. Aaron Gustafson uses [adaptive web design](https://blog.easy-designs.net/archives/on-adaptive-vs-responsive-web-design/) more broadly to describe progressive enhancement: adapting an experience to the capabilities available to the user. Responsive design can be part of that approach. The narrower comparison here concerns adaptive layouts and their use of predefined sizes.

## Responsive layouts use the available space

A responsive layout defines how content should fit as the available space changes. Columns can grow and shrink, text can wrap and images can stay within their containers. Breakpoints allow larger changes when the current arrangement stops working.

That combination is present in [Ethan Marcotte's original description of responsive web design](https://alistapart.com/article/responsive-web-design/): fluid grids, flexible media and media queries. Breakpoints were part of the approach from the beginning.

Consider a page containing navigation and main content. These layout rules assume that the page's parent spans the viewport:

```css
.page {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 2rem;
  width: calc(100% - 2rem);
  max-width: 72rem;
  margin-inline: auto;
}

@media (min-width: 60rem) {
  .page {
    grid-template-columns: 16rem minmax(0, 1fr);
  }
}
```

The page grows with its parent until it reaches `72rem`. Below the breakpoint navigation and content are stacked. From `60rem`, they sit beside each other, with a fixed navigation column and a main column that takes the remaining space.

Within either arrangement the page can still change width. The breakpoint changes the relationship between the two areas; it does not replace their flexible sizing with a fixed canvas.

Neither the fixed navigation column nor the maximum page width makes this cease to be responsive. Fluidity works within constraints. A readable content width does not need to keep growing just because a larger monitor provides more space.

## Adaptive layouts select predefined sizes

An adaptive layout takes a different approach to sizing. It defines particular layout widths and selects one when the available space reaches a threshold. Between those thresholds the selected width remains the same.

Keeping the same content, an adaptive sizing strategy could look like this:

```css
.page {
  width: 22rem;
  max-width: calc(100% - 2rem);
  margin-inline: auto;
}

@media (min-width: 50rem) {
  .page {
    width: 48rem;
  }
}

@media (min-width: 74rem) {
  .page {
    width: 72rem;
  }
}
```

Between viewport widths of `50rem` and `74rem` the page stays `48rem` wide. Increasing the viewport adds space around it until the next layout width is selected. Its internal arrangement could also change at those thresholds, but the defining difference in this comparison is the choice of fixed layout widths.

For example, with the parent spanning the viewport, increasing its width from `61rem` to `70rem` grows the responsive page from `59rem` to `68rem`. The adaptive example remains `48rem` wide throughout that interval. Neither example crosses a breakpoint during that change.

The adaptive example still has a flexible safeguard: `max-width` lets it shrink in very narrow spaces. Practical designs can combine the techniques. A fixed outer layout might contain flexible components, just as a responsive page can contain a fixed sidebar. Classifying every element under one label is less useful than understanding which dimensions are flexible and which are selected explicitly.

## Breakpoints do not distinguish the approaches

A breakpoint says when a rule changes. It does not say whether the layout on either side is fluid or fixed.

Moving from three columns to one can be part of responsive design. So can moving navigation into a disclosure when there is no longer room to display it comfortably. The presence of different arrangements is not enough to classify a design as adaptive.

The reverse is also true: a responsive layout does not always need an explicit breakpoint. Flexible wrapping and intrinsic sizing can handle some arrangements without a media query, as the [MDN responsive design guide](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design) explains.

[Container size queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries) apply the same kind of conditional styling to the space around a component. A card in a narrow sidebar may need a different arrangement from the same card in the main content area, even though the viewport has not changed. Using a container query does not make that component inherently adaptive or responsive either. Its sizing rules still determine how it behaves between transitions.

This is why a mobile mockup and a desktop mockup are insufficient to describe either approach. They show two results. They do not tell the person implementing them what should happen at all the widths in between.

## Layout choices have implementation costs

The adaptive example is implemented entirely in CSS. Selecting predefined widths does not require the server to send different HTML and the terminology does not dictate whether an application needs separate components.

When the difference is only sizing and placement I would usually keep the same content structure and express the change through layout rules. Separate mobile and desktop implementations create more places where a new field, validation message or accessibility fix has to be applied consistently.

There can also be a cost when the layout changes while someone is using it. In React, replacing one component type with another can [reset the state of the replaced subtree](https://react.dev/learn/preserving-and-resetting-state). Switching between separate form implementations at a breakpoint can therefore discard input if that state belongs to the removed subtree. A decision that appeared to concern layout has become a decision about state ownership.

Some interfaces do need different interactions at different sizes. A comparison tool might show several items beside each other in a wide view and offer a sequential flow in a narrow one. That deserves an explicit interaction design with shared application rules and deliberate handling of state and focus. Neither label makes those decisions for us.

For a general web interface, my default is a fluid foundation with changes where the content needs them. Predefined widths can still be a reasonable constraint when extending a legacy interface whose internal layout depends heavily on fixed dimensions. That may allow a useful improvement without replacing the whole layout system at once. The trade-off is accepting unused space between thresholds and maintaining the selected variants.

## Design and test the widths in between

Breakpoints should follow the point where an arrangement stops working for its content. A navigation bar might need to change because its labels no longer fit, rather than because a framework calls a particular width "tablet". This is also the [guidance on choosing breakpoints from web.dev](https://web.dev/articles/responsive-web-design-basics).

Design files often label their frames "mobile", "tablet" and "desktop". Those names can be convenient shorthand for the examples being reviewed but they do not describe distinct layout requirements. A desktop browser can occupy a narrow window. A tablet can be used with a keyboard and a convertible can switch between laptop and tablet configurations without changing the web page's underlying requirements. Even two phones can offer very different amounts of usable space.

The relevant constraint is the space available to the content, not the category of device displaying it. A component inside a side panel may have much less room than the viewport suggests. Treat the frames in Figma as examples of how the interface should look at particular sizes, not as separate device-specific versions of the product.

During review, resize continuously and inspect the regions just before and after each transition. Use realistic content, including longer translations and validation messages. A layout that works with three short labels may fail with the content the application actually has to display.

Also check zoom and keyboard use. The [WCAG guidance on reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) explains why adapting content to a narrow view matters for people who magnify a page. Visual rearrangement must preserve a meaningful reading and focus order, which is another reason to [start with semantic HTML](/blog/start-with-semantic-html) and treat layout as its presentation.

For either approach the design needs to explain what grows, what stays fixed and when the arrangement changes. A few approved screenshots cannot express all of that. The implementation has to work through the space between them, where people will also use the product.
