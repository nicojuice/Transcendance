FROM node:20-alpine

WORKDIR /usr/src/app/backend/register

COPY package*.json ./

RUN echo "📦 On vide le cache..."
RUN npm cache clean --force

RUN echo "📦 Installation des dépendances..."
RUN npm install
RUN npm install @fastify/cors

RUN echo "📦 Installation de Bcrypt..."
RUN npm install bcryptjs

RUN echo "📦 Installation de metric..."
RUN npm install fastify-metrics prom-client --legacy-peer-deps

COPY . .

RUN echo "🚀 Lancement du Back/REGISTER..."
CMD ["sh", "-c", "node server.js -d"]