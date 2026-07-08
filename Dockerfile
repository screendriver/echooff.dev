FROM node:26.5.0-slim AS dependencies

WORKDIR /app

RUN apt-get update \
	&& apt-get install --yes --no-install-recommends g++ make python3 \
	&& rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm clean-install --omit=dev --omit=optional

FROM node:26.5.0-slim

WORKDIR /app

ENV NODE_ENV=production

RUN apt-get update \
	&& apt-get install --yes --no-install-recommends libstdc++6 \
	&& rm -rf /var/lib/apt/lists/*

COPY --from=dependencies /app/node_modules ./node_modules
COPY target ./target

RUN node --input-type=module --eval "import Database from 'better-sqlite3'; new Database(':memory:').close();"

RUN mkdir --parents /data \
	&& chown node:node /data

USER node

EXPOSE 4321

CMD ["node", "./target/server/entry.mjs"]
