import test from 'ava';
import { stripIndent } from 'common-tags';
import { ZodError } from 'zod';
import {
    gitHubApiTokenSchema,
    gitHubBaseUrlSchema,
    gitHubLoginSchema,
} from '../../../src/statistics/environment-variables';

test('gitHubBaseUrlSchema does not allow booleans', (t) => {
    t.throws(() => gitHubBaseUrlSchema.parse(true), {
        instanceOf: ZodError,
        message: stripIndent`
          [
            {
              "code": "invalid_type",
              "expected": "string",
              "received": "boolean",
              "path": [],
              "message": "Expected string, received boolean"
            }
          ]`,
    });
});

test('gitHubBaseUrlSchema does not allow numbers', (t) => {
    t.throws(() => gitHubBaseUrlSchema.parse(42), {
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

test('gitHubBaseUrlSchema does not allow empty strings', (t) => {
    t.throws(() => gitHubBaseUrlSchema.parse(''), {
        instanceOf: ZodError,
        message: stripIndent`
          [
            {
              "validation": "url",
              "code": "invalid_string",
              "message": "Invalid url",
              "path": []
            }
          ]`,
    });
});

test('gitHubBaseUrlSchema does not allow strings that are not an URL', (t) => {
    t.throws(() => gitHubBaseUrlSchema.parse('foo'), {
        instanceOf: ZodError,
        message: stripIndent`
          [
            {
              "validation": "url",
              "code": "invalid_string",
              "message": "Invalid url",
              "path": []
            }
          ]`,
    });
});

test('gitHubBaseUrlSchema allows a string URL', (t) => {
    const gitHubBaseUrl = gitHubBaseUrlSchema.parse('https://example.com');

    t.deepEqual(gitHubBaseUrl.toString(), new URL('https://example.com').toString());
});

test('gitHubLoginSchema does not allow booleans', (t) => {
    t.throws(() => gitHubLoginSchema.parse(true), {
        instanceOf: ZodError,
        message: stripIndent`
      [
        {
          "code": "invalid_type",
          "expected": "string",
          "received": "boolean",
          "path": [],
          "message": "Expected string, received boolean"
        }
      ]`,
    });
});

test('gitHubLoginSchema does not allow numbers', (t) => {
    t.throws(() => gitHubLoginSchema.parse(42), {
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

test('gitHubLoginSchema does not allow empty strings', (t) => {
    t.throws(() => gitHubLoginSchema.parse(''), {
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

test('gitHubLoginSchema allows non empty strings', (t) => {
    const gitHubLogin = gitHubLoginSchema.parse('foo');

    t.is(gitHubLogin, 'foo');
});

test('gitHubApiTokenSchema does not allow booleans', (t) => {
    t.throws(() => gitHubApiTokenSchema.parse(true), {
        instanceOf: ZodError,
        message: stripIndent`
      [
        {
          "code": "invalid_type",
          "expected": "string",
          "received": "boolean",
          "path": [],
          "message": "Expected string, received boolean"
        }
      ]`,
    });
});

test('gitHubApiTokenSchema does not allow numbers', (t) => {
    t.throws(() => gitHubApiTokenSchema.parse(42), {
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

test('gitHubApiTokenSchema does not allow empty strings', (t) => {
    t.throws(() => gitHubApiTokenSchema.parse(''), {
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

test('gitHubApiTokenSchema allows non empty strings', (t) => {
    const gitHubLogin = gitHubApiTokenSchema.parse('foo');

    t.is(gitHubLogin, 'foo');
});
