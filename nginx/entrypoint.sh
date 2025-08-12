#!/bin/sh
set -eu

if [ ! -f /etc/nginx/ssl/server.key ] || [ ! -f /etc/nginx/ssl/server.crt ]; then
  mkdir -p /etc/nginx/ssl
  openssl req -x509 -nodes -newkey rsa:2048 -days 365 \
    -keyout /etc/nginx/ssl/server.key \
    -out /etc/nginx/ssl/server.crt \
    -config /etc/nginx/server.conf
  chmod 600 /etc/nginx/ssl/server.key
fi

exec nginx -g 'daemon off;'