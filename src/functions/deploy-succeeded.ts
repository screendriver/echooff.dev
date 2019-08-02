import { APIGatewayProxyHandler } from 'aws-lambda';
import got from 'got';

export const handler: APIGatewayProxyHandler = async () => {
  const { statusCode, body } = await got.post(
    `https://maker.ifttt.com/trigger/netlify-deploy-succeeded/with/key/${process.env.IFTTT_NETLIFY_DEPLOY_SUCCEEDED_KEY}`,
  );
  return { statusCode, body };
};
