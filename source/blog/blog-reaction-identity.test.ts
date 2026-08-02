import assert from "node:assert";
import { Buffer } from "node:buffer";
import { suite, test } from "mocha";
import {
	anonymousReactorIdentifierByteCount,
	anonymousReactorIdentifierSchema
} from "./blog-reaction-identity-schema.ts";
import {
	createAnonymousReactorIdentifier,
	productionAnonymousReactorIdentityOptions,
	type AnonymousReactorIdentityOptions
} from "./blog-reaction-identity.ts";

function createDeterministicIdentityOptions(byteValue: number): AnonymousReactorIdentityOptions {
	return {
		generateRandomBytes(byteCount) {
			return Buffer.alloc(byteCount, byteValue);
		}
	};
}

suite("anonymous reactor identifier schema", function () {
	test("accepts a generated 32-byte base64url identifier", function () {
		const actualIdentifier = createAnonymousReactorIdentifier(createDeterministicIdentityOptions(1));

		assert.strictEqual(actualIdentifier.length, 43);
		assert.strictEqual(anonymousReactorIdentifierSchema.assert(actualIdentifier), actualIdentifier);
	});

	test("rejects empty, short, long, and malformed identifiers", function () {
		const invalidIdentifiers: unknown[] = [
			"",
			"a".repeat(42),
			"a".repeat(44),
			`${"a".repeat(42)}!`,
			`${"a".repeat(43)}=`
		];

		for (const invalidIdentifier of invalidIdentifiers) {
			assert.throws(() => {
				anonymousReactorIdentifierSchema.assert(invalidIdentifier);
			}, Error);
		}
	});
});

suite("createAnonymousReactorIdentifier()", function () {
	test("requests exactly 32 random bytes and uses base64url without padding", function () {
		let actualRequestedByteCount = 0;
		const anonymousReactorIdentityOptions: AnonymousReactorIdentityOptions = {
			generateRandomBytes(byteCount) {
				actualRequestedByteCount = byteCount;

				return Buffer.alloc(byteCount);
			}
		};

		const actualIdentifier = createAnonymousReactorIdentifier(anonymousReactorIdentityOptions);

		assert.strictEqual(actualRequestedByteCount, anonymousReactorIdentifierByteCount);
		assert.strictEqual(actualIdentifier.includes("="), false);
		assert.strictEqual(actualIdentifier, "A".repeat(43));
	});

	test("rejects a malformed generated identity instead of repairing it", function () {
		const malformedIdentityOptions: AnonymousReactorIdentityOptions = {
			generateRandomBytes() {
				return Buffer.alloc(31);
			}
		};

		assert.throws(() => {
			createAnonymousReactorIdentifier(malformedIdentityOptions);
		}, Error);
	});

	test("provides Node cryptography as the production generator", function () {
		const actualIdentifier = createAnonymousReactorIdentifier(productionAnonymousReactorIdentityOptions);

		assert.strictEqual(anonymousReactorIdentifierSchema.assert(actualIdentifier), actualIdentifier);
	});
});
