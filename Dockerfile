FROM node:22.13.1 AS build
WORKDIR /app
COPY package*.json ./
RUN npm clean-install
COPY . .
ENV GITHUB_API_BASE_URL="" GITHUB_LOGIN="" GITHUB_API_TOKEN_FILE=""
RUN npx just build

FROM node:22.13.1 AS runtime
RUN mkdir -p /home/node/app/node_modules && chown --recursive node:node /home/node/app
WORKDIR /home/node/app
COPY package*.json ./
USER node
RUN npm clean-install --omit=dev
COPY --chown=node:node --from=build /app/target .
ENV HOST="0.0.0.0"
EXPOSE 4321
CMD [ "node", "./server/entry.mjs" ]
