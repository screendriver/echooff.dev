FROM node:22.2.0 as build
WORKDIR /app
COPY package*.json ./
RUN npm install --no-save
COPY . .
ENV GITHUB_API_BASE_URL="" GITHUB_LOGIN="" GITHUB_API_TOKEN_FILE=""
RUN npm run build

FROM node:22.2.0-alpine as runtime
RUN mkdir -p /home/node/app/node_modules && chown --recursive node:node /home/node/app
WORKDIR /home/node/app
COPY package*.json ./
USER node
RUN npm install --no-save --omit=dev
COPY --chown=node:node --from=build /app/target/dist .
ENV HOST="0.0.0.0"
EXPOSE 4321
CMD [ "node", "./server/entry.mjs" ]
