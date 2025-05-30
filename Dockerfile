FROM node:24.1.0-alpine
RUN mkdir -p /home/node/app/node_modules && chown --recursive node:node /home/node/app
WORKDIR /home/node/app
COPY package*.json .
USER node
RUN npm clean-install --omit=dev
COPY --chown=node:node target/ .
ENV HOST="0.0.0.0"
EXPOSE 4321
CMD [ "node", "./server/entry.mjs" ]
