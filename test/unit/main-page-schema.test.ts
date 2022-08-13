import test from 'ava';
import { Factory } from 'fishery';
import { Result } from 'true-myth';
import { parseMainPageData } from '../../src/main-page-schema';

const nodeFactory = Factory.define<Record<string, unknown>>(() => {
    return {
        company: {
            name: 'The company',
            url: 'https://example.com',
        },
        industry: 'some',
        jobDescription: 'description',
        jobTitle: 'title',
        showOnlyYear: false,
        since: 'now',
    };
});

const siteMetadataFactory = Factory.define<Record<string, unknown>>(() => {
    return {
        author: 'author',
        favicon: 'icon',
        jobTitle: 'title',
        keywords: 'test',
    };
});

const mainPageDataFactory = Factory.define<Record<string, unknown>>(() => {
    return {
        allResumeDataJson: {
            nodes: nodeFactory.buildList(1),
        },
        headerImage: {},
        site: {
            siteMetadata: siteMetadataFactory.build(),
        },
    };
});

test('parseMainPageData() returns an Err when given data is undefined', (t) => {
    t.deepEqual(parseMainPageData(undefined), Result.err('Required'));
});

test('parseMainPageData() returns an Err when given data is null', (t) => {
    t.deepEqual(parseMainPageData(null), Result.err('Expected object, received null'));
});

test('parseMainPageData() returns an Err when given data is an empty object', (t) => {
    t.deepEqual(parseMainPageData({}), Result.err('allResumeDataJson: Required\nsite: Required'));
});

test('parseMainPageData() returns an Err when given data contains additional unknown properties', (t) => {
    const mainPageData = mainPageDataFactory.build({
        foo: 'bar',
    });

    t.deepEqual(parseMainPageData(mainPageData), Result.err("Unrecognized key(s) in object: 'foo'"));
});

test('parseMainPageData() returns an Err when allResumeDataJson is undefined', (t) => {
    const mainPageData = mainPageDataFactory.build({
        allResumeDataJson: undefined,
    });

    t.deepEqual(parseMainPageData(mainPageData), Result.err('allResumeDataJson: Required'));
});

test('parseMainPageData() returns an Err when allResumeDataJson is null', (t) => {
    const mainPageData = mainPageDataFactory.build({
        allResumeDataJson: null,
    });

    t.deepEqual(parseMainPageData(mainPageData), Result.err('allResumeDataJson: Expected object, received null'));
});

test('parseMainPageData() returns an Err when allResumeDataJson contains additional unknown properties', (t) => {
    const mainPageData = mainPageDataFactory.build({
        allResumeDataJson: {
            nodes: nodeFactory.buildList(1),
            foo: 'bar',
        },
    });

    t.deepEqual(parseMainPageData(mainPageData), Result.err("allResumeDataJson: Unrecognized key(s) in object: 'foo'"));
});

test('parseMainPageData() returns an Err when allResumeDataJson.nodes is an empty Array', (t) => {
    const mainPageData = mainPageDataFactory.build({
        allResumeDataJson: {
            nodes: [],
        },
    });

    t.deepEqual(
        parseMainPageData(mainPageData),
        Result.err('allResumeDataJson.nodes: Array must contain at least 1 element(s)'),
    );
});

test('parseMainPageData() returns an Err when allResumeDataJson.nodes.0 contains additional unknown properties', (t) => {
    const mainPageData = mainPageDataFactory.build({
        allResumeDataJson: {
            nodes: nodeFactory.buildList(1, {
                foo: 'bar',
            }),
        },
    });

    t.deepEqual(
        parseMainPageData(mainPageData),
        Result.err("allResumeDataJson.nodes.0: Unrecognized key(s) in object: 'foo'"),
    );
});

test('parseMainPageData() returns an Err when allResumeDataJson.nodes.0.since is not a string', (t) => {
    const mainPageData = mainPageDataFactory.build({
        allResumeDataJson: {
            nodes: nodeFactory.buildList(1, {
                since: 42,
            }),
        },
    });

    t.deepEqual(
        parseMainPageData(mainPageData),
        Result.err('allResumeDataJson.nodes.0.since: Expected string, received number'),
    );
});

