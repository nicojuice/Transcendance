# FROM node:23-slim

# WORKDIR /usr/src/app

# RUN npm install -g typescript

# COPY package*.json ./
# RUN npm install

# COPY . .

# RUN npx tsc
# RUN npm run build:css
# RUN npm run build

# EXPOSE 8443

# RUN apt-get upgrade
# RUN apt-get update -y

# RUN apt-get install -y nginx
# COPY ./conf/nginx.conf /etc/nginx/

# RUN apt-get install -y openssl

# RUN mkdir -p /certs && \
#     openssl req -newkey rsa:4096 -x509 -sha256 -days 365 -nodes \
#        -subj "/C=FR/ST=Paris/L=Paris/O=42/CN=62.210.34.175" \
#        -out  /certs/cert.crt \
#        -keyout  /certs/cert.key

# RUN nginx
# CMD ["npx", "vite", "preview", "--port", "8443", "--host"]
# #CMD ["nginx", "-g", "daemon off;"]

FROM hoosin/alpine-nginx-nodejs:latest

# Crée un répertoire de travail dans le conteneur
WORKDIR /usr/src/app/frontend

COPY ./conf/nginx.conf /etc/nginx/nginx.conf
COPY . .

RUN chmod 777 /usr/src/app/frontend/script/setupstatic.sh

EXPOSE 8443

RUN sh ./script/setupstatic.sh
RUN (cd /usr/src/app/frontend/ && npx tsc && npx tailwindcss -i ./public/style/input.css -o ./public/style/output.css --minify)

CMD ["nginx", "-g", "daemon off;"]