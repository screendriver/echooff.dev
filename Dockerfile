FROM caddy:2.11.2-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY target /srv

EXPOSE 4321
