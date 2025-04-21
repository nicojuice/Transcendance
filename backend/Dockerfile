FROM node:18-alpine

# Crée un répertoire de travail dans le conteneur
WORKDIR /usr/src/app/backend

COPY package*.json ./

RUN echo "📦 Installation des dépendances..."
RUN npm install

RUN echo "📦 Installation de fastify-cors..."
RUN npm install fastify-cors

RUN echo "📦 Installation de la db..."
RUN npm install sqlite3

COPY . .


EXPOSE 8080

RUN echo "🚀 Lancement du Back..."
CMD ["sh", "-c", "node server.js -d"]
