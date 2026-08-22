import assert from "node:assert";
import { suite, test } from "mocha";
import { contactEmailAddress } from "./contact-email.ts";

suite("contactEmailAddress", function () {
	test("uses the public contact email address", function () {
		const actualContactEmailAddress = contactEmailAddress;
		const expectedContactEmailAddress = "blog@echooff.de";

		assert.strictEqual(actualContactEmailAddress, expectedContactEmailAddress);
	});
});
