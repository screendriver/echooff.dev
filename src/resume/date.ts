import { Result } from 'true-myth';
import { format, parseISO } from 'date-fns/fp';

export function formatSinceDate(since: string, onlyYear: boolean): Result<string, string> {
    try {
        const formatString = onlyYear ? 'yyyy' : 'MMMM yyyy';
        const formatToString = format(formatString);
        return Result.ok(formatToString(parseISO(since)));
    } catch {
        return Result.err(`Since "${since}" is not a valid date`);
    }
}