test('parseMainPageData() returns an Err when allResumeDataJson.nodes.0.since is an empty string', (t) => {
    const mainPageData = mainPageDataFactory.build({
        allResumeDataJson: {
            nodes: nodeFactory.buildList(1, {
                since: '',
            }),
        },
    });

    t.deepEqual(
        parseMainPageData(mainPageData),
        Result.err('allResumeDataJson.nodes.0.since: String must contain at least 1 character(s)'),
    );
});

test('parseMainPageData() returns an Err when allResumeDataJson.nodes.0.showOnlyYear is not a boolean', (t) => {
    const mainPageData = mainPageDataFactory.build({
        allResumeDataJson: {
            nodes: nodeFactory.buildList(1, {
                showOnlyYear: 42,
            }),
        },
    });

    t.deepEqual(
        parseMainPageData(mainPageData),
        Result.err('allResumeDataJson.nodes.0.showOnlyYear: Expected boolean, received number'),
    );
});

test('parseMainPageData() returns an Err when allResumeDataJson.nodes.0.industry is not a string', (t) => {
    const mainPageData = mainPageDataFactory.build({
        allResumeDataJson: {
            nodes: nodeFactory.buildList(1, {
                industry: 42,
            }),
        },
    });

    t.deepEqual(
        parseMainPageData(mainPageData),
        Result.err('allResumeDataJson.nodes.0.industry: Expected string, received number'),
    );
});

test('parseMainPageData() returns an Err when allResumeDataJson.nodes.0.industry is an empty string', (t) => {
    const mainPageData = mainPageDataFactory.build({
        allResumeDataJson: {
            nodes: nodeFactory.buildList(1, {
                industry: '',
            }),
        },
    });

    t.deepEqual(
        parseMainPageData(mainPageData),
        Result.err('allResumeDataJson.nodes.0.industry: String must contain at least 1 character(s)'),
    );
});

test('parseMainPageData() returns an Err when allResumeDataJson.nodes.0.jobTitle is not a string', (t) => {
    const mainPageData = mainPageDataFactory.build({
        allResumeDataJson: {
            nodes: nodeFactory.buildList(1, {
                jobTitle: 42,
            }),
        },
    });

    t.deepEqual(
        parseMainPageData(mainPageData),
        Result.err('allResumeDataJson.nodes.0.jobTitle: Expected string, received number'),
    );
});

test('parseMainPageData() returns an Err when allResumeDataJson.nodes.0.jobTitle is an empty string', (t) => {
    const mainPageData = mainPageDataFactory.build({
        allResumeDataJson: {
            nodes: nodeFactory.buildList(1, {
                jobTitle: '',
            }),
        },
    });

    t.deepEqual(
        parseMainPageData(mainPageData),
        Result.err('allResumeDataJson.nodes.0.jobTitle: String must contain at least 1 character(s)'),
    );
});

test('parseMainPageData() returns an Err when allResumeDataJson.nodes.0.jobDescription is not a string', (t) => {
    const mainPageData = mainPageDataFactory.build({
        allResumeDataJson: {
            nodes: nodeFactory.buildList(1, {
                jobDescription: 42,
            }),
        },
    });

    t.deepEqual(
        parseMainPageData(mainPageData),
        Result.err('allResumeDataJson.nodes.0.jobDescription: Expected string, received number'),
    );
});

test('parseMainPageData() returns an Err when allResumeDataJson.nodes.0.jobDescription is an empty string', (t) => {
    const mainPageData = mainPageDataFactory.build({
        allResumeDataJson: {
            nodes: nodeFactory.buildList(1, {
                jobDescription: '',
            }),
        },
    });

    t.deepEqual(
        parseMainPageData(mainPageData),
        Result.err('allResumeDataJson.nodes.0.jobDescription: String must contain at least 1 character(s)'),
    );
});

test('parseMainPageData() returns an Err when allResumeDataJson.nodes.0.company is not an object', (t) => {
    const mainPageData = mainPageDataFactory.build({
        allResumeDataJson: {
            nodes: nodeFactory.buildList(1, {
                company: '',
            }),
        },
    });

    t.deepEqual(
        parseMainPageData(mainPageData),
        Result.err('allResumeDataJson.nodes.0.company: Expected object, received string'),
    );
});

