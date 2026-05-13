FROM caddy:2.11.3-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY target /srv

EXPOSE 4321
