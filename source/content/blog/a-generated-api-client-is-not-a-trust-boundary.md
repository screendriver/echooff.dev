---
title: "A generated API client is not a trust boundary"
description: "Generated TypeScript types describe API responses. Runtime validation checks the data before the application uses it."
publishedAt: "2026-10-23T15:52:00+02:00"
topic: "Architecture"
---

A generated API client can give a request a precise return type while leaving the actual response unchecked. Calling `getOrder()` may produce a value TypeScript treats as an `OrderResponse` even when the server returned something the application cannot use.

I avoid generated API clients by default. For an integration with a few straightforward operations I prefer a small handwritten client with explicit response validation. I do not add a code generator merely because an OpenAPI description is available. It needs to save enough repetitive work to justify maintaining its configuration and regeneration step.

In [Clean Architecture protects the happy zone](/blog/clean-architecture-protects-the-happy-zone) I described boundary code that checks external values before passing them into application logic. Generating an API client does not establish that those checks happen. Neither does a successful build or a passing contract test.

Some generators also produce runtime validators and call them when a response arrives. Those checks can reject invalid data before the client returns it to the application.

## A generated type can express less than the contract

An [OpenAPI description](https://spec.openapis.org/oas/latest.html) can define more than property names and primitive types. A field representing an order total might require `type: integer` and `minimum: 0`.

Consider a generated operation with this simplified public declaration:

```typescript
type OrderResponse = {
  id: string;
  status: "draft" | "submitted";
  totalInCents: number;
};

declare function getOrder(orderId: string): Promise<OrderResponse>;
```

The `number` property does not express either numeric restriction. Both `-1` and `12.5` satisfy that TypeScript type while violating the described API contract.

The response could also contain a string where the declaration says `number`. [TypeScript type annotations and assertions do not add runtime checks](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions). Successfully parsing the JSON body does not mean the resulting value is an order. A generic request function such as `request<OrderResponse>()` does not change that unless its implementation performs validation.

Generated types can catch a missing request parameter or an incorrect property access during compilation. They help us write code against the API description but cannot check a response that arrives after the application has been built.

## Regenerating the client does not update running applications

Regenerating a client from an updated OpenAPI description can help catch incompatible changes during compilation. If a field has been renamed the compiler can point to code that still uses the old name.

But regenerating a client only changes the code being built. It does not update a browser tab that was opened before the latest deployment. That tab may continue calling a service whose implementation has changed. Keeping both projects in the same repository does not make every running client use the latest version.

A service can also return invalid data without a contract change. It might read a malformed value from storage and include it in a response without checking it.

## Contract tests check specific interactions

Contract tests can catch incompatibilities before deployment. For example [Pact verifies interactions described by a consumer against a provider](https://docs.pact.io/getting_started/how_pact_works), including the provider states needed to exercise them.

A passing contract test shows that the tested provider version handled those interactions as expected. A request involving data the tests did not cover can still produce an invalid response in production.

Runtime validation checks the response when it arrives. It can reject invalid data before application logic uses it.

## Validate the response in the adapter

The generated operation can remain an implementation detail of the code that loads an order. Until response validation has run, that code should treat the decoded body as `unknown`, even if the generated function declares a more specific return type.

The application can define a result that distinguishes a loaded order from an unusable response:

```typescript
import type { Order } from "./order.js";

export type LoadOrderResult =
  | { status: "loaded"; order: Order }
  | { status: "failed"; error: "invalidOrderResponse" };
```

The adapter can use the `parseOrderResponse` function from [Runtime validation is a boundary concern](/blog/runtime-validation-is-a-boundary-concern). That parser checks the fields the application needs and constructs its own `Order` representation:

```typescript
import type { LoadOrderResult } from "./load-order-result.js";
import { parseOrderResponse } from "./parse-order-response.js";

type RequestOrder = (orderId: string) => Promise<unknown>;

export async function loadOrder(
  orderId: string,
  requestOrder: RequestOrder
): Promise<LoadOrderResult> {
  const externalOrder = await requestOrder(orderId);
  const result = parseOrderResponse(externalOrder);

  if (result.status === "invalid") {
    return { status: "failed", error: result.error };
  }

  return { status: "loaded", order: result.order };
}
```

A generated `getOrder` returning `Promise<OrderResponse>` can be supplied as `requestOrder`. The adapter treats its result as `unknown` until `parseOrderResponse` has checked it. The parser performs the validation; the `unknown` annotation does not.

This example assumes the request operation resolves with the decoded response body. An SDK that wraps it in a `data` property needs that body extracted first. Network failures, unsuccessful HTTP responses and JSON-decoding failures still need the adapter's normal error handling; the request promise can reject.

Replacing a malformed total with zero would invent an order total. Reporting the order as missing would invent a different result. Neither tells the caller that it failed to obtain usable data.

## Generated validators can perform the checks

None of this requires manually reproducing the entire OpenAPI schema. A generator can produce executable validators as well as TypeScript declarations. [Hey API, for example, supports generated response validators](https://heyapi.dev/docs/openapi/typescript/plugins/sdk#validators) that can be connected to its SDK operations.

The validation has to run on the response path the application uses. Generating a schema file beside the client does not mean the client uses it. A deserializer that parses JSON or converts selected fields is also not necessarily checking the constraints the application needs.

If the generated client already checks the required fields and values, the adapter can use that result. There is no reason to repeat those checks in a handwritten parser. It still needs to map the response into application data and check any requirements the generated validator does not cover.

The earlier order parser checks what this consumer needs; it does not claim to verify every property in the provider's complete contract. An unrelated extra property need not invalidate an otherwise usable order. If the server returns a status the application does not understand, the adapter needs to handle it explicitly, for example by rejecting the response or reporting the status as unsupported.

Importing a generated response type throughout the business logic ties that logic to the provider's representation, even when every field has been checked. The adapter remains the place to translate that representation into the data the application uses.

Passing validation does not tell you whether the order has since changed or whether the user is allowed to modify it.

## Test that validation is actually connected

For a generated client with runtime validation a useful integration test sends a malformed response through the same response-handling path the application uses and verifies that it is rejected. Calling a generated validator directly in a test would not reveal that the SDK never invokes it.

The application's adapter can also be tested independently. Its `Promise<unknown>` dependency lets a test return a malformed response without asserting that it is an `OrderResponse`. A valid response should become the expected application order; a response that violates a required constraint should produce the agreed failure. Those tests exercise the adapter without importing the generated client or contacting a real provider.

Before application logic receives an order, the code handling the response must have checked the assumptions that logic relies on. A generated client can perform those checks, but its return type alone does not tell us whether it does.