test('parseMainPageData() returns an Err when allResumeDataJson.nodes.0.company contains additional unknown properties', (t) => {
    const mainPageData = mainPageDataFactory.build({
        allResumeDataJson: {
            nodes: nodeFactory.buildList(1, {
                company: {
                    name: 'The company',
                    url: 'https://example.com',
                    foo: 'bar',
                },
            }),
        },
    });

    t.deepEqual(
        parseMainPageData(mainPageData),
        Result.err("allResumeDataJson.nodes.0.company: Unrecognized key(s) in object: 'foo'"),
    );
});

test('parseMainPageData() returns an Err when allResumeDataJson.nodes.0.company.name is not a string', (t) => {
    const mainPageData = mainPageDataFactory.build({
        allResumeDataJson: {
            nodes: nodeFactory.buildList(1, {
                company: {
                    name: 42,
                    url: 'https://example.com',
                },
            }),
        },
    });

    t.deepEqual(
        parseMainPageData(mainPageData),
        Result.err('allResumeDataJson.nodes.0.company.name: Expected string, received number'),
    );
});

test('parseMainPageData() returns an Err when allResumeDataJson.nodes.0.company.name is an empty string', (t) => {
    const mainPageData = mainPageDataFactory.build({
        allResumeDataJson: {
            nodes: nodeFactory.buildList(1, {
                company: {
                    name: '',
                    url: 'https://example.com',
                },
            }),
        },
    });

    t.deepEqual(
        parseMainPageData(mainPageData),
        Result.err('allResumeDataJson.nodes.0.company.name: String must contain at least 1 character(s)'),
    );
});

test('parseMainPageData() returns an Err when allResumeDataJson.nodes.0.company.url is not a string', (t) => {
    const mainPageData = mainPageDataFactory.build({
        allResumeDataJson: {
            nodes: nodeFactory.buildList(1, {
                company: {
                    name: 'The company',
                    url: 42,
                },
            }),
        },
    });

    t.deepEqual(
        parseMainPageData(mainPageData),
        Result.err('allResumeDataJson.nodes.0.company.url: Expected string, received number'),
    );
});

test('parseMainPageData() returns an Err when allResumeDataJson.nodes.0.company.url is an empty string', (t) => {
    const mainPageData = mainPageDataFactory.build({
        allResumeDataJson: {
            nodes: nodeFactory.buildList(1, {
                company: {
                    name: 'The company',
                    url: '',
                },
            }),
        },
    });

    t.deepEqual(parseMainPageData(mainPageData), Result.err('allResumeDataJson.nodes.0.company.url: Invalid url'));
});

test('parseMainPageData() returns an Err when allResumeDataJson.nodes.0.company.url is an invalid URL', (t) => {
    const mainPageData = mainPageDataFactory.build({
        allResumeDataJson: {
            nodes: nodeFactory.buildList(1, {
                company: {
                    name: 'The company',
                    url: 'invalid-url',
                },
            }),
        },
    });

    t.deepEqual(parseMainPageData(mainPageData), Result.err('allResumeDataJson.nodes.0.company.url: Invalid url'));
});

test('parseMainPageData() returns an Err when site is undefined', (t) => {
    const mainPageData = mainPageDataFactory.build({
        site: undefined,
    });

    t.deepEqual(parseMainPageData(mainPageData), Result.err('site: Required'));
});

test('parseMainPageData() returns an Err when site is null', (t) => {
    const mainPageData = mainPageDataFactory.build({
        site: null,
    });

    t.deepEqual(parseMainPageData(mainPageData), Result.err('site: Expected object, received null'));
});

test('parseMainPageData() returns an Err when site contains additional unknown properties', (t) => {
    const mainPageData = mainPageDataFactory.build({
        site: {
            siteMetadata: siteMetadataFactory.build(),
            foo: 'bar',
        },
    });

    t.deepEqual(parseMainPageData(mainPageData), Result.err("site: Unrecognized key(s) in object: 'foo'"));
});

test('parseMainPageData() returns an Err when site.siteMetadata is undefined', (t) => {
    const mainPageData = mainPageDataFactory.build({
        site: {
            siteMetadata: undefined,
        },
    });

    t.deepEqual(parseMainPageData(mainPageData), Result.err('site.siteMetadata: Required'));
});

