FROM node:20-alpine

WORKDIR /usr/src/app/backend/user-management/change-pass

COPY package*.json ./

RUN echo "📦 On vide le cache..."
RUN npm cache clean --force

RUN echo "📦 Installation des dépendances..."
RUN npm install
RUN npm install bcrypt
RUN npm install fastify
RUN npm install sqlite3
RUN npm install @fastify/cors

RUN echo "📦 Installation de Bcrypt..."
RUN npm install bcryptjs

RUN echo "📦 Installation de metric..."
RUN npm install fastify-metrics prom-client --legacy-peer-deps

COPY . .

RUN echo "🚀 Lancement du Back/User-Management/Change-pass..."
CMD ["node", "server.js"]
