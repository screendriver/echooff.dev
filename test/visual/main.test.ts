import { RequestMock } from 'testcafe';
import * as percySnapshot from '@percy/testcafe';

const quickmetricsMock = RequestMock().onRequestTo('http://localhost:9000/.netlify/functions/quickmetrics').respond('');

fixture('Visual').page('http://localhost:9000').requestHooks(quickmetricsMock);

// eslint-disable-next-line testcafe-community/missing-expect
test('main page', async (t) => {
    await t.wait(1000);
    // @ts-expect-error wrong types in @percy/testcafe
    await percySnapshot(t, 'Main page', {
        widths: [320, 375, 425, 768, 1024, 1440, 1920],
    });
});
