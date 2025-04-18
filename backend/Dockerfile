FROM node:18-alpine

# Crée un répertoire de travail dans le conteneur
WORKDIR /usr/src/app/backend

COPY . .

RUN chmod 777 /usr/src/app/backend/start_back.sh

EXPOSE 8080

CMD ["sh", "-c", "sh /usr/src/app/backend/start_back.sh"]
#ENTRYPOINT ["/usr/src/app/backend/start_back.sh"]
