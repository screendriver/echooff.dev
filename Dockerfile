FROM node:26.4.0-slim AS dependencies

WORKDIR /app

RUN apt-get update \
	&& apt-get install --yes --no-install-recommends g++ make python3 \
	&& rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm clean-install --omit=dev

FROM node:26.4.0-slim

WORKDIR /app

ENV MENTION_CACHE_DATABASE_PATH=/data/echooff-cache.sqlite
ENV NODE_ENV=production

RUN apt-get update \
	&& apt-get install --yes --no-install-recommends libstdc++6 \
	&& rm -rf /var/lib/apt/lists/*

COPY --from=dependencies /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY target ./target

RUN node --input-type=module --eval "import Database from 'better-sqlite3'; new Database(':memory:').close();"

RUN mkdir --parents /data \
	&& chown node:node /data

USER node

EXPOSE 4321

CMD ["node", "./target/server/entry.mjs"]
