FROM public.ecr.aws/docker/library/node:24.14.0-alpine
ENV NODE_ENV=production
ENV HOST="0.0.0.0"
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm clean-install --omit=dev
COPY target .
RUN chown -R node:node /app

USER node

EXPOSE 4321

CMD [ "node", "--enable-source-maps", "./server/entry.mjs" ]
