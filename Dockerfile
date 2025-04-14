FROM node:18-alpine

# Crée un répertoire de travail dans le conteneur
WORKDIR /usr/src/app

# Copie les fichiers de ton projet dans le répertoire de travail du conteneur
COPY . .

# Installe les dépendances du projet, y compris TypeScript en tant que dépendance locale
RUN npm install

# Compile le fichier TypeScript (nav.ts) dans le répertoire App/ts
RUN npx tsc App/ts/nav.ts

RUN mkdir -p /usr/src/app/public/js

RUN cp /usr/src/app/App/index.html /usr/src/app/public/

RUN cp /usr/src/app/App/ts/nav.js /usr/src/app/public/js/nav.js

# Expose le port sur lequel ton serveur écoute (8080)
EXPOSE 8080

# Lance le serveur Fastify
CMD ["node", "server.js"]
