FROM node:22.3.0 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --no-save
COPY . .
ENV GITHUB_API_BASE_URL="" GITHUB_LOGIN="" GITHUB_API_TOKEN_FILE=""
RUN npx just build

FROM node:22.3.0-alpine AS runtime
RUN mkdir -p /home/node/app/node_modules && chown --recursive node:node /home/node/app
WORKDIR /home/node/app
COPY package*.json ./
USER node
RUN npm install --no-save --omit=dev
COPY --chown=node:node --from=build /app/target/dist .
ENV HOST="0.0.0.0"
EXPOSE 4321
CMD [ "node", "./server/entry.mjs" ]
