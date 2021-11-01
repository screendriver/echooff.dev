import { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby';
import got from 'got';

export default async function (
  _request: GatsbyFunctionRequest,
  response: GatsbyFunctionResponse,
): Promise<void> {
  await got.post('https://qckm.io/json', {
    headers: {
      'x-qm-key': process.env.QUICKMETRICS_API_KEY,
    },
    json: {
      name: 'echooff.dev',
      value: 1,
      dimension: 'GET /',
    },
  });
  response.status(200).send('');
}
