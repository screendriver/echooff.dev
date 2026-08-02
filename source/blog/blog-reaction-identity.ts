import { randomBytes } from "node:crypto";
import type { Buffer } from "node:buffer";
import {
	anonymousReactorIdentifierByteCount,
	anonymousReactorIdentifierSchema,
	type AnonymousReactorIdentifier
} from "./blog-reaction-identity-schema.ts";

export type AnonymousReactorIdentityOptions = {
	readonly generateRandomBytes: (byteCount: number) => Buffer;
};

export function createAnonymousReactorIdentifier(
	anonymousReactorIdentityOptions: AnonymousReactorIdentityOptions
): AnonymousReactorIdentifier {
	const { generateRandomBytes } = anonymousReactorIdentityOptions;
	const anonymousReactorIdentifier = generateRandomBytes(anonymousReactorIdentifierByteCount).toString("base64url");

	return anonymousReactorIdentifierSchema.assert(anonymousReactorIdentifier);
}

export const productionAnonymousReactorIdentityOptions: AnonymousReactorIdentityOptions = {
	generateRandomBytes: randomBytes
};
