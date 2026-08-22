---
title: "Runtime validation is a boundary concern"
description: "Runtime validation belongs where external data becomes application data. Parse every ingress once so the happy zone can trust its own types."
publishedAt: "2026-08-22T08:19:00+02:00"
topic: "Architecture"
---

In [Clean Architecture protects the happy zone](/blog/clean-architecture-protects-the-happy-zone), I described the DMZ as the boundary between the messy outside world and the application logic we want to keep stable.

Runtime validation is one of the most important jobs of that boundary.

TypeScript can check relationships between values inside the program. It cannot verify that a network response follows an interface, that a value in local storage still has the expected shape, that an environment variable contains a usable number or that a user submitted what the interface expected.

Those values exist at runtime.

They have to be checked at runtime.

But that does not mean runtime validation should be scattered throughout the application. It does not belong in every function as another defensive check. It does not belong inside business rules merely because a schema library makes refinements convenient.

Runtime validation belongs where trust changes.

The outside world provides an unknown value.

The boundary turns it into application data.

## The outside world should enter as `unknown`

A value from the outside world is not trustworthy merely because TypeScript has a type ready for it.

An HTTP response, WebSocket message, request body, URL parameter, form submission, file import, environment variable or value read from storage may have the expected shape.

It may also be missing a field, contain an old representation, use the wrong primitive type or include a value the application has never seen before.

That remains true when the data comes from a backend owned by the same company. Clients and servers may be deployed independently. Stored data may outlive the code that created it. Migrations may be incomplete. A service can contain a bug.

The useful default is therefore simple:

External data is `unknown` until an application-owned boundary has parsed it.

That is not pessimism.

It is an honest description of what the program knows.

## A type assertion does not create a boundary

This code looks typed:

```typescript
type OrderStatus = "draft" | "submitted";

type OrderResponse = {
  id: string;
  status: OrderStatus;
  total_in_cents: number;
};

const externalOrder = (await response.json()) as OrderResponse;
```

Nothing in this code proves that the response is an `OrderResponse`.

The type assertion only instructs TypeScript to trust the author. It does not inspect the value. It does not reject an unknown status. It does not notice that `total_in_cents` is a string. It does not protect the code that receives the value next.

The application has not created a boundary.

It has removed a compiler warning.

Generated TypeScript types have the same limitation unless the generated client also performs runtime decoding. They describe a snapshot of an external contract at generation time. The provider may be deployed independently, the description may become stale and one response may violate the contract even when the description is current.

Code generation does not remove the boundary. At most it can generate part of the boundary when it emits a runtime decoder. Static types improve development-time feedback. They are not runtime evidence.

The transition into trusted application data still needs to happen somewhere.

## Parse external data into application data

A boundary should accept `unknown`, validate the external representation and map it into a value owned by the application.

The application model can remain ordinary TypeScript:

```typescript
export type OrderStatus = "draft" | "submitted";

export type Order = {
  id: string;
  status: OrderStatus;
  totalInCents: number;
};
```

For example, the boundary can use Zod to validate and map the external response:

```typescript
import { z } from "zod";

import type { Order } from "./order.js";

const orderResponseSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["draft", "submitted"]),
  total_in_cents: z.number().int().nonnegative()
});

type ParseOrderResponseResult =
  | { status: "parsed"; order: Order }
  | { status: "invalid"; error: "invalidOrderResponse" };

export function parseOrderResponse(
  externalOrder: unknown
): ParseOrderResponseResult {
  const parseResult = orderResponseSchema.safeParse(externalOrder);

  if (!parseResult.success) {
    return {
      status: "invalid",
      error: "invalidOrderResponse"
    };
  }

  return {
    status: "parsed",
    order: {
      id: parseResult.data.id,
      status: parseResult.data.status,
      totalInCents: parseResult.data.total_in_cents
    }
  };
}
```

The parser has one responsibility: turn one external representation into one application value or reject it.

The code that performs the network request can fetch and decode the response. The parser validates and maps the decoded value. The happy zone receives an `Order`.

Those responsibilities do not need to be mixed into one function.

The mapping is also deliberate. The external API uses `total_in_cents`. The application uses `totalInCents`. They may currently contain the same information, but they belong to different models with different owners.

That distinction gives both sides room to change.

The parser also prevents validation-library details from becoming part of the application contract. Callers do not have to handle a `ZodError`, and the happy zone only receives an `Order`.

The tool is replaceable.

The boundary is not.

## Validate once at every ingress

Runtime validation should be systematic, but it should not be everywhere.

Every path from an external representation into trusted application data needs a boundary. An HTTP response needs one. A message from a WebSocket or worker needs one. Data deserialized from local storage, IndexedDB, a database result, a file or configuration needs one. Raw user input needs one before it becomes an application value.

That boundary may use a schema parser, a generated decoder or another adapter with runtime guarantees. What matters is that a plain TypeScript type is not mistaken for runtime evidence.

Once the value has crossed that boundary successfully, inner code should be allowed to trust it.

