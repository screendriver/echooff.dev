import { just, nothing, Variant, type Maybe } from "true-myth/maybe";
import { err, ok, type Result } from "true-myth/result";
import { cachedMaybeStringSchema } from "./cached-mention-section-schema.ts";

export function parseCachedMaybeString(serializedMaybeValue: unknown): Result<Maybe<string>, TypeError> {
	if (!cachedMaybeStringSchema.allows(serializedMaybeValue)) {
		return err(new TypeError("Cached Maybe value is malformed."));
	}

	const cachedMaybeString = cachedMaybeStringSchema.assert(serializedMaybeValue);

	if (cachedMaybeString.variant === Variant.Nothing) {
		return ok(nothing());
	}

	return ok(just(cachedMaybeString.value));
}
