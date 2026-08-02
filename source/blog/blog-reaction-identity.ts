import { randomBytes } from "node:crypto";
import type { Buffer } from "node:buffer";
import { isDirectInstanceOf } from "@sindresorhus/is";
import { type } from "arktype";
import { just, nothing, type Maybe } from "true-myth/maybe";
import { err, ok, type Result } from "true-myth/result";
import {
	anonymousReactorIdentifierByteCount,
	anonymousReactorIdentifierSchema,
	type AnonymousReactorIdentifier
} from "./blog-reaction-identity-schema.ts";

export type AnonymousReactorIdentityOptions = {
	readonly generateRandomBytes: (byteCount: number) => Buffer;
};

export type MalformedAnonymousReactorIdentifierError = {
	readonly kind: "malformed_anonymous_reactor_identifier";
};

export type AnonymousReactorIdentifierParseResult = Result<
	Maybe<AnonymousReactorIdentifier>,
	MalformedAnonymousReactorIdentifierError
>;

export function createAnonymousReactorIdentifier(
	anonymousReactorIdentityOptions: AnonymousReactorIdentityOptions
): AnonymousReactorIdentifier {
	const { generateRandomBytes } = anonymousReactorIdentityOptions;
	const anonymousReactorIdentifier = generateRandomBytes(anonymousReactorIdentifierByteCount).toString("base64url");

	return anonymousReactorIdentifierSchema.assert(anonymousReactorIdentifier);
}

export function parseAnonymousReactorIdentifier(
	anonymousReactorCookieValue: Maybe<string>
): AnonymousReactorIdentifierParseResult {
	return anonymousReactorCookieValue.match({
		Just(cookieValue) {
			const parsedAnonymousReactorIdentifier = anonymousReactorIdentifierSchema(cookieValue);

			if (isDirectInstanceOf(parsedAnonymousReactorIdentifier, type.errors)) {
				return err({
					kind: "malformed_anonymous_reactor_identifier"
				});
			}

			return ok(just(parsedAnonymousReactorIdentifier));
		},
		Nothing() {
			return ok(nothing<AnonymousReactorIdentifier>());
		}
	});
}

export const productionAnonymousReactorIdentityOptions: AnonymousReactorIdentityOptions = {
	generateRandomBytes: randomBytes
};
