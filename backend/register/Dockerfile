# Utiliser une image Node.js légère
FROM node:23-slim

# Définir le répertoire de travail dans le conteneur
WORKDIR /usr/srcs/app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer uniquement les dépendances de production
RUN npm install --production

# Copier le code source
COPY ./srcs ./srcs

# Définir l'environnement de production
ENV NODE_ENV=production

# Exposer le port du service
EXPOSE 8001

# Commande pour démarrer le serveur
CMD ["node", "srcs/server.js"]
