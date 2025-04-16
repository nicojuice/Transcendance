FROM node:18-alpine

# Crée un répertoire de travail dans le conteneur
WORKDIR /usr/src/app

COPY . .

RUN npm install

RUN npm install typescript

# Expose le port sur lequel ton serveur écoute (8080)
EXPOSE 8080

# Compile le code TypeScript puis démarre le serveur Fastify
CMD ["sh", "-c", "npx tsc && node server.js"]
