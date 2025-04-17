FROM nginx


# Crée un répertoire de travail dans le conteneur
WORKDIR /usr/src/app/frontend


COPY ./conf/nginx.conf /etc/nginx/nginx.conf
COPY . .


RUN chmod 777 /usr/src/app/frontend/script/installnginx.sh
RUN chmod 777 /usr/src/app/frontend/script/installnode.sh


RUN sh ./script/installnode.sh
RUN sh ./script/installnginx.sh



# Le port utiliser(8080)
EXPOSE 8443

CMD ["nginx", "-g", "daemon off;"]