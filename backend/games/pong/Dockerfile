FROM node:18-alpine

# Crée un répertoire de travail dans le conteneur
WORKDIR /usr/src/app/backend/games/pong

COPY package*.json ./

RUN echo "📦 On vide le cache..."
RUN npm cache clean --force

RUN echo "📦 Installation des dépendances..."
RUN npm install


COPY . .

EXPOSE 8180

RUN echo "🚀 Lancement du Micro Service LOGIN..."
CMD ["sh", "-c", "node server.js -d"]
