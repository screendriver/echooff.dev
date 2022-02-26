import test from 'ava';
import { stripIndent } from 'common-tags';
import { Factory } from 'fishery';
import { ZodError } from 'zod';
import {
    ContactStateMachineContext,
    contactStateMachineContextSchema,
} from '../../../src/contact/state-machine-context-schema';

const contactStateMachineContextFactory = Factory.define<ContactStateMachineContext>(() => {
    return {
        name: 'foo',
        email: 'bar@example.com',
        message: 'baz',
    };
});

test('fails to parse when name is not defined', (t) => {
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

test('fails to parse when name is an empty string', (t) => {
    const data = contactStateMachineContextFactory.build({
        name: '',
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
          "message": "Should be at least 1 characters",
          "path": [
            "name"
          ]
        }
      ]`,
    });
});

test('fails to parse when name is not a string', (t) => {
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

test('fails to parse when email is not defined', (t) => {
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

test('fails to parse when email is an empty string', (t) => {
    const data = contactStateMachineContextFactory.build({
        email: '',
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

test('fails to parse email name is not a string', (t) => {
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

test('fails to parse when email is not a valid email address', (t) => {
    const data = contactStateMachineContextFactory.build({
        email: 'foo@bar',
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

test('fails to parse when message is not defined', (t) => {
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

test('fails to parse when message is an empty string', (t) => {
    const data = contactStateMachineContextFactory.build({
        message: '',
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
        "message": "Should be at least 1 characters",
        "path": [
          "message"
        ]
      }
    ]`,
    });
});

test('fails to parse when message is not a string', (t) => {
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

test('succeeds when all fields are filled correctly', (t) => {
    const data = contactStateMachineContextFactory.build();
    const { success } = contactStateMachineContextSchema.safeParse(data);

    t.true(success);
});
