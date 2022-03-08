import test from 'ava';
import { formatSinceDate } from '../../../src/resume/date';

interface Input {
    readonly since: string;
    readonly onlyYear: boolean;
}

const testErrMacro = test.macro<[Input, string]>((t, input, expected) => {
    const formattedDateResult = formatSinceDate(input.since, input.onlyYear);

    t.true(formattedDateResult.isErr, 'Result is not an Err');
    t.is(formattedDateResult.error, expected);
});

test(
    'formatSinceDate() returns a Result Err when "since" is an empty string and "onlyYear" is true',
    testErrMacro,
    { since: '', onlyYear: true },
    'Since "" is not a valid date',
);

test(
    'formatSinceDate() returns a Result Err when "since" is an empty string and "onlyYear" is false',
    testErrMacro,
    { since: '', onlyYear: true },
    'Since "" is not a valid date',
);

test(
    'formatSinceDate() returns a Result Err when "since" is an invalid string and "onlyYear" is true',
    testErrMacro,
    { since: 'foo', onlyYear: true },
    'Since "foo" is not a valid date',
);

test(
    'formatSinceDate() returns a Result Err when "since" is an invalid string and "onlyYear" is false',
    testErrMacro,
    { since: 'foo', onlyYear: false },
    'Since "foo" is not a valid date',
);

const testOkMacro = test.macro<[Input, string]>((t, input, expected) => {
    const formattedDateResult = formatSinceDate(input.since, input.onlyYear);

    t.true(formattedDateResult.isOk, 'Result is not an Ok');
    t.is(formattedDateResult.value, expected);
});

test(
    'formatSinceDate() returns a Result Ok with only the year',
    testOkMacro,
    { since: '2022-01-01', onlyYear: true },
    '2022',
);

test(
    'formatSinceDate() returns a Result Ok with the year and full month',
    testOkMacro,
    { since: '2022-02-01', onlyYear: false },
    'February 2022',
);
