import { isPlainObject, isString } from "@sindresorhus/is";
import { just, nothing, Variant, type Maybe } from "true-myth/maybe";
import { err, ok, type Result } from "true-myth/result";

export function parseCachedMaybeString(serializedMaybeValue: unknown): Result<Maybe<string>, TypeError> {
	if (!isPlainObject(serializedMaybeValue)) {
		return err(new TypeError("Cached Maybe value must be an object."));
	}

	if (serializedMaybeValue.variant === Variant.Nothing) {
		return ok(nothing());
	}

	if (serializedMaybeValue.variant !== Variant.Just) {
		return err(new TypeError("Cached Maybe value has an unsupported variant."));
	}

	if (!isString(serializedMaybeValue.value)) {
		return err(new TypeError("Cached Maybe Just value must be a string."));
	}

	return ok(just(serializedMaybeValue.value));
}
