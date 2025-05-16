FROM hoosin/alpine-nginx-nodejs:latest

# Crée un répertoire de travail dans le conteneur
WORKDIR /usr/src/app/frontend

COPY ./conf/nginx.conf /etc/nginx/nginx.conf
COPY . .

RUN chmod 777 /usr/src/app/frontend/script/setupstatic.sh

EXPOSE 8443

RUN sh ./script/setupstatic.sh
# RUN (npx tailwindcss -i ./src/style/input.css -o ./output.css)
RUN npm install
RUN npm run build:css
RUN npm run build
# CMD ["sh", "-c", "./script/test.sh"]
CMD ["nginx", "-g", "daemon off;"]