import { APIGatewayProxyHandler } from 'aws-lambda';
import got from 'got';

export const handler: APIGatewayProxyHandler = async () => {
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
  return {
    statusCode: 200,
    body: '',
  };
};
