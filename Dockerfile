FROM public.ecr.aws/docker/library/node:24.11.1 AS builder
WORKDIR /app
ENV GITHUB_API_BASE_URL=""
ENV GITHUB_LOGIN=""
ENV GITHUB_API_TOKEN_FILE=""
COPY package.json package-lock.json ./
RUN npm clean-install
COPY . .
RUN npx just build && npm prune --omit=dev

FROM public.ecr.aws/docker/library/node:24.11.1-alpine
ENV NODE_ENV=production
ENV HOST="0.0.0.0"
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/target .
RUN chown -R node:node /app

USER node

EXPOSE 4321

CMD [ "node", "--enable-source-maps", "./server/entry.mjs" ]
