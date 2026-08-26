import assert from "node:assert";
import { suite, test } from "mocha";
import { impressumDetails, impressumEmailAddress } from "./impressum.ts";

suite("Impressum details", function () {
	test("contains the supplied legal identity and contact address", function () {
		assert.deepStrictEqual(impressumDetails, {
			legalName: "Christian Rackerseder",
			addressLines: ["c/o Impressumservice Dein-Impressum", "Stettiner Str. 41", "35410 Hungen", "Deutschland"]
		});
		assert.strictEqual(impressumEmailAddress, "blog@echooff.de");
	});
});
