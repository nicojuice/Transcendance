FROM node:18-alpine

# Crée un répertoire de travail dans le conteneur
WORKDIR /usr/src/app/backend/games/tournament

COPY package*.json ./

RUN echo "📦 On vide le cache..."
RUN npm cache clean --force

RUN echo "📦 Installation des dépendances..."
RUN npm install
RUN npm install sqlite
RUN npm install sqlite3
RUN npm install fastify
RUN npm install @fastify/sensible
RUN npm install @fastify/cors

RUN echo "📦 Installation de Bcrypt..."
RUN npm install bcryptjs

RUN echo "📦 Installation de metric..."
RUN npm install fastify-metrics prom-client --legacy-peer-deps



COPY . .

EXPOSE 8088

RUN echo "🚀 Lancement du Back/games/tournament..."
CMD ["sh", "-c", "node server.js -d"]