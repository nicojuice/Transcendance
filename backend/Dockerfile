FROM node:18-alpine

# Crée un répertoire de travail dans le conteneur
WORKDIR /usr/src/app/backend

COPY package*.json ./

RUN echo "📦 Installation des dépendances..." && npm install

RUN echo "📦 Installation de Bcrypt..."
RUN npm install bcryptjs

COPY . .

EXPOSE 8080

RUN echo "🚀 Lancement du Back..."
CMD ["sh", "-c", "node server.js -d"]