test('parseMainPageData() returns an Err when site.siteMetadata is null', (t) => {
    const mainPageData = mainPageDataFactory.build({
        site: {
            siteMetadata: null,
        },
    });

    t.deepEqual(parseMainPageData(mainPageData), Result.err('site.siteMetadata: Expected object, received null'));
});

test('parseMainPageData() returns an Err when site.siteMetadata contains additional unknown properties', (t) => {
    const mainPageData = mainPageDataFactory.build({
        site: {
            siteMetadata: siteMetadataFactory.build({
                foo: 'bar',
            }),
        },
    });

    t.deepEqual(parseMainPageData(mainPageData), Result.err("site.siteMetadata: Unrecognized key(s) in object: 'foo'"));
});

test('parseMainPageData() returns an Err when site.siteMetadata.author is not a string', (t) => {
    const mainPageData = mainPageDataFactory.build({
        site: {
            siteMetadata: siteMetadataFactory.build({
                author: 42,
            }),
        },
    });

    t.deepEqual(
        parseMainPageData(mainPageData),
        Result.err('site.siteMetadata.author: Expected string, received number'),
    );
});

test('parseMainPageData() returns an Err when site.siteMetadata.author is an empty string', (t) => {
    const mainPageData = mainPageDataFactory.build({
        site: {
            siteMetadata: siteMetadataFactory.build({
                author: '',
            }),
        },
    });

    t.deepEqual(
        parseMainPageData(mainPageData),
        Result.err('site.siteMetadata.author: String must contain at least 1 character(s)'),
    );
});

test('parseMainPageData() returns an Err when site.siteMetadata.jobTitle is not a string', (t) => {
    const mainPageData = mainPageDataFactory.build({
        site: {
            siteMetadata: siteMetadataFactory.build({
                jobTitle: 42,
            }),
        },
    });

    t.deepEqual(
        parseMainPageData(mainPageData),
        Result.err('site.siteMetadata.jobTitle: Expected string, received number'),
    );
});

test('parseMainPageData() returns an Err when site.siteMetadata.jobTitle is an empty string', (t) => {
    const mainPageData = mainPageDataFactory.build({
        site: {
            siteMetadata: siteMetadataFactory.build({
                jobTitle: '',
            }),
        },
    });

    t.deepEqual(
        parseMainPageData(mainPageData),
        Result.err('site.siteMetadata.jobTitle: String must contain at least 1 character(s)'),
    );
});

test('parseMainPageData() returns an Err when site.siteMetadata.keywords is not a string', (t) => {
    const mainPageData = mainPageDataFactory.build({
        site: {
            siteMetadata: siteMetadataFactory.build({
                keywords: 42,
            }),
        },
    });

    t.deepEqual(
        parseMainPageData(mainPageData),
        Result.err('site.siteMetadata.keywords: Expected string, received number'),
    );
});

test('parseMainPageData() returns an Err when site.siteMetadata.keywords is an empty string', (t) => {
    const mainPageData = mainPageDataFactory.build({
        site: {
            siteMetadata: siteMetadataFactory.build({
                keywords: '',
            }),
        },
    });

    t.deepEqual(
        parseMainPageData(mainPageData),
        Result.err('site.siteMetadata.keywords: String must contain at least 1 character(s)'),
    );
});

test('parseMainPageData() returns an Err when site.siteMetadata.favicon is not a string', (t) => {
    const mainPageData = mainPageDataFactory.build({
        site: {
            siteMetadata: siteMetadataFactory.build({
                favicon: 42,
            }),
        },
    });

    t.deepEqual(
        parseMainPageData(mainPageData),
        Result.err('site.siteMetadata.favicon: Expected string, received number'),
    );
});

test('parseMainPageData() returns an Err when site.siteMetadata.favicon is an empty string', (t) => {
    const mainPageData = mainPageDataFactory.build({
        site: {
            siteMetadata: siteMetadataFactory.build({
                favicon: '',
            }),
        },
    });

    t.deepEqual(
        parseMainPageData(mainPageData),
        Result.err('site.siteMetadata.favicon: String must contain at least 1 character(s)'),
    );
});
