import { Result } from "true-myth";
import { format, parseISO } from "date-fns";

export function formatSinceDate(since: string, onlyYear: boolean): Result<string, string> {
    try {
        const formatString = onlyYear ? "yyyy" : "MMMM yyyy";
        const formatToString = format(parseISO(since), formatString);

        return Result.ok(formatToString);
    } catch {
        return Result.err(`Since "${since}" is not a valid date`);
    }
}
