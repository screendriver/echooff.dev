import test from "ava";
import { stripIndent } from "common-tags";
import { Factory } from "fishery";
import { ZodError } from "zod";
import {
    contactFormUrlSchema,
    ContactStateMachineContext,
    contactStateMachineContextSchema,
} from "../../../../src/components/contact/state-machine-schema";

const contactStateMachineContextFactory = Factory.define<ContactStateMachineContext>(() => {
    return {
        name: "foo",
        email: "bar@example.com",
        message: "baz",
    };
});

test("contactFormUrlSchema fails when it is undefined", (t) => {
    t.throws(() => contactFormUrlSchema.parse(undefined), {
        instanceOf: ZodError,
        message: stripIndent`
    [
      {
        "code": "invalid_type",
        "expected": "string",
        "received": "undefined",
        "path": [],
        "message": "Required"
      }
    ]`,
    });
});

test("contactFormUrlSchema fails when it is not a string", (t) => {
    t.throws(() => contactFormUrlSchema.parse(42), {
        instanceOf: ZodError,
        message: stripIndent`
    [
      {
        "code": "invalid_type",
        "expected": "string",
        "received": "number",
        "path": [],
        "message": "Expected string, received number"
      }
    ]`,
    });
});

test("contactFormUrlSchema fails when it is an empty string", (t) => {
    t.throws(() => contactFormUrlSchema.parse(""), {
        instanceOf: ZodError,
        message: stripIndent`
    [
      {
        "code": "too_small",
        "minimum": 1,
        "type": "string",
        "inclusive": true,
        "message": "String must contain at least 1 character(s)",
        "path": []
      }
    ]`,
    });
});

test("contactFormUrlSchema succeeds when it is a string", (t) => {
    const { success } = contactFormUrlSchema.safeParse("/");

    t.true(success);
});

test("contactStateMachineContextSchema fails to parse when name is not defined", (t) => {
    const data = contactStateMachineContextFactory.build({
        name: undefined,
    });
    t.throws(() => contactStateMachineContextSchema.parse(data), {
        instanceOf: ZodError,
        message: stripIndent`
      [
        {
          "code": "invalid_type",
          "expected": "string",
          "received": "undefined",
          "path": [
            "name"
          ],
          "message": "Required"
        }
      ]`,
    });
});

test("contactStateMachineContextSchema fails to parse when name is an empty string", (t) => {
    const data = contactStateMachineContextFactory.build({
        name: "",
    });
    t.throws(() => contactStateMachineContextSchema.parse(data), {
        instanceOf: ZodError,
        message: stripIndent`
      [
        {
          "code": "too_small",
          "minimum": 1,
          "type": "string",
          "inclusive": true,
          "message": "String must contain at least 1 character(s)",
          "path": [
            "name"
          ]
        }
      ]`,
    });
});

test("contactStateMachineContextSchema fails to parse when name is not a string", (t) => {
    const data = contactStateMachineContextFactory.build({
        name: 42,
    } as unknown as ContactStateMachineContext);
    t.throws(() => contactStateMachineContextSchema.parse(data), {
        instanceOf: ZodError,
        message: stripIndent`
      [
        {
          "code": "invalid_type",
          "expected": "string",
          "received": "number",
          "path": [
            "name"
          ],
          "message": "Expected string, received number"
        }
      ]`,
    });
});

test("contactStateMachineContextSchema fails to parse when email is not defined", (t) => {
    const data = contactStateMachineContextFactory.build({
        email: undefined,
    });
    t.throws(() => contactStateMachineContextSchema.parse(data), {
        instanceOf: ZodError,
        message: stripIndent`
      [
        {
          "code": "invalid_type",
          "expected": "string",
          "received": "undefined",
          "path": [
            "email"
          ],
          "message": "Required"
        }
      ]`,
    });
});

test("contactStateMachineContextSchema fails to parse when email is an empty string", (t) => {
    const data = contactStateMachineContextFactory.build({
        email: "",
    });
    t.throws(() => contactStateMachineContextSchema.parse(data), {
        instanceOf: ZodError,
        message: stripIndent`
      [
        {
          "validation": "email",
          "code": "invalid_string",
          "message": "Invalid email",
          "path": [
            "email"
          ]
        }
      ]`,
    });
});

test("contactStateMachineContextSchema fails to parse email name is not a string", (t) => {
    const data = contactStateMachineContextFactory.build({
        email: 42,
    } as unknown as ContactStateMachineContext);
    t.throws(() => contactStateMachineContextSchema.parse(data), {
        instanceOf: ZodError,
        message: stripIndent`
      [
        {
          "code": "invalid_type",
          "expected": "string",
          "received": "number",
          "path": [
            "email"
          ],
          "message": "Expected string, received number"
        }
      ]`,
    });
});

test("contactStateMachineContextSchema fails to parse when email is not a valid email address", (t) => {
    const data = contactStateMachineContextFactory.build({
        email: "foo@bar",
    });
    t.throws(() => contactStateMachineContextSchema.parse(data), {
        instanceOf: ZodError,
        message: stripIndent`
    [
      {
        "validation": "email",
        "code": "invalid_string",
        "message": "Invalid email",
        "path": [
          "email"
        ]
      }
    ]`,
    });
});

test("contactStateMachineContextSchema fails to parse when message is not defined", (t) => {
    const data = contactStateMachineContextFactory.build({
        message: undefined,
    });
    t.throws(() => contactStateMachineContextSchema.parse(data), {
        instanceOf: ZodError,
        message: stripIndent`
    [
      {
        "code": "invalid_type",
        "expected": "string",
        "received": "undefined",
        "path": [
          "message"
        ],
        "message": "Required"
      }
    ]`,
    });
});

test("contactStateMachineContextSchema fails to parse when message is an empty string", (t) => {
    const data = contactStateMachineContextFactory.build({
        message: "",
    });
    t.throws(() => contactStateMachineContextSchema.parse(data), {
        instanceOf: ZodError,
        message: stripIndent`
    [
      {
        "code": "too_small",
        "minimum": 1,
        "type": "string",
        "inclusive": true,
        "message": "String must contain at least 1 character(s)",
        "path": [
          "message"
        ]
      }
    ]`,
    });
});

test("contactStateMachineContextSchema fails to parse when message is not a string", (t) => {
    const data = contactStateMachineContextFactory.build({
        message: 42,
    } as unknown as ContactStateMachineContext);
    t.throws(() => contactStateMachineContextSchema.parse(data), {
        instanceOf: ZodError,
        message: stripIndent`
    [
      {
        "code": "invalid_type",
        "expected": "string",
        "received": "number",
        "path": [
          "message"
        ],
        "message": "Expected string, received number"
      }
    ]`,
    });
});

test("contactStateMachineContextSchema succeeds when all fields are filled correctly", (t) => {
    const data = contactStateMachineContextFactory.build();
    const { success } = contactStateMachineContextSchema.safeParse(data);

    t.true(success);
});
