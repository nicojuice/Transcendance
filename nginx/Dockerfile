FROM nginx:stable-alpine

COPY conf/nginx.conf /etc/nginx/nginx.conf
# COPY ./dist /usr/share/nginx/html

RUN apk add --no-cache openssl && \
    mkdir -p /certs && \
    openssl req -newkey rsa:4096 -x509 -sha256 -days 365 -nodes \
    -subj "/C=FR/ST=Paris/L=Paris/O=42/CN=62.210.34.175" \
    -out /certs/cert.crt \
    -keyout /certs/cert.key

EXPOSE 8443

CMD ["nginx", "-g", "daemon off;"]
