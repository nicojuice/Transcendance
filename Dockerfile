# Utilise une image officielle de Node.js
FROM node:18-alpine

# Crée un répertoire de travail dans le conteneur
WORKDIR /usr/src/app

# Copie les fichiers de ton projet dans le répertoire de travail du conteneur
COPY . .

# Installe les dépendances de ton projet
RUN npm install

# Expose le port sur lequel ton serveur écoute (3000)
EXPOSE 3000

# Lancer ton serveur Fastify
CMD ["node", "server.js"]