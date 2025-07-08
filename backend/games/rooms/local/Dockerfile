FROM node:20-alpine

WORKDIR /usr/src/app/backend/games/rooms/local

COPY package*.json ./

RUN echo "📦 On vide le cache..."
RUN npm cache clean --force

RUN echo "📦 Installation des dépendances..."
RUN npm install
RUN npm install sqlite
RUN npm install sqlite3
RUN npm install fastify
RUN npm install @fastify/cors
RUN npm install @fastify/multipart

RUN echo "📦 Installation de Bcrypt..."
RUN npm install bcryptjs

RUN echo "📦 Installation de metric..."
RUN npm install fastify-metrics prom-client --legacy-peer-deps

COPY . .

RUN echo "🚀 Lancement du Back/games/rooms/local..."
CMD ["sh", "-c", "node server.js -d"]