FROM node:18-alpine

# Crée un répertoire de travail dans le conteneur
WORKDIR /usr/src/app

COPY ../frontend .:

COPY . .

RUN chmod 777 start_back.sh

# Le port utiliser(8080)
EXPOSE 8080

# Lance le script du coup 
CMD ["sh", "-c","sh start_back.sh"]