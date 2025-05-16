#!/bin/sh

# npm install typescript-cookie 
# npm install -D tailwindcss
# npm tailwindcss init
# npm install -g typescript
# openssl & key
apk add openssl
mkdir -p /certs
openssl req -newkey rsa:4096 -x509 -sha256 -days 365 -nodes \
       -subj "/C=FR/ST=Paris/L=Paris/O=42/CN=62.210.34.175" \
       -out  /certs/cert.crt\
       -keyout  /certs/cert.key

# cd /usr/src/app/frontend/ && npx tsc

echo "🚀 Lancement du Front..."

