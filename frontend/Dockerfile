FROM node:23-slim

WORKDIR /usr/src/app

# Installe TypeScript globalement pour éviter tous les bugs de permission
RUN npm install -g typescript

# Copie des fichiers package.json + lock
COPY package*.json ./

# Installe les dépendances normales
RUN npm install

# Copie du code
COPY . .

# Compile avec le tsc global
RUN tsc

EXPOSE 8443

CMD ["npm", "start"]
