#!/bin/sh

# system
apk update

# typescript
echo "🛠 Install TypeScript..."
npm install typescript
npm install tailwindcss @tailwindcss/cli
echo "🛠 Compilation TypeScript → JavaScript..."
npx tsc

# openssl & key
apk add openssl
mkdir -p /certs
openssl req -newkey rsa:4096 -x509 -sha256 -days 365 -nodes \
       -subj "/C=FR/ST=Paris/L=Paris/O=42/CN=62.210.34.175" \
       -out  /certs/cert.crt\
       -keyout  /certs/cert.key

echo "🚀 Lancement du Front..."

npx @tailwindcss/cli -i /usr/src/app/frontend/public/input.css -o /usr/src/app/frontend/public/output.css --watch &
