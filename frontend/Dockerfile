FROM hoosin/alpine-nginx-nodejs:latest

# Crée un répertoire de travail dans le conteneur
WORKDIR /usr/src/app/frontend

COPY ./conf/nginx.conf /etc/nginx/nginx.conf
COPY . .

RUN chmod 777 /usr/src/app/frontend/script/setupstatic.sh

EXPOSE 8443

RUN sh ./script/setupstatic.sh

CMD ["nginx", "-g", "daemon off;"]
