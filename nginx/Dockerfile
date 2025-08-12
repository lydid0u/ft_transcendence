FROM nginx:1.27-alpine

RUN apk add --no-cache openssl

# Config Nginx + OpenSSL
COPY nginx.conf /etc/nginx/nginx.conf
COPY server.conf /etc/nginx/server.conf
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80 443
CMD ["/entrypoint.sh"]