Calling `safeParse` again in every service and every business function does not make the architecture safer. It makes the trust boundary unclear. It spreads infrastructure concerns inward and forces the application to keep asking a question that should already have been answered.

Validation should reduce defensive code.

It should not reproduce defensive code at every layer.

Trust is established per ingress. When data is serialized and later read again, it crosses another boundary and should be parsed again. When an already validated `Order` is passed from one application function to another, it has not crossed a new trust boundary.

It does not need to prove what it is again.

## Runtime validation is not business validation

Not every rule that can be expressed in a schema belongs in the DMZ.

The boundary asks whether an external value can become an `Order`. Does it contain an identifier? Is the total a non-negative integer? Is the status part of the application vocabulary?

The happy zone asks what the application may do with that order. May it be cancelled? Does it qualify for a discount? Is another transition allowed from its current state?

Those are different questions.

A schema library may be able to express both with custom refinements. That capability does not decide where the rule belongs.

Rules that define whether an external representation can become a valid application value belong at the boundary. Rules that decide application behavior belong in the happy zone.

Moving business decisions into schema refinements can make the code look compact, but it turns a boundary parser into a hidden business-rules engine. The important decisions become coupled to a validation library and harder to find, compose and test as ordinary application logic.

The DMZ protects the happy zone.

It should not replace it.

## Boundary tests are high-value unit tests

A parser is usually a small pure function from `unknown` to a semantic result.

That makes it an excellent unit-test boundary.

```typescript
import assert from "node:assert";
import test from "node:test";

import { parseOrderResponse } from "./parse-order-response.js";

test("maps a valid response to an application order", () => {
  const result = parseOrderResponse({
    id: "order-123",
    status: "submitted",
    total_in_cents: 12_500
  });

  assert.deepStrictEqual(result, {
    status: "parsed",
    order: {
      id: "order-123",
      status: "submitted",
      totalInCents: 12_500
    }
  });
});

test("rejects a total with the wrong runtime type", () => {
  const result = parseOrderResponse({
    id: "order-123",
    status: "submitted",
    total_in_cents: "12500"
  });

  assert.deepStrictEqual(result, {
    status: "invalid",
    error: "invalidOrderResponse"
  });
});

test("rejects a status outside the application vocabulary", () => {
  const result = parseOrderResponse({
    id: "order-123",
    status: "archived",
    total_in_cents: 12_500
  });

  assert.deepStrictEqual(result, {
    status: "invalid",
    error: "invalidOrderResponse"
  });
});
```

These tests are not trying to prove that Zod works.

They prove which external values the application accepts, how accepted values are mapped and which malformed representations are rejected.

The same boundary can be tested with missing properties, `undefined`, `null`, arrays, invalid dates, empty identifiers and values at important limits. Those cases are deterministic because the test owns the input completely.

This complements [Don't test what you don't control](/blog/dont-test-what-you-dont-control). A unit test can prove how the application behaves when an external dependency returns invalid data without requiring that dependency to be deployed, available or deliberately broken. Separate contract and integration tests can verify whether the real provider still follows the agreement.

Once the parser has established the application value, happy-zone tests do not need to repeat malformed JSON scenarios. They can construct an `Order` and focus on business behavior.

The boundary tests the transition into trust.

The happy zone tests what the application does with trusted values.

## Do not let the schema library become the domain model

Schema libraries often make it convenient to infer a TypeScript type directly from a schema.

That can be reasonable for a small boundary representation whose runtime and static shapes are intentionally the same. Avoiding duplication is useful when the duplication carries no architectural meaning.

But an external response type and an application model are not automatically the same concept merely because their properties currently match.

Using `z.infer` for every domain type can quietly make the schema library the owner of the inner model. A change in an external payload then becomes a change throughout the application. Mapping disappears. Boundary decisions become difficult to see because the external and internal representations have been declared identical by construction.

For important application values, I prefer to define the application type independently and map into it at the boundary.

That small amount of duplication is often useful. It preserves ownership.

The practical test is not whether the code uses Zod, ArkType, Valibot or a handwritten parser. It is whether code inside the happy zone needs to know.

If replacing the validation library requires rewriting business rules, the boundary has leaked.

## The guarantee has a scope

Runtime validation does not prove that the entire application is correct. Code can still construct the wrong internal value, mutate a previously valid object or bypass the boundary with `any` and unchecked type assertions.

What the boundary can provide is a narrower and still valuable guarantee: every external value admitted through this boundary satisfied the application's requirements when it entered.

That is enough for the happy zone to trust its inputs. If an impossible value appears later, the problem is no longer an unexpected network response. It is a boundary violation or an internal bug.

Runtime validation turns invalid external data into a boundary failure before it becomes application state.

## Final thought

Runtime validation is not a collection of schemas distributed throughout a codebase.

It is a gate between representations.

The outside world provides values the application cannot trust. The DMZ validates, parses and maps them. The happy zone receives application-owned data and makes decisions with it.

Validate every ingress.

Test those boundaries aggressively.

Then stop validating and let the inner code trust the contracts the architecture has established.

The happy zone should not defend itself from random JSON.

The boundary should make sure random JSON never gets there.
