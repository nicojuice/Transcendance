# Utilise une image officielle Node.js légère
FROM node:23-slim

# Crée le répertoire de travail dans le conteneur
WORKDIR /usr/srcs/app

# Copie les fichiers package.json et package-lock.json d'abord
COPY package*.json ./

# Installe uniquement les dépendances de production
RUN npm install --production

# Copie tout le reste du code
COPY ./srcs ./srcs

# Définir la variable d'environnement (optionnel mais propre)
ENV NODE_ENV=production

# Expose le port que ton serveur utilise
EXPOSE 8004

# Commande pour démarrer ton serveur
CMD ["node", "srcs/server.js"]
