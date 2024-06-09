FROM node:22.2.0 as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ENV GITHUB_API_BASE_URL="" GITHUB_LOGIN="" GITHUB_API_TOKEN_FILE=""
RUN npm run build

FROM node:22.2.0-alpine as runtime
USER node
RUN mkdir -p /home/node/app/node_modules && chown --recursive node:node /home/node/app
WORKDIR /home/node/app
COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force
COPY --from=build /app/target/dist .
ENV HOST="0.0.0.0"
EXPOSE 4321
CMD [ "node", "./server/entry.mjs" ]
