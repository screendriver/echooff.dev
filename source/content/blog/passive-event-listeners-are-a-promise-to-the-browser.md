---
title: "Passive event listeners are a promise to the browser"
description: "Passive event listeners let browsers scroll without waiting for JavaScript. The benefit comes from understanding what the listener gives up."
publishedAt: "2026-11-21T08:38:00+01:00"
topic: "Architecture"
---

Scrolling should not have to wait for JavaScript that only wants to observe a gesture. For a long time browsers often had no choice.

Consider a `wheel` listener that records how someone moves through a page. It might read `deltaY`, update a small piece of state and return. Nothing in that code needs to control scrolling. Because a `wheel` event can be canceled the browser may need to wait for the listener to finish before scrolling. Even a handler that never calls `preventDefault()` can therefore delay the response to a gesture.

## Why passive listeners exist

Passive event listeners were introduced to remove that unnecessary wait. Chrome added support in [version 51](https://blog.chromium.org/2016/05/) in 2016, initially addressing a problem that was particularly noticeable with touch input.

The API is small:

```typescript
scrollContainer.addEventListener("wheel", handleWheel, {
  passive: true
});
```

The option tells the browser that this particular listener will not cancel the event's default action. The browser can then proceed with scrolling without waiting for that listener to finish, provided nothing else requires it to wait.

A passive listener does not run on a background thread. It does not make the handler faster and it does not prevent expensive JavaScript from occupying the main thread. It removes one reason the browser might have to wait before scrolling. Depending on the browser and the page, scrolling can proceed on the compositor while the main thread is busy.

The browser has to preserve application behavior, including the possibility that JavaScript wants to prevent a native action. A passive listener gives it permission to stop waiting for a decision that will never come from that listener.

## Where the option helps

The main candidates are `touchstart`, `touchmove` and `wheel` listeners that observe input without trying to change the browser's default behavior.

A gesture listener might track the direction of a finger movement. A wheel listener might record interaction data or update an indicator while the page continues scrolling normally. If these handlers do not need to cancel scrolling, making them passive removes an unnecessary constraint on the browser.

It is also worth knowing what browsers already do. Chrome made `touchstart` and `touchmove` listeners passive by default on root targets in [version 56](https://developer.chrome.com/blog/scrolling-intervention/), and extended that behavior to `wheel` and `mousewheel` in [version 73](https://developer.chrome.com/blog/scrolling-intervention-2/). Modern browsers commonly use passive defaults for these events on document-level targets such as `window`, `document` and `body`. That does not mean every listener on every element is passive by default.

Explicitly declaring the option can still communicate intent, especially on an element where the default is not passive. But adding it indiscriminately is not a performance strategy.

A `scroll` listener, for example, cannot cancel scrolling in the first place. Making it passive does not unlock the same optimization. Likewise, marking an ordinary `click` handler passive does little for scrolling performance. The benefit depends on whether the browser would otherwise have to wait to learn if a default action will be canceled.

## What the promise costs

The trade-off is that `preventDefault()` no longer works inside a passive listener. The browser may issue a console warning, but the call will have no effect.

That can break real behavior. A drawing surface, a map or a custom gesture interaction may need to take control of touch input rather than let the page scroll. A wheel-driven interaction might intentionally replace normal scrolling. Those requirements are different from observing a gesture and they should not be treated as the same use case.

A passive listener can still do too much work. Expensive calculations, synchronous DOM operations or repeated state updates can make the application unresponsive. Passive listeners do not excuse poorly designed event handlers. They only remove one specific source of scroll delay. That distinction also matters when treating [application performance as a product requirement](/blog/application-performance-is-a-product-requirement): removing a scrolling bottleneck does not make expensive JavaScript harmless.

It is tempting to respond to a performance warning by adding `{ passive: true }` and moving on. That may silence the warning while changing the meaning of the interaction. The correct question is whether the handler ever needs to cancel the default action.

## Sometimes CSS expresses the intent better

For custom touch gestures, the CSS property [`touch-action`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/touch-action) is often a better starting point than preventing scrolling from an event listener.

```css
.drawing-surface {
  touch-action: none;
}
```

This tells the browser in advance that it should not handle touch panning or zooming on that surface. More selective values such as `pan-y` can preserve vertical scrolling while an application handles horizontal gestures. Disabling all native gestures is a significant choice, so `none` should be reserved for interactions that actually need it.

With `preventDefault()`, JavaScript can make the decision after an event arrives. With `touch-action`, the browser knows the intended behavior before the gesture starts. For pointer-based interactions that allows the browser and application to divide responsibility without relying on a cancelable touch listener.

There are legitimate cases for `{ passive: false }`, particularly with wheel input where an application must prevent the default action. The point is to make that decision deliberately, not to assume that every event listener should be passive.

Passive listeners are a small API with a specific purpose. They let the browser respond to input without waiting for JavaScript that has no need to control the default action. Used in the right place, that improves responsiveness. Used without considering the interaction, it can remove behavior the application depends on.

The useful decision comes first: whether a listener needs the ability to cancel native browser behavior. The `passive` option should reflect that decision.
