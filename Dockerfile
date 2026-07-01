FROM node:26.4.0-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm clean-install --omit=dev

COPY target ./target

EXPOSE 4321

CMD ["node", "./target/server/entry.mjs"]
