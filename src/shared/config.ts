export interface Config {
  randomHeaderImage: boolean;
}

export function createConfig(): Config {
  return {
    randomHeaderImage: process.env.GATSBY_RANDOM_HEADER_IMAGE !== 'false',
  };
}
