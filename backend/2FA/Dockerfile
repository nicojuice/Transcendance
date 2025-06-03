FROM node:18-alpine

# Crée un répertoire de travail dans le conteneur
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
#RUN npm install qrcode
#RUN npm install speakeasy
RUN npm install nodemailer

COPY . .

EXPOSE 8100

RUN echo "🚀 Lancement du Back/User-Management/Change-Email..."
CMD ["sh", "-c", "node server.js -d"]
