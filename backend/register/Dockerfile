FROM node:23-slim

# Ajouter les outils nécessaires pour compiler sqlite3
RUN apt-get update && apt-get install -y \
  python3 \
  make \
  g++ \
  libsqlite3-dev \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY ./srcs ./srcs

ENV NODE_ENV=production

EXPOSE 8001

CMD ["node", "srcs/server.js"]
