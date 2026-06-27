import { err, ok, type Result } from "true-myth/result";
import { format, parseISO } from "date-fns";

export function formatSinceDate(since: string, onlyYear: boolean): Result<string, RangeError> {
	const formatString = onlyYear ? "yyyy" : "MMMM yyyy";

	try {
		const formatToString = format(parseISO(since), formatString);

		return ok(formatToString);
	} catch {
		return err(new RangeError(`Since "${since}" is not a valid date`));
	}
}
