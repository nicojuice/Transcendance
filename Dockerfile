FROM node:18-alpine

# Crée un répertoire de travail dans le conteneur
WORKDIR /usr/src/app

COPY . .

RUN npm install

RUN npm install typescript

RUN npx tsc

# Expose le port sur lequel ton serveur écoute (8080)
EXPOSE 8080

# Lance le serveur Fastify
CMD ["node", "server.js"]
