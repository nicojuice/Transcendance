FROM node:20-alpine

WORKDIR /usr/src/app/backend/2fa

COPY package*.json ./

RUN echo "📦 On vide le cache..."
RUN npm cache clean --force

RUN echo "📦 Installation des dépendances..."
RUN npm install
RUN npm install sqlite3
RUN npm install fastify
RUN npm install @fastify/cors
RUN npm install @fastify/cookie
RUN npm install nodemailer

COPY . .

RUN echo "🚀 Lancement du Back/User-Management/Change-Email..."
CMD ["sh", "-c", "node server.js -d"]
