import { Result, ok, err } from 'true-myth/result';
import { format, parseISO } from 'date-fns/fp';

export function formatSinceDate(since: string, onlyYear: boolean): Result<string, string> {
    try {
        const formatString = onlyYear ? 'yyyy' : 'MMMM yyyy';
        const formatToString = format(formatString);

        return ok(formatToString(parseISO(since)));
    } catch {
        return err(`Since "${since}" is not a valid date`);
    }
}
