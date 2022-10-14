import { test, assert } from "vitest";
import { stripIndent } from "common-tags";
import { Factory } from "fishery";
import { ZodError } from "zod";
import {
	contactFormUrlSchema,
	ContactStateMachineContext,
	contactStateMachineContextSchema
} from "../../../src/contact/state-machine-schema";

const contactStateMachineContextFactory = Factory.define<ContactStateMachineContext>(() => {
	return {
		name: "foo",
		email: "bar@example.com",
		message: "baz"
	};
});

test("contactFormUrlSchema fails when it is undefined", () => {
	assert.throws(
		() => contactFormUrlSchema.parse(undefined),
		ZodError,
		stripIndent`
    [
      {
        "code": "invalid_type",
        "expected": "string",
        "received": "undefined",
        "path": [],
        "message": "Required"
      }
    ]`
	);
});

test("contactFormUrlSchema fails when it is not a string", () => {
	assert.throws(
		() => contactFormUrlSchema.parse(42),
		ZodError,
		stripIndent`
    [
      {
        "code": "invalid_type",
        "expected": "string",
        "received": "number",
        "path": [],
        "message": "Expected string, received number"
      }
    ]`
	);
});

test("contactFormUrlSchema fails when it is an empty string", () => {
	assert.throws(
		() => contactFormUrlSchema.parse(""),
		ZodError,
		stripIndent`
    [
      {
        "code": "too_small",
        "minimum": 1,
        "type": "string",
        "inclusive": true,
        "message": "String must contain at least 1 character(s)",
        "path": []
      }
    ]`
	);
});

test("contactFormUrlSchema succeeds when it is a string", () => {
	const { success } = contactFormUrlSchema.safeParse("/");

	assert.isTrue(success);
});

test("contactStateMachineContextSchema fails to parse when name is not defined", () => {
	const data = contactStateMachineContextFactory.build({
		name: undefined
	});
	assert.throws(
		() => contactStateMachineContextSchema.parse(data),
		ZodError,
		stripIndent`
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
      ]`
	);
});

test("contactStateMachineContextSchema fails to parse when name is an empty string", () => {
	const data = contactStateMachineContextFactory.build({
		name: ""
	});
	assert.throws(
		() => contactStateMachineContextSchema.parse(data),
		ZodError,
		stripIndent`
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
      ]`
	);
});

test("contactStateMachineContextSchema fails to parse when name is not a string", () => {
	const data = contactStateMachineContextFactory.build({
		name: 42
	} as unknown as ContactStateMachineContext);
	assert.throws(
		() => contactStateMachineContextSchema.parse(data),
		ZodError,
		stripIndent`
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
      ]`
	);
});

test("contactStateMachineContextSchema fails to parse when email is not defined", () => {
	const data = contactStateMachineContextFactory.build({
		email: undefined
	});
	assert.throws(
		() => contactStateMachineContextSchema.parse(data),
		ZodError,
		stripIndent`
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
      ]`
	);
});

test("contactStateMachineContextSchema fails to parse when email is an empty string", () => {
	const data = contactStateMachineContextFactory.build({
		email: ""
	});
	assert.throws(
		() => contactStateMachineContextSchema.parse(data),
		ZodError,
		stripIndent`
      [
        {
          "validation": "email",
          "code": "invalid_string",
          "message": "Invalid email",
          "path": [
            "email"
          ]
        }
      ]`
	);
});

test("contactStateMachineContextSchema fails to parse email name is not a string", () => {
	const data = contactStateMachineContextFactory.build({
		email: 42
	} as unknown as ContactStateMachineContext);
	assert.throws(
		() => contactStateMachineContextSchema.parse(data),
		ZodError,
		stripIndent`
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
      ]`
	);
});

test("contactStateMachineContextSchema fails to parse when email is not a valid email address", () => {
	const data = contactStateMachineContextFactory.build({
		email: "foo@bar"
	});
	assert.throws(
		() => contactStateMachineContextSchema.parse(data),
		ZodError,
		stripIndent`
    [
      {
        "validation": "email",
        "code": "invalid_string",
        "message": "Invalid email",
        "path": [
          "email"
        ]
      }
    ]`
	);
});

test("contactStateMachineContextSchema fails to parse when message is not defined", () => {
	const data = contactStateMachineContextFactory.build({
		message: undefined
	});
	assert.throws(
		() => contactStateMachineContextSchema.parse(data),
		ZodError,
		stripIndent`
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
    ]`
	);
});

test("contactStateMachineContextSchema fails to parse when message is an empty string", () => {
	const data = contactStateMachineContextFactory.build({
		message: ""
	});
	assert.throws(
		() => contactStateMachineContextSchema.parse(data),
		ZodError,
		stripIndent`
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
    ]`
	);
});

test("contactStateMachineContextSchema fails to parse when message is not a string", () => {
	const data = contactStateMachineContextFactory.build({
		message: 42
	} as unknown as ContactStateMachineContext);
	assert.throws(
		() => contactStateMachineContextSchema.parse(data),
		ZodError,
		stripIndent`
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
    ]`
	);
});

test("contactStateMachineContextSchema succeeds when all fields are filled correctly", () => {
	const data = contactStateMachineContextFactory.build();
	const { success } = contactStateMachineContextSchema.safeParse(data);

	assert.isTrue(success);
});
